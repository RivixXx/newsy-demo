/**
 * Rate limiter with Upstash Redis.
 *
 * Behaviour:
 * - Redis configured: enforce limits. On Upstash errors the request is DENIED
 *   (fail-closed) — a silent "allow all" on infra failure would leave auth
 *   flows (login, 2FA) open to brute-force.
 * - Redis NOT configured:
 *   - `production` → DENY (someone forgot to configure Upstash); brute-force
 *     protection must never silently switch off in production.
 *   - any other env (dev/test) → allow all so local development keeps working.
 *
 * @see https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  /** Keep low-risk flows available if Redis is temporarily unavailable. */
  failOpen?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

// Cache limiters by window to avoid creating new instances
const limiterCache = new Map<string, Ratelimit>();

function normalizeEnvValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let normalized = value.trim();
  while (normalized.length >= 2 && ((normalized.startsWith('"') && normalized.endsWith('"')) || (normalized.startsWith("'") && normalized.endsWith("'")))) {
    normalized = normalized.slice(1, -1).trim();
  }
  return normalized || undefined;
}

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

function deny(retryAfterMs: number): RateLimitResult {
  return { allowed: false, remaining: 0, retryAfterMs };
}

export async function rateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const url = normalizeEnvValue(process.env.UPSTASH_REDIS_REST_URL);
  const token = normalizeEnvValue(process.env.UPSTASH_REDIS_REST_TOKEN);
  const isProduction = process.env.NODE_ENV === 'production';

  if (url && token) {
    try {
      // Redis.fromEnv reads process.env directly, so normalize accidental
      // dashboard quotes before constructing the SDK client.
      process.env.UPSTASH_REDIS_REST_URL = url;
      process.env.UPSTASH_REDIS_REST_TOKEN = token;
      const limiter = getLimiter(config.windowMs, config.max);
      const { success, remaining, reset } = await limiter.limit(key);
      return {
        allowed: success,
        remaining,
        retryAfterMs: success ? 0 : reset - Date.now(),
      };
    } catch (err) {
      console.error('[rate-limit] Upstash error:', err);
      if (config.failOpen) {
        return { allowed: true, remaining: config.max, retryAfterMs: 0 };
      }
      return deny(config.windowMs);
    }
  }

  if (isProduction) {
    console.error(
      '[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN are not set in production — ' +
        'request denied to keep brute-force protection active.',
    );
    if (config.failOpen) {
      return { allowed: true, remaining: config.max, retryAfterMs: 0 };
    }
    return deny(config.windowMs);
  }

  // Redis not configured outside production — skip rate limiting in dev/test
  return { allowed: true, remaining: config.max, retryAfterMs: 0 };
}
