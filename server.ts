import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_CONFIG_FILE = path.join(__dirname, '.telegram-bot-config.json');
const DEFAULT_PUBLIC_APP_URL =
  process.env.APP_URL ||
  'https://ais-pre-pey27stkmdaryd2ikzcw7h-892752532495.europe-west2.run.app';

interface StoredBotConfig {
  botToken: string;
  botUsername: string;
  appUrl: string;
  testChatId?: string;
  webhookActive?: boolean;
  webhookUrl?: string;
  lastActivatedAt?: string;
}

function loadBotConfig(): StoredBotConfig {
  try {
    if (fs.existsSync(BOT_CONFIG_FILE)) {
      const raw = fs.readFileSync(BOT_CONFIG_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read .telegram-bot-config.json:', e);
  }
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    botUsername: process.env.TELEGRAM_BOT_USERNAME || 'LumiSkinConciergeBot',
    appUrl: DEFAULT_PUBLIC_APP_URL
  };
}

function saveBotConfig(config: StoredBotConfig) {
  try {
    fs.writeFileSync(BOT_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not save .telegram-bot-config.json:', e);
  }
}

let activeBotConfig: StoredBotConfig = loadBotConfig();

async function callTelegramApi(token: string, method: string, payload: Record<string, any>) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));


  // 1. Endpoint: Real AI Face & Skin Diagnostic (/api/analyze-face)
  app.post('/api/analyze-face', async (req, res) => {
    try {
      const { imageBase64, mimeType, onboarding, userName } = req.body || {};

      const isMale = onboarding?.gender === 'male';
      const genderLabel = isMale ? 'Мужской (обращайся в мужском роде)' : 'Женский (обращайся в женском роде)';
      const ageGroup = onboarding?.ageGroup || '18–24';
      const skinBehaviorText = onboarding?.skinBehaviorUnknown
        ? 'Пользователь выбрал «Я не знаю / Не разбираюсь (определим по фото и задачам)»'
        : Array.isArray(onboarding?.skinBehavior) && onboarding.skinBehavior.length > 0
        ? onboarding.skinBehavior.join('; ')
        : 'Не указано';
      const goalsText =
        Array.isArray(onboarding?.goals) && onboarding.goals.length > 0
          ? onboarding.goals.join('; ')
          : 'Подобрать простой базовый уход на каждый день';
      const arsenalText = onboarding?.currentArsenal || 'У меня ничего нет, хочу собрать уход с нуля';
      const budget = onboarding?.budget || '1 000 – 2 500 ₽';

      const promptText = `Проведи профессиональную косметическую AI-диагностику кожи и составь персональную рутину для пользователя (${userName || 'Пользователь'}).
Данные анкеты пользователя:
- Пол: ${genderLabel}
- Возраст: ${ageGroup}
- Как ведет себя кожа в течение дня: ${skinBehaviorText}
- Главные задачи: ${goalsText}
- Текущий арсенал: ${arsenalText}
- Комфортный бюджет на одно средство: ${budget}

Задача:
1. Если приложено фото лица — внимательно проанализируй визуальные маркеры кожи (тон, уровень увлажненности, возможные покраснения, состояние пор, зону бритья у мужчин, барьер). Если фото не приложено (подбор без фото по анкете) — оцени состояние строго по ответам анкеты.
2. Определи индекс состояния кожи skinScore (число от 45 до 95) и краткий вердикт skinTypeSummary.
3. Сформируй 2-3 деликатных, точных наблюдения в visualFindings (в ${isMale ? 'мужском' : 'женском'} роде) и вежливый дисклеймер, что это косметическая оценка, а не медицинский диагноз.
4. Составь утреннюю рутину (morningRoutine) и вечернюю рутину (eveningRoutine):
${
  isMale
    ? '- КРИТИЧНО ДЛЯ МУЖЧИН: учитывай более плотную мужскую кожу, активную выработку себума и зону бритья (успокоение раздражения после бритья, пантенол/церамиды/центелла). Предлагай лаконичный, понятный мужской уход без перегруза банками (3 шага утром, 2-3 шага вечером).'
    : '- Составь сбалансированную утреннюю рутину (3-4 шага: Очищение, Актив/Сыворотка, Увлажнение, SPF) и вечернюю рутину (3 шага: Демакияж/Очищение, Активный уход, Восстановление барьера).'
}
5. СТРОГИЕ ПРАВИЛА ДЕРМАТОЛОГА И ХИМИКА:
- Подбирай только реальные средства, доступные на рынке (CeraVe, La Roche-Posay, The Ordinary, Гельтек, Aravia, Bioderma, Dr.Jart+, Tatcha, Heimish, Medik8) под указанный бюджет (${budget}).
- Исключи конфликты активов: не ставь ретиноиды и AHA/BHA кислоты в один прием, не совмещай кислую форму витамина С с пептидами меди или кислотами в один прием, обязательно включай SPF утром.
- Для каждого продукта укажи магазин-партнер: "Золотое Яблоко" или "Лэтуаль" и реальную примерную цену в рублях.`;

      const parts: any[] = [];
      if (imageBase64 && typeof imageBase64 === 'string') {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64
          }
        });
      }
      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction:
            'Ты — доказательный врач-дерматолог и косметический химик сервиса LUMI. Отвечай строго на русском языке в формате JSON по заданной схеме.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              skinScore: {
                type: Type.INTEGER,
                description: 'Индекс здоровья кожи от 40 до 95'
              },
              skinTypeSummary: {
                type: Type.STRING,
                description: 'Краткий вердикт о типе и состоянии кожи'
              },
              visualFindings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2-3 наблюдения по фото и анкете'
              },
              disclaimer: {
                type: Type.STRING,
                description: 'Вежливый дисклеймер, что результат не является медицинским диагнозом'
              },
              morningRoutine: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    stepCategory: { type: Type.STRING },
                    name: { type: Type.STRING },
                    brand: { type: Type.STRING },
                    whyItFits: { type: Type.STRING },
                    price: { type: Type.INTEGER },
                    partnerStore: { type: Type.STRING }
                  },
                  required: ['time', 'stepCategory', 'name', 'brand', 'whyItFits', 'price', 'partnerStore']
                }
              },
              eveningRoutine: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    stepCategory: { type: Type.STRING },
                    name: { type: Type.STRING },
                    brand: { type: Type.STRING },
                    whyItFits: { type: Type.STRING },
                    price: { type: Type.INTEGER },
                    partnerStore: { type: Type.STRING }
                  },
                  required: ['time', 'stepCategory', 'name', 'brand', 'whyItFits', 'price', 'partnerStore']
                }
              }
            },
            required: [
              'skinScore',
              'skinTypeSummary',
              'visualFindings',
              'disclaimer',
              'morningRoutine',
              'eveningRoutine'
            ]
          }
        }
      });

      const rawText = response.text || '{}';
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/analyze-face:', error);
      res.status(500).json({
        error: 'Не удалось выполнить AI-анализ кожи. Проверьте подключение и попробуйте снова.',
        details: error?.message || String(error)
      });
    }
  });

  // 2. Endpoint: Killer Feature — INCI & Product Conflict Scanner (/api/analyze-product)
  app.post('/api/analyze-product', async (req, res) => {
    try {
      const { imageBase64, mimeType, productQuery, userProfile, currentRoutine } = req.body || {};

      const routineList =
        Array.isArray(currentRoutine) && currentRoutine.length > 0
          ? currentRoutine
              .map((s: any) => `${s.section === 'morning' ? 'Утро' : 'Вечер'}: ${s.name} (${s.brand})`)
              .join('; ')
          : 'Рутина пока пуста (пользователь формирует базовый уход)';

      const isMale = userProfile?.gender === 'male' || userProfile?.onboarding?.gender === 'male';
      const goalsText = Array.isArray(userProfile?.onboarding?.goals)
        ? userProfile.onboarding.goals.join(', ')
        : 'Базовый уход';
      const behaviorText = Array.isArray(userProfile?.onboarding?.skinBehavior)
        ? userProfile.onboarding.skinBehavior.join(', ')
        : userProfile?.skinType || 'Не определен';

      const skinContext = `Профиль пользователя (${userProfile?.name || 'Пользователь'}):
- Пол: ${isMale ? 'Мужской (обращайся в мужском роде, учитывай особенности мужской кожи и зону бритья)' : 'Женский'}
- Возраст: ${userProfile?.ageGroup || userProfile?.onboarding?.ageGroup || '18–24'}
- Тип и поведение кожи: ${behaviorText}
- Задачи ухода: ${goalsText}
- Бюджет: ${userProfile?.onboarding?.budget || '1 000 – 2 500 ₽'}
- Текущая рутина: ${routineList}`;

      const promptText = `Проанализируй косметическое средство и его состав (INCI) по фото и/или текстовому запросу: "${productQuery || 'Средство на фото'}".
${skinContext}

Задача косметического химика и дерматолога:
1. Определи точное название средства (productName) и бренд (brand).
2. Рассчитай совместимость средства с кожей пользователя (compatibilityScore от 0 до 100%).
3. Выдели ключевые полезные активы в goodIngredients (название компонента на русском/INCI и его доказанное действие).
4. Проверь состав на комедогенные компоненты, потенциальные раздражители, сушащие спирты, жесткие ПАВ или аллергенные отдушки в badIngredients (если состав чистый и безопасный — укажи только потенциальные нюансы с severity "warning", если есть опасные или комедогенные — "danger").
5. Проверь на конфликт с текущей рутиной пользователя (routineConflict): например, если в средстве есть AHA/BHA кислоты или ретинол, а в рутине уже есть сильные активы/кислоты/витамин С в этот же прием, или если средство требует обязательного SPF.
6. Предложи безопасный реальный аналог (safeAlternative) под бюджет пользователя (CeraVe, Гельтек, La Roche-Posay, Bioderma, Aravia, Dr.Jart+, Tatcha).`;


      const parts: any[] = [];
      if (imageBase64 && typeof imageBase64 === 'string') {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64
          }
        });
      }
      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction:
            'Ты — доказательный косметический химик и врач-дерматолог LUMI. Анализируй составы INCI и совместимость банок строго на русском языке в формате JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING },
              brand: { type: Type.STRING },
              compatibilityScore: {
                type: Type.INTEGER,
                description: 'Оценка совместимости с кожей пользователя от 0 до 100'
              },
              verdictSummary: {
                type: Type.STRING,
                description: 'Краткое резюме дерматолога по средству'
              },
              recommendedSection: {
                type: Type.STRING,
                description: 'morning или evening'
              },
              recommendedStepCategory: {
                type: Type.STRING,
                description: 'Этап ухода, например: Очищение, Сыворотка, Увлажнение, Кислотный уход, SPF'
              },
              estimatedPrice: { type: Type.INTEGER },
              goodIngredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    effect: { type: Type.STRING }
                  },
                  required: ['name', 'effect']
                }
              },
              badIngredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    effect: { type: Type.STRING },
                    severity: { type: Type.STRING, description: 'danger или warning' }
                  },
                  required: ['name', 'effect', 'severity']
                }
              },
              routineConflict: {
                type: Type.OBJECT,
                properties: {
                  hasConflict: { type: Type.BOOLEAN },
                  conflictWarning: { type: Type.STRING }
                },
                required: ['hasConflict', 'conflictWarning']
              },
              safeAlternative: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  brand: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  price: { type: Type.INTEGER }
                },
                required: ['name', 'brand', 'reason', 'price']
              }
            },
            required: [
              'productName',
              'brand',
              'compatibilityScore',
              'verdictSummary',
              'recommendedSection',
              'recommendedStepCategory',
              'estimatedPrice',
              'goodIngredients',
              'badIngredients',
              'routineConflict',
              'safeAlternative'
            ]
          }
        }
      });

      const rawText = response.text || '{}';
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (error: any) {
      console.error('Error in /api/analyze-product:', error);
      res.status(500).json({
        error: 'Не удалось разобрать состав средства. Попробуйте еще раз.',
        details: error?.message || String(error)
      });
    }
  });

  // 3. Endpoint: Telegram Bot Status (/api/telegram/status)
  app.get('/api/telegram/status', (_req, res) => {
    res.json({
      configured: Boolean(activeBotConfig.botToken),
      botUsername: activeBotConfig.botUsername || 'LumiSkinConciergeBot',
      testChatId: activeBotConfig.testChatId || '',
      webhookActive: Boolean(activeBotConfig.webhookActive),
      webhookUrl: activeBotConfig.webhookUrl || '',
      lastActivatedAt: activeBotConfig.lastActivatedAt || null
    });
  });

  // 4. Endpoint: Activate Telegram Bot Webhook & Profile (/api/telegram/setup)
  app.post('/api/telegram/setup', async (req, res) => {
    try {
      const { botToken, botUsername, appUrl, testChatId } = req.body || {};
      const tokenToUse = (botToken || activeBotConfig.botToken || '').trim();
      if (!tokenToUse) {
        res.status(400).json({
          error: 'Укажите BOT_TOKEN от @BotFather для активации логики бота.'
        });
        return;
      }

      const originHeader = req.headers.origin || '';
      const resolvedAppUrl = (
        appUrl ||
        (originHeader.startsWith('https://') ? originHeader : '') ||
        DEFAULT_PUBLIC_APP_URL
      ).replace(/\/$/, '');

      const webhookUrl = `${resolvedAppUrl}/api/telegram/webhook`;

      // Step 1: Verify bot token via getMe
      const meResp: any = await callTelegramApi(tokenToUse, 'getMe', {});
      if (!meResp?.ok) {
        res.status(400).json({
          error: `Telegram API отклонил токен: ${meResp?.description || 'Неверный BOT_TOKEN'}`
        });
        return;
      }

      const detectedUsername =
        meResp.result?.username ||
        (botUsername || '').replace(/^@/, '').trim() ||
        'LumiSkinConciergeBot';

      // Step 2: Register Webhook on current Cloud Run domain
      const webhookResp: any = await callTelegramApi(tokenToUse, 'setWebhook', {
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query']
      });

      // Step 3: Set selling Bot Description (setMyDescription)
      const descResp: any = await callTelegramApi(tokenToUse, 'setMyDescription', {
        description:
          '✨ Lumi — персональный AI-консьерж по уходу за кожей. Мультимодальная диагностика кожи лица по селфи, разбор составов банок (INCI) на комедогенность и конфликты активов, подбор утренней и вечернюю рутины под ваш бюджет.'
      });

      // Step 4: Set Bot Short Description (setMyShortDescription)
      const shortDescResp: any = await callTelegramApi(tokenToUse, 'setMyShortDescription', {
        short_description:
          '✨ AI-консьерж по уходу за кожей: диагностика по фото, INCI-сканер составов и персональная рутина'
      });

      // Step 5: Set Chat Menu Button to open Mini App (setChatMenuButton)
      const menuResp: any = await callTelegramApi(tokenToUse, 'setChatMenuButton', {
        menu_button: {
          type: 'web_app',
          text: '✨ Открыть Lumi',
          web_app: {
            url: resolvedAppUrl
          }
        }
      });

      activeBotConfig = {
        botToken: tokenToUse,
        botUsername: detectedUsername,
        appUrl: resolvedAppUrl,
        testChatId: testChatId ? String(testChatId).trim() : activeBotConfig.testChatId,
        webhookActive: Boolean(webhookResp?.ok),
        webhookUrl,
        lastActivatedAt: new Date().toLocaleString('ru-RU')
      };
      saveBotConfig(activeBotConfig);

      res.json({
        ok: true,
        botUsername: detectedUsername,
        webhookUrl,
        webhookActive: Boolean(webhookResp?.ok),
        details: {
          webhook: Boolean(webhookResp?.ok),
          description: Boolean(descResp?.ok),
          shortDescription: Boolean(shortDescResp?.ok),
          menuButton: Boolean(menuResp?.ok)
        },
        lastActivatedAt: activeBotConfig.lastActivatedAt
      });
    } catch (error: any) {
      console.error('Error in /api/telegram/setup:', error);
      res.status(500).json({
        error: 'Ошибка при обращении к Telegram Bot API',
        details: error?.message || String(error)
      });
    }
  });

  // 5. Endpoint: Telegram Webhook Auto-Responder (/api/telegram/webhook)
  app.post('/api/telegram/webhook', async (req, res) => {
    try {
      const update = req.body || {};
      const message = update.message;
      const token = activeBotConfig.botToken;
      const appUrl = activeBotConfig.appUrl || DEFAULT_PUBLIC_APP_URL;

      if (message && message.chat?.id && token) {
        const chatId = message.chat.id;
        const text = (message.text || '').trim();

        // Save latest interacting chatId as fallback for testing notifications
        if (!activeBotConfig.testChatId) {
          activeBotConfig.testChatId = String(chatId);
          saveBotConfig(activeBotConfig);
        }

        if (text.startsWith('/start')) {
          const welcomeText =
            '✨ Привет! Я Lumi — твой персональный AI-консьерж по уходу за кожей. Я помогу разобрать составы твоих банок, проверю их на конфликты и соберу идеальную утреннюю и вечернюю рутину под твой бюджет. Нажми кнопку ниже, чтобы начать диагностику 👇';

          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: welcomeText,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '✨ Открыть Lumi AI-консьерж',
                    web_app: {
                      url: appUrl
                    }
                  }
                ]
              ]
            }
          });
        } else {
          await callTelegramApi(token, 'sendMessage', {
            chat_id: chatId,
            text: '✨ Я готова проверить твои банки или провести AI-диагностику кожи! Нажми кнопку ниже, чтобы открыть Lumi Mini App 👇',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '✨ Открыть мою рутину',
                    web_app: {
                      url: appUrl
                    }
                  }
                ]
              ]
            }
          });
        }
      }

      res.status(200).json({ ok: true });
    } catch (error: any) {
      console.error('Error in /api/telegram/webhook:', error);
      res.status(200).json({ ok: true });
    }
  });

  // 6. Endpoint: Send AI Scan Report to User in Telegram Chat (/api/telegram/send-report)
  app.post('/api/telegram/send-report', async (req, res) => {
    try {
      const { chatId, botToken, skinScore, extraSummary, appUrl } = req.body || {};
      const tokenToUse = (botToken || activeBotConfig.botToken || '').trim();
      const targetChatId = String(chatId || activeBotConfig.testChatId || '').trim();
      const targetAppUrl = (appUrl || activeBotConfig.appUrl || DEFAULT_PUBLIC_APP_URL).replace(
        /\/$/,
        ''
      );

      if (!tokenToUse || !targetChatId) {
        res.status(200).json({
          ok: false,
          skipped: true,
          reason:
            'Для отправки сообщения в Telegram укажите BOT_TOKEN в профиле и откройте апп внутри Telegram (или укажите Chat ID).'
        });
        return;
      }

      const scoreNum = typeof skinScore === 'number' ? Math.round(skinScore) : 82;
      const baseReportText = `📋 Твой AI-отчет Lumi готов! Индекс кожи: ${scoreNum}/100. Твоя утренняя и вечерняя рутина сохранена в профиле`;
      const fullText = extraSummary
        ? `${baseReportText}\n\n${extraSummary}`
        : baseReportText;

      const tgResponse: any = await callTelegramApi(tokenToUse, 'sendMessage', {
        chat_id: targetChatId,
        text: fullText,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Открыть мою рутину',
                web_app: {
                  url: targetAppUrl
                }
              }
            ]
          ]
        }
      });

      if (!tgResponse?.ok) {
        res.status(400).json({
          ok: false,
          error: tgResponse?.description || 'Не удалось отправить отчет в чат Telegram'
        });
        return;
      }

      res.json({ ok: true, messageId: tgResponse.result?.message_id });
    } catch (error: any) {
      console.error('Error in /api/telegram/send-report:', error);
      res.status(500).json({
        ok: false,
        error: error?.message || 'Ошибка при отправке отчета в Telegram'
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LUMI BeautyTech server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
