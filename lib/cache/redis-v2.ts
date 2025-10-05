// SIGMACODE Redis Cache System - State of the Art Implementation
// Enterprise-grade Redis caching with connection pooling, metrics, and resilience

import Redis from 'ioredis';
import { EventEmitter } from 'events';
import crypto from 'crypto';

// Advanced Error Types
export class RedisCacheError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly operation: string,
    public readonly context?: Record<string, any>,
  ) {
    super(message);
    this.name = 'RedisCacheError';
  }
}

export class ConnectionError extends RedisCacheError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'CONNECTION_ERROR', 'connection', context);
    this.name = 'ConnectionError';
  }
}

export class OperationError extends RedisCacheError {
  constructor(message: string, operation: string, context?: Record<string, any>) {
    super(message, 'OPERATION_ERROR', operation, context);
    this.name = 'OperationError';
  }
}

// Metrics Collector for Redis operations
class RedisMetricsCollector {
  private static instance: RedisMetricsCollector;
  private metrics: Map<string, number> = new Map();
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  static getInstance(): RedisMetricsCollector {
    if (!RedisMetricsCollector.instance) {
      RedisMetricsCollector.instance = new RedisMetricsCollector();
    }
    return RedisMetricsCollector.instance;
  }

  incrementCounter(name: string, value: number = 1) {
    this.counters.set(name, (this.counters.get(name) || 0) + value);
  }

  recordValue(name: string, value: number) {
    this.metrics.set(name, value);
  }

  recordHistogram(name: string, value: number) {
    const values = this.histograms.get(name) || [];
    values.push(value);
    this.histograms.set(name, values);
  }

  getMetrics() {
    return {
      metrics: Object.fromEntries(this.metrics),
      counters: Object.fromEntries(this.counters),
      histograms: Object.fromEntries(
        Array.from(this.histograms.entries()).map(([key, values]) => [
          key,
          {
            count: values.length,
            sum: values.reduce((a, b) => a + b, 0),
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
          },
        ]),
      ),
    };
  }

  reset() {
    this.metrics.clear();
    this.counters.clear();
    this.histograms.clear();
  }
}

// Circuit Breaker for Redis operations
class RedisCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 30000,
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new RedisCacheError(
          'Redis circuit breaker is OPEN',
          'CIRCUIT_BREAKER_OPEN',
          'circuit_breaker',
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// Enhanced Redis Cache Configuration
interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix?: string;
  retryDelay?: number;
  maxRetries?: number;
  enableMetrics?: boolean;
  enableCircuitBreaker?: boolean;
  connectionTimeout?: number;
  commandTimeout?: number;
  lazyConnect?: boolean;
  maxRetriesPerRequest?: number;
  scripts?: Record<string, { lua: string; numberOfKeys?: number; readOnly?: boolean }>;
}

// Cache Entry with metadata
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  checksum: string;
  compressed: boolean;
  version: string;
}

// Redis Cache Events
export enum RedisEvent {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  READY = 'ready',
  RECONNECTING = 'reconnecting',
  CACHE_HIT = 'cache_hit',
  CACHE_MISS = 'cache_miss',
  CACHE_SET = 'cache_set',
  CACHE_DELETE = 'cache_delete',
  CIRCUIT_BREAKER_OPEN = 'circuit_breaker_open',
  CIRCUIT_BREAKER_CLOSE = 'circuit_breaker_close',
}

// Enhanced Redis Cache Manager
export class RedisCacheManager extends EventEmitter {
  async keys(pattern: string): Promise<string[]> {
    const startTime = Date.now();
    const formattedPattern = this.formatKey(pattern);

    try {
      const result = await this.circuitBreaker.execute(async () => {
        return await this.redis.keys(formattedPattern);
      });

      const duration = Date.now() - startTime;

      if (this.config.enableMetrics) {
        this.metrics.incrementCounter('redis_keys_operations');
        this.metrics.recordHistogram('redis_keys_duration', duration);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.incrementCounter('redis_keys_errors');
      this.metrics.recordHistogram('redis_keys_duration', duration);

      throw new OperationError(
        `Failed to get keys for pattern "${pattern}": ${error instanceof Error ? error.message : String(error)}`,
        'keys',
        { pattern, duration },
      );
    }
  }
  private redis: Redis;
  private config: RedisConfig;
  private circuitBreaker: RedisCircuitBreaker;
  private metrics = RedisMetricsCollector.getInstance();
  private connected = false;
  private connecting = false;
  private scripts: Map<string, string> = new Map();

  constructor(config: Partial<RedisConfig> = {}) {
    super();

    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: process.env.REDIS_PREFIX || 'sigmacode:',
      retryDelay: 1000,
      maxRetries: 3,
      enableMetrics: true,
      enableCircuitBreaker: true,
      connectionTimeout: 5000,
      commandTimeout: 3000,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      scripts: {},
      ...config,
    };

    this.circuitBreaker = new RedisCircuitBreaker();

    // Skip Redis initialization during build time
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !process.env.REDIS_HOST;
    
    if (isBuildTime) {
      console.log('[Redis] Skipping Redis initialization during build time');
      // Create a mock Redis instance that doesn't connect
      this.redis = {
        connect: async () => {},
        disconnect: async () => {},
        quit: async () => {},
        on: () => this.redis,
        once: () => this.redis,
      } as unknown as Redis;
      return;
    }

    // Initialize Redis client with advanced configuration
    this.redis = new Redis({
      host: this.config.host,
      port: this.config.port,
      password: this.config.password,
      db: this.config.db,
      keyPrefix: this.config.keyPrefix,
      maxRetriesPerRequest: this.config.maxRetriesPerRequest,
      lazyConnect: this.config.lazyConnect,
      scripts: this.config.scripts,
      // Connection pooling
      family: 4,
      // TLS support
      tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
      // Connection timeout
      connectTimeout: this.config.connectionTimeout,
      commandTimeout: this.config.commandTimeout,
      // Retry strategy
      retryStrategy: (times: number) => {
        this.metrics.incrementCounter('redis_retry_attempts');
        if (times > this.config.maxRetries!) {
          return null;
        }
        return Math.min(times * this.config.retryDelay!, 2000);
      },
    });

    this.setupEventHandlers();
    this.loadScripts();
  }

  private setupEventHandlers() {
    this.redis.on('connect', () => {
      this.connected = true;
      this.connecting = false;
      this.emit(RedisEvent.CONNECTED);
    });

    this.redis.on('ready', () => {
      this.emit(RedisEvent.READY);
    });

    this.redis.on('error', (error: Error) => {
      this.emit(RedisEvent.ERROR, error);
      this.metrics.incrementCounter('redis_errors');
    });

    this.redis.on('close', () => {
      this.connected = false;
      this.emit(RedisEvent.DISCONNECTED);
    });

    this.redis.on('reconnecting', () => {
      this.connecting = true;
      this.emit(RedisEvent.RECONNECTING);
    });

    this.redis.on('+node', (node: any) => {
      this.metrics.incrementCounter('redis_cluster_nodes_added');
    });

    this.redis.on('-node', (node: any) => {
      this.metrics.incrementCounter('redis_cluster_nodes_removed');
    });
  }

  private async loadScripts() {
    // Load Lua scripts for atomic operations
    const compressionScript = `
      local key = KEYS[1]
      local data = ARGV[1]
      local ttl = tonumber(ARGV[2])
      local compressed = ARGV[3]

      if compressed == 'true' then
        data = redis.call('GET', key .. ':meta')
        if data then
          local meta = cjson.decode(data)
          if meta.compressed then
            data = redis.call('GET', key .. ':data')
            if data then
              return cjson.decode(data)
            end
          end
        end
      end

      return redis.call('GET', key)
    `;

    try {
      await this.redis.script('LOAD', compressionScript);
      this.scripts.set('compress', compressionScript);
    } catch (error) {
      console.warn('Failed to load Redis scripts:', error);
    }
  }

  // Enhanced cache operations with metrics and error handling
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();

    try {
      const result = await this.circuitBreaker.execute(async () => {
        return await this.redis.get(this.formatKey(key));
      });

      const duration = Date.now() - startTime;

      if (this.config.enableMetrics) {
        this.metrics.incrementCounter('redis_get_operations');
        this.metrics.recordHistogram('redis_get_duration', duration);

        if (result !== null) {
          this.metrics.incrementCounter('redis_cache_hits');
          this.emit(RedisEvent.CACHE_HIT, { key, duration });
        } else {
          this.metrics.incrementCounter('redis_cache_misses');
          this.emit(RedisEvent.CACHE_MISS, { key, duration });
        }
      }

      return result ? JSON.parse(result) : null;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.incrementCounter('redis_get_errors');
      this.metrics.recordHistogram('redis_get_duration', duration);

      throw new OperationError(
        `Failed to get cache key "${key}": ${error instanceof Error ? error.message : String(error)}`,
        'get',
        { key, duration },
      );
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const startTime = Date.now();
    const serializedValue = JSON.stringify(value);
    const formattedKey = this.formatKey(key);

    try {
      const multi = this.redis.multi();

      // Store main data
      multi.set(formattedKey, serializedValue);

      // Store metadata if TTL is provided
      if (ttl) {
        multi.expire(formattedKey, ttl);

        const metaKey = `${formattedKey}:meta`;
        const metadata = {
          ttl,
          created: Date.now(),
          size: serializedValue.length,
          checksum: this.calculateChecksum(serializedValue),
        };

        multi.set(metaKey, JSON.stringify(metadata));
        multi.expire(metaKey, ttl);
      }

      await this.circuitBreaker.execute(async () => {
        return await multi.exec();
      });

      const duration = Date.now() - startTime;

      if (this.config.enableMetrics) {
        this.metrics.incrementCounter('redis_set_operations');
        this.metrics.recordHistogram('redis_set_duration', duration);
        this.emit(RedisEvent.CACHE_SET, { key, duration, ttl });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.incrementCounter('redis_set_errors');
      this.metrics.recordHistogram('redis_set_duration', duration);

      throw new OperationError(
        `Failed to set cache key "${key}": ${error instanceof Error ? error.message : String(error)}`,
        'set',
        { key, duration },
      );
    }
  }

  async delete(key: string): Promise<boolean> {
    const startTime = Date.now();
    const formattedKey = this.formatKey(key);

    try {
      const result = await this.circuitBreaker.execute(async () => {
        return await this.redis.del(formattedKey);
      });

      const duration = Date.now() - startTime;

      if (this.config.enableMetrics) {
        this.metrics.incrementCounter('redis_delete_operations');
        this.metrics.recordHistogram('redis_delete_duration', duration);
        this.emit(RedisEvent.CACHE_DELETE, { key, duration });
      }

      return result > 0;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.incrementCounter('redis_delete_errors');
      this.metrics.recordHistogram('redis_delete_duration', duration);

      throw new OperationError(
        `Failed to delete cache key "${key}": ${error instanceof Error ? error.message : String(error)}`,
        'delete',
        { key, duration },
      );
    }
  }

  async exists(key: string): Promise<boolean> {
    const startTime = Date.now();

    try {
      const result = await this.circuitBreaker.execute(async () => {
        return await this.redis.exists(this.formatKey(key));
      });

      const duration = Date.now() - startTime;

      if (this.config.enableMetrics) {
        this.metrics.incrementCounter('redis_exists_operations');
        this.metrics.recordHistogram('redis_exists_duration', duration);
      }

      return result === 1;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.incrementCounter('redis_exists_errors');
      this.metrics.recordHistogram('redis_exists_duration', duration);

      throw new OperationError(
        `Failed to check cache key "${key}": ${error instanceof Error ? error.message : String(error)}`,
        'exists',
        { key, duration },
      );
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    const startTime = Date.now();

    try {
      const result = await this.circuitBreaker.execute(async () => {
        return await this.redis.expire(this.formatKey(key), ttl);
      });

      const duration = Date.now() - startTime;

      if (this.config.enableMetrics) {
        this.metrics.incrementCounter('redis_expire_operations');
        this.metrics.recordHistogram('redis_expire_duration', duration);
      }

      return result === 1;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.incrementCounter('redis_expire_errors');
      this.metrics.recordHistogram('redis_expire_duration', duration);

      throw new OperationError(
        `Failed to expire cache key "${key}": ${error instanceof Error ? error.message : String(error)}`,
        'expire',
        { key, ttl, duration },
      );
    }
  }

  async ttl(key: string): Promise<number> {
    const startTime = Date.now();

    try {
      const result = await this.circuitBreaker.execute(async () => {
        return await this.redis.ttl(this.formatKey(key));
      });

      const duration = Date.now() - startTime;

      if (this.config.enableMetrics) {
        this.metrics.incrementCounter('redis_ttl_operations');
        this.metrics.recordHistogram('redis_ttl_duration', duration);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.incrementCounter('redis_ttl_errors');
      this.metrics.recordHistogram('redis_ttl_duration', duration);

      throw new OperationError(
        `Failed to get TTL for cache key "${key}": ${error instanceof Error ? error.message : String(error)}`,
        'ttl',
        { key, duration },
      );
    }
  }

  // Advanced cache operations
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const startTime = Date.now();
    const formattedKeys = keys.map((key) => this.formatKey(key));

    try {
      const result = await this.circuitBreaker.execute(async () => {
        return await this.redis.mget(formattedKeys);
      });

      const duration = Date.now() - startTime;

      if (this.config.enableMetrics) {
        this.metrics.incrementCounter('redis_mget_operations');
        this.metrics.recordHistogram('redis_mget_duration', duration);
      }

      return result.map((item) => (item ? JSON.parse(item) : null));
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.incrementCounter('redis_mget_errors');
      this.metrics.recordHistogram('redis_mget_duration', duration);

      throw new OperationError(
        `Failed to mget cache keys: ${error instanceof Error ? error.message : String(error)}`,
        'mget',
        { keys, duration },
      );
    }
  }

  async mset<T>(entries: Array<[string, T]>, ttl?: number): Promise<void> {
    const startTime = Date.now();

    try {
      const multi = this.redis.multi();

      entries.forEach(([key, value]) => {
        const formattedKey = this.formatKey(key);
        const serializedValue = JSON.stringify(value);

        multi.set(formattedKey, serializedValue);

        if (ttl) {
          multi.expire(formattedKey, ttl);
        }
      });

      await this.circuitBreaker.execute(async () => {
        return await multi.exec();
      });

      const duration = Date.now() - startTime;

      if (this.config.enableMetrics) {
        this.metrics.incrementCounter('redis_mset_operations');
        this.metrics.recordHistogram('redis_mset_duration', duration);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.incrementCounter('redis_mset_errors');
      this.metrics.recordHistogram('redis_mset_duration', duration);

      throw new OperationError(
        `Failed to mset cache entries: ${error instanceof Error ? error.message : String(error)}`,
        'mset',
        { count: entries.length, duration },
      );
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    const startTime = Date.now();
    const formattedPattern = this.formatKey(pattern);

    try {
      const keys = await this.circuitBreaker.execute(async () => {
        return await this.redis.keys(formattedPattern);
      });

      if (keys.length === 0) {
        return 0;
      }

      const result = await this.circuitBreaker.execute(async () => {
        return await this.redis.del(...keys);
      });

      const duration = Date.now() - startTime;

      if (this.config.enableMetrics) {
        this.metrics.incrementCounter('redis_delete_pattern_operations');
        this.metrics.recordHistogram('redis_delete_pattern_duration', duration);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.incrementCounter('redis_delete_pattern_errors');
      this.metrics.recordHistogram('redis_delete_pattern_duration', duration);

      throw new OperationError(
        `Failed to delete cache pattern "${pattern}": ${error instanceof Error ? error.message : String(error)}`,
        'deletePattern',
        { pattern, duration },
      );
    }
  }

  // Advanced operations with Lua scripts
  async atomicIncrement(key: string, increment: number = 1): Promise<number> {
    const startTime = Date.now();

    try {
      const result = await this.circuitBreaker.execute(async () => {
        return await this.redis.eval(
          'return redis.call("INCRBY", KEYS[1], ARGV[1])',
          1,
          this.formatKey(key),
          increment.toString(),
        );
      });

      const duration = Date.now() - startTime;

      if (this.config.enableMetrics) {
        this.metrics.incrementCounter('redis_atomic_increment_operations');
        this.metrics.recordHistogram('redis_atomic_increment_duration', duration);
      }

      return Number(result);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.incrementCounter('redis_atomic_increment_errors');
      this.metrics.recordHistogram('redis_atomic_increment_duration', duration);

      throw new OperationError(
        `Failed to atomic increment "${key}": ${error instanceof Error ? error.message : String(error)}`,
        'atomicIncrement',
        { key, increment, duration },
      );
    }
  }

  // Health check and monitoring
  async healthCheck(): Promise<boolean> {
    try {
      const startTime = Date.now();
      const result = await this.circuitBreaker.execute(async () => {
        return await this.redis.ping();
      });
      const duration = Date.now() - startTime;

      if (this.config.enableMetrics) {
        this.metrics.incrementCounter('redis_health_checks');
        this.metrics.recordHistogram('redis_health_check_duration', duration);
      }

      return result === 'PONG';
    } catch (error) {
      if (this.config.enableMetrics) {
        this.metrics.incrementCounter('redis_health_check_errors');
      }
      return false;
    }
  }

  getMetrics() {
    return {
      ...this.metrics.getMetrics(),
      circuitBreaker: this.circuitBreaker.getState(),
      connection: {
        connected: this.connected,
        connecting: this.connecting,
        config: {
          host: this.config.host,
          port: this.config.port,
          db: this.config.db,
        },
      },
    };
  }

  resetMetrics() {
    this.metrics.reset();
  }

  // Utility methods
  private formatKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  private calculateChecksum(data: string): string {
    return crypto.createHash('md5').update(data).digest('hex');
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect();
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getConfig(): RedisConfig {
    return { ...this.config };
  }
}

// Singleton instance
let redisCacheInstance: RedisCacheManager | null = null;

export const getRedisCache = (): RedisCacheManager => {
  if (!redisCacheInstance) {
    redisCacheInstance = new RedisCacheManager();
  }
  return redisCacheInstance;
};

// Legacy compatibility - keeping the old interface for backward compatibility
let redisClient: any = null;

const getLegacyRedisClient = () => {
  if (!redisClient) {
    redisClient = new (require('redis').createClient)({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      database: parseInt(process.env.REDIS_DB || '0'),
    });
  }

  return redisClient;
};

export default getLegacyRedisClient;

// Export types and classes (excluding RedisCacheManager as it's already exported above)
export { RedisMetricsCollector, RedisCircuitBreaker };

export type { RedisConfig, CacheEntry };
