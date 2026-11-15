import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  Sparkles,
  ScanFace,
  Flame,
  ShieldCheck,
  Sun,
  Moon,
  Check,
  FlaskConical,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  UserSkinProfile,
  RoutineStep,
  RoutineCompletionByDate
} from '../types';
import {
  calculateRoutineProgress,
  formatDateKey,
  getWeekDays,
  getWeekMonthYearLabel,
  formatRussianDateHeading,
  getRoutineStepsForDate,
  getDayCompletionStatus
} from '../utils/skincare';
import { UserAvatar } from './UserAvatar';

interface HomeScreenProps {
  userProfile: UserSkinProfile;
  onStartScan: () => void;
  onOpenJarScanner: () => void;
  onGenerateRoutineWithoutPhoto: () => void;
  isGeneratingWithoutPhoto?: boolean;
  onOpenProfile?: () => void;
  routineSteps: RoutineStep[];
  completedHistory: RoutineCompletionByDate;
  onToggleRoutineStep: (stepId: string, dateKey: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  onStartScan,
  onOpenJarScanner,
  onGenerateRoutineWithoutPhoto,
  isGeneratingWithoutPhoto = false,
  onOpenProfile,
  routineSteps,
  completedHistory,
  onToggleRoutineStep
}) => {
  const todayDate = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => formatDateKey(todayDate), [todayDate]);

  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  const weekDays = useMemo(
    () => getWeekDays(todayDate, weekOffset),
    [todayDate, weekOffset]
  );

  const monthYearLabel = useMemo(
    () => getWeekMonthYearLabel(weekDays, selectedDateKey),
    [weekDays, selectedDateKey]
  );

  const selectedDateHeading = useMemo(
    () => formatRussianDateHeading(selectedDateKey, todayDate),
    [selectedDateKey, todayDate]
  );

  const isAwayFromToday = weekOffset !== 0 || selectedDateKey !== todayKey;

  const validStepIds = useMemo(
    () => routineSteps.map((s) => s.id),
    [routineSteps]
  );

  const stepsForSelectedDate = useMemo(
    () => getRoutineStepsForDate(routineSteps, completedHistory, selectedDateKey),
    [routineSteps, completedHistory, selectedDateKey]
  );

  const morningSteps = stepsForSelectedDate.filter((s) => s.section === 'morning');
  const eveningSteps = stepsForSelectedDate.filter((s) => s.section === 'evening');

  const { completed, total, percentage } =
    calculateRoutineProgress(stepsForSelectedDate);
  const hasHealthScore = typeof userProfile.healthIndex === 'number';
  const isMale = userProfile.gender === 'male';

  const handlePrevWeek = () => {
    const nextOffset = weekOffset - 1;
    setWeekOffset(nextOffset);
    const prevWeekDays = getWeekDays(todayDate, nextOffset);
    if (!prevWeekDays.some((d) => d.dateKey === selectedDateKey)) {
      setSelectedDateKey(prevWeekDays[0].dateKey);
    }
  };

  const handleNextWeek = () => {
    const nextOffset = weekOffset + 1;
    setWeekOffset(nextOffset);
    const nextWeekDays = getWeekDays(todayDate, nextOffset);
    if (!nextWeekDays.some((d) => d.dateKey === selectedDateKey)) {
      setSelectedDateKey(nextWeekDays[0].dateKey);
    }
  };

  const handleReturnToToday = () => {
    setWeekOffset(0);
    setSelectedDateKey(todayKey);
  };

  const renderStepCard = (step: RoutineStep) => {
    return (
      <div key={step.id} className="flex items-center gap-2.5">
        {/* Time Column on Left */}
        <div className="w-[44px] shrink-0 text-right pr-0.5">
          <span className="block text-[12px] font-bold text-[#1C1813] leading-tight">
            {step.time}
          </span>
        </div>

        {/* Main Product Card */}
        <div
          onClick={() => onToggleRoutineStep(step.id, selectedDateKey)}
          className={`flex-1 min-w-0 rounded-[22px] py-2.5 px-3 shadow-[0_4px_16px_rgba(0,0,0,0.02)] border flex items-center justify-between cursor-pointer transition-all duration-200 active:scale-[0.99] ${
            step.completed
              ? 'bg-white/75 border-[#A87C44]/30 shadow-[0_6px_20px_rgba(168,124,68,0.06)] opacity-80'
              : 'bg-white border-[#ECE5D7] hover:border-[#E5DDD4]'
          }`}
        >
          {/* Product Thumbnail with soft background */}
          <div
            className="w-11 h-11 rounded-[16px] p-1 flex items-center justify-center shrink-0 mr-2.5"
            style={{ backgroundColor: step.iconBg || '#F4F0E8' }}
          >
            <img
              src={step.imageUrl}
              alt={step.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80';
              }}
              className="max-h-full max-w-full object-contain mix-blend-multiply"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0 pr-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#756C5D] block">
              {step.stepCategory}
            </span>
            <h3
              className={`text-[12.5px] font-bold leading-tight truncate transition-colors ${
                step.completed ? 'line-through text-[#756C5D]' : 'text-[#1C1813]'
              }`}
            >
              {step.name}
            </h3>
            <p className="text-[10.5px] text-[#756C5D] truncate mt-0.5">
              {step.brand} • {step.partnerStore}
            </p>
          </div>

          {/* Clickable Circle Checkbox on Right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleRoutineStep(step.id, selectedDateKey);
            }}
            aria-label={`Отметить ${step.name} как ${
              step.completed ? 'невыполненное' : 'выполненное'
            }`}
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
              step.completed
                ? 'bg-[#A87C44] text-white shadow-[0_3px_10px_rgba(168,124,68,0.4)] scale-105'
                : 'border-2 border-[#D9D1C9] hover:border-[#A87C44] bg-white'
            }`}
          >
            {step.completed && <Check size={13} strokeWidth={3} />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 pb-32 pt-4 px-4 sm:px-5 select-none">
      {/* Top Header: Greeting & UserAvatar (No stock photos of women) */}
      <header className="flex items-center justify-between mb-3.5">
        <div>
          <h1 className="text-[23px] font-bold tracking-tight text-[#1C1813] leading-tight">
            {userProfile.greeting}
          </h1>
          <p className="text-[13px] font-normal text-[#756C5D] mt-0.5">
            {userProfile.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenProfile}
          aria-label={`Профиль ${userProfile.name}`}
          className="transition-transform active:scale-95"
        >
          <UserAvatar
            name={userProfile.name}
            avatarMode={userProfile.avatarMode}
            telegramPhotoUrl={userProfile.telegramPhotoUrl}
            customAvatarUrl={userProfile.customAvatarUrl}
            size="md"
            showOnlineBadge
          />
        </button>
      </header>

      {/* Статус кожи пользователя (Clean State support) */}
      <section
        aria-label="Статус состояния кожи"
        className="w-full bg-white rounded-[24px] p-3.5 mb-4 border border-[#ECE5D7] shadow-[0_6px_20px_rgba(30,27,24,0.03)] flex flex-col gap-2.5"
      >
        <div className="flex items-center justify-between gap-2">
          {/* Индекс здоровья кожи */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {hasHealthScore ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
              )}
            </span>
            <span className="text-[12.5px] font-bold text-[#1C1813] truncate">
              Индекс кожи:{' '}
              {hasHealthScore ? (
                <span className="text-emerald-600 font-extrabold">
                  {userProfile.healthIndex}/{userProfile.healthMax}
                </span>
              ) : (
                <span className="text-[#A87C44] font-bold">
                  Не определен — сделай AI-скан
                </span>
              )}
            </span>
          </div>

          {/* Стрик рутины */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEF3F2] border border-[#FEE4E2] text-[#A87C44] text-[11px] font-bold shrink-0">
            <span>🔥 {userProfile.streakDays} дней подряд</span>
          </div>
        </div>

        {/* Прогресс-бар здоровья кожи */}
        <div className="w-full h-1.5 bg-[#F4F0E8] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#A87C44] via-amber-400 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: hasHealthScore ? `${userProfile.healthIndex}%` : '8%' }}
          />
        </div>

        {/* Тип кожи и статус */}
        <div className="flex items-center justify-between text-[11.5px] text-[#786F67] pt-0.5 border-t border-[#F9F6F2]">
          <span className="truncate pr-2">
            <span className="text-[#756C5D]">Кожа:</span> {userProfile.skinType}
          </span>
          <span
            className={`shrink-0 font-semibold flex items-center gap-1 ${
              hasHealthScore ? 'text-emerald-600' : 'text-[#756C5D]'
            }`}
          >
            <ShieldCheck size={13} />
            {hasHealthScore ? 'Диагностирована' : 'Чистый профиль'}
          </span>
        </div>
      </section>

      {/* Main Promo Banner: "ПОДБЕРИ СВОЙ Идеальный крем" */}
      <section
        aria-label="Рекомендованный уход"
        className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#F0E6D1] via-[#F6DBD2] to-[#ECD0C6] p-4 shadow-[0_12px_28px_rgba(246,219,210,0.45)] mb-3.5"
      >
        <div className="flex items-center justify-between">
          <div className="relative w-[116px] h-[116px] shrink-0 flex items-center justify-center">
            <div className="absolute inset-1 rounded-2xl bg-white/45 rotate-[-4deg] scale-95 shadow-sm" />
            <img
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=360&q=80"
              alt="Персональный подбор ухода"
              className="relative z-10 w-24 h-24 object-contain drop-shadow-md"
            />
          </div>

          <div className="flex-1 pl-3 pr-0.5 py-0.5">
            <span className="inline-block text-[10.5px] font-bold tracking-[0.16em] uppercase text-[#8E6D64] mb-1">
              {isMale ? 'МУЖСКОЙ КОНСЬЕРЖ' : 'ПОДБЕРИ СВОЙ'}
            </span>
            <h2 className="font-serif italic text-[23px] sm:text-[25px] font-medium leading-[1.14] text-[#1C1813]">
              {isMale ? (
                <>
                  Лаконичный <br />
                  <span className="font-serif italic text-[24px]">уход для кожи</span>
                </>
              ) : (
                <>
                  Идеальный <br />
                  <span className="font-serif italic text-[24px]">крем для кожи</span>
                </>
              )}
            </h2>
          </div>
        </div>
      </section>

      {/* AI Action Bar 1: AI-диагностика кожи лица */}
      <button
        type="button"
        onClick={onStartScan}
        aria-label="AI-диагностика кожи лица"
        className="group w-full mb-2.5 flex items-center justify-between bg-white rounded-full py-3.5 px-4 shadow-[0_8px_24px_rgba(30,27,24,0.03)] border border-[#ECE5D7] hover:border-[#A87C44]/40 active:scale-[0.98] transition-all text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#FBF8F5] flex items-center justify-center text-[#1C1813] group-hover:text-[#A87C44] group-hover:bg-[#F0E6D1]/40 transition-colors">
            <ScanFace size={19} strokeWidth={2.2} />
          </div>
          <div>
            <span className="text-[13.5px] font-bold text-[#1C1813] group-hover:text-[#A87C44] transition-colors block">
              AI-диагностика кожи лица
            </span>
            <span className="text-[11px] text-[#756C5D]">
              Селфи-анализ и персональный подбор банок
            </span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#756C5D] group-hover:text-[#A87C44] group-hover:translate-x-0.5 transition-all">
          <ArrowRight size={17} strokeWidth={2.2} />
        </div>
      </button>

      {/* AI Action Bar 2 (KILLER FEATURE): Проверить банку / Разбор состава по фото */}
      <button
        type="button"
        onClick={onOpenJarScanner}
        aria-label="Проверить банку / Разбор состава по фото"
        className="group w-full mb-5 flex items-center justify-between bg-gradient-to-r from-[#F0E6D1]/65 via-[#FBF1EE] to-white rounded-full py-3.5 px-4 shadow-[0_8px_24px_rgba(168,124,68,0.06)] border border-[#F6DBD2] hover:border-[#A87C44] active:scale-[0.98] transition-all text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#A87C44] flex items-center justify-center text-white shadow-xs">
            <FlaskConical size={18} strokeWidth={2.2} />
          </div>
          <div>
            <span className="text-[13.5px] font-bold text-[#1C1813] group-hover:text-[#A87C44] transition-colors block">
              Проверить банку / Разбор состава по фото
            </span>
            <span className="text-[11px] text-[#786F67]">
              INCI-сканер комедогенности и конфликта активов
            </span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#A87C44] group-hover:translate-x-0.5 transition-all">
          <ArrowRight size={17} strokeWidth={2.2} />
        </div>
      </button>

      {/* КАЛЕНДАРЬ ЕЖЕДНЕВНОГО УХОДА (ПН–ВС с навигацией по неделям) */}
      <section aria-label="Календарь ухода" className="mb-4">
        {/* Верхняя панель месяца/года и переключения недель */}
        <div className="flex items-center justify-between gap-2 mb-2.5 px-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <CalendarIcon size={14} className="text-[#A87C44] shrink-0" />
            <span className="text-[13.5px] font-extrabold text-[#1C1813] tracking-tight truncate">
              {monthYearLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isAwayFromToday && (
              <button
                type="button"
                onClick={handleReturnToToday}
                className="px-2.5 py-1 rounded-full bg-[#F0E6D1]/80 text-[#A87C44] hover:bg-[#A87C44] hover:text-white text-[11px] font-bold transition-all active:scale-95"
              >
                Сегодня
              </button>
            )}

            <button
              type="button"
              onClick={handlePrevWeek}
              aria-label="Предыдущая неделя"
              className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-white border border-[#EBE4DD] text-[#1C1813] hover:border-[#A87C44] text-[11px] font-bold transition-all active:scale-95 shadow-2xs"
            >
              <ChevronLeft size={12} strokeWidth={2.5} />
              <span>Пред.</span>
            </button>

            <button
              type="button"
              onClick={handleNextWeek}
              aria-label="Следующая неделя"
              className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-white border border-[#EBE4DD] text-[#1C1813] hover:border-[#A87C44] text-[11px] font-bold transition-all active:scale-95 shadow-2xs"
            >
              <span>След.</span>
              <ChevronRight size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Полоска из 7 дней недели (ПН – ВС) */}
        <div
          className="grid grid-cols-7 gap-1.5 overflow-x-auto no-scrollbar py-0.5"
          role="tablist"
          aria-label="Дни недели"
        >
          {weekDays.map((day) => {
            const isSelected = day.dateKey === selectedDateKey;
            const completionStatus = getDayCompletionStatus(
              completedHistory,
              day.dateKey,
              validStepIds
            );

            return (
              <button
                key={day.dateKey}
                type="button"
                role="tab"
                aria-selected={isSelected}
                data-date-key={day.dateKey}
                data-completion-status={completionStatus}
                onClick={() => setSelectedDateKey(day.dateKey)}
                className={`py-2 px-1 rounded-[18px] flex flex-col items-center justify-center transition-all duration-200 active:scale-95 relative ${
                  isSelected
                    ? 'bg-[#A87C44] text-white shadow-[0_6px_18px_rgba(168,124,68,0.35)] scale-[1.03]'
                    : day.isToday
                    ? 'bg-[#FBF1EE] text-[#1C1813] border border-[#A87C44]/50 shadow-2xs'
                    : 'bg-white text-[#756C5D] hover:text-[#1C1813] border border-[#ECE5D7] shadow-2xs'
                }`}
              >
                <span
                  className={`text-[9.5px] font-bold tracking-wider uppercase ${
                    isSelected
                      ? 'text-white/90'
                      : day.isToday
                      ? 'text-[#A87C44]'
                      : 'text-[#756C5D]'
                  }`}
                >
                  {day.dayName}
                </span>

                <span
                  className={`text-[15px] font-extrabold leading-tight mt-0.5 ${
                    isSelected ? 'text-white' : 'text-[#1C1813]'
                  }`}
                >
                  {day.dayNumber}
                </span>

                {/* Индикатор прогресса рутины под числом (точка) */}
                <span className="h-2 flex items-center justify-center mt-0.5">
                  {completionStatus === 'full' && (
                    <span
                      title="Все этапы ухода выполнены"
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isSelected
                          ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]'
                          : 'bg-[#A87C44]'
                      }`}
                    />
                  )}
                  {completionStatus === 'partial' && (
                    <span
                      title="Часть этапов ухода выполнена"
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isSelected ? 'bg-white/55' : 'bg-[#A87C44]/45'
                      }`}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Routine Section Header with Russian Date Heading */}
      <div className="flex flex-col mb-3 px-0.5 gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="block text-[10.5px] font-bold uppercase tracking-wider text-[#A87C44]">
            Ежедневный уход
          </span>

          {routineSteps.length > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0E6D1]/70 text-[#A87C44] text-[11px] font-bold shrink-0">
              <Sparkles size={11} />
              <span>{percentage}% Готово</span>
            </div>
          )}
        </div>

        <h2
          data-testid="routine-selected-date-heading"
          className="text-[16px] sm:text-[17px] font-extrabold text-[#1C1813] tracking-tight leading-snug"
        >
          {selectedDateHeading}
        </h2>

        <p className="text-[11.5px] text-[#756C5D] font-medium">
          {routineSteps.length === 0
            ? 'План ухода еще не сформирован'
            : `Выполнено ${completed} из ${total} шагов ухода`}
        </p>
      </div>

      {/* CLEAN STATE (EMPTY ROUTINE) vs POPULATED ROUTINE */}
      {routineSteps.length === 0 ? (
        <div
          aria-label="Пустая ежедневная рутина"
          className="bg-white rounded-[28px] p-5 border border-[#ECE5D7] shadow-[0_8px_26px_rgba(30,27,24,0.03)] flex flex-col items-center text-center gap-3.5"
        >
          <div className="w-13 h-13 rounded-2xl bg-[#F0E6D1]/60 text-[#A87C44] flex items-center justify-center">
            <Sparkles size={24} />
          </div>

          <div>
            <h3 className="text-[16px] font-extrabold text-[#1C1813] leading-snug">
              Твоя ежедневная рутина пока пуста
            </h3>
            <p className="text-[12px] text-[#786F67] mt-1 max-w-[310px] leading-relaxed">
              Никаких чужих шаблонов: проведи AI-скан лица, добавь свои банки на
              проверку или сгенерируй базовый уход прямо по ответам твоей анкеты.
            </p>
          </div>

          <div className="w-full flex flex-col gap-2.5 pt-1">
            {/* Button 1: 📸 Провести AI-скан лица и сгенерировать уход */}
            <button
              type="button"
              onClick={onStartScan}
              className="w-full py-3.5 px-4 rounded-full bg-[#A87C44] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(168,124,68,0.3)] hover:bg-[#e5604d] active:scale-[0.98] transition-all"
            >
              <span>📸 Провести AI-скан лица и сгенерировать уход</span>
            </button>

            {/* Button 2: Подобрать базовый уход без фото (по моей анкете) */}
            <button
              type="button"
              disabled={isGeneratingWithoutPhoto}
              onClick={onGenerateRoutineWithoutPhoto}
              className="w-full py-3.5 px-4 rounded-full bg-[#1C1813] text-white text-[12.5px] font-bold flex items-center justify-center gap-2 hover:bg-[#332E2A] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              <Sparkles
                size={15}
                className={`text-[#A87C44] shrink-0 ${
                  isGeneratingWithoutPhoto ? 'animate-spin' : ''
                }`}
              />
              <span>
                {isGeneratingWithoutPhoto
                  ? 'AI-дерматолог собирает твою рутину...'
                  : 'Подобрать базовый уход без фото (по моей анкете)'}
              </span>
            </button>

            {/* Button 3: 🧴 Добавить мои текущие банки */}
            <button
              type="button"
              onClick={onOpenJarScanner}
              className="w-full py-3 px-4 rounded-full bg-[#FBF8F5] border border-[#EBE4DD] text-[#1C1813] text-[12.5px] font-bold flex items-center justify-center gap-2 hover:bg-[#F3ECE4] active:scale-[0.98] transition-all"
            >
              <span>🧴 Добавить мои текущие банки</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* СЕКЦИЯ 1: Утренняя рутина */}
          <section className="mb-5" aria-label="Утренняя рутина">
            <div className="flex items-center gap-2 mb-2.5 px-0.5">
              <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Sun size={12} strokeWidth={2.5} />
              </div>
              <h3 className="text-[13.5px] font-bold text-[#1C1813]">
                Утренняя рутина
              </h3>
              <span className="text-[11px] text-[#756C5D] font-medium">
                (Защита и баланс)
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {morningSteps.map(renderStepCard)}
            </div>
          </section>

          {/* СЕКЦИЯ 2: Вечерняя рутина */}
          <section className="mb-2" aria-label="Вечерняя рутина">
            <div className="flex items-center gap-2 mb-2.5 px-0.5">
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Moon size={12} strokeWidth={2.5} />
              </div>
              <h3 className="text-[13.5px] font-bold text-[#1C1813]">
                Вечерняя рутина
              </h3>
              <span className="text-[11px] text-[#756C5D] font-medium">
                (Восстановление барьера)
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {eveningSteps.map(renderStepCard)}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
