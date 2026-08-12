import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPaymentService } from '@/modules/payments/services/payment-service';
import { OrganizerMemberRole } from '@prisma/client';
import type { PaymentResponse } from '@/modules/payments/types';

describe('PaymentService', () => {
  let mockPrisma: any;
  let mockStripeService: any;
  let paymentService: ReturnType<typeof createPaymentService>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockPrisma = {
      challenge: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      organizerMember: {
        findUnique: vi.fn(),
      },
      paymentTransaction: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        deleteMany: vi.fn(),
      },
      $transaction: vi.fn(async (operationsOrCb: any) => {
      if (typeof operationsOrCb === 'function') {
        return operationsOrCb(mockPrisma);
      }
      // Handle array of Prisma Promise operations (e.g., [prisma.a.update(), prisma.b.update()])
      if (Array.isArray(operationsOrCb)) {
        return Promise.all(operationsOrCb);
      }
      return operationsOrCb;
    }),
    };

    mockStripeService = {
      createPaymentIntent: vi.fn().mockResolvedValue({
        paymentIntentId: 'pi_test123',
        clientSecret: 'pi_test123_secret',
      }),
      getPaymentIntent: vi.fn().mockResolvedValue({
        id: 'pi_test123',
        status: 'requires_payment_method',
        metadata: {},
      }),
    };

    paymentService = createPaymentService(mockPrisma, mockStripeService);
  });

  describe('initiatePublishPayment', () => {
    it('should throw error when challenge not found', async () => {
      mockPrisma.challenge.findUnique.mockResolvedValue(null);

      await expect(
        paymentService.initiatePublishPayment('challenge-1', 'user-1')
      ).rejects.toThrow('Челлендж не найден');
    });

    it('should throw error when challenge is not a draft', async () => {
      mockPrisma.challenge.findUnique.mockResolvedValue({
        id: 'challenge-1',
        status: 'PUBLISHED',
        publishPrice: 1000,
        organizerId: 'org-1',
        title: 'Test Challenge',
      });

      await expect(
        paymentService.initiatePublishPayment('challenge-1', 'user-1')
      ).rejects.toThrow('Публикация доступна только для черновиков');
    });

    it('should throw error when user is not an organizer member', async () => {
      mockPrisma.challenge.findUnique.mockResolvedValue({
        id: 'challenge-1',
        status: 'DRAFT',
        publishPrice: 1000,
        organizerId: 'org-1',
        title: 'Test Challenge',
      });
      mockPrisma.organizerMember.findUnique.mockResolvedValue(null);

      await expect(
        paymentService.initiatePublishPayment('challenge-1', 'user-1')
      ).rejects.toThrow('Нет прав для публикации этого челленджа');
    });

    it('should throw error when user has insufficient role', async () => {
      mockPrisma.challenge.findUnique.mockResolvedValue({
        id: 'challenge-1',
        status: 'DRAFT',
        publishPrice: 1000,
        organizerId: 'org-1',
        title: 'Test Challenge',
      });
      mockPrisma.organizerMember.findUnique.mockResolvedValue({
        roleInOrganizer: OrganizerMemberRole.MEMBER,
        status: 'ACTIVE',
        deletedAt: null,
      });

      await expect(
        paymentService.initiatePublishPayment('challenge-1', 'user-1')
      ).rejects.toThrow('Нет прав для публикации этого челленджа');
    });

    it('should allow OWNER to initiate payment', async () => {
      mockPrisma.challenge.findUnique.mockResolvedValue({
        id: 'challenge-1',
        status: 'DRAFT',
        publishPrice: 1000,
        organizerId: 'org-1',
        title: 'Test Challenge',
      });
      mockPrisma.organizerMember.findUnique.mockResolvedValue({
        roleInOrganizer: OrganizerMemberRole.OWNER,
        status: 'ACTIVE',
        deletedAt: null,
      });
      mockPrisma.paymentTransaction.findFirst.mockResolvedValue(null);

      const result = await paymentService.initiatePublishPayment('challenge-1', 'user-1');

      expect(result.checkoutUrl).toContain('paymentIntent=pi_test123');
      expect(mockStripeService.createPaymentIntent).toHaveBeenCalled();
    });

    it('should allow ADMIN to initiate payment', async () => {
      mockPrisma.challenge.findUnique.mockResolvedValue({
        id: 'challenge-1',
        status: 'DRAFT',
        publishPrice: 1000,
        organizerId: 'org-1',
        title: 'Test Challenge',
      });
      mockPrisma.organizerMember.findUnique.mockResolvedValue({
        roleInOrganizer: OrganizerMemberRole.ADMIN,
        status: 'ACTIVE',
        deletedAt: null,
      });
      mockPrisma.paymentTransaction.findFirst.mockResolvedValue(null);

      const result = await paymentService.initiatePublishPayment('challenge-1', 'user-1');

      expect(result.checkoutUrl).toContain('paymentIntent=pi_test123');
    });

    it('should publish immediately when price is 0', async () => {
      mockPrisma.challenge.findUnique.mockResolvedValue({
        id: 'challenge-1',
        status: 'DRAFT',
        publishPrice: 0,
        organizerId: 'org-1',
        title: 'Test Challenge',
      });
      mockPrisma.organizerMember.findUnique.mockResolvedValue({
        roleInOrganizer: OrganizerMemberRole.OWNER,
        status: 'ACTIVE',
        deletedAt: null,
      });

      const result = await paymentService.initiatePublishPayment('challenge-1', 'user-1');

      expect(result.checkoutUrl).toContain('status=success');
      expect(mockPrisma.challenge.update).toHaveBeenCalledWith({
        where: { id: 'challenge-1' },
        data: { status: 'PUBLISHED' },
      });
    });

    it('should reuse existing pending payment intent', async () => {
      mockPrisma.challenge.findUnique.mockResolvedValue({
        id: 'challenge-1',
        status: 'DRAFT',
        publishPrice: 1000,
        organizerId: 'org-1',
        title: 'Test Challenge',
      });
      mockPrisma.organizerMember.findUnique.mockResolvedValue({
        roleInOrganizer: OrganizerMemberRole.OWNER,
        status: 'ACTIVE',
        deletedAt: null,
      });
      mockPrisma.paymentTransaction.findFirst.mockResolvedValue({
        id: 'txn-1',
        providerId: 'pi_existing',
        status: 'PENDING',
      });
      mockStripeService.getPaymentIntent.mockResolvedValue({
        id: 'pi_existing',
        status: 'requires_payment_method',
        metadata: { challengeId: 'challenge-1' },
      });

      const result = await paymentService.initiatePublishPayment('challenge-1', 'user-1');

      expect(result.isExisting).toBe(true);
      expect(result.checkoutUrl).toContain('pi_existing');
    });
  });

  describe('handleWebhook', () => {
    const createMockObject = (id: string, status: PaymentResponse['status'] = 'succeeded') => ({
      id,
      status,
      amount: { value: '1000', currency: 'RUB' },
      created_at: new Date().toISOString(),
      metadata: {},
    });

    it('should ignore invalid payload', async () => {
      await paymentService.handleWebhook({ event: 'payment.succeeded', type: 'notification', object: createMockObject('pi_test') } as any);
      // Should not throw
    });

    it('should ignore webhook for unknown payment', async () => {
      mockPrisma.paymentTransaction.findUnique.mockResolvedValue(null);

      await paymentService.handleWebhook({
        event: 'payment.succeeded',
        type: 'notification',
        object: createMockObject('pi_unknown'),
      });

      // Should not throw, just log warning
    });

    it('should handle payment.succeeded', async () => {
      mockPrisma.paymentTransaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        challengeId: 'challenge-1',
        status: 'PENDING',
      });

      await paymentService.handleWebhook({
        event: 'payment.succeeded',
        type: 'notification',
        object: createMockObject('pi_test'),
      });

      expect(mockPrisma.paymentTransaction.update).toHaveBeenCalledWith({
        where: { id: 'txn-1' },
        data: { status: 'SUCCEEDED' },
      });
      expect(mockPrisma.challenge.update).toHaveBeenCalledWith({
        where: { id: 'challenge-1' },
        data: { status: 'PUBLISHED' },
      });
    });

    it('should handle payment.canceled', async () => {
      mockPrisma.paymentTransaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'PENDING',
      });

      await paymentService.handleWebhook({
        event: 'payment.canceled',
        type: 'notification',
        object: createMockObject('pi_test', 'canceled'),
      });

      expect(mockPrisma.paymentTransaction.update).toHaveBeenCalledWith({
        where: { id: 'txn-1' },
        data: { status: 'CANCELED' },
      });
    });

    it('should handle payment_intent.payment_failed', async () => {
      mockPrisma.paymentTransaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'PENDING',
      });

      await paymentService.handleWebhook({
        event: 'payment_intent.payment_failed',
        type: 'notification',
        object: createMockObject('pi_test', 'canceled'),
      });

      expect(mockPrisma.paymentTransaction.update).toHaveBeenCalledWith({
        where: { id: 'txn-1' },
        data: { status: 'FAILED' },
      });
    });

    it('should handle charge.refunded', async () => {
      mockPrisma.paymentTransaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'SUCCEEDED',
      });

      await paymentService.handleWebhook({
        event: 'charge.refunded',
        type: 'notification',
        object: createMockObject('pi_test', 'succeeded'),
      });

      expect(mockPrisma.paymentTransaction.update).toHaveBeenCalledWith({
        where: { id: 'txn-1' },
        data: { status: 'REFUNDED' },
      });
    });

    it('should not double-process succeeded payment', async () => {
      mockPrisma.paymentTransaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'SUCCEEDED',
      });

      await paymentService.handleWebhook({
        event: 'payment.succeeded',
        type: 'notification',
        object: createMockObject('pi_test', 'succeeded'),
      });

      expect(mockPrisma.paymentTransaction.update).not.toHaveBeenCalled();
    });
  });
});