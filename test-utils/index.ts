/**
 * Advanced Test Utilities for State-of-the-Art Testing
 * Provides comprehensive testing infrastructure with modern patterns
 */

import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { faker } from '@faker-js/faker';
import { performance } from 'perf_hooks';

// Export types for Jest matchers
export type {};

// Test Configuration
export const TEST_CONFIG = {
  PERFORMANCE: {
    MAX_RESPONSE_TIME: 1000, // ms
    MAX_MEMORY_USAGE: 50 * 1024 * 1024, // 50MB
    MIN_THROUGHPUT: 100, // requests/second
  },
  DATABASE: {
    MOCK_LATENCY: { min: 10, max: 100 }, // ms
    CONNECTION_POOL_SIZE: 5,
  },
  SECURITY: {
    RATE_LIMITS: {
      REQUESTS_PER_MINUTE: 100,
    },
  },
} as const;

// Type definitions for custom matchers - using @jest/globals types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidAlert(): R;
      toHaveValidSeverity(): R;
      toBeWithinPerformanceBudget(budget: number): R;
      toHaveValidFirewallResponse(): R;
    }
  }
}

// Enhanced Mock Database
export class MockDatabase {
  private data: Map<string, any[]> = new Map();

  seed(tableName: string, data: any[]): void {
    this.data.set(tableName, data);
  }

  getData(tableName: string): any[] {
    return this.data.get(tableName) || [];
  }

  clear(): void {
    this.data.clear();
  }

  insert(tableName: string, data: any): void {
    const tableData = this.data.get(tableName) || [];
    tableData.push(data);
    this.data.set(tableName, tableData);
  }

  findById(tableName: string, id: string): any | undefined {
    const tableData = this.data.get(tableName) || [];
    return tableData.find((item) => item.id === id);
  }
}

// Performance Testing Utilities
export class PerformanceTester {
  private metrics: Map<string, number[]> = new Map();

  async measureExecutionTime<T>(
    operation: string,
    fn: () => Promise<T>,
  ): Promise<{ result: T; duration: number; memory: number }> {
    const startMemory = process.memoryUsage().heapUsed;
    const startTime = performance.now();

    const result = await fn();

    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;
    const duration = endTime - startTime;
    const memory = endMemory - startMemory;

    // Store metrics
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);

    return { result, duration, memory };
  }

  getMetrics(operation?: string): Record<
    string,
    {
      count: number;
      min: number;
      max: number;
      avg: number;
      p95: number;
      p99: number;
    }
  > {
    const operations = operation ? [operation] : Array.from(this.metrics.keys());

    const results: Record<
      string,
      {
        count: number;
        min: number;
        max: number;
        avg: number;
        p95: number;
        p99: number;
      }
    > = {};

    for (const op of operations) {
      const times = this.metrics.get(op) || [];
      if (times.length === 0) continue;

      const sorted = [...times].sort((a, b) => a - b);
      const count = times.length;
      const min = sorted[0];
      const max = sorted[count - 1];
      const avg = times.reduce((sum, t) => sum + t, 0) / count;
      const p95 = sorted[Math.floor(count * 0.95)];
      const p99 = sorted[Math.floor(count * 0.99)];

      results[op] = { count, min, max, avg, p95, p99 };
    }

    return results;
  }

  assertPerformance(operation: string, maxTime: number): void {
    const metrics = this.getMetrics(operation);
    const operationMetrics = metrics[operation];

    if (operationMetrics) {
      expect(operationMetrics.p95).toBeLessThan(maxTime);
    } else {
      throw new Error(`No metrics found for operation: ${operation}`);
    }
  }
}

// Request Factory for API Testing
export class RequestFactory {
  static createRequest(
    url: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      body?: any;
      headers?: Record<string, string>;
      params?: Record<string, string>;
    } = {},
  ): NextRequest {
    const { method = 'GET', body, headers = {}, params = {} } = options;

    // Build URL with params
    const urlObj = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });

    // Create headers
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Test-Agent/1.0',
      'X-Request-ID': faker.string.uuid(),
      ...headers,
    };

    return new NextRequest(urlObj.toString(), {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static createAuthenticatedRequest(
    url: string,
    userId: string,
    options: Parameters<typeof RequestFactory.createRequest>[1] = {},
  ): NextRequest {
    return RequestFactory.createRequest(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${faker.string.alphanumeric(64)}`,
        'X-User-ID': userId,
        ...options.headers,
      },
    });
  }
}

// Data Generators for Property-based Testing
export class DataGenerator {
  static alertRule(overrides: Partial<any> = {}): any {
    return {
      id: faker.string.uuid(),
      name: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      tenantId: faker.string.uuid(),
      triggerType: faker.helpers.arrayElement(['ml_prediction', 'threshold', 'pattern', 'manual']),
      triggerConfig: {
        minRiskScore: faker.number.float({ min: 0, max: 1 }),
        metric: faker.helpers.arrayElement(['cpu_usage', 'error_rate', 'response_time']),
        threshold: faker.number.int({ min: 1, max: 100 }),
      },
      severity: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
      channels: faker.helpers.arrayElements(['email', 'slack', 'webhook', 'sms', 'dashboard'], {
        min: 1,
        max: 3,
      }),
      cooldownMinutes: faker.number.int({ min: 0, max: 1440 }),
      groupSimilar: faker.datatype.boolean(),
      groupWindowMinutes: faker.number.int({ min: 1, max: 60 }),
      isActive: faker.datatype.boolean(),
      createdBy: faker.string.uuid(),
      createdAt: faker.date.recent().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides,
    };
  }

  static alert(overrides: Partial<any> = {}): any {
    return {
      id: faker.string.uuid(),
      ruleId: faker.string.uuid(),
      tenantId: faker.string.uuid(),
      title: faker.lorem.sentence(),
      message: faker.lorem.paragraph(),
      severity: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
      category: faker.helpers.arrayElement([
        'security_threat',
        'system_error',
        'performance_issue',
        'compliance_violation',
        'ml_anomaly',
        'manual_trigger',
      ]),
      status: faker.helpers.arrayElement(['new', 'acknowledged', 'resolved', 'dismissed']),
      context: {
        requestId: faker.string.uuid(),
        userId: faker.string.uuid(),
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        endpoint: faker.internet.url(),
        additionalData: {
          model: faker.helpers.arrayElement(['gpt-3.5', 'gpt-4', 'claude']),
          tokens: faker.number.int({ min: 100, max: 4000 }),
          processingTime: faker.number.int({ min: 100, max: 5000 }),
        },
      },
      channels: faker.helpers.arrayElements(['email', 'slack', 'webhook'], { min: 1, max: 2 }),
      triggeredAt: faker.date.recent().toISOString(),
      acknowledgedAt: null,
      acknowledgedBy: null,
      resolvedAt: null,
      resolvedBy: null,
      resolvedReason: null,
      dismissedAt: null,
      dismissedBy: null,
      dismissedReason: null,
      createdAt: faker.date.recent().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides,
    };
  }

  static firewallInput(overrides: Partial<any> = {}): any {
    return {
      id: faker.string.uuid(),
      timestamp: faker.date.recent().toISOString(),
      content: faker.lorem.paragraph(),
      type: faker.helpers.arrayElement(['prompt', 'response', 'request', 'output']),
      metadata: {
        userId: faker.string.uuid(),
        sessionId: faker.string.uuid(),
        source: faker.helpers.arrayElement(['web', 'api', 'mobile', 'cli']),
        model: faker.helpers.arrayElement(['gpt-3.5', 'gpt-4', 'claude-3', 'gemini']),
        temperature: faker.number.float({ min: 0, max: 2 }),
        maxTokens: faker.number.int({ min: 100, max: 4000 }),
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
      },
      riskScore: faker.number.float({ min: 0, max: 1 }),
      blocked: faker.datatype.boolean(),
      reason: null,
      ...overrides,
    };
  }

  static behavioralRequest(overrides: Partial<any> = {}): any {
    return {
      userId: faker.string.uuid(),
      timestamp: faker.date.recent().getTime(),
      prompt: faker.lorem.paragraph(),
      endpoint: faker.internet.url(),
      userAgent: faker.internet.userAgent(),
      ipAddress: faker.internet.ip(),
      ...overrides,
    };
  }
}

// Extend Jest with custom matchers
export function extendJestMatchers() {
  // Custom matchers are already defined in jest.setup.js
  // This function is kept for backward compatibility
}

// Error Simulation for Mutation Testing
export class ErrorSimulator {
  static simulateNetworkError(): Error {
    return new Error('Network connection failed');
  }

  static simulateDatabaseError(): Error {
    return new Error('Database operation failed');
  }

  static simulateValidationError(message: string): Error {
    return new Error(`Validation failed: ${message}`);
  }

  static simulateTimeoutError(): Error {
    return new Error('Operation timed out');
  }

  static simulateRateLimitError(): Error {
    return new Error('Rate limit exceeded');
  }
}

// Test Data Fixtures
export const TestFixtures = {
  alerts: {
    critical: DataGenerator.alert({ severity: 'critical', status: 'new' }),
    high: DataGenerator.alert({ severity: 'high', status: 'acknowledged' }),
    medium: DataGenerator.alert({ severity: 'medium', status: 'resolved' }),
    low: DataGenerator.alert({ severity: 'low', status: 'dismissed' }),
  },

  rules: {
    active: DataGenerator.alertRule({ isActive: true }),
    inactive: DataGenerator.alertRule({ isActive: false }),
    mlBased: DataGenerator.alertRule({ triggerType: 'ml_prediction' }),
    thresholdBased: DataGenerator.alertRule({ triggerType: 'threshold' }),
  },

  firewall: {
    blocked: DataGenerator.firewallInput({ blocked: true, riskScore: 0.9 }),
    allowed: DataGenerator.firewallInput({ blocked: false, riskScore: 0.1 }),
    highRisk: DataGenerator.firewallInput({ blocked: false, riskScore: 0.8 }),
  },
};

// Global Test Setup
export const setupTestEnvironment = () => {
  // Set test-specific environment variables
  Object.defineProperty(process.env, 'NODE_ENV', {
    value: 'test',
    writable: true,
    enumerable: true,
    configurable: true,
  });
  process.env.TEST_MODE = 'true';
  process.env.MOCK_EXTERNAL_SERVICES = 'true';

  // Increase timeout for performance tests
  jest.setTimeout(30000);

  // Mock console methods to reduce noise
  const originalConsole = { ...console };
  beforeAll(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
  });
};

export {};
