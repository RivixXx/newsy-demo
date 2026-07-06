/**
 * In-memory rate limiter.
 *
 * ⚠️ ВАЖНО: В serverless/multi-instance окружении (Vercel, Railway и т.д.)
 * каждый инстанс имеет отдельную Map, поэтому ограничения не работают глобально.
 *
 * Для production необходимо заменить на Redis/Upstash:
 * @see https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 *
 * Пример замены:
 * ```ts
 * import { Ratelimit } from '@upstash/ratelimit';
 * import { Redis } from '@upstash/redis';
 *
 * const ratelimit = new Ratelimit({
 *   redis: Redis.fromEnv(),
 *   limiter: Ratelimit.slidingWindow(10, '10 s'),
 * });
 * ```
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

// Очищаем устаревшие записи каждую минуту
setInterval(cleanup, 60_000).unref?.();

// Предупреждаем в production о ненадёжности in-memory rate limiter
if (process.env.NODE_ENV === 'production' && !process.env.UPSTASH_REDIS_REST_URL) {
  console.warn(
    '[rate-limit] WARNING: Using in-memory rate limiter in production. ' +
      'This does NOT work correctly in serverless/multi-instance environments. ' +
      'Please configure UPSTASH_REDIS_REST_URL for distributed rate limiting.'
  );
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export function rateLimit(
  key: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.max - 1, retryAfterMs: 0 };
  }

  entry.count++;

  if (entry.count > config.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: entry.resetAt - now,
    };
  }

  return {
    allowed: true,
    remaining: config.max - entry.count,
    retryAfterMs: 0,
  };
}
