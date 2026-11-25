import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Globe, RotateCcw, Send } from 'lucide-react';
import type { ChatMessage, LanguageMode } from '../types.ts';
import type { CopySet } from '../data/translations.ts';

interface RoutineChatProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  webSearchEnabled: boolean;
  language: LanguageMode;
  copy: CopySet;
  onToggleWebSearch: () => void;
  onResetChat: () => void;
  onSendMessage: (text: string) => void;
  onRetryLast: () => void;
}

function renderInlineSegments(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-[#141213]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const linkMatch = /^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/.exec(part);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#ff003b] underline decoration-[#e3a535] underline-offset-2 hover:text-[#d90032]"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function FormattedMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-2 text-sm leading-relaxed text-[#141213]/90">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={idx} className="h-1" />;
        }
        if (line.startsWith('### ')) {
          return (
            <h4
              key={idx}
              className="pt-2 font-display text-lg font-semibold text-[#141213]"
            >
              {renderInlineSegments(line.slice(4))}
            </h4>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h3
              key={idx}
              className="pt-2 font-display text-xl font-semibold text-[#141213]"
            >
              {renderInlineSegments(line.slice(3))}
            </h3>
          );
        }
        if (/^[-*]\s+/.test(line)) {
          return (
            <div key={idx} className="flex items-start gap-2 ps-2">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e3a535]" />
              <span>{renderInlineSegments(line.replace(/^[-*]\s+/, ''))}</span>
            </div>
          );
        }
        if (/^\d+\.\s+/.test(line)) {
          const numMatch = /^(\d+\.)\s+(.*)$/.exec(line);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 ps-1">
                <span className="min-w-[1.25rem] font-semibold tabular-nums text-[#ff003b]">
                  {numMatch[1]}
                </span>
                <span>{renderInlineSegments(numMatch[2])}</span>
              </div>
            );
          }
        }
        return <p key={idx}>{renderInlineSegments(line)}</p>;
      })}
    </div>
  );
}

export function RoutineChat({
  messages,
  isLoading,
  error,
  webSearchEnabled,
  copy,
  onToggleWebSearch,
  onResetChat,
  onSendMessage,
  onRetryLast,
}: RoutineChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    onSendMessage(trimmed);
  };

  return (
    <section
      id="advisor-chat"
      aria-label={copy.advisorTitle}
      className="flex min-h-[540px] flex-col rounded-sm border border-[#141213]/12 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#141213]/10 px-6 py-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#141213]">
            {copy.advisorTitle}
          </h2>
          <p className="mt-0.5 text-xs text-[#5C5658]">{copy.advisorSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleWebSearch}
            aria-pressed={webSearchEnabled}
            className={`inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              webSearchEnabled
                ? 'border-[#e3a535] bg-[#e3a535]/12 text-[#141213]'
                : 'border-[#141213]/15 bg-[#FAF8F5] text-[#5C5658] hover:text-[#141213]'
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-[#e3a535]" />
            <span>{webSearchEnabled ? copy.webSearchOn : copy.webSearchOff}</span>
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={onResetChat}
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#141213]/15 bg-[#FAF8F5] px-3 py-1.5 text-xs font-medium text-[#5C5658] whitespace-nowrap transition-colors hover:border-[#141213]/30 hover:text-[#141213]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{copy.resetChat}</span>
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-5 overflow-y-auto px-6 py-6 max-h-[540px]"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col justify-center py-6">
            <div className="h-0.5 w-10 bg-[#e3a535]" />
            <h3 className="mt-4 font-display text-2xl font-semibold text-[#141213]">
              {copy.chatEmptyTitle}
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#5C5658]">
              {copy.chatEmptyBody}
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              {copy.quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => onSendMessage(prompt)}
                  className="rounded-sm border border-[#141213]/12 bg-[#FAF8F5] px-3.5 py-2 text-start text-xs font-medium text-[#141213] transition-colors hover:border-[#e3a535] hover:bg-[#F3EFEA]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] rounded-sm px-4 py-3.5 ${
                  message.role === 'user'
                    ? 'bg-[#141213] text-white'
                    : 'border border-[#141213]/10 bg-[#FAF8F5] text-[#141213]'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </p>
                ) : (
                  <FormattedMessage content={message.content} />
                )}

                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 border-t border-[#141213]/10 pt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5C5658]">
                      {copy.sourcesHeading}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {message.sources.map((src) => (
                        <li key={src.url}>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#ff003b] underline decoration-[#e3a535]/70 underline-offset-2 hover:text-[#d90032]"
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            <span className="break-all">{src.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-start">
            <div className="rounded-sm border border-[#141213]/10 bg-[#FAF8F5] px-4 py-3 text-sm text-[#5C5658]">
              {copy.generatingRoutine}
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[#ff003b]/30 bg-[#ff003b]/[0.05] px-4 py-3 text-sm text-[#141213]"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={onRetryLast}
              className="rounded-sm border border-[#ff003b] px-3 py-1 text-xs font-semibold text-[#ff003b] transition-colors hover:bg-[#ff003b] hover:text-white"
            >
              {copy.retryBtn}
            </button>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 border-t border-[#141213]/10 bg-[#FAF8F5] px-4 py-3.5"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={copy.chatPlaceholder}
          disabled={isLoading}
          className="flex-1 rounded-sm border border-[#141213]/15 bg-white px-3.5 py-2.5 text-sm text-[#141213] placeholder:text-[#5C5658]/70 focus:border-[#ff003b] focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="inline-flex items-center gap-2 rounded-sm bg-[#ff003b] px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#d90032] disabled:cursor-not-allowed disabled:bg-[#141213]/20 disabled:text-[#141213]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff003b]"
        >
          <span>{copy.sendMessage}</span>
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </section>
  );
}
