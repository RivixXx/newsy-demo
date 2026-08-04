import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  createStripeService,
  type StripePaymentService,
} from '@/modules/payments/services/stripe-service';
import { createPaymentService } from '@/modules/payments/services/payment-service';
import { createSubscriptionService } from '@/modules/payments/services/subscription-service';
import { rateLimit } from '@/lib/rate-limit';
import type { PaymentWebhookPayload } from '@/modules/payments/types';

let stripeServiceCache: StripePaymentService | null = null;

function getStripeService(): StripePaymentService {
  if (!stripeServiceCache) {
    stripeServiceCache = createStripeService();
  }
  return stripeServiceCache;
}

function verifyWebhookSignature(rawBody: string, signature: string, secret: string, apiKey: string): boolean {
  if (!signature || !secret || !apiKey) return false;
  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(apiKey);
    stripe.webhooks.constructEvent(rawBody, signature, secret);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit('webhook:stripe', { windowMs: 60_000, max: 120 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    if (!signature) {
      console.warn('[webhook] Missing Stripe signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 403 });
    }

    if (!verifyWebhookSignature(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET || '', process.env.STRIPE_SECRET_KEY || '')) {
      console.warn('[webhook] Invalid Stripe signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    let payload: { type?: string; data?: { object?: { id?: string; status?: string; metadata?: Record<string, string> | null } } };
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const eventType = payload.type;
    const stripeObject = payload.data?.object;

    if (!eventType || !stripeObject?.id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const stripeService = createStripeService();

    if (eventType === 'payment_intent.succeeded' || eventType === 'payment_intent.payment_failed') {
      const verifiedPayment = await stripeService.getPaymentIntent(stripeObject.id);
      const metadata = verifiedPayment.metadata ?? stripeObject.metadata;
      const paymentType = metadata?.type;

      if (paymentType === 'SUBSCRIPTION') {
        const subscriptionService = createSubscriptionService(prisma, stripeService);
        const convertedPayload: PaymentWebhookPayload = {
          event: eventType === 'payment_intent.succeeded' ? 'payment.succeeded' : 'payment.canceled',
          type: 'notification',
          object: {
            id: stripeObject.id,
            status: verifiedPayment.status as 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled',
            amount: { value: '0', currency: 'RUB' },
            created_at: new Date().toISOString(),
            metadata: metadata ?? undefined,
          },
        };
        await subscriptionService.handleWebhook(convertedPayload);
      } else {
        const paymentService = createPaymentService(prisma, stripeService);
        const convertedPayload: PaymentWebhookPayload = {
          event: eventType === 'payment_intent.succeeded' ? 'payment.succeeded' : 'payment.canceled',
          type: 'notification',
          object: {
            id: stripeObject.id,
            status: verifiedPayment.status as 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled',
            amount: { value: '0', currency: 'RUB' },
            created_at: new Date().toISOString(),
            metadata: metadata ?? undefined,
          },
        };
        await paymentService.handleWebhook(convertedPayload);
      }
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
