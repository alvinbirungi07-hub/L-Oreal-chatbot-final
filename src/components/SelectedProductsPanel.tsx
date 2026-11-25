import { Trash2, X } from 'lucide-react';
import type { LanguageMode, Product } from '../types.ts';
import type { CopySet } from '../data/translations.ts';

interface SelectedProductsPanelProps {
  selectedProducts: Product[];
  language: LanguageMode;
  copy: CopySet;
  isGenerating: boolean;
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  onGenerateRoutine: () => void;
}

export function SelectedProductsPanel({
  selectedProducts,
  language,
  copy,
  isGenerating,
  onRemoveProduct,
  onClearAll,
  onGenerateRoutine,
}: SelectedProductsPanelProps) {
  return (
    <aside
      aria-label={copy.selectedPanelTitle}
      className="flex flex-col rounded-sm border border-[#141213]/12 bg-white p-6"
    >
      <div className="h-0.5 w-14 bg-[#e3a535]" />

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2.5">
          <h2 className="font-display text-2xl font-semibold text-[#141213]">
            {copy.selectedPanelTitle}
          </h2>
          <span className="text-sm font-semibold tabular-nums text-[#ff003b]">
            ({selectedProducts.length})
          </span>
        </div>

        {selectedProducts.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C5658] whitespace-nowrap transition-colors hover:text-[#ff003b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff003b]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{copy.clearAll}</span>
          </button>
        )}
      </div>

      <div className="mt-5 flex-1">
        {selectedProducts.length === 0 ? (
          <div className="rounded-sm border border-dashed border-[#141213]/15 bg-[#FAF8F5] p-6 text-sm leading-relaxed text-[#5C5658]">
            {copy.selectedPanelEmpty}
          </div>
        ) : (
          <ul className="divide-y divide-[#141213]/8 border-t border-b border-[#141213]/8">
            {selectedProducts.map((product) => {
              const name = language === 'ar' ? product.nameAr : product.name;
              const brand = language === 'ar' ? product.brandAr : product.brand;
              const category = language === 'ar' ? product.categoryAr : product.category;

              return (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={product.image}
                      alt={name}
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 shrink-0 rounded-sm bg-[#EFEAE3] object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-[#5C5658]">
                        {brand} · {category}
                      </p>
                      <p className="truncate text-sm font-semibold text-[#141213]">
                        {name}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveProduct(product.id)}
                    aria-label={`${copy.removeItem} ${name}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-[#5C5658] transition-colors hover:bg-[#ff003b]/10 hover:text-[#ff003b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff003b]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={onGenerateRoutine}
          disabled={selectedProducts.length === 0 || isGenerating}
          className="w-full rounded-sm bg-[#ff003b] px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#d90032] disabled:cursor-not-allowed disabled:bg-[#141213]/20 disabled:text-[#141213]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff003b]"
        >
          {isGenerating ? copy.generatingRoutine : copy.generateRoutine}
        </button>

        {selectedProducts.length === 0 && (
          <p className="mt-2.5 text-xs text-[#5C5658]">{copy.selectAtLeastOne}</p>
        )}
      </div>
    </aside>
  );
}
