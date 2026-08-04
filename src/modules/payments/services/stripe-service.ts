import Stripe from 'stripe';

export interface StripePaymentService {
  createPaymentIntent(challengeId: string, userId: string, amount: number, currency: string, description: string, returnUrl: string): Promise<{ clientSecret: string; paymentIntentId: string }>;
  getPaymentIntent(paymentIntentId: string): Promise<{ status: string; metadata: Record<string, string> | null }>;
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
    async createPaymentIntent(challengeId, userId, amount, currency, description, returnUrl) {
      const stripe = getStripeInstance();
      if (!stripe) {
        console.warn('[Stripe] Credentials missing. Returning mock payment intent (dev only).');
        const mockId = 'pi_mock_' + Date.now();
        return {
          clientSecret: mockId + '_client_secret',
          paymentIntentId: mockId,
        };
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        description,
        metadata: {
          challengeId: challengeId,
          userId: userId,
          type: 'PUBLISH_CHALLENGE',
        },
        confirmation_method: 'manual',
        return_url: returnUrl,
      });

      if (!paymentIntent.client_secret || !paymentIntent.id) {
        throw new Error('Invalid Stripe response: missing required fields');
      }

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
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
        return { status: 'processing', metadata: null };
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        status: paymentIntent.status,
        metadata: paymentIntent.metadata as Record<string, string> | null,
      };
    },
  };
}
