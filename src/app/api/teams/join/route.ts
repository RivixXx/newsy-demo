import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inviteCode } = await request.json();

    if (!inviteCode) {
      return NextResponse.json({ error: 'inviteCode обязателен' }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { inviteCode },
      include: { _count: { select: { members: true } } },
    });

    if (!team) {
      return NextResponse.json({ error: 'Команда не найдена' }, { status: 404 });
    }

    if (team._count.members >= team.maxMembers) {
      return NextResponse.json({ error: 'Команда заполнена' }, { status: 409 });
    }

    // Проверяем, не состоит ли уже в команде в этом ЧИ
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        team: { challengeId: team.challengeId },
      },
    });

    if (existingMembership) {
      return NextResponse.json({ error: 'Вы уже состоите в команде в этом челлендже' }, { status: 409 });
    }

    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: session.user.id,
        role: 'MEMBER',
      },
    });

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error('[teams/join] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
