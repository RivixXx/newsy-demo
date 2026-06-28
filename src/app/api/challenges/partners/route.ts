import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get('challengeId');

    if (!challengeId) {
      return NextResponse.json({ error: 'challengeId is required' }, { status: 400 });
    }

    const partners = await prisma.challengePartner.findMany({
      where: { challengeId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ partners });
  } catch (error: any) {
    console.error('Get partners error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { challengeId, partnerName, partnerLogoUrl } = await req.json();

    if (!challengeId || !partnerName) {
      return NextResponse.json({ error: 'challengeId и partnerName обязательны' }, { status: 400 });
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

    const partner = await prisma.challengePartner.create({
      data: { challengeId, partnerName, partnerLogoUrl },
    });

    return NextResponse.json({ partner });
  } catch (error: any) {
    console.error('Create partner error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { partnerId } = await req.json();

    if (!partnerId) {
      return NextResponse.json({ error: 'partnerId is required' }, { status: 400 });
    }

    const partner = await prisma.challengePartner.findUnique({
      where: { id: partnerId },
      include: { challenge: { include: { organizer: { include: { members: true } } } } },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Партнёр не найден' }, { status: 404 });
    }

    const isMember = partner.challenge.organizer.members.some(m => m.userId === session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    await prisma.challengePartner.delete({ where: { id: partnerId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete partner error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
