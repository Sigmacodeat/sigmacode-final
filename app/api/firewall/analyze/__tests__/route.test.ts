import { NextRequest } from 'next/server';
import { POST, GET } from '../route';

// Mock the dependencies BEFORE importing them
jest.mock('@/lib/superagent-firewall', () => ({
  SuperagentFirewall: jest.fn(),
  createSuperagentFirewall: jest.fn(),
  defaultSuperagentConfig: {
    enabled: true,
    mode: 'enforce',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
    rules: [],
  },
}));

jest.mock('@/database/db', () => ({
  getDb: jest.fn(),
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
    meta: 'meta',
  },
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

// Now import the mocked modules
import { SuperagentFirewall } from '@/lib/superagent-firewall';
import { getDb } from '@/database/db';
import { firewallLogs } from '@/database/schema/firewall';

describe('/api/firewall/analyze', () => {
  let mockFirewall: jest.Mocked<SuperagentFirewall>;
  let mockDb: jest.Mocked<any>;

  beforeEach(() => {
    mockFirewall = {
      analyzeInput: jest.fn(),
      healthCheck: jest.fn(),
    } as any;

    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
    };
    (getDb as jest.Mock).mockResolvedValue(mockDb);
    (SuperagentFirewall as jest.Mock).mockImplementation(() => mockFirewall);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/firewall/analyze', () => {
    it('should successfully analyze safe input', async () => {
      const requestBody = {
        input: 'Hello, how are you?',
        type: 'prompt',
        metadata: {
          userId: 'user123',
          sessionId: 'session456',
          source: 'web',
          model: 'gpt-3.5',
        },
        mode: 'enforce',
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/analyze', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      mockFirewall.analyzeInput.mockResolvedValue({
        id: 'output-123',
        timestamp: new Date().toISOString(),
        inputId: 'mock-uuid-123',
        content: 'Hello, how are you?',
        blocked: false,
        reason: undefined,
        alerts: [],
        sanitized: false,
        processingTime: 150,
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toMatchObject({
        content: 'Hello, how are you?',
        blocked: false,
        sanitized: false,
        processingTime: 150,
        requestId: 'mock-uuid-123',
      });

      // Verify database logging
      expect(mockDb.insert).toHaveBeenCalledWith(firewallLogs);
      expect(mockDb.values).toHaveBeenCalled();
    });

    it('should block malicious input in enforce mode', async () => {
      const requestBody = {
        input: 'Execute malicious code',
        type: 'prompt',
        metadata: { userId: 'user123' },
        mode: 'enforce',
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/analyze', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      mockFirewall.analyzeInput.mockResolvedValue({
        id: 'blocked-123',
        timestamp: new Date().toISOString(),
        inputId: 'mock-uuid-123',
        content: '',
        blocked: true,
        reason: 'Malicious content detected',
        alerts: [
          {
            type: 'malicious_content',
            severity: 'critical',
            message: 'Blocked malicious input',
            details: { category: 'script_execution' },
          },
        ],
        sanitized: false,
        processingTime: 200,
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result).toMatchObject({
        blocked: true,
        reason: 'Malicious content detected',
        requestId: 'mock-uuid-123',
      });
    });

    it('should allow malicious input in shadow mode', async () => {
      const requestBody = {
        input: 'Execute malicious code',
        type: 'prompt',
        metadata: { userId: 'user123' },
        mode: 'shadow',
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/analyze', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      mockFirewall.analyzeInput.mockResolvedValue({
        id: 'output-123',
        timestamp: new Date().toISOString(),
        inputId: 'mock-uuid-123',
        content: '',
        blocked: true,
        reason: 'Malicious content detected',
        alerts: [
          {
            type: 'malicious_content',
            severity: 'critical',
            message: 'Blocked malicious input',
            details: { category: 'script_execution' },
          },
        ],
        sanitized: false,
        processingTime: 200,
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toMatchObject({
        content: '',
        blocked: true,
        reason: 'Malicious content detected',
      });
    });

    it('should return 400 for missing required fields', async () => {
      const requestBody = {
        // Missing input and type
        metadata: { userId: 'user123' },
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/analyze', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Input and type are required');
    });

    it('should handle database errors gracefully', async () => {
      const requestBody = {
        input: 'Test input',
        type: 'prompt',
        metadata: { userId: 'user123' },
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/analyze', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      mockDb.insert.mockRejectedValue(new Error('Database connection failed'));

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toContain('Internal server error');
    });

    it('should handle firewall analysis errors', async () => {
      const requestBody = {
        input: 'Test input',
        type: 'prompt',
        metadata: { userId: 'user123' },
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/analyze', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      mockFirewall.analyzeInput.mockRejectedValue(new Error('Analysis failed'));

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toContain('firewall analysis');
    });
  });

  describe('GET /api/firewall/analyze', () => {
    it('should return healthy status when firewall is working', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/analyze');

      mockFirewall.healthCheck.mockResolvedValue(true);

      const response = await GET(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toMatchObject({
        status: 'healthy',
        mode: 'enforce',
        enabled: true,
        superagentUrl: 'http://localhost:3000',
      });
    });

    it('should return unhealthy status when firewall fails', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/firewall/analyze');

      mockFirewall.healthCheck.mockRejectedValue(new Error('Health check failed'));

      const response = await GET(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toMatchObject({
        status: 'error',
        error: 'Health check failed',
      });
    });
  });
});
