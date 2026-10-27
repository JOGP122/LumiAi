import React, { useState, useMemo } from 'react';
import { ChevronLeft, ShieldCheck, Check, Sparkles, ArrowLeft, Sun, Moon } from 'lucide-react';
import { RoutineStep } from '../types';
import {
  calculateRoutineProgress,
  formatDateKey,
  getWeekDays,
  formatRussianDateHeading
} from '../utils/skincare';

interface DailyRoutineScreenProps {
  onBackToHome: () => void;
  steps: RoutineStep[];
  onToggleStep: (id: string) => void;
}

export const DailyRoutineScreen: React.FC<DailyRoutineScreenProps> = ({
  onBackToHome,
  steps,
  onToggleStep
}) => {
  const todayDate = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => formatDateKey(todayDate), [todayDate]);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const weekDays = useMemo(() => getWeekDays(todayDate, 0), [todayDate]);
  const selectedDateHeading = useMemo(
    () => formatRussianDateHeading(selectedDateKey, todayDate),
    [selectedDateKey, todayDate]
  );

  const morningSteps = steps.filter((s) => s.section === 'morning');
  const eveningSteps = steps.filter((s) => s.section === 'evening');

  const { completed, total, percentage } = calculateRoutineProgress(steps);

  const renderStepCard = (step: RoutineStep) => {
    return (
      <div key={step.id} className="flex items-center gap-2.5">
        {/* Time Column on Left */}
        <div className="w-[46px] shrink-0 text-right pr-1">
          <span className="block text-[12.5px] font-bold text-[#1E1B18] leading-tight">
            {step.time}
          </span>
        </div>

        {/* Main Product Card */}
        <div
          onClick={() => onToggleStep(step.id)}
          className={`flex-1 min-w-0 rounded-[22px] py-2.5 px-3 shadow-[0_4px_16px_rgba(0,0,0,0.02)] border flex items-center justify-between cursor-pointer transition-all duration-200 active:scale-[0.99] ${
            step.completed
              ? 'bg-white/75 border-[#F8715E]/30 shadow-[0_6px_20px_rgba(248,113,94,0.06)] opacity-80'
              : 'bg-white border-[#F2ECE5] hover:border-[#E5DDD4]'
          }`}
        >
          {/* Product Thumbnail with soft background */}
          <div
            className="w-11 h-11 rounded-[16px] p-1 flex items-center justify-center shrink-0 mr-2.5"
            style={{ backgroundColor: step.iconBg || '#F5F2EB' }}
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B9188] block">
              {step.stepCategory}
            </span>
            <h3
              className={`text-[12.5px] font-bold leading-tight truncate transition-colors ${
                step.completed ? 'line-through text-[#9B9188]' : 'text-[#1E1B18]'
              }`}
            >
              {step.name}
            </h3>
            <p className="text-[10.5px] text-[#9B9188] truncate mt-0.5">
              {step.brand}
            </p>
          </div>

          {/* Clickable Circle Checkbox on Right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStep(step.id);
            }}
            aria-label={`Отметить ${step.name} как ${step.completed ? 'невыполненное' : 'выполненное'}`}
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
              step.completed
                ? 'bg-[#F8715E] text-white shadow-[0_3px_10px_rgba(248,113,94,0.4)] scale-105'
                : 'border-2 border-[#D9D1C9] hover:border-[#F8715E] bg-white'
            }`}
          >
            {step.completed && <Check size={13} strokeWidth={3} />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 pb-28 pt-4 px-4 sm:px-5 select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-4">
        <button
          onClick={onBackToHome}
          aria-label="Назад на главную"
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1E1B18] shadow-xs border border-[#F2ECE5] active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} strokeWidth={2.2} />
        </button>

        <h1 className="text-[18px] font-bold text-[#1E1B18] tracking-tight">
          Ежедневный уход
        </h1>

        <button
          aria-label="Статус защиты барьера кожи"
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1E1B18] shadow-xs border border-[#F2ECE5] active:scale-90 transition-transform"
        >
          <ShieldCheck size={18} strokeWidth={2} className="text-[#F8715E]" />
        </button>
      </header>

      {/* Calendar Week Days Carousel */}
      <div className="grid grid-cols-7 gap-1.5 mb-5" role="tablist" aria-label="Дни недели">
        {weekDays.map((day) => {
          const isActive = day.dateKey === selectedDateKey;
          return (
            <button
              key={day.dateKey}
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedDateKey(day.dateKey)}
              className={`py-2.5 px-1 rounded-[18px] flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-[#F8715E] text-white shadow-[0_8px_20px_rgba(248,113,94,0.35)] scale-105'
                  : 'bg-white text-[#9B9188] hover:text-[#1E1B18] border border-[#F2ECE5] shadow-xs'
              }`}
            >
              <span
                className={`text-[15px] font-bold leading-none ${
                  isActive ? 'text-white' : 'text-[#1E1B18]'
                }`}
              >
                {day.dayNumber}
              </span>
              <span
                className={`text-[9.5px] font-bold tracking-wider mt-1 uppercase ${
                  isActive ? 'text-white/95' : 'text-[#9B9188]'
                }`}
              >
                {day.dayName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Date Header & Progress Summary */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#1E1B18] tracking-tight">
            {selectedDateHeading}
          </h2>
          <p className="text-[12px] text-[#9B9188] font-medium mt-0.5">
            Выполнено {completed} из {total} шагов ухода
          </p>
        </div>

        {/* Completion Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8DDD4]/70 text-[#F8715E] text-[11px] font-bold">
          <Sparkles size={12} />
          <span>{percentage}% Готово</span>
        </div>
      </div>

      {/* СЕКЦИЯ 1: Утренняя рутина (Защита и сияние) */}
      <section className="mb-6" aria-label="Утренняя рутина">
        <div className="flex items-center gap-2 mb-3 px-0.5">
          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Sun size={14} strokeWidth={2.5} />
          </div>
          <h3 className="text-[14px] font-bold text-[#1E1B18]">
            Утренняя рутина
          </h3>
          <span className="text-[11px] text-[#9B9188] font-medium">
            (Защита и сияние)
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {morningSteps.map(renderStepCard)}
        </div>
      </section>

      {/* СЕКЦИЯ 2: Вечерняя рутина (Восстановление барьера) */}
      <section className="mb-6" aria-label="Вечерняя рутина">
        <div className="flex items-center gap-2 mb-3 px-0.5">
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Moon size={14} strokeWidth={2.5} />
          </div>
          <h3 className="text-[14px] font-bold text-[#1E1B18]">
            Вечерняя рутина
          </h3>
          <span className="text-[11px] text-[#9B9188] font-medium">
            (Восстановление барьера)
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {eveningSteps.map(renderStepCard)}
        </div>
      </section>

      {/* Back to Home Button: На главную */}
      <div className="pt-1 pb-4">
        <button
          onClick={onBackToHome}
          aria-label="Вернуться на главную"
          className="w-full py-3.5 px-4 rounded-full bg-white border border-[#EBE4DD] text-[#1E1B18] text-[13.5px] font-bold flex items-center justify-center gap-2 hover:bg-[#FBF8F5] active:scale-[0.98] transition-all shadow-xs"
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
          <span>На главную</span>
        </button>
      </div>
    </div>
  );
};
