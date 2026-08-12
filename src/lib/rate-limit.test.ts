import { describe, it, expect, vi, afterEach } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';
import { Ratelimit } from '@upstash/ratelimit';

function limitMock(result: { success: boolean; remaining: number; reset: number }) {
  return vi.fn().mockImplementation(function () {
    return { limit: vi.fn().mockResolvedValue(result) };
  });
}

describe('rateLimit', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('allows when Redis is configured and the limiter permits', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'http://localhost:8079');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token');
    vi.stubEnv('NODE_ENV', 'production');

    vi.mocked(Ratelimit).mockImplementationOnce(
      limitMock({ success: true, remaining: 4, reset: Date.now() + 60_000 })
    );

    const result = await rateLimit('login:test', { windowMs: 11_000, max: 5 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('denies when the limiter says no', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'http://localhost:8079');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token');
    vi.stubEnv('NODE_ENV', 'production');

    vi.mocked(Ratelimit).mockImplementationOnce(
      limitMock({ success: false, remaining: 0, reset: Date.now() + 30_000 })
    );

    const result = await rateLimit('login:test', { windowMs: 12_000, max: 5 });
    expect(result.allowed).toBe(false);
  });

  it('fails closed when Upstash throws (no silent allow-all)', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'http://localhost:8079');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token');
    vi.stubEnv('NODE_ENV', 'production');

    vi.mocked(Ratelimit).mockImplementationOnce(
      vi.fn().mockImplementation(function () {
        return { limit: vi.fn().mockRejectedValue(new Error('redis is down')) };
      })
    );

    const result = await rateLimit('2fa-login:user', { windowMs: 300_000, max: 5 });
    expect(result.allowed).toBe(false);
  });

  it('fails closed in production when Redis is not configured', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubEnv('NODE_ENV', 'production');

    const result = await rateLimit('login:test', { windowMs: 13_000, max: 5 });
    expect(result.allowed).toBe(false);
  });

  it('allows everything outside production when Redis is not configured (dev mode)', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubEnv('NODE_ENV', 'development');

    const result = await rateLimit('login:test', { windowMs: 14_000, max: 5 });
    expect(result.allowed).toBe(true);
  });
});