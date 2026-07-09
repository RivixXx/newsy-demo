-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "CancellationPolicy" AS ENUM ('FULL_REFUND_24H', 'FULL_REFUND_7D', 'NO_REFUND');

-- AlterTable: add new fields to Challenge
ALTER TABLE "Challenge" ADD COLUMN "challengeType" "ChallengeType" NOT NULL DEFAULT 'OPEN';
ALTER TABLE "Challenge" ADD COLUMN "country" TEXT;
ALTER TABLE "Challenge" ADD COLUMN "city" TEXT;
ALTER TABLE "Challenge" ADD COLUMN "startTime" TEXT;
ALTER TABLE "Challenge" ADD COLUMN "endTime" TEXT;
ALTER TABLE "Challenge" ADD COLUMN "requirements" TEXT;
ALTER TABLE "Challenge" ADD COLUMN "minAge" INTEGER;
ALTER TABLE "Challenge" ADD COLUMN "maxAge" INTEGER;
ALTER TABLE "Challenge" ADD COLUMN "gender" TEXT;
ALTER TABLE "Challenge" ADD COLUMN "cancellationPolicy" "CancellationPolicy" NOT NULL DEFAULT 'FULL_REFUND_24H';
