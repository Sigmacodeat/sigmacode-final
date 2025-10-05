import { NextRequest } from 'next/server';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock the database BEFORE importing the route
jest.mock('@/database/db', () => ({
  getDb: jest.fn(() => ({
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => ({
            offset: jest.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => Promise.resolve({})),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => Promise.resolve({})),
      })),
    })),
    delete: jest.fn(() => ({
      where: jest.fn(() => Promise.resolve({})),
    })),
  })),
}));

// Mock authentication BEFORE importing the route
jest.mock('@/lib/auth', () => ({
  getServerAuthSession: jest.fn(() =>
    Promise.resolve({
      user: {
        id: 'test-user-id',
        email: 'test@sigmacode.ai',
        role: 'admin',
      },
    }),
  ),
}));

// Mock external services BEFORE importing the route
jest.mock('@/lib/alert-service', () => ({
  AlertService: {
    getInstance: jest.fn(() => ({
      createAlert: jest.fn(() => Promise.resolve({ id: 'test-alert-id' })),
    })),
  },
}));

// Now import the route functions
import { GET, POST } from '../route';

describe('/api/firewall/config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('GET /api/firewall/config', () => {
    it('should return firewall configuration', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'config-1',
          tenantId: 'test-tenant',
          firewallEnabled: true,
          mode: 'enforce',
          mlModels: {
            threatDetection: true,
            anomalyDetection: true,
            behavioralAnalysis: true,
          },
          alertRules: {
            highRiskThreshold: 0.8,
            criticalRiskThreshold: 0.9,
            cooldownMinutes: 5,
          },
          rateLimiting: {
            requestsPerMinute: 1000,
            burstLimit: 2000,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/firewall/config');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.config).toBeDefined();
      expect(data.config.firewallEnabled).toBe(true);
      expect(data.config.mode).toBe('enforce');
      expect(data.config.mlModels).toBeDefined();
      expect(data.config.alertRules).toBeDefined();
      expect(data.config.rateLimiting).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/firewall/config');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should require authentication', async () => {
      const mockGetServerAuthSession = require('@/lib/auth').getServerAuthSession;
      mockGetServerAuthSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/firewall/config');
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/firewall/config', () => {
    it('should update firewall configuration', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.update.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/firewall/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firewallEnabled: false,
          mode: 'shadow',
          mlModels: {
            threatDetection: false,
            anomalyDetection: true,
            behavioralAnalysis: false,
          },
          alertRules: {
            highRiskThreshold: 0.7,
            criticalRiskThreshold: 0.95,
            cooldownMinutes: 10,
          },
          rateLimiting: {
            requestsPerMinute: 500,
            burstLimit: 1000,
          },
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.success).toBe(true);
      expect(data.message).toBeDefined();
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should validate request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Missing required fields
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should handle invalid configuration', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.update.mockRejectedValue(new Error('Invalid configuration'));

      const request = new NextRequest('http://localhost:3000/api/firewall/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firewallEnabled: true,
          mode: 'invalid_mode',
          mlModels: {},
          alertRules: {},
          rateLimiting: {},
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should require admin role for configuration updates', async () => {
      const mockGetServerAuthSession = require('@/lib/auth').getServerAuthSession;
      mockGetServerAuthSession.mockResolvedValue({
        user: {
          id: 'test-user-id',
          email: 'test@sigmacode.ai',
          role: 'user', // Not admin
        },
      });

      const request = new NextRequest('http://localhost:3000/api/firewall/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firewallEnabled: false,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(403);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });
  });

  describe('Configuration Validation', () => {
    it('should validate firewall mode', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.update.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/firewall/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'invalid_mode',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should validate rate limiting values', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.update.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/firewall/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rateLimiting: {
            requestsPerMinute: -1, // Invalid negative value
            burstLimit: 0, // Invalid zero value
          },
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should validate ML model configuration', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.update.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/firewall/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mlModels: {
            threatDetection: 'invalid_value', // Should be boolean
            anomalyDetection: true,
            behavioralAnalysis: false,
          },
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json {',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should handle missing request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // No body
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should handle database connection errors', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.update.mockRejectedValue(new Error('Connection timeout'));

      const request = new NextRequest('http://localhost:3000/api/firewall/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firewallEnabled: true,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should respond quickly to configuration requests', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'config-1',
          tenantId: 'test-tenant',
          firewallEnabled: true,
          mode: 'enforce',
          mlModels: { threatDetection: true },
          alertRules: { highRiskThreshold: 0.8 },
          rateLimiting: { requestsPerMinute: 1000 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/firewall/config');
      const startTime = Date.now();

      const response = await GET(request);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle concurrent configuration requests', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'config-1',
          tenantId: 'test-tenant',
          firewallEnabled: true,
          mode: 'enforce',
          mlModels: { threatDetection: true },
          alertRules: { highRiskThreshold: 0.8 },
          rateLimiting: { requestsPerMinute: 1000 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const requests = Array(5)
        .fill(null)
        .map(() => new NextRequest('http://localhost:3000/api/firewall/config'));

      const startTime = Date.now();
      const promises = requests.map((req) => GET(req));
      const responses = await Promise.all(promises);
      const endTime = Date.now();

      const totalTime = endTime - startTime;

      expect(responses).toHaveLength(5);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
      expect(totalTime).toBeLessThan(2000); // Should handle concurrent requests efficiently
    });
  });
});
