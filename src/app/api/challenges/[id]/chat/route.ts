import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const { text } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Пустое сообщение' }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        challengeId: id,
        userId: session.user.id,
        text: text.trim(),
      },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    const participants = await prisma.userProgress.findMany({
      where: { challengeId: id, userId: { not: session.user.id } },
      select: { userId: true },
    });

    const challenge = await prisma.challenge.findUnique({ where: { id }, select: { title: true } });
    const senderName = message.user.firstName ? `${message.user.firstName} ${message.user.lastName || ''}`.trim() : 'Пользователь';

    for (const p of participants) {
      await prisma.notification.create({
        data: {
          userId: p.userId,
          type: 'SYSTEM',
          title: `Новое сообщение в «${challenge?.title || 'Челлендж'}»`,
          body: `${senderName}: ${text.trim().slice(0, 100)}`,
        },
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
  } catch (error: any) {
    console.error('Chat send error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
