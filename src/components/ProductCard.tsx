import { useState } from 'react';
import { Check, Info, Plus } from 'lucide-react';
import type { LanguageMode, Product } from '../types.ts';
import type { CopySet } from '../data/translations.ts';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  language: LanguageMode;
  copy: CopySet;
  onToggleSelect: (productId: string) => void;
  onInspect: (product: Product) => void;
}

export function ProductCard({
  product,
  isSelected,
  language,
  copy,
  onToggleSelect,
  onInspect,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const name = language === 'ar' ? product.nameAr : product.name;
  const brand = language === 'ar' ? product.brandAr : product.brand;
  const category = language === 'ar' ? product.categoryAr : product.category;
  const summary = language === 'ar' ? product.shortSummaryAr : product.shortSummary;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleSelect(product.id);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => onToggleSelect(product.id)}
      onKeyDown={handleKeyDown}
      className={`group flex flex-col overflow-hidden rounded-sm border text-start transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff003b] ${
        isSelected
          ? 'border-[#ff003b] ring-2 ring-[#ff003b] bg-[#ff003b]/[0.025] shadow-sm'
          : 'border-[#141213]/10 bg-white hover:-translate-y-0.5 hover:border-[#e3a535] hover:shadow-sm'
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFEAE3]">
        {!imageError ? (
          <img
            src={product.image}
            alt={name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#F3EFEA] to-[#E7DFD3] p-6 text-center">
            <span className="font-display text-2xl font-semibold text-[#141213]">
              {brand}
            </span>
            <span className="mt-1 text-xs uppercase tracking-widest text-[#5C5658]">
              {category}
            </span>
          </div>
        )}

        {isSelected && (
          <div
            aria-hidden="true"
            className="absolute top-3 end-3 flex h-7 w-7 items-center justify-center rounded-sm bg-[#ff003b] text-white shadow-sm"
          >
            <Check className="h-4 w-4 stroke-[2.5]" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#5C5658]">
          <span>{brand}</span>
          <span aria-hidden="true">·</span>
          <span>{category}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{product.size}</span>
        </div>

        <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-[#141213]">
          {name}
        </h3>

        <p className="mt-2 mb-5 line-clamp-2 text-sm leading-relaxed text-[#5C5658]">
          {summary}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#141213]/8 pt-4">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${
              isSelected ? 'text-[#ff003b]' : 'text-[#141213]'
            }`}
          >
            {isSelected ? (
              <Check className="h-3.5 w-3.5 text-[#e3a535]" />
            ) : (
              <Plus className="h-3.5 w-3.5 text-[#5C5658]" />
            )}
            <span>{isSelected ? copy.selectedBtn : copy.selectBtn}</span>
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInspect(product);
            }}
            className="inline-flex items-center gap-1.5 rounded-sm border border-[#141213]/15 bg-[#FAF8F5] px-3 py-1.5 text-xs font-medium text-[#141213] whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-[#e3a535] hover:bg-[#F3EFEA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff003b]"
          >
            <Info className="h-3.5 w-3.5 text-[#e3a535]" />
            <span>{copy.detailsBtn}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
