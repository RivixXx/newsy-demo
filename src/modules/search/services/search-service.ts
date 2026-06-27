import { Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';

import type { SearchFilters, SearchResultPage, SearchState } from '../types';

export interface SearchService {
  getSearchSession(sessionKey: string): Promise<SearchState | null>;
  saveSearchSession(state: SearchState): Promise<void>;
  searchChallenges(filters?: SearchFilters): Promise<SearchResultPage>;
}

export function createSearchService(prisma: PrismaClient): SearchService {
  function buildWhere(filters?: SearchFilters, query?: string): Prisma.ChallengeWhereInput {
    const conditions: Prisma.ChallengeWhereInput[] = [{ deletedAt: null }];

    if (query?.trim()) {
      conditions.push({
        OR: [
          { title: { contains: query.trim() } },
          { description: { contains: query.trim() } }
        ]
      });
    }

    if (filters?.category?.trim()) {
      conditions.push({ category: filters.category.trim() });
    }

    if (filters?.status) {
      conditions.push({ status: filters.status });
    }

    if (filters?.organizerId) {
      conditions.push({ organizerId: filters.organizerId });
    }

    return conditions.length === 1 ? conditions[0] : { AND: conditions };
  }

  return {
    async getSearchSession(sessionKey: string) {
      const session = await prisma.searchSession.findUnique({
        where: { sessionKey }
      });

      if (!session) {
        return null;
      }

      return {
        sessionKey: session.sessionKey,
        query: session.query,
        filters: session.filters as SearchState['filters'],
        sort: session.sort,
      };
    },

    async saveSearchSession(state: SearchState) {
      await prisma.searchSession.upsert({
        where: { sessionKey: state.sessionKey },
        create: {
          sessionKey: state.sessionKey,
          query: state.query ?? null,
          filters: state.filters as Prisma.InputJsonValue,
          sort: state.sort ?? null,
        },
        update: {
          query: state.query ?? null,
          filters: state.filters as Prisma.InputJsonValue,
          sort: state.sort ?? null,
        }
      });
    },

    async searchChallenges(filters) {
      const items = await prisma.challenge.findMany({
        where: buildWhere(filters),
        orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
        take: 40,
        include: {
          organizer: true,
          media: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
          steps: {
            select: { rewardPoints: true }
          }
        }
      });

      return {
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          organizer: item.organizer.name,
          category: item.category || 'Other',
          pointsReward: item.steps.reduce((acc, s) => acc + s.rewardPoints, 0),
          imageUrl: item.media[0]?.url ?? null,
          status: item.status
        })),
        total: items.length,
        page: 1,
        pageSize: 40
      };
    }
  };
}
