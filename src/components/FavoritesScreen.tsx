import React from 'react';
import {
  Heart,
  Sparkles,
  ShoppingBag,
  Check,
  FlaskConical,
  ChevronRight,
  ScanFace,
  Wand2
} from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FavoritesScreenProps {
  userName?: string;
  products: Product[];
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onToggleInRoutine: (productId: string) => void;
  onOpenJarScanner: () => void;
  onStartScan?: () => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  userName = 'Пользователь',
  products,
  onToggleFavorite,
  onAddToCart,
  onToggleInRoutine,
  onOpenJarScanner,
  onStartScan
}) => {
  const favoriteProducts = products.filter((p) => p.isFavorite);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F4F0E8] pb-32 select-none">
      <div className="flex flex-col gap-5 px-5 pt-6 flex-1">
        {/* Header: overline + Cormorant title + count pill */}
        <header className="flex items-end justify-between">
          <div className="flex flex-col gap-[5px]">
            <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#A87C44]">
              Подборка
            </span>
            <h1 className="font-serif text-[30px] font-medium leading-[34px] text-[#1C1813]">
              Избранный уход
            </h1>
            <span className="text-[12.5px] leading-[17px] text-[#756C5D]">
              Средства, отобранные AI-консержем
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-[13px] py-2 rounded-full bg-[#FCFAF4] border border-[#E6DFCF]">
            <Heart size={12} className="text-[#A87C44]" fill="#A87C44" />
            <span className="text-[13px] font-semibold text-[#1C1813]">
              {favoriteProducts.length}
            </span>
          </div>
        </header>

        {/* Dark scan CTA card */}
        <button
          type="button"
          onClick={onOpenJarScanner}
          aria-label="Проверить банку по составу"
          className="w-full bg-[#1C1813] rounded-[20px] p-4 flex items-center gap-3.5 shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)] active:scale-[0.99] transition-transform text-left"
        >
          <div className="w-[42px] h-[42px] rounded-[12px] bg-[#322B22] flex items-center justify-center shrink-0">
            <FlaskConical size={16} className="text-[#CDA872]" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
            <span className="text-[15px] font-semibold text-[#F5F0E5]">
              Проверить банку по составу
            </span>
            <span className="text-[12px] leading-[16px] text-[#B4A993]">
              Анализ INCI на комедогены и конфликт с уходом
            </span>
          </div>
          <ChevronRight size={13} className="text-[#CDA872] shrink-0" />
        </button>

        {/* Note */}
        <div className="flex gap-2.5 items-start px-1 -my-1">
          <Wand2 size={13} className="text-[#A87C44] mt-0.5 shrink-0" />
          <p className="text-[12.5px] leading-[18px] text-[#756C5D]">
            Каждое средство проверяется по составу на совместимость с твоей кожей
            ({userName}).
          </p>
        </div>

        {/* Empty state / List */}
        {favoriteProducts.length === 0 ? (
          <div className="bg-[#FCFAF4] rounded-[20px] p-7 text-center shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)] flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-[16px] bg-[#F0E6D1] text-[#84622F] flex items-center justify-center">
              <Heart size={20} />
            </div>
            <div>
              <h3 className="font-serif text-[20px] font-medium text-[#1C1813]">
                Избранный уход пока пуст
              </h3>
              <p className="text-[12.5px] text-[#756C5D] mt-1 max-w-[280px] leading-relaxed">
                Здесь появятся средства, которые ИИ подберёт специально для тебя
              </p>
            </div>
            <div className="w-full flex flex-col gap-2.5 pt-2">
              {onStartScan && (
                <button
                  type="button"
                  onClick={onStartScan}
                  className="w-full h-[48px] rounded-[14px] bg-[#1C1813] text-[#F5F0E5] text-[14px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <ScanFace size={15} />
                  <span>Подобрать уход через AI-диагностику</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {favoriteProducts.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                brand={`${product.brand} • ${product.categoryLabel || 'Уход'}`}
                price={product.price
                  ? `${product.price.toLocaleString('ru-RU')} ₽`
                  : '—'}
                imageUrl={product.imageUrl}
                fitNote={`Подходит твоей коже (${product.compatibility || 98}%)`}
                onHeart={() => onToggleFavorite(product.id)}
                heartAriaLabel={`Удалить ${product.name} из избранного`}
                footer={
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleInRoutine(product.id)}
                      aria-label={`Добавить ${product.name} в рутину`}
                      className={`flex-1 h-[38px] rounded-full text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        product.inRoutine
                          ? 'bg-[#ECE5D7] text-[#756C5D]'
                          : 'bg-[#F0E6D1] text-[#84622F] active:scale-[0.98]'
                      }`}
                    >
                      <Check size={13} strokeWidth={2.5} />
                      <span>{product.inRoutine ? 'В рутине ухода' : 'В рутину'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddToCart(product)}
                      aria-label={`Добавить ${product.name} в корзину`}
                      className="h-[38px] px-4 rounded-full bg-[#1C1813] text-[#F5F0E5] text-[12px] font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                    >
                      <ShoppingBag size={13} />
                      <span>В корзину</span>
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {onStartScan && (
          <button
            type="button"
            onClick={onStartScan}
            className="w-full h-[52px] rounded-[14px] bg-transparent border border-[#E6DFCF] text-[#1C1813] text-[15px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Sparkles size={14} className="text-[#A87C44]" />
            <span>Подобрать ещё через AI-диагностику</span>
          </button>
        )}
      </div>
    </div>
  );
};
