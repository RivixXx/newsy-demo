import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { createYooKassaService } from '@/modules/payments/services/yookassa-service';
import { createSubscriptionService } from '@/modules/payments/services/subscription-service';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { planKey } = await req.json();
    if (!planKey) {
      return NextResponse.json({ error: 'planKey is required' }, { status: 400 });
    }

    const yookassa = createYooKassaService();
    const subscriptionService = createSubscriptionService(prisma, yookassa);
    const { checkoutUrl } = await subscriptionService.createSubscription(session.user.id, planKey);

    return NextResponse.json({ checkoutUrl });
  } catch (error: any) {
    console.error('Subscription creation error:', error);
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const yookassa = createYooKassaService();
    const subscriptionService = createSubscriptionService(prisma, yookassa);
    const subscription = await subscriptionService.getUserSubscription(session.user.id);

    return NextResponse.json({ subscription });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : error.message }, { status: 500 });
  }
}
