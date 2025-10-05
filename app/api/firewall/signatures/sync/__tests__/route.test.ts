import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
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
    execute: jest.fn(() => Promise.resolve({})),
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

// Mock external signature service
jest.mock('@/lib/signature-service', () => ({
  SignatureService: {
    getInstance: jest.fn(() => ({
      syncSignatures: jest.fn(() =>
        Promise.resolve({
          synced: 150,
          updated: 25,
          added: 10,
          removed: 5,
          errors: [],
        }),
      ),
      getSignatureStats: jest.fn(() =>
        Promise.resolve({
          total: 150,
          active: 145,
          lastSync: new Date().toISOString(),
          sources: ['community', 'commercial', 'custom'],
        }),
      ),
    })),
  },
}));

describe('/api/firewall/signatures/sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('GET /api/firewall/signatures/sync', () => {
    it('should return signature sync status', async () => {
      const mockSignatureService =
        require('@/lib/signature-service').SignatureService.getInstance();
      mockSignatureService.getSignatureStats.mockResolvedValue({
        total: 150,
        active: 145,
        lastSync: new Date().toISOString(),
        sources: ['community', 'commercial', 'custom'],
        version: '1.2.3',
        nextSync: new Date(Date.now() + 3600000).toISOString(),
      });

      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.stats).toBeDefined();
      expect(data.stats.total).toBe(150);
      expect(data.stats.active).toBe(145);
      expect(data.stats.sources).toEqual(['community', 'commercial', 'custom']);
      expect(data.stats.version).toBe('1.2.3');
      expect(data.stats.lastSync).toBeDefined();
      expect(data.stats.nextSync).toBeDefined();
    });

    it('should handle service errors gracefully', async () => {
      const mockSignatureService =
        require('@/lib/signature-service').SignatureService.getInstance();
      mockSignatureService.getSignatureStats.mockRejectedValue(
        new Error('Signature service unavailable'),
      );

      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should require authentication', async () => {
      const mockGetServerSession = require('next-auth').getServerSession;
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync');
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/firewall/signatures/sync', () => {
    it('should trigger signature synchronization', async () => {
      const mockSignatureService =
        require('@/lib/signature-service').SignatureService.getInstance();
      mockSignatureService.syncSignatures.mockResolvedValue({
        synced: 150,
        updated: 25,
        added: 10,
        removed: 5,
        errors: [],
      });

      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          force: false,
          sources: ['community', 'commercial'],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.success).toBe(true);
      expect(data.message).toBeDefined();
      expect(data.result).toBeDefined();
      expect(data.result.synced).toBe(150);
      expect(data.result.updated).toBe(25);
      expect(data.result.added).toBe(10);
      expect(data.result.removed).toBe(5);
      expect(data.result.errors).toEqual([]);
      expect(mockSignatureService.syncSignatures).toHaveBeenCalledWith({
        force: false,
        sources: ['community', 'commercial'],
      });
    });

    it('should handle sync with force flag', async () => {
      const mockSignatureService =
        require('@/lib/signature-service').SignatureService.getInstance();
      mockSignatureService.syncSignatures.mockResolvedValue({
        synced: 200,
        updated: 50,
        added: 25,
        removed: 10,
        errors: [],
      });

      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          force: true,
          sources: ['all'],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.result.synced).toBe(200);
      expect(mockSignatureService.syncSignatures).toHaveBeenCalledWith({
        force: true,
        sources: ['all'],
      });
    });

    it('should validate request parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          force: 'invalid', // Should be boolean
          sources: 'invalid', // Should be array
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should validate sources array', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sources: ['invalid_source'],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should handle sync service errors', async () => {
      const mockSignatureService =
        require('@/lib/signature-service').SignatureService.getInstance();
      mockSignatureService.syncSignatures.mockRejectedValue(new Error('Sync service unavailable'));

      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          force: false,
          sources: ['community'],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should handle sync with errors', async () => {
      const mockSignatureService =
        require('@/lib/signature-service').SignatureService.getInstance();
      mockSignatureService.syncSignatures.mockResolvedValue({
        synced: 100,
        updated: 15,
        added: 5,
        removed: 2,
        errors: ['Failed to fetch from source A', 'Timeout on source B'],
      });

      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          force: false,
          sources: ['community', 'commercial'],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.result.synced).toBe(100);
      expect(data.result.errors).toHaveLength(2);
      expect(data.result.errors[0]).toBe('Failed to fetch from source A');
    });

    it('should require admin role for sync', async () => {
      const mockGetServerSession = require('next-auth').getServerSession;
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'test-user-id',
          email: 'test@sigmacode.ai',
          role: 'user', // Not admin
        },
      });

      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          force: false,
          sources: ['community'],
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
    it('should respond quickly to status requests', async () => {
      const mockSignatureService =
        require('@/lib/signature-service').SignatureService.getInstance();
      mockSignatureService.getSignatureStats.mockResolvedValue({
        total: 150,
        active: 145,
        lastSync: new Date().toISOString(),
        sources: ['community', 'commercial'],
        version: '1.2.3',
        nextSync: new Date(Date.now() + 3600000).toISOString(),
      });

      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync');
      const startTime = Date.now();

      const response = await GET(request);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(200); // Should respond within 200ms
    });

    it('should handle concurrent sync requests', async () => {
      const mockSignatureService =
        require('@/lib/signature-service').SignatureService.getInstance();
      mockSignatureService.syncSignatures.mockResolvedValue({
        synced: 150,
        updated: 25,
        added: 10,
        removed: 5,
        errors: [],
      });

      const requests = Array(3)
        .fill(null)
        .map(
          (_, i) =>
            new NextRequest('http://localhost:3000/api/firewall/signatures/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                force: false,
                sources: ['community'],
              }),
            }),
        );

      const startTime = Date.now();
      const promises = requests.map((req) => POST(req));
      const responses = await Promise.all(promises);
      const endTime = Date.now();

      const totalTime = endTime - startTime;

      expect(responses).toHaveLength(3);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
      expect(totalTime).toBeLessThan(2000); // Should handle concurrent requests efficiently
    });
  });

  describe('Data Validation', () => {
    it('should validate sources array', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sources: ['invalid_source'],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should validate force parameter type', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          force: 'true', // Should be boolean
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.error).toBeDefined();
    });

    it('should handle empty sources array', async () => {
      const mockSignatureService =
        require('@/lib/signature-service').SignatureService.getInstance();
      mockSignatureService.syncSignatures.mockResolvedValue({
        synced: 0,
        updated: 0,
        added: 0,
        removed: 0,
        errors: ['No sources specified'],
      });

      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sources: [],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.result.synced).toBe(0);
      expect(data.result.errors).toContain('No sources specified');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync', {
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
      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync', {
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

    it('should handle service unavailability', async () => {
      const mockSignatureService =
        require('@/lib/signature-service').SignatureService.getInstance();
      mockSignatureService.syncSignatures.mockRejectedValue(
        new Error('Service temporarily unavailable'),
      );

      const request = new NextRequest('http://localhost:3000/api/firewall/signatures/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sources: ['community'],
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
