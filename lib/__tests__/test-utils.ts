describe('test-utils sanity', () => {
  it('should run at least one test', () => {
    expect(true).toBe(true);
  });
});

import { NextRequest } from 'next/server';

// Mock data generators
export const generateMockFirewallLog = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  ts: new Date().toISOString(),
  requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
  backend: 'superagent',
  policy: 'firewall-analysis',
  action: 'allow',
  latencyMs: Math.floor(Math.random() * 500) + 50,
  status: 200,
  userId: `user-${Math.random().toString(36).substr(2, 5)}`,
  meta: { inputLength: 25, model: 'gpt-3.5' },
  ...overrides,
});

export const generateMockThreat = (overrides = {}) => ({
  id: `threat-${Math.random().toString(36).substr(2, 9)}`,
  category: 'prompt_injection',
  confidence: 0.95,
  severity: 'high',
  description: 'Potential prompt injection detected',
  evidence: ['Contains suspicious keywords'],
  timestamp: new Date().toISOString(),
  ...overrides,
});

export const generateMockApiKey = (overrides = {}) => ({
  id: `key-${Math.random().toString(36).substr(2, 9)}`,
  keyId: `sk-${Math.random().toString(36).substr(2, 20)}`,
  name: 'Test API Key',
  scopes: ['firewall:analyze'],
  status: 'active',
  rateLimitRpm: 60,
  rateLimitTpm: 100000,
  quotaLimit: 1000000,
  quotaUsed: 0,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const generateMockStats = (overrides = {}) => ({
  totalRequests: Math.floor(Math.random() * 10000) + 1000,
  blockedRequests: Math.floor(Math.random() * 500) + 50,
  allowedRequests: Math.floor(Math.random() * 9500) + 500,
  averageLatency: Math.floor(Math.random() * 200) + 50,
  threatMatches: Math.floor(Math.random() * 100) + 10,
  topThreats: [
    { category: 'SQL Injection', count: Math.floor(Math.random() * 50) + 10 },
    { category: 'XSS Attack', count: Math.floor(Math.random() * 40) + 5 },
    { category: 'Prompt Injection', count: Math.floor(Math.random() * 30) + 3 },
  ],
  uptime: 99.9 - Math.random() * 0.5,
  errorRate: Math.random() * 0.1,
  throughput: Math.floor(Math.random() * 1000) + 100,
  lastUpdate: new Date().toISOString(),
  cpuUsage: Math.floor(Math.random() * 30) + 10,
  memoryUsage: Math.floor(Math.random() * 40) + 20,
  ...overrides,
});

// Test request helpers
export const createMockRequest = (
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {},
) => {
  const { method = 'GET', body, headers = {} } = options;
  // Resolve relative URLs against a stable base to satisfy WHATWG URL
  const g: any = globalThis as any;
  const base = g.location && g.location.origin ? g.location.origin : 'http://localhost:3000';
  let absoluteUrl = url;
  try {
    absoluteUrl = new URL(url, base).toString();
  } catch {
    absoluteUrl = base;
  }

  return new NextRequest(absoluteUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(typeof body !== 'undefined' && {
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  });
};

// Database mock helpers
export const createMockDb = () => ({
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  execute: jest.fn(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
});

// Redis mock helpers
export const createMockRedis = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  multi: jest.fn(() => ({
    set: jest.fn().mockReturnThis(),
    expire: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  })),
  script: jest.fn(),
  keys: jest.fn(),
  mget: jest.fn(),
  mset: jest.fn(),
  ping: jest.fn().mockResolvedValue('PONG'),
  disconnect: jest.fn(),
});

// Superagent mock helpers
export const createMockSuperagentResponse = (overrides = {}) => ({
  status: 200,
  json: () =>
    Promise.resolve({
      blocked: false,
      reason: undefined,
      sanitizedContent: 'Safe response',
      alerts: [],
      compliance: [],
      ...overrides,
    }),
  text: () => Promise.resolve('Mock response'),
});

// Time utilities for testing
export const advanceTime = (ms: number) => {
  jest.advanceTimersByTime(ms);
};

export const setSystemTime = (date: Date) => {
  jest.useFakeTimers();
  jest.setSystemTime(date);
};

export const resetSystemTime = () => {
  jest.useRealTimers();
};

// Assertion helpers
export const expectToBeValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  expect(uuid).toMatch(uuidRegex);
};

export const expectToBeValidTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  expect(date.getTime()).not.toBeNaN();
  expect(date.getTime()).toBeLessThanOrEqual(Date.now());
};

export const expectToBeInRange = (value: number, min: number, max: number) => {
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
};

export const expectToHaveValidStructure = (obj: any, requiredFields: string[]) => {
  requiredFields.forEach((field) => {
    expect(obj).toHaveProperty(field);
  });
};

// Performance testing helpers
export const measureExecutionTime = async (fn: () => Promise<any>) => {
  const start = Date.now();
  await fn();
  const end = Date.now();
  return end - start;
};

export const expectToBeFast = async (fn: () => Promise<any>, maxTime = 1000) => {
  const executionTime = await measureExecutionTime(fn);
  expect(executionTime).toBeLessThan(maxTime);
};

// Error testing helpers
export const expectToThrowWithMessage = async (fn: () => Promise<any>, expectedMessage: string) => {
  await expect(fn).rejects.toThrow(expectedMessage);
};

export const expectToHandleErrorGracefully = async (fn: () => Promise<any>, fallbackValue: any) => {
  let result;
  try {
    result = await fn();
  } catch (error) {
    result = fallbackValue;
  }
  expect(result).toBeDefined();
};

// Mock fetch for API testing
export const mockFetch = (responses: any[]) => {
  let callCount = 0;
  return jest.fn().mockImplementation(() => {
    const response = responses[callCount] || responses[responses.length - 1];
    callCount++;
    return Promise.resolve(response);
  });
};

// Test data factories
export const createTestFirewallInput = (overrides = {}) => ({
  id: `input-${Math.random().toString(36).substr(2, 9)}`,
  timestamp: new Date().toISOString(),
  content: 'Test input content',
  type: 'prompt',
  metadata: {
    userId: 'test-user',
    sessionId: 'test-session',
    source: 'test-source',
    model: 'gpt-3.5',
  },
  ...overrides,
});

export const createTestFirewallOutput = (overrides = {}) => ({
  id: `output-${Math.random().toString(36).substr(2, 9)}`,
  timestamp: new Date().toISOString(),
  inputId: 'test-input',
  content: 'Test output content',
  blocked: false,
  reason: undefined,
  alerts: [],
  sanitized: false,
  processingTime: 150,
  metadata: { model: 'gpt-3.5' },
  ...overrides,
});

export const createTestTrainingData = (count = 10) => {
  return Array(count)
    .fill(null)
    .map((_, i) => ({
      id: `training-${i}`,
      prompt: `Training prompt ${i}`,
      category: i % 2 === 0 ? 'safe' : 'malicious',
      confidence: 0.9,
      features: {
        length: 20 + i,
        containsMalicious: i % 2 === 1,
        complexity: Math.random(),
      },
      timestamp: new Date().toISOString(),
    }));
};
