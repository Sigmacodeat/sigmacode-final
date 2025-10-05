export function createMlLoadFunctions(
  setMlInsights: (data: any) => void,
  setMlInsightsError: (err: Error | null) => void,
) {
  const loadMLInsights = async () => {
    try {
      setMlInsightsError(null);
      const response = await fetch('/api/ml/models');
      if (response.ok) {
        const data = (await response.json().catch(() => ({}))) as { models: any[] };
        // Mock ML insights data for now
        setMlInsights({
          activeModels: data.models.filter((m: any) => m.status === 'active').length,
          overallAccuracy: 0.92,
          activeTrainingJobs: 1,
          predictionsToday: 15420,
          criticalThreats: 23,
          highRiskPatterns: 156,
          safeRequests: 15200,
          learningProgress: 78,
          models: data.models,
          topThreatCategories: [
            {
              category: 'Prompt Injection',
              count: 45,
              confidence: 0.94,
              description: 'Attempts to override AI instructions',
            },
            {
              category: 'PII Exposure',
              count: 32,
              confidence: 0.89,
              description: 'Personal information in requests',
            },
            {
              category: 'Secret Leakage',
              count: 18,
              confidence: 0.96,
              description: 'API keys and passwords detected',
            },
            {
              category: 'Anomaly Behavior',
              count: 67,
              confidence: 0.82,
              description: 'Unusual request patterns',
            },
          ],
          trainingJobs: [
            {
              id: 'job_1',
              modelName: 'Threat Detection v2.0',
              status: 'running',
              progress: 65,
              totalSamples: 50000,
              processedSamples: 32500,
            },
          ],
        });
      }
    } catch (err) {
      setMlInsightsError(err as Error);
      console.error('Failed to load ML insights:', err);
    }
  };

  return { loadMLInsights };
}
