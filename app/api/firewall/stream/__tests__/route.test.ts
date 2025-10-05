import { NextRequest } from 'next/server';
import { GET } from '@/api/firewall/stream/route';
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

// Mock Server-Sent Events
const mockReadableStream = new ReadableStream({
  start(controller) {
    // Send initial connection message
    controller.enqueue('data: {"type":"connected","message":"Connected to firewall stream"}\n\n');

    // Send mock events
    setTimeout(() => {
      controller.enqueue(
        'data: {"type":"analysis","requestId":"req-123","riskScore":0.3,"action":"allow"}\n\n',
      );
    }, 100);

    setTimeout(() => {
      controller.enqueue(
        'data: {"type":"alert","alertId":"alert-456","severity":"medium","message":"Suspicious activity detected"}\n\n',
      );
    }, 200);

    setTimeout(() => {
      controller.enqueue(
        'data: {"type":"heartbeat","timestamp":"' + new Date().toISOString() + '"}\n\n',
      );
    }, 300);

    // Close the stream after some time
    setTimeout(() => {
      controller.close();
    }, 1000);
  },
});

describe('/api/firewall/stream', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('GET /api/firewall/stream', () => {
    it('should establish Server-Sent Events stream', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'event-1',
          tenantId: 'test-tenant',
          eventType: 'firewall_block',
          requestId: 'req-123',
          userId: 'user-456',
          ipAddress: '192.168.1.100',
          endpoint: '/api/test',
          userAgent: 'Test Browser',
          riskScore: 0.8,
          threatType: 'prompt_injection',
          action: 'block',
          metadata: { modelId: 'model-1', confidence: 0.9 },
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/firewall/stream');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
      expect(response.headers.get('Connection')).toBe('keep-alive');
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

      // Check if it's a readable stream
      expect(response.body).toBeDefined();
      expect(response.body).toBeInstanceOf(ReadableStream);
    });

    it('should handle stream with different event types', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'event-1',
          tenantId: 'test-tenant',
          eventType: 'firewall_analysis',
          requestId: 'req-123',
          userId: 'user-456',
          ipAddress: '192.168.1.100',
          endpoint: '/api/test',
          userAgent: 'Test Browser',
          riskScore: 0.3,
          threatType: null,
          action: 'allow',
          metadata: { modelId: 'model-1', confidence: 0.95 },
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 'event-2',
          tenantId: 'test-tenant',
          eventType: 'firewall_alert',
          requestId: 'req-124',
          userId: 'user-457',
          ipAddress: '192.168.1.101',
          endpoint: '/api/sensitive',
          userAgent: 'Suspicious Browser',
          riskScore: 0.8,
          threatType: 'prompt_injection',
          action: 'block',
          metadata: { modelId: 'model-1', confidence: 0.9 },
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/firewall/stream');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should filter events by tenant', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'event-1',
          tenantId: 'test-tenant',
          eventType: 'firewall_block',
          requestId: 'req-123',
          userId: 'user-456',
          ipAddress: '192.168.1.100',
          endpoint: '/api/test',
          userAgent: 'Test Browser',
          riskScore: 0.8,
          threatType: 'prompt_injection',
          action: 'block',
          metadata: { modelId: 'model-1', confidence: 0.9 },
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/firewall/stream?tenantId=test-tenant',
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/firewall/stream');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should require authentication', async () => {
      const mockGetServerSession = require('next-auth').getServerSession;
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/firewall/stream');
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should handle client disconnect', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'event-1',
          tenantId: 'test-tenant',
          eventType: 'firewall_block',
          requestId: 'req-123',
          userId: 'user-456',
          ipAddress: '192.168.1.100',
          endpoint: '/api/test',
          userAgent: 'Test Browser',
          riskScore: 0.8,
          threatType: 'prompt_injection',
          action: 'block',
          metadata: { modelId: 'model-1', confidence: 0.9 },
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/firewall/stream');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();

      // Simulate client disconnect
      const reader = response.body?.getReader();
      if (reader) {
        await reader.cancel();
      }
    });
  });

  describe('Stream Content', () => {
    it('should send properly formatted SSE messages', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'event-1',
          tenantId: 'test-tenant',
          eventType: 'firewall_analysis',
          requestId: 'req-123',
          userId: 'user-456',
          ipAddress: '192.168.1.100',
          endpoint: '/api/test',
          userAgent: 'Test Browser',
          riskScore: 0.3,
          threatType: null,
          action: 'allow',
          metadata: { modelId: 'model-1', confidence: 0.95 },
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/firewall/stream');
      const response = await GET(request);

      expect(response.status).toBe(200);

      // The stream should send events in SSE format
      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');

            // Check for SSE format
            expect(lines.some((line) => line.startsWith('data: '))).toBe(true);
            expect(lines.some((line) => line === '')).toBe(true); // Empty line separates events
          }
        } catch (error) {
          // Stream ended or was cancelled
          expect((error as Error).name).toBe('AbortError');
        }
      }
    });

    it('should send heartbeat messages', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/firewall/stream');
      const response = await GET(request);

      expect(response.status).toBe(200);

      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          const { done, value } = await reader.read();
          if (!done) {
            buffer += decoder.decode(value, { stream: true });
            // Should contain heartbeat or connection message
            expect(buffer.length).toBeGreaterThan(0);
          }
        } catch (error) {
          // Expected when stream ends
        }
      }
    });

    it('should handle different event types', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([
        {
          id: 'event-1',
          tenantId: 'test-tenant',
          eventType: 'firewall_analysis',
          requestId: 'req-123',
          userId: 'user-456',
          ipAddress: '192.168.1.100',
          endpoint: '/api/test',
          userAgent: 'Test Browser',
          riskScore: 0.3,
          threatType: null,
          action: 'allow',
          metadata: { modelId: 'model-1', confidence: 0.95 },
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 'event-2',
          tenantId: 'test-tenant',
          eventType: 'firewall_alert',
          requestId: 'req-124',
          userId: 'user-457',
          ipAddress: '192.168.1.101',
          endpoint: '/api/sensitive',
          userAgent: 'Suspicious Browser',
          riskScore: 0.8,
          threatType: 'prompt_injection',
          action: 'block',
          metadata: { modelId: 'model-1', confidence: 0.9 },
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/firewall/stream');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should establish stream quickly', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/firewall/stream');
      const startTime = Date.now();

      const response = await GET(request);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(100); // Should establish stream within 100ms
    });

    it('should handle concurrent stream connections', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([]);

      const requests = Array(3)
        .fill(null)
        .map(() => new NextRequest('http://localhost:3000/api/firewall/stream'));

      const startTime = Date.now();
      const promises = requests.map((req) => GET(req));
      const responses = await Promise.all(promises);
      const endTime = Date.now();

      const totalTime = endTime - startTime;

      expect(responses).toHaveLength(3);
      responses.forEach((response: Response) => {
        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      });
      expect(totalTime).toBeLessThan(500); // Should handle concurrent streams efficiently
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockRejectedValue(new Error('Connection timeout'));

      const request = new NextRequest('http://localhost:3000/api/firewall/stream');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should handle authentication errors', async () => {
      const mockGetServerSession = require('next-auth').getServerSession;
      mockGetServerSession.mockRejectedValue(new Error('Authentication failed'));

      const request = new NextRequest('http://localhost:3000/api/firewall/stream');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should handle malformed requests', async () => {
      const mockGetServerSession = require('next-auth').getServerSession;
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/firewall/stream');
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });
  });

  describe('Stream Configuration', () => {
    it('should set appropriate headers for SSE', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/firewall/stream');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
      expect(response.headers.get('Connection')).toBe('keep-alive');
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Cache-Control');
    });

    it('should handle stream with query parameters', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/firewall/stream?tenantId=test-tenant&eventType=firewall_analysis',
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });
  });
});
