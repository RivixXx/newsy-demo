import type { PrismaClient } from '@prisma/client';
import type { YooKassaService } from './yookassa-service';
import type { PaymentWebhookPayload } from '../types';

export interface SubscriptionPlanInfo {
  id: string;
  key: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: unknown;
  isActive: boolean;
}

export interface UserSubscriptionInfo {
  id: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt: Date | null;
  plan: SubscriptionPlanInfo;
}

export interface SubscriptionService {
  createSubscription(userId: string, planKey: string): Promise<{ checkoutUrl: string }>;
  cancelSubscription(userId: string, subscriptionId: string): Promise<void>;
  handleWebhook(payload: PaymentWebhookPayload): Promise<void>;
  getUserSubscription(userId: string): Promise<UserSubscriptionInfo | null>;
}

const PERIOD_30_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function createSubscriptionService(
  prisma: PrismaClient,
  yookassa: YooKassaService
): SubscriptionService {
  return {
    async createSubscription(userId, planKey) {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { key: planKey },
      });

      if (!plan) throw new Error('Тариф не найден');
      if (!plan.isActive) throw new Error('Тариф неактивен');

      const existing = await prisma.userSubscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
          plan: { key: planKey },
        },
      });
      if (existing) throw new Error('У вас уже есть активная подписка на этот тариф');

      // Бесплатный тариф — сразу создаём активную подписку
      if (plan.price === 0) {
        const now = new Date();
        await prisma.userSubscription.create({
          data: {
            userId,
            planId: plan.id,
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: new Date(now.getTime() + PERIOD_30_DAYS_MS),
          },
        });
        return { checkoutUrl: `/dashboard/profile?subscription=success` };
      }

      // Создаём платёж в ЮKassa
      const payment = await yookassa.createPayment({
        amount: {
          value: plan.price.toFixed(2),
          currency: plan.currency,
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.NEXTAUTH_URL}/dashboard/profile?subscription=pending`,
        },
        description: `Подписка ${plan.name}`,
        metadata: {
          userId,
          planId: plan.id,
          type: 'SUBSCRIPTION',
        },
      });

      // Сохраняем запись о намерении подписки до получения webhook
      // Статус TRIALING означает «платёж создан, ожидаем подтверждения»
      const now = new Date();
      await prisma.userSubscription.create({
        data: {
          userId,
          planId: plan.id,
          status: 'TRIALING',
          providerId: payment.id,
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + PERIOD_30_DAYS_MS),
        },
      });

      return { checkoutUrl: payment.confirmation?.confirmation_url ?? '' };
    },

    async cancelSubscription(userId, subscriptionId) {
      const subscription = await prisma.userSubscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!subscription) throw new Error('Подписка не найдена');
      if (subscription.userId !== userId) throw new Error('Нет доступа');
      if (subscription.status !== 'ACTIVE') throw new Error('Нельзя отменить неактивную подписку');

      await prisma.userSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'CANCELED',
          canceledAt: new Date(),
        },
      });
    },

    async handleWebhook(payload) {
      const { event, object } = payload;

      if (!event || !object?.id) {
        throw new Error('Invalid webhook payload');
      }

      if (event === 'payment.succeeded') {
        const metadata = object.metadata;
        const userId = metadata?.userId;
        const planId = metadata?.planId;

        if (!userId || !planId) {
          console.warn(`[subscription] Webhook missing metadata for payment: ${object.id}`);
          return;
        }

        // Ищем существующую запись (созданную в createSubscription)
        const existing = await prisma.userSubscription.findFirst({
          where: { providerId: object.id },
        });

        const now = new Date();

        if (existing) {
          if (existing.status === 'ACTIVE') return; // Идемпотентность
          await prisma.userSubscription.update({
            where: { id: existing.id },
            data: {
              status: 'ACTIVE',
              currentPeriodStart: now,
              currentPeriodEnd: new Date(now.getTime() + PERIOD_30_DAYS_MS),
            },
          });
        } else {
          // Webhook пришёл раньше, чем createSubscription завершился (редко, но возможно)
          await prisma.userSubscription.create({
            data: {
              userId,
              planId,
              status: 'ACTIVE',
              providerId: object.id,
              currentPeriodStart: now,
              currentPeriodEnd: new Date(now.getTime() + PERIOD_30_DAYS_MS),
            },
          });
        }
      } else if (event === 'payment.canceled') {
        const existing = await prisma.userSubscription.findFirst({
          where: { providerId: object.id },
        });
        if (existing) {
          await prisma.userSubscription.update({
            where: { id: existing.id },
            data: { status: 'CANCELED', canceledAt: new Date() },
          });
        }
      }
    },

    async getUserSubscription(userId) {
      return prisma.userSubscription.findFirst({
        where: { userId, status: { in: ['ACTIVE', 'TRIALING'] } },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      }) as Promise<UserSubscriptionInfo | null>;
    },
  };
}
