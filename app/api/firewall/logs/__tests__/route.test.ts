import { NextRequest } from 'next/server';
import { GET } from '@/api/firewall/logs/route';
import { getDb } from '@/database/db';
import { firewallLogs } from '@/database/schema/firewall';

// Mock the database
jest.mock('@/database/db', () => ({
  getDb: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  })),
}));

jest.mock('@/database/schema/firewall', () => ({
  firewallLogs: {
    id: 'id',
    ts: 'ts',
    requestId: 'requestId',
    backend: 'backend',
    policy: 'policy',
    action: 'action',
    latencyMs: 'latencyMs',
    status: 'status',
    userId: 'userId',
    meta: 'meta',
  },
}));

describe('/api/firewall/logs', () => {
  let mockDb: jest.Mocked<any>;

  beforeEach(() => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    };
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/firewall/logs', () => {
    it('should return logs with default parameters', async () => {
      const mockLogs = [
        {
          id: 1,
          ts: new Date().toISOString(),
          requestId: 'req-123',
          backend: 'superagent',
          policy: 'firewall-analysis',
          action: 'allow',
          latencyMs: 150,
          status: 200,
          userId: 'user123',
          meta: { inputLength: 25, model: 'gpt-3.5' },
        },
        {
          id: 2,
          ts: new Date().toISOString(),
          requestId: 'req-124',
          backend: 'superagent',
          policy: 'firewall-analysis',
          action: 'block',
          latencyMs: 200,
          status: 403,
          userId: 'user456',
          meta: { inputLength: 30, blocked: true },
        },
      ];

      mockDb.execute.mockResolvedValue({ rows: mockLogs });

      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/logs');
      const response = await GET(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toMatchObject({
        data: mockLogs,
        total: 2,
        filter: 'all',
        format: 'json',
      });

      // Verify database query
      expect(mockDb.execute).toHaveBeenCalledWith(expect.stringContaining('ORDER BY ts DESC'));
      expect(mockDb.execute).toHaveBeenCalledWith(expect.stringContaining('LIMIT 50'));
    });

    it('should filter blocked logs only', async () => {
      const mockLogs = [
        {
          id: 1,
          ts: new Date().toISOString(),
          requestId: 'req-123',
          backend: 'superagent',
          policy: 'firewall-analysis',
          action: 'block',
          latencyMs: 200,
          status: 403,
          userId: 'user123',
          meta: { blocked: true },
        },
      ];

      mockDb.execute.mockResolvedValue({ rows: mockLogs });

      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/logs?filter=blocked');
      const response = await GET(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].action).toBe('block');
    });

    it('should filter allowed logs only', async () => {
      const mockLogs = [
        {
          id: 1,
          ts: new Date().toISOString(),
          requestId: 'req-123',
          backend: 'superagent',
          policy: 'firewall-analysis',
          action: 'allow',
          latencyMs: 150,
          status: 200,
          userId: 'user123',
          meta: { blocked: false },
        },
      ];

      mockDb.execute.mockResolvedValue({ rows: mockLogs });

      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/logs?filter=allowed');
      const response = await GET(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].action).toBe('allow');
    });

    it('should handle custom limit parameter', async () => {
      const mockLogs = Array(25)
        .fill(null)
        .map((_, i) => ({
          id: i + 1,
          ts: new Date().toISOString(),
          requestId: `req-${i + 1}`,
          backend: 'superagent',
          policy: 'firewall-analysis',
          action: 'allow',
          latencyMs: 150,
          status: 200,
          userId: 'user123',
          meta: {},
        }));

      mockDb.execute.mockResolvedValue({ rows: mockLogs });

      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/logs?limit=25');
      const response = await GET(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(25);
    });

    it('should handle large limit values', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/logs?limit=1000');
      const response = await GET(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(0); // No data returned
    });

    it('should export logs as CSV', async () => {
      const mockLogs = [
        {
          id: 1,
          ts: new Date().toISOString(),
          requestId: 'req-123',
          backend: 'superagent',
          policy: 'firewall-analysis',
          action: 'allow',
          latencyMs: 150,
          status: 200,
          userId: 'user123',
          meta: { inputLength: 25 },
        },
      ];

      mockDb.execute.mockResolvedValue({ rows: mockLogs });

      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/logs?format=csv');
      const response = await GET(mockRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/csv');
      expect(response.headers.get('Content-Disposition')).toContain('firewall-logs.csv');

      const csvContent = await response.text();
      expect(csvContent).toContain(
        'ID,Timestamp,Request ID,Backend,Policy,Action,Latency (ms),Status,User ID,Meta',
      );
      expect(csvContent).toContain('req-123');
    });

    it('should handle CSV export with no data', async () => {
      mockDb.execute.mockResolvedValue({ rows: [] });

      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/logs?format=csv');
      const response = await GET(mockRequest);

      expect(response.status).toBe(200);
      const csvContent = await response.text();
      expect(csvContent).toBe('');
    });

    it('should handle database errors gracefully', async () => {
      mockDb.execute.mockRejectedValue(new Error('Database connection failed'));

      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/logs');
      const response = await GET(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Failed to fetch firewall logs');
    });

    it('should handle invalid filter parameters', async () => {
      const mockLogs = [
        {
          id: 1,
          ts: new Date().toISOString(),
          requestId: 'req-123',
          backend: 'superagent',
          policy: 'firewall-analysis',
          action: 'allow',
          latencyMs: 150,
          status: 200,
          userId: 'user123',
          meta: {},
        },
      ];

      mockDb.execute.mockResolvedValue({ rows: mockLogs });

      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/logs?filter=invalid');
      const response = await GET(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(1); // Should return all logs for invalid filter
    });

    it('should handle malformed date parameters', async () => {
      const mockLogs = [
        {
          id: 1,
          ts: new Date().toISOString(),
          requestId: 'req-123',
          backend: 'superagent',
          policy: 'firewall-analysis',
          action: 'allow',
          latencyMs: 150,
          status: 200,
          userId: 'user123',
          meta: {},
        },
      ];

      mockDb.execute.mockResolvedValue({ rows: mockLogs });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/firewall/logs?since=invalid-date',
      );
      const response = await GET(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(1);
    });

    it('should validate query parameters', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/logs?limit=abc');
      const response = await GET(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(0); // Should use default limit
    });

    it('should return logs ordered by timestamp descending', async () => {
      const mockLogs = [
        {
          id: 1,
          ts: '2024-01-01T10:00:00Z',
          requestId: 'req-1',
          backend: 'superagent',
          policy: 'firewall-analysis',
          action: 'allow',
          latencyMs: 150,
          status: 200,
          userId: 'user123',
          meta: {},
        },
        {
          id: 2,
          ts: '2024-01-01T11:00:00Z',
          requestId: 'req-2',
          backend: 'superagent',
          policy: 'firewall-analysis',
          action: 'block',
          latencyMs: 200,
          status: 403,
          userId: 'user456',
          meta: { blocked: true },
        },
      ];

      mockDb.execute.mockResolvedValue({ rows: mockLogs });

      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/logs');
      const response = await GET(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].requestId).toBe('req-2'); // Most recent first
      expect(result.data[1].requestId).toBe('req-1');
    });
  });
});
