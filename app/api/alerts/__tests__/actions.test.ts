import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import {
  PATCH_ACKNOWLEDGE as acknowledgeAlert,
  PATCH_RESOLVE as resolveAlert,
  PATCH_DISMISS as dismissAlert,
} from '../route';

describe('Alert Actions API', () => {
  let mockService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      acknowledgeAlert: jest.fn(),
      resolveAlert: jest.fn(),
      dismissAlert: jest.fn(),
    };
    (global as any).__ALERT_SERVICE__ = mockService;
  });

  describe('PATCH /api/alerts/[id]/acknowledge', () => {
    it('should acknowledge a new alert', async () => {
      mockService.acknowledgeAlert.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/acknowledge', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user-123' }),
      });

      const response = await acknowledgeAlert(request, { params: { alertId: 'alert-1' } });
      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.message).toBe('Alert acknowledged successfully');
    });

    it('should return 404 if alert not found', async () => {
      mockService.acknowledgeAlert.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/acknowledge', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user-123' }),
      });

      const response = await acknowledgeAlert(request, { params: { alertId: 'alert-1' } });

      expect(response.status).toBe(404);
    });

    it('should return 400 if alert is not in new status', async () => {
      mockService.acknowledgeAlert.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/acknowledge', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user-123' }),
      });

      const response = await acknowledgeAlert(request, { params: { alertId: 'alert-1' } });
      // Service meldet false => Route antwortet 404
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid request data', async () => {
      const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/acknowledge', {
        method: 'PATCH',
        body: JSON.stringify({}), // Missing userId
      });

      const response = await acknowledgeAlert(request, { params: { alertId: 'alert-1' } });

      expect(response.status).toBe(400);
    });

    it('should handle database errors gracefully', async () => {
      mockService.acknowledgeAlert.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/acknowledge', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user-123' }),
      });

      const response = await acknowledgeAlert(request, { params: { alertId: 'alert-1' } });
      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /api/alerts/[id]/resolve', () => {
    it('should resolve an acknowledged alert', async () => {
      mockService.resolveAlert.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/resolve', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user-123', reason: 'Issue fixed' }),
      });

      const response = await resolveAlert(request, { params: { alertId: 'alert-1' } });
      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.message).toBe('Alert resolved successfully');
    });

    it('should return 400 if alert is already resolved', async () => {
      mockService.resolveAlert.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/resolve', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user-123' }),
      });

      const response = await resolveAlert(request, { params: { alertId: 'alert-1' } });
      expect(response.status).toBe(404);
    });

    it('should return 400 if alert is dismissed', async () => {
      mockService.resolveAlert.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/resolve', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user-123' }),
      });

      const response = await resolveAlert(request, { params: { alertId: 'alert-1' } });
      expect(response.status).toBe(404);
    });

    it('should allow resolving new alerts directly', async () => {
      mockService.resolveAlert.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/resolve', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user-123' }),
      });

      const response = await resolveAlert(request, { params: { alertId: 'alert-1' } });
      expect(response.status).toBe(200);
    });
  });

  describe('PATCH /api/alerts/[id]/dismiss', () => {
    it('should dismiss a new alert', async () => {
      mockService.dismissAlert.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/dismiss', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user-123', reason: 'False positive' }),
      });

      const response = await dismissAlert(request, { params: { alertId: 'alert-1' } });
      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.message).toBe('Alert dismissed successfully');
    });

    it('should return 400 if alert is already resolved', async () => {
      mockService.dismissAlert.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/dismiss', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user-123' }),
      });

      const response = await dismissAlert(request, { params: { alertId: 'alert-1' } });
      expect(response.status).toBe(404);
    });

    it('should return 400 if alert is already dismissed', async () => {
      mockService.dismissAlert.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/dismiss', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user-123' }),
      });

      const response = await dismissAlert(request, { params: { alertId: 'alert-1' } });
      expect(response.status).toBe(404);
    });

    it('should allow dismissing acknowledged alerts', async () => {
      mockService.dismissAlert.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/dismiss', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user-123' }),
      });

      const response = await dismissAlert(request, { params: { alertId: 'alert-1' } });
      expect(response.status).toBe(200);
    });
  });
});
