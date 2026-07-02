import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { createYooKassaService } from '@/modules/payments/services/yookassa-service';
import { createPaymentService } from '@/modules/payments/services/payment-service';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
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

    const isMember = challenge.organizer.members.some(m => m.userId === session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Нет доступа к этому челленджу' }, { status: 403 });
    }

    const yookassa = createYooKassaService();
    const paymentService = createPaymentService(prisma, yookassa);
    const { checkoutUrl } = await paymentService.initiatePublishPayment(challengeId);

    return NextResponse.json({ checkoutUrl });
  } catch (error: any) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : error.message }, { status: 500 });
  }
}
