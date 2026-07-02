import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { rateLimit } from '@/lib/rate-limit';

async function checkParticipation(userId: string, challengeId: string): Promise<boolean> {
  const progress = await prisma.userProgress.findUnique({
    where: { userId_challengeId: { userId, challengeId } },
  });
  if (progress) return true;

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { organizer: { include: { members: { select: { userId: true } } } } },
  });
  return challenge?.organizer?.members?.some(m => m.userId === userId) ?? false;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { id } = await params;

    const isParticipant = await checkParticipation(session.user.id, id);
    if (!isParticipant) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { challengeId: id },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    const formatted = messages.map(m => ({
      id: m.id,
      user: m.user.firstName ? `${m.user.firstName} ${m.user.lastName || ''}`.trim() : 'Пользователь',
      userId: m.user.id,
      text: m.text,
      time: m.createdAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      createdAt: m.createdAt.toISOString(),
    }));

    return NextResponse.json({ messages: formatted });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { id } = await params;

    const isParticipant = await checkParticipation(session.user.id, id);
    if (!isParticipant) {
      return NextResponse.json({ error: 'Вы не участник этого челленджа' }, { status: 403 });
    }

    const rl = rateLimit(`chat:${session.user.id}:${id}`, { windowMs: 60_000, max: 20 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Слишком много сообщений. Подождите.' }, { status: 429 });
    }

    const { text } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Пустое сообщение' }, { status: 400 });
    }

    const trimmed = text.trim();
    if (trimmed.length > 1000) {
      return NextResponse.json({ error: 'Сообщение слишком длинное (макс. 1000 символов)' }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        challengeId: id,
        userId: session.user.id,
        text: trimmed,
      },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    const participants = await prisma.userProgress.findMany({
      where: { challengeId: id, userId: { not: session.user.id } },
      select: { userId: true },
    });

    const challenge = await prisma.challenge.findUnique({ where: { id }, select: { title: true } });
    const senderName = message.user.firstName ? `${message.user.firstName} ${message.user.lastName || ''}`.trim() : 'Пользователь';

    if (participants.length > 0) {
      await prisma.notification.createMany({
        data: participants.map(p => ({
          userId: p.userId,
          type: 'SYSTEM' as const,
          title: `Новое сообщение в «${challenge?.title || 'Челлендж'}»`,
          body: `${senderName}: ${trimmed.slice(0, 100)}`,
        })),
      });
    }

    return NextResponse.json({
      id: message.id,
      user: senderName,
      userId: session.user.id,
      text: message.text,
      time: message.createdAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      createdAt: message.createdAt.toISOString(),
    });
  } catch (error: unknown) {
    console.error('Chat send error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : message }, { status: 500 });
  }
}
