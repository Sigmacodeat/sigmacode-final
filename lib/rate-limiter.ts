// SIGMACODE AI - Advanced Rate Limiting & DDoS Protection
// Production-grade rate limiting with multiple strategies

import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';
import { z } from 'zod';

// Rate Limiting Configuration
export interface RateLimitConfig {
  // Basic rate limiting
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;

  // Burst protection
  burstLimit: number;
  burstWindowMs: number;

  // Advanced features
  slidingWindow: boolean;
  tokenBucket: boolean;

  // IP-based restrictions
  blockDurationMs: number;
  maxRetries: number;

  // Whitelist/Blacklist
  whitelistedIPs: string[];
  blacklistedIPs: string[];

  // User-based limits
  perUserLimits: boolean;
  userTierLimits: Record<string, number>;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: number;
  retryAfter: number;
  blocked: boolean;
  reason?: string;
}

// In-Memory Stores (Production: Use Redis)
const ipRequestCounts = new LRUCache<string, number>({
  max: 10000,
  ttl: 60 * 60 * 1000, // 1 hour
});

const ipBlockList = new LRUCache<string, number>({
  max: 1000,
  ttl: 24 * 60 * 60 * 1000, // 24 hours
});

const userRequestCounts = new LRUCache<string, number>({
  max: 5000,
  ttl: 60 * 60 * 1000, // 1 hour
});

// Default Configuration
const DEFAULT_RATE_LIMITS: RateLimitConfig = {
  requestsPerMinute: 60,
  requestsPerHour: 1000,
  requestsPerDay: 10000,
  burstLimit: 10,
  burstWindowMs: 1000,
  slidingWindow: true,
  tokenBucket: true,
  blockDurationMs: 15 * 60 * 1000, // 15 minutes
  maxRetries: 5,
  whitelistedIPs: ['127.0.0.1', '::1', 'localhost'],
  blacklistedIPs: [],
  perUserLimits: true,
  userTierLimits: {
    free: 30,
    premium: 300,
    enterprise: 3000,
    admin: -1, // unlimited
  },
};

// Rate Limiter Class
export class RateLimiter {
  private static instance: RateLimiter;
  private config: RateLimitConfig;

  private constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_RATE_LIMITS, ...config };
  }

  static getInstance(config?: Partial<RateLimitConfig>): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter(config);
    }
    return RateLimiter.instance;
  }

  // Main rate limiting function
  async checkRateLimit(
    request: NextRequest,
    userId?: string,
    userTier: string = 'free',
  ): Promise<RateLimitResult> {
    const clientIP = this.getClientIP(request);
    const now = Date.now();

    // Check if IP is whitelisted
    if (this.config.whitelistedIPs.includes(clientIP)) {
      return {
        allowed: true,
        remainingRequests: Infinity,
        resetTime: now + 3600000,
        retryAfter: 0,
        blocked: false,
      };
    }

    // Check if IP is blacklisted
    if (this.config.blacklistedIPs.includes(clientIP)) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: now + this.config.blockDurationMs,
        retryAfter: Math.ceil(this.config.blockDurationMs / 1000),
        blocked: true,
        reason: 'IP is blacklisted',
      };
    }

    // Check if IP is currently blocked
    const blockUntil = ipBlockList.get(clientIP);
    if (blockUntil && now < blockUntil) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: blockUntil,
        retryAfter: Math.ceil((blockUntil - now) / 1000),
        blocked: true,
        reason: 'IP is temporarily blocked',
      };
    }

    // Check per-IP limits
    const ipResult = await this.checkIPLimits(clientIP, now);
    if (!ipResult.allowed) {
      return ipResult;
    }

    // Check per-user limits if userId provided
    if (userId && this.config.perUserLimits) {
      const userResult = await this.checkUserLimits(userId, userTier, now);
      if (!userResult.allowed) {
        return userResult;
      }
    }

    return ipResult;
  }

  // Check IP-based rate limits
  private async checkIPLimits(clientIP: string, now: number): Promise<RateLimitResult> {
    const key = `ip:${clientIP}`;

    // Sliding window rate limiting
    if (this.config.slidingWindow) {
      return this.checkSlidingWindowLimit(key, now);
    }

    // Token bucket rate limiting
    if (this.config.tokenBucket) {
      return this.checkTokenBucketLimit(key, now);
    }

    // Fixed window rate limiting
    return this.checkFixedWindowLimit(key, now);
  }

  // Check user-based rate limits
  private async checkUserLimits(
    userId: string,
    userTier: string,
    now: number,
  ): Promise<RateLimitResult> {
    const key = `user:${userId}`;
    const tierLimit = this.config.userTierLimits[userTier] || this.config.requestsPerMinute;

    // For users, we use a simpler approach
    const currentCount = userRequestCounts.get(key) || 0;
    const newCount = currentCount + 1;

    if (newCount > tierLimit && tierLimit !== -1) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: now + 60000, // Reset after 1 minute
        retryAfter: 60,
        blocked: false,
        reason: `User tier limit exceeded (${tierLimit}/min)`,
      };
    }

    userRequestCounts.set(key, newCount);

    return {
      allowed: true,
      remainingRequests: Math.max(0, tierLimit - newCount),
      resetTime: now + 60000,
      retryAfter: 0,
      blocked: false,
    };
  }

  // Sliding window rate limiting
  private async checkSlidingWindowLimit(key: string, now: number): Promise<RateLimitResult> {
    const windowSize = 60000; // 1 minute
    const maxRequests = this.config.requestsPerMinute;

    // Get all requests in the current window
    const requests = this.getRequestsInWindow(key, now, windowSize);

    if (requests.length >= maxRequests) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: now + windowSize,
        retryAfter: Math.ceil(windowSize / 1000),
        blocked: false,
        reason: 'Rate limit exceeded',
      };
    }

    // Add current request
    this.addRequestToWindow(key, now);

    return {
      allowed: true,
      remainingRequests: maxRequests - requests.length - 1,
      resetTime: now + windowSize,
      retryAfter: 0,
      blocked: false,
    };
  }

  // Token bucket rate limiting
  private async checkTokenBucketLimit(key: string, now: number): Promise<RateLimitResult> {
    const bucketKey = `${key}:tokens`;
    const lastRefillKey = `${key}:lastRefill`;

    const currentTokens = ipRequestCounts.get(bucketKey) || this.config.requestsPerMinute;
    const lastRefill = ipRequestCounts.get(lastRefillKey) || now;

    // Calculate tokens to add based on time elapsed
    const timeElapsed = now - lastRefill;
    const tokensToAdd = Math.floor(timeElapsed / 1000); // 1 token per second
    const newTokens = Math.min(currentTokens + tokensToAdd, this.config.requestsPerMinute);

    if (newTokens <= 0) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: now + 1000,
        retryAfter: 1,
        blocked: false,
        reason: 'Token bucket empty',
      };
    }

    // Consume token
    ipRequestCounts.set(bucketKey, newTokens - 1);
    ipRequestCounts.set(lastRefillKey, now);

    return {
      allowed: true,
      remainingRequests: newTokens - 1,
      resetTime: now + 1000,
      retryAfter: 0,
      blocked: false,
    };
  }

  // Fixed window rate limiting
  private async checkFixedWindowLimit(key: string, now: number): Promise<RateLimitResult> {
    const windowKey = `${key}:${Math.floor(now / 60000)}`; // 1-minute windows
    const currentCount = ipRequestCounts.get(windowKey) || 0;

    if (currentCount >= this.config.requestsPerMinute) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: now + 60000,
        retryAfter: 60,
        blocked: false,
        reason: 'Fixed window limit exceeded',
      };
    }

    ipRequestCounts.set(windowKey, currentCount + 1);

    return {
      allowed: true,
      remainingRequests: this.config.requestsPerMinute - currentCount - 1,
      resetTime: now + 60000,
      retryAfter: 0,
      blocked: false,
    };
  }

  // Block IP after too many failed attempts
  async blockIP(clientIP: string, reason: string = 'Too many failed requests'): Promise<void> {
    const blockUntil = Date.now() + this.config.blockDurationMs;
    ipBlockList.set(clientIP, blockUntil);

    console.warn(
      `IP ${clientIP} blocked until ${new Date(blockUntil).toISOString()}. Reason: ${reason}`,
    );
  }

  // Unblock IP
  async unblockIP(clientIP: string): Promise<void> {
    ipBlockList.delete(clientIP);
    console.info(`IP ${clientIP} unblocked`);
  }

  // Get client IP with fallbacks
  private getClientIP(request: NextRequest): string {
    // Try various headers in order of preference
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');

    if (cfConnectingIP) return cfConnectingIP.split(',')[0].trim();
    if (forwardedFor) return forwardedFor.split(',')[0].trim();
    if (realIP) return realIP.trim();

    // Fallback to a default (should not happen in production)
    return '127.0.0.1';
  }

  // Helper methods for sliding window
  private getRequestsInWindow(key: string, now: number, windowSize: number): number[] {
    // In production, this would query Redis for timestamps in the window
    // For now, we'll use a simple in-memory approach
    const windowStart = now - windowSize;
    const requests: number[] = [];

    // This is a simplified version - in production use Redis sorted sets
    for (let i = 0; i < 100; i++) {
      const timestamp = ipRequestCounts.get(`${key}:${i}`);
      if (timestamp && timestamp >= windowStart) {
        requests.push(timestamp);
      }
    }

    return requests.sort((a, b) => a - b);
  }

  private addRequestToWindow(key: string, timestamp: number): void {
    // In production, add to Redis sorted set
    // For now, just store in LRU cache
    const existingRequests = this.getRequestsInWindow(key, Date.now(), 60000);
    const newIndex = existingRequests.length;
    ipRequestCounts.set(`${key}:${newIndex}`, timestamp);
  }

  // Update configuration
  updateConfig(newConfig: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): RateLimitConfig {
    return { ...this.config };
  }
}

// Middleware function for Next.js API routes
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: {
    userId?: string;
    userTier?: string;
    customLimits?: Partial<RateLimitConfig>;
  },
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const rateLimiter = RateLimiter.getInstance(options?.customLimits);
    const userId = options?.userId;
    const userTier = options?.userTier || 'free';

    try {
      const rateLimitResult = await rateLimiter.checkRateLimit(request, userId, userTier);

      if (!rateLimitResult.allowed) {
        const response = NextResponse.json(
          {
            error: 'Rate limit exceeded',
            retryAfter: rateLimitResult.retryAfter,
            reason: rateLimitResult.reason,
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': rateLimitResult.remainingRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
              'Retry-After': rateLimitResult.retryAfter.toString(),
            },
          },
        );

        // Add security headers
        response.headers.set('X-RateLimit-Blocked', 'true');
        if (rateLimitResult.blocked) {
          response.headers.set('X-RateLimit-Blocked-Reason', rateLimitResult.reason || 'Unknown');
        }

        return response;
      }

      // Add rate limit headers to successful responses
      const response = await handler(request);
      response.headers.set('X-RateLimit-Limit', rateLimitResult.remainingRequests.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remainingRequests.toString());
      response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

      return response;
    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow the request but log it
      return await handler(request);
    }
  };
}

// Export singleton instance
export const rateLimiter = RateLimiter.getInstance();
