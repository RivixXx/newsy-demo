import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { prisma } from '@/lib/db';
import { createYooKassaService } from '@/modules/payments/services/yookassa-service';
import { createPaymentService } from '@/modules/payments/services/payment-service';
import { createSubscriptionService } from '@/modules/payments/services/subscription-service';
import { rateLimit } from '@/lib/rate-limit';
import type { PaymentWebhookPayload } from '@/modules/payments/types';

// Полный список IP-адресов ЮKassa (https://yookassa.ru/developers/using-api/webhooks)
const YOOKASSA_IP_PREFIXES = [
  '185.71.76.',
  '185.71.77.',
  '77.75.153.',
  '77.75.156.',
  '77.75.154.',
  '77.75.155.',
  '2a02:5180:',
];

function isYooKassaIP(ip: string): boolean {
  return YOOKASSA_IP_PREFIXES.some((prefix) => ip.startsWith(prefix));
}

/**
 * Верифицирует HMAC-SHA256 подпись тела webhook, если задан YOOKASSA_WEBHOOK_SECRET.
 * Используется для дополнительной защиты от подделки запросов.
 */
function verifyWebhookSignature(body: string, signature: string | null): boolean {
  const secret = process.env.YOOKASSA_WEBHOOK_SECRET;
  if (!secret) {
    // Секрет не настроен — пропускаем верификацию подписи
    return true;
  }
  if (!signature) return false;
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  return expected === signature;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting (глобальный для webhook-эндпоинта)
    const rl = await rateLimit('webhook:yookassa', { windowMs: 60_000, max: 120 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // IP-проверка: блокируем, если IP не из диапазона ЮKassa
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIP = forwarded?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown';

    if (clientIP !== 'unknown' && !isYooKassaIP(clientIP)) {
      console.warn(`[webhook] Blocked request from unknown IP: ${clientIP}`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Читаем тело запроса как текст для верификации подписи
    const rawBody = await req.text();

    // HMAC-подпись (опциональная)
    const signature = req.headers.get('x-yookassa-signature');
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn('[webhook] Invalid HMAC signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    let payload: { event?: string; object?: { id?: string; status?: string; metadata?: Record<string, string> } };
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { event, object } = payload;

    if (!event || !object?.id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const yookassa = createYooKassaService();

    // Верифицируем состояние платежа через API ЮKassa (не доверяем webhook-телу)
    const verifiedPayment = await yookassa.getPayment(object.id);
    if (verifiedPayment.status !== object.status) {
      console.warn(
        `[webhook] Status mismatch for ${object.id}: claimed=${object.status}, actual=${verifiedPayment.status}. Skipping.`
      );
      // Возвращаем 200, чтобы ЮKassa не повторяла запрос, но ничего не обрабатываем
      return NextResponse.json({ status: 'ok' });
    }

    const metadata = verifiedPayment.metadata ?? object.metadata;
    const paymentType = metadata?.type;

    if (paymentType === 'SUBSCRIPTION') {
      const subscriptionService = createSubscriptionService(prisma, yookassa);
      await subscriptionService.handleWebhook({ event: event as PaymentWebhookPayload['event'], type: 'notification', object: verifiedPayment });
    } else {
      const paymentService = createPaymentService(prisma, yookassa);
      await paymentService.handleWebhook({ event: event as PaymentWebhookPayload['event'], type: 'notification', object: verifiedPayment });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: unknown) {
    console.error('[webhook] Error processing webhook:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'production' ? 'Internal server error' : message },
      { status: 500 }
    );
  }
}
