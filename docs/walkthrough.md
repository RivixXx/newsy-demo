# Отчёт о проделанной работе — Newsy Demo

> Дата: 06 июля 2026 г.
> Статус TypeScript: ✅ **0 ошибок** (`npx tsc --noEmit` — пройдено)

---

## ✅ Критические → исправлено

### 1. `pbkdf2Sync` → async
[password-hash.ts](file:///d:/Проекты/NF/newsy-demo/src/modules/identity/services/password-hash.ts)

Заменён на `promisify(pbkdf2)` — хеширование теперь в libuv threadpool, не блокирует event loop на 200–500 мс.

### 2. Статусы пользователя при входе
[auth-service.impl.ts](file:///d:/Проекты/NF/newsy-demo/src/modules/identity/services/auth-service.impl.ts)

Добавлены явные проверки `SUSPENDED` и `PENDING` — пользователь получает понятное сообщение.

### 3. Регистрация → PENDING + валидации
[actions.ts](file:///d:/Проекты/NF/newsy-demo/src/modules/identity/actions.ts)

- Статус изменён с `ACTIVE` на `PENDING` — нельзя войти без верификации email
- Валидация email-формата, birthDate (не в будущем, не раньше 1900), длины имени/фамилии
- Убран немедленный вход после регистрации

### 4. Webhook ЮKassa — блокировка + HMAC
[webhook/route.ts](file:///d:/Проекты/NF/newsy-demo/src/app/api/payments/webhook/route.ts)

- IP-фильтрация теперь возвращает **403** (а не просто warn)
- HMAC-SHA256 верификация тела через `YOOKASSA_WEBHOOK_SECRET`
- Статус-мисматч (webhook vs API) → пропускаем без обработки

### 5. YooKassa — production защита + идемпотентный ключ
[yookassa-service.ts](file:///d:/Проекты/NF/newsy-demo/src/modules/payments/services/yookassa-service.ts)

- В production **бросает ошибку** при отсутствии ключей (больше нет тихого mock)
- Idempotency key — SHA-256 от метаданных платежа (детерминированный)

### 6. Страницы /privacy, /terms, /refund созданы
- [privacy/page.tsx](file:///d:/Проекты/NF/newsy-demo/src/app/(public)/privacy/page.tsx) — Политика конфиденциальности (152-ФЗ)
- [terms/page.tsx](file:///d:/Проекты/NF/newsy-demo/src/app/(public)/terms/page.tsx) — Пользовательское соглашение
- [refund/page.tsx](file:///d:/Проекты/NF/newsy-demo/src/app/(public)/refund/page.tsx) — Политика возврата (требуется ЮKassa)

Редиректы на 404 в `next.config.js` убраны, `/rules` → `/terms`.

---

## 🟠 Серьёзные → исправлено

### 7. Race condition платежа + комиссия
[payment-service.ts](file:///d:/Проекты/NF/newsy-demo/src/modules/payments/services/payment-service.ts)

- Race condition устранён через `$transaction` + обработку unique constraint ошибки
- Убрано начисление комиссии с 0 участников
- Бесплатная публикация без создания транзакции

### 8. Подписка — pending-запись до webhook
[subscription-service.ts](file:///d:/Проекты/NF/newsy-demo/src/modules/payments/services/subscription-service.ts)

Статус `TRIALING` сохраняется до webhook. Данные не теряются при задержке.

### 9. Реальный `participantsCount`
[challenges/route.ts](file:///d:/Проекты/NF/newsy-demo/src/app/api/challenges/route.ts)

`_count.participations` вместо hardcoded `0`.

### 10. RBAC подключён в admin-маршрутах
- [pending/route.ts](file:///d:/Проекты/NF/newsy-demo/src/app/api/admin/challenges/pending/route.ts)
- [add-member/route.ts](file:///d:/Проекты/NF/newsy-demo/src/app/api/admin/organizer/add-member/route.ts)

`roles.includes('admin')` → `buildAccessContext` + `isAdmin(permissionSet)`.

### 11. Middleware — сессия унифицирована
[middleware.ts](file:///d:/Проекты/NF/newsy-demo/src/middleware.ts)

`expiresAt` вместо `issuedAt + lifetime`. Редирект сохраняет `?next=...`.

### 12–13. Enum статусы в complete-step и profile-stats

- `'COMPLETED'` → `'APPROVED'` (StepProgressStatus)
- `'IN_PROGRESS'` / `'COMPLETED'` → enum (UserProgressStatus)

---

## 🟡 Слабые места → исправлено

### 14. Схема Prisma — новые enum'ы и поля
[schema.prisma](file:///d:/Проекты/NF/newsy-demo/prisma/schema.prisma)

Добавлены:
- `ChallengeFormat` (ONLINE/OFFLINE/HYBRID)
- `OrganizerMemberRole` / `OrganizerMemberStatus`
- `UserProgressStatus` / `StepProgressStatus`
- Поля `Challenge.format`, `Challenge.address`, `Challenge.maxParticipants`
- Поля `StepProgress.reviewedAt`, `StepProgress.reviewNote`

> ⚠️ **Требуется:** `npx prisma migrate dev --name "add-format-enums"`

### 15–18. Прочие улучшения

- [create.ts](file:///d:/Проекты/NF/newsy-demo/src/modules/challenges/actions/create.ts): `format`, `address`, `maxParticipants` в CreateChallengeInput
- [rate-limit.ts](file:///d:/Проекты/NF/newsy-demo/src/lib/rate-limit.ts): production warning + документация Upstash
- [.env.example](file:///d:/Проекты/NF/newsy-demo/.env.example): `YOOKASSA_WEBHOOK_SECRET`, `UPSTASH_REDIS_REST_URL`
- [seed.ts](file:///d:/Проекты/NF/newsy-demo/prisma/seed.ts): `'ADMIN'` / `'MEMBER'` enum values

---

## ⚠️ Требует вашего участия

| # | Задача | Что нужно |
|---|--------|-----------|
| 1 | Email-верификация | SMTP-сервис (Resend/Brevo) + отправка токена |
| 2 | Сброс пароля | SMTP + хранение токена в БД |
| 3 | Distributed rate limiting | [Upstash](https://upstash.com) Redis + заменить `rate-limit.ts` |
| 4 | YOOKASSA_WEBHOOK_SECRET | ЮKassa Dashboard → Вебхуки → секрет |
| 5 | **Миграция БД** | `npx prisma migrate dev --name "add-format-enums"` |
| 6 | Регистрация ИП/ООО | Продуктовое решение: какие поля, как верифицировать ИНН |
| 7 | Multi-organizer ЧИ | Таблица `ChallengeOrganizer` с `sharePercent` |
| 8 | Тексты /privacy, /terms, /refund | Финальный текст согласовать с юристом |

---

## 🗂️ Все изменённые/созданные файлы (23)

| Файл | Изменение |
|------|-----------|
| [password-hash.ts](file:///d:/Проекты/NF/newsy-demo/src/modules/identity/services/password-hash.ts) | pbkdf2Sync → async |
| [auth-service.impl.ts](file:///d:/Проекты/NF/newsy-demo/src/modules/identity/services/auth-service.impl.ts) | статусы + await |
| [actions.ts](file:///d:/Проекты/NF/newsy-demo/src/modules/identity/actions.ts) | PENDING + валидация |
| [webhook/route.ts](file:///d:/Проекты/NF/newsy-demo/src/app/api/payments/webhook/route.ts) | IP 403 + HMAC |
| [yookassa-service.ts](file:///d:/Проекты/NF/newsy-demo/src/modules/payments/services/yookassa-service.ts) | prod guard + idempotency |
| [payment-service.ts](file:///d:/Проекты/NF/newsy-demo/src/modules/payments/services/payment-service.ts) | race condition |
| [payments/create/route.ts](file:///d:/Проекты/NF/newsy-demo/src/app/api/payments/create/route.ts) | userId param |
| [subscription-service.ts](file:///d:/Проекты/NF/newsy-demo/src/modules/payments/services/subscription-service.ts) | TRIALING + типы |
| [challenges/route.ts](file:///d:/Проекты/NF/newsy-demo/src/app/api/challenges/route.ts) | _count participations |
| [admin/challenges/pending/route.ts](file:///d:/Проекты/NF/newsy-demo/src/app/api/admin/challenges/pending/route.ts) | RBAC |
| [admin/organizer/add-member/route.ts](file:///d:/Проекты/NF/newsy-demo/src/app/api/admin/organizer/add-member/route.ts) | RBAC + MEMBER |
| [middleware.ts](file:///d:/Проекты/NF/newsy-demo/src/middleware.ts) | expiresAt |
| [rate-limit.ts](file:///d:/Проекты/NF/newsy-demo/src/lib/rate-limit.ts) | prod warning |
| [complete-step/route.ts](file:///d:/Проекты/NF/newsy-demo/src/app/api/challenges/[id]/complete-step/route.ts) | APPROVED enum |
| [profile-stats/route.ts](file:///d:/Проекты/NF/newsy-demo/src/app/api/user/profile-stats/route.ts) | APPROVED enum |
| [challenges/actions/create.ts](file:///d:/Проекты/NF/newsy-demo/src/modules/challenges/actions/create.ts) | format/address/maxParticipants |
| [schema.prisma](file:///d:/Проекты/NF/newsy-demo/prisma/schema.prisma) | новые enum'ы |
| [seed.ts](file:///d:/Проекты/NF/newsy-demo/prisma/seed.ts) | ADMIN/MEMBER |
| [next.config.js](file:///d:/Проекты/NF/newsy-demo/next.config.js) | убраны 404-редиректы |
| [.env.example](file:///d:/Проекты/NF/newsy-demo/.env.example) | новые переменные |
| [privacy/page.tsx](file:///d:/Проекты/NF/newsy-demo/src/app/(public)/privacy/page.tsx) | НОВЫЙ |
| [terms/page.tsx](file:///d:/Проекты/NF/newsy-demo/src/app/(public)/terms/page.tsx) | НОВЫЙ |
| [refund/page.tsx](file:///d:/Проекты/NF/newsy-demo/src/app/(public)/refund/page.tsx) | НОВЫЙ |
