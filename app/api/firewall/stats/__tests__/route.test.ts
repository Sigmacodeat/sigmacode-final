/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

// Mock Auth
jest.mock('@/lib/auth', () => ({
  getServerAuthSession: jest.fn(() =>
    Promise.resolve({ user: { id: 'u1', email: 'u1@example.com', role: 'admin' } }),
  ),
}));

// Use central DB mock (mapped in jest.config.js)
import { __mockDbApi } from '@/test-utils/mocks/db';

describe('/api/firewall/stats', () => {
  let route: any;
  let GET: any;

  beforeEach(async () => {
    const auth = require('@/lib/auth');
    auth.getServerAuthSession.mockResolvedValue({
      user: { id: 'u1', email: 'u1@example.com', role: 'admin' },
    });
    // Import route AFTER mocks
    route = require('@/app/api/firewall/stats/route');
    GET = route.GET;
    // Configure central DB execute behavior
    __mockDbApi.__setExecuteImpl((q: any) => {
      const text = String(q?.text || q?.sql || q).toLowerCase();
      if (
        text.includes('from firewall_logs') &&
        text.includes('ts between') &&
        !text.includes("action in ('allow','shadow-allow')") &&
        !text.includes("action in ('block','shadow-block')") &&
        text.includes('count(*)')
      ) {
        return { rows: [{ count: 1000 }] };
      }
      if (text.includes("action in ('allow','shadow-allow')") && text.includes('count(*)')) {
        return { rows: [{ count: 900 }] };
      }
      if (text.includes("action in ('block','shadow-block')") && text.includes('count(*)')) {
        return { rows: [{ count: 100 }] };
      }
      if (text.includes('avg(latency_ms)')) {
        return { rows: [{ avg: 120 }] };
      }
      if (text.includes('jsonb_array_elements') || text.includes('threat_matches')) {
        return { rows: [{ category: 'sql injection', count: 10 }] };
      }
      return { rows: [] };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/firewall/stats', () => {
    it('requires authentication', async () => {
      const auth = require('@/lib/auth');
      auth.getServerAuthSession.mockResolvedValueOnce(null);
      const req = new NextRequest('http://localhost:3000/api/firewall/stats');
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it('returns aggregated metrics from DB', async () => {
      const req = new NextRequest('http://localhost:3000/api/firewall/stats');
      const res = await GET(req);
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(typeof json.totalRequests).toBe('number');
      expect(typeof json.allowedRequests).toBe('number');
      expect(typeof json.blockedRequests).toBe('number');
      expect(typeof json.averageLatency).toBe('number');
      // total should be at least the sum of allowed + blocked
      expect(json.totalRequests).toBeGreaterThanOrEqual(
        json.allowedRequests + json.blockedRequests,
      );
      expect(Array.isArray(json.topThreats)).toBe(true);
      expect(json).toHaveProperty('isEnabled');
      expect(json).toHaveProperty('mode');
      expect(json).toHaveProperty('window');
    });

    it('handles time range parameters', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/firewall/stats?from=2024-01-01T00:00:00Z&to=2024-01-02T00:00:00Z',
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
    });

    it('handles database errors gracefully', async () => {
      __mockDbApi.__setExecuteImpl(() => {
        throw new Error('DB down');
      });
      const req = new NextRequest('http://localhost:3000/api/firewall/stats');
      const res = await GET(req);
      const json = await res.json();
      expect(res.status).toBe(500);
      expect(json.error).toBeDefined();
    });
  });
});
