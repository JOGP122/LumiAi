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
  ChevronRight,
  Smile,
  Wand2
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
  getRoutineStepsForDate
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

const formatOverlineDate = (date: Date): string => {
  const weekday = new Intl.DateTimeFormat('ru-RU', { weekday: 'long' })
    .format(date)
    .toUpperCase();
  const day = date.getDate();
  const month = new Intl.DateTimeFormat('ru-RU', { month: 'long' })
    .format(date)
    .toUpperCase();
  return `${weekday}, ${day} ${month}`;
};

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

  const overlineDate = useMemo(() => formatOverlineDate(todayDate), [todayDate]);

  const stepsForSelectedDate = useMemo(
    () => getRoutineStepsForDate(routineSteps, completedHistory, selectedDateKey),
    [routineSteps, completedHistory, selectedDateKey]
  );

  const morningSteps = stepsForSelectedDate.filter((s) => s.section === 'morning');
  const eveningSteps = stepsForSelectedDate.filter((s) => s.section === 'evening');

  const { completed, total, percentage } =
    calculateRoutineProgress(stepsForSelectedDate);
  const hasHealthScore = typeof userProfile.healthIndex === 'number';

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

  const renderStepCard = (step: RoutineStep) => {
    return (
      <div key={step.id} className="flex items-center gap-2.5">
        <div className="w-[44px] shrink-0 text-right pr-0.5">
          <span className="block text-[12px] font-bold text-[#1C1813] leading-tight">
            {step.time}
          </span>
        </div>

        <div
          onClick={() => onToggleRoutineStep(step.id, selectedDateKey)}
          className={`flex-1 min-w-0 rounded-[20px] py-2.5 px-3 border flex items-center justify-between cursor-pointer transition-all duration-200 active:scale-[0.99] ${
            step.completed
              ? 'bg-[#FCFAF4]/75 border-[#A87C44]/30 opacity-80'
              : 'bg-[#FCFAF4] border-[#E6DFCF]'
          }`}
        >
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
                ? 'bg-[#A87C44] text-[#F5F0E5]'
                : 'border-2 border-[#E6DFCF] bg-[#FCFAF4]'
            }`}
          >
            {step.completed && <Check size={13} strokeWidth={3} />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 pb-32 pt-6 px-5 select-none bg-[#F4F0E8]">
      {/* HEADER: overline + Cormorant greeting + avatar */}
      <header className="flex items-start justify-between mb-5">
        <div className="flex flex-col gap-[5px]">
          <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#A87C44]">
            {overlineDate}
          </span>
          <h1 className="font-serif text-[30px] font-medium leading-[34px] text-[#1C1813]">
            {userProfile.greeting}
          </h1>
          <p className="text-[12.5px] leading-[17px] text-[#756C5D]">
            {userProfile.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenProfile}
          aria-label={`Профиль ${userProfile.name}`}
          className="transition-transform active:scale-95 mt-1"
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

      {/* SKIN INDEX CARD — dark concierge panel */}
      <section
        aria-label="Индекс кожи"
        className="w-full bg-[#1C1813] rounded-[20px] p-5 mb-5 flex flex-col gap-4 shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)]"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-[5px]">
            <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#CDA872]">
              Индекс кожи
            </span>
            <span className="font-serif text-[27px] font-medium leading-[30px] text-[#F5F0E5]">
              {hasHealthScore
                ? `${userProfile.healthIndex} из ${userProfile.healthMax ?? 100}`
                : 'Пока не определён'}
            </span>
            <span className="text-[12px] leading-[16px] text-[#B4A993]">
              {hasHealthScore ? 'Скан актуален' : 'Сделай первый AI-скан'}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-full bg-[#322B22]">
            <Flame size={11} className="text-[#D97B52]" fill="#D97B52" />
            <span className="text-[12px] font-semibold text-[#F5F0E5]">
              {userProfile.streakDays} дней
            </span>
          </div>
        </div>

        <div className="w-full h-1 bg-[#322B22] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#A87C44] rounded-full transition-all duration-500"
            style={{
              width: hasHealthScore
                ? `${Math.min(100, ((userProfile.healthIndex ?? 0) / (userProfile.healthMax || 100)) * 100)}%`
                : '12%'
            }}
          />
        </div>

        <div className="w-full h-px bg-[#3B332A]" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smile size={13} className="text-[#93A98C]" />
            <span className="text-[13px] text-[#B4A993]">
              Кожа: {userProfile.skinType}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-[#93A98C]" />
            <span className="text-[12px] text-[#B4A993]">
              {hasHealthScore ? 'Диагностирована' : 'Чистый профиль'}
            </span>
          </div>
        </div>
      </section>

      {/* HERO — image card with gradient */}
      <section
        aria-label="Мужской консъерж"
        className="relative overflow-hidden rounded-[20px] h-[200px] mb-5 flex flex-col justify-end p-5 gap-1"
      >
        <img
          src="/assets/hero-skincare.png"
          alt="Лаконичный уход для кожи"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '50% 35%' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(20,16,11,0) 0%, rgba(20,16,11,0.55) 45%, rgba(20,16,11,0.9) 100%)'
          }}
        />
        <span className="relative text-[11px] font-bold tracking-[1.8px] uppercase text-[#CDA872]">
          Мужской консъерж
        </span>
        <h2 className="relative font-serif text-[27px] font-medium leading-[30px] text-[#F5F0E5]">
          Лаконичный уход для кожи
        </h2>
      </section>

      {/* ACTIONS — grouped rows on surface card */}
      <section className="w-full bg-[#FCFAF4] rounded-[20px] shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)] mb-5 overflow-hidden">
        <button
          type="button"
          onClick={onStartScan}
          aria-label="AI-диагностика кожи лица"
          className="w-full flex items-center gap-3.5 py-4 px-[18px] text-left active:bg-[#F4F0E8] transition-colors"
        >
          <div className="w-[42px] h-[42px] rounded-[12px] bg-[#F0E6D1] flex items-center justify-center shrink-0">
            <ScanFace size={17} className="text-[#84622F]" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
            <span className="text-[15px] font-semibold text-[#1C1813]">
              AI-диагностика кожи лица
            </span>
            <span className="text-[12.5px] leading-[17px] text-[#756C5D]">
              Селфи-анализ и персональный подбор
            </span>
          </div>
          <ChevronRight size={13} className="text-[#A87C44] shrink-0" />
        </button>

        <div className="h-px bg-[#E6DFCF] ml-[74px] mr-[18px]" />

        <button
          type="button"
          onClick={onOpenJarScanner}
          aria-label="Проверить банку по фото"
          className="w-full flex items-center gap-3.5 py-4 px-[18px] text-left active:bg-[#F4F0E8] transition-colors"
        >
          <div className="w-[42px] h-[42px] rounded-[12px] bg-[#F0E6D1] flex items-center justify-center shrink-0">
            <FlaskConical size={16} className="text-[#84622F]" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
            <span className="text-[15px] font-semibold text-[#1C1813]">
              Проверить банку по фото
            </span>
            <span className="text-[12.5px] leading-[17px] text-[#756C5D]">
              Проверка состава: комедогены, конфликты с твоей рутиной
            </span>
          </div>
          <ChevronRight size={13} className="text-[#A87C44] shrink-0" />
        </button>
      </section>

      {/* CALENDAR */}
      <section aria-label="Календарь ухода" className="mb-5">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <CalendarIcon size={13} className="text-[#84622F]" />
            <span className="text-[15px] font-semibold text-[#1C1813]">
              {monthYearLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevWeek}
              aria-label="Предыдущая неделя"
              className="w-8 h-8 rounded-full border border-[#E6DFCF] flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronLeft size={12} className="text-[#756C5D]" />
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              aria-label="Следующая неделя"
              className="w-8 h-8 rounded-full border border-[#E6DFCF] flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronRight size={12} className="text-[#756C5D]" />
            </button>
          </div>
        </div>

        <div className="flex gap-1.5" role="tablist" aria-label="Дни недели">
          {weekDays.map((day) => {
            const isSelected = day.dateKey === selectedDateKey;
            return (
              <button
                key={day.dateKey}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedDateKey(day.dateKey)}
                className={`flex-1 h-[62px] rounded-[16px] flex flex-col items-center justify-center gap-[3px] transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'bg-[#1C1813] shadow-[0_6px_18px_-8px_rgba(0,0,0,0.5)]'
                    : ''
                }`}
              >
                <span
                  className={`text-[10px] font-bold tracking-[1px] uppercase ${
                    isSelected ? 'text-[#CDA872]' : 'text-[#A79C8A]'
                  }`}
                >
                  {day.dayName}
                </span>
                <span
                  className={`text-[15px] font-semibold leading-tight ${
                    isSelected ? 'text-[#F5F0E5]' : 'text-[#1C1813]'
                  }`}
                >
                  {day.dayNumber}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ROUTINE */}
      <div className="flex flex-col gap-[5px] mb-3">
        <span className="text-[11px] font-bold uppercase tracking-[1.8px] text-[#A87C44]">
          Ежедневный уход
        </span>
        <h2 className="font-serif text-[24px] font-medium leading-[28px] text-[#1C1813]">
          {selectedDateHeading}
        </h2>
        <p className="text-[12.5px] leading-[17px] text-[#756C5D]">
          {routineSteps.length === 0
            ? 'План ухода ещё не сформирован'
            : `Выполнено ${completed} из ${total} шагов ухода • ${percentage}%`}
        </p>
      </div>

      {routineSteps.length === 0 ? (
        <div
          aria-label="Пустая ежедневная рутина"
          className="bg-[#FCFAF4] rounded-[20px] shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)] p-[26px] flex flex-col items-center text-center gap-3.5"
        >
          <div className="w-14 h-14 rounded-full bg-[#F0E6D1] flex items-center justify-center">
            <Wand2 size={20} className="text-[#84622F]" />
          </div>

          <h3 className="text-[16px] font-semibold leading-[22px] text-[#1C1813]">
            Рутина пока пуста
          </h3>
          <p className="text-[13px] leading-[19px] text-[#756C5D] max-w-[310px]">
            Никаких чужих шаблонов: пройди AI-скан лица, добавь свои средства или
            собери базовый уход по ответам анкеты.
          </p>

          <div className="w-full flex flex-col gap-2.5 pt-1.5">
            <button
              type="button"
              onClick={onStartScan}
              className="w-full h-[52px] rounded-[14px] bg-[#1C1813] text-[#F5F0E5] text-[15px] font-semibold flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
            >
              <ScanFace size={15} />
              Провести AI-скан лица
            </button>

            <button
              type="button"
              disabled={isGeneratingWithoutPhoto}
              onClick={onGenerateRoutineWithoutPhoto}
              className="w-full h-[52px] rounded-[14px] bg-transparent border border-[#E6DFCF] text-[#1C1813] text-[15px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {isGeneratingWithoutPhoto ? (
                <Sparkles size={15} className="animate-spin text-[#A87C44]" />
              ) : null}
              Подобрать уход по анкете
            </button>

            <button
              type="button"
              onClick={onOpenJarScanner}
              className="self-center text-[13px] font-semibold text-[#84622F] pt-1"
            >
              Добавить мои текущие средства
            </button>
          </div>
        </div>
      ) : (
        <>
          <section className="mb-5" aria-label="Утренняя рутина">
            <div className="flex items-center gap-2 mb-2.5 px-0.5">
              <div className="w-5 h-5 rounded-full bg-[#F0E6D1] text-[#84622F] flex items-center justify-center">
                <Sun size={12} strokeWidth={2.5} />
              </div>
              <h3 className="text-[13.5px] font-semibold text-[#1C1813]">
                Утренняя рутина
              </h3>
              <span className="text-[11px] text-[#756C5D]">(Защита и баланс)</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {morningSteps.map(renderStepCard)}
            </div>
          </section>

          <section className="mb-2" aria-label="Вечерняя рутина">
            <div className="flex items-center gap-2 mb-2.5 px-0.5">
              <div className="w-5 h-5 rounded-full bg-[#F0E6D1] text-[#84622F] flex items-center justify-center">
                <Moon size={12} strokeWidth={2.5} />
              </div>
              <h3 className="text-[13.5px] font-semibold text-[#1C1813]">
                Вечерняя рутина
              </h3>
              <span className="text-[11px] text-[#756C5D]">(Восстановление барьера)</span>
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
