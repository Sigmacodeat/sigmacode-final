import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/firewall/explanations/route';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock the database
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

// Mock authentication
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() =>
    Promise.resolve({
      user: {
        id: 'test-user-id',
        email: 'test@sigmacode.ai',
        role: 'admin',
      },
    }),
  ),
}));

// Mock ML services
jest.mock('@/lib/ml-threat-detector', () => ({
  MLThreatDetector: {
    getInstance: jest.fn(() => ({
      analyzeRequest: jest.fn(() =>
        Promise.resolve({
          requestId: 'test-request-id',
          modelId: 'test-model',
          riskScore: 0.5,
          confidence: 0.8,
          threatType: 'prompt_injection',
          predictedAction: 'allow',
          explanation: 'Test analysis result',
          features: {},
          processingTimeMs: 45,
          similarKnownThreats: [],
        }),
      ),
    })),
  },
}));

describe('/api/firewall/explanations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('GET /api/firewall/explanations', () => {
    it('should return threat explanations', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'explanation-1',
          requestId: 'req-123',
          tenantId: 'test-tenant',
          threatType: 'prompt_injection',
          explanation: 'This request contains a prompt injection attempt',
          confidence: 0.9,
          riskFactors: ['Suspicious keywords', 'Unusual pattern', 'High complexity'],
          mitigationSteps: ['Block the request', 'Log the incident', 'Alert security team'],
          similarIncidents: ['incident-1', 'incident-2'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/firewall/explanations?requestId=req-123',
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.explanations).toBeDefined();
      expect(Array.isArray(data.explanations)).toBe(true);
      expect(data.explanations.length).toBe(1);
      expect(data.explanations[0].id).toBe('explanation-1');
      expect(data.explanations[0].threatType).toBe('prompt_injection');
      expect(data.explanations[0].explanation).toBe(
        'This request contains a prompt injection attempt',
      );
      expect(data.explanations[0].confidence).toBe(0.9);
      expect(data.explanations[0].riskFactors).toEqual([
        'Suspicious keywords',
        'Unusual pattern',
        'High complexity',
      ]);
      expect(data.explanations[0].mitigationSteps).toHaveLength(3);
      expect(data.explanations[0].similarIncidents).toEqual(['incident-1', 'incident-2']);
    });

    it('should filter by threat type', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'explanation-1',
          requestId: 'req-123',
          tenantId: 'test-tenant',
          threatType: 'prompt_injection',
          explanation: 'Prompt injection detected',
          confidence: 0.9,
          riskFactors: [],
          mitigationSteps: [],
          similarIncidents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/firewall/explanations?threatType=prompt_injection',
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.explanations).toHaveLength(1);
      expect(data.explanations[0].threatType).toBe('prompt_injection');
    });

    it('should handle multiple explanations', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'explanation-1',
          requestId: 'req-123',
          tenantId: 'test-tenant',
          threatType: 'prompt_injection',
          explanation: 'Prompt injection detected',
          confidence: 0.9,
          riskFactors: [],
          mitigationSteps: [],
          similarIncidents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'explanation-2',
          requestId: 'req-124',
          tenantId: 'test-tenant',
          threatType: 'secret_leakage',
          explanation: 'API key detected in request',
          confidence: 0.95,
          riskFactors: ['API key pattern', 'High entropy'],
          mitigationSteps: ['Block request', 'Alert user'],
          similarIncidents: ['incident-3'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/firewall/explanations?limit=10');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.explanations).toHaveLength(2);
      expect(data.total).toBe(2);
      expect(data.explanations[0].threatType).toBe('prompt_injection');
      expect(data.explanations[1].threatType).toBe('secret_leakage');
    });

    it('should handle database errors gracefully', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest(
        'http://localhost:3000/api/firewall/explanations?requestId=req-123',
      );
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should require authentication', async () => {
      const mockGetServerSession = require('next-auth').getServerSession;
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/firewall/explanations?requestId=req-123',
      );
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/firewall/explanations', () => {
    it('should create threat explanation', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.insert.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/firewall/explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          threatType: 'prompt_injection',
          explanation: 'This request contains a prompt injection attempt',
          confidence: 0.9,
          riskFactors: ['Suspicious keywords', 'Unusual pattern', 'High complexity'],
          mitigationSteps: ['Block the request', 'Log the incident', 'Alert security team'],
          similarIncidents: ['incident-1', 'incident-2'],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.success).toBe(true);
      expect(data.explanationId).toBeDefined();
      expect(data.message).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Missing required fields
          requestId: 'req-123',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should validate threat type', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          threatType: 'invalid_threat_type',
          explanation: 'Test explanation',
          confidence: 0.9,
          riskFactors: [],
          mitigationSteps: [],
          similarIncidents: [],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should validate confidence range', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          threatType: 'prompt_injection',
          explanation: 'Test explanation',
          confidence: 1.5, // Invalid: > 1
          riskFactors: [],
          mitigationSteps: [],
          similarIncidents: [],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should handle database errors', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.insert.mockRejectedValue(new Error('Database insert failed'));

      const request = new NextRequest('http://localhost:3000/api/firewall/explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          threatType: 'prompt_injection',
          explanation: 'Test explanation',
          confidence: 0.9,
          riskFactors: [],
          mitigationSteps: [],
          similarIncidents: [],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should require admin role for creating explanations', async () => {
      const mockGetServerSession = require('next-auth').getServerSession;
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'test-user-id',
          email: 'test@sigmacode.ai',
          role: 'user', // Not admin
        },
      });

      const request = new NextRequest('http://localhost:3000/api/firewall/explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          threatType: 'prompt_injection',
          explanation: 'Test explanation',
          confidence: 0.9,
          riskFactors: [],
          mitigationSteps: [],
          similarIncidents: [],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(403);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should respond quickly to explanation queries', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'explanation-1',
          requestId: 'req-123',
          tenantId: 'test-tenant',
          threatType: 'prompt_injection',
          explanation: 'Prompt injection detected',
          confidence: 0.9,
          riskFactors: [],
          mitigationSteps: [],
          similarIncidents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/firewall/explanations?requestId=req-123',
      );
      const startTime = Date.now();

      const response = await GET(request);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(200); // Should respond within 200ms
    });

    it('should handle concurrent explanation requests', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'explanation-1',
          requestId: 'req-123',
          tenantId: 'test-tenant',
          threatType: 'prompt_injection',
          explanation: 'Prompt injection detected',
          confidence: 0.9,
          riskFactors: [],
          mitigationSteps: [],
          similarIncidents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const requests = Array(5)
        .fill(null)
        .map(
          (_, i) =>
            new NextRequest(`http://localhost:3000/api/firewall/explanations?requestId=req-${i}`),
        );

      const startTime = Date.now();
      const promises = requests.map((req) => GET(req));
      const responses = await Promise.all(promises);
      const endTime = Date.now();

      const totalTime = endTime - startTime;

      expect(responses).toHaveLength(5);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
      expect(totalTime).toBeLessThan(1000); // Should handle concurrent requests efficiently
    });
  });

  describe('Data Validation', () => {
    it('should validate explanation length', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          threatType: 'prompt_injection',
          explanation: 'A'.repeat(2001), // Too long
          confidence: 0.9,
          riskFactors: [],
          mitigationSteps: [],
          similarIncidents: [],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should validate risk factors array', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          threatType: 'prompt_injection',
          explanation: 'Test explanation',
          confidence: 0.9,
          riskFactors: 'invalid_risk_factors', // Should be array
          mitigationSteps: [],
          similarIncidents: [],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should validate mitigation steps array', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          threatType: 'prompt_injection',
          explanation: 'Test explanation',
          confidence: 0.9,
          riskFactors: [],
          mitigationSteps: 'invalid_mitigation_steps', // Should be array
          similarIncidents: [],
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
      const request = new NextRequest('http://localhost:3000/api/firewall/explanations', {
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
      const request = new NextRequest('http://localhost:3000/api/firewall/explanations', {
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
      mockDb.insert.mockRejectedValue(new Error('Connection timeout'));

      const request = new NextRequest('http://localhost:3000/api/firewall/explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          threatType: 'prompt_injection',
          explanation: 'Test explanation',
          confidence: 0.9,
          riskFactors: [],
          mitigationSteps: [],
          similarIncidents: [],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });
  });
});
