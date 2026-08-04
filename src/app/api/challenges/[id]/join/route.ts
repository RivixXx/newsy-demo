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

    if (challenge.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Челлендж недоступен для участия' }, { status: 400 });
    }

    // Проверка срока регистрации
    if (challenge.startDate) {
      const now = new Date();
      const deadline = new Date(challenge.startDate);
      // Если есть startTime — комбинируем
      if (challenge.startTime) {
        const [h, m] = challenge.startTime.split(':').map(Number);
        if (!isNaN(h)) deadline.setHours(h, m || 0, 0, 0);
      }
      if (now >= deadline) {
        return NextResponse.json({ error: 'Регистрация на этот челлендж закрыта' }, { status: 400 });
      }
    }

    const existing = await prisma.userProgress.findUnique({
      where: { userId_challengeId: { userId: session.user.id, challengeId: id } },
    });

    if (existing) {
      return NextResponse.json({ success: true, message: 'Вы уже участвуете', progressId: existing.id });
    }

    if (challenge.maxParticipants !== null && challenge.maxParticipants !== undefined) {
      const activeCount = await prisma.userProgress.count({
        where: {
          challengeId: id,
          status: { not: 'WITHDRAWN' },
        },
      });
      if (activeCount >= challenge.maxParticipants) {
        return NextResponse.json({ error: 'Челлендж заполнен' }, { status: 409 });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const progress = await tx.userProgress.create({
        data: {
          userId: session.user.id,
          challengeId: id,
          status: 'IN_PROGRESS',
        },
      });

      await tx.notification.create({
        data: {
          userId: session.user.id,
          type: 'CHALLENGE_CREATED',
          title: 'Вы присоединились к челленджу',
          body: `Теперь вы участвуете в «${challenge.title}». Удачи!`,
        },
      });

      return progress;
    });

    return NextResponse.json({ success: true, progressId: result.id });
  } catch (error: any) {
    console.error('Join error:', error);
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : error.message }, { status: 500 });
  }
}
