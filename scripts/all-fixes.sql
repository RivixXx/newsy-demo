-- Выполнить всё разом в Supabase SQL Editor
-- Все изменения для schema Challenge

-- 1. Взнос за публикацию
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "entryFee" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- 2. Кооперативный формат
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "isCooperative" BOOLEAN NOT NULL DEFAULT false;

-- 3. Причина отказа модератора
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
