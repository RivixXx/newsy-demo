import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { rateLimit } from '@/lib/rate-limit';

export async function GET() {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 });
    }

    const rl = await rateLimit(`notifications:unread:${session.user.id}`, { windowMs: 60_000, max: 60 });
    if (!rl.allowed) {
      return NextResponse.json({ count: 0, error: 'Слишком много запросов. Подождите.' }, { status: 429 });
    }

    const count = await prisma.notification.count({
      where: { userId: session.user.id, readAt: null, deletedAt: null },
    });

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
