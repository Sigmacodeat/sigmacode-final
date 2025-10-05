// Advanced Caching System for Production
// lib/cache.ts

import { useState, useEffect } from 'react';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size in entries
  maxMemory?: number; // Maximum memory usage in bytes
  persist?: boolean; // Persist to localStorage
  compress?: boolean; // Compress data
  priority?: 'low' | 'normal' | 'high'; // Cache priority
}

class AdvancedCache {
  private cache = new Map<string, CacheEntry<any>>();
  private accessOrder = new Set<string>(); // For LRU eviction
  private memoryUsage = 0;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly DEFAULT_MAX_SIZE = 1000;
  private readonly DEFAULT_MAX_MEMORY = 50 * 1024 * 1024; // 50MB

  constructor(private options: CacheOptions = {}) {
    this.options.ttl = options.ttl || this.DEFAULT_TTL;
    this.options.maxSize = options.maxSize || this.DEFAULT_MAX_SIZE;
    this.options.maxMemory = options.maxMemory || this.DEFAULT_MAX_MEMORY;

    if (this.options.persist) {
      this.loadFromStorage();
    }

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  // Set cache entry
  set<T>(key: string, value: T, options: Partial<CacheOptions> = {}): void {
    const entry: CacheEntry<T> = {
      value: this.options.compress ? this.compress(value) : value,
      timestamp: Date.now(),
      ttl: options.ttl || this.options.ttl!,
      accessCount: 0,
      lastAccessed: Date.now(),
    };

    // Check memory limit
    const estimatedSize = this.estimateSize(entry);
    if (this.memoryUsage + estimatedSize > this.options.maxMemory!) {
      this.evict(Math.ceil(this.options.maxSize! * 0.2)); // Evict 20%
    }

    this.cache.set(key, entry);
    this.accessOrder.add(key);
    this.memoryUsage += estimatedSize;

    if (this.options.persist) {
      this.saveToStorage();
    }
  }

  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    // Update access tracking
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.accessOrder.delete(key);
    this.accessOrder.add(key);

    return this.options.compress ? this.decompress(entry.value) : entry.value;
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return false;
    }

    return true;
  }

  // Delete specific entry
  delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.memoryUsage -= this.estimateSize(entry);
      this.cache.delete(key);
      this.accessOrder.delete(key);

      if (this.options.persist) {
        this.saveToStorage();
      }
    }
  }

  // Clear all entries
  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.memoryUsage = 0;

    if (this.options.persist) {
      this.clearStorage();
    }
  }

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.values());
    const totalEntries = entries.length;

    return {
      totalEntries,
      memoryUsage: this.memoryUsage,
      memoryUsageMB: Math.round((this.memoryUsage / 1024 / 1024) * 100) / 100,
      hitRate: this.calculateHitRate(),
      averageAccessCount:
        totalEntries > 0
          ? entries.reduce((sum, entry) => sum + entry.accessCount, 0) / totalEntries
          : 0,
      oldestEntry: totalEntries > 0 ? Math.min(...entries.map((e) => e.timestamp)) : null,
      newestEntry: totalEntries > 0 ? Math.max(...entries.map((e) => e.timestamp)) : null,
    };
  }

  // Batch operations
  setMultiple<T>(entries: Array<{ key: string; value: T; options?: Partial<CacheOptions> }>): void {
    entries.forEach(({ key, value, options }) => {
      this.set(key, value, options);
    });
  }

  getMultiple<T>(keys: string[]): Array<{ key: string; value: T | null }> {
    return keys.map((key) => ({ key, value: this.get<T>(key) }));
  }

  // Cache warming
  warm(keys: string[], fetcher: (key: string) => Promise<any>): Promise<void[]> {
    const promises = keys.map(async (key) => {
      if (!this.has(key)) {
        try {
          const value = await fetcher(key);
          this.set(key, value);
        } catch (error) {
          console.warn(`Failed to warm cache for key: ${key}`, error);
        }
      }
    });

    return Promise.all(promises);
  }

  // Private methods
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => this.delete(key));

    // If still over size limit, evict LRU entries
    if (this.cache.size > this.options.maxSize!) {
      this.evict(this.cache.size - this.options.maxSize!);
    }
  }

  private evict(count: number): void {
    const entriesToEvict = Array.from(this.accessOrder).slice(0, count);

    entriesToEvict.forEach((key) => {
      const entry = this.cache.get(key);
      if (entry) {
        this.memoryUsage -= this.estimateSize(entry);
        this.cache.delete(key);
      }
    });

    // Rebuild access order
    this.accessOrder = new Set(this.cache.keys());
  }

  private estimateSize(entry: CacheEntry<any>): number {
    // Rough estimation: JSON string length * 2 (for object overhead)
    return JSON.stringify(entry.value).length * 2;
  }

  private calculateHitRate(): number {
    const totalRequests = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.accessCount,
      0,
    );

    if (totalRequests === 0) return 0;

    const hits = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + (entry.accessCount - 1),
      0,
    ); // -1 because set counts as access

    return hits / totalRequests;
  }

  private compress(value: any): any {
    // Simple compression using JSON compression
    const jsonString = JSON.stringify(value);
    return jsonString; // In production, use actual compression
  }

  private decompress(value: any): any {
    const jsonString = value as string;
    return JSON.parse(jsonString);
  }

  // Persistence methods
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('sigmacode_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cache = new Map(parsed.cache || []);
        this.accessOrder = new Set(parsed.accessOrder || []);
        this.memoryUsage = parsed.memoryUsage || 0;
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        cache: Array.from(this.cache.entries()),
        accessOrder: Array.from(this.accessOrder),
        memoryUsage: this.memoryUsage,
      };

      localStorage.setItem('sigmacode_cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  private clearStorage(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('sigmacode_cache');
  }
}

// Cache instances for different use cases
export const pageCache = new AdvancedCache({
  ttl: 10 * 60 * 1000, // 10 minutes for pages
  maxSize: 500,
  persist: true,
});

export const apiCache = new AdvancedCache({
  ttl: 5 * 60 * 1000, // 5 minutes for API responses
  maxSize: 1000,
  persist: false, // Don't persist API data
});

export const imageCache = new AdvancedCache({
  ttl: 60 * 60 * 1000, // 1 hour for images
  maxSize: 200,
  maxMemory: 100 * 1024 * 1024, // 100MB for images
  persist: true,
});

export const userDataCache = new AdvancedCache({
  ttl: 30 * 60 * 1000, // 30 minutes for user data
  maxSize: 100,
  persist: true,
});

// Cache utilities
export function cacheResponse(
  key: string,
  data: any,
  cacheType: 'page' | 'api' | 'image' | 'user' = 'api',
): void {
  switch (cacheType) {
    case 'page':
      pageCache.set(key, data);
      break;
    case 'api':
      apiCache.set(key, data);
      break;
    case 'image':
      imageCache.set(key, data);
      break;
    case 'user':
      userDataCache.set(key, data);
      break;
  }
}

export function getCachedResponse<T>(
  key: string,
  cacheType: 'page' | 'api' | 'image' | 'user' = 'api',
): T | null {
  switch (cacheType) {
    case 'page':
      return pageCache.get<T>(key);
    case 'api':
      return apiCache.get<T>(key);
    case 'image':
      return imageCache.get<T>(key);
    case 'user':
      return userDataCache.get<T>(key);
    default:
      return null;
  }
}

export function clearCache(cacheType?: 'page' | 'api' | 'image' | 'user'): void {
  switch (cacheType) {
    case 'page':
      pageCache.clear();
      break;
    case 'api':
      apiCache.clear();
      break;
    case 'image':
      imageCache.clear();
      break;
    case 'user':
      userDataCache.clear();
      break;
    default:
      pageCache.clear();
      apiCache.clear();
      imageCache.clear();
      userDataCache.clear();
  }
}

export function getCacheStats(cacheType: 'page' | 'api' | 'image' | 'user' = 'api') {
  switch (cacheType) {
    case 'page':
      return pageCache.getStats();
    case 'api':
      return apiCache.getStats();
    case 'image':
      return imageCache.getStats();
    case 'user':
      return userDataCache.getStats();
    default:
      return {
        page: pageCache.getStats(),
        api: apiCache.getStats(),
        image: imageCache.getStats(),
        user: userDataCache.getStats(),
      };
  }
}

// React hook for cache management
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  cacheType: 'page' | 'api' | 'image' | 'user' = 'api',
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try cache first
        const cached = getCachedResponse<T>(key, cacheType);
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }

        // Fetch fresh data
        const freshData = await fetcher();
        setData(freshData);
        cacheResponse(key, freshData, cacheType);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key, fetcher, cacheType]);

  return { data, loading, error, refetch: () => getCacheStats(cacheType) };
}
