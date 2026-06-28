import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createYooKassaService } from '@/modules/payments/services/yookassa-service';
import { createPaymentService } from '@/modules/payments/services/payment-service';
import { createSubscriptionService } from '@/modules/payments/services/subscription-service';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { event, object } = payload;

    if (!event || !object?.id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const yookassa = createYooKassaService();

    const verifiedPayment = await yookassa.getPayment(object.id);
    if (verifiedPayment.status !== object.status) {
      console.warn(`Webhook status mismatch: claimed=${object.status}, verified=${verifiedPayment.status}`);
    }

    const metadata = verifiedPayment.metadata || object.metadata;
    const paymentType = metadata?.type;

    if (paymentType === 'SUBSCRIPTION') {
      const subscriptionService = createSubscriptionService(prisma, yookassa);
      await subscriptionService.handleWebhook({ event, object: verifiedPayment });
    } else {
      const paymentService = createPaymentService(prisma, yookassa);
      await paymentService.handleWebhook({ event, object: verifiedPayment });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
