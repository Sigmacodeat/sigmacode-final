import { jest, describe, it, expect, beforeAll, beforeEach, afterEach } from '@jest/globals';
import crypto from 'crypto';
// Zentrale DB-Mock-API (via moduleNameMapper auf test-utils/mocks/db.ts)
import { __mockDbApi as mockDb } from '@/test-utils/mocks/db';

import {
  AlertService,
  AlertSeverity,
  AlertCategory,
  AlertTriggerType,
  NotificationChannel,
  AlertContext,
} from '@/lib/alert-service';
import { ThreatCategory } from '@/lib/ml-threat-detector';

// Test utilities
const createMockAlertContext = (overrides: Partial<AlertContext> = {}): AlertContext => ({
  requestId: crypto.randomUUID(),
  userId: 'user-123',
  tenantId: 'tenant-456',
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0 (Test Browser)',
  endpoint: '/api/test',
  additionalData: {},
  ...overrides,
});

const createMockAlertRuleConfig = (overrides: Partial<any> = {}): any => ({
  name: 'Test Alert Rule',
  description: 'A test alert rule for testing',
  tenantId: 'tenant-456',
  triggerType: AlertTriggerType.ML_PREDICTION,
  triggerConfig: { minRiskScore: 0.8 },
  severity: AlertSeverity.HIGH,
  channels: [NotificationChannel.EMAIL, NotificationChannel.DASHBOARD],
  cooldownMinutes: 5,
  groupSimilar: true,
  groupWindowMinutes: 15,
  createdBy: 'admin',
  ...overrides,
});

describe('AlertService', () => {
  let alertService: AlertService;

  beforeAll(async () => {
    alertService = AlertService.getInstance();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Mock-DB Ergebnisse
    mockDb.__setSelectResult([]);
    mockDb.__setUpdateResult({});
    mockDb.__setUpdateResultArray([]);
    mockDb.__setInsertResult({});
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Service Initialization', () => {
    it('should create singleton instance', () => {
      const instance1 = AlertService.getInstance();
      const instance2 = AlertService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBeDefined();
      expect(instance1).toBeInstanceOf(AlertService);
    });

    it('should initialize with empty active escalations', () => {
      expect(alertService['activeEscalations']).toBeDefined();
      expect(alertService['activeEscalations'].size).toBe(0);
    });
  });

  describe('Alert Rule Management', () => {
    it('should create alert rule successfully', async () => {
      mockDb.__setInsertResult({});

      const config = createMockAlertRuleConfig();
      const ruleId = await alertService.createAlertRule(config);

      expect(ruleId).toBeDefined();
      expect(typeof ruleId).toBe('string');
      expect(mockDb.insert).toHaveBeenCalledWith('alert_rules');
      expect(mockDb.insert).toHaveBeenCalledWith({
        id: ruleId,
        name: config.name,
        description: config.description,
        tenantId: config.tenantId,
        isActive: true,
        triggerType: config.triggerType,
        triggerConfig: config.triggerConfig,
        severity: config.severity,
        channels: config.channels,
        cooldownMinutes: config.cooldownMinutes,
        groupSimilar: config.groupSimilar,
        groupWindowMinutes: config.groupWindowMinutes,
        createdBy: config.createdBy,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should validate alert rule configuration', async () => {
      // Simuliere Insert-Fehler
      (require('@/test-utils/mocks/db').__mockDbApi.insert as jest.Mock).mockImplementation(() => ({
        values: jest.fn(async () => {
          throw new Error('Database error');
        }),
      }));

      const invalidConfig = createMockAlertRuleConfig({
        name: '', // Invalid: empty name
        severity: 'invalid' as any, // Invalid: not a valid severity
        channels: [], // Invalid: no channels
      });

      await expect(alertService.createAlertRule(invalidConfig)).rejects.toThrow();
    });
  });

  describe('Alert Creation', () => {
    it('should create alert from ML analysis', async () => {
      mockDb.__setSelectResult([]);
      mockDb.__setInsertResult({});

      const mockAnalysis = {
        requestId: crypto.randomUUID(),
        modelId: 'model-123',
        riskScore: 0.85,
        confidence: 0.9,
        threatType: ThreatCategory.PROMPT_INJECTION,
        predictedAction: 'block' as const,
        explanation: 'High risk prompt injection detected',
        features: {} as any,
        processingTimeMs: 45,
        similarKnownThreats: [],
      };

      const context = createMockAlertContext({
        mlAnalysis: mockAnalysis as any,
      });

      const alertId = await alertService.createAlertFromMLAnalysis(
        'tenant-456',
        mockAnalysis as any,
        context,
      );

      expect(alertId).toBeDefined();
      expect(typeof alertId).toBe('string');
      expect(mockDb.insert).toHaveBeenCalledWith('alerts');
      expect(mockDb.insert).toHaveBeenCalledWith('alert_notifications');
    });

    it('should suppress alert due to cooldown', async () => {
      mockDb.__setSelectResult([
        {
          id: 'recent-alert-123',
          ruleId: 'test-rule',
          tenantId: 'tenant-456',
          triggeredAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        },
      ]); // Recent similar alert exists
      mockDb.__setInsertResult({});

      const mockAnalysis = {
        requestId: crypto.randomUUID(),
        modelId: 'model-123',
        riskScore: 0.85,
        confidence: 0.9,
        threatType: ThreatCategory.PROMPT_INJECTION,
        predictedAction: 'block' as const,
        explanation: 'High risk prompt injection detected',
        features: {} as any,
        processingTimeMs: 45,
        similarKnownThreats: [],
      };

      const context = createMockAlertContext({
        mlAnalysis: mockAnalysis as any,
      });

      const alertId = await alertService.createAlertFromMLAnalysis(
        'tenant-456',
        mockAnalysis as any,
        context,
      );

      expect(alertId).toBe('suppressed');
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should not create alert for low risk analysis', async () => {
      mockDb.__setSelectResult([]);
      mockDb.__setInsertResult({});

      const mockAnalysis = {
        requestId: crypto.randomUUID(),
        modelId: 'model-123',
        riskScore: 0.2, // Low risk
        confidence: 0.9,
        threatType: ThreatCategory.PROMPT_INJECTION,
        predictedAction: 'allow' as const,
        explanation: 'Low risk detected',
        features: {} as any,
        processingTimeMs: 45,
        similarKnownThreats: [],
      };

      const context = createMockAlertContext({
        mlAnalysis: mockAnalysis as any,
      });

      const alertId = await alertService.createAlertFromMLAnalysis(
        'tenant-456',
        mockAnalysis as any,
        context,
      );

      expect(alertId).toBeNull();
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('Alert Status Management', () => {
    it('should acknowledge alert successfully', async () => {
      mockDb.__setUpdateResultArray([
        {
          id: 'alert-123',
          ruleId: 'rule-456',
          tenantId: 'tenant-789',
          status: 'acknowledged',
          acknowledgedAt: new Date(),
          acknowledgedBy: 'user-123',
        },
      ]);

      const success = await alertService.acknowledgeAlert('alert-123', 'user-123');

      expect(success).toBe(true);
      expect(mockDb.update).toHaveBeenCalledWith('alerts');
    });

    it('should resolve alert successfully', async () => {
      mockDb.__setUpdateResultArray([
        {
          id: 'alert-123',
          ruleId: 'rule-456',
          tenantId: 'tenant-789',
          status: 'resolved',
          resolvedAt: new Date(),
          resolvedBy: 'user-123',
        },
      ]);

      const success = await alertService.resolveAlert('alert-123', 'user-123', 'Issue resolved');

      expect(success).toBe(true);
      expect(mockDb.update).toHaveBeenCalledWith('alerts');
    });

    it('should dismiss alert successfully', async () => {
      mockDb.__setUpdateResultArray([
        {
          id: 'alert-123',
          ruleId: 'rule-456',
          tenantId: 'tenant-789',
          status: 'dismissed',
        },
      ]);

      const success = await alertService.dismissAlert('alert-123', 'user-123', 'False positive');

      expect(success).toBe(true);
      expect(mockDb.update).toHaveBeenCalledWith('alerts');
    });

    it('should handle non-existent alert', async () => {
      mockDb.__setUpdateResultArray([]); // No rows updated

      const success = await alertService.acknowledgeAlert('non-existent-alert', 'user-123');

      expect(success).toBe(false);
    });
  });

  describe('Alert Retrieval', () => {
    it('should get alerts for tenant with filters', async () => {
      mockDb.__setSelectResult([
        {
          id: 'alert-1',
          ruleId: 'rule-1',
          tenantId: 'tenant-456',
          title: 'Test Alert 1',
          message: 'Alert message 1',
          severity: 'high',
          category: 'security_threat',
          status: 'new',
          triggeredAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 'alert-2',
          ruleId: 'rule-2',
          tenantId: 'tenant-456',
          title: 'Test Alert 2',
          message: 'Alert message 2',
          severity: 'medium',
          category: 'ml_anomaly',
          status: 'acknowledged',
          triggeredAt: new Date(),
          createdAt: new Date(),
        },
      ]);

      const alerts = await alertService.getAlerts('tenant-456', {
        status: 'new' as any,
        severity: 'high' as any,
        limit: 10,
        offset: 0,
      });

      expect(alerts).toBeDefined();
      expect(Array.isArray(alerts)).toBe(true);
      expect(alerts.length).toBe(1);
      expect(alerts[0].status).toBe('new');
      expect(alerts[0].severity).toBe('high');
    });

    it('should get alerts without filters', async () => {
      mockDb.__setSelectResult([
        {
          id: 'alert-1',
          ruleId: 'rule-1',
          tenantId: 'tenant-456',
          title: 'Test Alert 1',
          message: 'Alert message 1',
          severity: 'high',
          category: 'security_threat',
          status: 'new',
          triggeredAt: new Date(),
          createdAt: new Date(),
        },
      ]);

      const alerts = await alertService.getAlerts('tenant-456');

      expect(alerts).toBeDefined();
      expect(Array.isArray(alerts)).toBe(true);
      expect(alerts.length).toBe(1);
    });
  });

  describe('Alert Statistics', () => {
    it('should calculate alert statistics correctly', async () => {
      mockDb.__setSelectResult([
        {
          id: 'alert-1',
          ruleId: 'rule-1',
          tenantId: 'tenant-456',
          title: 'Test Alert 1',
          message: 'Alert message 1',
          severity: 'critical',
          category: 'security_threat',
          status: 'resolved',
          triggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          resolvedAt: new Date(Date.now() - 23 * 60 * 60 * 1000), // 1 hour later
          createdAt: new Date(),
        },
        {
          id: 'alert-2',
          ruleId: 'rule-2',
          tenantId: 'tenant-456',
          title: 'Test Alert 2',
          message: 'Alert message 2',
          severity: 'high',
          category: 'ml_anomaly',
          status: 'acknowledged',
          triggeredAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          acknowledgedAt: new Date(Date.now() - 11 * 60 * 60 * 1000), // 1 hour later
          createdAt: new Date(),
        },
        {
          id: 'alert-3',
          ruleId: 'rule-3',
          tenantId: 'tenant-456',
          title: 'Test Alert 3',
          message: 'Alert message 3',
          severity: 'medium',
          category: 'ml_anomaly',
          status: 'new',
          triggeredAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          createdAt: new Date(),
        },
      ]);

      const stats = await alertService.getAlertStatistics('tenant-456', 7);

      expect(stats).toBeDefined();
      expect(stats.totalAlerts).toBe(3);
      expect(stats.alertsBySeverity.critical).toBe(1);
      expect(stats.alertsBySeverity.high).toBe(1);
      expect(stats.alertsBySeverity.medium).toBe(1);
      expect(stats.alertsByCategory.security_threat).toBe(1);
      expect(stats.alertsByCategory.ml_anomaly).toBe(2);
      expect(stats.resolutionRate).toBeGreaterThan(0);
      expect(stats.avgResolutionTime).toBeGreaterThan(0);
    });
  });

  describe('Notification Management', () => {
    it('should send notifications for alert', async () => {
      mockDb.__setSelectResult([]);
      mockDb.__setInsertResult({});

      const context = createMockAlertContext();
      const mockAnalysis = {
        requestId: crypto.randomUUID(),
        modelId: 'model-123',
        riskScore: 0.85,
        confidence: 0.9,
        threatType: ThreatCategory.PROMPT_INJECTION,
        predictedAction: 'block' as const,
        explanation: 'High risk prompt injection detected',
        features: {} as any,
        processingTimeMs: 45,
        similarKnownThreats: [],
      };

      const alertId = await alertService.createAlertFromMLAnalysis(
        'tenant-456',
        mockAnalysis as any,
        context,
      );

      expect(alertId).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalledWith('alert_notifications');
    });

    it('should handle notification failures gracefully', async () => {
      mockDb.__setSelectResult([]);
      (require('@/test-utils/mocks/db').__mockDbApi.insert as jest.Mock).mockImplementation(() => ({
        values: jest.fn(async () => {
          throw new Error('Notification service unavailable');
        }),
      }));

      const context = createMockAlertContext();
      const mockAnalysis = {
        requestId: crypto.randomUUID(),
        modelId: 'model-123',
        riskScore: 0.85,
        confidence: 0.9,
        threatType: ThreatCategory.PROMPT_INJECTION,
        predictedAction: 'block' as const,
        explanation: 'High risk prompt injection detected',
        features: {} as any,
        processingTimeMs: 45,
        similarKnownThreats: [],
      };

      // Should not throw, but handle error gracefully
      const alertId = await alertService.createAlertFromMLAnalysis(
        'tenant-456',
        mockAnalysis as any,
        context,
      );

      expect(alertId).toBeDefined();
    });
  });

  describe('Alert Grouping and Cooldown', () => {
    it('should group similar alerts', async () => {
      mockDb.__setSelectResult([
        {
          id: 'recent-alert-123',
          ruleId: 'test-rule',
          tenantId: 'tenant-456',
          title: 'Similar Alert',
          message: 'Similar alert message',
          severity: 'high',
          category: 'security_threat',
          triggeredAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        },
      ]);
      mockDb.__setInsertResult({});

      const context = createMockAlertContext();
      const mockAnalysis = {
        requestId: crypto.randomUUID(),
        modelId: 'model-123',
        riskScore: 0.85,
        confidence: 0.9,
        threatType: ThreatCategory.PROMPT_INJECTION,
        predictedAction: 'block' as const,
        explanation: 'High risk prompt injection detected',
        features: {} as any,
        processingTimeMs: 45,
        similarKnownThreats: [],
      };

      const alertId = await alertService.createAlertFromMLAnalysis(
        'tenant-456',
        mockAnalysis as any,
        context,
      );

      expect(alertId).toBe('suppressed');
    });

    it('should respect cooldown period', async () => {
      mockDb.__setSelectResult([
        {
          id: 'recent-alert-123',
          ruleId: 'test-rule',
          tenantId: 'tenant-456',
          title: 'Recent Alert',
          message: 'Recent alert message',
          severity: 'high',
          category: 'security_threat',
          triggeredAt: new Date(Date.now() - 30 * 1000), // 30 seconds ago (within cooldown)
        },
      ]);
      mockDb.__setInsertResult({});

      const context = createMockAlertContext();
      const mockAnalysis = {
        requestId: crypto.randomUUID(),
        modelId: 'model-123',
        riskScore: 0.85,
        confidence: 0.9,
        threatType: ThreatCategory.PROMPT_INJECTION,
        predictedAction: 'block' as const,
        explanation: 'High risk prompt injection detected',
        features: {} as any,
        processingTimeMs: 45,
        similarKnownThreats: [],
      };

      const alertId = await alertService.createAlertFromMLAnalysis(
        'tenant-456',
        mockAnalysis as any,
        context,
      );

      expect(alertId).toBe('suppressed');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (require('@/test-utils/mocks/db').__mockDbApi.select as jest.Mock).mockImplementation(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              offset: jest.fn(() => ({
                limit: jest.fn(async () => {
                  throw new Error('Database connection failed');
                }),
              })),
            })),
          })),
        })),
      }));

      await expect(alertService.getAlerts('tenant-456')).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle invalid alert IDs', async () => {
      mockDb.__setUpdateResultArray([]); // No rows updated

      const success = await alertService.acknowledgeAlert('invalid-alert-id', 'user-123');

      expect(success).toBe(false);
    });

    it('should handle notification service failures', async () => {
      mockDb.__setSelectResult([]);
      (require('@/test-utils/mocks/db').__mockDbApi.insert as jest.Mock).mockImplementation(() => ({
        values: jest.fn(async () => {
          throw new Error('Email service unavailable');
        }),
      }));

      const context = createMockAlertContext();
      const mockAnalysis = {
        requestId: crypto.randomUUID(),
        modelId: 'model-123',
        riskScore: 0.85,
        confidence: 0.9,
        threatType: ThreatCategory.PROMPT_INJECTION,
        predictedAction: 'block' as const,
        explanation: 'High risk prompt injection detected',
        features: {} as any,
        processingTimeMs: 45,
        similarKnownThreats: [],
      };

      // Should not throw, but handle error internally
      const alertId = await alertService.createAlertFromMLAnalysis(
        'tenant-456',
        mockAnalysis as any,
        context,
      );

      expect(alertId).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should create alerts within reasonable time', async () => {
      mockDb.__setSelectResult([]);
      mockDb.__setInsertResult({});

      const context = createMockAlertContext();
      const mockAnalysis = {
        requestId: crypto.randomUUID(),
        modelId: 'model-123',
        riskScore: 0.85,
        confidence: 0.9,
        threatType: ThreatCategory.PROMPT_INJECTION,
        predictedAction: 'block' as const,
        explanation: 'High risk prompt injection detected',
        features: {} as any,
        processingTimeMs: 45,
        similarKnownThreats: [],
      };

      const startTime = Date.now();
      const alertId = await alertService.createAlertFromMLAnalysis(
        'tenant-456',
        mockAnalysis as any,
        context,
      );
      const endTime = Date.now();

      expect(alertId).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent alert creation', async () => {
      mockDb.__setSelectResult([]);
      mockDb.__setInsertResult({});

      const alerts = Array(5)
        .fill(null)
        .map((_, i) => ({
          requestId: crypto.randomUUID(),
          modelId: `model-${i}`,
          riskScore: 0.8 + i * 0.05,
          confidence: 0.9,
          threatType: ThreatCategory.PROMPT_INJECTION,
          predictedAction: 'block' as const,
          explanation: `High risk detected ${i}`,
          features: {} as any,
          processingTimeMs: 45,
          similarKnownThreats: [],
        }));

      const promises = alerts.map((analysis, i) =>
        alertService.createAlertFromMLAnalysis(
          'tenant-456',
          analysis as any,
          createMockAlertContext({ requestId: `req-${i}` }),
        ),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('Audit Logging', () => {
    it('should log audit events for alert actions', async () => {
      mockDb.__setUpdateResultArray([
        {
          id: 'alert-123',
          ruleId: 'rule-456',
          tenantId: 'tenant-789',
          status: 'acknowledged',
          acknowledgedAt: new Date(),
          acknowledgedBy: 'user-123',
        },
      ]);
      mockDb.__setInsertResult({});

      await alertService.acknowledgeAlert('alert-123', 'user-123');

      expect(mockDb.insert).toHaveBeenCalledWith('alert_audit_log');
      expect(mockDb.insert).toHaveBeenCalledWith({
        id: expect.any(String),
        alertId: 'alert-123',
        tenantId: 'tenant-789',
        action: 'acknowledged',
        actor: 'user-123',
        actorType: 'user',
        changes: expect.any(Object),
        reason: 'Alert acknowledged by user',
        timestamp: expect.any(Date),
      });
    });
  });
});
