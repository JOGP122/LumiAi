import {
  Product,
  ProductCategory,
  RoutineStep,
  CalendarDay,
  DayCompletionStatus,
  RoutineCompletionByDate,
  UserSkinProfile,
  CartItem,
  OnboardingAnswers,
  FaceAnalysisResult,
  ScanHistoryItem,
  AgeGroup,
  UserGender
} from '../types';

export const STORAGE_KEY = 'lumi_concierge_clean_state_v3';
export const ROUTINE_HISTORY_STORAGE_KEY = 'lumi_routine_history_by_date_v1';
export const TELEGRAM_CONFIG_STORAGE_KEY = 'lumi_telegram_bot_config_v1';
export const DEFAULT_BOT_USERNAME = 'lum_betai_ai_bot';

export const AGE_GROUPS: AgeGroup[] = [
  'До 18',
  '18–24',
  '25–30',
  '31–40',
  '40+'
];

export const SKIN_BEHAVIOR_OPTIONS: {
  label: string;
  description: string;
  emoji: string;
}[] = [
  {
    label: 'Стягивает и сохнет после умывания',
    description: 'Хочется сразу нанести увлажняющий крем после контакта с водой',
    emoji: '🌵'
  },
  {
    label: 'Появляется жирный блеск на лбу и носу',
    description: 'Т-зона блестит, а щеки остаются нормальными или сухими',
    emoji: '✨'
  },
  {
    label: 'Блестит всё лицо уже к обеду',
    description: 'Активная работа сальных желез по всей поверхности лица',
    emoji: '💧'
  },
  {
    label: 'Бывают шелушения и покраснения',
    description: 'Реакция на холод, ветер, бритье или новые средства',
    emoji: '🌷'
  },
  {
    label: 'В целом комфортно, ничего не беспокоит',
    description: 'Сбалансированное состояние без стянутости и жирного блеска',
    emoji: '🌸'
  }
];

export const SKIN_BEHAVIOR_UNKNOWN_LABEL =
  '🤷 Я не знаю / Не разбираюсь (определим по фото)';

export const SKIN_GOALS_OPTIONS: {
  label: string;
  emoji: string;
}[] = [
  { label: 'Убрать прыщи и воспаления', emoji: '🎯' },
  { label: 'Очистить черные точки и сузить поры', emoji: '🔍' },
  { label: 'Убрать сухость и стянутость', emoji: '🫧' },
  { label: 'Избавиться от следов постакне и пятен', emoji: '☀️' },
  { label: 'Убрать раздражение (в т.ч. после бритья)', emoji: '🛡️' },
  { label: 'Снять отеки и синяки под глазами', emoji: '🧊' },
  { label: 'Подобрать простой базовый уход на каждый день', emoji: '✨' }
];

export const CURRENT_ARSENAL_OPTIONS: {
  label: string;
  description: string;
  emoji: string;
}[] = [
  {
    label: 'У меня ничего нет, хочу собрать уход с нуля',
    description: 'Соберем лаконичную базу без лишних банок',
    emoji: '🌱'
  },
  {
    label: 'У меня уже есть банки, добавлю их позже на проверку',
    description: 'Проверим твои средства через INCI-сканер составов',
    emoji: '🧴'
  },
  {
    label: 'Только умывалка / мыло',
    description: 'Добавим базовое увлажнение и защиту барьера',
    emoji: '🧼'
  }
];

export const BUDGET_OPTIONS: {
  label: string;
  description: string;
}[] = [
  { label: 'До 1 000 ₽', description: 'Базовые аптечные и доступные линейки' },
  { label: '1 000 – 2 500 ₽', description: 'CeraVe, Гельтек, Aravia, The Ordinary' },
  { label: '2 500 – 5 000 ₽', description: 'La Roche-Posay, Bioderma, Dr.Jart+' },
  { label: 'Не имеет значения', description: 'Подбор лучших формул без ограничений' }
];

export const DEFAULT_ONBOARDING_ANSWERS: OnboardingAnswers = {
  gender: 'female',
  ageGroup: '18–24',
  avatarMode: 'initials',
  skinBehavior: [],
  skinBehaviorUnknown: false,
  goals: ['Подобрать простой базовый уход на каждый день'],
  currentArsenal: 'У меня ничего нет, хочу собрать уход с нуля',
  budget: '1 000 – 2 500 ₽'
};

/**
 * Clean State Initial Profile:
 * No fake 82/100 score, no fake 12-day streak, no stock photo of a girl.
 */
export const USER_PROFILE: UserSkinProfile = {
  name: 'Гость',
  gender: 'female',
  ageGroup: '18–24',
  avatarMode: 'initials',
  greeting: 'Привет ✨',
  subtitle: 'Твой персональный план ухода',
  healthIndex: null,
  healthMax: 100,
  skinType: 'Не определен — сделай AI-скан',
  streakDays: 0,
  tier: 'AI-консьерж LUMI',
  completedScans: 0,
  budgetSaved: 0,
  onboarding: DEFAULT_ONBOARDING_ANSWERS
};

export const CATEGORY_FILTERS: { id: ProductCategory; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'cleansing', label: 'Очищение' },
  { id: 'serums', label: 'Сыворотки' },
  { id: 'creams', label: 'Кремы' },
  { id: 'spf', label: 'SPF' }
];

export const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80'
];

// Clean State: initially empty! Populated only when AI generates routine or user adds products.
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_CART_ITEMS: CartItem[] = [];
export const INITIAL_ROUTINE_STEPS: RoutineStep[] = [];
export const SCAN_HISTORY: ScanHistoryItem[] = [];

const RUSSIAN_WEEKDAYS_SHORT = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'] as const;
const RUSSIAN_WEEKDAYS_FULL = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье'
] as const;

const RUSSIAN_MONTHS_NOMINATIVE = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь'
] as const;

const RUSSIAN_MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря'
] as const;

/**
 * Pure helper to format any local Date into YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Pure helper to parse YYYY-MM-DD into a local Date at noon (avoids DST edge cases)
 */
export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  }
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/**
 * Pure helper to format a Russian full date heading for a given YYYY-MM-DD key
 * e.g. "Вторник, 27 октября — Сегодня"
 */
export function formatRussianDateHeading(
  dateKey: string,
  todayDate: Date = new Date()
): string {
  const target = parseDateKey(dateKey);
  const todayNoon = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate(),
    12,
    0,
    0,
    0
  );

  const jsDay = target.getDay(); // 0 (Sun) .. 6 (Sat)
  const mondayIndex = jsDay === 0 ? 6 : jsDay - 1; // 0 (Mon) .. 6 (Sun)
  const weekdayFull = RUSSIAN_WEEKDAYS_FULL[mondayIndex];
  const dayNum = target.getDate();
  const monthGenitive = RUSSIAN_MONTHS_GENITIVE[target.getMonth()];

  const diffDays = Math.round(
    (target.getTime() - todayNoon.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return `${weekdayFull}, ${dayNum} ${monthGenitive} — Сегодня`;
  }
  if (diffDays === -1) {
    return `${weekdayFull}, ${dayNum} ${monthGenitive} — Вчера`;
  }
  if (diffDays === 1) {
    return `${weekdayFull}, ${dayNum} ${monthGenitive} — Завтра`;
  }
  return `${weekdayFull}, ${dayNum} ${monthGenitive}`;
}

/**
 * Pure helper to build a 7-day Monday–Sunday (ПН–ВС) week array for any weekOffset
 * weekOffset = 0 -> current week, -1 -> previous week, +1 -> next week
 */
export function getWeekDays(
  todayDate: Date = new Date(),
  weekOffset: number = 0
): CalendarDay[] {
  const baseNoon = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate(),
    12,
    0,
    0,
    0
  );
  const todayKey = formatDateKey(baseNoon);

  const jsDay = baseNoon.getDay(); // 0 = Sun, 1 = Mon .. 6 = Sat
  const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay;

  const monday = new Date(baseNoon);
  monday.setDate(baseNoon.getDate() + diffToMonday + weekOffset * 7);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateKey = formatDateKey(d);
    const monthName = RUSSIAN_MONTHS_NOMINATIVE[d.getMonth()];
    const year = d.getFullYear();

    days.push({
      dateKey,
      dayNumber: d.getDate(),
      dayName: RUSSIAN_WEEKDAYS_SHORT[i],
      fullDateLabel: formatRussianDateHeading(dateKey, baseNoon),
      monthYearLabel: `${monthName} ${year}`,
      isToday: dateKey === todayKey
    });
  }

  return days;
}

/**
 * Pure helper to get the Month + Year header label for a given 7-day week
 * Uses the selected day if it belongs to the displayed week, otherwise uses Thursday (middle of week)
 */
export function getWeekMonthYearLabel(
  weekDays: CalendarDay[],
  selectedDateKey?: string
): string {
  if (weekDays.length === 0) return '';
  if (selectedDateKey) {
    const found = weekDays.find((d) => d.dateKey === selectedDateKey);
    if (found) return found.monthYearLabel;
  }
  const midDay = weekDays[3] || weekDays[0];
  return midDay.monthYearLabel;
}


/**
 * Pure helper to extract 1-2 uppercase initials from user name
 */
export function getUserInitials(name?: string): string {
  const cleaned = (name || '').trim();
  if (!cleaned) return 'L';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Gender-aware copy helper for Russian UI
 */
export function getGenderCopy(gender: UserGender) {
  const isMale = gender === 'male';
  return {
    passedVerb: isMale ? 'Ты прошел' : 'Ты прошла',
    readyAdj: isMale ? 'Готов' : 'Готова',
    unsureLabel: isMale
      ? '🤷 Я не знаю / Не разбираюсь (определим по фото)'
      : '🤷 Я не знаю / Не разбираюсь (определим по фото)',
    genderLabel: isMale ? 'Мужской уход' : 'Женский уход',
    routineSubtitle: isMale
      ? 'Лаконичный мужской уход и защита зоны бритья'
      : 'Твой персональный план ухода за кожей'
  };
}

/**
 * Pure multi-select toggle for Step 2 skin behavior checkboxes
 * Selecting any checkbox automatically clears `skinBehaviorUnknown`
 */
export function toggleSkinBehaviorOption(
  current: string[],
  option: string
): { skinBehavior: string[]; skinBehaviorUnknown: boolean } {
  const exists = current.includes(option);
  const next = exists ? current.filter((item) => item !== option) : [...current, option];
  return {
    skinBehavior: next,
    skinBehaviorUnknown: false
  };
}

/**
 * Pure handler for clicking "🤷 Я не знаю / Не разбираюсь (определим по фото)"
 * Clears all other checkboxes and marks skinBehaviorUnknown = true
 */
export function selectSkinBehaviorUnknown(): {
  skinBehavior: string[];
  skinBehaviorUnknown: boolean;
} {
  return {
    skinBehavior: [],
    skinBehaviorUnknown: true
  };
}

/**
 * Pure multi-select toggle for Step 3 goals
 */
export function toggleSkinGoalOption(current: string[], goal: string): string[] {
  const exists = current.includes(goal);
  if (exists) {
    return current.filter((item) => item !== goal);
  }
  return [...current, goal];
}

/**
 * Pure function to derive skin type summary from flexible onboarding answers
 * without inventing a fake skin score or fake streak.
 */
export function deriveSkinProfileFromOnboarding(
  currentProfile: UserSkinProfile,
  name: string,
  answers: OnboardingAnswers
): UserSkinProfile {
  const cleanName = name.trim() || 'Гость';
  const copy = getGenderCopy(answers.gender);

  let skinType = 'Определим после AI-диагностики';

  if (!answers.skinBehaviorUnknown && answers.skinBehavior.length > 0) {
    const joined = answers.skinBehavior.join(' ').toLowerCase();
    const parts: string[] = [];

    if (joined.includes('стягивает') && joined.includes('блеск на лбу')) {
      parts.push('Комбинированная, обезвоженная');
    } else if (joined.includes('блестит всё лицо')) {
      parts.push('Жирная кожа');
    } else if (joined.includes('блеск на лбу')) {
      parts.push('Комбинированная кожа');
    } else if (joined.includes('стягивает')) {
      parts.push('Сухая кожа');
    } else if (joined.includes('комфортно')) {
      parts.push('Нормальная кожа');
    }

    if (joined.includes('шелушения') || joined.includes('покраснения')) {
      parts.push('чувствительная');
    }

    if (parts.length > 0) {
      skinType = parts.join(', ');
    }
  }

  return {
    ...currentProfile,
    name: cleanName,
    gender: answers.gender,
    ageGroup: answers.ageGroup,
    avatarMode: answers.avatarMode,
    customAvatarUrl: answers.customAvatarUrl ?? currentProfile.customAvatarUrl,
    greeting: `Привет, ${cleanName} ✨`,
    subtitle: copy.routineSubtitle,
    skinType,
    onboarding: {
      ...answers,
      completedAt: new Date().toISOString()
    }
  };
}

/**
 * Pure state toggle function for routine items
 */
export function toggleRoutineStep(steps: RoutineStep[], stepId: string): RoutineStep[] {
  return steps.map((step) =>
    step.id === stepId ? { ...step, completed: !step.completed } : step
  );
}

/**
 * Pure date-bound toggle for routine steps keyed by YYYY-MM-DD
 */
export function toggleRoutineStepForDate(
  history: RoutineCompletionByDate,
  dateKey: string,
  stepId: string
): RoutineCompletionByDate {
  const existing = history[dateKey] || [];
  const isCompleted = existing.includes(stepId);
  const nextList = isCompleted
    ? existing.filter((id) => id !== stepId)
    : [...existing, stepId];

  const nextHistory: RoutineCompletionByDate = { ...history };
  if (nextList.length === 0) {
    delete nextHistory[dateKey];
  } else {
    nextHistory[dateKey] = nextList;
  }
  return nextHistory;
}

/**
 * Pure projection of routine steps with completion status for a specific YYYY-MM-DD date
 */
export function getRoutineStepsForDate(
  steps: RoutineStep[],
  history: RoutineCompletionByDate,
  dateKey: string
): RoutineStep[] {
  const completedIds = new Set(history[dateKey] || []);
  return steps.map((step) => ({
    ...step,
    completed: completedIds.has(step.id)
  }));
}

/**
 * Pure calculation for a day's progress dot status:
 * - 'full' if 100% of active routine steps are completed on that day
 * - 'partial' if > 0 and < 100% of active routine steps are completed on that day
 * - 'none' if 0 steps are completed or totalSteps === 0
 */
export function getDayCompletionStatus(
  history: RoutineCompletionByDate,
  dateKey: string,
  validStepIds: string[]
): DayCompletionStatus {
  const total = validStepIds.length;
  if (total === 0) return 'none';
  const dayCompleted = history[dateKey] || [];
  if (dayCompleted.length === 0) return 'none';

  const validSet = new Set(validStepIds);
  const completedCount = dayCompleted.filter((id) => validSet.has(id)).length;

  if (completedCount === 0) return 'none';
  if (completedCount >= total) return 'full';
  return 'partial';
}

/**
 * Pure calculation for consecutive active care days ("🔥 X дней подряд")
 * Counts consecutive days leading up to today (or yesterday if today hasn't been marked yet)
 * where at least one valid routine step was completed.
 */
export function calculateStreakFromHistory(
  history: RoutineCompletionByDate,
  validStepIds: string[],
  todayDate: Date = new Date()
): number {
  if (validStepIds.length === 0) return 0;
  const validSet = new Set(validStepIds);

  const hasActivityOnDate = (d: Date): boolean => {
    const key = formatDateKey(d);
    const list = history[key] || [];
    return list.some((id) => validSet.has(id));
  };

  const cursor = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate(),
    12,
    0,
    0,
    0
  );

  // If today is not marked yet, check if yesterday has a streak going
  if (!hasActivityOnDate(cursor)) {
    cursor.setDate(cursor.getDate() - 1);
    if (!hasActivityOnDate(cursor)) {
      return 0;
    }
  }

  let streak = 0;
  while (hasActivityOnDate(cursor)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
    if (streak > 3650) break; // safety cap
  }

  return streak;
}

/**
 * Pure calculation for completion progress
 */
export function calculateRoutineProgress(steps: RoutineStep[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = steps.length;
  if (total === 0) return { completed: 0, total: 0, percentage: 0 };
  const completed = steps.filter((s) => s.completed).length;
  const percentage = Math.round((completed / total) * 100);
  return { completed, total, percentage };
}

/**
 * Pure filter function for products by category
 */
export function filterProducts(products: Product[], category: ProductCategory): Product[] {
  if (category === 'all') return products;
  return products.filter((p) => p.category === category);
}

/**
 * Pure toggle for product favorite
 */
export function toggleProductFavorite(products: Product[], productId: string): Product[] {
  return products.map((product) =>
    product.id === productId ? { ...product, isFavorite: !product.isFavorite } : product
  );
}

/**
 * Pure calculate cart total price
 */
export function calculateCartTotal(items: CartItem[]): {
  subtotal: number;
  cashback: number;
  total: number;
} {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cashback = Math.round(subtotal * 0.05);
  return {
    subtotal,
    cashback,
    total: subtotal
  };
}

/**
 * Change quantity in cart
 */
export function updateCartQuantity(
  items: CartItem[],
  itemId: string,
  delta: number
): CartItem[] {
  return items
    .map((item) => {
      if (item.id === itemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    })
    .filter((item): item is CartItem => item !== null);
}

/**
 * Transform AI FaceAnalysisResult into updated RoutineStep[], Product[], and CartItem[]
 */
export function buildStateFromFaceAnalysis(
  analysis: FaceAnalysisResult,
  currentProfile: UserSkinProfile
): {
  updatedProfile: UserSkinProfile;
  newRoutineSteps: RoutineStep[];
  newProducts: Product[];
  newCartItems: CartItem[];
} {
  const iconBgs = ['#E0F2FE', '#FEF3C7', '#FCE7F3', '#F3E8FF', '#F1F5F9'];

  const morningSteps: RoutineStep[] = (analysis.morningRoutine || []).map((item, idx) => ({
    id: `ai-m-${idx + 1}`,
    section: 'morning',
    stepCategory: item.stepCategory || 'Утренний уход',
    time: item.time || `08:${(idx * 15).toString().padStart(2, '0')}`,
    name: item.name,
    brand: item.brand,
    description: item.whyItFits,
    imageUrl: PRODUCT_IMAGES[idx % PRODUCT_IMAGES.length],
    completed: false,
    iconBg: iconBgs[idx % iconBgs.length],
    price: item.price || 1400,
    partnerStore: item.partnerStore === 'Лэтуаль' ? 'Лэтуаль' : 'Золотое Яблоко'
  }));

  const eveningSteps: RoutineStep[] = (analysis.eveningRoutine || []).map((item, idx) => ({
    id: `ai-e-${idx + 1}`,
    section: 'evening',
    stepCategory: item.stepCategory || 'Вечерний уход',
    time: item.time || `21:${(idx * 15).toString().padStart(2, '0')}`,
    name: item.name,
    brand: item.brand,
    description: item.whyItFits,
    imageUrl: PRODUCT_IMAGES[(idx + 2) % PRODUCT_IMAGES.length],
    completed: false,
    iconBg: iconBgs[(idx + 2) % iconBgs.length],
    price: item.price || 1600,
    partnerStore: item.partnerStore === 'Лэтуаль' ? 'Лэтуаль' : 'Золотое Яблоко'
  }));

  const allRoutineSteps = [...morningSteps, ...eveningSteps];

  const newProducts: Product[] = allRoutineSteps.map((step, idx) => ({
    id: `prod-ai-${idx + 1}`,
    name: step.name,
    brand: step.brand,
    category: step.stepCategory.toLowerCase().includes('spf')
      ? 'spf'
      : step.stepCategory.toLowerCase().includes('очищ') ||
        step.stepCategory.toLowerCase().includes('демак')
      ? 'cleansing'
      : step.stepCategory.toLowerCase().includes('сывор') ||
        step.stepCategory.toLowerCase().includes('актив')
      ? 'serums'
      : 'creams',
    categoryLabel: step.stepCategory,
    imageUrl: step.imageUrl,
    isFavorite: true,
    tag: step.stepCategory,
    price: step.price,
    partnerStore: step.partnerStore,
    compatibility: Math.min(99, Math.max(90, analysis.skinScore + 10)),
    inRoutine: true,
    whyItFits: step.description
  }));

  const newCartItems: CartItem[] = allRoutineSteps.map((step, idx) => ({
    id: `cart-ai-${idx + 1}`,
    productId: `prod-ai-${idx + 1}`,
    name: step.name,
    brand: step.brand,
    category: step.stepCategory,
    imageUrl: step.imageUrl,
    price: step.price || 1500,
    partnerStore: step.partnerStore || 'Золотое Яблоко',
    quantity: 1
  }));

  const totalCost = newCartItems.reduce((sum, item) => sum + item.price, 0);
  const estimatedSaved = Math.round(totalCost * 0.18);

  const updatedProfile: UserSkinProfile = {
    ...currentProfile,
    healthIndex: Math.min(98, Math.max(40, analysis.skinScore)),
    skinType: analysis.skinTypeSummary || currentProfile.skinType,
    completedScans: currentProfile.completedScans + 1,
    streakDays: Math.max(1, currentProfile.streakDays),
    budgetSaved: currentProfile.budgetSaved + estimatedSaved,
    visualFindings: analysis.visualFindings,
    disclaimer:
      analysis.disclaimer ||
      'Не является медицинским диагнозом. При острых дерматологических состояниях обратитесь к врачу-дерматологу.'
  };

  return {
    updatedProfile,
    newRoutineSteps: allRoutineSteps,
    newProducts,
    newCartItems
  };
}

/**
 * Pure check for whether the app is running inside a genuine Telegram Mini App container
 */
export function isTelegramWebAppEnvironment(win?: any): boolean {
  const target = win ?? (typeof window !== 'undefined' ? window : undefined);
  if (!target) return false;
  const webApp = target.Telegram?.WebApp;
  if (!webApp) return false;
  const hasInitData =
    typeof webApp.initData === 'string' && webApp.initData.trim().length > 0;
  const hasUser = Boolean(webApp.initDataUnsafe?.user?.id);
  return hasInitData || hasUser;
}

/**
 * Pure helper to normalize @username into https://t.me/<username>
 */
export function buildTelegramBotDeepLink(botUsername?: string): string {
  const clean = (botUsername || DEFAULT_BOT_USERNAME)
    .trim()
    .replace(/^https?:\/\/t\.me\//i, '')
    .replace(/^@/, '')
    .replace(/[^a-zA-Z0-9_]/g, '');
  return `https://t.me/${clean || DEFAULT_BOT_USERNAME}`;
}

/**
 * Pure helper to build a reliable QR code image URL for a given target link
 */
export function buildTelegramQrCodeUrl(botUrl: string): string {
  const encoded = encodeURIComponent(
    botUrl.trim() || `https://t.me/${DEFAULT_BOT_USERNAME}`
  );
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encoded}&bgcolor=FFFFFF&color=1E1B18&margin=10`;
}

/**
 * Pure helper to format the Telegram chat notification report after a face or INCI scan
 */
export function buildTelegramReportMessage(
  skinScore: number | null,
  extraSummary?: string
): {
  text: string;
  buttonText: string;
} {
  const scoreDisplay =
    typeof skinScore === 'number'
      ? `${Math.max(0, Math.min(100, Math.round(skinScore)))}/100`
      : 'Не определен';
  const baseText = `📋 Твой AI-отчет Lumi готов! Индекс кожи: ${scoreDisplay}. Твоя утренняя и вечерняя рутина сохранена в профиле`;
  const text = extraSummary ? `${baseText}\n\n${extraSummary}` : baseText;
  return {
    text,
    buttonText: 'Открыть мою рутину'
  };
}
