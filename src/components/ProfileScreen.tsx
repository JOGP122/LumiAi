import React, { useState, useRef } from 'react';
import {
  Flame,
  Settings,
  ChevronRight,
  ChevronDown,
  ScanFace,
  PiggyBank,
  Medal,
  Bell,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  AtSign,
  Sparkles,
  Upload,
  Bot,
  Smile
} from 'lucide-react';
import {
  UserSkinProfile,
  ScanHistoryItem,
  TelegramBotConfig,
  AvatarMode
} from '../types';
import { getGenderCopy } from '../utils/skincare';
import { UserAvatar } from './UserAvatar';

interface ProfileScreenProps {
  userProfile: UserSkinProfile;
  scanHistory: ScanHistoryItem[];
  onStartScan: () => void;
  onStartOnboarding: () => void;
  onResetProfile: () => void;
  onUpdateAvatar: (mode: AvatarMode, customUrl?: string) => void;
  botConfig: TelegramBotConfig;
  onUpdateBotConfig: (config: TelegramBotConfig) => void;
  onNotify: (msg: string) => void;
}

const CARD =
  'bg-[#FCFAF4] rounded-[20px] shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)]';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  scanHistory,
  onStartScan,
  onStartOnboarding,
  onResetProfile,
  onUpdateAvatar,
  botConfig,
  onUpdateBotConfig,
  onNotify
}) => {
  const [isBotPanelOpen, setIsBotPanelOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('botpanel') === '1';
    }
    return false;
  });
  const [tokenInput, setTokenInput] = useState<string>(botConfig.botToken || '');
  const [usernameInput, setUsernameInput] = useState<string>(
    botConfig.botUsername || 'LumiSkinConciergeBot'
  );
  const [chatIdInput, setChatIdInput] = useState<string>(() => {
    const tgUserId =
      typeof window !== 'undefined'
        ? (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id
        : undefined;
    return tgUserId ? String(tgUserId) : botConfig.testChatId || '';
  });

  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [botStatusMessage, setBotStatusMessage] = useState<string | null>(null);
  const [botErrorMessage, setBotErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const copy = getGenderCopy(userProfile.gender);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateAvatar('custom', reader.result as string);
      onNotify('Фото профиля обновлено ✨');
    };
    reader.readAsDataURL(file);
  };

  const handleActivateBot = async () => {
    setBotErrorMessage(null);
    setBotStatusMessage(null);

    if (!tokenInput.trim()) {
      setBotErrorMessage('Вставьте BOT_TOKEN от @BotFather для активации.');
      return;
    }

    setIsActivating(true);
    try {
      const appUrl =
        typeof window !== 'undefined' ? window.location.origin : undefined;

      const response = await fetch('/api/telegram/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: tokenInput.trim(),
          botUsername: usernameInput.trim().replace(/^@/, ''),
          testChatId: chatIdInput.trim(),
          appUrl
        })
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Не удалось активировать логику бота');
      }

      const updatedConfig: TelegramBotConfig = {
        botToken: tokenInput.trim(),
        botUsername: data.botUsername || usernameInput.trim().replace(/^@/, ''),
        testChatId: chatIdInput.trim(),
        webhookActive: Boolean(data.webhookActive),
        webhookUrl: data.webhookUrl,
        lastActivatedAt: data.lastActivatedAt
      };

      onUpdateBotConfig(updatedConfig);
      setBotStatusMessage(
        data.webhookActive
          ? `Webhook активен на ${data.webhookUrl || 'Cloud Run'}! Меню Mini App и авто-ответ на /start настроены.`
          : 'Dev-режим активен без публичного webhook.'
      );
    } catch (err: any) {
      setBotErrorMessage(err?.message || 'Ошибка сети при настройке webhook');
    } finally {
      setIsActivating(false);
    }
  };

  const handleSendTestReport = async () => {
    setBotErrorMessage(null);
    setBotStatusMessage(null);

    if (!tokenInput.trim() || !chatIdInput.trim()) {
      setBotErrorMessage('Сначала заполните BOT_TOKEN и Telegram ID.');
      return;
    }

    setIsSendingTest(true);
    try {
      const tgUserId =
        typeof window !== 'undefined'
          ? (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id
          : undefined;
      const targetChat =
        chatIdInput.trim() || (tgUserId ? String(tgUserId) : '');

      const response = await fetch('/api/telegram/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: tokenInput.trim() || botConfig.botToken,
          chatId: targetChat,
          skinScore: userProfile.healthIndex ?? 80,
          appUrl: typeof window !== 'undefined' ? window.location.origin : undefined
        })
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(
          data.reason || data.error || 'Не удалось отправить отчет в чат'
        );
      }

      setBotStatusMessage('AI-отчет успешно отправлен в ваш личный чат с ботом!');
      onNotify('Отчет отправлен в Telegram чат 📋');
    } catch (err: any) {
      setBotErrorMessage(err?.message || 'Ошибка при отправке сообщения');
    } finally {
      setIsSendingTest(false);
    }
  };

  const behaviorSummary = userProfile.onboarding?.skinBehaviorUnknown
    ? 'Не знаю (определим по фото)'
    : userProfile.onboarding?.skinBehavior?.length
    ? userProfile.onboarding.skinBehavior.join(', ')
    : 'Не указано';

  const goalsSummary = userProfile.onboarding?.goals?.length
    ? userProfile.onboarding.goals.join(', ')
    : 'Базовый уход';

  const avatarModes: { mode: AvatarMode; label: string; icon?: React.ReactNode }[] = [
    { mode: 'initials', label: 'Инициалы' },
    { mode: 'custom', label: 'Своё фото', icon: <Upload size={12} /> },
    { mode: 'telegram', label: 'Из Telegram', icon: <Send size={11} /> }
  ];

  const surveyRows = [
    { label: 'Поведение кожи днём', value: behaviorSummary },
    { label: 'Задачи', value: goalsSummary },
    {
      label: 'Текущий арсенал',
      value: userProfile.onboarding?.currentArsenal || 'С нуля'
    },
    {
      label: 'Бюджет на средство',
      value: userProfile.onboarding?.budget || '1 000 – 2 500 ₽'
    }
  ];

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F4F0E8] pb-32 select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
        aria-label="Загрузить фото аватара"
      />

      <div className="flex flex-col gap-5 px-5 pt-6 flex-1">
        {/* Header: Cormorant title + round icon actions */}
        <header className="flex items-center justify-between">
          <h1 className="font-serif text-[30px] font-medium leading-[34px] text-[#1C1813]">
            Профиль
          </h1>
          <div className="flex gap-2.5">
            <button
              type="button"
              aria-label="Уведомления ухода"
              className="w-10 h-10 rounded-full border border-[#E6DFCF] bg-[#FCFAF4] flex items-center justify-center active:scale-95 transition-transform"
            >
              <Bell size={15} className="text-[#756C5D]" />
            </button>
            <button
              type="button"
              onClick={onStartOnboarding}
              aria-label="Настройки анкеты"
              className="w-10 h-10 rounded-full border border-[#E6DFCF] bg-[#FCFAF4] flex items-center justify-center active:scale-95 transition-transform"
            >
              <Settings size={15} className="text-[#756C5D]" />
            </button>
          </div>
        </header>

        {/* User card */}
        <section className={`${CARD} p-[18px] flex flex-col gap-3.5`}>
          <div className="flex items-center gap-3.5">
            <UserAvatar
              name={userProfile.name}
              avatarMode={userProfile.avatarMode}
              telegramPhotoUrl={userProfile.telegramPhotoUrl}
              customAvatarUrl={userProfile.customAvatarUrl}
              size="lg"
              showOnlineBadge
            />
            <div className="flex flex-col gap-1 min-w-0">
              <h2 className="text-[17px] font-bold text-[#1C1813] truncate">
                {userProfile.name}
              </h2>
              <span className="text-[12px] text-[#756C5D]">
                Кожа: <span className="text-[#1C1813]">{userProfile.skinType}</span>
              </span>
            </div>
          </div>

          {/* Chip */}
          <div className="h-[30px] px-3 rounded-full bg-[#F0E6D1] inline-flex items-center gap-[7px] self-start">
            <Medal size={11} className="text-[#84622F]" />
            <span className="text-[12px] font-semibold text-[#84622F]">
              {copy.genderLabel} • {userProfile.ageGroup}
            </span>
          </div>

          <div className="w-full h-px bg-[#E6DFCF]" />

          {/* Avatar source segment */}
          <div className="h-9 rounded-full bg-[#ECE5D7] p-[3px] flex gap-0.5">
            {avatarModes.map(({ mode, label, icon }) => {
              const active = userProfile.avatarMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() =>
                    mode === 'custom'
                      ? fileInputRef.current?.click()
                      : onUpdateAvatar(mode)
                  }
                  className={`flex-1 h-full rounded-full flex items-center justify-center gap-1.5 text-[12px] transition-all ${
                    active
                      ? 'bg-[#FCFAF4] font-semibold text-[#1C1813] shadow-sm'
                      : 'font-medium text-[#756C5D] active:text-[#1C1813]'
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Stats tiles */}
        <section className="flex gap-3">
          <div className={`${CARD} rounded-[16px] flex-1 p-4 flex flex-col gap-1.5`}>
            <Smile size={14} className="text-[#84622F]" />
            <span className="font-serif text-[30px] font-semibold leading-[32px] text-[#1C1813]">
              {userProfile.completedScans}
            </span>
            <span className="text-[11.5px] leading-[15px] text-[#756C5D]">
              {copy.passedVerb.toLowerCase()} анализов
            </span>
          </div>
          <div className={`${CARD} rounded-[16px] flex-1 p-4 flex flex-col gap-1.5`}>
            <PiggyBank size={14} className="text-[#5F7A60]" />
            <span className="font-serif text-[30px] font-semibold leading-[32px] text-[#1C1813]">
              {userProfile.budgetSaved.toLocaleString('ru-RU')} ₽
            </span>
            <span className="text-[11.5px] leading-[15px] text-[#756C5D]">
              экономия на лишних банках
            </span>
          </div>
        </section>

        {/* Streak — dark card */}
        <section className="bg-[#1C1813] rounded-[20px] p-4 flex items-center gap-3.5 shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)]">
          <div className="w-11 h-11 rounded-[12px] bg-[#322B22] flex items-center justify-center shrink-0">
            <Flame size={17} className="text-[#D97B52]" />
          </div>
          <div className="flex flex-col gap-[3px] flex-1 min-w-0">
            <span className="text-[15px] font-semibold text-[#F5F0E5]">Стрик ухода</span>
            <span className="text-[12px] leading-[16px] text-[#B4A993]">
              {userProfile.streakDays > 0
                ? 'Отличная регулярность выполнения рутины!'
                : 'Сделай первый AI-скан, чтобы начать отсчёт'}
            </span>
          </div>
          <span className="font-serif text-[24px] font-semibold text-[#F5F0E5] shrink-0">
            {userProfile.streakDays} дн.
          </span>
        </section>

        {/* Survey card */}
        <section className={`${CARD} p-[18px] flex flex-col gap-3`}>
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#1C1813]">Анкета кожи</h3>
            <button
              type="button"
              onClick={onStartOnboarding}
              className="text-[13px] font-semibold text-[#A87C44] active:opacity-70 flex items-center gap-1"
            >
              <RefreshCw size={12} />
              Изменить
            </button>
          </div>
          {surveyRows.map((row, i) => (
            <React.Fragment key={row.label}>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11.5px] text-[#A79C8A]">{row.label}</span>
                <span className="text-[13.5px] leading-[19px] text-[#1C1813]">
                  {row.value}
                </span>
              </div>
              {i < surveyRows.length - 1 && <div className="w-full h-px bg-[#E6DFCF]" />}
            </React.Fragment>
          ))}
        </section>

        {/* History */}
        <section aria-label="История сканирований">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold text-[#1C1813]">
              История сканирований
            </h3>
            <button
              type="button"
              onClick={onStartScan}
              className="text-[13px] font-semibold text-[#A87C44] active:opacity-70"
            >
              + Новый анализ
            </button>
          </div>

          {scanHistory.length === 0 ? (
            <div className="bg-[#ECE5D7] rounded-[16px] px-5 py-[18px] text-center">
              <span className="text-[13px] leading-[18px] text-[#756C5D]">
                Пока пусто — проведи первый AI-скан кожи
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {scanHistory.map((item) => (
                <div
                  key={item.id}
                  className={`${CARD} rounded-[18px] p-3 flex items-center gap-3`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#E8EFE4] text-[#3E5A3F] font-bold text-[13px] flex items-center justify-center shrink-0">
                    {item.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[12.5px] font-semibold text-[#1C1813]">
                      {item.date}
                    </h4>
                    <p className="text-[11px] text-[#756C5D]">
                      {item.zone} • {item.tag}
                    </p>
                  </div>
                  <ChevronRight size={15} className="text-[#A79C8A] shrink-0" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA + reset */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onStartScan}
            className="w-full h-[52px] rounded-[14px] bg-[#1C1813] text-[#F5F0E5] text-[15px] font-semibold flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
          >
            <ScanFace size={15} />
            <span>Запустить AI-скан кожи</span>
          </button>

          <button
            type="button"
            onClick={onResetProfile}
            className="self-center text-[13px] font-semibold text-[#A8452B] py-1 active:opacity-70"
          >
            Сбросить профиль и начать заново
          </button>
        </div>

        {/* Telegram bot panel */}
        <section
          aria-label="Настройка Telegram-бота"
          className={`${CARD} overflow-hidden`}
        >
          <button
            type="button"
            onClick={() => setIsBotPanelOpen((prev) => !prev)}
            className="w-full p-4 flex items-center justify-between gap-2 text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-[12px] bg-[#2AABEE]/10 text-[#2AABEE] flex items-center justify-center shrink-0">
                <Bot size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[13.5px] font-semibold text-[#1C1813] whitespace-nowrap">
                    Настройка Telegram-бота
                  </h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                      botConfig.webhookActive
                        ? 'bg-[#E8EFE4] text-[#3E5A3F]'
                        : 'bg-[#F0E6D1] text-[#84622F]'
                    }`}
                  >
                    {botConfig.webhookActive ? 'Webhook активен' : 'Dev-режим'}
                  </span>
                </div>
                <p className="text-[11px] text-[#756C5D] mt-0.5 truncate">
                  Авто-ответ на /start, кнопка Mini App и отчеты в чат
                </p>
              </div>
            </div>
            <ChevronDown
              size={17}
              className={`text-[#756C5D] shrink-0 transition-transform duration-200 ${
                isBotPanelOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isBotPanelOpen && (
            <div className="px-4 pb-4 pt-1 border-t border-[#E6DFCF] flex flex-col gap-3">
              <p className="text-[11.5px] text-[#756C5D] leading-relaxed">
                Подключите токен от <span className="font-semibold text-[#1C1813]">@BotFather</span>.
                Сервер зарегистрирует <span className="font-semibold">setWebhook</span>, описание
                и кнопку меню Mini App.
              </p>

              <div>
                <label
                  htmlFor="bot-token-input"
                  className="block text-[11px] font-semibold text-[#1C1813] mb-1"
                >
                  BOT_TOKEN от @BotFather
                </label>
                <div className="flex items-center gap-2 bg-[#ECE5D7]/50 rounded-[12px] px-3 py-2.5 border border-[#E6DFCF]">
                  <KeyRound size={14} className="text-[#A87C44] shrink-0" />
                  <input
                    id="bot-token-input"
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="1234567890:AAH_ваш_токен..."
                    className="w-full bg-transparent text-[12.5px] font-medium text-[#1C1813] placeholder:text-[#A79C8A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="bot-username-input"
                    className="block text-[11px] font-semibold text-[#1C1813] mb-1"
                  >
                    @username бота
                  </label>
                  <div className="flex items-center gap-1.5 bg-[#ECE5D7]/50 rounded-[12px] px-3 py-2.5 border border-[#E6DFCF]">
                    <AtSign size={13} className="text-[#756C5D] shrink-0" />
                    <input
                      id="bot-username-input"
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="LumiSkinConciergeBot"
                      className="w-full bg-transparent text-[12.5px] font-medium text-[#1C1813] placeholder:text-[#A79C8A] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="bot-chatid-input"
                    className="block text-[11px] font-semibold text-[#1C1813] mb-1"
                  >
                    Ваш Telegram ID
                  </label>
                  <div className="flex items-center gap-1.5 bg-[#ECE5D7]/50 rounded-[12px] px-3 py-2.5 border border-[#E6DFCF]">
                    <Send size={12} className="text-[#756C5D] shrink-0" />
                    <input
                      id="bot-chatid-input"
                      type="text"
                      value={chatIdInput}
                      onChange={(e) => setChatIdInput(e.target.value)}
                      placeholder="Из initDataUnsafe или вручную"
                      className="w-full bg-transparent text-[12.5px] font-medium text-[#1C1813] placeholder:text-[#A79C8A] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {botStatusMessage && (
                <div className="p-3 rounded-[14px] bg-[#E8EFE4] text-[#3E5A3F] text-[11.5px] flex items-start gap-2">
                  <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                  <span>{botStatusMessage}</span>
                </div>
              )}
              {botErrorMessage && (
                <div className="p-3 rounded-[14px] bg-[#F5E3DA] text-[#A8452B] text-[11.5px] flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{botErrorMessage}</span>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  disabled={isActivating}
                  onClick={handleActivateBot}
                  className="w-full h-[48px] rounded-[14px] bg-[#1C1813] text-[#F5F0E5] text-[13px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-40"
                >
                  <Sparkles size={14} className="text-[#CDA872]" />
                  <span>
                    {isActivating ? 'Регистрация Webhook...' : 'Активировать логику бота'}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={isSendingTest}
                  onClick={handleSendTestReport}
                  className="w-full h-[44px] rounded-[14px] bg-transparent border border-[#E6DFCF] text-[#1C1813] text-[12.5px] font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  <Send size={12} className="text-[#2AABEE]" />
                  <span>
                    {isSendingTest ? 'Отправка...' : 'Отправить тестовый отчёт в чат'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
