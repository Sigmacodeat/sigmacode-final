import { useState } from 'react';

const [mlInsights, setMlInsights] = useState<MLInsights>({
  activeModels: 0,
  overallAccuracy: 0,
  activeTrainingJobs: 0,
  predictionsToday: 0,
  criticalThreats: 0,
  highRiskPatterns: 0,
  safeRequests: 0,
  learningProgress: 0,
  models: [],
  topThreatCategories: [],
  trainingJobs: [],
});
const [mlInsightsError, setMlInsightsError] = useState<Error | null>(null);
const [showTrainModel, setShowTrainModel] = useState(false);
