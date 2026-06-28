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

    const { subscriptionId } = await req.json();
    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId is required' }, { status: 400 });
    }

    const yookassa = createYooKassaService();
    const subscriptionService = createSubscriptionService(prisma, yookassa);
    await subscriptionService.cancelSubscription(session.user.id, subscriptionId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
