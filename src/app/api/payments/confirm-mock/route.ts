import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { notifyAdminsNewChallenge } from '@/lib/notification-bus';

export async function POST(req: NextRequest) {
  try {
    let session;
    try {
      session = await getCurrentAuthSession();
    } catch (sessionErr) {
      console.error('[confirm-mock] Session error:', sessionErr);
      return NextResponse.json({ error: 'Ошибка авторизации' }, { status: 401 });
    }

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

    const isMember = challenge.organizer?.members?.some(m => m.userId === session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    if (challenge.status === 'PENDING_REVIEW') {
      return NextResponse.json({ error: 'Челлендж уже на модерации' }, { status: 400 });
    }

    if (challenge.status === 'PUBLISHED') {
      return NextResponse.json({ error: 'Челлендж уже опубликован' }, { status: 400 });
    }

    await prisma.challenge.update({
      where: { id: challengeId },
      data: { status: 'PENDING_REVIEW' },
    });

    // Уведомить админов о новом ЧИ на модерации
    try {
      const firstMember = challenge.organizer?.members?.[0]?.userId;
      const organizerName = firstMember
        ? (await prisma.user.findUnique({ where: { id: firstMember }, select: { firstName: true, lastName: true } }))
        : null;
      const orgName = organizerName ? `${organizerName.firstName} ${organizerName.lastName}`.trim() : challenge.organizer?.name || 'Организатор';
      notifyAdminsNewChallenge(challengeId, challenge.title, orgName);
    } catch (notifErr) {
      console.error('[confirm-mock] Notification error (non-fatal):', notifErr);
    }

    return NextResponse.json({ success: true, status: 'PENDING_REVIEW' });
  } catch (error: any) {
    console.error('Mock confirm error:', error);
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : error.message }, { status: 500 });
  }
}
