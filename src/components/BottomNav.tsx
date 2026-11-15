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
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-[370px]"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-full px-5 py-2.5 shadow-[0_12px_32px_rgba(30,27,24,0.12)] border border-[#ECE5D7] flex items-center justify-between transition-all duration-300">
        {/* Вкладка 1: Главная / Рутина */}
        <button
          onClick={() => onSelectTab('home')}
          aria-label="Главная и рутина ухода"
          className={`relative p-2.5 rounded-full flex flex-col items-center transition-all duration-200 ${
            activeTab === 'home'
              ? 'text-[#A87C44] scale-105'
              : 'text-[#756C5D] hover:text-[#1C1813]'
          }`}
        >
          <Home
            size={22}
            strokeWidth={activeTab === 'home' ? 2.5 : 1.8}
            className={activeTab === 'home' ? 'fill-[#A87C44]/15' : ''}
          />
          {activeTab === 'home' && (
            <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#A87C44]" />
          )}
        </button>

        {/* Вкладка 2: Избранный уход */}
        <button
          onClick={() => onSelectTab('favorites')}
          aria-label="Избранный уход"
          className={`relative p-2.5 rounded-full flex flex-col items-center transition-all duration-200 ${
            activeTab === 'favorites'
              ? 'text-[#A87C44] scale-105'
              : 'text-[#756C5D] hover:text-[#1C1813]'
          }`}
        >
          <Heart
            size={22}
            strokeWidth={activeTab === 'favorites' ? 2.5 : 1.8}
            className={activeTab === 'favorites' ? 'fill-[#A87C44]' : ''}
          />
          {favoritesCount > 0 && activeTab !== 'favorites' && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#A87C44]" />
          )}
          {activeTab === 'favorites' && (
            <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#A87C44]" />
          )}
        </button>

        {/* Вкладка 3: Корзина */}
        <button
          onClick={() => onSelectTab('cart')}
          aria-label="Корзина ухода"
          className={`relative p-2.5 rounded-full flex flex-col items-center transition-all duration-200 ${
            activeTab === 'cart'
              ? 'text-[#A87C44] scale-105'
              : 'text-[#756C5D] hover:text-[#1C1813]'
          }`}
        >
          <ShoppingBag
            size={22}
            strokeWidth={activeTab === 'cart' ? 2.5 : 1.8}
            className={activeTab === 'cart' ? 'fill-[#A87C44]/15' : ''}
          />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-[#A87C44] text-white text-[9.5px] font-bold flex items-center justify-center leading-none">
              {cartCount}
            </span>
          )}
          {activeTab === 'cart' && (
            <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#A87C44]" />
          )}
        </button>

        {/* Вкладка 4: Профиль */}
        <button
          onClick={() => onSelectTab('profile')}
          aria-label="Профиль Ани"
          className={`relative p-2.5 rounded-full flex flex-col items-center transition-all duration-200 ${
            activeTab === 'profile'
              ? 'text-[#A87C44] scale-105'
              : 'text-[#756C5D] hover:text-[#1C1813]'
          }`}
        >
          <User
            size={22}
            strokeWidth={activeTab === 'profile' ? 2.5 : 1.8}
            className={activeTab === 'profile' ? 'fill-[#A87C44]/15' : ''}
          />
          {activeTab === 'profile' && (
            <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#A87C44]" />
          )}
        </button>
      </div>
    </nav>
  );
};
