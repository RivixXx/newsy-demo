# Полный анализ сервиса NEWSY Demo

> Дата анализа: 06 июля 2026 г.  
> Основа: кодовая база `newsy-demo` + замечания из `ChI_kommenty_ot_02_07.docx`

---

## 📋 Общий стек

| Слой | Технология |
|------|-----------|
| Frontend/Backend | Next.js 15 (App Router) + React 19 |
| БД | PostgreSQL + Prisma 6 |
| Хранилище файлов | Supabase Storage |
| Платежи | ЮKassa |
| Аутентификация | Самописная (HMAC + cookie) |
| 3D-графика | Three.js / React Three Fiber |
| Rate limiting | In-memory Map (на одном процессе) |

---

## 🔴 КРИТИЧЕСКИЕ ПРОБЛЕМЫ (блокируют production)

### 1. Email/телефон не верифицируются при регистрации

**Файл:** [`src/modules/identity/actions.ts`](file:///d:/Проекты/NF/newsy-demo/src/modules/identity/actions.ts#L63-L123)

Пользователь регистрируется и сразу входит без подтверждения email/телефона. Поле `status` при создании выставляется в `ACTIVE`, минуя `PENDING`.

```ts
// actions.ts:103 — сразу ACTIVE, подтверждение не требуется
status: 'ACTIVE',
```

**Последствия:**
- Нарушение ФЗ-149 «Об информации» и требований 152-ФЗ (идентификация).
- Невозможно восстановить пароль (нет рабочей почты/телефона).
- Реферальная программа работает через непроверенных пользователей.

**Замечание из docx (п.3 раздела «Внешний вид»):** Автор документа сам указывает: *«в нем должен присутствовать момент верификации с подтверждением по почте или смс (по закону)»*.

---

### 2. Сброс пароля — заглушка (не реализован)

**Файл:** [`src/modules/identity/services/auth-service.impl.ts`](file:///d:/Проекты/NF/newsy-demo/src/modules/identity/services/auth-service.impl.ts#L51-L56)

```ts
async requestPasswordReset(_payload: PasswordResetRequest): Promise<void> {
  return; // ← пустая функция
}
async confirmPasswordReset(_payload: PasswordResetConfirmation): Promise<void> {
  return; // ← пустая функция
}
```

Если пользователь забыл пароль — выхода нет. Критично для production.

---

### 3. Rate limiting не работает в multi-instance/serverless окружении

**Файл:** [`src/lib/rate-limit.ts`](file:///d:/Проекты/NF/newsy-demo/src/lib/rate-limit.ts)

```ts
const store = new Map<string, RateLimitEntry>(); // in-memory!
```

На Vercel (serverless) каждый инстанс имеет свою Map. При нескольких параллельных запросах ограничение не работает совсем. Brute-force паролей не защищён в production.

**Нужно:** Redis / Upstash / KV-хранилище от Vercel.

---

### 4. Webhook от ЮKassa не валидируется криптографически

**Файл:** [`src/app/api/payments/webhook/route.ts`](file:///d:/Проекты/NF/newsy-demo/src/app/api/payments/webhook/route.ts#L8-L30)

```ts
// только префиксная проверка IP — легко подделать
if (!isYooKassaIP(clientIP)) {
  console.warn(`Webhook from unknown IP: ${clientIP}`); // только warn!
}
```

- IP-фильтрация не блокирует запрос, только пишет предупреждение.
- X-Forwarded-For легко подделать через любой прокси.
- ЮKassa поддерживает HMAC-SHA256 верификацию тела — она не используется.

**Последствия:** Злоумышленник может отправить поддельный webhook и опубликовать челлендж без оплаты.

---

### 5. Race condition при создании платежа

**Файл:** [`src/modules/payments/services/payment-service.ts`](file:///d:/Проекты/NF/newsy-demo/src/modules/payments/services/payment-service.ts#L26-L70)

```ts
// Проверка pending платежа и создание нового — два отдельных запроса
const existingPending = await prisma.paymentTransaction.findFirst(...)
// ...
await prisma.paymentTransaction.create(...)
```

Между `findFirst` и `create` нет транзакции с блокировкой. При параллельных запросах создаётся двойная транзакция — два платежа за один челлендж.

**Решение:** `prisma.$transaction` с isolation level или `upsert` + уникальный constraint.

---

## 🟠 СЕРЬЁЗНЫЕ ПРОБЛЕМЫ (влияют на корректность и безопасность)

### 6. Комиссия считается в момент публикации, а не по факту участия

**Файл:** [`src/modules/payments/services/payment-service.ts`](file:///d:/Проекты/NF/newsy-demo/src/modules/payments/services/payment-service.ts#L103-L122)

```ts
// В handleWebhook при payment.succeeded:
const commission = await commissionService.calculateCommission(
  transaction.challengeId,
  challenge.entryFee,
  0   // ← participantsCount = 0 жёстко прописан!
);
```

Комиссия фиксируется при публикации с 0 участников. `totalRevenue = entryFee * 0 = 0`. Реальные поступления от участников нигде не учитываются.

---

### 7. Подписка не сохраняется в БД при создании через ЮKassa

**Файл:** [`src/modules/payments/services/subscription-service.ts`](file:///d:/Проекты/NF/newsy-demo/src/modules/payments/services/subscription-service.ts#L47-L66)

При платной подписке `createSubscription` создаёт платёж в ЮKassa, но **не сохраняет запись** в `UserSubscription`. Запись создаётся только в `handleWebhook`. Если webhook придёт раньше, чем пользователь вернётся — всё ок. Но:
- Нет записи о намерении подписки.
- При ошибке webhook нет возможности восстановить состояние.
- `providerId` не записывается в момент создания платежа.

---

### 8. Роли проверяются string-сравнением, не через Permission-таблицу

**Файл:** [`src/app/api/admin/challenges/pending/route.ts`](file:///d:/Проекты/NF/newsy-demo/src/app/api/admin/challenges/pending/route.ts#L12)

```ts
if (!session.user.roles?.includes('admin')) { ... }
```

В БД есть полноценная RBAC-система (`Role`, `Permission`, `PermissionRole`). Но в коде вместо неё используется `includes('admin')`. Система прав не применяется — она просто мертва.

---

### 9. Idempotency Key для ЮKassa генерируется с Math.random()

**Файл:** [`src/modules/payments/services/yookassa-service.ts`](file:///d:/Проекты/NF/newsy-demo/src/modules/payments/services/yookassa-service.ts#L65)

```ts
const idempotencyKey = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
```

Idempotency key должен быть детерминированным (например, UUID от challengeId + userId), чтобы повторный запрос вернул тот же платёж. Текущий подход с `Math.random()` нарушает идемпотентность.

---

### 10. Middleware не защищает API-маршруты

**Файл:** [`src/middleware.ts`](file:///d:/Проекты/NF/newsy-demo/src/middleware.ts#L102-L104)

```ts
matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
```

`/api/*` маршруты не покрыты middleware. Защита API полностью перенесена на ручные проверки в каждом route-handler. Пропустить проверку в одном месте — и endpoint открыт.

---

### 11. Мок ЮKassa активен при отсутствии ключей (без явной настройки)

**Файл:** [`src/modules/payments/services/yookassa-service.ts`](file:///d:/Проекты/NF/newsy-demo/src/modules/payments/services/yookassa-service.ts#L19)

```ts
const isMock = !shopId || !secretKey;
```

Если в production случайно не задать `YOOKASSA_SHOP_ID` или `YOOKASSA_SECRET_KEY`, сервис тихо переходит в mock-режим с автоматическим "успехом" платежей. Никакой ошибки, никакого алерта.

---

### 12. pbkdf2Sync используется синхронно в event loop

**Файл:** [`src/modules/identity/services/password-hash.ts`](file:///d:/Проекты/NF/newsy-demo/src/modules/identity/services/password-hash.ts#L9)

```ts
const hash = pbkdf2Sync(password, salt, 210_000, 64, 'sha512');
```

210 000 итераций sha512 — это ~200-500 мс CPU-блокировки. На каждый логин/регистрацию. В Next.js Server Actions это блокирует event loop. Нужен `pbkdf2` async или `argon2`/`bcrypt` (и лучше `argon2id`).

---

## 🟡 СЛАБЫЕ МЕСТА (качество кода и продуктовые риски)

### 13. `any` типы в критических местах

```ts
// subscription-service.ts
handleWebhook(payload: any): Promise<void>;
getUserSubscription(userId: string): Promise<any>;
// challenge-service.ts
createChallenge(data: any): Promise<any>;
```

Типизация в платёжном и challenge-сервисах практически отсутствует. Ошибки в payload не поймёт TypeScript.

---

### 14. Challenges API не учитывает реальное число участников

**Файл:** [`src/app/api/challenges/route.ts`](file:///d:/Проекты/NF/newsy-demo/src/app/api/challenges/route.ts#L29-L30)

```ts
participantsCount: 0,  // ← всегда 0
maxParticipants: 100,  // ← всегда 100
```

Данные в карточках челленджей — фиктивные. Фронтенд всегда показывает 0/100 участников, хотя в БД есть `UserProgress` с реальными данными.

---

### 15. Hardcoded Unsplash fallback в API-ответе

```ts
imageUrl: c.media[0]?.url || 'https://images.unsplash.com/photo-...'
```

Внешняя зависимость от Unsplash в API-ответе. Если Unsplash недоступен — пустые изображения у всех карточек без медиа.

---

### 16. Rate limiting для webhook слишком высокий

```ts
rateLimit('webhook:yookassa', { windowMs: 60_000, max: 50 })
```

50 webhook'ов в минуту для одного ключа — это много. Но главное: ключ не per-IP, а глобальный. Один злоумышленник может «занять» лимит для всей ЮKassa.

---

### 17. CSP содержит `'unsafe-eval'` и `'unsafe-inline'`

**Файл:** [`next.config.js`](file:///d:/Проекты/NF/newsy-demo/next.config.js#L29)

```js
"script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval'"
```

`unsafe-eval` необходим для Three.js (WASM), но `unsafe-inline` расширяет XSS-поверхность. В сочетании — CSP теряет большую часть защитной функции.

---

### 18. Страницы политики/правил редиректят на 404

**Файл:** [`next.config.js`](file:///d:/Проекты/NF/newsy-demo/next.config.js#L44-L48)

```js
{ source: '/privacy', destination: '/404', permanent: false },
{ source: '/terms', destination: '/404', permanent: false },
```

Для платёжного сервиса (ЮKassa) и обработчика персональных данных — отсутствие страниц «Политика конфиденциальности» и «Пользовательское соглашение» нарушает требования 152-ФЗ и условия подключения ЮKassa.

---

### 19. `maxParticipants` — поле есть в CreateChallengeInput, но не в схеме

**Файл:** [`src/modules/challenges/actions/create.ts`](file:///d:/Проекты/NF/newsy-demo/src/modules/challenges/actions/create.ts#L14)

```ts
maxParticipants: number; // ← в интерфейсе
```

Поле `maxParticipants` описано в DTO, но отсутствует в схеме Prisma (модель `Challenge` его не имеет). Данные теряются при создании.

---

### 20. Отсутствует валидация `birthDate` при регистрации

**Файл:** [`src/modules/identity/actions.ts`](file:///d:/Проекты/NF/newsy-demo/src/modules/identity/actions.ts#L74-L106)

Дата рождения принимается из FormData и конвертируется `new Date(birthDate)` без проверки формата. При некорректной строке — `Invalid Date` попадает в БД.

---

### 21. `OrganizerMember.roleInOrganizer` и `status` — строки без enum

**Файл:** [`prisma/schema.prisma`](file:///d:/Проекты/NF/newsy-demo/prisma/schema.prisma#L195-L196)

```prisma
roleInOrganizer    String
status             String
```

`UserProgress.status` и `StepProgress.status` — тоже plain String. Enum'ы для этих полей в схеме отсутствуют, хотя они есть для `ChallengeStatus`, `UserStatus` и т.д. Нет гарантий консистентности данных.

---

## 📋 ЗАМЕЧАНИЯ ИЗ ДОКУМЕНТА ChI_kommenty_ot_02_07.docx

Ниже приведены все замечания из файла с оценкой их реализованности:

### Раздел «Общий внешний вид»

| # | Замечание | Статус в коде |
|---|-----------|--------------|
| 1 | Убрать кнопку «Кабинет» из шапки, оставить только «Профиль» — объединить все данные | ⚠️ Требует рефакторинга UI |
| 2 | Убрать Уровни, Опыт и Баллы — оставить только Достижения и Награды | ⚠️ В схеме Prisma `points` и `rating` у User всё ещё присутствуют. Нужно решить: убрать поля или скрыть на UI |
| 3 | Добавить верификацию email/SMS при регистрации + реферальная программа | 🔴 **Не реализовано** (см. критическая проблема #1) |
| 3 | Добавить регистрацию ИП/ООО/самозанятых с полями ИНН, наименование | 🔴 **Не реализовано** — нет полей в схеме Organizer |
| 4 | Единообразие карточки ЧИ в списке и при просмотре | ⚠️ Требует аудита компонентов |
| 5 | Разместить группировки ЧИ по центру экрана | ⚠️ UI-правка |
| 5 | Упростить нижнее меню: убрать «Платформа» и «Участникам», оставить конкретные ссылки | 🔴 Все страницы из правого списка (`/help`, `/api-docs` и др.) редиректят на 404 |

### Раздел «ЧИ»

| # | Замечание | Статус в коде |
|---|-----------|--------------|
| 1 | Проработать кооперативные ЧИ — либо убрать пока, либо добавить механику сообществ | ⚠️ Поле `isCooperative` есть в схеме, но механика участия групп не реализована. Вводит пользователя в заблуждение |
| 1 | Добавить ЧИ от нескольких организаторов с долями выплат | 🔴 Схема не поддерживает (у Challenge один `organizerId`). Нужно `ChallengeOrganizer` many-to-many с полем `sharePercent` |
| 2 | Разрешить загрузку видео в обложку ЧИ | ⚠️ `MediaType` уже имеет `VIDEO`. В UI/upload flow — нужна проверка |
| 3 | Убрать из этапов ЧИ баллы (пока) | ⚠️ `rewardPoints` в схеме и API есть, UI должен скрыть поле |
| 4 | Добавить в фильтры: Формат (Онлайн/Офлайн/Гибрид), время начала/окончания, геолокацию, «Цена участия для 1 человека», требования к участникам | 🔴 Схема `Challenge` не имеет поля `format` и `location` (только строка в Step.config). Нужны миграции |
| 5 | В «Наград» добавить «Достижение» (звание) и «Награда» (приз). Убрать баллы | ⚠️ Схема не разделяет эти концепции. `Achievement` есть, но привязан к платформе, а не к конкретному ЧИ |

---

## 🏗️ АРХИТЕКТУРНЫЕ НАБЛЮДЕНИЯ

### Дублирование логики сессии

Верификация сессии реализована в двух местах с разной логикой:
- [`src/middleware.ts`](file:///d:/Проекты/NF/newsy-demo/src/middleware.ts) — Web Crypto API (Edge Runtime)
- [`src/lib/session.ts`](file:///d:/Проекты/NF/newsy-demo/src/lib/session.ts) — Node.js `crypto`

Расхождение может привести к ситуации, когда middleware пускает пользователя, но `getCurrentAuthSession` возвращает null (или наоборот), из-за разницы в парсинге `expiresAt` vs `issuedAt`.

### RBAC-система создана, но не используется

Полная система `Role → Permission → PermissionRole` в схеме — мёртвый код. Все проверки идут через `session.user.roles.includes('admin')`. Инвестиции в схему не конвертированы в реальную защиту.

### Referral-система — только поле в БД

`User.referredBy` есть, но нет:
- Механики начисления бонусов рефереру.
- Уникального кода реферала на пользователя.
- Трекинга конверсий.

---

## 🚀 ПРИОРИТЕТНЫЙ ПЛАН ИСПРАВЛЕНИЙ

| Приоритет | Задача | Трудоёмкость |
|-----------|--------|-------------|
| 🔴 P0 | Верификация email/SMS при регистрации | 3-5 дн |
| 🔴 P0 | HMAC-верификация webhook ЮKassa | 0.5 дн |
| 🔴 P0 | Реализовать сброс пароля | 2-3 дн |
| 🔴 P0 | Страницы политики конфиденциальности и оферты | 1 дн |
| 🟠 P1 | Redis для rate limiting | 1 дн |
| 🟠 P1 | Транзакция с блокировкой при создании платежа | 0.5 дн |
| 🟠 P1 | Запись подписки в БД до webhook | 1 дн |
| 🟠 P1 | Реальный participantsCount в API | 0.5 дн |
| 🟠 P1 | Перевести pbkdf2Sync на async | 0.5 дн |
| 🟡 P2 | Включить RBAC-систему (Permission check) | 2 дн |
| 🟡 P2 | Добавить поле `format` и `location` в Challenge | 1 дн |
| 🟡 P2 | Multi-organizer Challenge (схема + API) | 3-5 дн |
| 🟡 P2 | Регистрация организаций (ИП/ООО/самозанятый) | 3 дн |
| 🟡 P2 | Убрать `isCooperative` из UI до реализации механики | 0.5 дн |
