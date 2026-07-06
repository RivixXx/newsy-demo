-- =============================================================
-- Миграция: add-org-legal-fields
-- Дата: 2026-07-06
-- Описание: Поля для регистрации ИП/ООО/самозанятых в Organizer
-- =============================================================

ALTER TABLE "Organizer" ADD COLUMN "inn" TEXT;
ALTER TABLE "Organizer" ADD COLUMN "kpp" TEXT;
ALTER TABLE "Organizer" ADD COLUMN "ogrn" TEXT;
ALTER TABLE "Organizer" ADD COLUMN "legalAddress" TEXT;
ALTER TABLE "Organizer" ADD COLUMN "contactEmail" TEXT;
ALTER TABLE "Organizer" ADD COLUMN "contactPhone" TEXT;

CREATE UNIQUE INDEX "Organizer_inn_key" ON "Organizer"("inn") WHERE "inn" IS NOT NULL;
