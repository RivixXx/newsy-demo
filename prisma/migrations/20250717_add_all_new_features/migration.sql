-- CreateEnum (safely — skip if already exists)
DO $$ BEGIN
  CREATE TYPE "ChallengeFormat" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ChallengeType" AS ENUM ('OPEN', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CancellationPolicy" AS ENUM ('FULL_REFUND_24H', 'FULL_REFUND_7D', 'NO_REFUND');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "OrganizerMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "OrganizerMemberStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'REMOVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "UserProgressStatus" AS ENUM ('JOINED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'WITHDRAWN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "StepProgressStatus" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AccountType" AS ENUM ('INDIVIDUAL', 'IP', 'OOO', 'AO', 'SELF_EMPLOYED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "SubscriptionInterval" AS ENUM ('MONTHLY', 'YEARLY');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReferralEventType" AS ENUM ('REGISTRATION', 'FIRST_CHALLENGE', 'PAYMENT', 'ORGANIZER_REFERRAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable: User (safe column adds)
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "referralCode" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "gender" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "birthDate" TIMESTAMP(3);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "bio" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "accountType" "AccountType" NOT NULL DEFAULT 'INDIVIDUAL';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "companyName" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "inn" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "companySize" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "employeeCount" INTEGER;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "companyAddress" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "User" ADD COLUMN "platformName" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- AlterTable: Organizer
DO $$ BEGIN
  ALTER TABLE "Organizer" ADD COLUMN "inn" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Organizer" ADD COLUMN "kpp" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Organizer" ADD COLUMN "ogrn" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Organizer" ADD COLUMN "legalAddress" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Organizer" ADD COLUMN "contactEmail" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Organizer" ADD COLUMN "contactPhone" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Organizer" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Organizer" ADD COLUMN "verifiedAt" TIMESTAMP(3);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX "Organizer_inn_key" ON "Organizer"("inn");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- AlterTable: Challenge
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "format" "ChallengeFormat" NOT NULL DEFAULT 'ONLINE';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "challengeType" "ChallengeType" NOT NULL DEFAULT 'OPEN';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "country" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "region" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "city" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "address" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "latitude" DOUBLE PRECISION;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "longitude" DOUBLE PRECISION;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "startTime" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "endTime" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "requirements" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "minAge" INTEGER;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "maxAge" INTEGER;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "gender" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "cancellationPolicy" "CancellationPolicy" NOT NULL DEFAULT 'FULL_REFUND_24H';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "maxParticipants" INTEGER;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "rejectionReason" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "brandLogoUrl" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "brandPrimaryColor" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "brandSecondaryColor" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "brandBannerUrl" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "sponsorName" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Challenge" ADD COLUMN "sponsorUrl" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- AlterTable: Step
DO $$ BEGIN
  ALTER TABLE "Step" ADD COLUMN "criteria" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Step" ADD COLUMN "variant" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Step" ADD COLUMN "parentStepId" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX "Step_parentStepId_idx" ON "Step"("parentStepId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- AlterTable: StepProgress
DO $$ BEGIN
  ALTER TABLE "StepProgress" ADD COLUMN "reviewedAt" TIMESTAMP(3);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "StepProgress" ADD COLUMN "reviewNote" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- AlterTable: Achievement
DO $$ BEGIN
  ALTER TABLE "Achievement" ADD COLUMN "icon" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Achievement" ADD COLUMN "category" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Achievement" ADD COLUMN "isCustom" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Achievement" ADD COLUMN "isApproved" BOOLEAN NOT NULL DEFAULT true;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- AlterTable: PaymentTransaction
DO $$ BEGIN
  ALTER TABLE "PaymentTransaction" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'PUBLISH_CHALLENGE';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- CreateTable: Team
CREATE TABLE IF NOT EXISTS "Team" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "captainId" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "maxMembers" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE UNIQUE INDEX "Team_inviteCode_key" ON "Team"("inviteCode");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "Team_challengeId_idx" ON "Team"("challengeId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "Team_inviteCode_idx" ON "Team"("inviteCode");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Team" ADD CONSTRAINT "Team_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Team" ADD CONSTRAINT "Team_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: TeamMember
CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: Prize
CREATE TABLE IF NOT EXISTS "Prize" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "cost" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 100,
    "sponsorId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Prize_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE INDEX "Prize_isActive_idx" ON "Prize"("isActive");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- CreateTable: PrizeRedemption
CREATE TABLE IF NOT EXISTS "PrizeRedemption" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prizeId" TEXT NOT NULL,
    "pointsSpent" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    CONSTRAINT "PrizeRedemption_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE UNIQUE INDEX "PrizeRedemption_userId_prizeId_key" ON "PrizeRedemption"("userId", "prizeId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "PrizeRedemption_userId_idx" ON "PrizeRedemption"("userId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "PrizeRedemption_prizeId_idx" ON "PrizeRedemption"("prizeId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "PrizeRedemption" ADD CONSTRAINT "PrizeRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "PrizeRedemption" ADD CONSTRAINT "PrizeRedemption_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "Prize"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: ChatMessage
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE INDEX "ChatMessage_challengeId_idx" ON "ChatMessage"("challengeId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "ChatMessage_userId_idx" ON "ChatMessage"("userId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: ChallengeOrganizer
CREATE TABLE IF NOT EXISTS "ChallengeOrganizer" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "sharePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChallengeOrganizer_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE UNIQUE INDEX "ChallengeOrganizer_challengeId_organizerId_key" ON "ChallengeOrganizer"("challengeId", "organizerId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "ChallengeOrganizer_challengeId_idx" ON "ChallengeOrganizer"("challengeId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "ChallengeOrganizer_organizerId_idx" ON "ChallengeOrganizer"("organizerId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ChallengeOrganizer" ADD CONSTRAINT "ChallengeOrganizer_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ChallengeOrganizer" ADD CONSTRAINT "ChallengeOrganizer_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: ChallengeReward
CREATE TABLE IF NOT EXISTS "ChallengeReward" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "achievementId" TEXT,
    "rewardName" TEXT,
    "rewardDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChallengeReward_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE INDEX "ChallengeReward_challengeId_idx" ON "ChallengeReward"("challengeId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "ChallengeReward_achievementId_idx" ON "ChallengeReward"("achievementId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ChallengeReward" ADD CONSTRAINT "ChallengeReward_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ChallengeReward" ADD CONSTRAINT "ChallengeReward_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: PromoCode
CREATE TABLE IF NOT EXISTS "PromoCode" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountPercent" INTEGER,
    "discountAmount" DOUBLE PRECISION,
    "maxUses" INTEGER NOT NULL DEFAULT 100,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "PromoCode_challengeId_idx" ON "PromoCode"("challengeId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "PromoCode_code_idx" ON "PromoCode"("code");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: UserPromoCode
CREATE TABLE IF NOT EXISTS "UserPromoCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    CONSTRAINT "UserPromoCode_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE UNIQUE INDEX "UserPromoCode_userId_promoCodeId_key" ON "UserPromoCode"("userId", "promoCodeId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "UserPromoCode_userId_idx" ON "UserPromoCode"("userId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "UserPromoCode_promoCodeId_idx" ON "UserPromoCode"("promoCodeId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "UserPromoCode" ADD CONSTRAINT "UserPromoCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "UserPromoCode" ADD CONSTRAINT "UserPromoCode_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: SubscriptionPlan
CREATE TABLE IF NOT EXISTS "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "interval" "SubscriptionInterval" NOT NULL DEFAULT 'MONTHLY',
    "features" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE UNIQUE INDEX "SubscriptionPlan_key_key" ON "SubscriptionPlan"("key");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "SubscriptionPlan_key_idx" ON "SubscriptionPlan"("key");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan"("isActive");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- CreateTable: UserSubscription
CREATE TABLE IF NOT EXISTS "UserSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "providerId" TEXT,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE UNIQUE INDEX "UserSubscription_providerId_key" ON "UserSubscription"("providerId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "UserSubscription_userId_idx" ON "UserSubscription"("userId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "UserSubscription_planId_idx" ON "UserSubscription"("planId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "UserSubscription_status_idx" ON "UserSubscription"("status");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "UserSubscription_providerId_idx" ON "UserSubscription"("providerId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: CommissionConfig
CREATE TABLE IF NOT EXISTS "CommissionConfig" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "platformShare" DOUBLE PRECISION NOT NULL,
    "organizerShare" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommissionConfig_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE UNIQUE INDEX "CommissionConfig_challengeId_key" ON "CommissionConfig"("challengeId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "CommissionConfig_challengeId_idx" ON "CommissionConfig"("challengeId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "CommissionConfig" ADD CONSTRAINT "CommissionConfig_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: CommissionPayout
CREATE TABLE IF NOT EXISTS "CommissionPayout" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CommissionPayout_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE INDEX "CommissionPayout_organizerId_idx" ON "CommissionPayout"("organizerId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "CommissionPayout_status_idx" ON "CommissionPayout"("status");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "CommissionPayout_periodStart_idx" ON "CommissionPayout"("periodStart");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "CommissionPayout" ADD CONSTRAINT "CommissionPayout_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: EmailVerificationToken
CREATE TABLE IF NOT EXISTS "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "EmailVerificationToken_token_idx" ON "EmailVerificationToken"("token");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: PasswordResetToken
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: ReferralEvent
CREATE TABLE IF NOT EXISTS "ReferralEvent" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "eventType" "ReferralEventType" NOT NULL,
    "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReferralEvent_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE UNIQUE INDEX "ReferralEvent_referrerId_referredId_eventType_key" ON "ReferralEvent"("referrerId", "referredId", "eventType");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "ReferralEvent_referrerId_idx" ON "ReferralEvent"("referrerId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "ReferralEvent_referredId_idx" ON "ReferralEvent"("referredId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "ReferralEvent_eventType_idx" ON "ReferralEvent"("eventType");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ReferralEvent" ADD CONSTRAINT "ReferralEvent_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ReferralEvent" ADD CONSTRAINT "ReferralEvent_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: Report
CREATE TABLE IF NOT EXISTS "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "challengeId" TEXT,
    "userId" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "Report_challengeId_idx" ON "Report"("challengeId");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  CREATE INDEX "Report_status_idx" ON "Report"("status");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
