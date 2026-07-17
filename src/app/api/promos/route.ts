import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { challengeId, code, description, discountPercent, discountAmount, maxUses, validUntil } = await request.json();

    if (!challengeId || !code) {
      return NextResponse.json({ error: 'challengeId и code обязательны' }, { status: 400 });
    }

    // Проверяем, является ли пользователь организатором ЧИ
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { organizer: { include: { members: { where: { userId: session.user.id } } } } },
    });

    if (!challenge || challenge.organizer.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const promo = await prisma.promoCode.create({
      data: {
        challengeId,
        code: code.toUpperCase(),
        description,
        discountPercent: discountPercent || null,
        discountAmount: discountAmount || null,
        maxUses: maxUses || 100,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });

    return NextResponse.json({ success: true, promo });
  } catch (error) {
    console.error('[promos] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('challengeId');

    if (challengeId) {
      // Промокоды для конкретного ЧИ
      const promos = await prisma.promoCode.findMany({
        where: { challengeId },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ promos });
    }

    // Промокоды пользователя
    const userPromos = await prisma.userPromoCode.findMany({
      where: { userId: session.user.id },
      include: { promoCode: { include: { challenge: { select: { id: true, title: true } } } } },
      orderBy: { earnedAt: 'desc' },
    });

    return NextResponse.json({ promos: userPromos });
  } catch (error) {
    console.error('[promos] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
