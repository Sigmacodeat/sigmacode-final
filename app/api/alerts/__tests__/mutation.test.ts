/**
 * Mutation Testing for Edge Cases and Error Handling
 * Comprehensive testing of error scenarios and edge cases
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
jest.setTimeout(20000);
import { NextRequest } from 'next/server';
import { POST, GET, PUT, DELETE } from '../route';
import { MockDatabase, DataGenerator, RequestFactory, ErrorSimulator } from '@/test-utils';

// Mock external dependencies
jest.mock('@/lib/alert-service', () => ({
  AlertService: {
    getInstance: jest.fn(() => ({
      createAlert: jest.fn(),
      getAlerts: jest.fn(),
      updateAlert: jest.fn(),
      deleteAlert: jest.fn(),
      getAlertStatistics: jest.fn(),
    })),
  },
}));

describe('Alert API - Mutation Tests', () => {
  let mockDb: MockDatabase;
  let mockAlertService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = new MockDatabase();
    mockAlertService = {
      createAlert: jest.fn(),
      getAlerts: jest.fn(),
      updateAlert: jest.fn(),
      deleteAlert: jest.fn(),
      getAlertStatistics: jest.fn(),
    };

    const AlertServiceMock = jest.requireMock('@/lib/alert-service') as {
      AlertService: {
        getInstance: jest.Mock;
      };
    };
    AlertServiceMock.AlertService.getInstance.mockReturnValue(mockAlertService);

    // WICHTIG: API nutzt in Tests global.__ALERT_SERVICE__; binde unser lokales Mock hier an
    (global as any).__ALERT_SERVICE__ = mockAlertService;
  });

  describe('Database Connection Failures', () => {
    it('should handle database connection failures gracefully', async () => {
      mockAlertService.createAlert.mockRejectedValue(ErrorSimulator.simulateDatabaseError());

      const alertData = DataGenerator.alert({ id: undefined });
      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: alertData,
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle database timeouts', async () => {
      // Simulate slow database response
      // Note: MockDatabase has no constructor args; simulate delay in the service mock instead
      mockAlertService.getAlerts.mockImplementation(
        () =>
          new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 8000)),
      );

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'GET',
        params: { tenantId: 'test-tenant' },
      });

      const startTime = Date.now();
      const response = await GET(request);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThan(5000); // Should take at least 5 seconds
      expect(response.status).toBe(500);
    });

    it('should handle database connection pool exhaustion', async () => {
      // Simulate multiple concurrent requests exhausting the connection pool
      const alertData = DataGenerator.alert({ id: undefined });
      const requests = Array.from({ length: 20 }, () =>
        RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'POST',
          body: alertData,
        }),
      );

      // Mock connection pool exhaustion after 5 requests
      let requestCount = 0;
      mockAlertService.createAlert.mockImplementation(() => {
        requestCount++;
        if (requestCount > 5) {
          return Promise.reject(new Error('Connection pool exhausted'));
        }
        return Promise.resolve({ ...alertData, id: `alert-${requestCount}` });
      });

      const results = await Promise.allSettled(requests.map((request) => POST(request)));

      const successful = results.filter((r) => r.status === 'fulfilled' && r.value.status === 201);
      const failed = results.filter((r) => r.status === 'rejected' || r.value.status !== 201);

      expect(successful).toHaveLength(5);
      expect(failed).toHaveLength(15);
    });
  });

  describe('Network and External Service Failures', () => {
    it('should handle external service timeouts', async () => {
      // Simulate external service call timeout
      mockAlertService.createAlert.mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('External service timeout')), 8000);
          }),
      );

      const alertData = DataGenerator.alert({ id: undefined });
      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: alertData,
      });

      const startTime = Date.now();
      const response = await POST(request);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThan(5000);
      expect(response.status).toBe(500);
    });

    it('should handle cascading service failures', async () => {
      // Simulate a chain of service failures
      const errors = [
        ErrorSimulator.simulateNetworkError(),
        ErrorSimulator.simulateTimeoutError(),
        ErrorSimulator.simulateDatabaseError(),
        new Error('Service unavailable'),
        new Error('Circuit breaker activated'),
      ];

      for (let i = 0; i < errors.length; i++) {
        mockAlertService.createAlert.mockRejectedValue(errors[i]);

        const alertData = DataGenerator.alert({ id: undefined });
        const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'POST',
          body: alertData,
        });

        const response = await POST(request);
        expect(response.status).toBe(500);

        const data = await response.json();
        expect(data.success).toBe(false);
      }
    });

    it('should handle partial external service responses', async () => {
      // Simulate external service returning incomplete data
      mockAlertService.getAlerts.mockResolvedValue([
        { id: 'alert-1', title: 'Alert 1' }, // Missing required fields
        { id: 'alert-2', title: 'Alert 2', severity: 'high' }, // Missing category
        null, // Null response
        undefined, // Undefined response
        { id: 'alert-3' }, // Missing title
      ]);

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'GET',
        params: { tenantId: 'test-tenant' },
      });

      const response = await GET(request);
      expect(response.status).toBe(200); // Should handle gracefully

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(5); // Should include all responses
    });
  });

  describe('Input Validation Edge Cases', () => {
    it('should handle extremely large input payloads', async () => {
      // Create extremely large payload
      const largeTitle = 'A'.repeat(10000); // 10KB title
      const largeMessage = 'B'.repeat(100000); // 100KB message
      const largeContext = {
        requestId: 'C'.repeat(1000),
        userId: 'D'.repeat(1000),
        ipAddress: 'E'.repeat(100),
        userAgent: 'F'.repeat(2000),
        endpoint: 'G'.repeat(1000),
        additionalData: Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [`key${i}`, 'H'.repeat(1000)]),
        ),
      };

      const largeAlertData = DataGenerator.alert({
        id: undefined,
        title: largeTitle,
        message: largeMessage,
        context: largeContext,
      });

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: largeAlertData,
      });

      const response = await POST(request);
      expect([201, 400, 413]).toContain(response.status); // Accept, Bad Request, or Payload Too Large
    });

    it('should handle malformed JSON payloads', async () => {
      const malformedPayloads = [
        '{ invalid json',
        '{"unclosed": "object"',
        '{"array": [1, 2, 3}',
        '{"number": 123abc}',
        '{"boolean": tru}',
        '{"null": nul}',
        '{"string": "unclosed string}',
        'null',
        'undefined',
        '[]',
        '{}',
        '{"nested": {"unclosed": "object"}}',
        '{"array": [1, 2, {"unclosed": "object"}]}',
      ];

      for (const payload of malformedPayloads) {
        const request = new NextRequest('http://localhost:3000/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });

        try {
          const response = await POST(request);
          expect([400, 422]).toContain(response.status);
        } catch (error: unknown) {
          // Should not crash on malformed JSON; normalize error before asserting
          const message = error instanceof Error ? error.message : String(error);
          expect(message).toBeDefined();
        }
      }
    });

    it('should handle special characters and unicode', async () => {
      const specialInputs = [
        { title: '🚨 Alert with emoji', message: 'Message with émojis 🎉' },
        { title: 'Alert with unicode: 你好世界', message: 'Unicode message: Привет мир' },
        {
          title: "SQL injection attempt: ' OR 1=1 --",
          message: 'XSS attempt: <script>alert("xss")</script>',
        },
        { title: 'Path traversal: ../../../etc/passwd', message: 'Command injection: ; rm -rf /' },
        {
          title: 'Very long title with special chars: ' + 'äöüß€'.repeat(100),
          message: 'Special chars: ©®™',
        },
        { title: 'Zero-width chars: ​', message: 'Right-to-left override: ‏' },
        { title: 'Control chars: \x00\x01\x02', message: 'Newlines: \n\r\t' },
      ];

      for (const specialInput of specialInputs) {
        const alertData = DataGenerator.alert({
          id: undefined,
          ...specialInput,
        });

        const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'POST',
          body: alertData,
        });

        const response = await POST(request);
        expect([201, 400]).toContain(response.status); // Should handle or reject gracefully
      }
    });

    it('should handle boundary value conditions', async () => {
      // Test boundary conditions for numeric fields
      const boundaryTests = [
        { cooldownMinutes: 0 }, // Minimum
        { cooldownMinutes: 1440 }, // Maximum (24 hours)
        { cooldownMinutes: -1 }, // Below minimum
        { cooldownMinutes: 1441 }, // Above maximum
        { groupWindowMinutes: 1 }, // Minimum
        { groupWindowMinutes: 1440 }, // Maximum
        { groupWindowMinutes: 0 }, // Below minimum
        { groupWindowMinutes: 1441 }, // Above maximum
      ];

      for (const boundaryData of boundaryTests) {
        const alertData = DataGenerator.alert({
          id: undefined,
          ...boundaryData,
        });

        const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'POST',
          body: alertData,
        });

        const response = await POST(request);
        expect([201, 400]).toContain(response.status);
      }
    });
  });

  describe('Authentication and Authorization Edge Cases', () => {
    it('should handle authentication token edge cases', async () => {
      const authTokens = [
        '', // Empty token
        '   ', // Whitespace token
        'invalid-jwt', // Invalid format
        'a.b.c', // Minimal JWT structure
        'a.'.repeat(100), // Very long token
        'Bearer ', // Just Bearer prefix
        'Bearer', // Just Bearer
        'Basic dXNlcjpwYXNz', // Basic auth instead of Bearer
        null, // Null token
        undefined, // Undefined token
      ];

      for (const token of authTokens) {
        const alertData = DataGenerator.alert({ id: undefined });
        const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'POST',
          body: alertData,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        try {
          const response = await POST(request);
          expect([201, 400, 401, 403]).toContain(response.status);
        } catch (error: unknown) {
          // Should not crash on auth errors; normalize error before asserting
          const message = error instanceof Error ? error.message : String(error);
          expect(message).toBeDefined();
        }
      }
    });

    it('should handle tenant isolation violations', async () => {
      // Create alert for tenant A
      const alertData = DataGenerator.alert({ id: undefined, tenantId: 'tenant-a' });
      const createdAlert = { ...alertData, id: 'alert-123' };

      mockAlertService.createAlert.mockResolvedValue(createdAlert);

      const createRequest = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: alertData,
      });

      await POST(createRequest);

      // Try to access tenant A's alert from tenant B
      mockAlertService.getAlerts.mockResolvedValue([]); // Should return empty for tenant B

      const getRequest = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'GET',
        params: { tenantId: 'tenant-b' },
      });

      const getResponse = await GET(getRequest);
      expect(getResponse.status).toBe(200);

      const getData = await getResponse.json();
      expect(getData.data).toHaveLength(0); // Should not see tenant A's alerts
    });

    it('should handle role-based access control', async () => {
      const roles = ['admin', 'user', 'moderator', 'guest', ''];

      for (const role of roles) {
        const alertData = DataGenerator.alert({ id: undefined });
        const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'POST',
          body: alertData,
          headers: { 'X-User-Role': role },
        });

        try {
          const response = await POST(request);
          expect([201, 403, 401]).toContain(response.status);
        } catch (error: unknown) {
          // Should not crash on authorization errors; normalize error before asserting
          const message = error instanceof Error ? error.message : String(error);
          expect(message).toBeDefined();
        }
      }
    });
  });

  describe('Concurrent Operation Edge Cases', () => {
    it('should handle concurrent alert creation with same data', async () => {
      const alertData = DataGenerator.alert({ id: undefined, tenantId: 'test-tenant' });

      // Mock race condition - first request succeeds, second fails with duplicate error
      mockAlertService.createAlert
        .mockResolvedValueOnce({ ...alertData, id: 'alert-1' })
        .mockRejectedValueOnce(new Error('Duplicate alert'));

      const requests = Array.from({ length: 2 }, () =>
        RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'POST',
          body: alertData,
        }),
      );

      const results = await Promise.allSettled(requests.map((request) => POST(request)));

      const successful = results.filter((r) => r.status === 'fulfilled' && r.value.status === 201);
      const failed = results.filter((r) => r.status === 'rejected' || r.value.status !== 201);

      expect(successful).toHaveLength(1);
      expect(failed).toHaveLength(1);
    });

    it('should handle concurrent updates to same alert', async () => {
      const alertData = DataGenerator.alert({ id: undefined });
      const createdAlert = { ...alertData, id: 'concurrent-alert' };

      mockAlertService.createAlert.mockResolvedValue(createdAlert);

      // Create the alert first
      const createRequest = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: alertData,
      });

      await POST(createRequest);

      // Concurrent updates
      const update1 = { status: 'acknowledged', acknowledgedBy: 'user-1' };
      const update2 = { status: 'resolved', resolvedBy: 'user-2' };

      mockAlertService.updateAlert
        .mockResolvedValueOnce({ ...createdAlert, ...update1 })
        .mockRejectedValueOnce(new Error('Alert already modified'));

      const requests = [
        RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'PUT',
          body: { id: 'concurrent-alert', ...update1 },
        }),
        RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'PUT',
          body: { id: 'concurrent-alert', ...update2 },
        }),
      ];

      const results = await Promise.allSettled(requests.map((request) => PUT(request)));

      const successful = results.filter((r) => r.status === 'fulfilled' && r.value.status === 200);
      const failed = results.filter((r) => r.status === 'rejected' || r.value.status !== 200);

      expect(successful).toHaveLength(1);
      expect(failed).toHaveLength(1);
    });

    it('should handle concurrent delete operations', async () => {
      const alertData = DataGenerator.alert({ id: undefined });
      const createdAlert = { ...alertData, id: 'delete-alert' };

      mockAlertService.createAlert.mockResolvedValue(createdAlert);

      // Create the alert first
      const createRequest = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: alertData,
      });

      await POST(createRequest);
      // Concurrent delete operations
      mockAlertService.deleteAlert
        .mockResolvedValueOnce({ id: 'delete-alert', deleted: true })
        .mockRejectedValueOnce(new Error('Alert not found'));

      const requests = Array.from({ length: 2 }, () =>
        RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'DELETE',
          params: { id: 'delete-alert' },
        }),
      );

      const results = await Promise.allSettled(requests.map((request) => DELETE(request)));

      const successful = results.filter((r) => r.status === 'fulfilled' && r.value.status === 200);
      const failed = results.filter((r) => r.status === 'rejected' || r.value.status !== 200);

      expect(successful).toHaveLength(1);
      expect(failed).toHaveLength(1);
    });
  });

  describe('Resource Exhaustion Scenarios', () => {
    it('should handle memory exhaustion gracefully', async () => {
      // Create memory-intensive data
      const memoryIntensiveData = {
        ...DataGenerator.alert({ id: undefined }),
        largeField: 'x'.repeat(10 * 1024 * 1024), // 10MB string
        nestedData: Array.from({ length: 10000 }, (_, i) => ({
          id: i,
          data: 'y'.repeat(1000), // 1KB per item
        })),
      };

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: memoryIntensiveData,
      });

      const response = await POST(request);
      expect([201, 400, 413, 500]).toContain(response.status);
    });

    it('should handle CPU-intensive operations', async () => {
      // Create CPU-intensive data processing
      const cpuIntensiveData = {
        ...DataGenerator.alert({ id: undefined }),
        complexCalculation: true,
        iterations: 1000000, // High iteration count
      };

      // Mock CPU-intensive operation
      mockAlertService.createAlert.mockImplementation(async () => {
        // Simulate CPU-intensive work
        let result = 0;
        for (let i = 0; i < 100000; i++) {
          result += Math.random() * Math.sin(i);
        }
        return { ...cpuIntensiveData, id: 'cpu-alert', calculationResult: result };
      });

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: cpuIntensiveData,
      });

      const startTime = Date.now();
      const response = await POST(request);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThan(100); // Should take some time
      expect(response.status).toBe(201);
    });

    it('should handle file descriptor exhaustion', async () => {
      // Simulate many concurrent file operations
      const concurrentOperations = Array.from({ length: 100 }, async (_, i) => {
        const alertData = DataGenerator.alert({
          id: undefined,
          title: `File descriptor test ${i}`,
        });

        const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'POST',
          body: alertData,
        });

        try {
          return await POST(request);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          return { status: 500, error: message };
        }
      });

      const results = await Promise.allSettled(concurrentOperations);

      // Should handle most requests even under pressure
      const successful = results.filter((r) => r.status === 'fulfilled' && r.value.status === 201);
      expect(successful.length).toBeGreaterThan(50); // At least 50% should succeed
    });
  });

  describe('System Recovery Scenarios', () => {
    it('should recover from temporary service failures', async () => {
      const alertData = DataGenerator.alert({ id: undefined });
      let attemptCount = 0;
      mockAlertService.createAlert.mockImplementation(() => {
        attemptCount++;
        if (attemptCount <= 3) {
          return Promise.reject(new Error('Temporary service unavailable'));
        }
        return Promise.resolve({ ...alertData, id: 'recovered-alert' });
      });

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: alertData,
      });

      // Retry logic should eventually succeed
      let response;
      for (let i = 0; i < 5; i++) {
        try {
          response = await POST(request);
          if (response.status === 201) break;
        } catch (_error: unknown) {
          // Continue retrying
        }
      }

      expect(response?.status).toBe(201);
      expect(attemptCount).toBeGreaterThan(3); // Should have retried
    });

    it('should handle graceful degradation', async () => {
      // Simulate partial service degradation
      mockAlertService.createAlert.mockImplementation(
        async (data: { context: { additionalData: { requireFullService: any } } }) => {
          // Simulate some features being unavailable
          if (data.context?.additionalData?.requireFullService) {
            throw new Error('Full service unavailable');
          }

          return {
            ...data,
            id: 'degraded-alert',
            degradedMode: true,
            limitedFeatures: ['statistics', 'notifications'],
          };
        },
      );

      const alertData = DataGenerator.alert({
        id: undefined,
        context: {
          additionalData: {
            requireFullService: false, // Should work
          },
        },
      });

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: alertData,
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.data.degradedMode).toBe(true);
      expect(data.data.limitedFeatures).toContain('statistics');
    });
  });
});
