import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { LanguageMode, Product } from '../types.ts';
import type { CopySet } from '../data/translations.ts';

interface ProductModalProps {
  product: Product | null;
  isSelected: boolean;
  language: LanguageMode;
  copy: CopySet;
  onClose: () => void;
  onToggleSelect: (productId: string) => void;
}

export function ProductModal({
  product,
  isSelected,
  language,
  copy,
  onClose,
  onToggleSelect,
}: ProductModalProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const name = language === 'ar' ? product.nameAr : product.name;
  const brand = language === 'ar' ? product.brandAr : product.brand;
  const category = language === 'ar' ? product.categoryAr : product.category;
  const description = language === 'ar' ? product.descriptionAr : product.description;
  const howToUse = language === 'ar' ? product.howToUseAr : product.howToUse;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#141213]/60 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative grid w-full max-w-3xl overflow-hidden rounded-sm border border-[#141213]/15 bg-[#FAF8F5] shadow-xl md:grid-cols-12"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.modalClose}
          className="absolute top-4 end-4 z-10 flex h-9 w-9 items-center justify-center rounded-sm border border-[#141213]/15 bg-white/95 text-[#141213] transition-colors hover:border-[#ff003b] hover:text-[#ff003b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff003b]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-[#EFEAE3] md:col-span-5">
          {!imageError ? (
            <img
              src={product.image}
              alt={name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="h-64 w-full object-cover md:h-full"
            />
          ) : (
            <div className="flex h-64 w-full items-center justify-center p-8 text-center md:h-full">
              <span className="font-display text-2xl font-semibold text-[#141213]">
                {brand}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between p-6 md:col-span-7 md:p-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#5C5658]">
              <span>{brand}</span>
              <span aria-hidden="true">·</span>
              <span>{category}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{product.size}</span>
            </div>

            <h2
              id="product-modal-title"
              className="mt-2 font-display text-2xl font-semibold leading-tight text-[#141213] md:text-3xl"
            >
              {name}
            </h2>

            <div className="my-4 h-px w-12 bg-[#e3a535]" />

            <p className="text-sm leading-relaxed text-[#141213]/85 md:text-[15px]">
              {description}
            </p>

            <div className="mt-5 space-y-4 border-t border-[#141213]/10 pt-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5C5658]">
                  {copy.modalActives}
                </h3>
                <p className="mt-1 text-sm text-[#141213]">
                  {product.keyActives.join(' · ')}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5C5658]">
                  {copy.modalHowToUse}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#5C5658]">
                  {howToUse}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#141213]/10 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-[#141213]/15 px-4 py-2 text-sm font-medium text-[#141213] whitespace-nowrap transition-colors hover:bg-[#F3EFEA]"
            >
              {copy.modalClose}
            </button>
            <button
              type="button"
              onClick={() => onToggleSelect(product.id)}
              className={`inline-flex items-center gap-2 rounded-sm px-5 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                isSelected
                  ? 'border border-[#ff003b] bg-[#ff003b]/10 text-[#ff003b] hover:bg-[#ff003b]/15'
                  : 'bg-[#ff003b] text-white hover:bg-[#d90032]'
              }`}
            >
              {isSelected && <Check className="h-4 w-4" />}
              <span>{isSelected ? copy.selectedBtn : copy.selectBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
