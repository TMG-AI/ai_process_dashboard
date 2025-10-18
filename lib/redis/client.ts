import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client
if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error('UPSTASH_REDIS_REST_URL is not defined');
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('UPSTASH_REDIS_REST_TOKEN is not defined');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Helper functions for common Redis operations

/**
 * Get a value from Redis
 */
export async function getRedisValue<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get<T>(key);
    return value;
  } catch (error) {
    console.error('Error getting Redis value:', error);
    return null;
  }
}

/**
 * Set a value in Redis
 */
export async function setRedisValue(
  key: string,
  value: unknown,
  expirationSeconds?: number
): Promise<boolean> {
  try {
    if (expirationSeconds) {
      await redis.setex(key, expirationSeconds, JSON.stringify(value));
    } else {
      await redis.set(key, JSON.stringify(value));
    }
    return true;
  } catch (error) {
    console.error('Error setting Redis value:', error);
    return false;
  }
}

/**
 * Delete a value from Redis
 */
export async function deleteRedisValue(key: string): Promise<boolean> {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Error deleting Redis value:', error);
    return false;
  }
}

/**
 * Get all keys matching a pattern
 */
export async function getRedisKeys(pattern: string): Promise<string[]> {
  try {
    const keys = await redis.keys(pattern);
    return keys;
  } catch (error) {
    console.error('Error getting Redis keys:', error);
    return [];
  }
}

/**
 * Check if a key exists in Redis
 */
export async function redisKeyExists(key: string): Promise<boolean> {
  try {
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error('Error checking Redis key existence:', error);
    return false;
  }
}
