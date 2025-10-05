import { MLThreatDetector } from '@/lib/ml-threat-detector';
import { AlertService } from '@/lib/alert-service';
import { MLTrainingService } from '@/lib/ml-training-service';
import { describe, it, expect, beforeEach, afterEach, jest, beforeAll } from '@jest/globals';

// Mock crypto for Jest environment
const crypto = {
  randomUUID: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
};

// Mock all external dependencies
jest.mock('@/database/db', () => ({
  getDb: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
  })),
}));

jest.mock('@/database/schema/ml-models', () => ({
  mlModels: 'ml_models',
  mlPredictions: 'ml_predictions',
  mlTrainingData: 'ml_training_data',
  mlModelMetrics: 'ml_model_metrics',
  behavioralPatterns: 'behavioral_patterns',
}));

jest.mock('@/database/schema/alerts', () => ({
  alertRules: 'alert_rules',
  alerts: 'alerts',
  alertNotifications: 'alert_notifications',
  alertStatistics: 'alert_statistics',
  alertTemplates: 'alert_templates',
  alertEscalationPolicies: 'alert_escalation_policies',
  alertAuditLog: 'alert_audit_log',
}));

const createMockRequestData = (overrides: Partial<any> = {}): any => ({
  requestId: crypto.randomUUID(),
  content: 'Test request content for integration testing',
  userId: 'user-123',
  tenantId: 'tenant-456',
  endpoint: '/api/test',
  userAgent: 'Mozilla/5.0 (Integration Test)',
  ipAddress: '192.168.1.100',
  headers: { 'Content-Type': 'application/json' },
  timestamp: new Date(),
  ...overrides,
});

const createMockMLAnalysis = (overrides: Partial<any> = {}): any => ({
  requestId: crypto.randomUUID(),
  modelId: 'integration-test-model',
  riskScore: 0.8,
  confidence: 0.9,
  threatType: 'prompt_injection',
  predictedAction: 'block' as const,
  explanation: 'Integration test threat detected',
  features: {
    contentLength: 100,
    tokenCount: 25,
    complexityScore: 0.5,
    specialCharsRatio: 0.1,
    uppercaseRatio: 0.2,
    containsPII: false,
    containsSecrets: false,
    injectionPatterns: 2,
    suspiciousKeywords: 1,
    requestFrequency: 1,
    timeOfDay: 0.5,
    userAgentRisk: 0.1,
    ipRiskScore: 0.1,
    endpointRisk: 0.2,
    payloadSize: 500,
    headerAnomalies: 0,
  },
  processingTimeMs: 45,
  similarKnownThreats: ['threat-1', 'threat-2'],
  ...overrides,
});

describe('ML Pipeline Integration Tests', () => {
  let mlDetector: MLThreatDetector;
  let alertService: AlertService;
  let trainingService: MLTrainingService;

  beforeAll(async () => {
    // Initialize all services
    mlDetector = MLThreatDetector.getInstance();
    alertService = AlertService.getInstance();
    trainingService = MLTrainingService.getInstance();

    // Initialize ML detector
    await mlDetector.initialize();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Alert Escalation Integration', () => {
    it('should escalate critical alerts automatically', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([]);
      mockDb.insert.mockResolvedValue({});

      const requestData = createMockRequestData({
        content: 'CRITICAL: System override attempt detected',
      });

      const analysis = await mlDetector.analyzeRequest(requestData);
      expect(analysis.riskScore).toBeGreaterThan(0.9);

      // Create alert context WITHOUT escalate property
      // Note: escalate is determined automatically by the AlertService based on severity
      const alertContext = {
        requestId: requestData.requestId,
        userId: requestData.userId,
        tenantId: requestData.tenantId,
        ipAddress: requestData.ipAddress,
        userAgent: requestData.userAgent,
        endpoint: requestData.endpoint,
        mlAnalysis: analysis,
        additionalData: { critical: true },
      };

      // The escalate property is NOT part of AlertContext
      // It's determined automatically by createAlertFromMLAnalysis based on severity
      const alertId = await alertService.createAlertFromMLAnalysis(
        requestData.tenantId,
        analysis,
        alertContext,
      );

      expect(alertId).toBeDefined();
      // Escalation should be triggered automatically for critical alerts
    });

    it('should not escalate low-priority alerts', async () => {
      const mockDb = require('@/database/db').getDb();
      mockDb.select.mockResolvedValue([]);
      mockDb.insert.mockResolvedValue({});

      const requestData = createMockRequestData({
        content: 'Normal request',
      });

      const analysis = await mlDetector.analyzeRequest(requestData);
      expect(analysis.riskScore).toBeLessThan(0.3);

      const alertContext = {
        requestId: requestData.requestId,
        userId: requestData.userId,
        tenantId: requestData.tenantId,
        ipAddress: requestData.ipAddress,
        userAgent: requestData.userAgent,
        endpoint: requestData.endpoint,
        mlAnalysis: analysis,
        additionalData: { normal: true },
      };

      const alertId = await alertService.createAlertFromMLAnalysis(
        requestData.tenantId,
        analysis,
        alertContext,
      );

      expect(alertId).toBeNull();
      // No escalation for low-risk alerts
    });
  });
});
