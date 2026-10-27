/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TabType,
  Product,
  RoutineStep,
  CartItem,
  UserSkinProfile,
  OnboardingAnswers,
  FaceAnalysisResult,
  ProductScanResult,
  ScanHistoryItem,
  TelegramBotConfig,
  AvatarMode,
  RoutineCompletionByDate
} from './types';
import {
  STORAGE_KEY,
  ROUTINE_HISTORY_STORAGE_KEY,
  TELEGRAM_CONFIG_STORAGE_KEY,
  DEFAULT_BOT_USERNAME,
  USER_PROFILE,
  INITIAL_PRODUCTS,
  INITIAL_ROUTINE_STEPS,
  INITIAL_CART_ITEMS,
  SCAN_HISTORY,
  PRODUCT_IMAGES,
  toggleRoutineStepForDate,
  calculateStreakFromHistory,
  toggleProductFavorite,
  updateCartQuantity,
  deriveSkinProfileFromOnboarding,
  buildStateFromFaceAnalysis,
  isTelegramWebAppEnvironment
} from './utils/skincare';
import { MobileFrame } from './components/MobileFrame';
import { TelegramGateScreen } from './components/TelegramGateScreen';
import { HomeScreen } from './components/HomeScreen';
import { FavoritesScreen } from './components/FavoritesScreen';
import { CartScreen } from './components/CartScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { FaceScanScreen } from './components/FaceScanScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { ProductScannerModal } from './components/ProductScannerModal';
import { BottomNav } from './components/BottomNav';

const PREVIEW_SESSION_KEY = 'lumi_preview_unlocked_v3';

interface PersistedAppState {
  onboardingDone: boolean;
  userProfile: UserSkinProfile;
  products: Product[];
  routineSteps: RoutineStep[];
  completedHistory?: RoutineCompletionByDate;
  cartItems: CartItem[];
  scanHistory: ScanHistoryItem[];
  scannedJars: ProductScanResult[];
}

function getTelegramUser(): {
  id?: number;
  first_name?: string;
  photo_url?: string;
} | null {
  if (typeof window !== 'undefined') {
    const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser) {
      return tgUser;
    }
  }
  return null;
}

function loadInitialState(): PersistedAppState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedAppState;
  } catch (e) {
    console.warn('Failed to parse persisted LUMI state:', e);
    return null;
  }
}

function loadBotConfigFromStorage(): TelegramBotConfig {
  if (typeof window === 'undefined') {
    return { botToken: '', botUsername: DEFAULT_BOT_USERNAME };
  }
  try {
    const raw = window.localStorage.getItem(TELEGRAM_CONFIG_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as TelegramBotConfig;
    }
  } catch (e) {
    console.warn('Failed to parse bot config:', e);
  }
  return { botToken: '', botUsername: DEFAULT_BOT_USERNAME };
}

export default function App() {
  const savedState = loadInitialState();
  const tgUser = getTelegramUser();
  const tgName = tgUser?.first_name || null;
  const tgPhotoUrl = tgUser?.photo_url || undefined;

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (isTelegramWebAppEnvironment()) {
      return true;
    }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('gate') === '1') {
        return false;
      }
      if (
        params.get('preview') === '1' ||
        params.get('autostart') === '1' ||
        params.has('tab') ||
        params.has('screen') ||
        params.get('onboarding') === '1'
      ) {
        return true;
      }
      if (window.sessionStorage.getItem(PREVIEW_SESSION_KEY) === 'true') {
        return true;
      }
    }
    return false;
  });

  const [botConfig, setBotConfig] = useState<TelegramBotConfig>(loadBotConfigFromStorage);

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as TabType;
      if (['home', 'favorites', 'cart', 'profile'].includes(tabParam)) {
        return tabParam;
      }
    }
    return 'home';
  });

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('onboarding') === '1') return true;
      if (
        params.get('autostart') === '1' ||
        params.has('tab') ||
        params.has('screen')
      ) {
        return false;
      }
    }
    return !savedState?.onboardingDone;
  });

  const [isScanning, setIsScanning] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('screen') === 'scan';
    }
    return false;
  });

  const [isJarScannerOpen, setIsJarScannerOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('screen') === 'jar-scanner';
    }
    return false;
  });

  const [isGeneratingWithoutPhoto, setIsGeneratingWithoutPhoto] =
    useState<boolean>(false);

  const [onboardingDone, setOnboardingDone] = useState<boolean>(
    Boolean(savedState?.onboardingDone)
  );

  const [userProfile, setUserProfile] = useState<UserSkinProfile>(() => {
    if (savedState?.userProfile) {
      return {
        ...savedState.userProfile,
        telegramPhotoUrl:
          tgPhotoUrl || savedState.userProfile.telegramPhotoUrl
      };
    }
    const startName = tgName || 'Гость';
    return {
      ...USER_PROFILE,
      name: startName,
      greeting: startName === 'Гость' ? 'Привет ✨' : `Привет, ${startName} ✨`,
      telegramPhotoUrl: tgPhotoUrl,
      avatarMode: tgPhotoUrl ? 'telegram' : 'initials'
    };
  });

  const [products, setProducts] = useState<Product[]>(
    savedState?.products || INITIAL_PRODUCTS
  );
  const [routineSteps, setRoutineSteps] = useState<RoutineStep[]>(
    savedState?.routineSteps || INITIAL_ROUTINE_STEPS
  );
  const [completedHistory, setCompletedHistory] =
    useState<RoutineCompletionByDate>(() => {
      if (savedState?.completedHistory) {
        return savedState.completedHistory;
      }
      if (typeof window !== 'undefined') {
        try {
          const raw = window.localStorage.getItem(ROUTINE_HISTORY_STORAGE_KEY);
          if (raw) {
            return JSON.parse(raw) as RoutineCompletionByDate;
          }
        } catch (e) {
          console.warn('Failed to parse routine history:', e);
        }
      }
      return {};
    });
  const [cartItems, setCartItems] = useState<CartItem[]>(
    savedState?.cartItems || INITIAL_CART_ITEMS
  );
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>(
    savedState?.scanHistory || SCAN_HISTORY
  );
  const [scannedJars, setScannedJars] = useState<ProductScanResult[]>(
    savedState?.scannedJars || []
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamically recalculate streakDays whenever completedHistory or routineSteps change
  useEffect(() => {
    const validIds = routineSteps.map((s) => s.id);
    const calculatedStreak = calculateStreakFromHistory(
      completedHistory,
      validIds
    );
    setUserProfile((prev) => {
      if (prev.streakDays === calculatedStreak) return prev;
      return {
        ...prev,
        streakDays: calculatedStreak
      };
    });
  }, [completedHistory, routineSteps]);

  // Sync bot status from backend on mount
  useEffect(() => {
    fetch('/api/telegram/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((status) => {
        if (status && status.botUsername) {
          setBotConfig((prev) => ({
            ...prev,
            botUsername: prev.botUsername || status.botUsername,
            testChatId: prev.testChatId || status.testChatId || '',
            webhookActive: Boolean(status.webhookActive),
            webhookUrl: status.webhookUrl || prev.webhookUrl,
            lastActivatedAt: status.lastActivatedAt || prev.lastActivatedAt
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Persist complete state and YYYY-MM-DD routine history to localStorage on any change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stateToSave: PersistedAppState = {
        onboardingDone,
        userProfile,
        products,
        routineSteps,
        completedHistory,
        cartItems,
        scanHistory,
        scannedJars
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      window.localStorage.setItem(
        ROUTINE_HISTORY_STORAGE_KEY,
        JSON.stringify(completedHistory)
      );
    } catch (e) {
      console.warn('Failed to persist LUMI state:', e);
    }
  }, [
    onboardingDone,
    userProfile,
    products,
    routineSteps,
    completedHistory,
    cartItems,
    scanHistory,
    scannedJars
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleUpdateBotConfig = (newConfig: TelegramBotConfig) => {
    setBotConfig(newConfig);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          TELEGRAM_CONFIG_STORAGE_KEY,
          JSON.stringify(newConfig)
        );
      } catch (e) {
        console.warn('Failed to save bot config:', e);
      }
    }
  };

  // Helper to automatically send Telegram Bot message after Face or Jar scan
  const triggerTelegramChatReport = async (
    skinScore: number | null,
    extraSummary?: string
  ) => {
    try {
      const tgChatId =
        (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id ||
        botConfig.testChatId;

      const response = await fetch('/api/telegram/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: tgChatId,
          botToken: botConfig.botToken,
          skinScore: skinScore ?? 80,
          extraSummary,
          appUrl: typeof window !== 'undefined' ? window.location.origin : undefined
        })
      });

      const data = await response.json().catch(() => null);
      if (data?.ok) {
        showToast('Отчет также отправлен вам в чат с ботом Telegram 📋');
      }
    } catch (e) {
      console.warn('Telegram auto-report skipped:', e);
    }
  };

  // Handler for "Войти в режиме превью (для тестирования)" on Lock Screen
  const handleEnterPreviewMode = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(PREVIEW_SESSION_KEY, 'true');
    }
    setIsUnlocked(true);
    if (!onboardingDone) {
      setShowOnboarding(true);
      showToast('Режим превью: пройдите быструю регистрацию ✨');
    } else {
      setActiveTab('home');
      showToast('Режим превью активирован ✨');
    }
  };

  // Full Reset to Clean State ("Сбросить профиль и начать заново")
  const handleResetProfile = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(ROUTINE_HISTORY_STORAGE_KEY);
    }
    const freshName = tgName || 'Гость';
    setUserProfile({
      ...USER_PROFILE,
      name: freshName,
      greeting: freshName === 'Гость' ? 'Привет ✨' : `Привет, ${freshName} ✨`,
      telegramPhotoUrl: tgPhotoUrl,
      avatarMode: tgPhotoUrl ? 'telegram' : 'initials'
    });
    setProducts([]);
    setRoutineSteps([]);
    setCompletedHistory({});
    setCartItems([]);
    setScanHistory([]);
    setScannedJars([]);
    setOnboardingDone(false);
    setIsScanning(false);
    setIsJarScannerOpen(false);
    setShowOnboarding(true);
    showToast('Профиль сброшен! Начинаем с чистого листа ✨');
  };

  const handleUpdateAvatar = (mode: AvatarMode, customUrl?: string) => {
    setUserProfile((prev) => ({
      ...prev,
      avatarMode: mode,
      customAvatarUrl: customUrl !== undefined ? customUrl : prev.customAvatarUrl
    }));
  };

  const switchTab = (tab: TabType) => {
    setIsScanning(false);
    setIsJarScannerOpen(false);
    setShowOnboarding(false);
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('screen');
      url.searchParams.delete('onboarding');
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCompleteOnboarding = (
    name: string,
    answers: OnboardingAnswers,
    openScannerAfter?: boolean
  ) => {
    const updated = deriveSkinProfileFromOnboarding(userProfile, name, answers);
    setUserProfile(updated);
    setOnboardingDone(true);
    setShowOnboarding(false);

    if (openScannerAfter) {
      setIsScanning(true);
    } else {
      setActiveTab('home');
      showToast(`Профиль создан для ${updated.name} ✨`);
    }
  };

  const handleFaceAnalysisSuccess = (result: FaceAnalysisResult) => {
    const { updatedProfile, newRoutineSteps, newProducts, newCartItems } =
      buildStateFromFaceAnalysis(result, userProfile);

    setUserProfile(updatedProfile);
    setRoutineSteps(newRoutineSteps);
    setProducts(newProducts);
    setCartItems(newCartItems);

    const newScanEntry: ScanHistoryItem = {
      id: `scan-${Date.now()}`,
      date: 'Сегодня, только что',
      score: updatedProfile.healthIndex || 80,
      tag: 'AI-диагностика Gemini',
      zone: updatedProfile.skinType
    };
    setScanHistory((prev) => [newScanEntry, ...prev]);

    setIsScanning(false);
    setActiveTab('home');
    showToast(
      `Рутина готова! Индекс кожи: ${updatedProfile.healthIndex}/100 ✨`
    );

    triggerTelegramChatReport(updatedProfile.healthIndex);
  };

  // Generate routine directly on Home Screen without taking a selfie
  const handleGenerateRoutineWithoutPhoto = async () => {
    setIsGeneratingWithoutPhoto(true);
    showToast('AI-дерматолог подбирает средства по вашей анкете...');

    try {
      const response = await fetch('/api/analyze-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: null,
          onboarding: userProfile.onboarding,
          userName: userProfile.name
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Не удалось сгенерировать уход');
      }

      const data = await response.json();
      const result: FaceAnalysisResult = {
        skinScore: data.skinScore || 78,
        skinTypeSummary:
          data.skinTypeSummary || 'Персональный профиль по анкете',
        visualFindings: Array.isArray(data.visualFindings)
          ? data.visualFindings
          : ['Уход подобран по ответам анкеты и задачам кожи'],
        disclaimer:
          data.disclaimer ||
          'Результаты носят информационно-косметический характер.',
        morningRoutine: Array.isArray(data.morningRoutine)
          ? data.morningRoutine
          : [],
        eveningRoutine: Array.isArray(data.eveningRoutine)
          ? data.eveningRoutine
          : [],
        analyzedAt: new Date().toISOString()
      };

      handleFaceAnalysisSuccess(result);
    } catch (err: any) {
      showToast(err?.message || 'Ошибка при генерации ухода по анкете');
    } finally {
      setIsGeneratingWithoutPhoto(false);
    }
  };

  const handleToggleFavorite = (productId: string) => {
    setProducts((prev) => {
      const updated = toggleProductFavorite(prev, productId);
      const item = updated.find((p) => p.id === productId);
      showToast(
        item?.isFavorite
          ? `Сохранено в избранное: ${item.brand}`
          : `Удалено из избранного`
      );
      return updated;
    });
  };

  const handleToggleRoutineStep = (stepId: string, dateKey: string) => {
    setCompletedHistory((prev) => {
      const nextHistory = toggleRoutineStepForDate(prev, dateKey, stepId);
      const isNowCompleted = Boolean(nextHistory[dateKey]?.includes(stepId));
      const step = routineSteps.find((s) => s.id === stepId);
      showToast(
        isNowCompleted
          ? `Шаг выполнен (${dateKey}): ${step?.name || ''}`
          : `Шаг снят (${dateKey})`
      );
      return nextHistory;
    });
  };

  const handleToggleInRoutine = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, inRoutine: !p.inRoutine } : p
      )
    );
    showToast('План ухода синхронизирован');
  };

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}`,
          productId: product.id,
          name: product.name,
          brand: product.brand,
          category: product.categoryLabel || 'Уход',
          imageUrl: product.imageUrl,
          price: product.price || 1690,
          partnerStore: product.partnerStore || 'Золотое Яблоко',
          quantity: 1
        }
      ];
    });
    showToast(`Добавлено в корзину: ${product.name}`);
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) => updateCartQuantity(prev, id, delta));
  };

  const handleSaveScanResult = (scan: ProductScanResult) => {
    setScannedJars((prev) =>
      [scan, ...prev.filter((item) => item.id !== scan.id)].slice(0, 12)
    );

    const jarSummary = `🔬 Разбор банки: ${scan.brand} — ${scan.productName} (совместимость: ${scan.compatibilityScore}%).\nВердикт: ${scan.verdictSummary}`;
    triggerTelegramChatReport(userProfile.healthIndex, jarSummary);
  };

  const handleAddScannedToRoutine = (
    scan: ProductScanResult,
    useSafeAlternative?: boolean
  ) => {
    const targetName =
      useSafeAlternative && scan.safeAlternative
        ? scan.safeAlternative.name
        : scan.productName;
    const targetBrand =
      useSafeAlternative && scan.safeAlternative
        ? scan.safeAlternative.brand
        : scan.brand;
    const targetPrice =
      useSafeAlternative && scan.safeAlternative
        ? scan.safeAlternative.price
        : scan.estimatedPrice;

    const newStep: RoutineStep = {
      id: `step-jar-${Date.now()}`,
      section: scan.recommendedSection,
      stepCategory: scan.recommendedStepCategory,
      time: scan.recommendedSection === 'morning' ? '08:25' : '21:20',
      name: targetName,
      brand: targetBrand,
      description:
        useSafeAlternative && scan.safeAlternative
          ? scan.safeAlternative.reason
          : scan.verdictSummary,
      imageUrl: PRODUCT_IMAGES[0],
      completed: false,
      iconBg: '#E0F2FE',
      price: targetPrice,
      partnerStore: 'Золотое Яблоко'
    };

    setRoutineSteps((prev) => [...prev, newStep]);

    const newProd: Product = {
      id: `prod-jar-${Date.now()}`,
      name: targetName,
      brand: targetBrand,
      category: 'creams',
      categoryLabel: scan.recommendedStepCategory,
      imageUrl: PRODUCT_IMAGES[0],
      isFavorite: true,
      tag: 'Проверено AI',
      price: targetPrice,
      partnerStore: 'Золотое Яблоко',
      compatibility: useSafeAlternative ? 98 : scan.compatibilityScore,
      inRoutine: true,
      whyItFits: newStep.description
    };

    setProducts((prev) => [newProd, ...prev]);
    setIsJarScannerOpen(false);
    setActiveTab('home');
    showToast(`Добавлено в рутину: ${targetBrand} — ${targetName}`);
  };

  const favoritesCount = products.filter((p) => p.isFavorite).length;
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <MobileFrame>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1E1B18]/90 text-white text-[12px] font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-md transition-all animate-bounce"
        >
          {toastMessage}
        </div>
      )}

      {/* 1. Telegram Wallet-style Lock Screen if opened outside Telegram Mini App */}
      {!isUnlocked ? (
        <TelegramGateScreen
          botUsername={botConfig.botUsername}
          onEnterPreview={handleEnterPreviewMode}
        />
      ) : (
        <div className="w-full flex-1 flex flex-col transition-opacity duration-300">
          {showOnboarding ? (
            <OnboardingScreen
              initialName={userProfile.name}
              telegramPhotoUrl={userProfile.telegramPhotoUrl}
              initialAnswers={userProfile.onboarding}
              onComplete={handleCompleteOnboarding}
              onCancel={
                onboardingDone ? () => setShowOnboarding(false) : undefined
              }
            />
          ) : isScanning ? (
            <FaceScanScreen
              userName={userProfile.name}
              onboarding={userProfile.onboarding}
              onBack={() => setIsScanning(false)}
              onAnalysisSuccess={handleFaceAnalysisSuccess}
            />
          ) : isJarScannerOpen ? (
            <ProductScannerModal
              userProfile={userProfile}
              currentRoutine={routineSteps}
              scannedHistory={scannedJars}
              onClose={() => setIsJarScannerOpen(false)}
              onAddScannedToRoutine={handleAddScannedToRoutine}
              onSaveScanResult={handleSaveScanResult}
            />
          ) : (
            <>
              {/* Вкладка 1: Главная / Рутина */}
              {activeTab === 'home' && (
                <HomeScreen
                  userProfile={userProfile}
                  onStartScan={() => setIsScanning(true)}
                  onOpenJarScanner={() => setIsJarScannerOpen(true)}
                  onGenerateRoutineWithoutPhoto={
                    handleGenerateRoutineWithoutPhoto
                  }
                  isGeneratingWithoutPhoto={isGeneratingWithoutPhoto}
                  onOpenProfile={() => switchTab('profile')}
                  routineSteps={routineSteps}
                  completedHistory={completedHistory}
                  onToggleRoutineStep={handleToggleRoutineStep}
                />
              )}

              {/* Вкладка 2: Избранный уход */}
              {activeTab === 'favorites' && (
                <FavoritesScreen
                  userName={userProfile.name}
                  products={products}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleAddToCart}
                  onToggleInRoutine={handleToggleInRoutine}
                  onOpenJarScanner={() => setIsJarScannerOpen(true)}
                  onStartScan={() => setIsScanning(true)}
                />
              )}

              {/* Вкладка 3: Корзина */}
              {activeTab === 'cart' && (
                <CartScreen
                  items={cartItems}
                  onUpdateQuantity={handleUpdateCartQuantity}
                />
              )}

              {/* Вкладка 4: Профиль */}
              {activeTab === 'profile' && (
                <ProfileScreen
                  userProfile={userProfile}
                  scanHistory={scanHistory}
                  onStartScan={() => setIsScanning(true)}
                  onStartOnboarding={() => setShowOnboarding(true)}
                  onResetProfile={handleResetProfile}
                  onUpdateAvatar={handleUpdateAvatar}
                  botConfig={botConfig}
                  onUpdateBotConfig={handleUpdateBotConfig}
                  onNotify={showToast}
                />
              )}
            </>
          )}

          {/* Floating Bottom Navigation Dock (Visible across all 4 main tabs) */}
          {!showOnboarding && !isScanning && !isJarScannerOpen && (
            <BottomNav
              activeTab={activeTab}
              onSelectTab={switchTab}
              favoritesCount={favoritesCount}
              cartCount={cartCount}
            />
          )}
        </div>
      )}
    </MobileFrame>
  );
}
