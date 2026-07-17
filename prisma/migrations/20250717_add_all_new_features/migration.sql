-- CreateEnum
CREATE TYPE "ChallengeFormat" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "CancellationPolicy" AS ENUM ('FULL_REFUND_24H', 'FULL_REFUND_7D', 'NO_REFUND');

-- CreateEnum
CREATE TYPE "OrganizerMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "OrganizerMemberStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'REMOVED');

-- CreateEnum
CREATE TYPE "UserProgressStatus" AS ENUM ('JOINED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "StepProgressStatus" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('INDIVIDUAL', 'IP', 'OOO', 'AO', 'SELF_EMPLOYED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING');

-- CreateEnum
CREATE TYPE "SubscriptionInterval" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "ReferralEventType" AS ENUM ('REGISTRATION', 'FIRST_CHALLENGE', 'PAYMENT', 'ORGANIZER_REFERRAL');

-- AlterTable: User
ALTER TABLE "User" ADD COLUMN "referralCode" TEXT,
ADD COLUMN "gender" TEXT,
ADD COLUMN "birthDate" TIMESTAMP(3),
ADD COLUMN "bio" TEXT,
ADD COLUMN "avatarUrl" TEXT,
ADD COLUMN "accountType" "AccountType" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN "companyName" TEXT,
ADD COLUMN "inn" TEXT,
ADD COLUMN "companySize" TEXT,
ADD COLUMN "employeeCount" INTEGER,
ADD COLUMN "companyAddress" TEXT,
ADD COLUMN "platformName" TEXT;

-- CreateIndex: User.referralCode
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- AlterTable: Organizer
ALTER TABLE "Organizer" ADD COLUMN "inn" TEXT,
ADD COLUMN "kpp" TEXT,
ADD COLUMN "ogrn" TEXT,
ADD COLUMN "legalAddress" TEXT,
ADD COLUMN "contactEmail" TEXT,
ADD COLUMN "contactPhone" TEXT,
ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "verifiedAt" TIMESTAMP(3);

-- CreateIndex: Organizer.inn
CREATE UNIQUE INDEX "Organizer_inn_key" ON "Organizer"("inn");

-- AlterTable: Challenge
ALTER TABLE "Challenge" ADD COLUMN "format" "ChallengeFormat" NOT NULL DEFAULT 'ONLINE',
ADD COLUMN "challengeType" "ChallengeType" NOT NULL DEFAULT 'OPEN',
ADD COLUMN "country" TEXT,
ADD COLUMN "region" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "address" TEXT,
ADD COLUMN "latitude" DOUBLE PRECISION,
ADD COLUMN "longitude" DOUBLE PRECISION,
ADD COLUMN "startTime" TEXT,
ADD COLUMN "endTime" TEXT,
ADD COLUMN "requirements" TEXT,
ADD COLUMN "minAge" INTEGER,
ADD COLUMN "maxAge" INTEGER,
ADD COLUMN "gender" TEXT,
ADD COLUMN "cancellationPolicy" "CancellationPolicy" NOT NULL DEFAULT 'FULL_REFUND_24H',
ADD COLUMN "maxParticipants" INTEGER,
ADD COLUMN "rejectionReason" TEXT,
ADD COLUMN "brandLogoUrl" TEXT,
ADD COLUMN "brandPrimaryColor" TEXT,
ADD COLUMN "brandSecondaryColor" TEXT,
ADD COLUMN "brandBannerUrl" TEXT,
ADD COLUMN "sponsorName" TEXT,
ADD COLUMN "sponsorUrl" TEXT;

-- AlterTable: Step
ALTER TABLE "Step" ADD COLUMN "criteria" TEXT,
ADD COLUMN "variant" TEXT,
ADD COLUMN "parentStepId" TEXT;

-- CreateIndex: Step.parentStepId
CREATE INDEX "Step_parentStepId_idx" ON "Step"("parentStepId");

-- AlterTable: StepProgress
ALTER TABLE "StepProgress" ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "reviewNote" TEXT;

-- AlterTable: Achievement
ALTER TABLE "Achievement" ADD COLUMN "icon" TEXT,
ADD COLUMN "category" TEXT,
ADD COLUMN "isCustom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isApproved" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: PaymentTransaction
ALTER TABLE "PaymentTransaction" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'PUBLISH_CHALLENGE';

-- CreateTable: Team
CREATE TABLE "Team" (
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

-- CreateIndex: Team
CREATE UNIQUE INDEX "Team_inviteCode_key" ON "Team"("inviteCode");
CREATE INDEX "Team_challengeId_idx" ON "Team"("challengeId");
CREATE INDEX "Team_inviteCode_idx" ON "Team"("inviteCode");

-- AddForeignKey: Team
ALTER TABLE "Team" ADD CONSTRAINT "Team_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: TeamMember
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: TeamMember
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");
CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");

-- AddForeignKey: TeamMember
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Prize
CREATE TABLE "Prize" (
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

-- CreateIndex: Prize
CREATE INDEX "Prize_isActive_idx" ON "Prize"("isActive");

-- CreateTable: PrizeRedemption
CREATE TABLE "PrizeRedemption" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prizeId" TEXT NOT NULL,
    "pointsSpent" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "PrizeRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: PrizeRedemption
CREATE UNIQUE INDEX "PrizeRedemption_userId_prizeId_key" ON "PrizeRedemption"("userId", "prizeId");
CREATE INDEX "PrizeRedemption_userId_idx" ON "PrizeRedemption"("userId");
CREATE INDEX "PrizeRedemption_prizeId_idx" ON "PrizeRedemption"("prizeId");

-- AddForeignKey: PrizeRedemption
ALTER TABLE "PrizeRedemption" ADD CONSTRAINT "PrizeRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PrizeRedemption" ADD CONSTRAINT "PrizeRedemption_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "Prize"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: ChatMessage
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: ChatMessage
CREATE INDEX "ChatMessage_challengeId_idx" ON "ChatMessage"("challengeId");
CREATE INDEX "ChatMessage_userId_idx" ON "ChatMessage"("userId");
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- AddForeignKey: ChatMessage
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: ChallengeOrganizer
CREATE TABLE "ChallengeOrganizer" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "sharePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeOrganizer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: ChallengeOrganizer
CREATE UNIQUE INDEX "ChallengeOrganizer_challengeId_organizerId_key" ON "ChallengeOrganizer"("challengeId", "organizerId");
CREATE INDEX "ChallengeOrganizer_challengeId_idx" ON "ChallengeOrganizer"("challengeId");
CREATE INDEX "ChallengeOrganizer_organizerId_idx" ON "ChallengeOrganizer"("organizerId");

-- AddForeignKey: ChallengeOrganizer
ALTER TABLE "ChallengeOrganizer" ADD CONSTRAINT "ChallengeOrganizer_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChallengeOrganizer" ADD CONSTRAINT "ChallengeOrganizer_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: ChallengeReward
CREATE TABLE "ChallengeReward" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "achievementId" TEXT,
    "rewardName" TEXT,
    "rewardDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: ChallengeReward
CREATE INDEX "ChallengeReward_challengeId_idx" ON "ChallengeReward"("challengeId");
CREATE INDEX "ChallengeReward_achievementId_idx" ON "ChallengeReward"("achievementId");

-- AddForeignKey: ChallengeReward
ALTER TABLE "ChallengeReward" ADD CONSTRAINT "ChallengeReward_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChallengeReward" ADD CONSTRAINT "ChallengeReward_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: PromoCode
CREATE TABLE "PromoCode" (
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

-- CreateIndex: PromoCode
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");
CREATE INDEX "PromoCode_challengeId_idx" ON "PromoCode"("challengeId");
CREATE INDEX "PromoCode_code_idx" ON "PromoCode"("code");

-- AddForeignKey: PromoCode
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: UserPromoCode
CREATE TABLE "UserPromoCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "UserPromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: UserPromoCode
CREATE UNIQUE INDEX "UserPromoCode_userId_promoCodeId_key" ON "UserPromoCode"("userId", "promoCodeId");
CREATE INDEX "UserPromoCode_userId_idx" ON "UserPromoCode"("userId");
CREATE INDEX "UserPromoCode_promoCodeId_idx" ON "UserPromoCode"("promoCodeId");

-- AddForeignKey: UserPromoCode
ALTER TABLE "UserPromoCode" ADD CONSTRAINT "UserPromoCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserPromoCode" ADD CONSTRAINT "UserPromoCode_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: SubscriptionPlan
CREATE TABLE "SubscriptionPlan" (
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

-- CreateIndex: SubscriptionPlan
CREATE UNIQUE INDEX "SubscriptionPlan_key_key" ON "SubscriptionPlan"("key");
CREATE INDEX "SubscriptionPlan_key_idx" ON "SubscriptionPlan"("key");
CREATE INDEX "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan"("isActive");

-- CreateTable: UserSubscription
CREATE TABLE "UserSubscription" (
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

-- CreateIndex: UserSubscription
CREATE UNIQUE INDEX "UserSubscription_providerId_key" ON "UserSubscription"("providerId");
CREATE INDEX "UserSubscription_userId_idx" ON "UserSubscription"("userId");
CREATE INDEX "UserSubscription_planId_idx" ON "UserSubscription"("planId");
CREATE INDEX "UserSubscription_status_idx" ON "UserSubscription"("status");
CREATE INDEX "UserSubscription_providerId_idx" ON "UserSubscription"("providerId");

-- AddForeignKey: UserSubscription
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: CommissionConfig
CREATE TABLE "CommissionConfig" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "platformShare" DOUBLE PRECISION NOT NULL,
    "organizerShare" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: CommissionConfig
CREATE UNIQUE INDEX "CommissionConfig_challengeId_key" ON "CommissionConfig"("challengeId");
CREATE INDEX "CommissionConfig_challengeId_idx" ON "CommissionConfig"("challengeId");

-- AddForeignKey: CommissionConfig
ALTER TABLE "CommissionConfig" ADD CONSTRAINT "CommissionConfig_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: CommissionPayout
CREATE TABLE "CommissionPayout" (
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

-- CreateIndex: CommissionPayout
CREATE INDEX "CommissionPayout_organizerId_idx" ON "CommissionPayout"("organizerId");
CREATE INDEX "CommissionPayout_status_idx" ON "CommissionPayout"("status");
CREATE INDEX "CommissionPayout_periodStart_idx" ON "CommissionPayout"("periodStart");

-- AddForeignKey: CommissionPayout
ALTER TABLE "CommissionPayout" ADD CONSTRAINT "CommissionPayout_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: EmailVerificationToken
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

-- CreateIndex: EmailVerificationToken
CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");
CREATE INDEX "EmailVerificationToken_token_idx" ON "EmailVerificationToken"("token");
CREATE INDEX "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");

-- AddForeignKey: EmailVerificationToken
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: PasswordResetToken
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: PasswordResetToken
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- AddForeignKey: PasswordResetToken
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: ReferralEvent
CREATE TABLE "ReferralEvent" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "eventType" "ReferralEventType" NOT NULL,
    "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: ReferralEvent
CREATE UNIQUE INDEX "ReferralEvent_referrerId_referredId_eventType_key" ON "ReferralEvent"("referrerId", "referredId", "eventType");
CREATE INDEX "ReferralEvent_referrerId_idx" ON "ReferralEvent"("referrerId");
CREATE INDEX "ReferralEvent_referredId_idx" ON "ReferralEvent"("referredId");
CREATE INDEX "ReferralEvent_eventType_idx" ON "ReferralEvent"("eventType");

-- AddForeignKey: ReferralEvent
ALTER TABLE "ReferralEvent" ADD CONSTRAINT "ReferralEvent_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReferralEvent" ADD CONSTRAINT "ReferralEvent_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Report
CREATE TABLE "Report" (
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

-- CreateIndex: Report
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");
CREATE INDEX "Report_challengeId_idx" ON "Report"("challengeId");
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- AddForeignKey: Report
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
