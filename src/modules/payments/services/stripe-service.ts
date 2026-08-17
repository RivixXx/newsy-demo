import Stripe from 'stripe';

export interface StripePaymentService {
  createPaymentIntent(challengeId: string, planId: string, userId: string, amount: number, currency: string, description: string, returnUrl: string): Promise<{ clientSecret: string; paymentIntentId: string; checkoutUrl: string }>;
  getPaymentIntent(paymentIntentId: string): Promise<{ status: string; metadata: Record<string, string> | null; checkoutUrl?: string }>;
  cancelSubscription(checkoutSessionId: string): Promise<void>;
}

function getStripeInstance(): Stripe | null {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) return null;
  return new Stripe(apiKey, {
    apiVersion: '2025-01-27.acacia' as any,
    typescript: true,
  });
}

export function createStripeService(): StripePaymentService {
  return {
    async createPaymentIntent(challengeId, planId, userId, amount, currency, description, returnUrl) {
      const stripe = getStripeInstance();
      if (!stripe) {
        throw new Error('Stripe secret key is not configured. Set STRIPE_SECRET_KEY environment variable.');
      }

      const isSubscription = !challengeId && Boolean(planId);
      const separator = returnUrl.includes('?') ? '&' : '?';
      const metadata = {
        challengeId,
        planId,
        userId,
        type: isSubscription ? 'SUBSCRIPTION' : 'PUBLISH_CHALLENGE',
      };
      const checkout = await stripe.checkout.sessions.create({
        mode: isSubscription ? 'subscription' : 'payment',
        line_items: [{
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(amount * 100),
            product_data: { name: description },
            ...(isSubscription ? { recurring: { interval: 'month' as const } } : {}),
          },
        }],
        metadata: {
          ...metadata,
        },
        ...(isSubscription
          ? { subscription_data: { metadata } }
          : { payment_intent_data: { metadata } }),
        success_url: `${returnUrl}${separator}status=success&checkout_session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnUrl}${separator}status=canceled`,
      });

      if (!checkout.url || !checkout.id) {
        throw new Error('Invalid Stripe response: missing checkout URL');
      }

      return {
        clientSecret: '',
        paymentIntentId: checkout.id,
        checkoutUrl: checkout.url,
      };
    },

    async getPaymentIntent(paymentIntentId) {
      if (paymentIntentId.startsWith('mock_')) {
        return {
          status: 'succeeded',
          metadata: null,
        };
      }

      const stripe = getStripeInstance();
      if (!stripe) {
        throw new Error('Stripe secret key is not configured.');
      }

      if (paymentIntentId.startsWith('cs_')) {
        const checkout = await stripe.checkout.sessions.retrieve(paymentIntentId);
        return {
          status: checkout.status ?? 'expired',
          metadata: checkout.metadata as Record<string, string> | null,
          checkoutUrl: checkout.url ?? undefined,
        };
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        status: paymentIntent.status,
        metadata: paymentIntent.metadata as Record<string, string> | null,
      };
    },

    async cancelSubscription(checkoutSessionId) {
      const stripe = getStripeInstance();
      if (!stripe) {
        throw new Error('Stripe secret key is not configured.');
      }

      const checkout = await stripe.checkout.sessions.retrieve(checkoutSessionId);
      const subscriptionId = typeof checkout.subscription === 'string'
        ? checkout.subscription
        : checkout.subscription?.id;
      if (!subscriptionId) {
        throw new Error('Stripe subscription is not attached to the checkout session.');
      }
      await stripe.subscriptions.cancel(subscriptionId);
    },
  };
}
