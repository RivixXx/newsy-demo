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
      return NextResponse.json({ balance: 0, payouts: [] });
    }

    const payouts = await prisma.commissionPayout.findMany({
      where: { organizerId: member.organizerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const balance = payouts
      .filter(p => p.status === 'SUCCEEDED')
      .reduce((acc, p) => acc + p.amount, 0);

    return NextResponse.json({ balance, payouts });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
