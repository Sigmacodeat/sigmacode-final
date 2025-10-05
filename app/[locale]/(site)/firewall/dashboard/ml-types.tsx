interface MLInsights {
  activeModels: number;
  overallAccuracy: number;
  activeTrainingJobs: number;
  predictionsToday: number;
  criticalThreats: number;
  highRiskPatterns: number;
  safeRequests: number;
  learningProgress: number;
  models: Array<{
    id: string;
    name: string;
    version: string;
    type: string;
    status: string;
    accuracy: number;
  }>;
  topThreatCategories: Array<{
    category: string;
    count: number;
    confidence: number;
    description: string;
  }>;
  trainingJobs: Array<{
    id: string;
    modelName: string;
    status: string;
    progress: number;
    totalSamples: number;
    processedSamples: number;
  }>;
}
