import { useEffect, useMemo, useState } from 'react';
import { Languages, Search, X } from 'lucide-react';
import { HERO_IMAGE, PRODUCTS } from './data/products.ts';
import { COPY } from './data/translations.ts';
import type { Category, ChatMessage, GroundingSource, LanguageMode, Product } from './types.ts';
import { Header } from './components/Header.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductModal } from './components/ProductModal.tsx';
import { SelectedProductsPanel } from './components/SelectedProductsPanel.tsx';
import { RoutineChat } from './components/RoutineChat.tsx';

const STORAGE_SELECTED_KEY = 'loreal_selected_products_v1';
const STORAGE_LANG_KEY = 'loreal_language_v1';

const CATEGORIES: Category[] = ['All', 'Skincare', 'Haircare', 'Makeup', 'Fragrance'];

function loadSavedProductIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_SELECTED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const validIds = new Set(PRODUCTS.map((p) => p.id));
    return parsed.filter((id): id is string => typeof id === 'string' && validIds.has(id));
  } catch {
    return [];
  }
}

function loadSavedLanguage(): LanguageMode {
  try {
    const raw = localStorage.getItem(STORAGE_LANG_KEY);
    return raw === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
}

export function App() {
  const [language, setLanguage] = useState<LanguageMode>(() => loadSavedLanguage());
  const [selectedIds, setSelectedIds] = useState<string[]>(() => loadSavedProductIds());
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedProduct, setInspectedProduct] = useState<Product | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [heroImageError, setHeroImageError] = useState(false);

  const copy = COPY[language];

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_LANG_KEY, language);
    } catch {
      // Ignore storage quota errors
    }
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SELECTED_KEY, JSON.stringify(selectedIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [selectedIds]);

  const selectedProducts = useMemo(
    () => PRODUCTS.filter((product) => selectedIds.includes(product.id)),
    [selectedIds]
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return PRODUCTS.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      if (!matchesCategory) return false;
      if (!query) return true;

      const haystack = [
        product.name,
        product.nameAr,
        product.brand,
        product.brandAr,
        product.category,
        product.categoryAr,
        product.description,
        product.descriptionAr,
        ...product.keyActives,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [activeCategory, searchQuery]);

  const toggleProductSelection = (productId: string) => {
    setSelectedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const clearAllSelections = () => {
    setSelectedIds([]);
  };

  const scrollToStudio = () => {
    const el = document.getElementById('routine-studio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sendAdvisorRequest = async (
    nextMessages: ChatMessage[],
    mode: 'routine' | 'followup'
  ) => {
    setIsLoading(true);
    setChatError(null);

    try {
      const endpoint = import.meta.env.VITE_CLOUDFLARE_WORKER_URL?.trim() || '/api/chat';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          webSearch: webSearchEnabled,
          language,
          selectedProducts: selectedProducts.map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category,
            description: p.description,
            keyActives: p.keyActives,
          })),
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const rawText = await response.text();
      let data: {
        reply?: string;
        sources?: GroundingSource[];
        error?: string;
      } = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          response.status === 404 || response.status === 405
            ? 'Static hosting does not include the /api/chat server. Configure your Cloudflare Worker URL (VITE_CLOUDFLARE_WORKER_URL) when building for GitHub Pages.'
            : `Unexpected server response (${response.status}).`
        );
      }

      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'Unable to generate advisor response.');
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        sources: Array.isArray(data.sources) ? data.sources : [],
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed.';
      setChatError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRoutine = () => {
    if (selectedProducts.length === 0 || isLoading) return;

    const productNames = selectedProducts
      .map((p) => (language === 'ar' ? p.nameAr : p.name))
      .join(', ');

    const userPrompt =
      language === 'ar'
        ? `أنشئ لي روتين عناية متكامل للصباح والمساء باستخدام المنتجات المختارة التالية: ${productNames}.`
        : `Please build a personalized AM and PM beauty routine using my selected products: ${productNames}.`;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userPrompt,
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    scrollToStudio();
    void sendAdvisorRequest(nextMessages, 'routine');
  };

  const handleSendFollowUp = (text: string) => {
    if (isLoading) return;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    void sendAdvisorRequest(nextMessages, 'followup');
  };

  const handleRetryLast = () => {
    if (messages.length === 0 || isLoading) return;
    const last = messages[messages.length - 1];
    if (last.role === 'user') {
      void sendAdvisorRequest(messages, 'followup');
    }
  };

  return (
    <div id="top" className="min-h-screen bg-[#FAF8F5] text-[#141213]">
      <Header
        copy={copy}
        selectedCount={selectedProducts.length}
        onBuildRoutineClick={() => {
          if (selectedProducts.length > 0) {
            handleGenerateRoutine();
          } else {
            scrollToStudio();
          }
        }}
      />

      <main className="mx-auto max-w-[1280px] px-6">
        <section className="grid items-stretch gap-8 py-10 lg:grid-cols-12 lg:py-14">
          <div className="flex flex-col justify-between lg:col-span-6 lg:pe-4">
            <div>
              <div className="h-0.5 w-16 bg-[#e3a535]" />
              <h1 className="mt-6 font-display text-[clamp(2.25rem,4vw,3.5rem)] font-semibold leading-[1.08] tracking-tight text-[#141213] [text-wrap:balance]">
                {copy.heroTitle}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#5C5658]">
                {copy.heroSubtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#catalog"
                  className="inline-flex items-center justify-center rounded-sm bg-[#ff003b] px-6 py-3 text-sm font-semibold text-white whitespace-nowrap transition-colors hover:bg-[#d90032] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff003b]"
                >
                  {copy.heroPrimaryBtn}
                </a>
                <a
                  href="#routine-studio"
                  className="inline-flex items-center justify-center rounded-sm border border-[#141213]/20 bg-white px-6 py-3 text-sm font-semibold text-[#141213] whitespace-nowrap transition-colors hover:border-[#e3a535] hover:bg-[#F3EFEA]"
                >
                  {copy.heroSecondaryBtn} ({selectedProducts.length})
                </a>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#141213]/10 pt-5 text-xs font-medium uppercase tracking-wider text-[#5C5658]">
              <span>{copy.heroMeta1}</span>
              <span aria-hidden="true" className="text-[#e3a535]">·</span>
              <span>{copy.heroMeta2}</span>
              <span aria-hidden="true" className="text-[#e3a535]">·</span>
              <span>{copy.heroMeta3}</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-sm border border-[#141213]/10 bg-[#EFEAE3] lg:col-span-6">
            {!heroImageError ? (
              <img
                src={HERO_IMAGE}
                alt={copy.brandWordmark}
                referrerPolicy="no-referrer"
                onError={() => setHeroImageError(true)}
                className="aspect-[16/9] w-full object-cover lg:h-full"
              />
            ) : (
              <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-[#F3EFEA] to-[#E5DDD1] lg:h-full">
                <span className="font-display text-3xl font-semibold text-[#141213]">
                  {copy.brandWordmark}
                </span>
              </div>
            )}
          </div>
        </section>

        <section id="catalog" className="border-t border-[#141213]/10 py-12">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-display text-3xl font-semibold text-[#141213]">
                {copy.catalogTitle}
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm text-[#5C5658]">
                {copy.catalogSubtitle}
              </p>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider tabular-nums text-[#5C5658]">
              {copy.showingCount(filteredProducts.length, PRODUCTS.length)}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-4 border-y border-[#141213]/10 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div
              role="tablist"
              aria-label="Product categories"
              className="flex flex-wrap items-center gap-1.5 rounded-sm bg-[#F3EFEA] p-1"
            >
              {CATEGORIES.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-sm px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 ${
                      isActive
                        ? 'bg-[#141213] text-white'
                        : 'text-[#5C5658] hover:text-[#141213]'
                    }`}
                  >
                    {copy.categories[category]}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
              <div className="relative flex-1 sm:w-72">
                <Search className="pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-[#5C5658]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={copy.searchPlaceholder}
                  aria-label={copy.searchPlaceholder}
                  className="w-full rounded-sm border border-[#141213]/15 bg-white py-2 ps-9 pe-9 text-sm text-[#141213] placeholder:text-[#5C5658]/75 focus:border-[#ff003b] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label={copy.clearSearch}
                    className="absolute top-1/2 end-2.5 -translate-y-1/2 rounded-sm p-1 text-[#5C5658] hover:text-[#ff003b]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'))}
                className="inline-flex items-center gap-2 rounded-sm border border-[#141213]/15 bg-white px-3.5 py-2 text-xs font-semibold text-[#141213] whitespace-nowrap shrink-0 transition-colors hover:border-[#e3a535] hover:bg-[#F3EFEA]"
              >
                <Languages className="h-4 w-4 text-[#e3a535]" />
                <span>{copy.rtlToggleLabel}</span>
              </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="mt-8 rounded-sm border border-[#141213]/10 bg-white p-10 text-center">
              <h3 className="font-display text-2xl font-semibold text-[#141213]">
                {copy.noProductsTitle}
              </h3>
              <p className="mt-2 text-sm text-[#5C5658]">{copy.noProductsBody}</p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                }}
                className="mt-5 rounded-sm bg-[#141213] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#ff003b]"
              >
                {copy.resetFilters}
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={selectedIds.includes(product.id)}
                  language={language}
                  copy={copy}
                  onToggleSelect={toggleProductSelection}
                  onInspect={setInspectedProduct}
                />
              ))}
            </div>
          )}
        </section>

        <section
          id="routine-studio"
          className="border-t border-[#141213]/10 py-12"
        >
          <div className="grid items-start gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SelectedProductsPanel
                selectedProducts={selectedProducts}
                language={language}
                copy={copy}
                isGenerating={isLoading}
                onRemoveProduct={(id) =>
                  setSelectedIds((prev) => prev.filter((item) => item !== id))
                }
                onClearAll={clearAllSelections}
                onGenerateRoutine={handleGenerateRoutine}
              />
            </div>

            <div className="lg:col-span-7">
              <RoutineChat
                messages={messages}
                isLoading={isLoading}
                error={chatError}
                webSearchEnabled={webSearchEnabled}
                language={language}
                copy={copy}
                onToggleWebSearch={() => setWebSearchEnabled((prev) => !prev)}
                onResetChat={() => {
                  setMessages([]);
                  setChatError(null);
                }}
                onSendMessage={handleSendFollowUp}
                onRetryLast={handleRetryLast}
              />
            </div>
          </div>
        </section>

        <section
          id="methodology"
          className="border-t border-[#141213]/10 py-12"
        >
          <h2 className="font-display text-3xl font-semibold text-[#141213]">
            {copy.methodologyTitle}
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {copy.methodologyItems.map((item) => (
              <div
                key={item.title}
                className="border-t-2 border-[#e3a535] pt-4"
              >
                <h3 className="font-display text-xl font-semibold text-[#141213]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5C5658]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#141213]/10 bg-[#F3EFEA] py-6">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-6 text-xs text-[#5C5658]">
          <span>{copy.footerNote}</span>
          <span>{copy.brandWordmark}</span>
        </div>
      </footer>

      <ProductModal
        product={inspectedProduct}
        isSelected={inspectedProduct ? selectedIds.includes(inspectedProduct.id) : false}
        language={language}
        copy={copy}
        onClose={() => setInspectedProduct(null)}
        onToggleSelect={toggleProductSelection}
      />
    </div>
  );
}

export default App;
