import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { rateLimit } from '@/lib/rate-limit';

export async function GET() {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ notifications: [] });
    }

    const rl = await rateLimit(`notifications:list:${session.user.id}`, { windowMs: 60_000, max: 60 });
    if (!rl.allowed) {
      return NextResponse.json({ notifications: [], error: 'Слишком много запросов. Подождите.' }, { status: 429 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ notifications });
  } catch {
    return NextResponse.json({ notifications: [] });
  }
}
