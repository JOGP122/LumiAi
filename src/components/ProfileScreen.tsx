import React, { useState, useRef } from 'react';
import {
  Flame,
  Settings,
  ChevronRight,
  ChevronDown,
  ScanFace,
  PiggyBank,
  Award,
  Bell,
  RefreshCw,
  ClipboardList,
  Bot,
  Send,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  AtSign,
  Sparkles,
  Upload,
  Trash2
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

      setUsernameInput(updatedConfig.botUsername);
      onUpdateBotConfig(updatedConfig);
      setBotStatusMessage(
        `Бот @${updatedConfig.botUsername} активирован! Webhook, описание и кнопка Mini App успешно установлены.`
      );
      onNotify(`Логика бота @${updatedConfig.botUsername} активирована ✨`);
    } catch (err: any) {
      setBotErrorMessage(err?.message || 'Ошибка соединения с Telegram Bot API');
    } finally {
      setIsActivating(false);
    }
  };

  const handleSendTestReport = async () => {
    setBotErrorMessage(null);
    setBotStatusMessage(null);

    if (!tokenInput.trim() && !botConfig.botToken) {
      setBotErrorMessage('Сначала укажите BOT_TOKEN от @BotFather.');
      return;
    }

    setIsSendingTest(true);
    try {
      const tgUserId =
        typeof window !== 'undefined'
          ? (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id
          : undefined;
      const targetChat = tgUserId ? String(tgUserId) : chatIdInput.trim();

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

  return (
    <div className="flex flex-col flex-1 pb-32 pt-4 px-4 sm:px-5 select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
        aria-label="Загрузить фото аватара"
      />

      {/* Top Header */}
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-[22px] font-bold tracking-tight text-[#1C1813] leading-tight">
          Мой профиль
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Уведомления ухода"
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1C1813] shadow-xs border border-[#ECE5D7] active:scale-90 transition-transform"
          >
            <Bell size={17} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={onStartOnboarding}
            aria-label="Настройки анкеты"
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1C1813] shadow-xs border border-[#ECE5D7] active:scale-90 transition-transform"
          >
            <Settings size={17} strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* User Hero Card + Avatar Switcher (No stock photos) */}
      <div className="bg-white rounded-[26px] p-4 border border-[#ECE5D7] shadow-[0_6px_22px_rgba(30,27,24,0.03)] mb-4">
        <div className="flex items-center gap-3.5">
          <UserAvatar
            name={userProfile.name}
            avatarMode={userProfile.avatarMode}
            telegramPhotoUrl={userProfile.telegramPhotoUrl}
            customAvatarUrl={userProfile.customAvatarUrl}
            size="lg"
            showOnlineBadge
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-[17px] font-bold text-[#1C1813]">
                {userProfile.name}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-800 text-[10.5px] font-bold">
                <Award size={12} className="text-amber-600" />
                {copy.genderLabel} • {userProfile.ageGroup}
              </span>
            </div>

            <p className="text-[12px] text-[#786F67] mt-1">
              Кожа:{' '}
              <span className="font-semibold text-[#1C1813]">
                {userProfile.skinType}
              </span>
            </p>
          </div>
        </div>

        {/* Avatar Quick Switcher */}
        <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-[#F8F4EE]">
          <button
            type="button"
            onClick={() => onUpdateAvatar('initials')}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1 ${
              userProfile.avatarMode === 'initials'
                ? 'bg-[#F0E6D1]/80 border-[#A87C44] text-[#1C1813]'
                : 'bg-[#FBF8F5] border-[#EBE4DD] text-[#786F67]'
            }`}
          >
            <span>Инициалы</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1 ${
              userProfile.avatarMode === 'custom'
                ? 'bg-[#F0E6D1]/80 border-[#A87C44] text-[#1C1813]'
                : 'bg-[#FBF8F5] border-[#EBE4DD] text-[#786F67]'
            }`}
          >
            <Upload size={12} />
            <span>Свое фото</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateAvatar('telegram')}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1 ${
              userProfile.avatarMode === 'telegram'
                ? 'bg-[#F0E6D1]/80 border-[#A87C44] text-[#1C1813]'
                : 'bg-[#FBF8F5] border-[#EBE4DD] text-[#786F67]'
            }`}
          >
            <Send size={11} />
            <span>Фото из ТГ</span>
          </button>
        </div>
      </div>

      {/* Onboarding Questionnaire Summary Card */}
      <div className="bg-white rounded-[24px] p-4 border border-[#ECE5D7] shadow-xs mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <ClipboardList size={15} className="text-[#A87C44]" />
            <h3 className="text-[13.5px] font-bold text-[#1C1813]">
              Анкета кожи и предпочтений
            </h3>
          </div>
          <button
            type="button"
            onClick={onStartOnboarding}
            aria-label="Изменить анкету"
            className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#A87C44] hover:underline"
          >
            <RefreshCw size={12} />
            <span>Изменить ответы</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 text-[11.5px]">
          <div className="bg-[#FBF8F5] rounded-xl p-2.5 border border-[#ECE5D7]">
            <span className="text-[#756C5D] block text-[10px]">
              Поведение кожи в течение дня:
            </span>
            <span className="font-bold text-[#1C1813]">{behaviorSummary}</span>
          </div>
          <div className="bg-[#FBF8F5] rounded-xl p-2.5 border border-[#ECE5D7]">
            <span className="text-[#756C5D] block text-[10px]">Выбранные задачи:</span>
            <span className="font-bold text-[#1C1813]">{goalsSummary}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#FBF8F5] rounded-xl p-2.5 border border-[#ECE5D7]">
              <span className="text-[#756C5D] block text-[10px]">Текущий арсенал:</span>
              <span className="font-bold text-[#1C1813] line-clamp-2">
                {userProfile.onboarding?.currentArsenal || 'С нуля'}
              </span>
            </div>
            <div className="bg-[#FBF8F5] rounded-xl p-2.5 border border-[#ECE5D7]">
              <span className="text-[#756C5D] block text-[10px]">Бюджет на средство:</span>
              <span className="font-bold text-[#1C1813]">
                {userProfile.onboarding?.budget || '1 000 – 2 500 ₽'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights & Statistics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-[22px] p-3.5 border border-[#ECE5D7] shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-full bg-[#F4F0E8] flex items-center justify-center text-[#1C1813] mb-2">
            <ScanFace size={16} />
          </div>
          <div>
            <div className="text-[20px] font-extrabold text-[#1C1813]">
              {userProfile.completedScans}
            </div>
            <div className="text-[11px] font-bold text-[#756C5D]">
              {copy.passedVerb.toLowerCase()} анализов
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[22px] p-3.5 border border-[#ECE5D7] shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <PiggyBank size={16} />
          </div>
          <div>
            <div className="text-[20px] font-extrabold text-emerald-600">
              {userProfile.budgetSaved.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-[11px] font-bold text-[#756C5D] leading-tight">
              экономия на лишних банках
            </div>
          </div>
        </div>
      </div>

      {/* Routine Streak Banner */}
      <div className="bg-gradient-to-r from-[#F0E6D1]/80 to-[#FCEBE6] rounded-[24px] p-4 border border-[#F6DBD2] flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#A87C44]">
            <Flame size={22} className="fill-[#A87C44]" />
          </div>
          <div>
            <div className="text-[14px] font-bold text-[#1C1813]">
              Стрик ухода: {userProfile.streakDays} дней
            </div>
            <p className="text-[11.5px] text-[#786F67] mt-0.5">
              {userProfile.streakDays > 0
                ? 'Отличная регулярность выполнения рутины!'
                : 'Сделай первый AI-скан, чтобы начать отсчет стрика'}
            </p>
          </div>
        </div>
      </div>

      {/* Scan History Section */}
      <section className="mb-5" aria-label="История сканирований">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[14px] font-bold text-[#1C1813]">
            История сканирований кожи
          </h3>
          <button
            type="button"
            onClick={onStartScan}
            aria-label="Новое сканирование"
            className="text-[12px] font-bold text-[#A87C44] hover:underline"
          >
            + Новый анализ
          </button>
        </div>

        {scanHistory.length === 0 ? (
          <div className="bg-white rounded-[20px] p-4 border border-[#ECE5D7] text-center text-[12px] text-[#756C5D]">
            История сканирований пока пуста. Проведи свой первый AI-скан!
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {scanHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[20px] p-3 border border-[#ECE5D7] shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[13px] flex items-center justify-center border border-emerald-200">
                    {item.score}
                  </div>
                  <div>
                    <h4 className="text-[12.5px] font-bold text-[#1C1813]">
                      {item.date}
                    </h4>
                    <p className="text-[11px] text-[#756C5D]">
                      {item.zone} • <span className="text-[#786F67]">{item.tag}</span>
                    </p>
                  </div>
                </div>

                <ChevronRight size={16} className="text-[#756C5D]" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI Re-Scan & Reset Profile Buttons */}
      <div className="flex flex-col gap-2.5 mb-6">
        <button
          type="button"
          onClick={onStartScan}
          aria-label="Запустить AI-диагностику лица"
          className="w-full py-3.5 px-4 rounded-full bg-[#A87C44] text-white text-[13.5px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(168,124,68,0.3)] hover:bg-[#e5604d] active:scale-[0.98] transition-all"
        >
          <ScanFace size={17} strokeWidth={2.2} />
          <span>Запустить AI-скан кожи</span>
        </button>

        <button
          type="button"
          onClick={onResetProfile}
          aria-label="Сбросить профиль и начать заново"
          className="w-full py-3.5 px-4 rounded-full bg-white border border-red-200 text-red-600 text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-red-50 active:scale-[0.98] transition-all shadow-xs"
        >
          <Trash2 size={15} />
          <span>Сбросить профиль и начать заново</span>
        </button>
      </div>

      {/* Developer Mode: Telegram Bot Configuration Panel */}
      <section
        aria-label="Настройка Telegram-бота"
        className="bg-white rounded-[26px] border border-[#ECE5D7] shadow-[0_6px_22px_rgba(30,27,24,0.03)] overflow-hidden"
      >
        <button
          type="button"
          onClick={() => setIsBotPanelOpen((prev) => !prev)}
          className="w-full p-4 flex items-center justify-between gap-2 text-left hover:bg-[#FBF8F5]/60 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-[#2AABEE]/10 text-[#2AABEE] flex items-center justify-center shrink-0">
              <Bot size={19} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[13.5px] font-bold text-[#1C1813] whitespace-nowrap">
                  Настройка Telegram-бота
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                    botConfig.webhookActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#F0E6D1]/70 text-[#D95B49]'
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
            size={18}
            className={`text-[#756C5D] shrink-0 transition-transform duration-200 ${
              isBotPanelOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isBotPanelOpen && (
          <div className="px-4 pb-4 pt-1 border-t border-[#F8F4EE] flex flex-col gap-3">
            <p className="text-[11.5px] text-[#786F67] leading-relaxed">
              Подключите токен от <span className="font-bold text-[#1C1813]">@BotFather</span>.
              Сервер автоматически зарегистрирует <span className="font-semibold">setWebhook</span> на
              текущий домен Cloud Run, пропишет описание (<span className="font-semibold">setMyDescription</span>) и
              кнопку меню (<span className="font-semibold">setChatMenuButton</span>).
            </p>

            {/* BOT_TOKEN Input */}
            <div>
              <label
                htmlFor="bot-token-input"
                className="block text-[11px] font-bold text-[#1C1813] mb-1"
              >
                BOT_TOKEN от @BotFather
              </label>
              <div className="flex items-center gap-2 bg-[#FBF8F5] rounded-2xl px-3 py-2.5 border border-[#EBE4DD]">
                <KeyRound size={15} className="text-[#A87C44] shrink-0" />
                <input
                  id="bot-token-input"
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="1234567890:AAH_ваш_токен_от_BotFather..."
                  className="w-full bg-transparent text-[12.5px] font-medium text-[#1C1813] placeholder:text-[#756C5D] focus:outline-none"
                />
              </div>
            </div>

            {/* @username and Chat ID row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label
                  htmlFor="bot-username-input"
                  className="block text-[11px] font-bold text-[#1C1813] mb-1"
                >
                  @username бота
                </label>
                <div className="flex items-center gap-1.5 bg-[#FBF8F5] rounded-2xl px-3 py-2.5 border border-[#EBE4DD]">
                  <AtSign size={14} className="text-[#756C5D] shrink-0" />
                  <input
                    id="bot-username-input"
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="LumiSkinConciergeBot"
                    className="w-full bg-transparent text-[12.5px] font-medium text-[#1C1813] placeholder:text-[#756C5D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="bot-chatid-input"
                  className="block text-[11px] font-bold text-[#1C1813] mb-1"
                >
                  Ваш Telegram ID (для отчетов)
                </label>
                <div className="flex items-center gap-1.5 bg-[#FBF8F5] rounded-2xl px-3 py-2.5 border border-[#EBE4DD]">
                  <Send size={13} className="text-[#756C5D] shrink-0" />
                  <input
                    id="bot-chatid-input"
                    type="text"
                    value={chatIdInput}
                    onChange={(e) => setChatIdInput(e.target.value)}
                    placeholder="Из initDataUnsafe или вручную"
                    className="w-full bg-transparent text-[12.5px] font-medium text-[#1C1813] placeholder:text-[#756C5D] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Status / Error Feedback */}
            {botStatusMessage && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11.5px] flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{botStatusMessage}</span>
              </div>
            )}

            {botErrorMessage && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-[11.5px] flex items-start gap-2">
                <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
                <span>{botErrorMessage}</span>
              </div>
            )}

            {/* Activate Webhook & Bot Profile CTA */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                disabled={isActivating}
                onClick={handleActivateBot}
                className="w-full py-3 px-4 rounded-full bg-[#1C1813] text-white text-[12.5px] font-bold flex items-center justify-center gap-2 hover:bg-[#332E2A] active:scale-[0.98] transition-all disabled:opacity-60"
              >
                <Sparkles size={15} className="text-[#A87C44]" />
                <span>
                  {isActivating
                    ? 'Регистрация Webhook и меню...'
                    : 'Активировать логику бота'}
                </span>
              </button>

              <button
                type="button"
                disabled={isSendingTest}
                onClick={handleSendTestReport}
                className="w-full py-2.5 px-4 rounded-full bg-[#FBF8F5] border border-[#EBE4DD] text-[#1C1813] text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#F3ECE4] active:scale-[0.98] transition-all disabled:opacity-60"
              >
                <Send size={13} className="text-[#2AABEE]" />
                <span>
                  {isSendingTest
                    ? 'Отправка в Telegram...'
                    : 'Отправить тестовый AI-отчет в чат'}
                </span>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
