import { PrismaClient, ChallengeStatus } from '@prisma/client';

export interface ChallengeService {
  getChallenge(id: string): Promise<any>;
  createChallenge(data: any): Promise<any>;
  updateChallenge(id: string, data: any): Promise<any>;
}

export function createChallengeService(prisma: PrismaClient): ChallengeService {
  return {
    async getChallenge(id) {
      return prisma.challenge.findUnique({
        where: { id },
        include: {
          steps: { orderBy: { order: 'asc' } },
          organizer: true,
        },
      });
    },

    async createChallenge(data) {
      return prisma.challenge.create({
        data: {
          ...data,
          status: 'DRAFT' as ChallengeStatus,
        },
      });
    },

    async updateChallenge(id, data) {
      const organizer = await prisma.challengeOrganizer.findUnique({
        where: { challengeId_organizerId: { challengeId: id, organizerId: data.organizerId } },
      });
      if (!organizer) {
        throw new Error('Только организатор может редактировать челлендж');
      }
      return prisma.challenge.update({
        where: { id },
        data,
      });
    },
  };
}
