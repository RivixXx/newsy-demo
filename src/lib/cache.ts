import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (!redisUrl || !redisToken) return null;
  
  if (!redisClient) {
    redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
    });
  }
  return redisClient;
}

export async function getCached<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;
  
  try {
    const data = await client.get(key);
    return data as T | null;
  } catch (err) {
    console.error('[cache] Redis get error:', err);
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  
  try {
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    console.error('[cache] Redis set error:', err);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (err) {
    console.error('[cache] Redis invalidate error:', err);
  }
}

export const cacheKeys = {
  challengesList: (page: number, limit: number, filters: string) => 
    `challenges:list:${page}:${limit}:${filters}`,
  challengeDetail: (id: string) => `challenge:detail:${id}`,
  userSession: (sessionId: string) => `session:${sessionId}`,
};

export const CACHE_TTL = {
  short: 60,        // 1 minute
  medium: 300,      // 5 minutes
  long: 3600,       // 1 hour
  veryLong: 86400,  // 24 hours
};