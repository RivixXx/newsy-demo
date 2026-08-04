import type { PrismaClient } from '@prisma/client';

const REFERRAL_REWARDS = {
  REGISTRATION: 100,      // +100 баллов за регистрацию приглашённого
  FIRST_CHALLENGE: 200,   // +200 баллов за первое участие
  PAYMENT_PERCENT: 0.10,  // 10% от первого платежа
} as const;

export interface ReferralService {
  trackRegistration(referredUserId: string, referralCode: string): Promise<void>;
  trackFirstChallenge(userId: string): Promise<void>;
  trackPayment(userId: string, amount: number): Promise<void>;
  getReferrals(userId: string): Promise<{ id: string; name: string; joinedAt: Date; event: string }[]>;
  getStats(userId: string): Promise<{ totalReferrals: number; totalReward: number }>;
}

export function createReferralService(prisma: PrismaClient): ReferralService {
  return {
    async trackRegistration(referredUserId, referralCode) {
      if (!referralCode) return;

      const referrer = await prisma.user.findFirst({
        where: { referralCode, deletedAt: null },
        select: { id: true, referralCode: true },
      });
      if (!referrer || referrer.id === referredUserId) return;

      const existing = await prisma.referralEvent.findUnique({
        where: {
          referrerId_referredId_eventType: {
            referrerId: referrer.id,
            referredId: referredUserId,
            eventType: 'REGISTRATION',
          },
        },
      });
      if (existing) return;

      await prisma.referralEvent.create({
        data: {
          referrerId: referrer.id,
          referredId: referredUserId,
          eventType: 'REGISTRATION',
          rewardAmount: REFERRAL_REWARDS.REGISTRATION,
        },
      });

      // Начисляем баллы рефереру
      await prisma.user.update({
        where: { id: referrer.id },
        data: { points: { increment: REFERRAL_REWARDS.REGISTRATION } },
      });
    },

    async trackFirstChallenge(userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { referredBy: true },
      });
      if (!user?.referredBy) return;

      const referrer = await prisma.user.findFirst({
        where: { referralCode: user.referredBy, deletedAt: null },
        select: { id: true, referralCode: true },
      });
      if (!referrer || referrer.id === userId) return;

      const existing = await prisma.referralEvent.findUnique({
        where: {
          referrerId_referredId_eventType: {
            referrerId: referrer.id,
            referredId: userId,
            eventType: 'FIRST_CHALLENGE',
          },
        },
      });
      if (existing) return;

      await prisma.referralEvent.create({
        data: {
          referrerId: referrer.id,
          referredId: userId,
          eventType: 'FIRST_CHALLENGE',
          rewardAmount: REFERRAL_REWARDS.FIRST_CHALLENGE,
        },
      });

      await prisma.user.update({
        where: { id: referrer.id },
        data: { points: { increment: REFERRAL_REWARDS.FIRST_CHALLENGE } },
      });
    },

    async trackPayment(userId, amount) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { referredBy: true },
      });
      if (!user?.referredBy) return;

      const referrer = await prisma.user.findFirst({
        where: { referralCode: user.referredBy, deletedAt: null },
        select: { id: true, referralCode: true },
      });
      if (!referrer || referrer.id === userId) return;

      const existing = await prisma.referralEvent.findUnique({
        where: {
          referrerId_referredId_eventType: {
            referrerId: referrer.id,
            referredId: userId,
            eventType: 'PAYMENT',
          },
        },
      });
      if (existing) return;

      const rewardAmount = Math.round(amount * REFERRAL_REWARDS.PAYMENT_PERCENT);

      await prisma.referralEvent.create({
        data: {
          referrerId: referrer.id,
          referredId: userId,
          eventType: 'PAYMENT',
          rewardAmount,
        },
      });

      await prisma.user.update({
        where: { id: referrer.id },
        data: { points: { increment: rewardAmount } },
      });
    },

    async getReferrals(userId) {
      const events = await prisma.referralEvent.findMany({
        where: { referrerId: userId },
        include: { referred: { select: { id: true, firstName: true, lastName: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' },
      });

      return events.map(e => ({
        id: e.referred.id,
        name: `${e.referred.firstName} ${e.referred.lastName}`,
        joinedAt: e.referred.createdAt,
        event: e.eventType,
      }));
    },

    async getStats(userId) {
      const totalReferrals = await prisma.referralEvent.count({
        where: { referrerId: userId },
      });

      const aggregate = await prisma.referralEvent.aggregate({
        where: { referrerId: userId },
        _sum: { rewardAmount: true },
      });

      return {
        totalReferrals,
        totalReward: aggregate._sum.rewardAmount ?? 0,
      };
    },
  };
}
