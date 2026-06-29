-- AlterTable: Add missing columns to Challenge table
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "entryFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
