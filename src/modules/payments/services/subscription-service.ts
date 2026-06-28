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

      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

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

      await prisma.userSubscription.create({
        data: {
          userId,
          planId: plan.id,
          status: 'PENDING' as any,
          providerId: payment.id,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
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

      const subscription = await prisma.userSubscription.findUnique({
        where: { providerId: object.id },
      });

      if (!subscription) {
        console.warn(`Webhook for unknown subscription: ${object.id}`);
        return;
      }

      if (event === 'payment.succeeded') {
        if (subscription.status === 'ACTIVE') return;

        const now = new Date();
        await prisma.userSubscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      } else if (event === 'payment.canceled') {
        await prisma.userSubscription.update({
          where: { id: subscription.id },
          data: { status: 'CANCELED' },
        });
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
