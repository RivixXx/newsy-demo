import { PrismaClient } from '@prisma/client';
import { YooKassaService } from './yookassa-service';
import { createCommissionService } from './commission-service';

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

      if (!challenge) throw new Error('Челлендж не найден');
      if (challenge.status !== 'DRAFT') {
        throw new Error('Публикация доступна только для черновиков');
      }

      const existingPending = await prisma.paymentTransaction.findFirst({
        where: { challengeId, status: 'PENDING' },
      });
      if (existingPending && existingPending.providerId) {
        const payment = await yookassa.getPayment(existingPending.providerId);
        if (payment.status === 'pending' && payment.confirmation?.confirmation_url) {
          return { checkoutUrl: payment.confirmation.confirmation_url };
        }
      }

      const amount = challenge.publishPrice ?? 0;
      if (amount < 0) throw new Error('Некорректная стоимость публикации');

      const payment = await yookassa.createPayment({
        amount: {
          value: amount.toFixed(2),
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
          type: 'PUBLISH_CHALLENGE',
          status: 'PENDING',
        },
      });

      return { checkoutUrl: payment.confirmation?.confirmation_url || '' };
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
        console.warn(`Webhook for unknown payment: ${object.id}`);
        return;
      }

      if (event === 'payment.succeeded') {
        if (transaction.status === 'SUCCEEDED') return;

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

        if (transaction.type === 'PUBLISH_CHALLENGE') {
          const challenge = await prisma.challenge.findUnique({
            where: { id: transaction.challengeId },
          });
          if (challenge && challenge.entryFee && challenge.entryFee > 0) {
            const commissionService = createCommissionService(prisma);
            const commission = await commissionService.calculateCommission(
              transaction.challengeId,
              challenge.entryFee,
              0
            );
            await commissionService.recordCommission(
              transaction.challengeId,
              commission.totalRevenue,
              commission.platformShare,
              commission.organizerShare,
              commission.rate
            );
          }
        }
      } else if (event === 'payment.canceled') {
        if (transaction.status === 'CANCELED') return;

        await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: { status: 'CANCELED' },
        });
      }
    },
  };
}
