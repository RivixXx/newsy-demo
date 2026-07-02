import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { createMailingService } from '@/modules/challenges/services/mailing-service';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { challengeId, title, body } = await req.json();

    if (!challengeId || !title || !body) {
      return NextResponse.json({ error: 'challengeId, title и body обязательны' }, { status: 400 });
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

    const mailingService = createMailingService(prisma);
    const { sentCount } = await mailingService.sendToChallengeParticipants(challengeId, title, body);

    return NextResponse.json({ success: true, sentCount });
  } catch (error: any) {
    console.error('Mailing error:', error);
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const mailingService = createMailingService(prisma);
    const notifications = await mailingService.getUserNotifications(session.user.id);

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : error.message }, { status: 500 });
  }
}
