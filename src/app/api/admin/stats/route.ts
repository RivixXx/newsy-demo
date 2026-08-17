import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { withErrorHandler, successResponse, errorResponse } from '@/lib/api-response';
import { createAdminService } from '@/modules/admin/services/admin-service';
import { buildAccessContext } from '@/modules/access-control/services/access-context';
import { isAdmin } from '@/modules/access-control/services/permission-service';

async function handleGet() {
  const session = await getCurrentAuthSession();
  if (!session?.user?.id) {
    return errorResponse('Необходима авторизация', 401);
  }

  const accessCtx = await buildAccessContext(prisma, session.user.id);
  if (!isAdmin(accessCtx.permissionSet)) {
    return errorResponse('Доступ запрещён', 403);
  }

  const adminService = createAdminService(prisma);
  const stats = await adminService.getStats();
  const [recentUsers, recentChallenges, recentPayments] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true, email: true, firstName: true, lastName: true, status: true, createdAt: true,
        organizerMembership: { where: { deletedAt: null }, take: 1, select: { id: true } },
      },
    }),
    prisma.challenge.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, title: true, status: true, createdAt: true, organizer: { select: { name: true } } },
    }),
    prisma.paymentTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, amount: true, status: true, type: true, createdAt: true },
    }),
  ]);

  return successResponse({
    ...stats,
    recentUsers: recentUsers.map(user => ({
      id: user.id,
      email: user.email ?? '—',
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Без имени',
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      isOrganizer: user.organizerMembership.length > 0,
    })),
    recentChallenges: recentChallenges.map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      status: challenge.status,
      organizer: challenge.organizer?.name ?? 'Неизвестный организатор',
      createdAt: challenge.createdAt.toISOString(),
    })),
    recentPayments: recentPayments.map(payment => ({
      ...payment,
      createdAt: payment.createdAt.toISOString(),
    })),
  });
}

export const GET = withErrorHandler(handleGet);
