import { NextRequest } from 'next/server';
import { POST } from '@/api/firewall/analyze-output/route';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { GET } from '@/api/analytics/route';

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

describe('/api/firewall/analyze-output', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('GET /api/firewall/analyze-output', () => {
    it('should return analysis output for request', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'analysis-1',
          requestId: 'req-123',
          tenantId: 'test-tenant',
          modelId: 'model-1',
          riskScore: 0.8,
          confidence: 0.9,
          threatType: 'prompt_injection',
          predictedAction: 'block',
          explanation: 'High risk prompt injection detected',
          features: {
            contentLength: 100,
            tokenCount: 25,
            complexityScore: 0.7,
          },
          processingTimeMs: 45,
          similarKnownThreats: ['threat-1', 'threat-2'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/firewall/analyze-output?requestId=req-123',
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.analysis).toBeDefined();
      expect(data.analysis.requestId).toBe('req-123');
      expect(data.analysis.modelId).toBe('model-1');
      expect(data.analysis.riskScore).toBe(0.8);
      expect(data.analysis.confidence).toBe(0.9);
      expect(data.analysis.threatType).toBe('prompt_injection');
      expect(data.analysis.predictedAction).toBe('block');
      expect(data.analysis.explanation).toBe('High risk prompt injection detected');
      expect(data.analysis.features).toBeDefined();
      expect(data.analysis.processingTimeMs).toBe(45);
      expect(data.analysis.similarKnownThreats).toEqual(['threat-1', 'threat-2']);
    });

    it('should filter by model ID', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'analysis-1',
          requestId: 'req-123',
          tenantId: 'test-tenant',
          modelId: 'model-1',
          riskScore: 0.8,
          confidence: 0.9,
          threatType: 'prompt_injection',
          predictedAction: 'block',
          explanation: 'High risk detected',
          features: {},
          processingTimeMs: 45,
          similarKnownThreats: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/firewall/analyze-output?modelId=model-1',
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.analysis.modelId).toBe('model-1');
    });

    it('should filter by threat type', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'analysis-1',
          requestId: 'req-123',
          tenantId: 'test-tenant',
          modelId: 'model-1',
          riskScore: 0.8,
          confidence: 0.9,
          threatType: 'prompt_injection',
          predictedAction: 'block',
          explanation: 'High risk detected',
          features: {},
          processingTimeMs: 45,
          similarKnownThreats: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/firewall/analyze-output?threatType=prompt_injection',
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.analysis.threatType).toBe('prompt_injection');
    });

    it('should handle multiple analyses', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'analysis-1',
          requestId: 'req-123',
          tenantId: 'test-tenant',
          modelId: 'model-1',
          riskScore: 0.8,
          confidence: 0.9,
          threatType: 'prompt_injection',
          predictedAction: 'block',
          explanation: 'High risk detected',
          features: {},
          processingTimeMs: 45,
          similarKnownThreats: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'analysis-2',
          requestId: 'req-124',
          tenantId: 'test-tenant',
          modelId: 'model-1',
          riskScore: 0.3,
          confidence: 0.95,
          threatType: null,
          predictedAction: 'allow',
          explanation: 'Safe request',
          features: {},
          processingTimeMs: 30,
          similarKnownThreats: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/firewall/analyze-output?limit=10');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.analyses).toHaveLength(2);
      expect(data.total).toBe(2);
    });

    it('should handle database errors gracefully', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest(
        'http://localhost:3000/api/firewall/analyze-output?requestId=req-123',
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
        'http://localhost:3000/api/firewall/analyze-output?requestId=req-123',
      );
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/firewall/analyze-output', () => {
    it('should create analysis output', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.insert.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/firewall/analyze-output', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          modelId: 'model-1',
          riskScore: 0.8,
          confidence: 0.9,
          threatType: 'prompt_injection',
          predictedAction: 'block',
          explanation: 'High risk prompt injection detected',
          features: {
            contentLength: 100,
            tokenCount: 25,
            complexityScore: 0.7,
          },
          processingTimeMs: 45,
          similarKnownThreats: ['threat-1', 'threat-2'],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.success).toBe(true);
      expect(data.analysisId).toBeDefined();
      expect(data.message).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/analyze-output', {
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

    it('should validate risk score range', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/analyze-output', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          modelId: 'model-1',
          riskScore: 1.5, // Invalid: > 1
          confidence: 0.9,
          threatType: 'prompt_injection',
          predictedAction: 'block',
          explanation: 'Test',
          features: {},
          processingTimeMs: 45,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should validate confidence range', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/analyze-output', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          modelId: 'model-1',
          riskScore: 0.8,
          confidence: 1.5, // Invalid: > 1
          threatType: 'prompt_injection',
          predictedAction: 'block',
          explanation: 'Test',
          features: {},
          processingTimeMs: 45,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should validate predicted action', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/analyze-output', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          modelId: 'model-1',
          riskScore: 0.8,
          confidence: 0.9,
          threatType: 'prompt_injection',
          predictedAction: 'invalid_action',
          explanation: 'Test',
          features: {},
          processingTimeMs: 45,
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

      const request = new NextRequest('http://localhost:3000/api/firewall/analyze-output', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          modelId: 'model-1',
          riskScore: 0.8,
          confidence: 0.9,
          threatType: 'prompt_injection',
          predictedAction: 'block',
          explanation: 'Test',
          features: {},
          processingTimeMs: 45,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should require admin role for creating analysis output', async () => {
      const mockGetServerSession = require('next-auth').getServerSession;
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'test-user-id',
          email: 'test@sigmacode.ai',
          role: 'user', // Not admin
        },
      });

      const request = new NextRequest('http://localhost:3000/api/firewall/analyze-output', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          modelId: 'model-1',
          riskScore: 0.8,
          confidence: 0.9,
          threatType: 'prompt_injection',
          predictedAction: 'block',
          explanation: 'Test',
          features: {},
          processingTimeMs: 45,
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
    it('should respond quickly to analysis queries', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'analysis-1',
          requestId: 'req-123',
          tenantId: 'test-tenant',
          modelId: 'model-1',
          riskScore: 0.8,
          confidence: 0.9,
          threatType: 'prompt_injection',
          predictedAction: 'block',
          explanation: 'High risk detected',
          features: {},
          processingTimeMs: 45,
          similarKnownThreats: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/firewall/analyze-output?requestId=req-123',
      );
      const startTime = Date.now();

      const response = await GET(request);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(300); // Should respond within 300ms
    });

    it('should handle concurrent analysis requests', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'analysis-1',
          requestId: 'req-123',
          tenantId: 'test-tenant',
          modelId: 'model-1',
          riskScore: 0.8,
          confidence: 0.9,
          threatType: 'prompt_injection',
          predictedAction: 'block',
          explanation: 'High risk detected',
          features: {},
          processingTimeMs: 45,
          similarKnownThreats: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const requests = Array(5)
        .fill(null)
        .map(
          (_, i) =>
            new NextRequest(`http://localhost:3000/api/firewall/analyze-output?requestId=req-${i}`),
        );

      const startTime = Date.now();
      const promises = requests.map((req) => GET(req));
      const responses = await Promise.all(promises);
      const endTime = Date.now();

      const totalTime = endTime - startTime;

      expect(responses).toHaveLength(5);
      responses.forEach((response: Response) => {
        expect(response.status).toBe(200);
      });
      expect(totalTime).toBeLessThan(1000); // Should handle concurrent requests efficiently
    });
  });

  describe('Data Validation', () => {
    it('should validate threat type enum', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/analyze-output', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          modelId: 'model-1',
          riskScore: 0.8,
          confidence: 0.9,
          threatType: 'invalid_threat_type',
          predictedAction: 'block',
          explanation: 'Test',
          features: {},
          processingTimeMs: 45,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should validate processing time', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/analyze-output', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          modelId: 'model-1',
          riskScore: 0.8,
          confidence: 0.9,
          threatType: 'prompt_injection',
          predictedAction: 'block',
          explanation: 'Test',
          features: {},
          processingTimeMs: -1, // Invalid negative value
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should validate features object', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/analyze-output', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          modelId: 'model-1',
          riskScore: 0.8,
          confidence: 0.9,
          threatType: 'prompt_injection',
          predictedAction: 'block',
          explanation: 'Test',
          features: 'invalid_features', // Should be object
          processingTimeMs: 45,
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
      const request = new NextRequest('http://localhost:3000/api/firewall/analyze-output', {
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
      const request = new NextRequest('http://localhost:3000/api/firewall/analyze-output', {
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

      const request = new NextRequest('http://localhost:3000/api/firewall/analyze-output', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: 'req-123',
          modelId: 'model-1',
          riskScore: 0.8,
          confidence: 0.9,
          threatType: 'prompt_injection',
          predictedAction: 'block',
          explanation: 'Test',
          features: {},
          processingTimeMs: 45,
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
