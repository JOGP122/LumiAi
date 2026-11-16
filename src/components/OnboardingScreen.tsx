import React, { useState, useRef } from 'react';
import {
  Sparkles,
  ChevronRight,
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

const ICON_BUTTON =
  'w-9 h-9 rounded-full border border-[#E6DFCF] bg-[#FCFAF4] flex items-center justify-center active:scale-95 transition-transform shrink-0';
const CARD =
  'bg-[#FCFAF4] rounded-[20px] p-[18px] shadow-[0_12px_32px_-16px_rgba(61,52,38,0.1)]';

const STEP_META = [
  { overline: 'Знакомство', title: 'Базовые данные', question: 'Как к тебе обращаться?' },
  { overline: 'Поведение кожи', title: 'Поведение кожи', question: 'Как кожа ведёт себя к концу дня?' },
  { overline: 'Задачи', title: 'Задачи кожи', question: 'Какие задачи хочешь решить?' },
  { overline: 'Арсенал и бюджет', title: 'Арсенал и бюджет', question: 'Чем пользуешься сейчас и какой бюджет?' }
];

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
  const step = STEP_META[currentStep];

  const isMale = answers.gender === 'male';
  const displayName = userName.trim() || (isMale ? 'Алекс' : 'Аня');

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

  const handleToggleBehavior = (label: string) => {
    setAnswers((prev) => {
      const updated = toggleSkinBehaviorOption(prev.skinBehavior, label);
      return { ...prev, ...updated };
    });
  };

  const handleSelectUnknownBehavior = () => {
    setAnswers((prev) => ({ ...prev, ...selectSkinBehaviorUnknown() }));
  };

  const handleToggleGoal = (goal: string) => {
    setAnswers((prev) => ({ ...prev, goals: toggleSkinGoalOption(prev.goals, goal) }));
  };

  const canProceedFromCurrentStep = () => {
    if (currentStep === 0) return userName.trim().length > 0;
    if (currentStep === 1)
      return answers.skinBehaviorUnknown || answers.skinBehavior.length > 0;
    if (currentStep === 2) return answers.goals.length > 0;
    return Boolean(answers.currentArsenal && answers.budget);
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onComplete(displayName, answers, false);
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

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F4F0E8] select-none">
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
        aria-label="Загрузить фото аватара"
      />

      <div className="flex flex-col gap-5 px-5 pt-6 flex-1">
        {/* Header: back + overline + Cormorant title */}
        <header className="flex items-center gap-3.5">
          {currentStep > 0 || onCancel ? (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Назад к предыдущему шагу"
              className={ICON_BUTTON}
            >
              <ChevronLeft size={14} className="text-[#1C1813]" />
            </button>
          ) : (
            <span className="w-9" />
          )}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#A87C44]">
              Анкета — вопрос {currentStep + 1} из {totalSteps}
            </span>
            <h1 className="font-serif text-[26px] font-medium leading-[30px] text-[#1C1813]">
              {step.title}
            </h1>
          </div>
        </header>

        {/* Progress */}
        <div className="w-full h-1 bg-[#ECE5D7] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#A87C44] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* STEP 1: Базовые данные */}
        {currentStep === 0 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <h2 className="font-serif text-[24px] font-medium leading-[29px] text-[#1C1813]">
              {step.question}
            </h2>

            <div className={CARD}>
              <label
                htmlFor="onboarding-user-name"
                className="block text-[11px] font-bold tracking-[1.8px] uppercase text-[#A87C44] mb-2"
              >
                Твоё имя
              </label>
              <div className="flex items-center gap-2.5 bg-[#ECE5D7]/50 rounded-[12px] px-3.5 py-3 border border-[#E6DFCF]">
                <User size={15} className="text-[#A87C44] shrink-0" />
                <input
                  id="onboarding-user-name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Введи имя..."
                  className="w-full bg-transparent text-[14px] font-semibold text-[#1C1813] placeholder:text-[#A79C8A] placeholder:font-normal focus:outline-none"
                />
              </div>
            </div>

            <div className={CARD}>
              <span className="block text-[11px] font-bold tracking-[1.8px] uppercase text-[#A87C44] mb-2">
                Пол
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {(
                  [
                    { g: 'female' as UserGender, label: 'Женский' },
                    { g: 'male' as UserGender, label: 'Мужской' }
                  ]
                ).map(({ g, label }) => {
                  const active = answers.gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setAnswers((p) => ({ ...p, gender: g }))}
                      className={`h-[48px] rounded-[14px] border text-[13.5px] font-semibold flex items-center justify-center transition-all ${
                        active
                          ? 'bg-[#1C1813] text-[#F5F0E5] border-[#1C1813]'
                          : 'bg-[#FCFAF4] text-[#1C1813] border-[#E6DFCF] active:border-[#A87C44]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {isMale && (
                <p className="text-[11.5px] text-[#756C5D] mt-2.5 bg-[#ECE5D7]/50 px-3 py-2 rounded-[10px] leading-relaxed">
                  Мужской режим: ИИ учтёт плотный эпидермис, зону бритья и
                  соберёт лаконичный уход без перегруза банками.
                </p>
              )}
            </div>

            <div className={CARD}>
              <span className="block text-[11px] font-bold tracking-[1.8px] uppercase text-[#A87C44] mb-2">
                Возраст
              </span>
              <div className="h-9 rounded-full bg-[#ECE5D7] p-[3px] flex gap-0.5">
                {AGE_GROUPS.map((age) => {
                  const active = answers.ageGroup === age;
                  return (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setAnswers((p) => ({ ...p, ageGroup: age }))}
                      className={`flex-1 h-full rounded-full text-[12px] transition-all ${
                        active
                          ? 'bg-[#FCFAF4] font-semibold text-[#1C1813] shadow-sm'
                          : 'font-medium text-[#756C5D]'
                      }`}
                    >
                      {age}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={CARD}>
              <span className="block text-[11px] font-bold tracking-[1.8px] uppercase text-[#A87C44] mb-2.5">
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
                <div className="text-[12px] text-[#756C5D] leading-snug">
                  <div className="font-semibold text-[#1C1813]">
                    Привет, {displayName}!
                  </div>
                  <div className="text-[11px] mt-0.5">
                    Инициалы, фото из Telegram или своя картинка
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { m: 'initials' as AvatarMode, label: 'Инициалы' },
                    { m: 'custom' as AvatarMode, label: 'Загрузить', icon: <Upload size={12} /> },
                    { m: 'telegram' as AvatarMode, label: 'Из ТГ', icon: <Send size={11} /> }
                  ]
                ).map(({ m, label, icon }) => {
                  const active = answers.avatarMode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() =>
                        m === 'custom'
                          ? avatarFileInputRef.current?.click()
                          : setAnswers((p) => ({ ...p, avatarMode: m }))
                      }
                      className={`py-2.5 px-2 rounded-[12px] text-[11.5px] border flex items-center justify-center gap-1 transition-all ${
                        active
                          ? 'bg-[#F0E6D1] border-[#A87C44] text-[#1C1813] font-semibold'
                          : 'bg-[#FCFAF4] border-[#E6DFCF] text-[#756C5D] font-medium'
                      }`}
                    >
                      {icon}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Поведение кожи (мультивыбор, стиль radio из screen.quiz) */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <h2 className="font-serif text-[24px] font-medium leading-[29px] text-[#1C1813]">
              {step.question}
            </h2>

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
                    className={`w-full text-left rounded-[16px] py-4 px-[18px] border transition-all flex items-center gap-3 active:scale-[0.99] ${
                      isChecked
                        ? 'bg-[#F0E6D1] border-[#A87C44]'
                        : 'bg-[#FCFAF4] border-[#E6DFCF]'
                    }`}
                  >
                    <span
                      className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
                        isChecked ? 'border-[#A87C44]' : 'border-[#E6DFCF]'
                      }`}
                    >
                      {isChecked && (
                        <span className="w-[10px] h-[10px] rounded-full bg-[#A87C44]" />
                      )}
                    </span>
                    <span
                      className={`flex-1 text-[14.5px] leading-snug ${
                        isChecked
                          ? 'font-semibold text-[#1C1813]'
                          : 'font-medium text-[#1C1813]'
                      }`}
                    >
                      {opt.label}
                      <span className="block text-[11.5px] text-[#756C5D] font-normal mt-0.5">
                        {opt.description}
                      </span>
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleSelectUnknownBehavior}
                className={`w-full text-left rounded-[16px] py-4 px-[18px] border-[1.5px] border-dashed transition-all flex items-center gap-3 ${
                  answers.skinBehaviorUnknown
                    ? 'bg-[#1C1813] border-[#1C1813]'
                    : 'bg-[#F4F0E8] border-[#C9BEAC] active:border-[#1C1813]'
                }`}
              >
                <span
                  className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
                    answers.skinBehaviorUnknown
                      ? 'border-[#CDA872]'
                      : 'border-[#A79C8A]'
                  }`}
                >
                  {answers.skinBehaviorUnknown && (
                    <span className="w-[10px] h-[10px] rounded-full bg-[#CDA872]" />
                  )}
                </span>
                <span
                  className={`flex-1 text-[14px] font-semibold ${
                    answers.skinBehaviorUnknown ? 'text-[#F5F0E5]' : 'text-[#1C1813]'
                  }`}
                >
                  {SKIN_BEHAVIOR_UNKNOWN_LABEL}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Задачи (мультивыбор) */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <h2 className="font-serif text-[24px] font-medium leading-[29px] text-[#1C1813]">
              {step.question}
            </h2>

            <div className="flex flex-col gap-2.5">
              {SKIN_GOALS_OPTIONS.map((goal) => {
                const isSelected = answers.goals.includes(goal.label);
                return (
                  <button
                    key={goal.label}
                    type="button"
                    onClick={() => handleToggleGoal(goal.label)}
                    className={`w-full text-left rounded-[16px] py-4 px-[18px] border transition-all flex items-center gap-3 active:scale-[0.99] ${
                      isSelected
                        ? 'bg-[#F0E6D1] border-[#A87C44]'
                        : 'bg-[#FCFAF4] border-[#E6DFCF]'
                    }`}
                  >
                    <span
                      className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#A87C44]' : 'border-[#E6DFCF]'
                      }`}
                    >
                      {isSelected && (
                        <span className="w-[10px] h-[10px] rounded-full bg-[#A87C44]" />
                      )}
                    </span>
                    <span
                      className={`flex-1 text-[14.5px] ${
                        isSelected ? 'font-semibold' : 'font-medium'
                      } text-[#1C1813]`}
                    >
                      {goal.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Арсенал + бюджет */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <h2 className="font-serif text-[24px] font-medium leading-[29px] text-[#1C1813]">
              {step.question}
            </h2>

            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#A87C44]">
                Чем пользуешься сейчас?
              </span>
              {CURRENT_ARSENAL_OPTIONS.map((ars) => {
                const active = answers.currentArsenal === ars.label;
                return (
                  <button
                    key={ars.label}
                    type="button"
                    onClick={() =>
                      setAnswers((p) => ({ ...p, currentArsenal: ars.label }))
                    }
                    className={`w-full text-left rounded-[16px] py-4 px-[18px] border transition-all flex items-center gap-3 ${
                      active
                        ? 'bg-[#F0E6D1] border-[#A87C44]'
                        : 'bg-[#FCFAF4] border-[#E6DFCF]'
                    }`}
                  >
                    <span
                      className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
                        active ? 'border-[#A87C44]' : 'border-[#E6DFCF]'
                      }`}
                    >
                      {active && (
                        <span className="w-[10px] h-[10px] rounded-full bg-[#A87C44]" />
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span
                        className={`block text-[14.5px] ${
                          active ? 'font-semibold' : 'font-medium'
                        } text-[#1C1813]`}
                      >
                        {ars.label}
                      </span>
                      <span className="block text-[11.5px] text-[#756C5D] mt-0.5">
                        {ars.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] font-bold tracking-[1.8px] uppercase text-[#A87C44]">
                Бюджет на одно средство
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {BUDGET_OPTIONS.map((b) => {
                  const active = answers.budget === b.label;
                  return (
                    <button
                      key={b.label}
                      type="button"
                      onClick={() => setAnswers((p) => ({ ...p, budget: b.label }))}
                      className={`rounded-[16px] p-4 border text-left transition-all flex flex-col gap-1 ${
                        active
                          ? 'bg-[#1C1813] border-[#1C1813]'
                          : 'bg-[#FCFAF4] border-[#E6DFCF]'
                      }`}
                    >
                      <span
                        className={`text-[13.5px] font-semibold ${
                          active ? 'text-[#F5F0E5]' : 'text-[#1C1813]'
                        }`}
                      >
                        {b.label}
                      </span>
                      <span
                        className={`text-[10.5px] leading-tight ${
                          active ? 'text-[#B4A993]' : 'text-[#756C5D]'
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

      {/* Bottom actions */}
      <div className="flex flex-col gap-2.5 px-5 pt-6 pb-8">
        <button
          type="button"
          disabled={!canProceedFromCurrentStep()}
          onClick={handleNext}
          className="w-full h-[52px] rounded-[14px] bg-[#1C1813] text-[#F5F0E5] text-[15px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-40"
        >
          <span>
            {currentStep < totalSteps - 1 ? 'Далее' : 'Завершить регистрацию'}
          </span>
          <ChevronRight size={13} />
        </button>

        {currentStep === totalSteps - 1 && (
          <button
            type="button"
            disabled={!canProceedFromCurrentStep()}
            onClick={() => onComplete(displayName, answers, true)}
            className="w-full h-[48px] rounded-[14px] bg-transparent border border-[#E6DFCF] text-[#1C1813] text-[13.5px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            <ScanFace size={15} className="text-[#A87C44]" />
            <span>Сохранить и сразу запустить AI-скан лица</span>
          </button>
        )}

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="self-center text-[13px] font-semibold text-[#84622F] py-1 active:opacity-70"
          >
            Ответить позже
          </button>
        )}
      </div>
    </div>
  );
};
