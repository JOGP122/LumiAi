import React from 'react';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  name: string;
  brand: string;
  price: string;
  imageUrl?: string;
  /** Строка под ценой: бейдж совместимости (sage) или кастомный ряд */
  fitNote?: string;
  /** Кастомный meta-ряд вместо fitNote (например, степпер количества) */
  meta?: React.ReactNode;
  /** Правый верхний угол (по умолчанию — сердце) */
  trailing?: React.ReactNode;
  /** Показать сердце в trailing */
  heart?: boolean;
  heartActive?: boolean;
  onHeart?: () => void;
  heartAriaLabel?: string;
  /** Нижний блок карточки (кнопки действий) */
  footer?: React.ReactNode;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80';

export const ProductCard: React.FC<ProductCardProps> = ({
  name,
  brand,
  price,
  imageUrl,
  fitNote,
  meta,
  trailing,
  heart = true,
  heartActive = true,
  onHeart,
  heartAriaLabel,
  footer
}) => {
  return (
    <div className="bg-[#FCFAF4] rounded-[20px] p-[14px] flex flex-col gap-3 shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)]">
      <div className="flex items-center gap-3.5">
        {/* Media tile */}
        <div className="w-[76px] h-[76px] rounded-[14px] bg-[#ECE5D7] flex items-center justify-center shrink-0">
          <img
            src={imageUrl || FALLBACK_IMAGE}
            alt={name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
            className="w-[60px] h-[60px] object-contain"
          />
        </div>

        {/* Texts */}
        <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
          <h3 className="text-[15px] font-semibold text-[#1C1813] truncate">{name}</h3>
          <span className="text-[12.5px] text-[#756C5D] truncate">{brand}</span>
          <span className="text-[14px] font-bold text-[#1C1813]">{price}</span>

          {meta ? (
            <div className="pt-[3px] flex items-center gap-3">{meta}</div>
          ) : fitNote ? (
            <div className="pt-[3px] flex items-center gap-1.5">
              <span className="w-[5px] h-[5px] rounded-full bg-[#5F7A60]" />
              <span className="text-[11.5px] font-semibold text-[#5F7A60]">
                {fitNote}
              </span>
            </div>
          ) : null}
        </div>

        {/* Trailing */}
        {trailing !== undefined ? (
          <div className="self-start mt-1 shrink-0">{trailing}</div>
        ) : heart ? (
          <button
            type="button"
            onClick={onHeart}
            aria-label={heartAriaLabel || `Избранное: ${name}`}
            className="self-start mt-1 p-1 active:scale-90 transition-transform shrink-0"
          >
            <Heart
              size={18}
              className={heartActive ? 'text-[#A87C44]' : 'text-[#E6DFCF]'}
              fill={heartActive ? '#A87C44' : 'none'}
            />
          </button>
        ) : null}
      </div>

      {footer && <div className="pt-2 border-t border-[#E6DFCF]">{footer}</div>}
    </div>
  );
};
