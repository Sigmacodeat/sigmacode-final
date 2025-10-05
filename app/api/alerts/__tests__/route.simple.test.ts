/**
 * State-of-the-Art Alert API Tests
 * Comprehensive testing suite with modern patterns
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST, GET, PUT, DELETE } from '../route.simple';

describe('Alert API - State of the Art Tests', () => {
  describe('POST /api/alerts - Create Alert', () => {
    it('should create an alert successfully with valid data', async () => {
      const alertData = {
        tenantId: 'test-tenant',
        title: 'Test Alert',
        message: 'This is a test alert',
        severity: 'medium' as const,
        category: 'security_threat' as const,
      };

      const request = new NextRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: JSON.stringify(alertData),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.alert).toBeDefined();
      expect(responseData.message).toBe('Alert created successfully');
    });

    it('should return 400 for invalid request data', async () => {
      const invalidData = {
        title: '',
        severity: 'invalid_severity',
      };

      const request = new NextRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  describe('GET /api/alerts - Retrieve Alerts', () => {
    it('should return alerts for a tenant', async () => {
      const request = new NextRequest('http://localhost:3000/api/alerts?tenantId=test-tenant');

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.alerts)).toBe(true);
    });

    it('should return 400 for missing tenantId', async () => {
      const request = new NextRequest('http://localhost:3000/api/alerts');

      const response = await GET(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('tenantId');
    });
  });

  describe('PUT /api/alerts - Update Alert', () => {
    it('should update an alert successfully', async () => {
      const updateData = {
        id: 'alert-123',
        title: 'Updated Alert Title',
        message: 'Updated alert message',
        status: 'acknowledged',
      };

      const request = new NextRequest('http://localhost:3000/api/alerts', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Alert updated successfully');
    });

    it('should return 400 for missing alert ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/alerts', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Title' }),
      });

      const response = await PUT(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('id');
    });
  });

  describe('DELETE /api/alerts - Delete Alert', () => {
    it('should delete an alert successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/alerts?id=alert-123');

      const response = await DELETE(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Alert deleted successfully');
    });

    it('should return 400 for missing alert ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/alerts');

      const response = await DELETE(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('id');
    });
  });
});

describe('Alert API - State of the Art Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/alerts - Create Alert', () => {
    it('should create an alert successfully with valid data', async () => {
      const alertData = {
        tenantId: 'test-tenant',
        title: 'Test Alert',
        message: 'This is a test alert',
        severity: 'medium' as const,
        category: 'security_threat' as const,
      };

      const request = new NextRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: JSON.stringify(alertData),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.alert).toBeDefined();
      expect(responseData.message).toBe('Alert created successfully');
    });

    it('should return 400 for invalid request data', async () => {
      const invalidData = {
        title: '',
        severity: 'invalid_severity',
      };

      const request = new NextRequest('http://localhost:3000/api/alerts', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  describe('GET /api/alerts - Retrieve Alerts', () => {
    it('should return alerts for a tenant', async () => {
      const request = new NextRequest('http://localhost:3000/api/alerts?tenantId=test-tenant');

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.alerts)).toBe(true);
    });

    it('should return 400 for missing tenantId', async () => {
      const request = new NextRequest('http://localhost:3000/api/alerts');

      const response = await GET(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('tenantId');
    });
  });

  describe('PUT /api/alerts - Update Alert', () => {
    it('should update an alert successfully', async () => {
      const updateData = {
        id: 'alert-123',
        title: 'Updated Alert Title',
        message: 'Updated alert message',
        status: 'acknowledged',
      };

      const request = new NextRequest('http://localhost:3000/api/alerts', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Alert updated successfully');
    });

    it('should return 400 for missing alert ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/alerts', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Title' }),
      });

      const response = await PUT(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('id');
    });
  });

  describe('DELETE /api/alerts - Delete Alert', () => {
    it('should delete an alert successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/alerts?id=alert-123');

      const response = await DELETE(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Alert deleted successfully');
    });

    it('should return 400 for missing alert ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/alerts');

      const response = await DELETE(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('id');
    });
  });
});
