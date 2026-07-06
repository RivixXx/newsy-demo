-- =============================================================
-- Миграция: add-verification-referral
-- Дата: 2026-07-06
-- Описание: EmailVerificationToken, ReferralEvent, referralCode
-- =============================================================

-- 1. Таблица токенов верификации email
CREATE TABLE "EmailVerificationToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");
CREATE INDEX "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");

ALTER TABLE "EmailVerificationToken"
  ADD CONSTRAINT "EmailVerificationToken_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Enum для типов реферальных событий
CREATE TYPE "ReferralEventType" AS ENUM ('REGISTRATION', 'FIRST_CHALLENGE', 'PAYMENT');

-- 3. Таблица реферальных событий
CREATE TABLE "ReferralEvent" (
  "id" TEXT NOT NULL,
  "referrerId" TEXT NOT NULL,
  "referredId" TEXT NOT NULL,
  "eventType" "ReferralEventType" NOT NULL,
  "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ReferralEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReferralEvent_referrerId_referredId_eventType_key"
  ON "ReferralEvent"("referrerId", "referredId", "eventType");

CREATE INDEX "ReferralEvent_referrerId_idx" ON "ReferralEvent"("referrerId");
CREATE INDEX "ReferralEvent_referredId_idx" ON "ReferralEvent"("referredId");

ALTER TABLE "ReferralEvent"
  ADD CONSTRAINT "ReferralEvent_referrerId_fkey"
  FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReferralEvent"
  ADD CONSTRAINT "ReferralEvent_referredId_fkey"
  FOREIGN KEY ("referredId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Добавляем поле referralCode в User (уникальный код приглашения)
ALTER TABLE "User" ADD COLUMN "referralCode" TEXT;

-- Генерируем уникальные коды для существующих пользователей
UPDATE "User" SET "referralCode" = LOWER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
WHERE "referralCode" IS NULL;

-- Делаем уникальным после заполнения
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
