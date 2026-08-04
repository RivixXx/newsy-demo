import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import {
  createStripeService,
  type StripePaymentService,
} from '@/modules/payments/services/stripe-service';
import { createPaymentService } from '@/modules/payments/services/payment-service';
import { createSubscriptionService } from '@/modules/payments/services/subscription-service';
import { rateLimit } from '@/lib/rate-limit';
import type { PaymentWebhookPayload } from '@/modules/payments/types';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  console.warn('[webhook] STRIPE_WEBHOOK_SECRET is not configured. Webhook signature verification is DISABLED.');
}

let stripeServiceCache: StripePaymentService | null = null;
let stripeClientCache: Stripe | null = null;

function getStripeService(): StripePaymentService {
  if (!stripeServiceCache) {
    stripeServiceCache = createStripeService();
  }
  return stripeServiceCache;
}

function getStripeClient(): Stripe {
  if (!stripeClientCache) {
    stripeClientCache = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-01-27.acacia' as any,
      typescript: true,
    });
  }
  return stripeClientCache;
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit('webhook:stripe', { windowMs: 60_000, max: 120 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!webhookSecret) {
      console.error('[webhook] STRIPE_WEBHOOK_SECRET is not configured. Rejecting webhook.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (!signature) {
      console.warn('[webhook] Missing Stripe signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      const stripe = getStripeClient();
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      console.warn('[webhook] Invalid Stripe signature:', error instanceof Error ? error.message : 'Unknown error');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const eventType = event.type;
    const stripeObject = event.data?.object;

    if (!stripeObject || typeof stripeObject !== 'object' || !('id' in stripeObject)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const stripeService = getStripeService();

    if (eventType === 'payment_intent.succeeded' || eventType === 'payment_intent.payment_failed') {
      const verifiedPayment = await stripeService.getPaymentIntent((stripeObject as Stripe.PaymentIntent).id);
      const metadata = verifiedPayment.metadata ?? ((stripeObject as Stripe.PaymentIntent).metadata as Record<string, string> | null);
      const paymentType = metadata?.type;

      let convertedEvent: string;
      if (eventType === 'payment_intent.succeeded') {
        convertedEvent = 'payment.succeeded';
      } else if (eventType === 'payment_intent.payment_failed') {
        convertedEvent = 'payment_intent.payment_failed';
        if (verifiedPayment.status === 'requires_payment_method') {
          convertedEvent = 'payment_intent.requires_payment_method';
        }
      } else {
        convertedEvent = 'payment.canceled';
      }

      const convertedPayload: PaymentWebhookPayload = {
        event: convertedEvent as PaymentWebhookPayload['event'],
        type: 'notification',
        object: {
          id: (stripeObject as Stripe.PaymentIntent).id,
          status: verifiedPayment.status as 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled',
          amount: { value: '0', currency: 'RUB' },
          created_at: new Date().toISOString(),
          metadata: metadata ?? undefined,
        },
      };

      if (paymentType === 'SUBSCRIPTION') {
        const subscriptionService = createSubscriptionService(prisma, stripeService);
        await subscriptionService.handleWebhook(convertedPayload);
      } else {
        const paymentService = createPaymentService(prisma, stripeService);
        await paymentService.handleWebhook(convertedPayload);
      }
    }

    if (eventType === 'charge.refunded') {
      const refundCharge = stripeObject as Stripe.Charge;
      const paymentIntentId = refundCharge.payment_intent as string | null;
      if (!paymentIntentId) {
        return NextResponse.json({ status: 'ok' });
      }

      let verifiedPayment: Stripe.PaymentIntent;
      try {
        verifiedPayment = await stripeService.getPaymentIntent(paymentIntentId);
      } catch {
        console.warn('[webhook] Could not find PaymentIntent for refund event:', paymentIntentId);
        return NextResponse.json({ status: 'ok' });
      }

      const metadata = verifiedPayment.metadata ?? {};
      const paymentType = metadata?.type;

      const convertedPayload: PaymentWebhookPayload = {
        event: 'charge.refunded',
        type: 'notification',
        object: {
          id: paymentIntentId,
          status: verifiedPayment.status as 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled',
          amount: { value: '0', currency: 'RUB' },
          created_at: new Date().toISOString(),
          metadata: metadata ?? undefined,
        },
      };

      if (paymentType === 'SUBSCRIPTION') {
        const subscriptionService = createSubscriptionService(prisma, stripeService);
        await subscriptionService.handleWebhook(convertedPayload);
      } else {
        const paymentService = createPaymentService(prisma, stripeService);
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
