export type TabType = 'home' | 'favorites' | 'cart' | 'profile';
export type ScreenType = TabType | 'scan' | 'onboarding' | 'jar-scanner';

export type ProductCategory = 'all' | 'cleansing' | 'serums' | 'creams' | 'spf';

export type UserGender = 'female' | 'male';
export type AgeGroup = 'До 18' | '18–24' | '25–30' | '31–40' | '40+';
export type AvatarMode = 'telegram' | 'custom' | 'initials';

export interface OnboardingAnswers {
  gender: UserGender;
  ageGroup: AgeGroup;
  avatarMode: AvatarMode;
  customAvatarUrl?: string;
  skinBehavior: string[];
  skinBehaviorUnknown: boolean;
  goals: string[];
  currentArsenal: string;
  budget: string;
  completedAt?: string;
}

export interface FaceAnalysisResult {
  skinScore: number;
  skinTypeSummary: string;
  visualFindings: string[];
  disclaimer: string;
  morningRoutine: {
    time: string;
    stepCategory: string;
    name: string;
    brand: string;
    whyItFits: string;
    price: number;
    partnerStore: 'Золотое Яблоко' | 'Лэтуаль';
  }[];
  eveningRoutine: {
    time: string;
    stepCategory: string;
    name: string;
    brand: string;
    whyItFits: string;
    price: number;
    partnerStore: 'Золотое Яблоко' | 'Лэтуаль';
  }[];
  analyzedAt: string;
  photoPreview?: string;
}

export interface IngredientBadge {
  name: string;
  effect: string;
  severity?: 'danger' | 'warning';
}

export interface ProductScanResult {
  id: string;
  productName: string;
  brand: string;
  compatibilityScore: number;
  verdictSummary: string;
  recommendedSection: 'morning' | 'evening';
  recommendedStepCategory: string;
  estimatedPrice: number;
  goodIngredients: IngredientBadge[];
  badIngredients: IngredientBadge[];
  routineConflict: {
    hasConflict: boolean;
    conflictWarning: string;
  };
  safeAlternative?: {
    name: string;
    brand: string;
    reason: string;
    price: number;
  };
  scannedAt: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  categoryLabel?: string;
  imageUrl: string;
  isFavorite?: boolean;
  tag?: string;
  price?: number;
  partnerStore?: 'Золотое Яблоко' | 'Лэтуаль';
  compatibility?: number;
  inRoutine?: boolean;
  whyItFits?: string;
}

export type RoutineSectionType = 'morning' | 'evening';

export interface RoutineStep {
  id: string;
  section: RoutineSectionType;
  stepCategory: string;
  time: string;
  name: string;
  brand: string;
  description?: string;
  imageUrl: string;
  completed: boolean;
  iconBg?: string;
  price?: number;
  partnerStore?: 'Золотое Яблоко' | 'Лэтуаль';
}

export type DayCompletionStatus = 'none' | 'partial' | 'full';

export type RoutineCompletionByDate = Record<string, string[]>;

export interface CalendarDay {
  dateKey: string; // YYYY-MM-DD
  dayNumber: number;
  dayName: string; // ПН..ВС
  fullDateLabel: string; // e.g. "Вторник, 27 октября — Сегодня"
  monthYearLabel: string; // e.g. "Октябрь 2026"
  isToday: boolean;
}


export interface UserSkinProfile {
  name: string;
  gender: UserGender;
  ageGroup: AgeGroup;
  avatarMode: AvatarMode;
  telegramPhotoUrl?: string;
  customAvatarUrl?: string;
  greeting: string;
  subtitle: string;
  healthIndex: number | null;
  healthMax: number;
  skinType: string;
  streakDays: number;
  tier: string;
  completedScans: number;
  budgetSaved: number;
  onboarding?: OnboardingAnswers;
  visualFindings?: string[];
  disclaimer?: string;
}

export interface ScanHistoryItem {
  id: string;
  date: string;
  score: number;
  tag: string;
  zone: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  price: number;
  partnerStore: 'Золотое Яблоко' | 'Лэтуаль';
  quantity: number;
}

export interface TelegramBotConfig {
  botToken: string;
  botUsername: string;
  testChatId?: string;
  webhookActive?: boolean;
  webhookUrl?: string;
  lastActivatedAt?: string;
}
