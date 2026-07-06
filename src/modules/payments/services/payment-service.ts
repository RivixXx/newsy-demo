import type { PrismaClient } from '@prisma/client';
import type { YooKassaService } from './yookassa-service';
import type { PaymentWebhookPayload } from '../types';

export interface PaymentService {
  initiatePublishPayment(challengeId: string, userId: string): Promise<{ checkoutUrl: string }>;
  handleWebhook(payload: PaymentWebhookPayload): Promise<void>;
}

export function createPaymentService(
  prisma: PrismaClient,
  yookassa: YooKassaService
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

      // Если публикация бесплатная — публикуем сразу без платежа
      if (amount === 0) {
        await prisma.challenge.update({
          where: { id: challengeId },
          data: { status: 'PUBLISHED' },
        });
        return { checkoutUrl: `/dashboard/challenges/${challengeId}/payment-status?status=success` };
      }

      // Атомарная операция: ищем существующий pending-платёж или создаём новый
      // Используем upsert-подобный подход через транзакцию для предотвращения race condition
      const result = await prisma.$transaction(async (tx) => {
        const existingPending = await tx.paymentTransaction.findFirst({
          where: { challengeId, status: 'PENDING' },
        });

        if (existingPending?.providerId) {
          try {
            const payment = await yookassa.getPayment(existingPending.providerId);
            if (payment.status === 'pending' && payment.confirmation?.confirmation_url) {
              return { checkoutUrl: payment.confirmation.confirmation_url, isExisting: true };
            }
          } catch {
            // Платёж не найден в ЮKassa — создадим новый
          }
        }

        return { checkoutUrl: null, isExisting: false };
      });

      if (result.isExisting && result.checkoutUrl) {
        return { checkoutUrl: result.checkoutUrl };
      }

      // Создаём новый платёж в ЮKassa (детерминированный idempotency key в сервисе)
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
        description: `Публикация челенджа: ${challenge.title}`,
        metadata: {
          challengeId,
          organizerId: challenge.organizerId,
          userId,
          type: 'PUBLISH_CHALLENGE',
        },
      });

      // Сохраняем запись транзакции. Если гонки нет (нет дублей) — создаём.
      // Если гонка всё же произошла и providerId уже существует — игнорируем ошибку.
      try {
        await prisma.paymentTransaction.create({
          data: {
            organizerId: challenge.organizerId,
            challengeId,
            amount: Number(amount),
            currency: 'RUB',
            provider: 'YOOKASSA',
            providerId: payment.id,
            type: 'PUBLISH_CHALLENGE',
            status: 'PENDING',
          },
        });
      } catch (err: unknown) {
        // Unique constraint violation — дублирующий запрос, возвращаем тот же URL
        const isUniqueError =
          err instanceof Error && err.message.includes('Unique constraint failed');
        if (!isUniqueError) throw err;
      }

      return { checkoutUrl: payment.confirmation?.confirmation_url ?? '' };
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
          // Идемпотентность: уже обработали
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

        // Комиссия фиксируется по фактическим поступлениям — НЕ в момент публикации
        // Комиссия будет рассчитана и записана при присоединении участников (в будущем)
        console.info(
          `[payment] Challenge ${transaction.challengeId} published. ` +
            `Commission will be tracked per participant entry.`
        );
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
