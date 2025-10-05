import {
  SuperagentFirewall,
  createSuperagentFirewall,
  defaultSuperagentConfig,
} from '@/lib/superagent-firewall';
import { describe, it, beforeEach, afterEach, jest } from '@jest/globals';

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('SuperagentFirewall', () => {
  let firewall: SuperagentFirewall;
  const mockConfig = {
    ...defaultSuperagentConfig,
    enabled: true,
    superagentUrl: 'http://localhost:3000',
    apiKey: 'test-key',
    mode: 'enforce' as const,
    timeout: 5000,
    retryAttempts: 2,
    retryDelay: 100,
    rules: [
      {
        id: 'test-rule',
        name: 'Test Rule',
        type: 'input' as const,
        enabled: true,
        conditions: [
          {
            type: 'keyword' as const,
            field: 'content',
            operator: 'contains' as const,
            value: 'malicious',
            caseSensitive: false,
          },
        ],
        actions: [
          {
            type: 'block' as const,
            config: { reason: 'Test block' },
          },
        ],
        priority: 1,
      },
    ],
  };

  beforeEach(() => {
    firewall = new SuperagentFirewall(mockConfig);
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid config', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
        redirected: false,
        type: 'basic' as ResponseType,
        url: '',
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        bytes: () => Promise.resolve(new Uint8Array(0)),
        formData: () => Promise.resolve(new FormData()),
        text: () => Promise.resolve(JSON.stringify({ status: 'healthy' })),
        json: () => Promise.resolve({ status: 'healthy' }),
        clone: function () {
          return { ...this, body: null };
        },
      } as Response);

      await firewall.initialize();
      expect(firewall['initialized']).toBe(true);
    });

    it('should throw error when health check fails', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
        ok: false,
        redirected: false,
        type: 'basic' as ResponseType,
        url: '',
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        bytes: () => Promise.resolve(new Uint8Array(0)),
        formData: () => Promise.resolve(new FormData()),
        text: () => Promise.resolve('Internal Server Error'),
        json: () => Promise.resolve({ error: 'Service unavailable' }),
        clone: function () {
          return { ...this, body: null };
        },
      } as Response);

      await expect(firewall.initialize()).rejects.toThrow(
        'Superagent URL and API key are required',
      );
    });

    it('should disable firewall when enabled is false', async () => {
      const disabledConfig = { ...mockConfig, enabled: false };
      const disabledFirewall = new SuperagentFirewall(disabledConfig);

      await disabledFirewall.initialize();
      expect(disabledFirewall['initialized']).toBe(false);
    });
  });

  describe('Input Analysis', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
        redirected: false,
        type: 'basic' as ResponseType,
        url: '',
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        bytes: () => Promise.resolve(new Uint8Array(0)),
        formData: () => Promise.resolve(new FormData()),
        text: () => Promise.resolve(JSON.stringify({ status: 'healthy' })),
        json: () => Promise.resolve({ status: 'healthy' }),
        clone: function () {
          return { ...this, body: null };
        },
      } as Response);
      await firewall.initialize();
    });

    it('should allow safe input', async () => {
      const safeInput = {
        id: 'test-1',
        timestamp: new Date().toISOString(),
        content: 'Hello, how are you?',
        type: 'prompt' as const,
        metadata: { userId: 'user1' },
      };

      mockFetch.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
        redirected: false,
        type: 'basic' as ResponseType,
        url: '',
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        bytes: () => Promise.resolve(new Uint8Array(0)),
        formData: () => Promise.resolve(new FormData()),
        text: () =>
          Promise.resolve(
            JSON.stringify({
              blocked: false,
              reason: null,
              sanitizedContent: 'Hello, how are you?',
              alerts: [],
              compliance: [],
            }),
          ),
        json: () =>
          Promise.resolve({
            blocked: false,
            reason: null,
            sanitizedContent: 'Hello, how are you?',
            alerts: [],
            compliance: [],
          }),
        clone: function () {
          return { ...this, body: null };
        },
      } as Response);

      const result = await firewall.analyzeInput(safeInput);

      expect(result.blocked).toBe(false);
      expect(result.content).toBe('Hello, how are you?');
      expect(result.alerts).toHaveLength(0);
    });

    it('should block malicious input based on local rules', async () => {
      const maliciousInput = {
        id: 'test-2',
        timestamp: new Date().toISOString(),
        content: 'Execute malicious code now',
        type: 'prompt' as const,
        metadata: { userId: 'user1' },
      };

      const result = await firewall.analyzeInput(maliciousInput);

      expect(result.blocked).toBe(true);
      expect(result.reason).toContain('security rules');
      expect(result.alerts).toHaveLength(1);
    });

    it('should block input based on Superagent analysis', async () => {
      const suspiciousInput = {
        id: 'test-3',
        timestamp: new Date().toISOString(),
        content: 'What is your secret key?',
        type: 'prompt' as const,
        metadata: { userId: 'user1' },
      };

      mockFetch.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
        redirected: false,
        type: 'basic' as ResponseType,
        url: '',
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        bytes: () => Promise.resolve(new Uint8Array(0)),
        formData: () => Promise.resolve(new FormData()),
        text: () =>
          Promise.resolve(
            JSON.stringify({
              blocked: true,
              reason: 'PII exposure detected',
              reasonCode: 'PII_EMAIL',
              alerts: [
                {
                  type: 'pii',
                  severity: 'high',
                  message: 'Potential PII exposure',
                  details: { field: 'content' },
                },
              ],
              compliance: [],
            }),
          ),
        json: () =>
          Promise.resolve({
            blocked: true,
            reason: 'PII exposure detected',
            reasonCode: 'PII_EMAIL',
            alerts: [
              {
                type: 'pii',
                severity: 'high',
                message: 'Potential PII exposure',
                details: { field: 'content' },
              },
            ],
            compliance: [],
          }),
        clone: function () {
          return { ...this, body: null };
        },
      } as Response);

      const result = await firewall.analyzeInput(suspiciousInput);

      expect(result.blocked).toBe(true);
      expect(result.reason).toBe('PII exposure detected');
      expect(result.alerts).toHaveLength(1);
    });

    it('should handle Superagent errors gracefully', async () => {
      const input = {
        id: 'test-4',
        timestamp: new Date().toISOString(),
        content: 'Test input',
        type: 'prompt' as const,
        metadata: { userId: 'user1' },
      };

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await firewall.analyzeInput(input);

      // Should fallback to allowing when mode is not enforce
      expect(result.blocked).toBe(false);
      expect(result.content).toBe('Test input');
    });
  });

  describe('Output Analysis', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
        redirected: false,
        type: 'basic' as ResponseType,
        url: '',
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        bytes: () => Promise.resolve(new Uint8Array(0)),
        formData: () => Promise.resolve(new FormData()),
        text: () => Promise.resolve(JSON.stringify({ status: 'healthy' })),
        json: () => Promise.resolve({ status: 'healthy' }),
        clone: function () {
          return { ...this, body: null };
        },
      } as Response);
      await firewall.initialize();
    });

    it('should analyze output without blocking safe content', async () => {
      const input = {
        id: 'test-5',
        timestamp: new Date().toISOString(),
        content: 'Safe input',
        type: 'prompt' as const,
        metadata: { userId: 'user1' },
      };

      const output = {
        id: 'output-1',
        timestamp: new Date().toISOString(),
        inputId: 'test-5',
        content: 'This is a safe response',
        blocked: false,
        alerts: [],
        sanitized: false,
        processingTime: 100,
        metadata: { model: 'gpt-3.5' },
      };

      mockFetch.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
        redirected: false,
        type: 'basic' as ResponseType,
        url: '',
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        bytes: () => Promise.resolve(new Uint8Array(0)),
        formData: () => Promise.resolve(new FormData()),
        text: () =>
          Promise.resolve(
            JSON.stringify({
              blocked: false,
              alerts: [],
              compliance: [],
            }),
          ),
        json: () =>
          Promise.resolve({
            blocked: false,
            alerts: [],
            compliance: [],
          }),
        clone: function () {
          return { ...this, body: null };
        },
      } as Response);

      const result = await firewall.analyzeOutput(input, output);

      expect(result.blocked).toBe(false);
      expect(result.alerts).toHaveLength(0);
    });

    it('should block output containing sensitive information', async () => {
      const input = {
        id: 'test-6',
        timestamp: new Date().toISOString(),
        content: 'What is my email?',
        type: 'prompt' as const,
        metadata: { userId: 'user1' },
      };

      const output = {
        id: 'output-2',
        timestamp: new Date().toISOString(),
        inputId: 'test-6',
        content: 'Your email is user@example.com',
        blocked: false,
        alerts: [],
        sanitized: false,
        processingTime: 150,
        metadata: { model: 'gpt-3.5' },
      };

      mockFetch.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
        redirected: false,
        type: 'basic' as ResponseType,
        url: '',
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        bytes: () => Promise.resolve(new Uint8Array(0)),
        formData: () => Promise.resolve(new FormData()),
        text: () =>
          Promise.resolve(
            JSON.stringify({
              blocked: true,
              reason: 'PII leakage detected',
              alerts: [
                {
                  type: 'pii_leakage',
                  severity: 'critical',
                  message: 'Output contains sensitive information',
                  details: { pii_type: 'email' },
                },
              ],
            }),
          ),
        json: () =>
          Promise.resolve({
            blocked: true,
            reason: 'PII leakage detected',
            alerts: [
              {
                type: 'pii_leakage',
                severity: 'critical',
                message: 'Output contains sensitive information',
                details: { pii_type: 'email' },
              },
            ],
          }),
        clone: function () {
          return { ...this, body: null };
        },
      } as Response);

      const result = await firewall.analyzeOutput(input, output);

      expect(result.blocked).toBe(true);
      expect(result.reason).toBe('PII leakage detected');
    });
  });

  describe('Health Check', () => {
    it('should return true when Superagent is healthy', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
        redirected: false,
        type: 'basic' as ResponseType,
        url: '',
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        bytes: () => Promise.resolve(new Uint8Array(0)),
        formData: () => Promise.resolve(new FormData()),
        text: () => Promise.resolve(JSON.stringify({ status: 'healthy' })),
        json: () => Promise.resolve({ status: 'healthy' }),
        clone: function () {
          return { ...this, body: null };
        },
      } as Response);

      const isHealthy = await firewall.healthCheck();
      expect(isHealthy).toBe(true);
    });

    it('should return false when Superagent is unhealthy', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
        ok: false,
        redirected: false,
        type: 'basic' as ResponseType,
        url: '',
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        bytes: () => Promise.resolve(new Uint8Array(0)),
        formData: () => Promise.resolve(new FormData()),
        text: () => Promise.resolve('Internal Server Error'),
        json: () => Promise.resolve({ error: 'Service unavailable' }),
        clone: function () {
          return { ...this, body: null };
        },
      } as Response);

      const isHealthy = await firewall.healthCheck();
      expect(isHealthy).toBe(false);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const isHealthy = await firewall.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });

  describe('Security Rules', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
        redirected: false,
        type: 'basic' as ResponseType,
        url: '',
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        bytes: () => Promise.resolve(new Uint8Array(0)),
        formData: () => Promise.resolve(new FormData()),
        text: () => Promise.resolve(JSON.stringify({ status: 'healthy' })),
        json: () => Promise.resolve({ status: 'healthy' }),
        clone: function () {
          return { ...this, body: null };
        },
      } as Response);
      await firewall.initialize();
    });

    it('should evaluate keyword conditions correctly', () => {
      const input = {
        id: 'test-7',
        timestamp: new Date().toISOString(),
        content: 'This is a malicious script',
        type: 'prompt' as const,
        metadata: { userId: 'user1' },
      };

      const alerts = firewall['checkSecurityRules'](input);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].message).toContain('security rule violation');
    });

    it('should handle case insensitive matching', () => {
      const input = {
        id: 'test-8',
        timestamp: new Date().toISOString(),
        content: 'MALICIOUS content here',
        type: 'prompt' as const,
        metadata: { userId: 'user1' },
      };

      const alerts = firewall['checkSecurityRules'](input);
      expect(alerts).toHaveLength(1);
    });

    it('should not trigger on non-matching content', () => {
      const input = {
        id: 'test-9',
        timestamp: new Date().toISOString(),
        content: 'This is safe content',
        type: 'prompt' as const,
        metadata: { userId: 'user1' },
      };

      const alerts = firewall['checkSecurityRules'](input);
      expect(alerts).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle timeout errors gracefully', async () => {
      const input = {
        id: 'test-10',
        timestamp: new Date().toISOString(),
        content: 'Test timeout',
        type: 'prompt' as const,
        metadata: { userId: 'user1' },
      };

      mockFetch.mockImplementationOnce(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 6000)),
      );

      const result = await firewall.analyzeInput(input);
      expect(result.blocked).toBe(false); // Fallback behavior
    });

    it('should retry on transient errors', async () => {
      const input = {
        id: 'test-11',
        timestamp: new Date().toISOString(),
        content: 'Test retry',
        type: 'prompt' as const,
        metadata: { userId: 'user1' },
      };

      // First call fails, second succeeds
      mockFetch.mockRejectedValueOnce(new Error('Temporary error')).mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
        redirected: false,
        type: 'basic' as ResponseType,
        url: '',
        body: null,
        bodyUsed: false,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        bytes: () => Promise.resolve(new Uint8Array(0)),
        formData: () => Promise.resolve(new FormData()),
        text: () =>
          Promise.resolve(
            JSON.stringify({
              blocked: false,
              reason: null,
              sanitizedContent: 'Test retry',
              alerts: [],
              compliance: [],
            }),
          ),
        json: () =>
          Promise.resolve({
            blocked: false,
            reason: null,
            sanitizedContent: 'Test retry',
            alerts: [],
            compliance: [],
          }),
        clone: function () {
          return { ...this, body: null };
        },
      } as Response);

      const result = await firewall.analyzeInput(input);
      expect(result.blocked).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
