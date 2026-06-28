import { PrismaClient } from '@prisma/client';

export interface CommissionService {
  calculateCommission(challengeId: string, entryFee: number, participantsCount: number): Promise<{
    totalRevenue: number;
    platformShare: number;
    organizerShare: number;
    rate: number;
  }>;
  recordCommission(challengeId: string, totalRevenue: number, platformShare: number, organizerShare: number, rate: number): Promise<void>;
  getOrganizerEarnings(organizerId: string): Promise<{
    totalEarned: number;
    totalPaid: number;
    pending: number;
    recentPayouts: any[];
  }>;
}

const DEFAULT_COMMISSION_RATE = 0.15;

export function createCommissionService(prisma: PrismaClient): CommissionService {
  return {
    async calculateCommission(challengeId, entryFee, participantsCount) {
      const config = await prisma.commissionConfig.findUnique({
        where: { challengeId },
      });

      const rate = config?.rate ?? DEFAULT_COMMISSION_RATE;
      const totalRevenue = entryFee * participantsCount;
      const platformShare = totalRevenue * rate;
      const organizerShare = totalRevenue - platformShare;

      return { totalRevenue, platformShare, organizerShare, rate };
    },

    async recordCommission(challengeId, totalRevenue, platformShare, organizerShare, rate) {
      const existing = await prisma.commissionConfig.findUnique({
        where: { challengeId },
      });

      if (existing) {
        await prisma.commissionConfig.update({
          where: { challengeId },
          data: { rate, platformShare, organizerShare },
        });
      } else {
        await prisma.commissionConfig.create({
          data: { challengeId, rate, platformShare, organizerShare },
        });
      }
    },

    async getOrganizerEarnings(organizerId) {
      const payouts = await prisma.commissionPayout.findMany({
        where: { organizerId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      const totalPaid = payouts
        .filter(p => p.status === 'SUCCEEDED')
        .reduce((sum, p) => sum + p.amount, 0);

      const pending = payouts
        .filter(p => p.status === 'PENDING')
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        totalEarned: totalPaid + pending,
        totalPaid,
        pending,
        recentPayouts: payouts,
      };
    },
  };
}
