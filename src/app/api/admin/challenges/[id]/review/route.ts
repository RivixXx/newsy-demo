import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

const DEFAULT_REJECTION_REASON = 'Челлендж не соответствует требованиям платформы. Пожалуйста, проверьте описание, этапы и категорию, затем повторите попытку.';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    if (!session.user.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const { id } = await params;
    const { action, reason } = await req.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Действие: approve или reject' }, { status: 400 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      select: {
        title: true,
        status: true,
        organizer: {
          select: {
            members: { select: { userId: true } },
          },
        },
      },
    });
    if (!challenge) {
      return NextResponse.json({ error: 'Челлендж не найден' }, { status: 404 });
    }

    const memberIds = challenge.organizer?.members?.map(m => m.userId) || [];

    if (challenge.status !== 'PENDING_REVIEW') {
      return NextResponse.json({ error: 'Челлендж не на модерации' }, { status: 400 });
    }

    if (action === 'approve') {
      await prisma.challenge.update({
        where: { id },
        data: { status: 'PUBLISHED', rejectionReason: null },
      });

      if (memberIds.length > 0) {
        await prisma.notification.createMany({
          data: memberIds.map(userId => ({
            userId,
            type: 'CHALLENGE_UPDATED' as const,
            title: 'Челлендж одобрен',
            body: `«${challenge.title}» опубликован и доступен в каталоге.`,
          })),
        });
      }

      return NextResponse.json({
        success: true,
        challengeId: id,
        status: 'PUBLISHED',
        message: 'Челлендж одобрен и опубликован',
      });
    }

    const rejectionMessage = (reason && reason.trim()) || DEFAULT_REJECTION_REASON;

    await prisma.challenge.update({
      where: { id },
      data: { status: 'DRAFT', rejectionReason: rejectionMessage },
    });

    if (memberIds.length > 0) {
      await prisma.notification.createMany({
        data: memberIds.map(userId => ({
          userId,
          type: 'CHALLENGE_UPDATED' as const,
          title: 'Челлендж отклонён',
          body: `«${challenge.title}» возвращён на доработку. Причина: ${rejectionMessage}`,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      challengeId: id,
      status: 'DRAFT',
      rejectionReason: rejectionMessage,
      message: 'Челлендж возвращён на доработку',
    });
  } catch (error: any) {
    console.error('Review error:', error);
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : error.message }, { status: 500 });
  }
}
