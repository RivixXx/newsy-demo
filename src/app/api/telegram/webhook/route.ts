import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || 'chi-webhook';

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
  };
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

async function sendMessage(chatId: number, text: string, options?: Record<string, unknown>) {
  if (!TELEGRAM_BOT_TOKEN) return;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...options,
    }),
  });
}

async function handleStart(chatId: number, userId: number, firstName: string, username?: string) {
  const text = `
<b>Добро пожаловать в ЧИ! 🎯</b>

Привет, ${firstName}! Я бот ЧИ — платформы интерактивных челленджей.

<b>Доступные команды:</b>
/start — Приветствие
/profile — Мой профиль
/challenges — Список челленджей
/my — Мои участия
/achievements — Достижения
/help — Помощь

<i>Нажмите /challenges, чтобы начать!</i>
  `.trim();

  await sendMessage(chatId, text);
}

async function handleProfile(chatId: number, userId: number) {
  const text = `
<b>👤 Ваш профиль</b>

Пока это демо-режим.
Скоро здесь будут:
• Баллы и рейтинг
• Количество участий
• Достижения
  `.trim();

  await sendMessage(chatId, text);
}

async function handleChallenges(chatId: number) {
  const text = `
<b>📋 Доступные челленджи</b>

1️⃣ <b>Марафон ЗОЖ</b> — 30 дней здорового образа жизни
   Участников: 45 · Осталось мест: 55

2️⃣ <b>Код за 30 дней</b> — Изучи основы программирования
   Участников: 120 · Онлайн

3️⃣ <b>Фото-охота</b> — Найди и сфотографируй 10 объектов
   Участников: 78 · Офлайн

<i>Выберите челлендж для подробностей</i>
  `.trim();

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Марафон ЗОЖ', callback_data: 'challenge_1' },
          { text: 'Код за 30 дней', callback_data: 'challenge_2' },
        ],
        [
          { text: 'Фото-охота', callback_data: 'challenge_3' },
        ],
      ],
    },
  });
}

async function handleMy(chatId: number) {
  const text = `
<b>📊 Мои участия</b>

Пока у вас нет активных участий.
Начните с команды /challenges!
  `.trim();

  await sendMessage(chatId, text);
}

async function handleAchievements(chatId: number) {
  const text = `
<b>🏆 Достижения</b>

Пока у вас нет достижений.
Выполняйте задания в челленджах, чтобы получить первое!
  `.trim();

  await sendMessage(chatId, text);
}

async function handleHelp(chatId: number) {
  const text = `
<b>ℹ️ Помощь</b>

<b>Команды:</b>
/start — Приветствие и регистрация
/profile — Мой профиль
/challenges — Список доступных челленджей
/my — Мои участия и прогресс
/achievements — Мои достижения
/help — Эта справка

<b>О платформе:</b>
ЧИ — это место, где бренды и организации создают интерактивные челленджи для своих аудиторий.

<a href="https://chillenge-russia.ru">Открыть веб-версию →</a>
  `.trim();

  await sendMessage(chatId, text);
}

async function handleMessage(msg: TelegramMessage) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text || '';
  const firstName = msg.from.first_name;
  const username = msg.from.username;

  if (text.startsWith('/start')) {
    await handleStart(chatId, userId, firstName, username);
  } else if (text.startsWith('/profile')) {
    await handleProfile(chatId, userId);
  } else if (text.startsWith('/challenges')) {
    await handleChallenges(chatId);
  } else if (text.startsWith('/my')) {
    await handleMy(chatId);
  } else if (text.startsWith('/achievements')) {
    await handleAchievements(chatId);
  } else if (text.startsWith('/help')) {
    await handleHelp(chatId);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const secret = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const update: TelegramUpdate = await request.json();

    if (update.message) {
      await handleMessage(update.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[telegram-webhook] Critical error processing webhook:', error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: true }); // Always return 200 to prevent Telegram retries
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    bot: 'ЧИ Telegram Bot',
    version: '1.0.0',
  });
}
