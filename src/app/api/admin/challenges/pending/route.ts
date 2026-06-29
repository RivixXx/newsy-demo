import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    if (!session.user.roles?.includes('admin')) {
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
  } catch (error: any) {
    console.error('Pending challenges error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
