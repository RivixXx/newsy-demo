import type { PrismaClient } from '@prisma/client';
import type { StripePaymentService } from './stripe-service';
import type { PaymentWebhookPayload } from '../types';

export interface PaymentService {
  initiatePublishPayment(challengeId: string, userId: string): Promise<{ checkoutUrl: string; isExisting?: boolean }>;
  handleWebhook(payload: PaymentWebhookPayload): Promise<void>;
}

export function createPaymentService(
  prisma: PrismaClient,
  stripeService: StripePaymentService
): PaymentService {
  return {
    async initiatePublishPayment(challengeId, userId) {
      const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        include: { organizer: true },
      });

      if (!challenge) throw new Error('Челлендж не найден');
      if (challenge.status !== 'DRAFT') {
        throw new Error('Публикация доступна только для черновиков');
      }

      const amount = challenge.publishPrice ?? 0;
      if (amount < 0) throw new Error('Некорректная стоимость публикации');

      if (amount === 0) {
        await prisma.challenge.update({
          where: { id: challengeId },
          data: { status: 'PUBLISHED' },
        });
        return { checkoutUrl: `/dashboard/challenges/${challengeId}/payment-status?status=success` };
      }

      const result = await prisma.$transaction(async (tx) => {
        const existingPending = await tx.paymentTransaction.findFirst({
          where: { challengeId, status: 'PENDING' },
        });

        if (existingPending?.providerId) {
          try {
            const pi = await stripeService.getPaymentIntent(existingPending.providerId);
            if ((pi.status === 'requires_payment_method' || pi.status === 'processing' || pi.status === 'requires_confirmation') && pi.metadata) {
              return { checkoutUrl: `${process.env.NEXTAUTH_URL}/dashboard/challenges/${challengeId}/payment-status?paymentIntent=${existingPending.providerId}`, isExisting: true };
            }
          } catch {
          }

          await tx.paymentTransaction.deleteMany({ where: { id: existingPending.id } });
        }

        const pi = await stripeService.createPaymentIntent(
          challengeId,
          '',
          userId,
          amount,
          'RUB',
          `Публикация челленджа: ${challenge.title}`,
          `${process.env.NEXTAUTH_URL}/dashboard/challenges/${challengeId}/payment-status`
        );

        try {
          await tx.paymentTransaction.create({
            data: {
              organizerId: challenge.organizerId,
              challengeId,
              amount: Number(amount),
              currency: 'RUB',
              provider: 'STRIPE',
              providerId: pi.paymentIntentId,
              type: 'PUBLISH_CHALLENGE',
              status: 'PENDING',
            },
          });
        } catch (err: unknown) {
          const maybePrisma = err as { code?: string };
          if (maybePrisma.code === 'P2002') {
            return { checkoutUrl: `${process.env.NEXTAUTH_URL}/dashboard/challenges/${challengeId}/payment-status?paymentIntent=${pi.paymentIntentId}`, isExisting: true };
          }
          throw err;
        }

        return { checkoutUrl: `${process.env.NEXTAUTH_URL}/dashboard/challenges/${challengeId}/payment-status?paymentIntent=${pi.paymentIntentId}`, isExisting: false };
      });

      return { checkoutUrl: result.checkoutUrl, isExisting: result.isExisting };
    },

    async handleWebhook(payload) {
      const { event, object } = payload;

      if (!event || !object?.id) {
        throw new Error('Invalid webhook payload');
      }

      const transaction = await prisma.paymentTransaction.findUnique({
        where: { providerId: object.id },
      });

      if (!transaction) {
        console.warn(`[payment] Webhook for unknown payment: ${object.id}`);
        return;
      }

      if (event === 'payment.succeeded') {
        if (transaction.status === 'SUCCEEDED') {
          return;
        }

        await prisma.$transaction([
          prisma.paymentTransaction.update({
            where: { id: transaction.id },
            data: { status: 'SUCCEEDED' },
          }),
          prisma.challenge.update({
            where: { id: transaction.challengeId },
            data: { status: 'PUBLISHED' },
          }),
        ]);

        console.info(
          `[payment] Challenge ${transaction.challengeId} published. ` +
            `Commission will be tracked per participant entry.`
        );
      } else if (event === 'payment.canceled' || event === 'payment_intent.canceled') {
        if (transaction.status === 'CANCELED') return;

        await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: { status: 'CANCELED' },
        });
      } else if (event === 'payment_intent.payment_failed') {
        if (transaction.status === 'FAILED') return;

        await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: { status: 'FAILED' },
        });

        console.warn(
          `[payment] Payment failed for challenge ${transaction.challengeId}.`
        );
      } else if (event === 'charge.refunded' || event === 'payment_intent.refund_created') {
        if (transaction.status === 'REFUNDED') return;

        await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: { status: 'REFUNDED' },
        });

        console.info(
          `[payment] Refund processed for challenge ${transaction.challengeId}.`
        );
      } else if (event === 'payment_intent.requires_payment_method') {
        if (transaction.status === 'PENDING') {
          console.info(
            `[payment] Payment method required for challenge ${transaction.challengeId}. Not marking as failed yet — user may update card.`
          );
        }
      }
    },
  };
}
