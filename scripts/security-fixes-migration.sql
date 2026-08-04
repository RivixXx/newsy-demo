-- ================================================================
-- Миграция: исправления критических багов (FIX #9, #30)
-- Создана: 2026-08-04
-- Цель: RevokedSession (session revocation),
--        PromoCode composite unique (per-challenge)
-- ================================================================

-- 1. RevokedSession — таблица для инвалидации сессий при logout (FIX #9)
CREATE TABLE IF NOT EXISTS "RevokedSession" (
  "id"             SERIAL PRIMARY KEY,
  "sessionTokenHash" TEXT NOT NULL UNIQUE,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "RevokedSession_sessionTokenHash_idx" ON "RevokedSession"("sessionTokenHash");

-- 2. PromoCode: убираем глобальный @unique, заменяем на @@unique([challengeId, code]) (FIX #30)
--    Сначала удаляем старый уникальный индекс, если он существует

-- Удаляем старый глобальный уникальный индекс на code (если был)
DO $$ BEGIN
    ALTER TABLE "PromoCode" DROP CONSTRAINT "PromoCode_code_key";
EXCEPTION WHEN undefined_object THEN
    NULL;
END $$;

-- Удаляем старый уникальный индекс (если Prisma создал отдельное имя)
DO $$ BEGIN
    DROP INDEX IF EXISTS "PromoCode_code_key";
    DROP INDEX IF EXISTS "PromoCode_code_unique";
EXCEPTION WHEN undefined_object THEN
    NULL;
END $$;

-- Добавляем композитный уникальный индекс per-challenge
DO $$ BEGIN
    ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_challengeId_code_unique" UNIQUE ("challengeId", "code");
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Удаляем лишний уникальный индекс на code (если остался)
DO $$ BEGIN
    DROP INDEX IF EXISTS "idx_PromoCode_code";
EXCEPTION WHEN undefined_object THEN
    NULL;
END $$;
