import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { CartItem } from '../types';
import { calculateCartTotal } from '../utils/skincare';
import { ProductCard } from './ProductCard';

interface CartScreenProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearCart?: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  items,
  onUpdateQuantity
}) => {
  const [isOrdered, setIsOrdered] = useState(false);
  const { subtotal, cashback, total } = calculateCartTotal(items);
  const itemsCount = items.reduce((a, b) => a + b.quantity, 0);

  const handleOrder = () => {
    setIsOrdered(true);
    setTimeout(() => {
      setIsOrdered(false);
    }, 3500);
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F4F0E8] pb-36 select-none">
      <div className="flex flex-col gap-5 px-5 pt-6 flex-1">
        {/* Header */}
        <header className="flex flex-col gap-[5px]">
          <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#A87C44]">
            Корзина
          </span>
          <h1 className="font-serif text-[30px] font-medium leading-[34px] text-[#1C1813]">
            Уход в один клик
          </h1>
          <span className="text-[12.5px] leading-[17px] text-[#756C5D]">
            Прямая корзина в партнёрские сети
          </span>
        </header>

        {/* Partners */}
        <div className="flex gap-2.5 items-center">
          <span className="text-[12.5px] text-[#756C5D] mr-1">Доставка</span>
          <span className="h-[34px] px-3.5 rounded-full bg-[#1C1813] inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CDA872]" />
            <span className="text-[12.5px] font-semibold text-[#F5F0E5]">
              Золотое Яблоко
            </span>
          </span>
          <span className="h-[34px] px-3.5 rounded-full border border-[#E6DFCF] inline-flex items-center">
            <span className="text-[12.5px] font-medium text-[#756C5D]">Лэтуаль</span>
          </span>
        </div>

        {/* Success */}
        {isOrdered && (
          <div className="p-4 rounded-[16px] bg-[#E8EFE4] text-[#3E5A3F] flex items-center gap-3 animate-fade-in">
            <CheckCircle2 size={22} className="shrink-0" />
            <div>
              <h4 className="text-[13px] font-semibold">
                Заказ передан в «Золотое Яблоко»!
              </h4>
              <p className="text-[11.5px] mt-0.5 opacity-80">
                Кэшбэк {cashback.toLocaleString('ru-RU')} ₽ зачислен на карту лояльности.
              </p>
            </div>
          </div>
        )}

        {/* Items / empty */}
        {items.length === 0 ? (
          <div className="bg-[#ECE5D7] rounded-[20px] p-8 text-center flex flex-col items-center gap-3">
            <ShoppingBag size={32} className="text-[#A79C8A]" />
            <div>
              <h3 className="font-serif text-[20px] font-medium text-[#1C1813]">
                Корзина пуста
              </h3>
              <p className="text-[12.5px] text-[#756C5D] mt-1">
                Добавь подобранные средства из рутины или избранного
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <ProductCard
                key={item.id}
                name={item.name}
                brand={item.partnerStore}
                price={`${item.price.toLocaleString('ru-RU')} ₽`}
                imageUrl={item.imageUrl}
                heart={false}
                meta={
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      aria-label={`Уменьшить количество ${item.name}`}
                      className="w-[26px] h-[26px] rounded-full border border-[#E6DFCF] flex items-center justify-center active:scale-90 transition-transform"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 size={10} className="text-[#A8452B]" />
                      ) : (
                        <Minus size={10} className="text-[#756C5D]" />
                      )}
                    </button>
                    <span className="text-[14px] font-semibold text-[#1C1813] min-w-[14px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      aria-label={`Увеличить количество ${item.name}`}
                      className="w-[26px] h-[26px] rounded-full bg-[#1C1813] flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Plus size={10} className="text-[#F5F0E5]" />
                    </button>
                  </div>
                }
                trailing={
                  <span className="text-[15px] font-bold text-[#1C1813]">
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </span>
                }
              />
            ))}
          </div>
        )}

        {/* Summary */}
        {items.length > 0 && (
          <section className="bg-[#FCFAF4] rounded-[20px] p-[18px] flex flex-col gap-3 shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)]">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#756C5D]">Товары ({itemsCount})</span>
              <span className="text-[14px] font-semibold text-[#1C1813]">
                {subtotal.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#756C5D]">Доставка</span>
              <span className="text-[14px] font-semibold text-[#5F7A60]">
                Бесплатно
              </span>
            </div>
            <div className="w-full h-px bg-[#E6DFCF]" />
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-semibold text-[#1C1813]">Итого</span>
              <span className="font-serif text-[27px] font-semibold text-[#1C1813]">
                {total.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </section>
        )}

        {/* Checkout */}
        {items.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleOrder}
              className="w-full h-[52px] rounded-[14px] bg-[#1C1813] text-[#F5F0E5] text-[15px] font-semibold flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
            >
              <ShoppingBag size={14} />
              <span>Оформить заказ</span>
            </button>
            <span className="text-center text-[12px] text-[#A79C8A]">
              Оплата и доставка — на стороне партнёра
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
