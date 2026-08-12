import { vi } from 'vitest';

vi.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    challenge: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    organizer: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
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
    passwordResetToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    emailVerificationToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    revokedSession: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    userProgress: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(mockPrisma)),
  };

  return {
    PrismaClient: vi.fn(() => mockPrisma),
    UserStatus: { ACTIVE: 'ACTIVE', PENDING: 'PENDING', SUSPENDED: 'SUSPENDED', DELETED: 'DELETED' },
    ChallengeStatus: { DRAFT: 'DRAFT', PUBLISHED: 'PUBLISHED', ONGOING: 'ONGOING', COMPLETED: 'COMPLETED', ARCHIVED: 'ARCHIVED', PENDING_REVIEW: 'PENDING_REVIEW' },
    ChallengeFormat: { ONLINE: 'ONLINE', OFFLINE: 'OFFLINE', HYBRID: 'HYBRID' },
    ChallengeType: { OPEN: 'OPEN', CLOSED: 'CLOSED' },
    CancellationPolicy: { FULL_REFUND_24H: 'FULL_REFUND_24H', FULL_REFUND_7D: 'FULL_REFUND_7D', NO_REFUND: 'NO_REFUND' },
    OrganizerType: { BRAND: 'BRAND', INFLUENCER: 'INFLUENCER', NGO: 'NGO', GOVERNMENT: 'GOVERNMENT', OTHER: 'OTHER' },
    OrganizerStatus: { ACTIVE: 'ACTIVE', PENDING: 'PENDING', SUSPENDED: 'SUSPENDED', DELETED: 'DELETED' },
    OrganizerMemberRole: { OWNER: 'OWNER', ADMIN: 'ADMIN', MEMBER: 'MEMBER' },
    OrganizerMemberStatus: { ACTIVE: 'ACTIVE', INVITED: 'INVITED', SUSPENDED: 'SUSPENDED', REMOVED: 'REMOVED' },
    UserProgressStatus: { JOINED: 'JOINED', IN_PROGRESS: 'IN_PROGRESS', COMPLETED: 'COMPLETED', FAILED: 'FAILED', WITHDRAWN: 'WITHDRAWN' },
    StepProgressStatus: { PENDING: 'PENDING', SUBMITTED: 'SUBMITTED', APPROVED: 'APPROVED', REJECTED: 'REJECTED' },
    MediaType: { IMAGE: 'IMAGE', VIDEO: 'VIDEO', DOCUMENT: 'DOCUMENT' },
    TransactionStatus: { PENDING: 'PENDING', SUCCEEDED: 'SUCCEEDED', FAILED: 'FAILED', CANCELED: 'CANCELED', REFUNDED: 'REFUNDED' },
    SubscriptionStatus: { ACTIVE: 'ACTIVE', CANCELED: 'CANCELED', PAST_DUE: 'PAST_DUE', TRIALING: 'TRIALING' },
    SubscriptionInterval: { MONTHLY: 'MONTHLY', YEARLY: 'YEARLY' },
    AccountType: { INDIVIDUAL: 'INDIVIDUAL', IP: 'IP', OOO: 'OOO', AO: 'AO', SELF_EMPLOYED: 'SELF_EMPLOYED' },
  };
});

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: vi.fn(() => ({
      get: vi.fn(),
      setex: vi.fn(),
      del: vi.fn(),
      keys: vi.fn(),
    })),
  },
}));

vi.mock('@upstash/ratelimit', () => {
  const Ratelimit = Object.assign(vi.fn().mockImplementation(function () {
    return {
      limit: vi.fn().mockResolvedValue({ success: true, remaining: 100, reset: Date.now() + 60000 }),
    };
  }), {
    slidingWindow: vi.fn(),
    fixedWindow: vi.fn(),
  });
  return {
    Ratelimit,
    slidingWindow: vi.fn(),
    fixedWindow: vi.fn(),
  };
});

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        id: 'pi_test123',
        client_secret: 'pi_test123_secret',
        status: 'requires_payment_method',
        metadata: {},
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'pi_test123',
        status: 'succeeded',
        metadata: { challengeId: 'challenge-1', userId: 'user-1', type: 'PUBLISH_CHALLENGE' },
      }),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  })),
}));

process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.UPSTASH_REDIS_REST_URL = 'http://localhost:8079';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';