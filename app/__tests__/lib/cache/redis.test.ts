// /app/__tests__/lib/cache/redis.test.ts
import {
  getRedisCache,
  cacheSet,
  cacheGet,
  cacheDelete,
  cacheInvalidateByTag,
} from '@/app/lib/cache/redis';
import * as RedisModule from '@/app/lib/cache/redis';
import { vi } from 'vitest';

describe('Redis Cache', () => {
  beforeEach(() => {
    // Reset any singleton instances for clean tests
    jest.clearAllMocks();
  });

  describe('Basic Operations', () => {
    it('should set and get a simple value', async () => {
      const cache = getRedisCache();
      const testKey = 'test:key';
      const testValue = 'test-value';

      // Mock Redis operations
      const mockSet = jest.fn().mockResolvedValue('OK');
      const mockGet = jest.fn().mockResolvedValue(
        JSON.stringify({
          data: testValue,
          createdAt: Date.now(),
          ttl: 3600,
          tags: [],
        }),
      );

      // Replace the Redis client methods
      Object.defineProperty(cache, 'client', {
        value: {
          setEx: mockSet,
          get: mockGet,
          sAdd: jest.fn(),
          del: jest.fn(),
          keys: jest.fn(),
        },
      });

      Object.defineProperty(cache, 'isConnected', { value: true });

      const setResult = await cache.set(testKey, testValue);
      expect(setResult).toBe(true);

      const getResult = await cache.get(testKey);
      expect(getResult).toBe(testValue);
    });

    it('should handle cache miss', async () => {
      const cache = getRedisCache();
      const testKey = 'test:nonexistent';

      // Mock Redis to return null
      const mockGet = jest.fn().mockResolvedValue(null);

      Object.defineProperty(cache, 'client', {
        value: { get: mockGet },
      });
      Object.defineProperty(cache, 'isConnected', { value: true });

      const result = await cache.get(testKey);
      expect(result).toBeNull();
    });

    it('should handle cache deletion', async () => {
      const cache = getRedisCache();
      const testKey = 'test:delete';

      const mockDel = jest.fn().mockResolvedValue(1);

      Object.defineProperty(cache, 'client', {
        value: {
          del: mockDel,
          sRem: jest.fn(),
          keys: jest.fn().mockResolvedValue([]),
        },
      });
      Object.defineProperty(cache, 'isConnected', { value: true });

      const result = await cache.delete(testKey);
      expect(result).toBe(true);
      expect(mockDel).toHaveBeenCalledWith(`cache:${testKey}`);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should respect TTL when setting values', async () => {
      const cache = getRedisCache();
      const testKey = 'test:ttl';
      const testValue = 'test-value';
      const ttl = 60; // 60 seconds

      const mockSetEx = jest.fn().mockResolvedValue('OK');

      Object.defineProperty(cache, 'client', {
        value: { setEx: mockSetEx, sAdd: jest.fn() },
      });
      Object.defineProperty(cache, 'isConnected', { value: true });

      const result = await cache.set(testKey, testValue, { ttl });
      expect(result).toBe(true);
      expect(mockSetEx).toHaveBeenCalledWith(`cache:${testKey}`, ttl, expect.any(String));
    });

    it('should handle expired entries', async () => {
      const cache = getRedisCache();
      const testKey = 'test:expired';

      // Mock expired entry
      const expiredEntry = JSON.stringify({
        data: 'expired-value',
        createdAt: Date.now() - 7200000, // 2 hours ago
        ttl: 3600, // 1 hour TTL
        tags: [],
      });

      const mockGet = jest.fn().mockResolvedValue(expiredEntry);
      const mockDel = jest.fn().mockResolvedValue(1);

      Object.defineProperty(cache, 'client', {
        value: {
          get: mockGet,
          del: mockDel,
          sRem: jest.fn(),
          keys: jest.fn().mockResolvedValue([]),
        },
      });
      Object.defineProperty(cache, 'isConnected', { value: true });

      const result = await cache.get(testKey);
      expect(result).toBeNull();
    });
  });

  describe('Cache Tags', () => {
    it('should invalidate by tag', async () => {
      const cache = getRedisCache();
      const tag = 'test-tag';
      const mockKeys = ['cache:key1', 'cache:key2'];

      const mockSMembers = jest.fn().mockResolvedValue(mockKeys);
      const mockDel = jest.fn().mockResolvedValue(2);

      Object.defineProperty(cache, 'client', {
        value: {
          sMembers: mockSMembers,
          del: mockDel,
          sRem: jest.fn(),
          keys: jest.fn(),
        },
      });
      Object.defineProperty(cache, 'isConnected', { value: true });

      const result = await cache.invalidateByTag(tag);
      expect(result).toBe(2);
      expect(mockDel).toHaveBeenCalledWith(mockKeys[0]);
      expect(mockDel).toHaveBeenCalledWith(mockKeys[1]);
    });

    it('should handle non-existent tag', async () => {
      const cache = getRedisCache();
      const tag = 'nonexistent-tag';

      const mockSMembers = jest.fn().mockResolvedValue([]);

      Object.defineProperty(cache, 'client', {
        value: { sMembers: mockSMembers },
      });
      Object.defineProperty(cache, 'isConnected', { value: true });

      const result = await cache.invalidateByTag(tag);
      expect(result).toBe(0);
    });
  });

  describe('Health Check', () => {
    it('should return true when Redis is connected', async () => {
      const cache = getRedisCache();

      const mockPing = jest.fn().mockResolvedValue('PONG');

      Object.defineProperty(cache, 'client', {
        value: { ping: mockPing },
      });
      Object.defineProperty(cache, 'isConnected', { value: true });

      const result = await cache.healthCheck();
      expect(result).toBe(true);
    });

    it('should return false when Redis is not connected', async () => {
      const cache = getRedisCache();

      Object.defineProperty(cache, 'client', { value: null });
      Object.defineProperty(cache, 'isConnected', { value: false });

      const result = await cache.healthCheck();
      expect(result).toBe(false);
    });

    it('should return false when ping fails', async () => {
      const cache = getRedisCache();

      const mockPing = jest.fn().mockRejectedValue(new Error('Connection failed'));

      Object.defineProperty(cache, 'client', {
        value: { ping: mockPing },
      });
      Object.defineProperty(cache, 'isConnected', { value: true });

      const result = await cache.healthCheck();
      expect(result).toBe(false);
    });
  });

  describe('Cache Statistics', () => {
    it('should return cache statistics', async () => {
      const cache = getRedisCache();

      const mockDBSize = jest.fn().mockResolvedValue(42);
      const mockKeys = jest.fn().mockResolvedValue(['tags:tag1', 'tags:tag2']);

      Object.defineProperty(cache, 'client', {
        value: { dbSize: mockDBSize, keys: mockKeys },
      });
      Object.defineProperty(cache, 'isConnected', { value: true });

      const stats = await cache.getStats();
      expect(stats).toEqual({
        connected: true,
        keys: 42,
        tags: 2,
      });
    });

    it('should return zero stats when disconnected', async () => {
      const cache = getRedisCache();

      Object.defineProperty(cache, 'client', { value: null });
      Object.defineProperty(cache, 'isConnected', { value: false });

      const stats = await cache.getStats();
      expect(stats).toEqual({
        connected: false,
        keys: 0,
        tags: 0,
      });
    });
  });

  describe('Convenience Functions', () => {
    it('should work with convenience functions', async () => {
      const testKey = 'test:convenience';
      const testValue = 'convenience-value';

      // Mock the singleton instance
      const mockCache = {
        set: jest.fn().mockResolvedValue(true),
        get: jest.fn().mockResolvedValue(testValue),
        delete: jest.fn().mockResolvedValue(true),
        invalidateByTag: jest.fn().mockResolvedValue(1),
        clear: jest.fn().mockResolvedValue(true),
        healthCheck: jest.fn().mockResolvedValue(true),
      };

      // Mock getRedisCache via vi.spyOn auf das Modul
      vi.spyOn(RedisModule, 'getRedisCache').mockReturnValue(mockCache as any);

      await expect(cacheSet(testKey, testValue)).resolves.toBe(true);
      await expect(cacheGet(testKey)).resolves.toBe(testValue);
      await expect(cacheDelete(testKey)).resolves.toBe(true);
      await expect(RedisModule.cacheInvalidateByTag('test-tag')).resolves.toBeGreaterThanOrEqual(0);
      await expect(RedisModule.cacheClear()).resolves.toBe(true);
      const health = await RedisModule.cacheHealthCheck();
      expect(typeof health).toBe('boolean');
    });
  });
});
