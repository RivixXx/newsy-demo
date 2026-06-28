import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const userId = session.user.id;

    const organizer = await prisma.organizer.findFirst({
      where: { members: { some: { userId } } },
    });

    const organizerId = organizer?.id;

    const totalChallenges = organizerId
      ? await prisma.challenge.count({ where: { organizerId, deletedAt: null } })
      : 0;

    const publishedChallenges = organizerId
      ? await prisma.challenge.count({ where: { organizerId, status: 'PUBLISHED', deletedAt: null } })
      : 0;

    const totalParticipants = organizerId
      ? await prisma.userProgress.count({
          where: { challenge: { organizerId } },
        })
      : 0;

    const revenueResult = organizerId
      ? await prisma.paymentTransaction.aggregate({
          where: { organizerId, status: 'SUCCEEDED' },
          _sum: { amount: true },
        })
      : { _sum: { amount: 0 } };

    const totalRevenue = revenueResult._sum.amount || 0;

    const activeSubscriptions = await prisma.userSubscription.count({
      where: { status: 'ACTIVE' },
    });

    const challenges = organizerId
      ? await prisma.challenge.findMany({
          where: { organizerId, deletedAt: null },
          include: { _count: { select: { participations: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })
      : [];

    const recentChallenges = challenges.map(ch => ({
      id: ch.id,
      title: ch.title,
      participants: ch._count.participations,
      status: ch.status,
    }));

    const categoryAgg = organizerId
      ? await prisma.challenge.groupBy({
          by: ['category'],
          where: { organizerId, deletedAt: null },
          _count: true,
        })
      : [];

    const categoryBreakdown = categoryAgg.map(c => ({
      category: c.category || 'Без категории',
      count: c._count,
    }));

    return NextResponse.json({
      totalChallenges,
      publishedChallenges,
      totalParticipants,
      totalRevenue,
      activeSubscriptions,
      recentChallenges,
      categoryBreakdown,
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
