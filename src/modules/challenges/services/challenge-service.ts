import { PrismaClient, ChallengeStatus, Challenge, ChallengeOrganizer } from '@prisma/client';

export interface CreateChallengeData {
  title: string;
  description?: string;
  organizerId: string;
  status?: ChallengeStatus;
  startDate?: Date;
  endDate?: Date;
  regionId?: string;
  categoryId?: string;
  coverImage?: string;
}

export interface UpdateChallengeData {
  title?: string;
  description?: string;
  status?: ChallengeStatus;
  startDate?: Date;
  endDate?: Date;
  regionId?: string;
  categoryId?: string;
  coverImage?: string;
  organizerId: string;
}

export interface ChallengeService {
  getChallenge(id: string): Promise<Challenge | null>;
  createChallenge(data: CreateChallengeData): Promise<Challenge>;
  updateChallenge(id: string, data: UpdateChallengeData): Promise<Challenge>;
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
