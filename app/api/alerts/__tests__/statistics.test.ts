import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET } from '@/api/alerts/statistics/route';
import {
  GET as getRules,
  POST as createRule,
  PUT as updateRule,
  DELETE as deleteRule,
} from '@/api/alerts/rules/route';

// Mock database
jest.mock('@/database/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Alert Statistics API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/alerts/statistics', () => {
    it('should calculate and return comprehensive alert statistics', async () => {
      const mockStats = [
        {
          count: 150,
        },
      ];

      const mockSeverityStats = [
        { severity: 'critical', count: 5 },
        { severity: 'high', count: 25 },
        { severity: 'medium', count: 60 },
        { severity: 'low', count: 60 },
      ];

      const mockCategoryStats = [
        { category: 'security_threat', count: 30 },
        { category: 'system_error', count: 45 },
        { category: 'performance_issue', count: 35 },
        { category: 'ml_anomaly', count: 15 },
      ];

      const mockResolvedStats = [{ count: 128 }];
      const mockResolutionTimeStats = [{ avgTime: 12.5 }];

      const { db } = require('@/database/db');
      db.select
        .mockReturnValueOnce(mockStats) // Total alerts
        .mockReturnValueOnce(mockSeverityStats) // By severity
        .mockReturnValueOnce(mockCategoryStats) // By category
        .mockReturnValueOnce(mockResolvedStats) // Resolved count
        .mockReturnValueOnce(mockResolutionTimeStats); // Avg resolution time

      const request = new NextRequest(
        'http://localhost:3000/api/alerts/statistics?tenantId=test-tenant&days=30',
      );
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toMatchObject({
        totalAlerts: 150,
        alertsBySeverity: {
          critical: 5,
          high: 25,
          medium: 60,
          low: 60,
        },
        alertsByCategory: {
          security_threat: 30,
          system_error: 45,
          performance_issue: 35,
          ml_anomaly: 15,
        },
        resolutionRate: expect.any(Number),
        avgResolutionTime: 12.5,
        timeRange: {
          days: 30,
          since: expect.any(String),
        },
        generatedAt: expect.any(String),
      });
    });

    it('should handle zero alerts gracefully', async () => {
      const { db } = require('@/database/db');
      db.select.mockReturnValue([{ count: 0 }]);

      const request = new NextRequest(
        'http://localhost:3000/api/alerts/statistics?tenantId=test-tenant&days=7',
      );
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.totalAlerts).toBe(0);
      expect(result.resolutionRate).toBe(0);
      expect(result.avgResolutionTime).toBe(0);
    });

    it('should validate required parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/alerts/statistics');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toBe('tenantId parameter is required');
    });

    it('should handle database errors gracefully', async () => {
      const { db } = require('@/database/db');
      db.select.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest(
        'http://localhost:3000/api/alerts/statistics?tenantId=test-tenant',
      );
      const response = await GET(request);

      expect(response.status).toBe(500);
      const result = await response.json();
      expect(result.error).toBe('Failed to fetch alert statistics');
    });
  });
});

describe('Alert Rules API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/alerts/rules', () => {
    it('should return alert rules with filtering', async () => {
      const mockRules = [
        {
          id: 'rule-1',
          name: 'High Risk ML Predictions',
          description: 'Alert when ML detects high-risk threats',
          tenantId: 'test-tenant',
          isActive: true,
          triggerType: 'ml_prediction',
          triggerConfig: { minRiskScore: 0.8 },
          severity: 'high',
          channels: ['email', 'slack'],
          cooldownMinutes: 5,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'rule-2',
          name: 'System Performance Issues',
          description: 'Alert when system performance degrades',
          tenantId: 'test-tenant',
          isActive: false,
          triggerType: 'threshold',
          triggerConfig: { metric: 'cpu_usage', threshold: 90 },
          severity: 'medium',
          channels: ['email', 'dashboard'],
          cooldownMinutes: 10,
          createdAt: new Date().toISOString(),
        },
      ];

      const { db } = require('@/database/db');
      db.select.mockReturnValue(mockRules);

      const request = new NextRequest(
        'http://localhost:3000/api/alerts/rules?tenantId=test-tenant&isActive=true',
      );
      const response = await getRules(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.rules).toHaveLength(1);
      expect(result.rules[0].name).toBe('High Risk ML Predictions');
      expect(result.rules[0].isActive).toBe(true);
    });

    it('should return all rules when no filter is applied', async () => {
      const mockRules = [
        { id: 'rule-1', tenantId: 'test-tenant', isActive: true },
        { id: 'rule-2', tenantId: 'test-tenant', isActive: false },
      ];

      const { db } = require('@/database/db');
      db.select.mockReturnValue(mockRules);

      const request = new NextRequest(
        'http://localhost:3000/api/alerts/rules?tenantId=test-tenant',
      );
      const response = await getRules(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.rules).toHaveLength(2);
    });

    it('should return 400 if tenantId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/alerts/rules');
      const response = await getRules(request);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/alerts/rules', () => {
    it('should create a new alert rule with valid data', async () => {
      const ruleData = {
        name: 'Test Alert Rule',
        description: 'A test rule for validation',
        tenantId: 'test-tenant',
        triggerType: 'threshold',
        triggerConfig: {
          metric: 'error_rate',
          threshold: 0.05,
          operator: 'gt',
        },
        severity: 'medium',
        channels: ['email', 'slack', 'dashboard'],
        cooldownMinutes: 10,
        groupSimilar: true,
        groupWindowMinutes: 15,
        isActive: true,
      };

      const { db } = require('@/database/db');
      db.insert.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/alerts/rules', {
        method: 'POST',
        body: JSON.stringify(ruleData),
      });

      const response = await createRule(request);

      expect(response.status).toBe(201);
      expect(db.insert).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return 400 for invalid rule data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        severity: 'invalid_severity', // Invalid: not in enum
        channels: 'not_an_array', // Invalid: should be array
      };

      const request = new NextRequest('http://localhost:3000/api/alerts/rules', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await createRule(request);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/alerts/rules', () => {
    it('should update an existing alert rule', async () => {
      const updateData = {
        name: 'Updated Rule Name',
        isActive: false,
        cooldownMinutes: 20,
      };

      const { db } = require('@/database/db');
      db.select.mockResolvedValue([{ id: 'rule-1', tenantId: 'test-tenant' }]);
      db.update.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/alerts/rules?id=rule-1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await updateRule(request);

      expect(response.status).toBe(200);
      expect(db.update).toHaveBeenCalled();
    });

    it('should return 404 if rule not found', async () => {
      const { db } = require('@/database/db');
      db.select.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/alerts/rules?id=nonexistent', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' }),
      });

      const response = await updateRule(request);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/alerts/rules', () => {
    it('should delete an existing alert rule', async () => {
      const { db } = require('@/database/db');
      db.select.mockResolvedValue([{ id: 'rule-1', tenantId: 'test-tenant' }]);
      db.delete.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/alerts/rules?id=rule-1', {
        method: 'DELETE',
      });

      const response = await deleteRule(request);

      expect(response.status).toBe(200);
      expect(db.delete).toHaveBeenCalled();
    });

    it('should return 404 if rule not found', async () => {
      const { db } = require('@/database/db');
      db.select.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/alerts/rules?id=nonexistent', {
        method: 'DELETE',
      });

      const response = await deleteRule(request);

      expect(response.status).toBe(404);
    });
  });
});
