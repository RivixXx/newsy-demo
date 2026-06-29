-- Выполнить в Supabase → SQL Editor
-- Добавляет недостающие колонки к Challenge

ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "entryFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "isCooperative" BOOLEAN NOT NULL DEFAULT false;
