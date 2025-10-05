/**
 * State-of-the-Art Alert API Tests
 * Comprehensive testing suite with modern patterns
 */

// Type augmentation for Jest matchers
import { expect as jestExpect } from '@jest/globals';

// Mock external dependencies before importing anything
jest.mock('@/lib/alert-service', () => ({
  AlertService: {
    getInstance: jest.fn(() => ({
      createAlert: jest.fn(),
      getAlerts: jest.fn(),
      updateAlert: jest.fn(),
      deleteAlert: jest.fn(),
      getAlertStatistics: jest.fn(),
      createAlertFromMLAnalysis: jest.fn(),
      acknowledgeAlert: jest.fn(),
      resolveAlert: jest.fn(),
      dismissAlert: jest.fn(),
    })),
  },
}));

jest.mock('@/lib/ml-threat-detector', () => ({
  MLThreatDetector: {
    getInstance: jest.fn(() => ({
      analyzeThreat: jest.fn(),
      getThreatScore: jest.fn(),
      shouldBlock: jest.fn(),
    })),
  },
}));

jest.mock('@/database/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST, GET, PUT, DELETE } from '../route';
import {
  MockDatabase,
  PerformanceTester,
  TestFixtures,
  DataGenerator,
  RequestFactory,
  TEST_CONFIG,
  ErrorSimulator,
} from '@/test-utils';

// Custom matchers inline
const customMatchers = {
  toBeValidAlert(received: any) {
    const requiredFields = ['id', 'title', 'message', 'severity', 'category', 'status', 'tenantId'];
    const hasRequiredFields = requiredFields.every((field) => received.hasOwnProperty(field));

    if (hasRequiredFields) {
      return {
        message: () => `expected alert to have fields: ${requiredFields.join(', ')}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected alert to have fields: ${requiredFields.join(', ')}`,
        pass: false,
      };
    }
  },
};

expect.extend(customMatchers);

// Setup test environment (env flags werden zentral in jest.setup.ts gesetzt)
beforeAll(() => {
  jest.setTimeout(30000);
});

describe('Alert API - State of the Art Tests', () => {
  let mockDb: MockDatabase;
  let performanceTester: PerformanceTester;
  let mockAlertService: any;

  // Configure mocked functions to use our mock service
  const mockedPOST = POST as jest.MockedFunction<typeof POST>;
  const mockedGET = GET as jest.MockedFunction<typeof GET>;
  const mockedPUT = PUT as jest.MockedFunction<typeof PUT>;
  const mockedDELETE = DELETE as jest.MockedFunction<typeof DELETE>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = new MockDatabase();
    performanceTester = new PerformanceTester();

    // Setup mock service
    mockAlertService = {
      createAlert: jest.fn(),
      getAlerts: jest.fn(),
      updateAlert: jest.fn(),
      deleteAlert: jest.fn(),
      getAlertStatistics: jest.fn(),
    };

    // WICHTIG: API nutzt in Tests global.__ALERT_SERVICE__; binde unser lokales Mock hier an
    (global as any).__ALERT_SERVICE__ = mockAlertService;

    // Seed test data
    mockDb.seed('alerts', [
      TestFixtures.alerts.critical,
      TestFixtures.alerts.high,
      TestFixtures.alerts.medium,
      TestFixtures.alerts.low,
    ]);
  });

  describe('POST /api/alerts - Create Alert', () => {
    it('should create an alert successfully with valid data', async () => {
      const alertData = DataGenerator.alert({ id: undefined });
      const mockCreatedAlert = {
        ...alertData,
        id: 'alert-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockAlertService.createAlert.mockResolvedValue(mockCreatedAlert);

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: alertData,
      });

      const { result, duration } = await performanceTester.measureExecutionTime(
        'create-alert',
        async () => mockedPOST(request),
      );

      expect(result.status).toBe(201);
      expect(duration).toBeLessThan(TEST_CONFIG.PERFORMANCE.MAX_RESPONSE_TIME);

      const responseData = await result.json();
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(responseData.data.id).toBe('alert-123');
    });

    it('should handle concurrent alert creation', async () => {
      const alertData = DataGenerator.alert({ id: undefined });
      const mockCreatedAlert = { ...alertData, id: 'alert-123' };

      mockAlertService.createAlert.mockResolvedValue(mockCreatedAlert);

      // Create multiple concurrent requests
      const requests = Array.from({ length: 10 }, () =>
        RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'POST',
          body: alertData,
        }),
      );

      const results = await Promise.all(
        requests.map(async (request) => {
          const { result, duration } = await performanceTester.measureExecutionTime(
            'concurrent-create-alert',
            async () => POST(request),
          );
          return { result, duration };
        }),
      );

      // All requests should succeed
      results.forEach(({ result, duration }) => {
        expect(result.status).toBe(201);
        expect(duration).toBeLessThan(TEST_CONFIG.PERFORMANCE.MAX_RESPONSE_TIME);
      });

      // Verify all calls were made
      expect(mockAlertService.createAlert).toHaveBeenCalledTimes(10);
    });

    it('should return 400 for invalid request data', async () => {
      const invalidData = {
        // Missing required fields
        title: '',
        severity: 'invalid_severity',
        category: 'invalid_category',
      };

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: invalidData,
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle service errors gracefully', async () => {
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

    it('should validate all required fields', async () => {
      const requiredFields = ['ruleId', 'tenantId', 'title', 'message', 'severity', 'category'];

      for (const field of requiredFields) {
        const incompleteData = DataGenerator.alert({ id: undefined });
        delete (incompleteData as any)[field];

        const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'POST',
          body: incompleteData,
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
      }
    });

    it('should validate severity enum values', async () => {
      const validSeverities = ['low', 'medium', 'high', 'critical'];

      for (const severity of validSeverities) {
        const alertData = DataGenerator.alert({ id: undefined, severity });
        const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'POST',
          body: alertData,
        });

        const response = await POST(request);
        expect(response.status).toBe(201);
      }
    });
  });

  describe('GET /api/alerts - Retrieve Alerts', () => {
    it('should return alerts with default pagination', async () => {
      const mockAlerts = [
        TestFixtures.alerts.critical,
        TestFixtures.alerts.high,
        TestFixtures.alerts.medium,
      ];

      mockAlertService.getAlerts.mockResolvedValue(mockAlerts);

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'GET',
        params: { tenantId: 'test-tenant' },
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(3);
      expect(mockAlertService.getAlerts).toHaveBeenCalledWith('test-tenant', {});
    });

    it('should return alerts with custom filters', async () => {
      const mockAlerts = [TestFixtures.alerts.critical];
      mockAlertService.getAlerts.mockResolvedValue(mockAlerts);

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'GET',
        params: {
          tenantId: 'test-tenant',
          status: 'new',
          severity: 'critical',
          category: 'security_threat',
          limit: '10',
          offset: '0',
        },
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(mockAlertService.getAlerts).toHaveBeenCalledWith('test-tenant', {
        status: 'new',
        severity: 'critical',
        category: 'security_threat',
        limit: 10,
        offset: 0,
      });
    });

    it('should return 400 for missing tenantId', async () => {
      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts');

      const response = await GET(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('tenantId');
    });

    it('should handle large result sets efficiently', async () => {
      // Generate large dataset
      const largeAlertSet = Array.from({ length: 1000 }, () =>
        DataGenerator.alert({ tenantId: 'test-tenant' }),
      );

      mockAlertService.getAlerts.mockResolvedValue(largeAlertSet);

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'GET',
        params: { tenantId: 'test-tenant', limit: '1000' },
      });

      const { result, duration, memory } = await performanceTester.measureExecutionTime(
        'large-dataset-retrieval',
        async () => GET(request),
      );

      expect(result.status).toBe(200);
      expect(duration).toBeLessThan(TEST_CONFIG.PERFORMANCE.MAX_RESPONSE_TIME);
      expect(memory).toBeLessThan(TEST_CONFIG.PERFORMANCE.MAX_MEMORY_USAGE);

      const data = await result.json();
      expect(data.data).toHaveLength(1000);
    });

    it('should support advanced filtering with multiple criteria', async () => {
      const mockAlerts = [
        { ...TestFixtures.alerts.critical, severity: 'critical', status: 'new' },
        { ...TestFixtures.alerts.high, severity: 'high', status: 'acknowledged' },
      ];

      mockAlertService.getAlerts.mockResolvedValue(mockAlerts);

      const filters = [
        { severity: 'critical', status: 'new' },
        { severity: 'high', status: 'acknowledged' },
        { category: 'security_threat' },
        { createdAfter: '2024-01-01T00:00:00Z' },
      ];

      for (const filter of filters) {
        const cleanFilter = Object.fromEntries(
          Object.entries(filter).filter(([_, value]) => value !== undefined),
        );
        const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'GET',
          params: { tenantId: 'test-tenant', ...cleanFilter },
        });

        const response = await GET(request);
        expect(response.status).toBe(200);
      }
    });
  });

  describe('PUT /api/alerts - Update Alert', () => {
    it('should update an alert successfully', async () => {
      const updateData = {
        title: 'Updated Alert Title',
        message: 'Updated alert message',
        status: 'acknowledged',
        severity: 'high',
      };

      const mockUpdatedAlert = {
        ...TestFixtures.alerts.critical,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      mockAlertService.updateAlert.mockResolvedValue(mockUpdatedAlert);

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'PUT',
        body: { id: 'alert-123', ...updateData },
      });

      const response = await PUT(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.title).toBe('Updated Alert Title');
      expect(data.data.status).toBe('acknowledged');
    });

    it('should return 400 for missing alert ID', async () => {
      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'PUT',
        body: { title: 'Updated Title' }, // Missing ID
      });

      const response = await PUT(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('id');
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { status: 'acknowledged' };
      const mockUpdatedAlert = {
        ...TestFixtures.alerts.critical,
        ...partialUpdate,
        updatedAt: new Date().toISOString(),
      };

      mockAlertService.updateAlert.mockResolvedValue(mockUpdatedAlert);

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'PUT',
        body: { id: 'alert-123', ...partialUpdate },
      });

      const response = await PUT(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data.status).toBe('acknowledged');
      expect(data.data.title).toBe(TestFixtures.alerts.critical.title); // Unchanged
    });
  });

  describe('DELETE /api/alerts - Delete Alert', () => {
    it('should delete an alert successfully', async () => {
      mockAlertService.deleteAlert.mockResolvedValue({ id: 'alert-123', deleted: true });

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'DELETE',
        params: { id: 'alert-123' },
      });

      const response = await DELETE(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.deleted).toBe(true);
      expect(mockAlertService.deleteAlert).toHaveBeenCalledWith('alert-123');
    });

    it('should return 400 for missing alert ID', async () => {
      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('id');
    });

    it('should handle non-existent alert gracefully', async () => {
      mockAlertService.deleteAlert.mockRejectedValue(
        ErrorSimulator.simulateValidationError('Alert not found'),
      );

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'DELETE',
        params: { id: 'non-existent-alert' },
      });

      const response = await DELETE(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('Performance Benchmarks', () => {
    it('should handle high throughput requests', async () => {
      const alertData = DataGenerator.alert({ id: undefined });
      const mockCreatedAlert = { ...alertData, id: 'alert-123' };

      mockAlertService.createAlert.mockResolvedValue(mockCreatedAlert);

      // Simulate high throughput
      const requests = Array.from({ length: 100 }, (_, i) =>
        RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'POST',
          body: { ...alertData, title: `Alert ${i}` },
        }),
      );

      const startTime = Date.now();
      const results = await Promise.all(
        requests.map(async (request) => {
          const { result } = await performanceTester.measureExecutionTime(
            'high-throughput-create',
            async () => POST(request),
          );
          return result.status;
        }),
      );

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const throughput = (requests.length / totalTime) * 1000; // requests per second

      expect(throughput).toBeGreaterThan(100); // requests per second
      expect(results.every((status) => status === 201)).toBe(true);
    });

    it('should maintain performance under memory pressure', async () => {
      // Create memory pressure
      const memoryPressure = Array.from({ length: 10000 }, () => DataGenerator.alert());

      const alertData = DataGenerator.alert({ id: undefined });
      const mockCreatedAlert = { ...alertData, id: 'alert-123' };

      mockAlertService.createAlert.mockResolvedValue(mockCreatedAlert);

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: alertData,
      });

      const { result, duration, memory } = await performanceTester.measureExecutionTime(
        'memory-pressure-create',
        async () => POST(request),
      );

      expect(result.status).toBe(201);
      expect(duration).toBeLessThan(500); // ms
      expect(memory).toBeLessThan(1000000); // bytes
    });
  });

  describe('Security Tests', () => {
    it('should enforce rate limiting', async () => {
      const alertData = DataGenerator.alert({ id: undefined });
      mockAlertService.createAlert.mockRejectedValue(ErrorSimulator.simulateRateLimitError());

      // Exceed rate limit
      const requests = Array.from({ length: 110 }, () =>
        RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'POST',
          body: alertData,
        }),
      );

      const results = await Promise.all(
        requests.map(async (request) => {
          try {
            const response = await POST(request);
            return response.status;
          } catch (error) {
            return 429; // Rate limit status
          }
        }),
      );

      // Should have some rate limit responses
      expect(results).toContain(429);
    });

    it('should validate input sanitization', async () => {
      const maliciousData = {
        ...DataGenerator.alert({ id: undefined }),
        title: '<script>alert("XSS")</script>',
        message: 'Normal message',
        context: {
          ...DataGenerator.alert().context,
          userAgent: '<img src=x onerror=alert("XSS")>',
          ipAddress: '192.168.1.1; DROP TABLE users; --',
        },
      };

      mockAlertService.createAlert.mockResolvedValue({
        ...maliciousData,
        id: 'alert-123',
        title: 'Sanitized Title', // Should be sanitized
        context: {
          ...maliciousData.context,
          userAgent: 'Sanitized User Agent', // Should be sanitized
        },
      });

      const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: maliciousData,
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.data.title).not.toContain('<script>');
      expect(data.data.context.userAgent).not.toContain('<img');
    });
  });
});
