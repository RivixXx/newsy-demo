import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { buildAccessContext } from '@/modules/access-control/services/access-context';
import { isAdmin } from '@/modules/access-control/services/permission-service';

export async function GET() {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    // Используем RBAC-систему вместо string-сравнения roles
    const accessCtx = await buildAccessContext(prisma, session.user.id);
    if (!isAdmin(accessCtx.permissionSet)) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const challenges = await prisma.challenge.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: {
        organizer: { select: { name: true } },
        media: { orderBy: { sortOrder: 'asc' }, take: 1 },
        steps: { select: { title: true, type: true, rewardPoints: true }, orderBy: { order: 'asc' } },
        _count: { select: { participations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ challenges });
  } catch (error: unknown) {
    console.error('[admin/challenges/pending] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : message },
      { status: 500 }
    );
  }
}
