import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const isAdmin = session.user.roles?.includes('admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const [usersTotal, usersActive, usersPending] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.user.count({ where: { status: 'PENDING', deletedAt: null } }),
    ]);

    const [challengesTotal, challengesPublished, challengesDraft, challengesOngoing] = await Promise.all([
      prisma.challenge.count({ where: { deletedAt: null } }),
      prisma.challenge.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
      prisma.challenge.count({ where: { status: 'DRAFT', deletedAt: null } }),
      prisma.challenge.count({ where: { status: 'ONGOING', deletedAt: null } }),
    ]);

    const [paymentsTotal, paymentsSucceeded, paymentsPending] = await Promise.all([
      prisma.paymentTransaction.count(),
      prisma.paymentTransaction.count({ where: { status: 'SUCCEEDED' } }),
      prisma.paymentTransaction.count({ where: { status: 'PENDING' } }),
    ]);

    const revenueResult = await prisma.paymentTransaction.aggregate({
      where: { status: 'SUCCEEDED' },
      _sum: { amount: true },
    });

    const [subsActive, subsCanceled] = await Promise.all([
      prisma.userSubscription.count({ where: { status: 'ACTIVE' } }),
      prisma.userSubscription.count({ where: { status: 'CANCELED' } }),
    ]);

    const recentUsers = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }).then(users => users.map(u => ({
      ...u,
      name: `${u.firstName} ${u.lastName}`.trim(),
    })));

    const recentChallenges = await prisma.challenge.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        organizer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }).then(chs => chs.map(ch => ({
      ...ch,
      organizer: ch.organizer.name,
    })));

    const recentPayments = await prisma.paymentTransaction.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        type: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      users: { total: usersTotal, active: usersActive, pending: usersPending },
      challenges: { total: challengesTotal, published: challengesPublished, draft: challengesDraft, ongoing: challengesOngoing },
      payments: { total: paymentsTotal, succeeded: paymentsSucceeded, pending: paymentsPending, revenue: revenueResult._sum.amount || 0 },
      subscriptions: { active: subsActive, canceled: subsCanceled },
      recentUsers,
      recentChallenges,
      recentPayments,
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
