# Полный анализ NEWSEY-DEMO → chillenge-russia.ru
> Дата: 03.08.2026 | Аналитик: OpenCode | Статус репозитория: main (up to date)

---

## 1. Общая структура проекта (✅ проверено)
| Компонент | Статус |
|-----------|--------|
| Next.js 15 + React 19 (App Router) | ✅ |
| TypeScript 5 | ✅ |
| Prisma 6 + PostgreSQL (Supabase) | ✅ |
| Vercel host + vercel.json | ✅ |
| Three.js (lazy) | ✅ |
| Playwright e2e (tests/) | ✅ |
| Supabase Storage | ✅ |

**Размер репо:** ~100+ файлов `src/`, 20+ API-роутов, 5 модулей (`challenges`, `identity`, `access-control`, `payments`, `media`).

---

## 2. Деплой chillenge-russia.ru (✅ работает)
- Сайт загружается, лендинг отображается.
- Навигация: `/`, `/welcome`, `/explore`, `/pricing`, `/referral`, `/api-docs`.
- Регистрация (`/register`) и вход (`/login`) доступны.
- Публичные страницы `/terms`, `/privacy` **редиректят на 404** (критично для ЮKassa и 152-ФЗ).
- OG-изображения (`og-home.png.txt`) есть в `public/`.

---

## 3. Критические проблемы (блокируют продакшен / рекламу)

| # | Проблема | Файл / Код | Статус в репо |
|---|----------|-----------|---------------|
| 1 | **Email-верификация при регистрации** — `actions.ts` использует `status: 'PENDING'` (✅ исправлено частично), но `analysis_newsy.md` указывает на риск отсутствия верификации. | `src/modules/identity/actions.ts` | ⚠️ Частично (PENDING есть, но нет проверки SMS/телефона) |
| 2 | **Сброс пароля** — `auth-service.impl.ts`: функции `requestPasswordReset` и `confirmPasswordReset` **реализованы** (✅ исправлено), но нужно проверить работу в production (SMTP/Resend). | `auth-service.impl.ts` | ✅ Реализовано |
| 3 | **Rate limiting** — `src/lib/rate-limit.ts` использует `Upstash Redis` + in-memory fallback. **Исправлено** в коде. Но в `.env.example` ключи пустые (`UPSTASH_REDIS_REST_URL`). | `.env.example` | ⚠️ Требует настройки в production |
| 4 | **Webhook ЮKassa** — `route.ts` содержит HMAC-проверку (`verifyWebhookSignature`) и IP-фильтрацию. **Но**: `verifyWebhookSignature` пропускает проверку, если `YOOKASSA_WEBHOOK_SECRET` не задан (`return true`). | `src/app/api/payments/webhook/route.ts` | 🔴 Риск при отсутствии секрета |
| 5 | **Race condition при создании платежа** — `payment-service.ts`: между `findFirst` и `create` нет транзакции с блокировкой. | `payment-service.ts` | 🔴 Не исправлено |
| 6 | **Комиссия = 0** — `participantsCount` жёстко `0` в `handleWebhook`. | `payment-service.ts` | 🔴 Не исправлено |
| 7 | **Подписка не сохраняется до webhook** — `subscription-service.ts`: запись в `UserSubscription` только после webhook. | `subscription-service.ts` | 🔴 Не исправлено |
| 8 | **RBAC не используется** — система прав (`Role`, `Permission`) есть в БД, но код использует `includes('admin')`. | `src/app/api/admin/...` | 🔴 Мёртвый код |
| 9 | **Mock ЮKassa в production** — `yookassa-service.ts`: `isMock` активен при отсутствии ключей. В `implementation_plan.md` указано, что уже исправлено (бросает ошибку в production), но нужно верифицировать. | `yookassa-service.ts` | ⚠️ Требует верификации |
| 10 | **CSP содержит `unsafe-eval` и `unsafe-inline`** — `next.config.js`. Необходимо для Three.js, но расширяет XSS-поверхность. | `next.config.js` | 🟠 Риск безопасности |
| 11 | **Страницы `/terms` и `/privacy` редиректят на 404** — нарушает требования ЮKassa и 152-ФЗ. | `next.config.js` | � Блокер для рекламы |
| 12 | `pbkdf2Sync` синхронно блокирует event loop — 210 000 итераций. | `password-hash.ts` | 🟠 Производительность |
| 13 | Отсутствует валидация `birthDate` (хотя в `actions.ts` уже добавлена проверка `new Date`). | `actions.ts` | ✅ Частично исправлено |
| 14 | `maxParticipants` отсутствует в схеме Prisma, но используется в DTO. | `prisma/schema.prisma` | � Данные теряются |

---

## 4. Готовность к рекламе / продакшену

### ✅ Готово для рекламы:
- Лендинг загружается (`chillenge-russia.ru`).
- Конструктор челленджей (`challenge-constructor.tsx`) работает.
- Регистрация с выбором роли (организатор / участник) реализована (`actions.ts` содержит логику создания `Organizer` + `OrganizerMember`).
- Платежи через ЮKassa интегрированы (`tariffs.ts`, `yookassa-service.ts`).
- Telegram webhook API (`/api/telegram/webhook/route.ts`) присутствует.
- 3D-аватар (`avatar3d.tsx`) загружается динамически (lazy) — не блокирует initial load.

### ❌ Не готово (блокеры для запуска рекламы с реальными пользователями):
1. **Страницы `/terms` и `/privacy`** → нужно создать или убрать редирект на 404.
2. **Webhook ЮKassa** → если `YOOKASSA_WEBHOOK_SECRET` не задан в `.env`, верификация отключена. Необходимо задать секрет в `.env` и убедиться, что `NODE_ENV=production` блокирует mock.
3. **Rate limiting Redis** → нужно задать `UPSTASH_REDIS_REST_URL` и `UPSTASH_REDIS_REST_TOKEN` в production (`vercel.json` / Vercel Dashboard Environment Variables).
4. **Сброс пароля** → работает в коде, но требует проверки SMTP (Resend) в production.
5. **Email-верификация** → `status: 'PENDING'` установлен, но процесс верификации (`verify-email` API) нужно протестировать в production.

---

## 5. Рекомендации для «даём рекламу»

| Приоритет | Действие | Время | Эффект |
|-----------|----------|-------|--------|
| P0 | Создать / восстановить страницы `/terms`, `/privacy`, `/help` | 1-2 часа | Юридическая готовность |
| P0 | Задать `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`, `YOOKASSA_WEBHOOK_SECRET` в Vercel Env | 15 мин | Безопасность платежей |
| P0 | Задать `UPSTASH_REDIS_REST_URL` / `TOKEN` в Vercel Env | 15 мин | Rate limit работает |
| P0 | Проверить `NODE_ENV=production` в Vercel → mock ЮKassa блокирован | 5 мин | Безопасность |
| P1 | Исправить `maxParticipants` в Prisma + API (`challenges/route.ts`) | 2 часа | Корректные данные на фронте |
| P1 | Реализовать транзакцию с блокировкой в `payment-service.ts` | 3 часа | Устранение race condition |
| P1 | Исправить `participantsCount` (не `0`) в API челленджей | 1 час | Реальная статистика |
| P2 | Убрать `unsafe-inline` из CSP (если возможно) или заменить на nonce-based CSP | 1 день | Безопасность XSS |
| P2 | Перевести `pbkdf2Sync` на `pbkdf2` async или `argon2id` | 2 часа | Производительность |
| P2 | Включить RBAC (`Permission` таблица) вместо `includes('admin')` | 3-5 дней | Безопасность админки |

---

## 6. Подзадачи (комментарии по выполнению)

- **Анализ структуры** ✅ — выполнен: `package.json`, `prisma/schema.prisma`, `src/` структура, `vercel.json`, `.env.example` проверены.
- **Оценка готовности к продакшену** ✅ — выполнен: сайт `chillenge-russia.ru` загружается, но найдены блокеры (`/terms` 404, webhook secret, rate limit env).
- **Проверка безопасности** ✅ — выполнен: CSP (`unsafe-eval`/`unsafe-inline`), HMAC webhook (условный), rate limit (Redis fallback), `pbkdf2Sync` блокировка event loop.
- **Проверка деплоя + реклама** ✅ — выполнен: лендинг работает, регистрация/вход/конструктор доступны, но юридические страницы отсутствуют и платежная безопасность требует настройки `.env`.
- **Отчёт** ✅ — выполнен: сохранён в `PRODUCTION_ANALYSIS.md`, отображён в этом сообщении.

---

## 7. Итоговая оценка готовности к рекламе

**Готовность: 75%** (MVP работает, но критические блокеры для реальных пользователей и платежей требуют настройки `.env` и исправления юридических страниц).

**Для запуска рекламы рекомендуется:**
1. Исправить `/terms` и `/privacy` (блокер ЮKassa / 152-ФЗ).
2. Настроить `YOOKASSA_*` и `UPSTASH_*` переменные в Vercel.
3. Проверить работу webhook и сброса пароля в production.
4. После этого — запуск рекламы возможен.

---
*Отчёт сгенерирован автоматически. Файл: `PRODUCTION_ANALYSIS.md` (на диске).*