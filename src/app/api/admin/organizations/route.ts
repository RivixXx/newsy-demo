import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { buildAccessContext } from '@/modules/access-control/services';

export async function GET() {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const context = await buildAccessContext(prisma, session.user.id);
    if (!context.roleKeys.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const organizations = await prisma.organizer.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { members: true, challenges: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = organizations.map(o => ({
      id: o.id,
      name: o.name,
      inn: o.inn,
      type: o.type,
      status: o.status,
      memberCount: o._count.members,
      challengeCount: o._count.challenges,
      createdAt: o.createdAt.toISOString(),
    }));

    return NextResponse.json({ organizations: result });
  } catch {
    return NextResponse.json({ organizations: [] });
  }
}
