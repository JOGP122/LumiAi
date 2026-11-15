import React, { useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../types';
import { calculateCartTotal } from '../utils/skincare';

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

  const handleOrder = () => {
    setIsOrdered(true);
    setTimeout(() => {
      setIsOrdered(false);
    }, 3500);
  };

  return (
    <div className="flex flex-col flex-1 pb-36 pt-4 px-4 sm:px-5 select-none">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-[#1C1813] leading-tight">
            Твой уход в один клик
          </h1>
          <p className="text-[13px] font-normal text-[#756C5D] mt-0.5">
            Прямая корзина в партнерские сети
          </p>
        </div>

        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1C1813] shadow-xs border border-[#ECE5D7]">
          <ShoppingBag size={18} strokeWidth={2} />
        </div>
      </header>

      {/* Success Notification */}
      {isOrdered && (
        <div className="mb-4 p-4 rounded-[22px] bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in shadow-xs">
          <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-[13px] font-bold">Заказ передан в «Золотое Яблоко»!</h4>
            <p className="text-[11.5px] text-emerald-700 mt-0.5">
              Кэшбэк {cashback.toLocaleString('ru-RU')} ₽ зачислен на твою карту лояльности.
            </p>
          </div>
        </div>
      )}

      {/* Partner Store Badges */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11.5px] font-bold text-[#786F67]">Партнеры доставки:</span>
        <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#EBE4DD] text-[11px] font-bold text-[#1C1813]">
          🍏 Золотое Яблоко
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#EBE4DD] text-[11px] font-bold text-[#1C1813]">
          🛍️ Лэтуаль
        </span>
      </div>

      {/* Cart Items List */}
      {items.length === 0 ? (
        <div className="bg-white rounded-[26px] p-8 text-center border border-[#ECE5D7] shadow-xs my-6">
          <ShoppingBag size={40} className="mx-auto text-[#D5CDC5] mb-3" />
          <h3 className="text-[15px] font-bold text-[#1C1813]">Корзина пуста</h3>
          <p className="text-[12px] text-[#756C5D] mt-1">
            Добавь подобранные средства из рутины или избранного
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-5">
          {items.map((item) => {
            const isGoldApple = item.partnerStore === 'Золотое Яблоко';
            return (
              <div
                key={item.id}
                className="bg-white rounded-[22px] p-3.5 border border-[#ECE5D7] shadow-[0_4px_16px_rgba(30,27,24,0.02)] flex items-center justify-between gap-3"
              >
                {/* Image */}
                <div className="w-13 h-13 rounded-[16px] bg-[#F0E6D1] p-1.5 flex items-center justify-center shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80';
                    }}
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isGoldApple
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {item.partnerStore}
                    </span>
                  </div>
                  <h3 className="text-[13px] font-bold text-[#1C1813] truncate mt-1">
                    {item.name}
                  </h3>
                  <div className="text-[12.5px] font-bold text-[#A87C44] mt-0.5">
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                    {item.quantity > 1 && (
                      <span className="text-[10.5px] font-normal text-[#756C5D] ml-1">
                        ({item.price.toLocaleString('ru-RU')} ₽ / шт.)
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 bg-[#F4F0E8] rounded-full p-1 shrink-0">
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    aria-label={`Уменьшить количество ${item.name}`}
                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#1C1813] shadow-xs active:scale-90 transition-transform"
                  >
                    {item.quantity === 1 ? <Trash2 size={12} className="text-red-500" /> : <Minus size={12} />}
                  </button>
                  <span className="text-[12px] font-bold text-[#1C1813] min-w-3 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    aria-label={`Увеличить количество ${item.name}`}
                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#1C1813] shadow-xs active:scale-90 transition-transform"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Summary Card */}
      {items.length > 0 && (
        <div className="bg-white rounded-[24px] p-4 border border-[#ECE5D7] shadow-[0_6px_20px_rgba(30,27,24,0.03)] flex flex-col gap-2.5 mb-5">
          <div className="flex items-center justify-between text-[12.5px] text-[#786F67]">
            <span>Сумма заказа ({items.reduce((a, b) => a + b.quantity, 0)} тов.):</span>
            <span className="font-bold text-[#1C1813]">{subtotal.toLocaleString('ru-RU')} ₽</span>
          </div>

          <div className="flex items-center justify-between text-[12px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
            <span className="flex items-center gap-1 font-semibold">
              <Sparkles size={12} />
              Кэшбэк на карту (5%):
            </span>
            <span className="font-bold">+{cashback.toLocaleString('ru-RU')} ₽</span>
          </div>

          <div className="flex items-center justify-between text-[12.5px] text-[#786F67]">
            <span>Курьерская доставка:</span>
            <span className="font-bold text-emerald-600">Бесплатно</span>
          </div>

          <div className="pt-2 border-t border-[#F8F4EE] flex items-center justify-between">
            <span className="text-[15px] font-bold text-[#1C1813]">Итого к оплате:</span>
            <span className="text-[20px] font-extrabold text-[#1C1813]">
              {total.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      )}

      {/* Main Big CTA Button */}
      {items.length > 0 && (
        <button
          onClick={handleOrder}
          aria-label="Заказать через Золотое Яблоко (кэшбэк 5%)"
          className="w-full py-4 px-5 rounded-full bg-[#A87C44] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(168,124,68,0.35)] hover:bg-[#e4614e] active:scale-[0.98] transition-all"
        >
          <span>Заказать через Золотое Яблоко (кэшбэк 5%)</span>
          <ArrowRight size={17} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};
