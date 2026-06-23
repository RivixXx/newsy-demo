import { PrismaClient } from '@prisma/client';
import { YooKassaService } from './yookassa-service';

export interface PaymentService {
  initiatePublishPayment(challengeId: string): Promise<{ checkoutUrl: string }>;
  handleWebhook(payload: any): Promise<void>;
}

export function createPaymentService(
  prisma: PrismaClient,
  yookassa: YooKassaService
): PaymentService {
  return {
    async initiatePublishPayment(challengeId) {
      const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        include: { organizer: true },
      });

      if (!challenge) throw new Error('Challenge not found');
      if (challenge.status !== 'DRAFT') throw new Error('Only draft challenges can be published');

      const amount = challenge.publishPrice ?? 1000;

      const payment = await yookassa.createPayment({
        amount: {
          value: amount.toString(),
          currency: 'RUB',
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.NEXTAUTH_URL}/dashboard/challenges/${challengeId}/payment-status`,
        },
        description: `Оплата публикации челенджа: ${challenge.title}`,
        metadata: {
          challengeId,
          organizerId: challenge.organizerId,
          type: 'PUBLISH_CHALLENGE',
        },
      });

      await prisma.paymentTransaction.create({
        data: {
          organizerId: challenge.organizerId,
          challengeId: challengeId,
          amount: Number(amount),
          currency: 'RUB',
          provider: 'YOOKASSA',
          providerId: payment.id,
          status: 'PENDING',
        },
      });

      return { checkoutUrl: payment.confirmation?.confirmation_url || '' };
    },

    async handleWebhook(payload) {
      const { event, object } = payload;

      if (event === 'payment.succeeded') {
        const transaction = await prisma.paymentTransaction.findUnique({
          where: { providerId: object.id },
        });

        if (transaction) {
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
        }
      } else if (event === 'payment.canceled') {
        await prisma.paymentTransaction.updateMany({
          where: { providerId: object.id },
          data: { status: 'CANCELED' },
        });
      }
    },
  };
}
