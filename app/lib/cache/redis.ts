// /app/lib/cache/redis.ts
import { createClient, RedisClientType } from 'redis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Compress large values
}

interface CacheEntry<T = any> {
  data: T;
  createdAt: number;
  ttl: number;
  tags: string[];
}

// In-memory fallback cache
class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private tags = new Map<string, Set<string>>();

  set<T>(key: string, value: T, options: CacheOptions = {}): boolean {
    const entry: CacheEntry<T> = {
      data: value,
      createdAt: Date.now(),
      ttl: options.ttl || 3600,
      tags: options.tags || [],
    };

    this.cache.set(key, entry);

    // Update tag references
    options.tags?.forEach((tag) => {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, new Set());
      }
      this.tags.get(tag)!.add(key);
    });

    return true;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const expiryTime = entry.createdAt + entry.ttl * 1000;

    if (now > expiryTime) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Remove from all tag sets
    entry.tags.forEach((tag) => {
      this.tags.get(tag)?.delete(key);
    });

    this.cache.delete(key);
    return true;
  }

  invalidateByTag(tag: string): number {
    const keys = this.tags.get(tag);
    if (!keys) return 0;

    keys.forEach((key) => this.cache.delete(key));
    this.tags.delete(tag);

    return keys.size;
  }

  clear(): boolean {
    this.cache.clear();
    this.tags.clear();
    return true;
  }

  size(): number {
    return this.cache.size;
  }
}

class RedisCache {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private memoryCache = new MemoryCache();

  constructor() {
    this.init();
  }

  private async init() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000,
        },
      });

      this.client.on('error', (err: Error) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to initialize Redis, using memory cache:', error);
      this.isConnected = false;
    }
  }

  private generateKey(prefix: string, key: string): string {
    return `${prefix}:${key}`;
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      // Always set in memory cache for faster access
      this.memoryCache.set(key, value, options);

      if (!this.client || !this.isConnected) {
        return true; // Memory cache fallback
      }

      const cacheKey = this.generateKey('cache', key);
      const entry: CacheEntry<T> = {
        data: value,
        createdAt: Date.now(),
        ttl: options.ttl || 3600,
        tags: options.tags || [],
      };

      const serializedValue = JSON.stringify(entry);

      if (options.ttl) {
        await this.client.setEx(cacheKey, options.ttl, serializedValue);
      } else {
        await this.client.set(cacheKey, serializedValue);
      }

      // Store tags for invalidation
      if (options.tags && options.tags.length > 0) {
        const tagPromises = options.tags.map(async (tag) => {
          const tagKey = this.generateKey('tags', tag);
          await this.client!.sAdd(tagKey, [cacheKey]);
        });
        await Promise.all(tagPromises);
      }

      return true;
    } catch (error) {
      console.error('Redis set error, using memory cache fallback:', error);
      return true; // Memory cache fallback
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      // Try memory cache first
      const memoryValue = this.memoryCache.get<T>(key);
      if (memoryValue !== null) {
        return memoryValue;
      }

      if (!this.client || !this.isConnected) {
        return null;
      }

      const cacheKey = this.generateKey('cache', key);
      const value = await this.client.get(cacheKey);

      if (!value) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(value);

      // Check if entry has expired
      const now = Date.now();
      const expiryTime = entry.createdAt + entry.ttl * 1000;

      if (now > expiryTime) {
        await this.delete(key);
        return null;
      }

      // Store in memory cache for faster future access
      this.memoryCache.set(key, entry.data, {
        ttl: entry.ttl,
        tags: entry.tags,
      });

      return entry.data;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      // Delete from both caches
      const memoryDeleted = this.memoryCache.delete(key);

      if (!this.client || !this.isConnected) {
        return memoryDeleted;
      }

      const cacheKey = this.generateKey('cache', key);
      const result = await this.client.del(cacheKey);

      // Remove from all tag sets
      const tagKeys = await this.client.keys('tags:*');
      if (tagKeys.length > 0) {
        await Promise.all(
          tagKeys.map(async (tagKey: string) => {
            await this.client!.sRem(tagKey, [cacheKey]);
          }),
        );
      }

      return result > 0 || memoryDeleted;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  async invalidateByTag(tag: string): Promise<number> {
    try {
      // Invalidate from both caches
      const memoryInvalidated = this.memoryCache.invalidateByTag(tag);

      if (!this.client || !this.isConnected) {
        return memoryInvalidated;
      }

      const tagKey = this.generateKey('tags', tag);
      const keys = await this.client.sMembers(tagKey);

      if (keys.length === 0) {
        return memoryInvalidated;
      }

      // Delete all tagged keys
      const deletePromises = keys.map((key: string) => this.client!.del(key));
      await Promise.all(deletePromises);

      // Remove the tag set itself
      await this.client.del(tagKey);

      return keys.length + memoryInvalidated;
    } catch (error) {
      console.error('Redis invalidateByTag error:', error);
      return 0;
    }
  }

  async clear(): Promise<boolean> {
    try {
      // Clear both caches
      const memoryCleared = this.memoryCache.clear();

      if (!this.client || !this.isConnected) {
        return memoryCleared;
      }

      // Clear all cache and tag keys
      const keys = await this.client.keys('cache:*');
      const tagKeys = await this.client.keys('tags:*');

      const allKeys = [...keys, ...tagKeys];

      if (allKeys.length > 0) {
        await this.client.del(allKeys);
      }

      return true;
    } catch (error) {
      console.error('Redis clear error:', error);
      return false;
    }
  }

  async getStats(): Promise<{
    connected: boolean;
    keys: number;
    tags: number;
    memory?: string;
  }> {
    try {
      if (!this.client || !this.isConnected) {
        return {
          connected: false,
          keys: 0,
          tags: 0,
        };
      }

      const keys = await this.client.dbSize();
      const tagKeys = await this.client.keys('tags:*');

      return {
        connected: true,
        keys,
        tags: tagKeys.length,
      };
    } catch (error) {
      console.error('Redis getStats error:', error);
      return {
        connected: false,
        keys: 0,
        tags: 0,
      };
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        return false;
      }

      await this.client.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      this.isConnected = false;
      return false;
    }
  }
}

// Singleton instance
let redisCacheInstance: RedisCache | null = null;

export function getRedisCache(): RedisCache {
  if (!redisCacheInstance) {
    redisCacheInstance = new RedisCache();
  }
  return redisCacheInstance;
}

// Convenience functions
export async function cacheSet<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
  return getRedisCache().set(key, value, options);
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  return getRedisCache().get<T>(key);
}

export async function cacheDelete(key: string): Promise<boolean> {
  return getRedisCache().delete(key);
}

export async function cacheInvalidateByTag(tag: string): Promise<number> {
  return getRedisCache().invalidateByTag(tag);
}

export async function cacheClear(): Promise<boolean> {
  return getRedisCache().clear();
}

export async function cacheHealthCheck(): Promise<boolean> {
  return getRedisCache().healthCheck();
}

// Export MemoryCache for advanced usage
export { MemoryCache };

// Type for cache statistics
export interface CacheStats {
  connected: boolean;
  keys: number;
  tags: number;
  memoryKeys: number;
  memory?: string;
}
