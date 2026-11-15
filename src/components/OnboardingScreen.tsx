import React, { useState, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Check,
  ScanFace,
  User,
  Upload,
  Send
} from 'lucide-react';
import { OnboardingAnswers, UserGender, AgeGroup, AvatarMode } from '../types';
import {
  AGE_GROUPS,
  SKIN_BEHAVIOR_OPTIONS,
  SKIN_BEHAVIOR_UNKNOWN_LABEL,
  SKIN_GOALS_OPTIONS,
  CURRENT_ARSENAL_OPTIONS,
  BUDGET_OPTIONS,
  DEFAULT_ONBOARDING_ANSWERS,
  toggleSkinBehaviorOption,
  selectSkinBehaviorUnknown,
  toggleSkinGoalOption
} from '../utils/skincare';
import { LumiLogo } from './LumiLogo';
import { UserAvatar } from './UserAvatar';

interface OnboardingScreenProps {
  initialName: string;
  telegramPhotoUrl?: string;
  initialAnswers?: OnboardingAnswers;
  onComplete: (
    name: string,
    answers: OnboardingAnswers,
    openScannerAfter?: boolean
  ) => void;
  onCancel?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  initialName,
  telegramPhotoUrl,
  initialAnswers,
  onComplete,
  onCancel
}) => {
  const [userName, setUserName] = useState<string>(
    initialName && initialName !== 'Гость' ? initialName : ''
  );
  const [currentStep, setCurrentStep] = useState<number>(0);

  const [answers, setAnswers] = useState<OnboardingAnswers>(() => ({
    gender: initialAnswers?.gender || DEFAULT_ONBOARDING_ANSWERS.gender,
    ageGroup: initialAnswers?.ageGroup || DEFAULT_ONBOARDING_ANSWERS.ageGroup,
    avatarMode:
      initialAnswers?.avatarMode ||
      (telegramPhotoUrl ? 'telegram' : 'initials'),
    customAvatarUrl: initialAnswers?.customAvatarUrl,
    skinBehavior: initialAnswers?.skinBehavior || [],
    skinBehaviorUnknown: Boolean(initialAnswers?.skinBehaviorUnknown),
    goals:
      initialAnswers?.goals && initialAnswers.goals.length > 0
        ? initialAnswers.goals
        : ['Подобрать простой базовый уход на каждый день'],
    currentArsenal:
      initialAnswers?.currentArsenal ||
      DEFAULT_ONBOARDING_ANSWERS.currentArsenal,
    budget: initialAnswers?.budget || DEFAULT_ONBOARDING_ANSWERS.budget
  }));

  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);
  const totalSteps = 4;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  const isMale = answers.gender === 'male';

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAnswers((prev) => ({
        ...prev,
        avatarMode: 'custom',
        customAvatarUrl: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleGenderChange = (gender: UserGender) => {
    setAnswers((prev) => ({ ...prev, gender }));
  };

  const handleAgeChange = (ageGroup: AgeGroup) => {
    setAnswers((prev) => ({ ...prev, ageGroup }));
  };

  const handleAvatarModeChange = (avatarMode: AvatarMode) => {
    if (avatarMode === 'custom') {
      avatarFileInputRef.current?.click();
      return;
    }
    setAnswers((prev) => ({ ...prev, avatarMode }));
  };

  const handleToggleBehavior = (label: string) => {
    setAnswers((prev) => {
      const updated = toggleSkinBehaviorOption(prev.skinBehavior, label);
      return {
        ...prev,
        skinBehavior: updated.skinBehavior,
        skinBehaviorUnknown: updated.skinBehaviorUnknown
      };
    });
  };

  const handleSelectUnknownBehavior = () => {
    setAnswers((prev) => {
      const updated = selectSkinBehaviorUnknown();
      return {
        ...prev,
        skinBehavior: updated.skinBehavior,
        skinBehaviorUnknown: updated.skinBehaviorUnknown
      };
    });
  };

  const handleToggleGoal = (goal: string) => {
    setAnswers((prev) => {
      const nextGoals = toggleSkinGoalOption(prev.goals, goal);
      return {
        ...prev,
        goals: nextGoals
      };
    });
  };

  const canProceedFromCurrentStep = () => {
    if (currentStep === 0) {
      return userName.trim().length > 0;
    }
    if (currentStep === 1) {
      return answers.skinBehaviorUnknown || answers.skinBehavior.length > 0;
    }
    if (currentStep === 2) {
      return answers.goals.length > 0;
    }
    return Boolean(answers.currentArsenal && answers.budget);
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const finalName =
        userName.trim() || (answers.gender === 'male' ? 'Алекс' : 'Аня');
      onComplete(finalName, answers, false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (onCancel) {
      onCancel();
    }
  };

  const displayName =
    userName.trim() || (isMale ? 'Алекс' : 'Аня');

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#FBF8F5] px-4 sm:px-5 pt-4 pb-8 justify-between select-none">
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
        aria-label="Загрузить фото аватара"
      />

      {/* Top Bar */}
      <div>
        <header className="flex items-center justify-between mb-3.5">
          {currentStep > 0 || onCancel ? (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Назад к предыдущему шагу"
              className="w-9 h-9 rounded-full bg-white border border-[#ECE5D7] flex items-center justify-center text-[#1C1813] shadow-xs active:scale-95 transition-transform"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <LumiLogo size="sm" />
          )}

          <span className="text-[12px] font-bold text-[#756C5D] bg-white px-3.5 py-1 rounded-full border border-[#ECE5D7]">
            Шаг {currentStep + 1} из {totalSteps}
          </span>

          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="text-[12px] font-bold text-[#756C5D] hover:text-[#1C1813] transition-colors"
            >
              Закрыть
            </button>
          ) : (
            <span className="w-10" />
          )}
        </header>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#EFEAE4] rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-[#A87C44] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* STEP 1: Базовые данные о себе (Имя, Пол, Возраст, Аватар) */}
        {currentStep === 0 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0E6D1]/70 text-[#A87C44] text-[11px] font-bold mb-2">
                <Sparkles size={12} />
                <span>Шаг 1 • Знакомство</span>
              </div>
              <h1 className="text-[22px] font-extrabold text-[#1C1813] leading-snug tracking-tight">
                Базовые данные о себе
              </h1>
              <p className="text-[12.5px] text-[#756C5D] mt-1 leading-relaxed">
                Никаких шаблонов: настроим профиль и алгоритмы дерматолога под тебя
              </p>
            </div>

            {/* Name Input */}
            <div className="bg-white rounded-[24px] p-4 border border-[#ECE5D7] shadow-xs">
              <label
                htmlFor="onboarding-user-name"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#756C5D] mb-2"
              >
                Твое имя
              </label>
              <div className="flex items-center gap-2.5 bg-[#FBF8F5] rounded-2xl px-3.5 py-2.5 border border-[#EBE4DD]">
                <User size={16} className="text-[#A87C44] shrink-0" />
                <input
                  id="onboarding-user-name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Введи свое имя..."
                  className="w-full bg-transparent text-[14px] font-bold text-[#1C1813] placeholder:text-[#756C5D] placeholder:font-normal focus:outline-none"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div className="bg-white rounded-[24px] p-4 border border-[#ECE5D7] shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#756C5D] mb-2">
                Пол (влияет на формулы и зону бритья)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleGenderChange('female')}
                  className={`py-3 px-3.5 rounded-2xl border text-[13.5px] font-bold flex items-center justify-center gap-2 transition-all ${
                    answers.gender === 'female'
                      ? 'bg-[#A87C44] text-white border-[#A87C44] shadow-[0_6px_18px_rgba(168,124,68,0.28)]'
                      : 'bg-[#FBF8F5] text-[#1C1813] border-[#EBE4DD] hover:border-[#D9CFC5]'
                  }`}
                >
                  <span>🌸</span>
                  <span>Женский</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenderChange('male')}
                  className={`py-3 px-3.5 rounded-2xl border text-[13.5px] font-bold flex items-center justify-center gap-2 transition-all ${
                    answers.gender === 'male'
                      ? 'bg-[#1C1813] text-white border-[#1C1813] shadow-[0_6px_18px_rgba(30,27,24,0.25)]'
                      : 'bg-[#FBF8F5] text-[#1C1813] border-[#EBE4DD] hover:border-[#D9CFC5]'
                  }`}
                >
                  <span>⚡</span>
                  <span>Мужской</span>
                </button>
              </div>
              {isMale && (
                <p className="text-[11px] text-[#786F67] mt-2 bg-[#FBF8F5] px-3 py-1.5 rounded-xl border border-[#ECE5D7]">
                  Мужской режим: ИИ учтет более плотный эпидермис, зону бритья и соберет лаконичный уход без перегруза банками.
                </p>
              )}
            </div>

            {/* Age Group Selection */}
            <div className="bg-white rounded-[24px] p-4 border border-[#ECE5D7] shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#756C5D] mb-2">
                Возраст
              </span>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map((age) => {
                  const active = answers.ageGroup === age;
                  return (
                    <button
                      key={age}
                      type="button"
                      onClick={() => handleAgeChange(age)}
                      className={`flex-1 min-w-[60px] py-2.5 px-2.5 rounded-2xl text-[12.5px] font-bold border transition-all ${
                        active
                          ? 'bg-[#A87C44] text-white border-[#A87C44] shadow-xs'
                          : 'bg-[#FBF8F5] text-[#1C1813] border-[#EBE4DD] hover:border-[#D5C9BD]'
                      }`}
                    >
                      {age}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Avatar Customization */}
            <div className="bg-white rounded-[24px] p-4 border border-[#ECE5D7] shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#756C5D] mb-2.5">
                Аватар профиля
              </span>
              <div className="flex items-center gap-3.5 mb-3">
                <UserAvatar
                  name={displayName}
                  avatarMode={answers.avatarMode}
                  telegramPhotoUrl={telegramPhotoUrl}
                  customAvatarUrl={answers.customAvatarUrl}
                  size="lg"
                />
                <div className="text-[12px] text-[#786F67] leading-snug">
                  <div className="font-bold text-[#1C1813]">
                    Привет, {displayName}!
                  </div>
                  <div className="text-[11px] text-[#756C5D] mt-0.5">
                    Выбери стильные инициалы, фото из Telegram или загрузи свою картинку
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleAvatarModeChange('initials')}
                  className={`py-2.5 px-2 rounded-xl text-[11.5px] font-bold border transition-all flex items-center justify-center gap-1 ${
                    answers.avatarMode === 'initials'
                      ? 'bg-[#F0E6D1]/80 border-[#A87C44] text-[#1C1813]'
                      : 'bg-[#FBF8F5] border-[#EBE4DD] text-[#786F67]'
                  }`}
                >
                  <span>Инициалы</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAvatarModeChange('custom')}
                  className={`py-2.5 px-2 rounded-xl text-[11.5px] font-bold border transition-all flex items-center justify-center gap-1 ${
                    answers.avatarMode === 'custom'
                      ? 'bg-[#F0E6D1]/80 border-[#A87C44] text-[#1C1813]'
                      : 'bg-[#FBF8F5] border-[#EBE4DD] text-[#786F67]'
                  }`}
                >
                  <Upload size={12} />
                  <span>Загрузить</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAvatarModeChange('telegram')}
                  className={`py-2.5 px-2 rounded-xl text-[11.5px] font-bold border transition-all flex items-center justify-center gap-1 ${
                    answers.avatarMode === 'telegram'
                      ? 'bg-[#F0E6D1]/80 border-[#A87C44] text-[#1C1813]'
                      : 'bg-[#FBF8F5] border-[#EBE4DD] text-[#786F67]'
                  }`}
                >
                  <Send size={11} />
                  <span>Из ТГ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Как ведет себя твоя кожа в течение дня? (МУЛЬТИВЫБОР + "Я НЕ ЗНАЮ") */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-3.5 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0E6D1]/70 text-[#A87C44] text-[11px] font-bold mb-2">
                <Sparkles size={12} />
                <span>Шаг 2 • Можно выбрать несколько</span>
              </div>
              <h1 className="text-[21px] font-extrabold text-[#1C1813] leading-snug tracking-tight">
                Как ведет себя твоя кожа в течение дня?
              </h1>
              <p className="text-[12.5px] text-[#756C5D] mt-1 leading-relaxed">
                Отметь один или несколько подходящих пунктов (мультивыбор)
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {SKIN_BEHAVIOR_OPTIONS.map((opt) => {
                const isChecked =
                  !answers.skinBehaviorUnknown &&
                  answers.skinBehavior.includes(opt.label);
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleToggleBehavior(opt.label)}
                    className={`w-full text-left rounded-[22px] p-3.5 border transition-all duration-200 flex items-center justify-between gap-3 active:scale-[0.99] ${
                      isChecked
                        ? 'bg-white border-[#A87C44] ring-2 ring-[#A87C44]/20 shadow-[0_8px_22px_rgba(168,124,68,0.12)]'
                        : 'bg-white border-[#ECE5D7] hover:border-[#E2D9D0] shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[18px] shrink-0 ${
                          isChecked ? 'bg-[#F0E6D1]/80' : 'bg-[#FBF8F5]'
                        }`}
                      >
                        {opt.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-bold text-[#1C1813] leading-snug">
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-[#756C5D] mt-0.5 leading-snug">
                          {opt.description}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        isChecked
                          ? 'bg-[#A87C44] text-white'
                          : 'border-2 border-[#D9D1C9] bg-white'
                      }`}
                    >
                      {isChecked && <Check size={13} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}

              {/* Separate "🤷 Я не знаю / Не разбираюсь (определим по фото)" Button */}
              <button
                type="button"
                onClick={handleSelectUnknownBehavior}
                className={`w-full text-left rounded-[22px] p-3.5 border-2 transition-all duration-200 flex items-center justify-between gap-3 mt-1 ${
                  answers.skinBehaviorUnknown
                    ? 'bg-[#1C1813] text-white border-[#1C1813] shadow-md'
                    : 'bg-[#F4F0E8] text-[#1C1813] border-dashed border-[#D6CCC2] hover:border-[#1C1813]'
                }`}
              >
                <div className="text-[13px] font-bold leading-snug">
                  {SKIN_BEHAVIOR_UNKNOWN_LABEL}
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    answers.skinBehaviorUnknown
                      ? 'bg-[#A87C44] text-white'
                      : 'border-2 border-[#756C5D]'
                  }`}
                >
                  {answers.skinBehaviorUnknown && <Check size={13} strokeWidth={3} />}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Какие задачи хочешь решить? (МУЛЬТИВЫБОР) */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-3.5 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0E6D1]/70 text-[#A87C44] text-[11px] font-bold mb-2">
                <Sparkles size={12} />
                <span>Шаг 3 • Выбери от 1 до всех задач</span>
              </div>
              <h1 className="text-[21px] font-extrabold text-[#1C1813] leading-snug tracking-tight">
                Какие задачи хочешь решить?
              </h1>
              <p className="text-[12.5px] text-[#756C5D] mt-1 leading-relaxed">
                ИИ-химик подберет активы точно под выбранные цели без конфликтов
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {SKIN_GOALS_OPTIONS.map((goal) => {
                const isSelected = answers.goals.includes(goal.label);
                return (
                  <button
                    key={goal.label}
                    type="button"
                    onClick={() => handleToggleGoal(goal.label)}
                    className={`w-full text-left rounded-[20px] p-3 border transition-all duration-200 flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-white border-[#A87C44] ring-2 ring-[#A87C44]/20 shadow-xs'
                        : 'bg-white border-[#ECE5D7] hover:border-[#E2D9D0]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-9 h-9 rounded-xl bg-[#FBF8F5] flex items-center justify-center text-[17px] shrink-0">
                        {goal.emoji}
                      </span>
                      <span className="text-[13px] font-bold text-[#1C1813] leading-snug">
                        {goal.label}
                      </span>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-[#A87C44] text-white'
                          : 'border-2 border-[#D9D1C9] bg-white'
                      }`}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Твой текущий арсенал и бюджет */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0E6D1]/70 text-[#A87C44] text-[11px] font-bold mb-2">
                <Sparkles size={12} />
                <span>Шаг 4 • Финальный штрих</span>
              </div>
              <h1 className="text-[21px] font-extrabold text-[#1C1813] leading-snug tracking-tight">
                Твой текущий арсенал и бюджет
              </h1>
              <p className="text-[12.5px] text-[#756C5D] mt-1 leading-relaxed">
                Чем ты пользуешься сейчас и какой бюджет комфортен?
              </p>
            </div>

            {/* Question 1: Чем ты пользуешься сейчас? */}
            <div>
              <span className="block text-[11.5px] font-bold text-[#1C1813] mb-2">
                Чем ты пользуешься сейчас?
              </span>
              <div className="flex flex-col gap-2">
                {CURRENT_ARSENAL_OPTIONS.map((ars) => {
                  const active = answers.currentArsenal === ars.label;
                  return (
                    <button
                      key={ars.label}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, currentArsenal: ars.label }))
                      }
                      className={`w-full text-left rounded-[20px] p-3 border transition-all flex items-center justify-between gap-3 ${
                        active
                          ? 'bg-white border-[#A87C44] ring-2 ring-[#A87C44]/20 shadow-xs'
                          : 'bg-white border-[#ECE5D7]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-xl bg-[#FBF8F5] flex items-center justify-center text-[17px] shrink-0">
                          {ars.emoji}
                        </span>
                        <div>
                          <div className="text-[13px] font-bold text-[#1C1813] leading-snug">
                            {ars.label}
                          </div>
                          <div className="text-[11px] text-[#756C5D] mt-0.5">
                            {ars.description}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          active
                            ? 'bg-[#A87C44] text-white'
                            : 'border-2 border-[#D9D1C9]'
                        }`}
                      >
                        {active && <Check size={12} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 2: Комфортный бюджет на одно средство */}
            <div>
              <span className="block text-[11.5px] font-bold text-[#1C1813] mb-2">
                Комфортный бюджет на одно средство:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {BUDGET_OPTIONS.map((b) => {
                  const active = answers.budget === b.label;
                  return (
                    <button
                      key={b.label}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, budget: b.label }))
                      }
                      className={`text-left rounded-[18px] p-3 border transition-all flex flex-col justify-between ${
                        active
                          ? 'bg-[#1C1813] text-white border-[#1C1813] shadow-sm'
                          : 'bg-white text-[#1C1813] border-[#ECE5D7]'
                      }`}
                    >
                      <span className="text-[13px] font-extrabold">{b.label}</span>
                      <span
                        className={`text-[10.5px] mt-1 leading-tight ${
                          active ? 'text-white/80' : 'text-[#756C5D]'
                        }`}
                      >
                        {b.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className="pt-6 flex flex-col gap-2.5">
        <button
          type="button"
          disabled={!canProceedFromCurrentStep()}
          onClick={handleNext}
          className="w-full py-4 px-5 rounded-full bg-[#A87C44] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(168,124,68,0.35)] hover:bg-[#e5604d] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <span>
            {currentStep < totalSteps - 1
              ? 'Далее'
              : 'Завершить регистрацию'}
          </span>
          <ArrowRight size={17} strokeWidth={2.5} />
        </button>

        {currentStep === totalSteps - 1 && (
          <button
            type="button"
            disabled={!canProceedFromCurrentStep()}
            onClick={() => {
              const finalName =
                userName.trim() || (answers.gender === 'male' ? 'Алекс' : 'Аня');
              onComplete(finalName, answers, true);
            }}
            className="w-full py-3.5 px-5 rounded-full bg-white border border-[#EBE4DD] text-[#1C1813] text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#F4F0E8] active:scale-[0.98] transition-all"
          >
            <ScanFace size={16} className="text-[#A87C44]" />
            <span>Сохранить и сразу запустить AI-скан лица</span>
          </button>
        )}
      </div>
    </div>
  );
};
