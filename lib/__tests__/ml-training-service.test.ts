import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
// Zentrale Mock-DB API
import { __mockDbApi as mockDb } from '@/test-utils/mocks/db';

import { MLTrainingService, TrainingConfig } from '@/lib/ml-training-service';

describe('MLTrainingService', () => {
  let trainingService: MLTrainingService;

  beforeEach(() => {
    trainingService = MLTrainingService.getInstance();
    jest.clearAllMocks();
    // Reset Mock-DB Ergebnisse
    mockDb.__setSelectResult([]);
    mockDb.__setUpdateResult({});
    mockDb.__setUpdateResultArray([]);
    mockDb.__setInsertResult({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should create singleton instance', () => {
      const instance1 = MLTrainingService.getInstance();
      const instance2 = MLTrainingService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBeDefined();
    });

    it('should initialize with empty active jobs', () => {
      expect(trainingService['activeJobs']).toBeDefined();
      expect(trainingService['activeJobs'].size).toBe(0);
    });
  });

  describe('Training Job Management', () => {
    it('should start a new training job', async () => {
      const config: TrainingConfig = {
        modelType: 'threat_detection',
        trainingDataRatio: 0.8,
        epochs: 10,
        batchSize: 32,
        learningRate: 0.001,
        features: ['content_analysis', 'behavioral_patterns'],
      };

      const jobId = await trainingService.startTraining(config);

      expect(jobId).toBeDefined();
      expect(typeof jobId).toBe('string');
      expect(trainingService['activeJobs'].has(jobId)).toBe(true);

      const job = trainingService['activeJobs'].get(jobId);
      expect(job).toBeDefined();
      expect(job?.status).toBe('pending');
      expect(job?.config).toEqual(config);
    });

    it('should validate training configuration', async () => {
      const invalidConfig: TrainingConfig = {
        modelType: 'threat_detection',
        trainingDataRatio: 0.8,
        epochs: 10,
        batchSize: 32,
        learningRate: 0.001,
        features: [],
      };

      // The service should handle invalid configs gracefully
      const jobId = await trainingService.startTraining(invalidConfig);
      expect(jobId).toBeDefined();
    });

    it('should get training job status', async () => {
      const config: TrainingConfig = {
        modelType: 'threat_detection',
        trainingDataRatio: 0.8,
        epochs: 5,
        batchSize: 16,
        learningRate: 0.001,
        features: ['content_analysis'],
      };

      const jobId = await trainingService.startTraining(config);
      const job = await trainingService.getTrainingJob(jobId);

      expect(job).toBeDefined();
      expect(job?.id).toBe(jobId);
      expect(job?.status).toBe('pending');
      expect(job?.progress).toBe(0);
    });

    it('should handle non-existent job', async () => {
      const job = await trainingService.getTrainingJob('non-existent-job');
      expect(job).toBeNull();
    });

    it('should get all training jobs', async () => {
      const config: TrainingConfig = {
        modelType: 'threat_detection',
        trainingDataRatio: 0.8,
        epochs: 5,
        batchSize: 16,
        learningRate: 0.001,
        features: ['content_analysis'],
      };

      await trainingService.startTraining(config);
      const jobs = await trainingService.getAllTrainingJobs();

      expect(jobs).toBeDefined();
      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBeGreaterThan(0);
    });

    it('should cancel training job', async () => {
      const config: TrainingConfig = {
        modelType: 'threat_detection',
        trainingDataRatio: 0.8,
        epochs: 5,
        batchSize: 16,
        learningRate: 0.001,
        features: ['content_analysis'],
      };

      const jobId = await trainingService.startTraining(config);
      const cancelled = await trainingService.cancelTrainingJob(jobId);

      expect(cancelled).toBe(true);

      const job = trainingService['activeJobs'].get(jobId);
      expect(job?.status).toBe('failed');
      expect(job?.errorMessage).toBe('Cancelled by user');
    });

    it('should handle cancelling non-existent job', async () => {
      const cancelled = await trainingService.cancelTrainingJob('non-existent-job');
      expect(cancelled).toBe(false);
    });
  });

  describe('Training Data Preparation', () => {
    it('should prepare training data', async () => {
      mockDb.__setSelectResult([
        {
          id: 1,
          modelId: 'test-model',
          requestId: 'req-1',
          isThreat: true,
          threatCategory: 'prompt_injection',
          features: { contentLength: 100, tokenCount: 25 },
          rawRequest: 'Test request',
          metadata: { source: 'test' },
        },
      ]);

      const trainingData = await trainingService.prepareTrainingData(
        'threat_detection',
        undefined,
        100,
      );

      expect(trainingData).toBeDefined();
      expect(Array.isArray(trainingData)).toBe(true);
      expect(trainingData.length).toBeGreaterThan(0);
      expect(trainingData[0]).toHaveProperty('requestId');
      expect(trainingData[0]).toHaveProperty('isThreat');
      expect(trainingData[0]).toHaveProperty('features');
    });

    it('should handle empty training data', async () => {
      mockDb.__setSelectResult([]);

      const trainingData = await trainingService.prepareTrainingData(
        'threat_detection',
        undefined,
        100,
      );

      expect(trainingData).toBeDefined();
      expect(Array.isArray(trainingData)).toBe(true);
      expect(trainingData.length).toBe(0);
    });
  });

  describe('Model Deployment', () => {
    it('should deploy trained model', async () => {
      mockDb.__setSelectResult([
        {
          id: 'model-1',
          name: 'Test Model',
          version: '1.0.0',
          type: 'threat_detection',
          status: 'training',
        },
      ]);
      mockDb.__setUpdateResult({});

      const deployed = await trainingService.deployModel('model-1');

      expect(deployed).toBe(true);
    });

    it('should handle deploying non-existent model', async () => {
      mockDb.__setSelectResult([]);
      mockDb.__setUpdateResult({});

      const deployed = await trainingService.deployModel('non-existent-model');

      expect(deployed).toBe(false);
    });
  });

  describe('Synthetic Data Generation', () => {
    it('should generate synthetic training data', async () => {
      mockDb.__setInsertResult({});

      await trainingService.generateSyntheticTrainingData(100);

      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should handle synthetic data generation errors', async () => {
      (require('@/test-utils/mocks/db').__mockDbApi.insert as jest.Mock).mockImplementation(() => ({
        values: jest.fn(async () => {
          throw new Error('Database error');
        }),
      }));

      await expect(trainingService.generateSyntheticTrainingData(100)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (require('@/test-utils/mocks/db').__mockDbApi.select as jest.Mock).mockImplementation(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(async () => {
              throw new Error('Database connection failed');
            }),
          })),
        })),
      }));

      await expect(trainingService.prepareTrainingData('threat_detection')).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle model deployment errors', async () => {
      (require('@/test-utils/mocks/db').__mockDbApi.select as jest.Mock).mockImplementation(() => ({
        from: jest.fn(() => ({
          where: jest.fn(async () => {
            throw new Error('Model not found');
          }),
        })),
      }));

      await expect(trainingService.deployModel('non-existent-model')).rejects.toThrow(
        'Model not found',
      );
    });
  });
});
