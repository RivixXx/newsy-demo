-- =============================================================
-- Миграция: add-coorganizers
-- Дата: 2026-07-06
-- Описание: ChallengeOrganizer — несколько организаторов на ЧИ
-- =============================================================

CREATE TABLE "ChallengeOrganizer" (
  "id" TEXT NOT NULL,
  "challengeId" TEXT NOT NULL,
  "organizerId" TEXT NOT NULL,
  "sharePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ChallengeOrganizer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChallengeOrganizer_challengeId_organizerId_key"
  ON "ChallengeOrganizer"("challengeId", "organizerId");

CREATE INDEX "ChallengeOrganizer_challengeId_idx" ON "ChallengeOrganizer"("challengeId");
CREATE INDEX "ChallengeOrganizer_organizerId_idx" ON "ChallengeOrganizer"("organizerId");

ALTER TABLE "ChallengeOrganizer"
  ADD CONSTRAINT "ChallengeOrganizer_challengeId_fkey"
  FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChallengeOrganizer"
  ADD CONSTRAINT "ChallengeOrganizer_organizerId_fkey"
  FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
