import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { withErrorHandler, withValidation, successResponse, errorResponse } from '@/lib/api-response';
import { createAdminService } from '@/modules/admin/services/admin-service';
import { buildAccessContext } from '@/modules/access-control/services/access-context';
import { isAdmin } from '@/modules/access-control/services/permission-service';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

async function handleGet(_req: NextRequest, query: z.infer<typeof querySchema>) {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return errorResponse('Необходима авторизация', 401);
  }

  const accessCtx = await buildAccessContext(prisma, session.user.id);
  if (!isAdmin(accessCtx.permissionSet)) {
    return errorResponse('Доступ запрещён', 403);
  }

  const where = { status: 'PENDING_REVIEW' as const, deletedAt: null };
  const [challenges, total] = await Promise.all([
    prisma.challenge.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        format: true,
        challengeType: true,
        address: true,
        city: true,
        startDate: true,
        endDate: true,
        maxParticipants: true,
        entryFee: true,
        requirements: true,
        cancellationPolicy: true,
        status: true,
        createdAt: true,
        organizer: { select: { name: true } },
        media: { select: { url: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
        steps: { select: { title: true, type: true, rewardPoints: true, description: true }, orderBy: { order: 'asc' } },
        _count: { select: { participations: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.challenge.count({ where }),
  ]);
  return successResponse({
    challenges: challenges.map(challenge => ({
      ...challenge,
      startDate: challenge.startDate?.toISOString() ?? null,
      endDate: challenge.endDate?.toISOString() ?? null,
      createdAt: challenge.createdAt.toISOString(),
    })),
    total,
    totalPages: Math.ceil(total / query.limit),
  });
}

export const GET = withErrorHandler(withValidation(querySchema, handleGet));
