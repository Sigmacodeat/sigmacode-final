/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { describe, it, expect, jest } from '@jest/globals';

// Mock the database
jest.mock('@/database/db', () => ({
  getDb: jest.fn(() => ({
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            offset: jest.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => Promise.resolve({})),
    })),
  })),
}));

// Mock auth helper
jest.mock('@/lib/auth', () => ({
  getServerAuthSession: jest.fn(() =>
    Promise.resolve({ user: { id: 'u1', email: 'u1@example.com', role: 'admin' } }),
  ),
}));

let GET: any;
let POST: any;

describe('Firewall Events API', () => {
  beforeEach(() => {
    const auth = require('@/lib/auth');
    auth.getServerAuthSession.mockResolvedValue({
      user: { id: 'u1', email: 'u1@example.com', role: 'admin' },
    });
    const route = require('@/app/api/firewall/events/route');
    GET = route.GET;
    POST = route.POST;
  });
  describe('GET /api/firewall/events', () => {
    it('should return firewall events', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/events');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('events');
      expect(data).toHaveProperty('total');
    });

    it('should require authentication', async () => {
      const auth = require('@/lib/auth');
      auth.getServerAuthSession.mockResolvedValueOnce(null);
      const request = new NextRequest('http://localhost:3000/api/firewall/events');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should require admin role', async () => {
      const auth = require('@/lib/auth');
      auth.getServerAuthSession.mockResolvedValueOnce({ user: { role: 'user' } });
      const request = new NextRequest('http://localhost:3000/api/firewall/events');
      const response = await GET(request);
      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/firewall/events', () => {
    it('should create a firewall event', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'firewall_block',
          requestId: 'test-request',
          userId: 'test-user',
          ipAddress: '192.168.1.1',
          endpoint: '/api/test',
          userAgent: 'test-agent',
          riskScore: 0.8,
          action: 'block',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('success', true);
    });

    it('should validate request body and return 400 for invalid data', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'invalid',
          requestId: '',
          userId: 'u1',
          ipAddress: '127.0.0.1',
          endpoint: '/x',
          userAgent: 'ua',
          riskScore: 2,
          action: 'block',
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should require authentication for POST', async () => {
      const auth = require('@/lib/auth');
      auth.getServerAuthSession.mockResolvedValueOnce(null);
      const request = new NextRequest('http://localhost:3000/api/firewall/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'firewall_block',
          requestId: 'r1',
          userId: 'u1',
          ipAddress: '127.0.0.1',
          endpoint: '/x',
          userAgent: 'ua',
          riskScore: 0.1,
          action: 'block',
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('should require admin role for POST', async () => {
      const auth = require('@/lib/auth');
      auth.getServerAuthSession.mockResolvedValueOnce({ user: { role: 'user' } });
      const request = new NextRequest('http://localhost:3000/api/firewall/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'firewall_block',
          requestId: 'r1',
          userId: 'u1',
          ipAddress: '127.0.0.1',
          endpoint: '/x',
          userAgent: 'ua',
          riskScore: 0.1,
          action: 'block',
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(403);
    });
  });
});
