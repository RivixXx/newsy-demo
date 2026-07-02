import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createYooKassaService } from '@/modules/payments/services/yookassa-service';
import { createPaymentService } from '@/modules/payments/services/payment-service';
import { createSubscriptionService } from '@/modules/payments/services/subscription-service';
import { rateLimit } from '@/lib/rate-limit';

const YOOKASSA_IPS = [
  '185.70.44.',
  '5.35.4.',
  '37.139.32.',
];

function isYooKassaIP(ip: string): boolean {
  return YOOKASSA_IPS.some(prefix => ip.startsWith(prefix));
}

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit('webhook:yookassa', { windowMs: 60_000, max: 50 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const forwarded = req.headers.get('x-forwarded-for');
    const clientIP = forwarded?.split(',')[0]?.trim() || 'unknown';

    if (!isYooKassaIP(clientIP)) {
      console.warn(`Webhook from unknown IP: ${clientIP}`);
    }

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
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : message }, { status: 500 });
  }
}
