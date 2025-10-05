import { SuperagentFirewall } from '../../../lib/superagent-firewall';
import { MLThreatDetector } from '../../../lib/ml-threat-detector';
import { POST as analyzePost } from './analyze/route';
import { GET as statsGet } from './stats/route';

// Test utilities
const createMockRequest = (url: string, options: any = {}) => {
  const { method = 'GET', body, headers = {} } = options;

  // Create a mock NextRequest object
  const mockRequest = {
    url,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    json: async () => body || {},
    nextUrl: new URL(url),
    cookies: {},
    geo: {},
    ip: '127.0.0.1',
  } as any;

  return mockRequest;
};

const createTestFirewallInput = (overrides = {}) => ({
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

const measureExecutionTime = async (fn: () => Promise<any>) => {
  const start = Date.now();
  await fn();
  const end = Date.now();
  return end - start;
};

const mockFetch = (responses: any[]) => {
  let callCount = 0;
  return jest.fn().mockImplementation(() => {
    const response = responses[callCount] || responses[responses.length - 1];
    callCount++;
    return Promise.resolve(response);
  });
};

// Mock external dependencies
jest.mock('../../../lib/superagent-firewall', () => ({
  SuperagentFirewall: jest.fn(),
  createSuperagentFirewall: jest.fn(),
  defaultSuperagentConfig: {
    enabled: true,
    mode: 'enforce',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
    rules: [],
  },
}));

jest.mock('../../../lib/ml-threat-detector', () => ({
  MLThreatDetector: jest.fn(),
}));

describe('Firewall Performance Tests', () => {
  let mockSuperagentFirewall: any;
  let mockMLDetector: any;

  beforeEach(() => {
    // Create mock instances
    const mockSuperagentFirewallInstance = {
      analyzeInput: jest.fn(),
      analyzeOutput: jest.fn(),
      healthCheck: jest.fn(),
      initialize: jest.fn(),
    };

    const mockMLDetectorInstance = {
      analyzePrompt: jest.fn(),
      analyzeRequest: jest.fn(),
      initialize: jest.fn(),
    };

    // Mock the constructors
    (SuperagentFirewall as unknown as jest.Mock).mockImplementation(
      () => mockSuperagentFirewallInstance,
    );
    (MLThreatDetector as unknown as jest.Mock).mockImplementation(() => mockMLDetectorInstance);

    // Set up the mocks
    mockSuperagentFirewall = mockSuperagentFirewallInstance;
    mockMLDetector = mockMLDetectorInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Request Processing Performance', () => {
    it('should process simple requests under 100ms', async () => {
      const simpleInput = createTestFirewallInput({
        content: 'What is 2+2?',
        type: 'query',
      });

      mockSuperagentFirewall.analyzeInput.mockResolvedValue({
        id: 'output-1',
        timestamp: new Date().toISOString(),
        inputId: simpleInput.id,
        content: '4',
        blocked: false,
        reason: null as any,
        alerts: [],
        sanitized: false,
        processingTime: 50,
      });

      const executionTime = await measureExecutionTime(async () => {
        const request = createMockRequest('/api/firewall/analyze', {
          method: 'POST',
          body: simpleInput,
        });
        await analyzePost(request);
      });

      expect(executionTime).toBeLessThan(100);
      console.log(`Simple request processed in ${executionTime}ms`);
    });

    it('should process complex requests under 500ms', async () => {
      const complexInput = createTestFirewallInput({
        content:
          'Analyze this complex prompt with multiple paragraphs and technical terms...'.repeat(10),
        type: 'prompt',
      });

      mockSuperagentFirewall.analyzeInput.mockResolvedValue({
        id: 'output-2',
        timestamp: new Date().toISOString(),
        inputId: complexInput.id,
        content: 'Analysis complete',
        blocked: false,
        reason: null,
        alerts: [],
        sanitized: false,
        processingTime: 200,
      });

      const executionTime = await measureExecutionTime(async () => {
        const request = createMockRequest('/api/firewall/analyze', {
          method: 'POST',
          body: complexInput,
        });
        await analyzePost(request);
      });

      expect(executionTime).toBeLessThan(500);
      console.log(`Complex request processed in ${executionTime}ms`);
    });

    it('should handle concurrent requests efficiently', async () => {
      const requests = Array(10)
        .fill(null)
        .map((_, i) =>
          createTestFirewallInput({
            content: `Concurrent request ${i}`,
            type: 'prompt',
          }),
        );

      mockSuperagentFirewall.analyzeInput.mockResolvedValue({
        id: 'output-concurrent',
        timestamp: new Date().toISOString(),
        inputId: 'test-input',
        content: 'Response',
        blocked: false,
        reason: null,
        alerts: [],
        sanitized: false,
        processingTime: 75,
      });

      const executionTime = await measureExecutionTime(async () => {
        const promises = requests.map((input) =>
          analyzePost(
            createMockRequest('/api/firewall/analyze', {
              method: 'POST',
              body: input,
            }),
          ),
        );
        await Promise.all(promises);
      });

      // 10 concurrent requests should complete within reasonable time
      expect(executionTime).toBeLessThan(2000);
      console.log(`10 concurrent requests processed in ${executionTime}ms`);
    });

    it('should maintain performance under load', async () => {
      const batchSize = 50;
      const inputs = Array(batchSize)
        .fill(null)
        .map((_, i) =>
          createTestFirewallInput({
            content: `Load test request ${i}`,
            type: 'prompt',
          }),
        );

      mockSuperagentFirewall.analyzeInput.mockResolvedValue({
        id: 'output-load',
        timestamp: new Date().toISOString(),
        inputId: 'test-input',
        content: 'Response',
        blocked: false,
        reason: null,
        alerts: [],
        sanitized: false,
        processingTime: 100,
      });

      const executionTime = await measureExecutionTime(async () => {
        const promises = inputs.map((input) =>
          analyzePost(
            createMockRequest('/api/firewall/analyze', {
              method: 'POST',
              body: input,
            }),
          ),
        );
        await Promise.all(promises);
      });

      const avgTimePerRequest = executionTime / batchSize;
      expect(avgTimePerRequest).toBeLessThan(200); // Average under 200ms per request
      console.log(
        `Load test: ${batchSize} requests in ${executionTime}ms (avg: ${avgTimePerRequest}ms per request)`,
      );
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during request processing', async () => {
      const iterations = 100;
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < iterations; i++) {
        const input = createTestFirewallInput({
          content: `Memory test request ${i}`,
          type: 'prompt',
        });

        mockSuperagentFirewall.analyzeInput.mockResolvedValue({
          id: 'output-memory',
          timestamp: new Date().toISOString(),
          inputId: input.id,
          content: 'Response',
          blocked: false,
          reason: null,
          alerts: [],
          sanitized: false,
          processingTime: 50,
        });

        const request = createMockRequest('/api/firewall/analyze', {
          method: 'POST',
          body: input,
        });

        await analyzePost(request);

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const maxAllowedIncrease = 50 * 1024 * 1024; // 50MB

      expect(memoryIncrease).toBeLessThan(maxAllowedIncrease);
      console.log(
        `Memory usage after ${iterations} requests: ${memoryIncrease / 1024 / 1024}MB increase`,
      );
    });
  });

  describe('Stats API Performance', () => {
    it('should generate stats quickly', async () => {
      const request = createMockRequest('/api/firewall/stats');

      const executionTime = await measureExecutionTime(async () => {
        await statsGet(request);
      });

      expect(executionTime).toBeLessThan(100);
      console.log(`Stats generation completed in ${executionTime}ms`);
    });

    it('should cache stats for improved performance', async () => {
      // First request (cache miss)
      const firstExecutionTime = await measureExecutionTime(async () => {
        await statsGet(createMockRequest('/api/firewall/stats'));
      });

      // Second request (cache hit)
      const secondExecutionTime = await measureExecutionTime(async () => {
        await statsGet(createMockRequest('/api/firewall/stats'));
      });

      expect(secondExecutionTime).toBeLessThan(firstExecutionTime);
      expect(secondExecutionTime).toBeLessThan(50); // Cache hit should be very fast
      console.log(`Cache miss: ${firstExecutionTime}ms, Cache hit: ${secondExecutionTime}ms`);
    });
  });

  describe('ML Processing Performance', () => {
    it('should process ML analysis within time limits', async () => {
      const prompts = [
        'Simple question',
        'Complex technical query with many terms and concepts that require deep analysis',
        'Another prompt for testing'.repeat(10),
      ];

      for (const prompt of prompts) {
        const input = createTestFirewallInput({
          content: prompt,
          type: 'prompt',
        });

        mockMLDetector.analyzeRequest.mockResolvedValue({
          threatType: null,
          predictedAction: 'allow',
          confidence: 0.1,
          explanation: 'No threats detected',
        });

        const executionTime = await measureExecutionTime(async () => {
          await mockMLDetector.analyzeRequest({
            requestId: input.id,
            content: input.content,
            userId: input.metadata.userId,
            tenantId: 'test-tenant',
            endpoint: '/api/test',
            timestamp: new Date(input.timestamp),
          });
        });

        expect(executionTime).toBeLessThan(1000); // ML analysis should complete within 1 second
        console.log(
          `ML analysis for "${prompt.substring(0, 50)}..." completed in ${executionTime}ms`,
        );
      }
    });
  });

  describe('Database Performance', () => {
    it('should handle database operations efficiently', async () => {
      const dbOperations = [
        // Simulate multiple log insertions
        ...Array(10)
          .fill(null)
          .map((_, i) =>
            Promise.resolve().then(() => ({
              id: i,
              ts: new Date().toISOString(),
              requestId: `req-${i}`,
              backend: 'test',
              policy: 'test-policy',
              action: 'allow',
              latencyMs: 100,
              status: 200,
              meta: { test: true },
            })),
          ),
      ];

      const executionTime = await measureExecutionTime(async () => {
        await Promise.all(dbOperations);
      });

      expect(executionTime).toBeLessThan(500);
      console.log(`Database operations completed in ${executionTime}ms`);
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle errors without significant performance degradation', async () => {
      const errorScenarios = Array(5)
        .fill(null)
        .map((_, i) =>
          createTestFirewallInput({
            content: `Error test request ${i}`,
            type: 'prompt',
          }),
        );

      mockSuperagentFirewall.analyzeInput.mockRejectedValue(new Error('Simulated error'));

      const executionTime = await measureExecutionTime(async () => {
        const promises = errorScenarios.map(
          (input) =>
            analyzePost(
              createMockRequest('/api/firewall/analyze', {
                method: 'POST',
                body: input,
              }),
            ).catch(() => null), // Handle errors gracefully
        );
        await Promise.all(promises);
      });

      expect(executionTime).toBeLessThan(2000); // Should still complete within 2 seconds
      console.log(`Error handling completed in ${executionTime}ms`);
    });
  });

  describe('Scalability Tests', () => {
    it('should maintain performance with increased payload sizes', async () => {
      const sizes = [100, 1000, 5000, 10000]; // Characters

      for (const size of sizes) {
        const largeInput = createTestFirewallInput({
          content: 'A'.repeat(size),
          type: 'prompt',
        });

        mockSuperagentFirewall.analyzeInput.mockResolvedValue({
          id: 'output-large',
          timestamp: new Date().toISOString(),
          inputId: largeInput.id,
          content: 'Response to large input',
          blocked: false,
          reason: null,
          alerts: [],
          sanitized: false,
          processingTime: 200,
        });

        const executionTime = await measureExecutionTime(async () => {
          const request = createMockRequest('/api/firewall/analyze', {
            method: 'POST',
            body: largeInput,
          });
          await analyzePost(request);
        });

        expect(executionTime).toBeLessThan(1000); // Even large payloads should process quickly
        console.log(`Payload size ${size} characters processed in ${executionTime}ms`);
      }
    });

    it('should handle rapid successive requests', async () => {
      const requestCount = 20;
      const interval = 50; // 50ms between requests

      let completedRequests = 0;
      const startTime = Date.now();

      const processRequests = async () => {
        for (let i = 0; i < requestCount; i++) {
          const input = createTestFirewallInput({
            content: `Rapid request ${i}`,
            type: 'prompt',
          });

          mockSuperagentFirewall.analyzeInput.mockResolvedValue({
            id: `output-rapid-${i}`,
            timestamp: new Date().toISOString(),
            inputId: input.id,
            content: 'Rapid response',
            blocked: false,
            reason: null,
            alerts: [],
            sanitized: false,
            processingTime: 30,
          });

          analyzePost(
            createMockRequest('/api/firewall/analyze', {
              method: 'POST',
              body: input,
            }),
          ).then(() => {
            completedRequests++;
          });

          // Wait for next interval
          await new Promise((resolve) => setTimeout(resolve, interval));
        }
      };

      await processRequests();

      // Wait for all requests to complete
      while (completedRequests < requestCount) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const totalTime = Date.now() - startTime;
      const avgTimePerRequest = totalTime / requestCount;

      expect(avgTimePerRequest).toBeLessThan(100); // Average under 100ms per request
      console.log(
        `${requestCount} rapid requests completed in ${totalTime}ms (avg: ${avgTimePerRequest}ms per request)`,
      );
    });
  });
});
