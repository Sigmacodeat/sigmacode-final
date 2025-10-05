// /app/lib/rate-limiting/redis-rate-limiter.ts
import { getRedisCache } from '@/app/lib/cache/redis';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  blockDurationMs?: number; // How long to block after limit exceeded
}

interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: number;
  retryAfter: number;
}

interface RateLimitEntry {
  requests: number;
  resetTime: number;
  blockedUntil?: number;
}

export class RedisRateLimiter {
  private cache = getRedisCache();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkRateLimit(
    identifier: string,
    config?: Partial<RateLimitConfig>,
  ): Promise<RateLimitResult> {
    const effectiveConfig = { ...this.config, ...config };
    const now = Date.now();
    const key = `rate_limit:${identifier}`;

    try {
      // Get current rate limit data
      const existingData = await this.cache.get<RateLimitEntry>(key);

      if (!existingData) {
        // First request from this identifier
        const newEntry: RateLimitEntry = {
          requests: 1,
          resetTime: now + effectiveConfig.windowMs,
        };

        await this.cache.set(key, newEntry, {
          ttl: Math.ceil(effectiveConfig.windowMs / 1000),
        });

        return {
          allowed: true,
          remainingRequests: effectiveConfig.maxRequests - 1,
          resetTime: newEntry.resetTime,
          retryAfter: 0,
        };
      }

      // Check if currently blocked
      if (existingData.blockedUntil && now < existingData.blockedUntil) {
        return {
          allowed: false,
          remainingRequests: 0,
          resetTime: existingData.blockedUntil,
          retryAfter: Math.ceil((existingData.blockedUntil - now) / 1000),
        };
      }

      // Check if window has reset
      if (now > existingData.resetTime) {
        const newEntry: RateLimitEntry = {
          requests: 1,
          resetTime: now + effectiveConfig.windowMs,
        };

        await this.cache.set(key, newEntry, {
          ttl: Math.ceil(effectiveConfig.windowMs / 1000),
        });

        return {
          allowed: true,
          remainingRequests: effectiveConfig.maxRequests - 1,
          resetTime: newEntry.resetTime,
          retryAfter: 0,
        };
      }

      // Check if still under limit
      if (existingData.requests < effectiveConfig.maxRequests) {
        existingData.requests++;

        await this.cache.set(key, existingData, {
          ttl: Math.ceil((existingData.resetTime - now) / 1000),
        });

        return {
          allowed: true,
          remainingRequests: effectiveConfig.maxRequests - existingData.requests,
          resetTime: existingData.resetTime,
          retryAfter: 0,
        };
      }

      // Rate limit exceeded
      const blockDuration = effectiveConfig.blockDurationMs || effectiveConfig.windowMs;
      const blockedUntil = now + blockDuration;

      const updatedEntry: RateLimitEntry = {
        ...existingData,
        blockedUntil,
      };

      await this.cache.set(key, updatedEntry, {
        ttl: Math.ceil(blockDuration / 1000),
      });

      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: blockedUntil,
        retryAfter: Math.ceil(blockDuration / 1000),
      };
    } catch (error) {
      console.error('Rate limit check error:', error);

      // Fail open: allow request if we can't check rate limit
      return {
        allowed: true,
        remainingRequests: 1,
        resetTime: now + effectiveConfig.windowMs,
        retryAfter: 0,
      };
    }
  }

  async getRateLimitStatus(identifier: string): Promise<RateLimitEntry | null> {
    return this.cache.get<RateLimitEntry>(`rate_limit:${identifier}`);
  }

  async resetRateLimit(identifier: string): Promise<boolean> {
    return this.cache.delete(`rate_limit:${identifier}`);
  }

  async getRateLimitStats(): Promise<{
    totalEntries: number;
    blockedEntries: number;
  }> {
    try {
      // This is a simplified implementation
      // In production, you'd want to aggregate stats from Redis
      return {
        totalEntries: 0, // Would need to implement proper stats collection
        blockedEntries: 0,
      };
    } catch (error) {
      console.error('Rate limit stats error:', error);
      return { totalEntries: 0, blockedEntries: 0 };
    }
  }
}

// Pre-configured rate limiters for different use cases
export const createRateLimiters = () => {
  return {
    // API endpoints
    api: new RedisRateLimiter({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100, // 100 requests per minute
      blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
    }),

    // Authentication endpoints
    auth: new RedisRateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 attempts per 15 minutes
      blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes
    }),

    // File uploads
    upload: new RedisRateLimiter({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10, // 10 uploads per minute
      blockDurationMs: 10 * 60 * 1000, // Block for 10 minutes
    }),

    // Admin endpoints
    admin: new RedisRateLimiter({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30, // 30 requests per minute
      blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes
    }),

    // DAC-protected endpoints
    dac: new RedisRateLimiter({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 50, // 50 requests per minute
      blockDurationMs: 10 * 60 * 1000, // Block for 10 minutes
    }),
  };
};

// Global rate limiter instance
let globalRateLimiters: ReturnType<typeof createRateLimiters> | null = null;

export function getRateLimiters(): ReturnType<typeof createRateLimiters> {
  if (!globalRateLimiters) {
    globalRateLimiters = createRateLimiters();
  }
  return globalRateLimiters;
}
