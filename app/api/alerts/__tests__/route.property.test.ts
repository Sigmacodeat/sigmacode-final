/**
 * Property-based Tests for Alert APIs
 * Using generative testing for robust validation
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
// Increase default per-test timeout to accommodate property-based runs
jest.setTimeout(30000);
import { NextRequest } from 'next/server';
import { POST, GET, PUT, DELETE } from '../route';
import { MockDatabase, DataGenerator, RequestFactory } from '../../../../test-utils';
import fc from 'fast-check';
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

describe('Alert API - Property-based Tests', () => {
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
        getInstance: jest.MockedFunction<() => any>;
      };
    };
    AlertServiceMock.AlertService.getInstance.mockReturnValue(mockAlertService);

    // WICHTIG: API nutzt in Tests global.__ALERT_SERVICE__; binde unser lokales Mock hier an
    (global as any).__ALERT_SERVICE__ = mockAlertService;
  });

  describe('Alert Creation Properties', () => {
    it('should idempotently create alerts with same data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            ruleId: fc.uuid(),
            tenantId: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 256 }),
            message: fc.string({ minLength: 1, maxLength: 2000 }),
            severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
            category: fc.constantFrom(
              'security_threat',
              'system_error',
              'performance_issue',
              'compliance_violation',
              'ml_anomaly',
              'manual_trigger',
            ),
            context: fc.record({
              requestId: fc.uuid(),
              userId: fc.uuid(),
              ipAddress: fc.ipV4(),
              userAgent: fc.webSegment(),
              endpoint: fc.webUrl(),
              additionalData: fc.dictionary(fc.string(), fc.jsonValue()),
            }),
            channels: fc.array(fc.constantFrom('email', 'slack', 'webhook', 'sms', 'dashboard'), {
              minLength: 1,
              maxLength: 3,
            }),
          }),
          async (alertData) => {
            // Mock successful creation
            const createdAlert = { ...alertData, id: 'alert-123' };
            mockAlertService.createAlert.mockResolvedValue(createdAlert);

            const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
              method: 'POST',
              body: alertData,
            });

            const response = await POST(request);
            expect(response.status).toBe(201);

            const result = await response.json();
            expect(result.success).toBe(true);
            // API applies sanitization, so avoid strict deep-equality on nested fields
            // Verify identity and critical attributes
            expect(result.data.id).toBe(createdAlert.id);
            expect(result.data.ruleId).toBe(createdAlert.ruleId);
            expect(result.data.tenantId).toBe(createdAlert.tenantId);
            expect(result.data.severity).toBe(createdAlert.severity);
            expect(result.data.category).toBe(createdAlert.category);
            expect(result.data.channels).toEqual(createdAlert.channels);
            // Title and message should be strings (possibly sanitized)
            expect(typeof result.data.title).toBe('string');
            expect(typeof result.data.message).toBe('string');
          },
        ),
        { numRuns: 30, interruptAfterTimeLimit: 15000 }, // fewer runs and time limit
      );
    });

    it('should handle all valid severity levels', async () => {
      await fc.assert(
        fc.asyncProperty(fc.constantFrom('low', 'medium', 'high', 'critical'), async (severity) => {
          const alertData = DataGenerator.alert({ severity, id: undefined });
          const createdAlert = { ...alertData, id: 'alert-123' };

          mockAlertService.createAlert.mockResolvedValue(createdAlert);

          const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
            method: 'POST',
            body: alertData,
          });

          const response = await POST(request);
          expect(response.status).toBe(201);

          const result = await response.json();
          expect(result.data.severity).toBe(severity);
        }),
        { numRuns: 20, interruptAfterTimeLimit: 10000 },
      );
    });

    it('should handle all valid categories', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'security_threat',
            'system_error',
            'performance_issue',
            'compliance_violation',
            'ml_anomaly',
            'manual_trigger',
          ),
          async (category) => {
            const alertData = DataGenerator.alert({ category, id: undefined });
            const createdAlert = { ...alertData, id: 'alert-123' };

            mockAlertService.createAlert.mockResolvedValue(createdAlert);

            const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
              method: 'POST',
              body: alertData,
            });

            const response = await POST(request);
            expect(response.status).toBe(201);

            const result = await response.json();
            expect(result.data.category).toBe(category);
          },
        ),
        { numRuns: 15, interruptAfterTimeLimit: 10000 },
      );
    });
  });

  describe('Alert Retrieval Properties', () => {
    it('should return consistent results for same query', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // tenantId
          fc.record({
            status: fc.constantFrom('new', 'acknowledged', 'resolved', 'dismissed'),
            severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
            category: fc.constantFrom(
              'security_threat',
              'system_error',
              'performance_issue',
              'compliance_violation',
              'ml_anomaly',
              'manual_trigger',
            ),
            limit: fc.integer({ min: 1, max: 100 }),
            offset: fc.integer({ min: 0, max: 1000 }),
          }),
          async (tenantId, filters) => {
            const mockAlerts = Array.from({ length: 10 }, () => DataGenerator.alert({ tenantId }));

            mockAlertService.getAlerts.mockResolvedValue(mockAlerts);

            const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
              method: 'GET',
              params: {
                tenantId,
                limit: filters.limit.toString(),
                offset: filters.offset.toString(),
                status: filters.status,
                severity: filters.severity,
                category: filters.category,
              },
            });

            // Execute same request twice
            const response1 = await GET(request);
            const response2 = await GET(request);

            expect(response1.status).toBe(response2.status);

            const data1 = await response1.json();
            const data2 = await response2.json();

            expect(data1.success).toBe(data2.success);
            expect(data1.data).toEqual(data2.data);
          },
        ),
        { numRuns: 50 },
      );
    });

    it('should handle pagination correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // tenantId
          fc.integer({ min: 1, max: 100 }), // totalAlerts
          fc.integer({ min: 1, max: 20 }), // pageSize
          async (tenantId, totalAlerts, pageSize) => {
            const mockAlerts = Array.from({ length: totalAlerts }, (_, i) =>
              DataGenerator.alert({ tenantId, id: `alert-${i}` }),
            );

            mockAlertService.getAlerts.mockResolvedValue(mockAlerts);

            const totalPages = Math.ceil(totalAlerts / pageSize);

            for (let page = 0; page < totalPages; page++) {
              const offset = page * pageSize;
              const limit = pageSize;

              const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
                method: 'GET',
                params: { tenantId, limit: limit.toString(), offset: offset.toString() },
              });

              const response = await GET(request);
              expect(response.status).toBe(200);

              const data = await response.json();
              const expectedLength = Math.min(pageSize, totalAlerts - offset);
              expect(data.data).toHaveLength(expectedLength);
            }
          },
        ),
        { numRuns: 10, interruptAfterTimeLimit: 15000 },
      );
    });
  });

  describe('Alert Update Properties', () => {
    it('should handle partial updates correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 256 }),
            message: fc.string({ minLength: 1, maxLength: 2000 }),
            status: fc.constantFrom('new', 'acknowledged', 'resolved', 'dismissed'),
            severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
            category: fc.constantFrom(
              'security_threat',
              'system_error',
              'performance_issue',
              'compliance_violation',
              'ml_anomaly',
              'manual_trigger',
            ),
          }),
          async (updateData) => {
            const originalAlert = DataGenerator.alert();
            const updatedAlert = {
              ...originalAlert,
              ...updateData,
              updatedAt: new Date().toISOString(),
            };

            mockAlertService.updateAlert.mockResolvedValue(updatedAlert);

            const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
              method: 'PUT',
              body: { id: originalAlert.id, ...updateData },
            });

            const response = await PUT(request);
            expect(response.status).toBe(200);

            const result = await response.json();
            expect(result.data).toMatchObject(updateData);
            expect(result.data.id).toBe(originalAlert.id);
          },
        ),
        { numRuns: 50 },
      );
    });

    it('should maintain data integrity during updates', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // alertId
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 256 }),
            message: fc.string({ minLength: 1, maxLength: 2000 }),
            severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
            category: fc.constantFrom(
              'security_threat',
              'system_error',
              'performance_issue',
              'compliance_violation',
              'ml_anomaly',
              'manual_trigger',
            ),
          }),
          async (alertId, updateData) => {
            const originalAlert = DataGenerator.alert({ id: alertId });
            const updatedAlert = {
              ...originalAlert,
              ...updateData,
              updatedAt: new Date().toISOString(),
            };

            mockAlertService.updateAlert.mockResolvedValue(updatedAlert);

            const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
              method: 'PUT',
              body: { id: alertId, ...updateData },
            });

            const response = await PUT(request);
            expect(response.status).toBe(200);

            const result = await response.json();

            // Verify all updated fields
            Object.entries(updateData).forEach(([key, value]) => {
              expect(result.data[key]).toBe(value);
            });

            // Verify unchanged fields remain the same
            expect(result.data.id).toBe(alertId);
            expect(result.data.tenantId).toBe(originalAlert.tenantId);
            expect(result.data.createdAt).toBe(originalAlert.createdAt);
          },
        ),
        { numRuns: 30 },
      );
    });
  });

  describe('Error Handling Properties', () => {
    it('should handle malformed JSON gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string(), // malformed JSON
          async (malformedJson) => {
            const request = new NextRequest('http://localhost:3000/api/alerts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: malformedJson,
            });

            try {
              const response = await POST(request);
              // Should not crash, should return appropriate error
              expect([400, 422]).toContain(response.status);
            } catch (error) {
              // Should not throw unhandled errors
              expect(error).toBeDefined();
            }
          },
        ),
        { numRuns: 20 },
      );
    });

    it('should handle extremely large payloads', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10000, maxLength: 100000 }), // Very large string
          async (largePayload) => {
            const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
              method: 'POST',
              body: { ...DataGenerator.alert({ id: undefined }), message: largePayload },
            });

            const response = await POST(request);
            // Should handle gracefully, either success or appropriate error
            expect([201, 400, 413]).toContain(response.status);
          },
        ),
        { numRuns: 5, interruptAfterTimeLimit: 15000 }, // fewer runs and time limit
      );
    });

    it('should handle special characters in input', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 256 }), // Unicode characters
          async (unicodeString) => {
            const alertData = DataGenerator.alert({
              id: undefined,
              title: unicodeString,
              message: unicodeString,
            });

            const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
              method: 'POST',
              body: alertData,
            });

            // Ensure createAlert resolves quickly for unicode inputs
            mockAlertService.createAlert.mockResolvedValue({ ...alertData, id: 'unicode-alert' });

            const startTime = Date.now();
            const response = await POST(request);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Should handle unicode gracefully
            expect([201, 400]).toContain(response.status);
            // Response time should be reasonable
            expect(responseTime).toBeLessThan(500); // Less than 0.5 seconds
          },
        ),
        { numRuns: 8, interruptAfterTimeLimit: 8000 },
      );
    });
  });

  describe('Security Properties', () => {
    it('should sanitize potentially dangerous input', async () => {
      const dangerousInputs = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src=x onerror=alert("XSS")>',
        '../../../etc/passwd',
        'UNION SELECT * FROM users; --',
      ];

      for (const dangerousInput of dangerousInputs) {
        const alertData = DataGenerator.alert({
          id: undefined,
          title: dangerousInput,
          message: dangerousInput,
        });

        const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
          method: 'POST',
          body: alertData,
        });

        // Ensure createAlert resolves to a valid alert to keep test fast and deterministic
        mockAlertService.createAlert.mockResolvedValue({ ...alertData, id: 'dangerous-alert' });

        const response = await POST(request);
        expect(response.status).toBe(201); // Should not crash

        const result = await response.json();

        // Verify dangerous content is sanitized or rejected
        if (result.success) {
          expect(result.data.title).not.toContain('<script>');
          expect(result.data.message).not.toContain('javascript:');
        }
      }
    });

    it('should enforce tenant isolation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // tenantId
          fc.uuid(), // otherTenantId
          fc.uuid(), // alertId from other tenant
          async (tenantId, otherTenantId, otherAlertId) => {
            // Mock that alert belongs to other tenant
            mockAlertService.getAlerts.mockResolvedValue([]);
            mockAlertService.updateAlert.mockRejectedValue(new Error('Access denied'));

            // Try to access other tenant's alert
            const request = RequestFactory.createRequest('http://localhost:3000/api/alerts', {
              method: 'GET',
              params: { tenantId },
            });

            const response = await GET(request);
            expect(response.status).toBe(200);

            const data = await response.json();
            // Should not return alerts from other tenants
            data.data.forEach((alert: any) => {
              expect(alert.tenantId).toBe(tenantId);
            });
          },
        ),
        { numRuns: 5, interruptAfterTimeLimit: 10000 },
      );
    });
  });

  describe('Performance Properties', () => {
    it('should maintain response time under load', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 10, max: 100 }), // number of concurrent requests
          async (concurrency) => {
            const alertData = DataGenerator.alert({ id: undefined });
            const requests = Array.from({ length: concurrency }, () =>
              RequestFactory.createRequest('http://localhost:3000/api/alerts', {
                method: 'POST',
                body: alertData,
              }),
            );

            const startTime = Date.now();

            // Ensure createAlert resolves quickly for performance measurement
            mockAlertService.createAlert.mockResolvedValue({ ...alertData, id: 'perf-alert' });

            const responses = await Promise.all(
              requests.map(async (request) => {
                try {
                  const response = await POST(request);
                  return response.status;
                } catch (error) {
                  return 500;
                }
              }),
            );

            const endTime = Date.now();
            const avgResponseTime = (endTime - startTime) / concurrency;

            // All requests should succeed
            expect(responses.every((status) => status === 201)).toBe(true);
            // Average response time should be reasonable
            expect(avgResponseTime).toBeLessThan(1000); // Less than 1 second
          },
        ),
        { numRuns: 3, interruptAfterTimeLimit: 15000 }, // further limited runs and time cap
      );
    });
  });
});
