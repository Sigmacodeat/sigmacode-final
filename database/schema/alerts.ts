import {
  pgTable,
  text,
  timestamp as pgTimestamp,
  integer,
  jsonb,
  boolean,
  varchar,
  index,
  numeric,
} from 'drizzle-orm/pg-core';

// Alert Definitions - konfigurierbare Alert-Regeln
export const alertRules = pgTable(
  'alert_rules',
  {
    id: text('id').primaryKey(), // UUID
    name: varchar('name', { length: 128 }).notNull(),
    description: text('description'),
    tenantId: text('tenant_id').notNull(),
    isActive: boolean('is_active').notNull().default(true),

    // Trigger Conditions
    triggerType: varchar('trigger_type', { length: 32 }).notNull(), // 'ml_prediction' | 'threshold' | 'pattern' | 'manual'
    triggerConfig: jsonb('trigger_config').notNull(), // Flexible configuration for different trigger types

    // Alert Settings
    severity: varchar('severity', { length: 16 }).notNull(), // 'low' | 'medium' | 'high' | 'critical'
    channels: jsonb('channels').notNull(), // ['email', 'slack', 'webhook', 'dashboard']

    // Rate Limiting & Grouping
    cooldownMinutes: integer('cooldown_minutes').notNull().default(5),
    groupSimilar: boolean('group_similar').notNull().default(true),
    groupWindowMinutes: integer('group_window_minutes').notNull().default(15),

    // Metadata
    createdBy: varchar('created_by', { length: 64 }),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    tenantIdx: index('alert_rules_tenant_idx').on(t.tenantId),
    activeIdx: index('alert_rules_active_idx').on(t.isActive),
    severityIdx: index('alert_rules_severity_idx').on(t.severity),
    triggerTypeIdx: index('alert_rules_trigger_type_idx').on(t.triggerType),
  }),
);

// Generated Alerts - tatsächliche Alert-Instanzen
export const alerts = pgTable(
  'alerts',
  {
    id: text('id').primaryKey(), // UUID
    ruleId: text('rule_id').notNull(),
    tenantId: text('tenant_id').notNull(),

    // Alert Content
    title: varchar('title', { length: 256 }).notNull(),
    message: text('message').notNull(),
    severity: varchar('severity', { length: 16 }).notNull(),
    category: varchar('category', { length: 64 }).notNull(),

    // Context Information
    requestId: varchar('request_id', { length: 64 }),
    userId: varchar('user_id', { length: 64 }),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),

    // ML Context (if triggered by ML)
    mlModelId: text('ml_model_id'),
    mlRiskScore: numeric('ml_risk_score', { precision: 5, scale: 4 }),
    mlConfidence: numeric('ml_confidence', { precision: 5, scale: 4 }),
    mlThreatType: varchar('ml_threat_type', { length: 64 }),

    context: jsonb('context'), // Additional metadata
    evidence: jsonb('evidence'), // Supporting evidence for the alert

    // Status & Lifecycle
    status: varchar('status', { length: 16 }).notNull().default('new'), // 'new' | 'acknowledged' | 'resolved' | 'dismissed'
    dismissedAt: pgTimestamp('dismissed_at', { withTimezone: true, mode: 'date' }),
    dismissedBy: varchar('dismissed_by', { length: 64 }),
    dismissedReason: text('dismissed_reason'),
    acknowledgedAt: pgTimestamp('acknowledged_at', { withTimezone: true, mode: 'date' }),
    acknowledgedBy: varchar('acknowledged_by', { length: 64 }),
    resolvedAt: pgTimestamp('resolved_at', { withTimezone: true, mode: 'date' }),
    resolvedBy: varchar('resolved_by', { length: 64 }),
    resolvedReason: text('resolved_reason'),

    // Timestamps
    triggeredAt: pgTimestamp('triggered_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    tenantIdx: index('alerts_tenant_idx').on(t.tenantId),
    ruleIdx: index('alerts_rule_idx').on(t.ruleId),
    statusIdx: index('alerts_status_idx').on(t.status),
    severityIdx: index('alerts_severity_idx').on(t.severity),
    categoryIdx: index('alerts_category_idx').on(t.category),
    triggeredAtIdx: index('alerts_triggered_at_idx').on(t.triggeredAt),
    requestIdx: index('alerts_request_idx').on(t.requestId),
    userIdx: index('alerts_user_idx').on(t.userId),
  }),
);

// Alert Notifications - versendete Benachrichtigungen
export const alertNotifications = pgTable(
  'alert_notifications',
  {
    id: text('id').primaryKey(), // UUID
    alertId: text('alert_id').notNull(),
    channel: varchar('channel', { length: 32 }).notNull(), // 'email' | 'slack' | 'webhook' | 'sms'

    // Recipient Information
    recipient: varchar('recipient', { length: 256 }).notNull(), // Email address, Slack channel, webhook URL
    recipientName: varchar('recipient_name', { length: 128 }),

    // Notification Content
    subject: varchar('subject', { length: 256 }),
    body: text('body').notNull(),
    metadata: jsonb('metadata'), // Channel-specific data

    // Status & Delivery
    status: varchar('status', { length: 16 }).notNull().default('pending'), // 'pending' | 'sent' | 'delivered' | 'failed'
    sentAt: pgTimestamp('sent_at', { withTimezone: true, mode: 'date' }),
    deliveredAt: pgTimestamp('delivered_at', { withTimezone: true, mode: 'date' }),
    failedAt: pgTimestamp('failed_at', { withTimezone: true, mode: 'date' }),
    errorMessage: text('error_message'),

    // Retry Logic
    retryCount: integer('retry_count').notNull().default(0),
    maxRetries: integer('max_retries').notNull().default(3),
    nextRetryAt: pgTimestamp('next_retry_at', { withTimezone: true, mode: 'date' }),

    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    alertIdx: index('alert_notifications_alert_idx').on(t.alertId),
    channelIdx: index('alert_notifications_channel_idx').on(t.channel),
    statusIdx: index('alert_notifications_status_idx').on(t.status),
    recipientIdx: index('alert_notifications_recipient_idx').on(t.recipient),
    nextRetryIdx: index('alert_notifications_next_retry_idx').on(t.nextRetryAt),
  }),
);

// Alert Statistics - aggregierte Metriken für Analytics
export const alertStatistics = pgTable(
  'alert_statistics',
  {
    id: text('id').primaryKey(), // UUID
    tenantId: text('tenant_id').notNull(),
    date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD format

    // Alert Counts by Severity
    totalAlerts: integer('total_alerts').notNull().default(0),
    criticalAlerts: integer('critical_alerts').notNull().default(0),
    highAlerts: integer('high_alerts').notNull().default(0),
    mediumAlerts: integer('medium_alerts').notNull().default(0),
    lowAlerts: integer('low_alerts').notNull().default(0),

    // Alert Counts by Category
    mlAlerts: integer('ml_alerts').notNull().default(0),
    thresholdAlerts: integer('threshold_alerts').notNull().default(0),
    patternAlerts: integer('pattern_alerts').notNull().default(0),
    manualAlerts: integer('manual_alerts').notNull().default(0),

    // Resolution Metrics
    resolvedAlerts: integer('resolved_alerts').notNull().default(0),
    avgResolutionTimeMinutes: numeric('avg_resolution_time_minutes', { precision: 10, scale: 2 }),
    acknowledgedAlerts: integer('acknowledged_alerts').notNull().default(0),
    avgAcknowledgmentTimeMinutes: numeric('avg_acknowledgment_time_minutes', {
      precision: 10,
      scale: 2,
    }),

    // Notification Metrics
    totalNotifications: integer('total_notifications').notNull().default(0),
    successfulNotifications: integer('successful_notifications').notNull().default(0),
    failedNotifications: integer('failed_notifications').notNull().default(0),

    // Performance Metrics
    avgAlertProcessingTimeMs: numeric('avg_alert_processing_time_ms', { precision: 10, scale: 2 }),

    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    tenantIdx: index('alert_statistics_tenant_idx').on(t.tenantId),
    dateIdx: index('alert_statistics_date_idx').on(t.date),
  }),
);

// Alert Templates - wiederverwendbare Nachrichtenvorlagen
export const alertTemplates = pgTable(
  'alert_templates',
  {
    id: text('id').primaryKey(), // UUID
    name: varchar('name', { length: 128 }).notNull(),
    description: text('description'),
    tenantId: text('tenant_id').notNull(),

    // Template Content
    subjectTemplate: varchar('subject_template', { length: 256 }).notNull(),
    bodyTemplate: text('body_template').notNull(),
    htmlTemplate: text('html_template'),

    // Template Variables
    availableVariables: jsonb('available_variables').notNull(), // List of variables that can be used
    defaultVariables: jsonb('default_variables'), // Default values for variables

    // Channel-specific Templates
    emailTemplate: jsonb('email_template'),
    slackTemplate: jsonb('slack_template'),
    webhookTemplate: jsonb('webhook_template'),

    // Metadata
    isDefault: boolean('is_default').notNull().default(false),
    createdBy: varchar('created_by', { length: 64 }),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    tenantIdx: index('alert_templates_tenant_idx').on(t.tenantId),
    defaultIdx: index('alert_templates_default_idx').on(t.isDefault),
  }),
);

// Alert Escalation Policies - automatische Eskalation von Alerts
export const alertEscalationPolicies = pgTable(
  'alert_escalation_policies',
  {
    id: text('id').primaryKey(), // UUID
    name: varchar('name', { length: 128 }).notNull(),
    description: text('description'),
    tenantId: text('tenant_id').notNull(),
    isActive: boolean('is_active').notNull().default(true),

    // Escalation Rules
    escalationRules: jsonb('escalation_rules').notNull(), // Array of escalation steps

    // Conditions for when to apply this policy
    conditions: jsonb('conditions'), // e.g., severity, category, time of day

    // Metadata
    createdBy: varchar('created_by', { length: 64 }),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    tenantIdx: index('alert_escalation_policies_tenant_idx').on(t.tenantId),
    activeIdx: index('alert_escalation_policies_active_idx').on(t.isActive),
  }),
);

// Alert Audit Log - vollständige Historie aller Alert-Aktionen
export const alertAuditLog = pgTable(
  'alert_audit_log',
  {
    id: text('id').primaryKey(), // UUID
    alertId: text('alert_id').notNull(),
    tenantId: text('tenant_id').notNull(),

    // Action Details
    action: varchar('action', { length: 32 }).notNull(), // 'created' | 'acknowledged' | 'resolved' | 'escalated' | 'dismissed'
    actor: varchar('actor', { length: 64 }), // User ID or system identifier
    actorType: varchar('actor_type', { length: 16 }).notNull(), // 'user' | 'system' | 'api'

    // Changes (before/after)
    changes: jsonb('changes'), // What changed and from/to values
    reason: text('reason'), // Why the action was taken

    // Context
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    metadata: jsonb('metadata'), // Additional context

    // Timestamps
    timestamp: pgTimestamp('timestamp', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    alertIdx: index('alert_audit_log_alert_idx').on(t.alertId),
    tenantIdx: index('alert_audit_log_tenant_idx').on(t.tenantId),
    actionIdx: index('alert_audit_log_action_idx').on(t.action),
    actorIdx: index('alert_audit_log_actor_idx').on(t.actor),
    timestampIdx: index('alert_audit_log_timestamp_idx').on(t.timestamp),
  }),
);

export type AlertRule = typeof alertRules.$inferSelect;
export type NewAlertRule = typeof alertRules.$inferInsert;
export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
export type AlertNotification = typeof alertNotifications.$inferSelect;
export type NewAlertNotification = typeof alertNotifications.$inferInsert;
export type AlertStatistics = typeof alertStatistics.$inferSelect;
export type NewAlertStatistics = typeof alertStatistics.$inferInsert;
export type AlertTemplate = typeof alertTemplates.$inferSelect;
export type NewAlertTemplate = typeof alertTemplates.$inferInsert;
export type AlertEscalationPolicy = typeof alertEscalationPolicies.$inferSelect;
export type NewAlertEscalationPolicy = typeof alertEscalationPolicies.$inferInsert;
export type AlertAuditLog = typeof alertAuditLog.$inferSelect;
export type NewAlertAuditLog = typeof alertAuditLog.$inferInsert;
