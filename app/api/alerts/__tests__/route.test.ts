import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/api/alerts/route';
import { GET as getStatistics } from '@/api/alerts/statistics/route';
import {
  GET as getRules,
  POST as createRule,
  PUT as updateRule,
  DELETE as deleteRule,
} from '@/api/alerts/rules/route';
import { PATCH as acknowledgeAlert } from '@/api/alerts/[id]/acknowledge/route';
import { PATCH as resolveAlert } from '@/api/alerts/[id]/resolve/route';
import { PATCH as dismissAlert } from '@/api/alerts/[id]/dismiss/route';

// Mock database
jest.mock('@/database/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock alert service
jest.mock('@/lib/alert-service', () => ({
  AlertService: {
    getInstance: jest.fn(() => ({
      createAlert: jest.fn(),
      createAlertFromMLAnalysis: jest.fn(),
      getAlerts: jest.fn(),
      acknowledgeAlert: jest.fn(),
      resolveAlert: jest.fn(),
      dismissAlert: jest.fn(),
      getAlertStatistics: jest.fn(),
      createAlertRule: jest.fn(),
    })),
  },
}));

describe('Alert API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/alerts', () => {
    it('should return alerts for a tenant', async () => {
      const mockAlerts = [
        {
          id: 'alert-1',
          title: 'High Risk ML Prediction',
          message: 'Suspicious activity detected',
          severity: 'high',
          category: 'security_threat',
          status: 'new',
          tenantId: 'test-tenant',
          triggeredAt: new Date().toISOString(),
        },
      ];

      const { db } = require('@/database/db');
      db.select.mockReturnValue(mockAlerts);

      const request = new NextRequest('http://localhost:3000/api/alerts?tenantId=test-tenant');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.alerts).toHaveLength(1);
      expect(result.alerts[0].id).toBe('alert-1');
    });

    it('should return 400 if tenantId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/alerts');
      const response = await GET(request);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/alerts', () => {
    it('should create a new alert', async () => {
      const alertData = {
        tenantId: 'test-tenant',
        title: 'Test Alert',
        message: 'This is a test alert',
        severity: 'medium',
        category: 'system_error',
        requestId: 'req-123',
        ipAddress: '192.168.1.1',
      };

      const { db } = require('@/database/db');
      db.insert.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: JSON.stringify(alertData),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(db.insert).toHaveBeenCalled();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        title: '', // Invalid: empty title
        message: 'Test message',
        // Missing required fields
      };

      const request = new NextRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/alerts/statistics', () => {
    it('should return alert statistics', async () => {
      const mockStats = {
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
          compliance_violation: 20,
          ml_anomaly: 15,
          manual_trigger: 5,
        },
        resolutionRate: 85.5,
        avgResolutionTime: 12.3,
      };

      const { db } = require('@/database/db');
      db.select.mockResolvedValue([mockStats]);

      const request = new NextRequest(
        'http://localhost:3000/api/alerts/statistics?tenantId=test-tenant&days=30',
      );
      const response = await getStatistics(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.totalAlerts).toBe(150);
      expect(result.resolutionRate).toBe(85.5);
    });

    it('should return 400 if tenantId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/alerts/statistics');
      const response = await getStatistics(request);

      expect(response.status).toBe(400);
    });
  });

  describe('Alert Rules API', () => {
    describe('GET /api/alerts/rules', () => {
      it('should return alert rules for a tenant', async () => {
        const mockRules = [
          {
            id: 'rule-1',
            name: 'High Risk ML Predictions',
            description: 'Alert when ML detects high-risk threats',
            tenantId: 'test-tenant',
            isActive: true,
            triggerType: 'ml_prediction',
            severity: 'high',
            channels: ['email', 'slack'],
          },
        ];

        const { db } = require('@/database/db');
        db.select.mockReturnValue(mockRules);

        const request = new NextRequest(
          'http://localhost:3000/api/alerts/rules?tenantId=test-tenant',
        );
        const response = await getRules(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.rules).toHaveLength(1);
        expect(result.rules[0].name).toBe('High Risk ML Predictions');
      });
    });

    describe('POST /api/alerts/rules', () => {
      it('should create a new alert rule', async () => {
        const ruleData = {
          name: 'Test Rule',
          description: 'A test alert rule',
          tenantId: 'test-tenant',
          triggerType: 'threshold',
          triggerConfig: { threshold: 0.8 },
          severity: 'medium',
          channels: ['email', 'dashboard'],
          cooldownMinutes: 5,
          groupSimilar: true,
        };

        const { db } = require('@/database/db');
        db.insert.mockResolvedValue({});

        const request = new NextRequest('http://localhost:3000/api/alerts/rules', {
          method: 'POST',
          body: JSON.stringify(ruleData),
        });

        const response = await createRule(request);

        expect(response.status).toBe(201);
        expect(db.insert).toHaveBeenCalled();
      });
    });

    describe('PUT /api/alerts/rules', () => {
      it('should update an alert rule', async () => {
        const updateData = {
          name: 'Updated Rule Name',
          isActive: false,
        };

        const { db } = require('@/database/db');
        db.select.mockResolvedValue([{ id: 'rule-1' }]);
        db.update.mockResolvedValue({});

        const request = new NextRequest('http://localhost:3000/api/alerts/rules?id=rule-1', {
          method: 'PUT',
          body: JSON.stringify(updateData),
        });

        const response = await updateRule(request);

        expect(response.status).toBe(200);
        expect(db.update).toHaveBeenCalled();
      });
    });

    describe('DELETE /api/alerts/rules', () => {
      it('should delete an alert rule', async () => {
        const { db } = require('@/database/db');
        db.select.mockResolvedValue([{ id: 'rule-1' }]);
        db.delete.mockResolvedValue({});

        const request = new NextRequest('http://localhost:3000/api/alerts/rules?id=rule-1', {
          method: 'DELETE',
        });

        const response = await deleteRule(request);

        expect(response.status).toBe(200);
        expect(db.delete).toHaveBeenCalled();
      });
    });
  });

  describe('Alert Actions', () => {
    describe('PATCH /api/alerts/[id]/acknowledge', () => {
      it('should acknowledge an alert', async () => {
        const { db } = require('@/database/db');
        db.select.mockResolvedValue([{ id: 'alert-1', status: 'new' }]);
        db.update.mockResolvedValue({});

        const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/acknowledge', {
          method: 'PATCH',
          body: JSON.stringify({ userId: 'user-123' }),
        });

        const response = await acknowledgeAlert(request, { params: { id: 'alert-1' } });

        expect(response.status).toBe(200);
        expect(db.update).toHaveBeenCalled();
      });

      it('should return 404 if alert not found', async () => {
        const { db } = require('@/database/db');
        db.select.mockResolvedValue([]);

        const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/acknowledge', {
          method: 'PATCH',
          body: JSON.stringify({ userId: 'user-123' }),
        });

        const response = await acknowledgeAlert(request, { params: { id: 'alert-1' } });

        expect(response.status).toBe(404);
      });
    });

    describe('PATCH /api/alerts/[id]/resolve', () => {
      it('should resolve an alert', async () => {
        const { db } = require('@/database/db');
        db.select.mockResolvedValue([{ id: 'alert-1', status: 'acknowledged' }]);
        db.update.mockResolvedValue({});

        const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/resolve', {
          method: 'PATCH',
          body: JSON.stringify({ userId: 'user-123', reason: 'Issue resolved' }),
        });

        const response = await resolveAlert(request, { params: { id: 'alert-1' } });

        expect(response.status).toBe(200);
        expect(db.update).toHaveBeenCalled();
      });

      it('should return 400 if alert is already resolved', async () => {
        const { db } = require('@/database/db');
        db.select.mockResolvedValue([{ id: 'alert-1', status: 'resolved' }]);

        const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/resolve', {
          method: 'PATCH',
          body: JSON.stringify({ userId: 'user-123' }),
        });

        const response = await resolveAlert(request, { params: { id: 'alert-1' } });

        expect(response.status).toBe(400);
      });
    });

    describe('PATCH /api/alerts/[id]/dismiss', () => {
      it('should dismiss an alert', async () => {
        const { db } = require('@/database/db');
        db.select.mockResolvedValue([{ id: 'alert-1', status: 'new' }]);
        db.update.mockResolvedValue({});

        const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/dismiss', {
          method: 'PATCH',
          body: JSON.stringify({ userId: 'user-123', reason: 'False positive' }),
        });

        const response = await dismissAlert(request, { params: { id: 'alert-1' } });

        expect(response.status).toBe(200);
        expect(db.update).toHaveBeenCalled();
      });

      it('should return 400 if alert is already resolved', async () => {
        const { db } = require('@/database/db');
        db.select.mockResolvedValue([{ id: 'alert-1', status: 'resolved' }]);

        const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/dismiss', {
          method: 'PATCH',
          body: JSON.stringify({ userId: 'user-123' }),
        });

        const response = await dismissAlert(request, { params: { id: 'alert-1' } });

        expect(response.status).toBe(400);
      });
    });
  });
});
