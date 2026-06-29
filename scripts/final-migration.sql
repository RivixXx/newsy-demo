-- Supabase SQL Editor — выполнить по одной строке

-- Чат
CREATE TABLE IF NOT EXISTS "ChatMessage" ("id" TEXT NOT NULL, "challengeId" TEXT NOT NULL, "userId" TEXT NOT NULL, "text" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id"));

CREATE INDEX IF NOT EXISTS "ChatMessage_challengeId_idx" ON "ChatMessage"("challengeId");
CREATE INDEX IF NOT EXISTS "ChatMessage_userId_idx" ON "ChatMessage"("userId");

DO $$ BEGIN
  ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Challenge колонки
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "entryFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "isCooperative" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
