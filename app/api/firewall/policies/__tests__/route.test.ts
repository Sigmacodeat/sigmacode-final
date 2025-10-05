import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/firewall/policies/route';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock the database
jest.mock('@/database/db', () => ({
  getDb: jest.fn(() => ({
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() =>
            Promise.resolve([
              {
                id: 'policy-1',
                tenantId: 'test-tenant',
                name: 'High Security Policy',
                description: 'Blocks high-risk requests',
                isActive: true,
                conditions: {
                  riskScore: { operator: 'gte', value: 0.8 },
                  threatType: { operator: 'in', value: ['prompt_injection', 'secret_leakage'] },
                },
                action: 'block',
                priority: 10,
                rateLimiting: {
                  requestsPerMinute: 100,
                  burstLimit: 200,
                },
                createdBy: 'admin',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: 'policy-2',
                tenantId: 'test-tenant',
                name: 'PII Protection Policy',
                description: 'Blocks requests containing PII',
                isActive: true,
                conditions: {
                  containsPII: { operator: 'eq', value: true },
                },
                action: 'block',
                priority: 5,
                rateLimiting: {
                  requestsPerMinute: 50,
                  burstLimit: 100,
                },
                createdBy: 'admin',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ]),
          ),
        })),
        orderBy: jest.fn(() =>
          Promise.resolve([
            {
              id: 'policy-1',
              tenantId: 'test-tenant',
              name: 'High Security Policy',
              description: 'Blocks high-risk requests',
              isActive: true,
              conditions: {
                riskScore: { operator: 'gte', value: 0.8 },
                threatType: { operator: 'in', value: ['prompt_injection', 'secret_leakage'] },
              },
              action: 'block',
              priority: 10,
              rateLimiting: {
                requestsPerMinute: 100,
                burstLimit: 200,
              },
              createdBy: 'admin',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'policy-2',
              tenantId: 'test-tenant',
              name: 'PII Protection Policy',
              description: 'Blocks requests containing PII',
              isActive: true,
              conditions: {
                containsPII: { operator: 'eq', value: true },
              },
              action: 'block',
              priority: 5,
              rateLimiting: {
                requestsPerMinute: 50,
                burstLimit: 100,
              },
              createdBy: 'admin',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]),
        ),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => Promise.resolve({})),
    })),
  })),
}));

describe('/api/firewall/policies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('GET /api/firewall/policies', () => {
    it('should return firewall policies', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/policies');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.policies).toBeDefined();
      expect(Array.isArray(data.policies)).toBe(true);
      expect(data.policies.length).toBe(2);
      expect(data.total).toBe(2);

      // Check first policy
      expect(data.policies[0].id).toBe('policy-1');
      expect(data.policies[0].name).toBe('High Security Policy');
      expect(data.policies[0].action).toBe('block');
      expect(data.policies[0].priority).toBe(10);
      expect(data.policies[0].isActive).toBe(true);
    });

    it('should filter policies by active status', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/policies?isActive=true');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.policies).toHaveLength(2);
      expect(data.policies[0].isActive).toBe(true);
    });
  });

  describe('POST /api/firewall/policies', () => {
    it('should create new firewall policy', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: 'test-tenant',
          name: 'Test Policy',
          description: 'Test policy for testing',
          conditions: {
            riskScore: { operator: 'gte', value: 0.7 },
            threatType: { operator: 'in', value: ['prompt_injection'] },
          },
          action: 'block',
          priority: 10,
          rateLimiting: {
            requestsPerMinute: 100,
            burstLimit: 200,
          },
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.success).toBe(true);
      expect(data.policyId).toBeDefined();
      expect(data.message).toBeDefined();
    });
  });
});
