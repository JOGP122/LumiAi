import React, { useEffect } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        enableClosingConfirmation?: () => void;
      };
    };
  }
}

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  useEffect(() => {
    // Initialize official Telegram Mini App WebApp SDK
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        if (window.Telegram.WebApp.setHeaderColor) {
          window.Telegram.WebApp.setHeaderColor('#FBF8F5');
        }
        if (window.Telegram.WebApp.setBackgroundColor) {
          window.Telegram.WebApp.setBackgroundColor('#FBF8F5');
        }
      } catch (err) {
        // Fallback for non-telegram environments
        console.warn('Telegram WebApp initialization notice:', err);
      }
    }
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#F5F2EB] flex justify-center selection:bg-[#F8715E]/20">
      {/* 
        Native-feeling Telegram Mini App container:
        Full height, responsive width (max-w-md), zero fake status-bar artifacts
      */}
      <div className="w-full max-w-md min-h-screen bg-[#FBF8F5] flex flex-col relative text-[#1E1B18] shadow-sm overflow-x-hidden">
        {children}
      </div>
    </div>
  );
};
