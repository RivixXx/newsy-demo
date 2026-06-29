import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

async function safeCount(fn: () => Promise<number>): Promise<number> {
  try { return await fn(); } catch { return 0; }
}

async function safeFindMany<T>(fn: () => Promise<T>): Promise<T> {
  try { return await fn(); } catch { return [] as T; }
}

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

    const usersTotal = await safeCount(() => prisma.user.count({ where: { deletedAt: null } }));
    const usersActive = await safeCount(() => prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }));
    const usersPending = await safeCount(() => prisma.user.count({ where: { status: 'PENDING', deletedAt: null } }));

    const challengesTotal = await safeCount(() => prisma.challenge.count({ where: { deletedAt: null } }));
    const challengesPublished = await safeCount(() => prisma.challenge.count({ where: { status: 'PUBLISHED', deletedAt: null } }));
    const challengesDraft = await safeCount(() => prisma.challenge.count({ where: { status: 'DRAFT', deletedAt: null } }));
    const challengesOngoing = await safeCount(() => prisma.challenge.count({ where: { status: 'ONGOING', deletedAt: null } }));
    const challengesPendingReview = await safeCount(() => prisma.challenge.count({ where: { status: 'PENDING_REVIEW', deletedAt: null } }));

    let paymentsTotal = 0, paymentsSucceeded = 0, paymentsPending = 0, revenue = 0;
    try {
      paymentsTotal = await prisma.paymentTransaction.count();
      paymentsSucceeded = await prisma.paymentTransaction.count({ where: { status: 'SUCCEEDED' } });
      paymentsPending = await prisma.paymentTransaction.count({ where: { status: 'PENDING' } });
      const rev = await prisma.paymentTransaction.aggregate({ where: { status: 'SUCCEEDED' }, _sum: { amount: true } });
      revenue = rev._sum.amount || 0;
    } catch { /* PaymentTransaction may not have 'type' column yet */ }

    let subsActive = 0, subsCanceled = 0;
    try {
      subsActive = await prisma.userSubscription.count({ where: { status: 'ACTIVE' } });
      subsCanceled = await prisma.userSubscription.count({ where: { status: 'CANCELED' } });
    } catch { /* UserSubscription table may not exist yet */ }

    const recentUsers = await safeFindMany(() =>
      prisma.user.findMany({
        where: { deletedAt: null },
        select: {
          id: true, email: true, firstName: true, lastName: true, status: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }).then(users => users.map(u => ({
        id: u.id, email: u.email, name: `${u.firstName} ${u.lastName}`.trim(),
        status: u.status, createdAt: u.createdAt.toISOString(),
      })))
    );

    const recentChallenges = await safeFindMany(() =>
      prisma.challenge.findMany({
        where: { deletedAt: null },
        select: {
          id: true, title: true, status: true, createdAt: true,
          organizer: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }).then(chs => chs.map(ch => ({
        id: ch.id, title: ch.title, status: ch.status,
        organizer: ch.organizer.name, createdAt: ch.createdAt.toISOString(),
      })))
    );

    const recentPayments = await safeFindMany(() =>
      prisma.paymentTransaction.findMany({
        select: { id: true, amount: true, status: true, type: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }).then(ps => ps.map(p => ({
        id: p.id, amount: p.amount, status: p.status,
        type: p.type, createdAt: p.createdAt.toISOString(),
      })))
    );

    return NextResponse.json({
      users: { total: usersTotal, active: usersActive, pending: usersPending },
      challenges: { total: challengesTotal, published: challengesPublished, draft: challengesDraft, ongoing: challengesOngoing, pendingReview: challengesPendingReview },
      payments: { total: paymentsTotal, succeeded: paymentsSucceeded, pending: paymentsPending, revenue },
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
