import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

interface SelectedProductInput {
  id?: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  keyActives?: string[];
}

interface ChatMessageInput {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  mode?: 'routine' | 'followup';
  messages?: ChatMessageInput[];
  selectedProducts?: SelectedProductInput[];
  webSearch?: boolean;
  language?: 'en' | 'ar';
}

interface SourceItem {
  title: string;
  url: string;
}

const SYSTEM_INSTRUCTION = `You are L'Oréal Atelier Beauty Advisor, an expert skincare, haircare, makeup, and fragrance specialist across L'Oréal brands.

Core guidelines:
1. When generating a personalized routine from the user's selected products JSON, structure the response clearly into Morning (AM) and Evening (PM) steps (plus Haircare, Makeup, or Fragrance application notes if included). Use ONLY the user's selected products for the core steps, specifying exact layering order, usage frequency, and any ingredient compatibility considerations.
2. For follow-up questions, respond ONLY to questions related to the generated routine, the selected products, or beauty topics (skincare, haircare, makeup, fragrance, cosmetic ingredients, application techniques, and L'Oréal Group products). If the user asks an unrelated question (coding, politics, math, general trivia, etc.), politely decline and steer them back to their beauty routine.
3. Keep recommendations accurate, practical, and clearly formatted with concise headings and numbered steps.
4. When web search grounding is active, incorporate current product knowledge and let cited sources support key guidance.`;

function buildProductContext(products: SelectedProductInput[]): string {
  if (!products.length) {
    return 'No products are currently selected by the user.';
  }
  return `Selected products JSON:\n${JSON.stringify(
    products.map((p) => ({
      name: p.name,
      brand: p.brand,
      category: p.category,
      description: p.description,
      keyActives: p.keyActives ?? [],
    })),
    null,
    2
  )}`;
}

async function callCloudflareWorker(
  workerUrl: string,
  payload: ChatRequestBody
): Promise<{ reply: string; sources: SourceItem[]; provider: string }> {
  const response = await fetch(workerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as {
    reply?: string;
    error?: string;
    sources?: SourceItem[];
    choices?: Array<{ message?: { content?: string } }>;
  };

  if (!response.ok) {
    throw new Error(data.error || `Cloudflare Worker returned status ${response.status}`);
  }

  const reply = data.reply ?? data.choices?.[0]?.message?.content ?? '';
  if (!reply) {
    throw new Error('Cloudflare Worker returned an empty response.');
  }

  return {
    reply,
    sources: Array.isArray(data.sources) ? data.sources : [],
    provider: 'cloudflare-worker',
  };
}

async function callOpenAI(
  apiKey: string,
  payload: ChatRequestBody
): Promise<{ reply: string; sources: SourceItem[]; provider: string }> {
  const messages = payload.messages ?? [];
  const selectedProducts = payload.selectedProducts ?? [];
  const webSearch = payload.webSearch !== false;
  const languageLabel = payload.language === 'ar' ? 'Arabic' : 'English';

  const systemContent = `${SYSTEM_INSTRUCTION}\n\nRespond in ${languageLabel}.\n\n${buildProductContext(selectedProducts)}`;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      tools: webSearch ? [{ type: 'web_search_preview' }] : undefined,
      input: [
        { role: 'system', content: systemContent },
        ...messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      ],
    }),
  });

  const data = (await response.json()) as {
    error?: { message?: string };
    output_text?: string;
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: string;
        annotations?: Array<{ type?: string; url?: string; title?: string }>;
      }>;
    }>;
  };

  if (!response.ok) {
    throw new Error(data.error?.message || `OpenAI API returned status ${response.status}`);
  }

  const reply =
    data.output_text ||
    (Array.isArray(data.output)
      ? data.output
          .flatMap((item) => item.content ?? [])
          .filter((item) => item.type === 'output_text')
          .map((item) => item.text ?? '')
          .join('\n')
      : '');

  const sources: SourceItem[] = [];
  const seen = new Set<string>();
  for (const item of data.output ?? []) {
    for (const content of item.content ?? []) {
      for (const ann of content.annotations ?? []) {
        if (ann.type === 'url_citation' && ann.url && !seen.has(ann.url)) {
          seen.add(ann.url);
          sources.push({ title: ann.title || ann.url, url: ann.url });
        }
      }
    }
  }

  return { reply, sources, provider: 'openai' };
}

async function callGemini(
  apiKey: string,
  payload: ChatRequestBody
): Promise<{ reply: string; sources: SourceItem[]; provider: string }> {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const messages = payload.messages ?? [];
  const selectedProducts = payload.selectedProducts ?? [];
  const webSearch = payload.webSearch !== false;
  const languageLabel = payload.language === 'ar' ? 'Arabic' : 'English';

  const systemInstruction = `${SYSTEM_INSTRUCTION}\n\nRespond in ${languageLabel}.\n\n${buildProductContext(selectedProducts)}`;

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const generateWithModel = async (model: string, enableSearch: boolean) => {
    return ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        tools: enableSearch ? [{ googleSearch: {} }] : undefined,
      },
    });
  };

  let response;
  try {
    response = await withRetry(() => generateWithModel('gemini-4-hydrogen', webSearch));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) {
      response = await withRetry(() => generateWithModel('gemini-3.1-flash-lite', false));
    } else {
      throw err;
    }
  }

  const reply = response.text?.trim() ?? '';
  if (!reply) {
    throw new Error('The AI model returned an empty response.');
  }

  const sources: SourceItem[] = [];
  const seen = new Set<string>();
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (Array.isArray(chunks)) {
    for (const chunk of chunks) {
      const uri = chunk.web?.uri;
      if (uri && !seen.has(uri)) {
        seen.add(uri);
        sources.push({
          title: chunk.web?.title || uri,
          url: uri,
        });
      }
    }
  }

  return { reply, sources, provider: 'gemini' };
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isRateLimit = /429|rate limit|RESOURCE_EXHAUSTED|too many requests/i.test(msg);
      const isHardQuota = /insufficient_quota|exceeded your current quota|billing/i.test(msg);
      if (!isRateLimit || isHardQuota || attempt === maxRetries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 600 * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

function formatProviderError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : 'Unable to generate advisor response.';
  if (/insufficient_quota|exceeded your current quota|billing/i.test(raw)) {
    return {
      status: 429,
      message:
        'Your API key has exceeded its billing quota. Add credits on your provider account (OpenAI/Cloudflare Worker) or switch to a billing-enabled GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (/429|RESOURCE_EXHAUSTED|rate limit/i.test(raw)) {
    return {
      status: 429,
      message:
        'Rate limit or quota reached on the selected API key. Wait a moment and retry, or select a billing-enabled API key in Settings > Secrets to increase your quota.',
    };
  }
  if (/API_KEY_INVALID|PERMISSION_DENIED|Incorrect API key|401|403/i.test(raw)) {
    return {
      status: 403,
      message:
        'The configured API key was rejected. Check your key in Settings > Secrets and try again.',
    };
  }
  return { status: 500, message: raw };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = '0.0.0.0';

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const body = (req.body ?? {}) as ChatRequestBody;
      const messages = Array.isArray(body.messages) ? body.messages : [];
      const selectedProducts = Array.isArray(body.selectedProducts) ? body.selectedProducts : [];

      if (messages.length === 0) {
        return res.status(400).json({ error: 'At least one message is required.' });
      }

      if (body.mode === 'routine' && selectedProducts.length === 0) {
        return res
          .status(400)
          .json({ error: 'Please select at least one product before generating a routine.' });
      }

      const workerUrl = process.env.CLOUDFLARE_WORKER_URL?.trim();
      const openAiKey = process.env.OPENAI_API_KEY?.trim();
      const geminiKey = process.env.GEMINI_API_KEY?.trim();

      const providers: Array<() => Promise<{ reply: string; sources: SourceItem[]; provider: string }>> = [];
      if (workerUrl) providers.push(() => callCloudflareWorker(workerUrl, body));
      if (openAiKey) providers.push(() => withRetry(() => callOpenAI(openAiKey, body)));
      if (geminiKey) providers.push(() => callGemini(geminiKey, body));

      if (providers.length === 0) {
        return res.status(503).json({
          error:
            'No AI backend key is configured. Add GEMINI_API_KEY, OPENAI_API_KEY, or CLOUDFLARE_WORKER_URL in Settings > Secrets.',
        });
      }

      let lastErr: unknown;
      for (const runProvider of providers) {
        try {
          const result = await runProvider();
          return res.json(result);
        } catch (err) {
          lastErr = err;
        }
      }

      const formatted = formatProviderError(lastErr);
      return res.status(formatted.status).json({ error: formatted.message });
    } catch (err) {
      const formatted = formatProviderError(err);
      return res.status(formatted.status).json({ error: formatted.message });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const clientDist = path.resolve(process.cwd(), 'dist', 'client');
    app.use(express.static(clientDist));
    app.use((_req: Request, res: Response) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`L'Oréal Atelier server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
