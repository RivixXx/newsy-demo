import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { id } = await params;

    const challenge = await prisma.challenge.findUnique({ where: { id } });
    if (!challenge) {
      return NextResponse.json({ error: 'Челлендж не найден' }, { status: 404 });
    }

    const existing = await prisma.userProgress.findUnique({
      where: { userId_challengeId: { userId: session.user.id, challengeId: id } },
    });

    if (existing) {
      return NextResponse.json({ success: true, message: 'Вы уже участвуете', progressId: existing.id });
    }

    const progress = await prisma.userProgress.create({
      data: {
        userId: session.user.id,
        challengeId: id,
        status: 'IN_PROGRESS',
      },
    });

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'CHALLENGE_CREATED',
        title: 'Вы присоединились к челленджу',
        body: `Теперь вы участвуете в «${challenge.title}». Удачи!`,
      },
    });

    return NextResponse.json({ success: true, progressId: progress.id });
  } catch (error: any) {
    console.error('Join error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
