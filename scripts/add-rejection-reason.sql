-- Добавить поле причины отказа к Challenge
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
