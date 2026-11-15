import React from 'react';
import {
  Heart,
  Sparkles,
  ShoppingBag,
  Check,
  ShieldCheck,
  FlaskConical,
  ArrowRight,
  ScanFace
} from 'lucide-react';
import { Product } from '../types';

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
    <div className="flex flex-col flex-1 pb-32 pt-4 px-4 sm:px-5 select-none">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-[#1C1813] leading-tight">
            Избранный уход
          </h1>
          <p className="text-[13px] font-normal text-[#756C5D] mt-0.5">
            Средства, отобранные AI-консьержем
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0E6D1] border border-[#E6DFCF] text-[#A87C44] text-[12px] font-bold">
          <Heart size={14} className="fill-[#A87C44]" />
          <span>{favoriteProducts.length}</span>
        </div>
      </header>

      {/* Killer Feature CTA: Проверить банку / Разбор состава по фото */}
      <button
        type="button"
        onClick={onOpenJarScanner}
        aria-label="Проверить банку / Разбор состава по фото"
        className="group w-full mb-4 flex items-center justify-between bg-gradient-to-r from-[#F0E6D1]/75 via-[#F0E6D1] to-white rounded-[24px] p-3.5 shadow-[0_8px_22px_rgba(168,124,68,0.08)] border border-[#F0E6D1] hover:border-[#A87C44] active:scale-[0.98] transition-all text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#A87C44] flex items-center justify-center text-white shrink-0 shadow-xs">
            <FlaskConical size={19} strokeWidth={2.2} />
          </div>
          <div>
            <span className="text-[13.5px] font-bold text-[#1C1813] group-hover:text-[#A87C44] transition-colors block">
              Проверить банку / Разбор состава по фото
            </span>
            <span className="text-[11px] text-[#786F67]">
              Анализ INCI на комедогены и конфликт с уходом
            </span>
          </div>
        </div>
        <ArrowRight size={17} className="text-[#A87C44] shrink-0 ml-2" />
      </button>

      {/* Info Banner */}
      <div className="bg-white border border-[#ECE5D7] rounded-[22px] p-3.5 mb-4 flex items-center gap-3 shadow-xs">
        <div className="w-8 h-8 rounded-full bg-[#F0E6D1]/60 flex items-center justify-center text-[#A87C44] shrink-0">
          <Sparkles size={16} />
        </div>
        <p className="text-[11.5px] text-[#786F67] leading-relaxed">
          Каждое средство проверяется по составу на совместимость с кожей ({userName}).
        </p>
      </div>

      {/* Empty State vs Products List */}
      {favoriteProducts.length === 0 ? (
        <div className="bg-white rounded-[26px] p-7 text-center border border-[#ECE5D7] shadow-xs my-2 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F0E6D1] text-[#A87C44] flex items-center justify-center">
            <Heart size={22} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#1C1813]">
              Избранный уход пока пуст
            </h3>
            <p className="text-[12px] text-[#756C5D] mt-1 max-w-[270px] leading-relaxed">
              Здесь появятся средства, которые ИИ подберет специально для тебя, или
              банки, проверенные через INCI-сканер
            </p>
          </div>

          <div className="w-full flex flex-col gap-2 pt-2">
            {onStartScan && (
              <button
                type="button"
                onClick={onStartScan}
                className="w-full py-3 px-4 rounded-full bg-[#A87C44] text-white text-[12.5px] font-bold flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
              >
                <ScanFace size={15} />
                <span>Подобрать уход через AI-диагностику</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenJarScanner}
              className="w-full py-3 px-4 rounded-full bg-[#FBF8F5] border border-[#EBE4DD] text-[#1C1813] text-[12.5px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <FlaskConical size={15} className="text-[#A87C44]" />
              <span>Проверить свою банку по составу</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {favoriteProducts.map((product) => {
            return (
              <div
                key={product.id}
                className="bg-white rounded-[24px] p-3.5 shadow-[0_6px_20px_rgba(30,27,24,0.03)] border border-[#ECE5D7] flex flex-col gap-3 transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  {/* Product Thumbnail */}
                  <div className="w-16 h-16 rounded-[18px] bg-[#F0E6D1] p-2 flex items-center justify-center shrink-0">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80';
                      }}
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#756C5D]">
                        {product.brand} • {product.categoryLabel || 'Уход'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(product.id)}
                        aria-label={`Удалить ${product.name} из избранного`}
                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#A87C44] active:scale-90"
                      >
                        <Heart size={15} className="fill-[#A87C44]" />
                      </button>
                    </div>

                    <h3 className="text-[14px] font-bold text-[#1C1813] truncate mt-0.5">
                      {product.name}
                    </h3>

                    {product.whyItFits && (
                      <p className="text-[11px] text-[#786F67] mt-0.5 line-clamp-2">
                        {product.whyItFits}
                      </p>
                    )}

                    {/* Compatibility Badge */}
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                        <ShieldCheck size={12} />
                        Совместимость ({userName}): {product.compatibility || 98}%
                      </span>
                    </div>

                    {product.price && (
                      <div className="mt-1 text-[13px] font-bold text-[#1C1813]">
                        {product.price.toLocaleString('ru-RU')} ₽
                        <span className="text-[11px] font-normal text-[#756C5D] ml-1.5">
                          в {product.partnerStore || 'Золотое Яблоко'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#F8F4EE]">
                  <button
                    type="button"
                    onClick={() => onToggleInRoutine(product.id)}
                    aria-label={`Добавить ${product.name} в рутину`}
                    className={`flex-1 py-2 px-3 rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                      product.inRoutine
                        ? 'bg-[#F4F0E8] text-[#786F67] hover:bg-[#EBE4DD]'
                        : 'bg-[#A87C44]/10 text-[#A87C44] hover:bg-[#A87C44]/20'
                    }`}
                  >
                    <Check size={14} strokeWidth={2.5} />
                    <span>{product.inRoutine ? 'В рутине ухода' : 'В рутину'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddToCart(product)}
                    aria-label={`Добавить ${product.name} в корзину`}
                    className="py-2 px-4 rounded-full bg-[#1C1813] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <ShoppingBag size={14} />
                    <span>В корзину</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
