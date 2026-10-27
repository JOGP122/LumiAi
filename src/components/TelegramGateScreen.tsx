import React, { useState } from 'react';
import { Send, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import {
  buildTelegramBotDeepLink,
  buildTelegramQrCodeUrl,
  DEFAULT_BOT_USERNAME
} from '../utils/skincare';

interface TelegramGateScreenProps {
  botUsername?: string;
  onEnterPreview: () => void;
}

export const TelegramGateScreen: React.FC<TelegramGateScreenProps> = ({
  botUsername = DEFAULT_BOT_USERNAME,
  onEnterPreview
}) => {
  const [qrLoaded, setQrLoaded] = useState<boolean>(true);
  const cleanUsername =
    botUsername.trim().replace(/^@/, '') || DEFAULT_BOT_USERNAME;
  const botDeepLink = buildTelegramBotDeepLink(cleanUsername);
  const qrImageUrl = buildTelegramQrCodeUrl(botDeepLink);

  return (
    <div className="flex flex-col justify-between min-h-screen bg-[#FBF8F5] px-5 pt-7 pb-6 select-none text-[#1E1B18]">
      {/* Top Brand + Telegram Badge */}
      <div className="flex flex-col items-center text-center">
        {/* Large LUMI Logo + Telegram Icon */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-[#F2ECE5] shadow-[0_8px_24px_rgba(30,27,24,0.04)]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10.5 2C10.5 6.69442 6.69442 10.5 2 10.5C6.69442 10.5 10.5 14.3056 10.5 19C10.5 14.3056 14.3056 10.5 19 10.5C14.3056 10.5 10.5 6.69442 10.5 2Z"
                fill="#1E1B18"
              />
              <path
                d="M20.5 12C20.5 15.0376 18.0376 17.5 15 17.5C18.0376 17.5 20.5 19.9624 20.5 23C20.5 19.9624 22.9624 17.5 26 17.5C22.9624 17.5 20.5 15.0376 20.5 12Z"
                fill="#F8715E"
              />
            </svg>
            <span className="text-[19px] font-extrabold tracking-[0.22em] text-[#1E1B18]">
              LUMI
            </span>
          </div>

          <div
            className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2AABEE] to-[#229ED9] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(42,171,238,0.28)]"
            aria-label="Telegram Mini App"
          >
            <Send size={19} strokeWidth={2.3} className="-translate-x-0.5 translate-y-0.5" />
          </div>
        </div>

        {/* Security Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F8DDD4]/80 border border-[#F3CFC3] text-[#D95B49] text-[11px] font-bold mb-3">
          <ShieldCheck size={13} />
          <span>Защищенный вход через Telegram Mini App</span>
        </div>

        {/* Title */}
        <h1 className="text-[24px] font-extrabold tracking-tight text-[#1E1B18] leading-tight mb-2.5">
          Lumi работает внутри Telegram
        </h1>

        {/* Description */}
        <p className="text-[13px] text-[#786F67] leading-relaxed max-w-[330px]">
          Персональный AI-консьерж по уходу за кожей привязывается к вашему аккаунту
          Telegram для сохранения истории сканирований и защиты данных
        </p>
      </div>

      {/* Center QR Code Card */}
      <div className="my-4 bg-white rounded-[30px] p-5 border border-[#F2ECE5] shadow-[0_12px_32px_rgba(30,27,24,0.04)] flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#F8DDD4]/40 blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-[#F8715E]/10 blur-xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#1E1B18] mb-3">
          <Smartphone size={14} className="text-[#F8715E]" />
          <span>Наведите камеру телефона на QR-код</span>
        </div>

        <div className="relative p-3 rounded-[24px] bg-[#FBF8F5] border-2 border-[#F3E8E2] shadow-inner mb-3">
          {qrLoaded ? (
            <img
              src={qrImageUrl}
              alt={`QR-код для перехода в Telegram-бот @${cleanUsername}`}
              width={184}
              height={184}
              onError={() => setQrLoaded(false)}
              className="w-[184px] h-[184px] rounded-2xl object-contain bg-white p-1.5"
            />
          ) : (
            <div className="w-[184px] h-[184px] rounded-2xl bg-white flex flex-col items-center justify-center p-4 text-center border border-[#F2ECE5]">
              <Send size={32} className="text-[#F8715E] mb-2" />
              <span className="text-[12px] font-bold text-[#1E1B18]">
                @{cleanUsername}
              </span>
              <span className="text-[10.5px] text-[#9B9188] mt-1">
                Откройте по кнопке ниже
              </span>
            </div>
          )}

          {/* Center mini badge on QR */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-9 h-9 rounded-xl bg-white shadow-md border border-[#F2ECE5] flex items-center justify-center">
              <Sparkles size={16} className="text-[#F8715E]" />
            </div>
          </div>
        </div>

        <span className="text-[12px] font-bold text-[#1E1B18] bg-[#FBF8F5] px-3 py-1 rounded-full border border-[#EBE4DD]">
          @{cleanUsername}
        </span>
        <p className="text-[11px] text-[#9B9188] mt-1.5">
          Синхронизация AI-рутины, INCI-сканера и уведомлений в чате
        </p>
      </div>

      {/* Bottom Action Area */}
      <div className="flex flex-col items-center gap-3.5">
        <a
          href={botDeepLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 px-6 rounded-full bg-[#F8715E] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(248,113,94,0.35)] hover:bg-[#e5604d] active:scale-[0.98] transition-all text-center"
        >
          <span>Открыть в Telegram ↗</span>
        </a>

        {/* Developer Preview Bypass Button */}
        <button
          type="button"
          onClick={onEnterPreview}
          className="py-1.5 px-3 text-[11.5px] font-medium text-[#9B9188] hover:text-[#1E1B18] underline decoration-[#9B9188]/50 underline-offset-4 transition-colors cursor-pointer"
        >
          Войти в режиме превью (для тестирования)
        </button>
      </div>
    </div>
  );
};
