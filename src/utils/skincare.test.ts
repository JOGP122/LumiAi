import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_ROUTINE_STEPS,
  INITIAL_CART_ITEMS,
  INITIAL_PRODUCTS,
  USER_PROFILE,
  toggleRoutineStep,
  calculateRoutineProgress,
  calculateCartTotal,
  updateCartQuantity,
  deriveSkinProfileFromOnboarding,
  buildStateFromFaceAnalysis,
  isTelegramWebAppEnvironment,
  buildTelegramBotDeepLink,
  buildTelegramQrCodeUrl,
  buildTelegramReportMessage,
  getUserInitials,
  toggleSkinBehaviorOption,
  selectSkinBehaviorUnknown,
  toggleSkinGoalOption,
  formatDateKey,
  getWeekDays,
  getWeekMonthYearLabel,
  formatRussianDateHeading,
  toggleRoutineStepForDate,
  getRoutineStepsForDate,
  getDayCompletionStatus,
  calculateStreakFromHistory
} from './skincare';
import { FaceAnalysisResult, CartItem, RoutineStep, RoutineCompletionByDate } from '../types';

test('Clean State: USER_PROFILE has null healthIndex, 0 streak, and empty products/routine/cart', () => {
  assert.equal(USER_PROFILE.healthIndex, null);
  assert.equal(USER_PROFILE.streakDays, 0);
  assert.equal(USER_PROFILE.completedScans, 0);
  assert.equal(INITIAL_PRODUCTS.length, 0);
  assert.equal(INITIAL_ROUTINE_STEPS.length, 0);
  assert.equal(INITIAL_CART_ITEMS.length, 0);
});

test('getUserInitials extracts 1-2 uppercase letters cleanly', () => {
  assert.equal(getUserInitials('Александр Иванов'), 'АИ');
  assert.equal(getUserInitials('Максим'), 'МА');
  assert.equal(getUserInitials(''), 'L');
});

test('Step 2 multi-select and "Я не знаю" toggle work mutually exclusively', () => {
  let state = toggleSkinBehaviorOption([], 'Стягивает и сохнет после умывания');
  assert.deepEqual(state.skinBehavior, ['Стягивает и сохнет после умывания']);
  assert.equal(state.skinBehaviorUnknown, false);

  state = toggleSkinBehaviorOption(
    state.skinBehavior,
    'Появляется жирный блеск на лбу и носу'
  );
  assert.equal(state.skinBehavior.length, 2);

  // Clicking "🤷 Я не знаю" clears all checkboxes and sets skinBehaviorUnknown = true
  const unknownState = selectSkinBehaviorUnknown();
  assert.deepEqual(unknownState.skinBehavior, []);
  assert.equal(unknownState.skinBehaviorUnknown, true);
});

test('Step 3 goals multi-select adds and removes goals', () => {
  let goals = toggleSkinGoalOption([], 'Убрать прыщи и воспаления');
  goals = toggleSkinGoalOption(goals, 'Убрать раздражение (в т.ч. после бритья)');
  assert.equal(goals.length, 2);
  goals = toggleSkinGoalOption(goals, 'Убрать прыщи и воспаления');
  assert.deepEqual(goals, ['Убрать раздражение (в т.ч. после бритья)']);
});

test('deriveSkinProfileFromOnboarding supports male gender and preserves clean state null healthIndex', () => {
  const updated = deriveSkinProfileFromOnboarding(USER_PROFILE, 'Дмитрий', {
    gender: 'male',
    ageGroup: '25–30',
    avatarMode: 'initials',
    skinBehavior: ['Появляется жирный блеск на лбу и носу', 'Бывают шелушения и покраснения'],
    skinBehaviorUnknown: false,
    goals: ['Убрать раздражение (в т.ч. после бритья)', 'Подобрать простой базовый уход на каждый день'],
    currentArsenal: 'Только умывалка / мыло',
    budget: '1 000 – 2 500 ₽'
  });

  assert.equal(updated.name, 'Дмитрий');
  assert.equal(updated.gender, 'male');
  assert.equal(updated.greeting, 'Привет, Дмитрий ✨');
  assert.equal(updated.subtitle, 'Лаконичный мужской уход и защита зоны бритья');
  assert.equal(updated.skinType, 'Комбинированная кожа, чувствительная');
  assert.equal(updated.healthIndex, null);
  assert.equal(updated.streakDays, 0);
});

test('buildStateFromFaceAnalysis converts AI output into routine steps, products, and cart', () => {
  const mockAiResult: FaceAnalysisResult = {
    skinScore: 88,
    skinTypeSummary: 'Комбинированная кожа с легким обезвоживанием',
    visualFindings: ['Ровный тон', 'Умеренный блеск Т-зоны'],
    disclaimer: 'Не является медицинским диагнозом.',
    analyzedAt: new Date().toISOString(),
    morningRoutine: [
      {
        time: '08:00',
        stepCategory: 'Мягкое очищение',
        name: 'Гельтек Очищающий гель',
        brand: 'Гельтек',
        whyItFits: 'Мягкие ПАВ без сульфатов',
        price: 1150,
        partnerStore: 'Золотое Яблоко'
      }
    ],
    eveningRoutine: [
      {
        time: '21:00',
        stepCategory: 'Увлажнение',
        name: 'Bioderma Sensibio Defensive',
        brand: 'Bioderma',
        whyItFits: 'Укрепляет защитный барьер',
        price: 1950,
        partnerStore: 'Лэтуаль'
      }
    ]
  };

  const result = buildStateFromFaceAnalysis(mockAiResult, USER_PROFILE);
  assert.equal(result.updatedProfile.healthIndex, 88);
  assert.equal(result.updatedProfile.streakDays, 1);
  assert.equal(result.updatedProfile.skinType, 'Комбинированная кожа с легким обезвоживанием');
  assert.equal(result.newRoutineSteps.length, 2);
  assert.equal(result.newRoutineSteps[0].section, 'morning');
  assert.equal(result.newRoutineSteps[1].section, 'evening');
  assert.equal(result.newCartItems.length, 2);
});

test('calculateCartTotal and updateCartQuantity work on dynamically added items', () => {
  const sampleItems: CartItem[] = [
    {
      id: 'c1',
      productId: 'p1',
      name: 'Гель для умывания',
      brand: 'CeraVe',
      category: 'Очищение',
      imageUrl: '',
      price: 1400,
      partnerStore: 'Золотое Яблоко',
      quantity: 1
    }
  ];
  const totals = calculateCartTotal(sampleItems);
  assert.equal(totals.subtotal, 1400);
  assert.equal(totals.cashback, 70);

  const incremented = updateCartQuantity(sampleItems, 'c1', 1);
  assert.equal(incremented[0].quantity, 2);

  const removed = updateCartQuantity(sampleItems, 'c1', -1);
  assert.equal(removed.length, 0);
});

test('toggleRoutineStep and calculateRoutineProgress work properly', () => {
  const sampleSteps: RoutineStep[] = [
    {
      id: 's1',
      section: 'morning',
      stepCategory: 'Очищение',
      time: '08:00',
      name: 'Гель CeraVe',
      brand: 'CeraVe',
      imageUrl: '',
      completed: false
    }
  ];

  const toggled = toggleRoutineStep(sampleSteps, 's1');
  assert.equal(toggled[0].completed, true);
  const progress = calculateRoutineProgress(toggled);
  assert.equal(progress.completed, 1);
  assert.equal(progress.total, 1);
  assert.equal(progress.percentage, 100);
});

test('isTelegramWebAppEnvironment, buildTelegramBotDeepLink, and buildTelegramReportMessage work', () => {
  assert.equal(isTelegramWebAppEnvironment({}), false);
  assert.equal(
    isTelegramWebAppEnvironment({ Telegram: { WebApp: { initData: 'query_id=123' } } }),
    true
  );
  assert.equal(buildTelegramBotDeepLink('@MyLumiBot'), 'https://t.me/MyLumiBot');
  const qr = buildTelegramQrCodeUrl('https://t.me/MyLumiBot');
  assert.ok(qr.includes('api.qrserver.com'));

  const msg = buildTelegramReportMessage(86);
  assert.equal(
    msg.text,
    '📋 Твой AI-отчет Lumi готов! Индекс кожи: 86/100. Твоя утренняя и вечерняя рутина сохранена в профиле'
  );
});

test('getWeekDays generates Monday-Sunday (ПН–ВС) week and supports weekOffset navigation', () => {
  // Tuesday, October 27, 2026
  const refDate = new Date(2026, 9, 27, 12, 0, 0);
  const currentWeek = getWeekDays(refDate, 0);

  assert.equal(currentWeek.length, 7);
  assert.deepEqual(
    currentWeek.map((d) => d.dayName),
    ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']
  );
  assert.equal(currentWeek[0].dateKey, '2026-10-26');
  assert.equal(currentWeek[0].dayNumber, 26);
  assert.equal(currentWeek[1].dateKey, '2026-10-27');
  assert.equal(currentWeek[1].isToday, true);
  assert.equal(currentWeek[1].fullDateLabel, 'Вторник, 27 октября — Сегодня');
  assert.equal(currentWeek[0].fullDateLabel, 'Понедельник, 26 октября — Вчера');
  assert.equal(currentWeek[2].fullDateLabel, 'Среда, 28 октября — Завтра');
  assert.equal(currentWeek[6].dateKey, '2026-11-01');
  assert.equal(currentWeek[6].dayName, 'ВС');
  assert.equal(getWeekMonthYearLabel(currentWeek, '2026-10-27'), 'Октябрь 2026');

  // Previous week (offset = -1)
  const prevWeek = getWeekDays(refDate, -1);
  assert.equal(prevWeek[0].dateKey, '2026-10-19');
  assert.equal(prevWeek[6].dateKey, '2026-10-25');
  assert.equal(prevWeek.some((d) => d.isToday), false);

  // Next week (offset = +1)
  const nextWeek = getWeekDays(refDate, 1);
  assert.equal(nextWeek[0].dateKey, '2026-11-02');
  assert.equal(getWeekMonthYearLabel(nextWeek), 'Ноябрь 2026');
});

test('Date-bound routine completion, progress dot status (none/partial/full), and streak calculation work', () => {
  const sampleSteps: RoutineStep[] = [
    {
      id: 'step-1',
      section: 'morning',
      stepCategory: 'Очищение',
      time: '08:00',
      name: 'Гель CeraVe',
      brand: 'CeraVe',
      imageUrl: '',
      completed: false
    },
    {
      id: 'step-2',
      section: 'evening',
      stepCategory: 'Крем',
      time: '21:00',
      name: 'Bioderma Sensibio',
      brand: 'Bioderma',
      imageUrl: '',
      completed: false
    }
  ];
  const validIds = sampleSteps.map((s) => s.id);
  const today = new Date(2026, 9, 27, 12, 0, 0); // 2026-10-27
  const todayKey = formatDateKey(today);
  const yesterdayKey = '2026-10-26';
  const twoDaysAgoKey = '2026-10-25';

  let history: RoutineCompletionByDate = {};
  assert.equal(getDayCompletionStatus(history, todayKey, validIds), 'none');
  assert.equal(calculateStreakFromHistory(history, validIds, today), 0);

  // Toggle 1 of 2 steps on today -> 'partial'
  history = toggleRoutineStepForDate(history, todayKey, 'step-1');
  assert.equal(getDayCompletionStatus(history, todayKey, validIds), 'partial');
  const todayStepsPartial = getRoutineStepsForDate(sampleSteps, history, todayKey);
  assert.equal(todayStepsPartial[0].completed, true);
  assert.equal(todayStepsPartial[1].completed, false);

  // Toggle 2 of 2 steps on today -> 'full'
  history = toggleRoutineStepForDate(history, todayKey, 'step-2');
  assert.equal(getDayCompletionStatus(history, todayKey, validIds), 'full');
  assert.equal(calculateStreakFromHistory(history, validIds, today), 1);

  // Yesterday has no steps yet -> switching to yesterday shows both unchecked
  const yesterdayStepsEmpty = getRoutineStepsForDate(sampleSteps, history, yesterdayKey);
  assert.equal(yesterdayStepsEmpty[0].completed, false);
  assert.equal(yesterdayStepsEmpty[1].completed, false);

  // Add completions on yesterday and two days ago -> streak becomes 3 days
  history = toggleRoutineStepForDate(history, yesterdayKey, 'step-1');
  history = toggleRoutineStepForDate(history, twoDaysAgoKey, 'step-2');
  assert.equal(calculateStreakFromHistory(history, validIds, today), 3);

  // Unchecking step-1 on yesterday leaves 0 steps on yesterday -> streak drops back to 1 (today only)
  history = toggleRoutineStepForDate(history, yesterdayKey, 'step-1');
  assert.equal(getDayCompletionStatus(history, yesterdayKey, validIds), 'none');
  assert.equal(calculateStreakFromHistory(history, validIds, today), 1);
});

