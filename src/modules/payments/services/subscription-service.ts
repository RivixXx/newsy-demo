import { PrismaClient, SubscriptionStatus } from '@prisma/client';
import { YooKassaService } from './yookassa-service';

export interface SubscriptionService {
  createSubscription(userId: string, planKey: string): Promise<{ checkoutUrl: string }>;
  cancelSubscription(userId: string, subscriptionId: string): Promise<void>;
  handleWebhook(payload: any): Promise<void>;
  getUserSubscription(userId: string): Promise<any>;
}

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

      if (plan.price === 0) {
        const now = new Date();
        const subscription = await prisma.userSubscription.create({
          data: {
            userId,
            planId: plan.id,
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        });
        return { checkoutUrl: `/dashboard/profile?subscription=success` };
      }

      const payment = await yookassa.createPayment({
        amount: {
          value: plan.price.toFixed(2),
          currency: plan.currency,
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.NEXTAUTH_URL}/dashboard/profile?subscription=success`,
        },
        description: `Подписка ${plan.name} (ежемесячная)`,
        metadata: {
          userId,
          planId: plan.id,
          type: 'SUBSCRIPTION',
        },
      });

      return { checkoutUrl: payment.confirmation?.confirmation_url || '' };
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
          console.warn(`Webhook missing metadata for subscription: ${object.id}`);
          return;
        }

        const existing = await prisma.userSubscription.findFirst({
          where: { providerId: object.id },
        });

        if (existing) {
          if (existing.status === 'ACTIVE') return;
          const now = new Date();
          await prisma.userSubscription.update({
            where: { id: existing.id },
            data: {
              status: 'ACTIVE',
              currentPeriodStart: now,
              currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        } else {
          const now = new Date();
          await prisma.userSubscription.create({
            data: {
              userId,
              planId,
              status: 'ACTIVE',
              providerId: object.id,
              currentPeriodStart: now,
              currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
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
            data: { status: 'CANCELED' },
          });
        }
      }
    },

    async getUserSubscription(userId) {
      return prisma.userSubscription.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      });
    },
  };
}
