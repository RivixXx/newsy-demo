import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSubscriptionService } from '@/modules/payments/services/subscription-service';
import { SubscriptionStatus, SubscriptionInterval } from '@prisma/client';

describe('SubscriptionService', () => {
  let mockPrisma: any;
  let mockStripeService: any;
  let subscriptionService: ReturnType<typeof createSubscriptionService>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockPrisma = {
      subscriptionPlan: {
        findUnique: vi.fn(),
      },
      userSubscription: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(async (cb: any) => cb(mockPrisma)),
    };

    mockStripeService = {
      createPaymentIntent: vi.fn().mockResolvedValue({
        paymentIntentId: 'pi_sub123',
        clientSecret: 'pi_sub123_secret',
        checkoutUrl: 'https://checkout.stripe.com/c/pay_sub123',
      }),
      getPaymentIntent: vi.fn().mockResolvedValue({
        id: 'pi_sub123',
        status: 'succeeded',
        metadata: { userId: 'user-1', planId: 'plan-1', type: 'SUBSCRIPTION' },
      }),
      cancelSubscription: vi.fn().mockResolvedValue(undefined),
    };

    subscriptionService = createSubscriptionService(mockPrisma, mockStripeService);
  });

  describe('createSubscription', () => {
    it('should throw error when plan not found', async () => {
      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(null);

      await expect(
        subscriptionService.createSubscription('user-1', 'nonexistent')
      ).rejects.toThrow('Тариф не найден');
    });

    it('should throw error when plan is inactive', async () => {
      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue({
        id: 'plan-1',
        key: 'basic',
        isActive: false,
      });

      await expect(
        subscriptionService.createSubscription('user-1', 'basic')
      ).rejects.toThrow('Тариф неактивен');
    });

    it('should throw error when user already has active subscription', async () => {
      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue({
        id: 'plan-1',
        key: 'basic',
        isActive: true,
        price: 1000,
      });
      mockPrisma.userSubscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        status: SubscriptionStatus.ACTIVE,
      });

      await expect(
        subscriptionService.createSubscription('user-1', 'basic')
      ).rejects.toThrow('У вас уже есть активная подписка на этот тариф');
    });

    it('should create free subscription immediately active', async () => {
      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue({
        id: 'plan-1',
        key: 'free',
        isActive: true,
        price: 0,
      });
      mockPrisma.userSubscription.findFirst.mockResolvedValue(null);

      const result = await subscriptionService.createSubscription('user-1', 'free');

      expect(result.checkoutUrl).toContain('subscription=success');
      expect(mockPrisma.userSubscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          planId: 'plan-1',
          status: SubscriptionStatus.ACTIVE,
        }),
      });
    });

    it('should create paid subscription with Stripe payment intent', async () => {
      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue({
        id: 'plan-1',
        key: 'premium',
        isActive: true,
        price: 2990,
        currency: 'RUB',
        name: 'Premium',
      });
      mockPrisma.userSubscription.findFirst.mockResolvedValue(null);

      const result = await subscriptionService.createSubscription('user-1', 'premium');

      expect(result.checkoutUrl).toBe('https://checkout.stripe.com/c/pay_sub123');
      expect(mockStripeService.createPaymentIntent).toHaveBeenCalled();
      expect(mockPrisma.userSubscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          planId: 'plan-1',
          status: SubscriptionStatus.TRIALING,
          providerId: 'pi_sub123',
        }),
      });
    });
  });

  describe('cancelSubscription', () => {
    it('should throw error when subscription not found', async () => {
      mockPrisma.userSubscription.findUnique.mockResolvedValue(null);

      await expect(
        subscriptionService.cancelSubscription('user-1', 'sub-1')
      ).rejects.toThrow('Подписка не найдена');
    });

    it('should throw error when user does not own subscription', async () => {
      mockPrisma.userSubscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        userId: 'other-user',
        status: SubscriptionStatus.ACTIVE,
      });

      await expect(
        subscriptionService.cancelSubscription('user-1', 'sub-1')
      ).rejects.toThrow('Нет доступа');
    });

    it('should throw error when subscription is not active', async () => {
      mockPrisma.userSubscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        status: SubscriptionStatus.CANCELED,
      });

      await expect(
        subscriptionService.cancelSubscription('user-1', 'sub-1')
      ).rejects.toThrow('Нельзя отменить неактивную подписку');
    });

    it('should cancel active subscription', async () => {
      mockPrisma.userSubscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        status: SubscriptionStatus.ACTIVE,
        providerId: 'cs_sub123',
      });

      await subscriptionService.cancelSubscription('user-1', 'sub-1');

      expect(mockStripeService.cancelSubscription).toHaveBeenCalledWith('cs_sub123');

      expect(mockPrisma.userSubscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: {
          status: SubscriptionStatus.CANCELED,
          canceledAt: expect.any(Date),
        },
      });
    });
  });

  describe('handleWebhook', () => {
const createMockObject = (id: string, metadata: Record<string, string> = { userId: 'user-1', planId: 'plan-1' }) => ({
  id,
  status: 'succeeded' as const,
  amount: { value: '1000', currency: 'RUB' },
  created_at: new Date().toISOString(),
  metadata,
});

    it('should ignore invalid payload', async () => {
      await subscriptionService.handleWebhook({ 
        event: 'payment.succeeded', 
        type: 'notification', 
        object: createMockObject('pi_test') 
      } as any);
    });

    it('should handle payment.succeeded for subscription', async () => {
      mockPrisma.userSubscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        status: SubscriptionStatus.TRIALING,
      });

      await subscriptionService.handleWebhook({
        event: 'payment.succeeded',
        type: 'notification',
        object: createMockObject('pi_sub123'),
      });

      expect(mockPrisma.userSubscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: expect.objectContaining({
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: expect.any(Date),
          currentPeriodEnd: expect.any(Date),
        }),
      });
    });

    it('should create new subscription if none exists', async () => {
      mockPrisma.userSubscription.findFirst
        .mockResolvedValueOnce(null) // existing by providerId
        .mockResolvedValueOnce(null); // existing active for user

      mockPrisma.userSubscription.create.mockResolvedValue({});

      await subscriptionService.handleWebhook({
        event: 'payment.succeeded',
        type: 'notification',
        object: createMockObject('pi_sub123'),
      });

      expect(mockPrisma.userSubscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          planId: 'plan-1',
          status: SubscriptionStatus.ACTIVE,
          providerId: 'pi_sub123',
        }),
      });
    });

    it('should handle payment.canceled', async () => {
      mockPrisma.userSubscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        status: SubscriptionStatus.TRIALING,
      });

      await subscriptionService.handleWebhook({
        event: 'payment.canceled',
        type: 'notification',
        object: createMockObject('pi_sub123'),
      });

      expect(mockPrisma.userSubscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: {
          status: SubscriptionStatus.CANCELED,
          canceledAt: expect.any(Date),
        },
      });
    });
  });

  describe('getUserSubscription', () => {
    it('should return active subscription', async () => {
      const mockSub = {
        id: 'sub-1',
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        canceledAt: null,
        plan: {
          id: 'plan-1',
          key: 'premium',
          name: 'Premium',
          price: 2990,
          currency: 'RUB',
          interval: SubscriptionInterval.MONTHLY,
          features: {},
          isActive: true,
        },
      };
      mockPrisma.userSubscription.findFirst.mockResolvedValue(mockSub);

      const result = await subscriptionService.getUserSubscription('user-1');

      expect(result).toEqual(mockSub);
    });

    it('should return null when no active subscription', async () => {
      mockPrisma.userSubscription.findFirst.mockResolvedValue(null);

      const result = await subscriptionService.getUserSubscription('user-1');

      expect(result).toBeNull();
    });
  });
});
