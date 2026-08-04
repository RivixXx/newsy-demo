import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { randomBytes } from 'node:crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { challengeId, name, maxMembers } = await request.json();

    if (!challengeId || !name) {
      return NextResponse.json({ error: 'challengeId и name обязательны' }, { status: 400 });
    }

    // Проверяем, не состоит ли уже в команде в этом ЧИ
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        team: { challengeId },
      },
    });

    if (existingMembership) {
      return NextResponse.json({ error: 'Вы уже состоите в команде в этом челлендже' }, { status: 409 });
    }

    let inviteCode = randomBytes(4).toString('hex');
    let team;
    let attempts = 0;
    const maxAttempts = 3;

    do {
      try {
        team = await prisma.team.create({
          data: {
            challengeId,
            name,
            captainId: session.user.id,
            inviteCode,
            maxMembers: maxMembers || 10,
          },
        });
        break;
      } catch (createErr: any) {
        if (createErr?.code === 'P2002' && attempts < maxAttempts) {
          inviteCode = randomBytes(4).toString('hex');
          attempts++;
          continue;
        }
        throw createErr;
      }
    } while (attempts < maxAttempts);

    // Капитан автоматически вступает в команду
    await prisma.teamMember.create({
      data: {
        teamId: team!.id,
        userId: session.user.id,
        role: 'CAPTAIN',
      },
    });

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error('[teams] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('challengeId');

    if (!challengeId) {
      return NextResponse.json({ error: 'challengeId required' }, { status: 400 });
    }

    const teams = await prisma.team.findMany({
      where: { challengeId },
      include: {
        captain: { select: { id: true, firstName: true, lastName: true } },
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('[teams] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
