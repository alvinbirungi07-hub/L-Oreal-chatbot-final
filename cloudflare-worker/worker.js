// Cloudflare Worker proxy for L'Oréal Atelier Routine Builder
// Deploy with: cd cloudflare-worker && npx wrangler secret put OPENAI_API_KEY && npx wrangler deploy

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SYSTEM_PROMPT = `You are L'Oréal Atelier Beauty Advisor, an expert skincare, haircare, makeup, and fragrance specialist for L'Oréal brands.
- Build structured, practical AM and PM routines using ONLY the user's selected products when generating a routine, explaining exact layering order, frequency, and ingredient compatibility.
- For follow-up questions, answer ONLY questions related to the generated routine, selected products, skincare, haircare, makeup, fragrance, or L'Oréal products/brands. Politely decline off-topic questions.
- When real-time web search is enabled, cite verified links and current product guidance clearly.`;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = await request.json();
      const messages = Array.isArray(body.messages) ? body.messages : [];
      const selectedProducts = Array.isArray(body.selectedProducts) ? body.selectedProducts : [];
      const webSearch = body.webSearch !== false;
      const language = body.language === 'ar' ? 'Arabic' : 'English';

      if (!env.OPENAI_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'OPENAI_API_KEY secret is not configured in Cloudflare Worker.' }),
          { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }

      const productContext =
        selectedProducts.length > 0
          ? `\nSelected products JSON:\n${JSON.stringify(selectedProducts, null, 2)}`
          : '\nNo products currently selected.';

      const input = [
        {
          role: 'system',
          content: `${SYSTEM_PROMPT}\nRespond in ${language}.${productContext}`,
        },
        ...messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || ''),
        })),
      ];

      const openaiRes = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          tools: webSearch ? [{ type: 'web_search_preview' }] : undefined,
          input,
        }),
      });

      const data = await openaiRes.json();
      if (!openaiRes.ok) {
        return new Response(
          JSON.stringify({ error: data?.error?.message || 'OpenAI request failed' }),
          { status: openaiRes.status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }

      const reply =
        data.output_text ||
        (Array.isArray(data.output)
          ? data.output
              .flatMap((item) => item.content || [])
              .filter((c) => c.type === 'output_text')
              .map((c) => c.text)
              .join('\n')
          : '');

      const sources = [];
      if (Array.isArray(data.output)) {
        for (const item of data.output) {
          for (const content of item.content || []) {
            for (const ann of content.annotations || []) {
              if (ann.type === 'url_citation' && ann.url) {
                sources.push({ title: ann.title || ann.url, url: ann.url });
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({ reply, sources }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err?.message || 'Worker error' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  },
};
