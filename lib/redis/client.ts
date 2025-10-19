import { Redis } from '@upstash/redis';

// Check if valid Redis credentials are configured
function hasValidRedisConfig(): boolean {
  return !!(
    process.env.AI_KV_REST_API_URL &&
    process.env.AI_KV_REST_API_TOKEN &&
    process.env.AI_KV_REST_API_URL.startsWith('https://') &&
    !process.env.AI_KV_REST_API_URL.includes('your_url_here')
  );
}

// Lazy initialization - only create Redis client when actually needed
let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!redisClient) {
    if (!hasValidRedisConfig()) {
      throw new Error(
        'Redis not configured. Please set AI_KV_REST_API_URL and AI_KV_REST_API_TOKEN in .env.local\n' +
        'Get credentials from: https://console.upstash.com/'
      );
    }

    redisClient = new Redis({
      url: process.env.AI_KV_REST_API_URL!,
      token: process.env.AI_KV_REST_API_TOKEN!,
    });
  }

  return redisClient;
}

// Export a Proxy that lazily initializes the Redis client
// This allows the app to build even without Redis credentials
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const client = getRedisClient();
    const value = client[prop as keyof Redis];

    // Bind methods to the client instance
    if (typeof value === 'function') {
      return value.bind(client);
    }

    return value;
  },
});

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
