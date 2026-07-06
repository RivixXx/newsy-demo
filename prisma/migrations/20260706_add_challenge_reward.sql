-- =============================================================
-- Миграция: add-challenge-reward
-- Дата: 2026-07-06
-- Описание: ChallengeReward — отдельные поля «Достижение» и «Награда»
-- =============================================================

CREATE TABLE "ChallengeReward" (
  "id" TEXT NOT NULL,
  "challengeId" TEXT NOT NULL,
  "achievementId" TEXT,
  "rewardName" TEXT,
  "rewardDescription" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ChallengeReward_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ChallengeReward_challengeId_idx" ON "ChallengeReward"("challengeId");
CREATE INDEX "ChallengeReward_achievementId_idx" ON "ChallengeReward"("achievementId");

ALTER TABLE "ChallengeReward"
  ADD CONSTRAINT "ChallengeReward_challengeId_fkey"
  FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChallengeReward"
  ADD CONSTRAINT "ChallengeReward_achievementId_fkey"
  FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
