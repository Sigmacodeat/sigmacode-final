import {
  pgTable,
  text,
  timestamp as pgTimestamp,
  integer,
  numeric,
  jsonb,
  boolean,
  index,
  varchar,
  serial,
} from 'drizzle-orm/pg-core';

// ML Models für Threat Detection
export const mlModels = pgTable(
  'ml_models',
  {
    id: text('id').primaryKey(), // UUID
    name: varchar('name', { length: 128 }).notNull(),
    version: varchar('version', { length: 32 }).notNull(),
    type: varchar('type', { length: 32 }).notNull(), // 'threat_detection' | 'anomaly_detection' | 'behavioral_analysis'
    status: varchar('status', { length: 16 }).notNull().default('training'), // training | active | inactive | failed
    accuracy: numeric('accuracy', { precision: 5, scale: 4 }), // 0.0000 to 1.0000
    precision: numeric('precision', { precision: 5, scale: 4 }),
    recall: numeric('recall', { precision: 5, scale: 4 }),
    f1Score: numeric('f1_score', { precision: 5, scale: 4 }),
    trainingDataSize: integer('training_data_size').notNull().default(0),
    lastTrained: pgTimestamp('last_trained', { withTimezone: true, mode: 'date' }),
    modelMetadata: jsonb('model_metadata'), // Hyperparameters, feature importance, etc.
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    typeIdx: index('ml_models_type_idx').on(t.type),
    statusIdx: index('ml_models_status_idx').on(t.status),
    accuracyIdx: index('ml_models_accuracy_idx').on(t.accuracy),
  }),
);

// ML Predictions für Requests
export const mlPredictions = pgTable(
  'ml_predictions',
  {
    id: text('id').primaryKey(), // UUID
    requestId: varchar('request_id', { length: 64 }).notNull(),
    modelId: text('model_id').notNull(),
    riskScore: numeric('risk_score', { precision: 5, scale: 4 }).notNull(), // 0.0000 to 1.0000
    confidence: numeric('confidence', { precision: 5, scale: 4 }).notNull(), // 0.0000 to 1.0000
    threatType: varchar('threat_type', { length: 64 }), // prompt_injection, context_leakage, pii_exposure, etc.
    predictedAction: varchar('predicted_action', { length: 16 }).notNull(), // allow | block | challenge
    actualAction: varchar('actual_action', { length: 16 }), // allow | block | challenge (filled after decision)
    features: jsonb('features').notNull(), // Extracted features used for prediction
    explanation: text('explanation'), // Why this prediction was made
    processingTimeMs: integer('processing_time_ms').notNull(),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    requestIdx: index('ml_predictions_request_idx').on(t.requestId),
    modelIdx: index('ml_predictions_model_idx').on(t.modelId),
    riskScoreIdx: index('ml_predictions_risk_score_idx').on(t.riskScore),
    threatTypeIdx: index('ml_predictions_threat_type_idx').on(t.threatType),
    createdAtIdx: index('ml_predictions_created_at_idx').on(t.createdAt),
  }),
);

// Training Data für ML Models
export const mlTrainingData = pgTable(
  'ml_training_data',
  {
    id: serial('id').primaryKey(),
    modelId: text('model_id').notNull(),
    requestId: varchar('request_id', { length: 64 }).notNull(),
    isThreat: boolean('is_threat').notNull(), // True if this was a threat
    threatCategory: varchar('threat_category', { length: 64 }),
    features: jsonb('features').notNull(), // Extracted features
    rawRequest: text('raw_request'), // Original request data
    metadata: jsonb('metadata'), // Additional context
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    modelIdx: index('ml_training_data_model_idx').on(t.modelId),
    threatIdx: index('ml_training_data_threat_idx').on(t.isThreat),
    categoryIdx: index('ml_training_data_category_idx').on(t.threatCategory),
    createdAtIdx: index('ml_training_data_created_at_idx').on(t.createdAt),
  }),
);

// ML Model Performance Metrics
export const mlModelMetrics = pgTable(
  'ml_model_metrics',
  {
    id: serial('id').primaryKey(),
    modelId: text('model_id').notNull(),
    timestamp: pgTimestamp('timestamp', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    totalPredictions: integer('total_predictions').notNull(),
    truePositives: integer('true_positives').notNull(),
    falsePositives: integer('false_positives').notNull(),
    trueNegatives: integer('true_negatives').notNull(),
    falseNegatives: integer('false_negatives').notNull(),
    precision: numeric('precision', { precision: 5, scale: 4 }),
    recall: numeric('recall', { precision: 5, scale: 4 }),
    f1Score: numeric('f1_score', { precision: 5, scale: 4 }),
    accuracy: numeric('accuracy', { precision: 5, scale: 4 }),
    avgProcessingTimeMs: numeric('avg_processing_time_ms', { precision: 10, scale: 2 }),
  },
  (t: any) => ({
    modelIdx: index('ml_model_metrics_model_idx').on(t.modelId),
    timestampIdx: index('ml_model_metrics_timestamp_idx').on(t.timestamp),
  }),
);

// Behavioral Patterns für Anomaly Detection
export const behavioralPatterns = pgTable(
  'behavioral_patterns',
  {
    id: text('id').primaryKey(), // UUID
    userId: varchar('user_id', { length: 64 }),
    tenantId: text('tenant_id').notNull(),
    patternType: varchar('pattern_type', { length: 32 }).notNull(), // 'request_frequency' | 'content_complexity' | 'token_usage' | 'error_rate'
    baselineValue: numeric('baseline_value', { precision: 20, scale: 6 }).notNull(),
    currentValue: numeric('current_value', { precision: 20, scale: 6 }).notNull(),
    deviationScore: numeric('deviation_score', { precision: 5, scale: 4 }).notNull(), // How much it deviates from baseline
    confidence: numeric('confidence', { precision: 5, scale: 4 }).notNull(),
    isAnomaly: boolean('is_anomaly').notNull().default(false),
    metadata: jsonb('metadata'),
    lastUpdated: pgTimestamp('last_updated', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    userIdx: index('behavioral_patterns_user_idx').on(t.userId),
    tenantIdx: index('behavioral_patterns_tenant_idx').on(t.tenantId),
    patternTypeIdx: index('behavioral_patterns_pattern_type_idx').on(t.patternType),
    anomalyIdx: index('behavioral_patterns_anomaly_idx').on(t.isAnomaly),
    lastUpdatedIdx: index('behavioral_patterns_last_updated_idx').on(t.lastUpdated),
  }),
);

// ML Configuration Settings
export const mlConfig = pgTable(
  'ml_config',
  {
    id: serial('id').primaryKey(),
    key: varchar('key', { length: 128 }).notNull().unique(),
    value: jsonb('value').notNull(),
    description: text('description'),
    isActive: boolean('is_active').notNull().default(true),
    updatedBy: varchar('updated_by', { length: 64 }),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    keyIdx: index('ml_config_key_idx').on(t.key),
    activeIdx: index('ml_config_active_idx').on(t.isActive),
  }),
);

export type MLModel = typeof mlModels.$inferSelect;
export type NewMLModel = typeof mlModels.$inferInsert;
export type MLPrediction = typeof mlPredictions.$inferSelect;
export type NewMLPrediction = typeof mlPredictions.$inferInsert;
export type MLTrainingData = typeof mlTrainingData.$inferSelect;
export type NewMLTrainingData = typeof mlTrainingData.$inferInsert;
export type MLModelMetrics = typeof mlModelMetrics.$inferSelect;
export type NewMLModelMetrics = typeof mlModelMetrics.$inferInsert;
export type BehavioralPattern = typeof behavioralPatterns.$inferSelect;
export type NewBehavioralPattern = typeof behavioralPatterns.$inferInsert;
export type MLConfig = typeof mlConfig.$inferSelect;
export type NewMLConfig = typeof mlConfig.$inferInsert;
