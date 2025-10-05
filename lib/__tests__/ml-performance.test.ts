import crypto from 'crypto';
// Zentrale Mock-DB API (via moduleNameMapper)
import { __mockDbApi as mockDb } from '@/test-utils/mocks/db';

import { MLThreatDetector } from '@/lib/ml-threat-detector';
import { AlertService } from '@/lib/alert-service';
import { MLTrainingService, TrainingConfig } from '@/lib/ml-training-service';

// Test utilities
const createMockRequestData = (overrides: Partial<any> = {}): any => ({
  requestId: crypto.randomUUID(),
  content: 'Performance test request content',
  userId: 'perf-user-123',
  tenantId: 'perf-tenant-456',
  endpoint: '/api/performance-test',
  userAgent: 'Performance-Test/1.0',
  ipAddress: '192.168.1.100',
  headers: { 'Content-Type': 'application/json' },
  timestamp: new Date(),
  ...overrides,
});

describe('ML System Performance Tests', () => {
  let mlDetector: MLThreatDetector;
  let alertService: AlertService;
  let trainingService: MLTrainingService;

  beforeAll(async () => {
    mlDetector = MLThreatDetector.getInstance();
    alertService = AlertService.getInstance();
    trainingService = MLTrainingService.getInstance();
    await mlDetector.initialize();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('ML Analysis Performance', () => {
    it('should complete single analysis within performance threshold', async () => {
      const requestData = createMockRequestData({
        content: 'Short performance test request',
      });

      const startTime = performance.now();
      const analysis = await mlDetector.analyzeRequest(requestData);
      const endTime = performance.now();

      const analysisTime = endTime - startTime;

      expect(analysis).toBeDefined();
      expect(analysis.processingTimeMs).toBeGreaterThan(0);
      expect(analysisTime).toBeLessThan(1000); // Should complete within 1 second
      expect(analysis.processingTimeMs).toBeLessThan(500); // Internal processing should be fast
    });

    it('should handle long content efficiently', async () => {
      const longContent = 'A'.repeat(10000); // 10KB of content
      const requestData = createMockRequestData({
        content: longContent,
      });

      const startTime = performance.now();
      const analysis = await mlDetector.analyzeRequest(requestData);
      const endTime = performance.now();

      const analysisTime = endTime - startTime;

      expect(analysis).toBeDefined();
      expect(analysis.features.contentLength).toBe(10000);
      expect(analysisTime).toBeLessThan(2000); // Should handle large content efficiently
    });

    it('should process multiple requests with consistent performance', async () => {
      const requests = Array(10)
        .fill(null)
        .map((_, i) =>
          createMockRequestData({
            content: `Performance consistency test request ${i}`,
            userId: `perf-user-${i}`,
          }),
        );

      const analysisTimes: number[] = [];

      for (const request of requests) {
        const startTime = performance.now();
        await mlDetector.analyzeRequest(request);
        const endTime = performance.now();

        analysisTimes.push(endTime - startTime);
      }

      // Check performance consistency
      const avgTime = analysisTimes.reduce((sum, time) => sum + time, 0) / analysisTimes.length;
      const maxTime = Math.max(...analysisTimes);
      const minTime = Math.min(...analysisTimes);
      const variance =
        analysisTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) /
        analysisTimes.length;

      expect(avgTime).toBeLessThan(500); // Average should be fast
      expect(maxTime).toBeLessThan(1000); // Max should not be too slow
      expect(variance).toBeLessThan(10000); // Variance should be reasonable
    });

    it('should maintain performance under memory pressure', async () => {
      // Create some memory pressure
      const memoryPressure: string[] = [];
      for (let i = 0; i < 1000; i++) {
        memoryPressure.push('x'.repeat(1000)); // 1MB of data
      }

      const requestData = createMockRequestData({
        content: 'Memory pressure performance test',
      });

      const startTime = performance.now();
      const analysis = await mlDetector.analyzeRequest(requestData);
      const endTime = performance.now();

      const analysisTime = endTime - startTime;

      // Clean up memory pressure
      memoryPressure.length = 0;

      expect(analysis).toBeDefined();
      expect(analysisTime).toBeLessThan(2000); // Should still be reasonably fast
    });
  });

  describe('Concurrent Request Performance', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const requests = Array(concurrentRequests)
        .fill(null)
        .map((_, i) =>
          createMockRequestData({
            content: `Concurrent performance test ${i}`,
            userId: `concurrent-user-${i}`,
          }),
        );

      const startTime = performance.now();
      const promises = requests.map((request) => mlDetector.analyzeRequest(request));
      const results = await Promise.all(promises);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const avgTimePerRequest = totalTime / concurrentRequests;

      expect(results).toHaveLength(concurrentRequests);
      expect(avgTimePerRequest).toBeLessThan(200); // Should be very fast per request
      expect(totalTime).toBeLessThan(2000); // Total should be reasonable

      // Verify all results are valid
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.riskScore).toBeGreaterThanOrEqual(0);
        expect(result.riskScore).toBeLessThanOrEqual(1);
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should handle burst of requests', async () => {
      const burstSize = 50;
      const requests = Array(burstSize)
        .fill(null)
        .map((_, i) =>
          createMockRequestData({
            content: `Burst test request ${i}`,
            userId: `burst-user-${i % 5}`, // 5 different users
          }),
        );

      const startTime = performance.now();
      const promises = requests.map((request) => mlDetector.analyzeRequest(request));
      const results = await Promise.all(promises);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const avgTimePerRequest = totalTime / burstSize;

      expect(results).toHaveLength(burstSize);
      expect(avgTimePerRequest).toBeLessThan(100); // Should handle burst efficiently
      expect(totalTime).toBeLessThan(5000); // Total burst should be reasonable
    });

    it('should maintain performance with mixed request types', async () => {
      const mixedRequests = [
        createMockRequestData({ content: 'Safe request' }),
        createMockRequestData({ content: 'Request with PII: user@example.com' }),
        createMockRequestData({ content: 'Request with secrets: API_KEY=123456' }),
        createMockRequestData({ content: 'Very long request content'.repeat(100) }),
        createMockRequestData({ content: 'Normal request' }),
        createMockRequestData({ content: 'Another safe request' }),
      ];

      const startTime = performance.now();
      const promises = mixedRequests.map((request) => mlDetector.analyzeRequest(request));
      const results = await Promise.all(promises);
      const endTime = performance.now();

      const totalTime = endTime - startTime;

      expect(results).toHaveLength(mixedRequests.length);
      expect(totalTime).toBeLessThan(3000); // Should handle mixed requests efficiently

      // Verify different threat levels are detected
      const riskScores = results.map((r) => r.riskScore);
      const hasLowRisk = riskScores.some((score) => score < 0.3);
      const hasHighRisk = riskScores.some((score) => score > 0.7);

      expect(hasLowRisk).toBe(true);
      expect(hasHighRisk).toBe(true);
    });
  });

  describe('Memory Usage Performance', () => {
    it('should not leak memory during extended operation', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const requestData = createMockRequestData({
          content: `Memory leak test request ${i}`,
          userId: `memory-user-${i % 10}`,
        });

        await mlDetector.analyzeRequest(requestData);

        // Periodic garbage collection hint
        if (i % 10 === 0) {
          global.gc?.();
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryPerRequest = memoryIncrease / iterations;

      expect(memoryPerRequest).toBeLessThan(1024 * 10); // Less than 10KB per request
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB total increase
    });

    it('should handle memory cleanup for large requests', async () => {
      const largeContent = 'A'.repeat(100000); // 100KB content
      const requestData = createMockRequestData({
        content: largeContent,
      });

      const startMemory = process.memoryUsage().heapUsed;
      const analysis = await mlDetector.analyzeRequest(requestData);
      const endMemory = process.memoryUsage().heapUsed;

      // Force garbage collection
      global.gc?.();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - startMemory;

      expect(analysis).toBeDefined();
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Should not use excessive memory
    });
  });

  describe('Alert Service Performance', () => {
    it('should create alerts within performance threshold', async () => {
      mockDb.__setSelectResult([]);
      mockDb.__setInsertResult({});

      const mockAnalysis = {
        requestId: crypto.randomUUID(),
        modelId: 'perf-model-123',
        riskScore: 0.8,
        confidence: 0.9,
        threatType: 'prompt_injection',
        predictedAction: 'block' as const,
        explanation: 'Performance test threat detected',
        features: {} as any,
        processingTimeMs: 45,
        similarKnownThreats: [],
      };

      const alertContext = {
        requestId: 'perf-request-123',
        userId: 'perf-user-456',
        tenantId: 'perf-tenant-789',
        ipAddress: '192.168.1.100',
        userAgent: 'Performance-Test/1.0',
        endpoint: '/api/perf-test',
        mlAnalysis: mockAnalysis,
        additionalData: { performanceTest: true },
      };

      const startTime = performance.now();
      const alertId = await alertService.createAlertFromMLAnalysis(
        'perf-tenant-789',
        mockAnalysis as any,
        alertContext as any,
      );
      const endTime = performance.now();

      const alertCreationTime = endTime - startTime;

      expect(alertId).toBeDefined();
      expect(alertCreationTime).toBeLessThan(500); // Should be fast
    });

    it('should handle bulk alert creation efficiently', async () => {
      mockDb.__setSelectResult([]);
      mockDb.__setInsertResult({});

      const alerts = Array(20)
        .fill(null)
        .map((_, i) => ({
          requestId: crypto.randomUUID(),
          modelId: `bulk-model-${i}`,
          riskScore: 0.7 + i * 0.01,
          confidence: 0.9,
          threatType: 'prompt_injection',
          predictedAction: 'block' as const,
          explanation: `Bulk test threat ${i}`,
          features: {} as any,
          processingTimeMs: 45,
          similarKnownThreats: [],
        }));

      const startTime = performance.now();
      const promises = alerts.map((analysis, i) =>
        alertService.createAlertFromMLAnalysis('bulk-tenant-123', analysis as any, {
          requestId: `bulk-req-${i}`,
          userId: `bulk-user-${i}`,
          tenantId: 'bulk-tenant-123',
          ipAddress: '192.168.1.100',
          userAgent: 'Bulk-Test/1.0',
          endpoint: '/api/bulk-test',
          mlAnalysis: analysis as any,
          additionalData: { bulkTest: true },
        }),
      );

      const results = await Promise.all(promises);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const avgTimePerAlert = totalTime / alerts.length;

      expect(results).toHaveLength(alerts.length);
      expect(avgTimePerAlert).toBeLessThan(100); // Should be very fast per alert
      expect(totalTime).toBeLessThan(2000); // Total should be reasonable
    });
  });

  describe('Training Service Performance', () => {
    it('should generate synthetic data efficiently', async () => {
      mockDb.__setInsertResult({});

      const startTime = performance.now();
      await trainingService.generateSyntheticTrainingData(1000);
      const endTime = performance.now();

      const generationTime = endTime - startTime;

      expect(generationTime).toBeLessThan(5000); // Should generate 1000 samples quickly
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should handle training job creation efficiently', async () => {
      mockDb.__setInsertResult({});

      const config = {
        modelType: 'threat_detection',
        trainingDataRatio: 0.8,
        epochs: 10,
        batchSize: 32,
        learningRate: 0.001,
        features: ['content_analysis', 'behavioral_patterns'],
      };

      const startTime = performance.now();
      const jobId = await trainingService.startTraining(config as TrainingConfig);
      const endTime = performance.now();

      const creationTime = endTime - startTime;

      expect(jobId).toBeDefined();
      expect(creationTime).toBeLessThan(100); // Should be very fast
    });
  });

  describe('System Resource Usage', () => {
    it('should not consume excessive CPU during analysis', async () => {
      const startCpuUsage = process.cpuUsage();

      const requests = Array(50)
        .fill(null)
        .map((_, i) =>
          createMockRequestData({
            content: `CPU usage test request ${i}`,
            userId: `cpu-user-${i}`,
          }),
        );

      for (const request of requests) {
        await mlDetector.analyzeRequest(request);
      }

      const endCpuUsage = process.cpuUsage(startCpuUsage);
      const totalCpuTime = endCpuUsage.user + endCpuUsage.system;

      // CPU time should be reasonable for 50 requests
      expect(totalCpuTime).toBeLessThan(100000000); // Less than 100ms total CPU time
    });

    it('should handle system with limited resources', async () => {
      // Simulate resource constraints
      const originalMemory = process.memoryUsage();
      const availableMemory = originalMemory.heapTotal - originalMemory.heapUsed;

      if (availableMemory < 50 * 1024 * 1024) {
        // Less than 50MB available
        console.log('Skipping resource constraint test due to limited memory');
        return;
      }

      const requestData = createMockRequestData({
        content: 'Resource constraint test',
      });

      const analysis = await mlDetector.analyzeRequest(requestData);

      expect(analysis).toBeDefined();
      expect(analysis.riskScore).toBeGreaterThanOrEqual(0);
      expect(analysis.processingTimeMs).toBeLessThan(2000); // Should still be reasonable
    });
  });

  describe('Scalability Tests', () => {
    it('should maintain performance with increased load', async () => {
      const loadLevels = [10, 25, 50, 100];

      for (const loadLevel of loadLevels) {
        const requests = Array(loadLevel)
          .fill(null)
          .map((_, i) =>
            createMockRequestData({
              content: `Scalability test request ${i}`,
              userId: `scale-user-${i % 10}`, // 10 different users
            }),
          );

        const startTime = performance.now();
        const promises = requests.map((request) => mlDetector.analyzeRequest(request));
        await Promise.all(promises);
        const endTime = performance.now();

        const totalTime = endTime - startTime;
        const avgTimePerRequest = totalTime / loadLevel;

        expect(avgTimePerRequest).toBeLessThan(200); // Should scale linearly
        expect(totalTime).toBeLessThan(loadLevel * 200); // Total should be reasonable
      }
    });

    it('should handle peak load scenarios', async () => {
      const peakLoad = 200;
      const requests = Array(peakLoad)
        .fill(null)
        .map((_, i) =>
          createMockRequestData({
            content: `Peak load test request ${i}`,
            userId: `peak-user-${i % 20}`, // 20 different users
          }),
        );

      const startTime = performance.now();
      const promises = requests.map((request) => mlDetector.analyzeRequest(request));
      const results = await Promise.all(promises);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const avgTimePerRequest = totalTime / peakLoad;

      expect(results).toHaveLength(peakLoad);
      expect(avgTimePerRequest).toBeLessThan(300); // Should handle peak load
      expect(totalTime).toBeLessThan(60000); // Should complete within 1 minute
    });
  });

  describe('Error Recovery Performance', () => {
    it('should recover quickly from errors', async () => {
      (require('@/test-utils/mocks/db').__mockDbApi.select as jest.Mock).mockImplementationOnce(
        () => ({
          from: jest.fn(() => ({
            where: jest.fn(() => ({
              orderBy: jest.fn(() => ({
                offset: jest.fn(() => ({
                  limit: jest.fn(async () => {
                    throw new Error('Temporary database error');
                  }),
                })),
              })),
            })),
          })),
        }),
      );
      mockDb.__setSelectResult([]);
      mockDb.__setInsertResult({});

      const requestData = createMockRequestData({
        content: 'Error recovery test',
      });

      const startTime = performance.now();
      const analysis = await mlDetector.analyzeRequest(requestData);
      const endTime = performance.now();

      const recoveryTime = endTime - startTime;

      expect(analysis).toBeDefined();
      expect(analysis.modelId).toBe('rule-based-fallback'); // Should fallback
      expect(recoveryTime).toBeLessThan(1000); // Should recover quickly
    });

    it('should handle cascading failures gracefully', async () => {
      (require('@/test-utils/mocks/db').__mockDbApi.select as jest.Mock).mockImplementation(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              offset: jest.fn(() => ({
                limit: jest.fn(async () => {
                  throw new Error('Database unavailable');
                }),
              })),
            })),
          })),
        })),
      }));
      (require('@/test-utils/mocks/db').__mockDbApi.insert as jest.Mock).mockImplementation(() => ({
        values: jest.fn(async () => {
          throw new Error('Database unavailable');
        }),
      }));

      const requests = Array(5)
        .fill(null)
        .map((_, i) =>
          createMockRequestData({
            content: `Cascading failure test ${i}`,
            userId: `cascade-user-${i}`,
          }),
        );

      const startTime = performance.now();
      const promises = requests.map((request) => mlDetector.analyzeRequest(request));
      const results = await Promise.all(promises);
      const endTime = performance.now();

      const totalTime = endTime - startTime;

      expect(results).toHaveLength(requests.length);
      expect(totalTime).toBeLessThan(5000); // Should handle failures efficiently

      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.modelId).toBe('rule-based-fallback'); // All should fallback
      });
    });
  });
});
