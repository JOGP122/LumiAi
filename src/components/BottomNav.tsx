import React from 'react';
import { Home, Heart, ShoppingBag, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  favoritesCount?: number;
  cartCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  favoritesCount = 0,
  cartCount = 0
}) => {
  return (
    <nav
      aria-label="Нижняя панель навигации"
      className="fixed bottom-0 left-0 right-0 z-40"
    >
      <div className="h-px bg-[#E6DFCF]" />
      <div className="bg-[#F4F0E8] px-7 pt-[13px] pb-4 flex items-center justify-between">
        {/* Вкладка 1: Главная / Рутина */}
        <button
          onClick={() => onSelectTab('home')}
          aria-label="Главная и рутина ухода"
          className="w-[52px] flex flex-col items-center gap-[5px] active:scale-95 transition-transform"
        >
          <Home
            size={21}
            strokeWidth={2}
            className={activeTab === 'home' ? 'text-[#1C1813]' : 'text-[#A79C8A]'}
          />
          <span
            className={`w-1 h-1 rounded-full ${
              activeTab === 'home' ? 'bg-[#A87C44]' : 'bg-transparent'
            }`}
          />
        </button>

        {/* Вкладка 2: Избранный уход */}
        <button
          onClick={() => onSelectTab('favorites')}
          aria-label="Избранный уход"
          className="w-[52px] flex flex-col items-center gap-[5px] active:scale-95 transition-transform relative"
        >
          <Heart
            size={21}
            strokeWidth={2}
            className={activeTab === 'favorites' ? 'text-[#1C1813]' : 'text-[#A79C8A]'}
          />
          {favoritesCount > 0 && activeTab !== 'favorites' && (
            <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-[#A87C44]" />
          )}
          <span
            className={`w-1 h-1 rounded-full ${
              activeTab === 'favorites' ? 'bg-[#A87C44]' : 'bg-transparent'
            }`}
          />
        </button>

        {/* Вкладка 3: Корзина */}
        <button
          onClick={() => onSelectTab('cart')}
          aria-label="Корзина ухода"
          className="w-[52px] flex flex-col items-center gap-[5px] active:scale-95 transition-transform relative"
        >
          <ShoppingBag
            size={21}
            strokeWidth={2}
            className={activeTab === 'cart' ? 'text-[#1C1813]' : 'text-[#A79C8A]'}
          />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#A87C44] text-[#F5F0E5] text-[9.5px] font-bold flex items-center justify-center leading-none">
              {cartCount}
            </span>
          )}
          <span
            className={`w-1 h-1 rounded-full ${
              activeTab === 'cart' ? 'bg-[#A87C44]' : 'bg-transparent'
            }`}
          />
        </button>

        {/* Вкладка 4: Профиль */}
        <button
          onClick={() => onSelectTab('profile')}
          aria-label="Профиль"
          className="w-[52px] flex flex-col items-center gap-[5px] active:scale-95 transition-transform"
        >
          <User
            size={21}
            strokeWidth={2}
            className={activeTab === 'profile' ? 'text-[#1C1813]' : 'text-[#A79C8A]'}
          />
          <span
            className={`w-1 h-1 rounded-full ${
              activeTab === 'profile' ? 'bg-[#A87C44]' : 'bg-transparent'
            }`}
          />
        </button>
      </div>
    </nav>
  );
};
