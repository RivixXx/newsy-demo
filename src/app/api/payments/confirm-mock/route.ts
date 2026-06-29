import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { challengeId } = await req.json();

    if (!challengeId) {
      return NextResponse.json({ error: 'challengeId is required' }, { status: 400 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { organizer: { include: { members: true } } },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Челлендж не найден' }, { status: 404 });
    }

    const isMember = challenge.organizer.members.some(m => m.userId === session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    await prisma.challenge.update({
      where: { id: challengeId },
      data: { status: 'PENDING_REVIEW' },
    });

    return NextResponse.json({ success: true, status: 'PENDING_REVIEW' });
  } catch (error: any) {
    console.error('Mock confirm error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
