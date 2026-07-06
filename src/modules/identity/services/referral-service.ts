import type { PrismaClient } from '@prisma/client';

export interface ReferralService {
  /**
   * Записывает событие регистрации по реферальному коду.
   * Вызывается при подтверждении email нового пользователя.
   */
  trackRegistration(referredUserId: string, referralCode: string): Promise<void>;

  /**
   * Возвращает список рефералов пользователя.
   */
  getReferrals(userId: string): Promise<{ id: string; name: string; joinedAt: Date; event: string }[]>;

  /**
   * Возвращает количество рефералов и общее вознаграждение.
   */
  getStats(userId: string): Promise<{ totalReferrals: number; totalReward: number }>;
}

export function createReferralService(prisma: PrismaClient): ReferralService {
  return {
    async trackRegistration(referredUserId, referralCode) {
      if (!referralCode) return;

      // Ищем реферера по коду
      const referrer = await prisma.user.findFirst({
        where: { referralCode, deletedAt: null },
      });
      if (!referrer || referrer.id === referredUserId) return;

      // Проверяем, не было ли уже такого события
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

      // Записываем событие
      await prisma.referralEvent.create({
        data: {
          referrerId: referrer.id,
          referredId: referredUserId,
          eventType: 'REGISTRATION',
          rewardAmount: 0, // Базовое вознаграждение — определяется бизнес-логикой
        },
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
