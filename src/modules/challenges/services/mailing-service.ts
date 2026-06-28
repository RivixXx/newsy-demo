import { PrismaClient, NotificationType } from '@prisma/client';

export interface MailingService {
  sendToChallengeParticipants(
    challengeId: string,
    title: string,
    body: string
  ): Promise<{ sentCount: number }>;
  sendToUser(userId: string, title: string, body: string): Promise<void>;
  getUserNotifications(userId: string): Promise<any[]>;
}

export function createMailingService(prisma: PrismaClient): MailingService {
  return {
    async sendToChallengeParticipants(challengeId, title, body) {
      const participants = await prisma.userProgress.findMany({
        where: { challengeId },
        select: { userId: true },
        distinct: ['userId'],
      });

      if (participants.length === 0) {
        return { sentCount: 0 };
      }

      const notifications = participants.map(p => ({
        userId: p.userId,
        type: 'CHALLENGE_UPDATED' as NotificationType,
        title,
        body,
      }));

      await prisma.notification.createMany({ data: notifications });

      return { sentCount: notifications.length };
    },

    async sendToUser(userId, title, body) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'SYSTEM' as NotificationType,
          title,
          body,
        },
      });
    },

    async getUserNotifications(userId) {
      return prisma.notification.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    },
  };
}
