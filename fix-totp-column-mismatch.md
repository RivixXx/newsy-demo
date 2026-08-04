# Этап: Fix — TOTP column mismatch (Prisma camelCase vs PostgreSQL snake_case)

## Проблема

При входе на `https://chillenge-russia.ru/login` падала ошибка:

```
Invalid `prisma.user.findUnique()` invocation:
The column `User.totpEnabled` does not exist in the current database.
```

Ошибка возникала в двух местах:
- **Логин** — `auth-service.impl.ts:40` — `findUnique` с `select: { totpEnabled: true }`
- **Seed** — INSERT попытался вставить поля, которые Prisma сгенерировал в camelCase

### Корневая причина

1. В `schema.prisma` поле названо `totpEnabled` (camelCase)
2. В БД (Supabase) колонка создана как `totp_enabled` (snake_case)
3. Prisma **не автоматически** мапил camelCase → snake_case для этого поля
4. SQL-патч `patches/add-totp-columns.sql` уже был выполнен (колонки `totp_*` существовали), но Prisma Client генерировал SQL с camelCase

### Дополнительно выявленные проблемы

Без-select `findUnique`/`findFirst` вызывали чтение **всех** полей модели, включая `totpEnabled`:
- `referral-service.ts` — 5 вызовов (строки 22, 55, 58, 90, 93)
- `add-member/route.ts` — 1 вызов (строка 25)
- `verify-email/route.ts` — 1 вызов (строка 43)

## Решение

### 1. Явный маппинг полей totp (schema.prisma, строки 145-149)

```prisma
lastLoginAt       DateTime?
totpEnabled       Boolean       @default(false) @map("totp_enabled")
totpSecret        String?       @map("totp_secret")
totpBackupCodes   String?       @map("totp_backup_codes")
totpVerifiedAt    DateTime?     @map("totp_verified_at")
```

Добавлены `@map("snake_case")` для всех totp-полей — теперь Prisma генерирует SQL с правильным именем колонки.

### 2. Явные select во всех findUnique / findFirst

Заменены все вызовы без `select` на явный список нужных полей:

| Файл | Изменения |
|------|-----------|
| `referral-service.ts:22` | `findFirst` → `select: { id: true, referralCode: true }` |
| `referral-service.ts:55` | `findUnique` → `select: { referredBy: true }` |
| `referral-service.ts:58` | `findFirst` → `select: { id: true, referralCode: true }` |
| `referral-service.ts:90` | `findUnique` → `select: { referredBy: true }` |
| `referral-service.ts:93` | `findFirst` → `select: { id: true, referralCode: true }` |
| `add-member/route.ts:25` | `findUnique` → `select: { id: true, firstName: true, lastName: true }` |
| `verify-email/route.ts:43` | `findUnique` → `select: { id: true, referredBy: true }` |

### 3. Перегенерация Prisma Client

Выполнено `npx prisma generate` после изменения схемы.

## Итог

- ✅ Логин на `chillenge-russia.ru/login` работает
- ✅ Seed выполнился без ошибок
- ✅ Все запросы к БД используют явные `select` — предсказуемое поведение и производительность
- ✅ Компиляция: только 1 некриничная ошибка в e2e-тестах (не связана с этим фиксом)
