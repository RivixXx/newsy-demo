import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const member = await prisma.organizerMember.findFirst({
      where: { userId: session.user.id },
      select: { organizerId: true },
    });

    if (!member) {
      return NextResponse.json({ challenges: [] });
    }

    const challenges = await prisma.challenge.findMany({
      where: { organizerId: member.organizerId, deletedAt: null },
      include: {
        _count: { select: { participations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ challenges });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
