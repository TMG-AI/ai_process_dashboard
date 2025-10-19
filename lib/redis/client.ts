import { Redis } from '@upstash/redis';

// Check if valid Redis credentials are configured
const hasValidRedisConfig =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  process.env.UPSTASH_REDIS_REST_URL.startsWith('https://') &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('your_url_here');

if (!hasValidRedisConfig && typeof window !== 'undefined') {
  // Only throw error at runtime, not during build
  throw new Error('Missing Upstash Redis environment variables');
}

export const redis = (hasValidRedisConfig
  ? Redis.fromEnv()
  : null) as Redis; // Placeholder during build - will be properly initialized in production

// Health check function
export async function pingRedis(): Promise<boolean> {
  try {
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis connection failed:', error);
    return false;
  }
}
