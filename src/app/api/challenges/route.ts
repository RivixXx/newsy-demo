import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { withErrorHandler, withValidation, successResponse } from '@/lib/api-response';
import { commonSchemas } from '@/lib/validation';
import { combineDateAndTime, isNewEntity, isActivePeriod, formatDateRu, formatDateTimeISO } from '@/lib/date-utils';
import { getCached, setCache, cacheKeys, CACHE_TTL } from '@/lib/cache';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

function mapChallenge(c: {
  id: string;
  title: string;
  organizer: { name: string } | null;
  category: string | null;
  media: { url: string }[];
  steps: { rewardPoints: number }[];
  _count: { participations: number };
  isCooperative: boolean;
  address: string | null;
  region: string | null;
  endDate: Date | null;
  startDate: Date | null;
  startTime: string | null;
  description: string | null;
  entryFee: number;
  maxParticipants: number | null;
  createdAt: Date;
}) {
  const now = Date.now();
  const isNew = isNewEntity(c.createdAt);
  const isActive = isActivePeriod(c.startDate, c.endDate);

  const badges: string[] = [];
  if (isNew) badges.push('new');
  if (isActive) badges.push('active');

  const startMoment = combineDateAndTime(c.startDate, c.startTime);

  return {
    id: c.id,
    title: c.title,
    organizer: c.organizer?.name ?? 'Неизвестный организатор',
    category: c.category ?? 'Другое',
    imageUrl: c.media[0]?.url ?? null,
    participantsCount: c._count.participations,
    isCooperative: c.isCooperative,
    badges,
    isRecommended: false,
    achievement: c.steps[0]?.rewardPoints ? `${c.steps[0].rewardPoints} баллов` : 'Участие',
    location: c.address || 'Онлайн',
    region: c.region ?? null,
    endDate: formatDateRu(c.endDate),
    startDate: formatDateTimeISO(startMoment),
    startTime: c.startTime ?? null,
    description: c.description ?? '',
    entryFee: c.entryFee,
    maxParticipants: c.maxParticipants,
    isDemo: false,
  };
}

function createCacheKey(query: z.infer<typeof commonSchemas.challengeQuery> & { page: number; limit: number }): string {
  const { page, limit, category, format, status, region, search, sort } = query;
  const filters = `${category || ''}|${format || ''}|${status || ''}|${region || ''}|${search || ''}|${sort || 'newest'}`;
  return cacheKeys.challengesList(page, limit, filters);
}

async function handleGet(request: NextRequest, query: z.infer<typeof commonSchemas.challengeQuery>) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const { category, format, status, region, search, sort } = query;
  
  const cacheKey = createCacheKey({ ...query, page, limit });
  
  const cached = await getCached<{
    data: ReturnType<typeof mapChallenge>[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(cacheKey);
  
  if (cached) {
    return successResponse(cached);
  }

  const where: Record<string, unknown> = {
    deletedAt: null,
    status: status ?? 'PUBLISHED',
  };

  if (category) where.category = category;
  if (format) where.format = format;
  if (region) where.region = region;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const orderBy: Record<string, unknown> = {};
  switch (sort) {
    case 'oldest':
      orderBy.createdAt = 'asc';
      break;
    case 'popular':
      orderBy._count = { participations: 'desc' };
      break;
    case 'ending-soon':
      orderBy.endDate = 'asc';
      break;
    case 'newest':
    default:
      orderBy.createdAt = 'desc';
      break;
  }

  const [challenges, total] = await prisma.$transaction([
    prisma.challenge.findMany({
      where,
      include: {
        organizer: { select: { name: true } },
        media: { orderBy: { sortOrder: 'asc' }, take: 1 },
        steps: { select: { rewardPoints: true } },
        _count: {
          select: {
            participations: {
              where: { status: { in: ['JOINED', 'IN_PROGRESS', 'COMPLETED'] } },
            },
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.challenge.count({ where }),
  ]);

  const result = challenges.map(mapChallenge);

  const response = {
    data: result,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  await setCache(cacheKey, response, CACHE_TTL.medium);

  return successResponse(response);
}

export const GET = withErrorHandler(
  withValidation(commonSchemas.challengeQuery, handleGet)
);