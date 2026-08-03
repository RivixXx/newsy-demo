/**
 * Rate limiter with Upstash Redis.
 *
 * When Redis env vars are not set (dev mode), rate limiting is skipped
 * and all requests are allowed. A warning is logged to stderr.
 *
 * @see https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

// Cache limiters by window to avoid creating new instances
const limiterCache = new Map<string, Ratelimit>();

function getLimiter(windowMs: number, max: number): Ratelimit {
  const cacheKey = `${windowMs}:${max}`;
  if (limiterCache.has(cacheKey)) return limiterCache.get(cacheKey)!;

  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(max, `${windowMs} ms`),
    analytics: false,
    prefix: `ratelimit:${cacheKey}`,
  });

  limiterCache.set(cacheKey, limiter);
  return limiter;
}

export async function rateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const limiter = getLimiter(config.windowMs, config.max);
      const { success, remaining, reset } = await limiter.limit(key);
      return {
        allowed: success,
        remaining,
        retryAfterMs: success ? 0 : reset - Date.now(),
      };
    } catch (err) {
      console.error('[rate-limit] Upstash error, rate limiting is skipped:', err);
    }
  }

  // Redis not configured — skip rate limiting in dev
  console.warn('[rate-limit] REDIS_URL not set, rate limiting is disabled — allowing all requests.');
  return { allowed: true, remaining: config.max, retryAfterMs: 0 };
}
