import {
  pgTable,
  serial,
  integer,
  doublePrecision,
  text,
  varchar,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';

// Overview totals (single row per day/timeframe or rolling snapshot)
export const analyticsOverview = pgTable('analytics_overview', {
  id: serial('id').primaryKey(),
  ts: timestamp('ts', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  totalRequests: integer('total_requests').notNull(),
  activeUsers: integer('active_users').notNull(),
  avgResponseTime: integer('avg_response_time_ms').notNull(),
  errorRate: doublePrecision('error_rate').notNull(),
  uptime: doublePrecision('uptime').notNull(),
  throughput: doublePrecision('throughput').notNull(),
});

// Generic time-series table for performance metrics
export const analyticsPerformanceTS = pgTable('analytics_performance_timeseries', {
  id: serial('id').primaryKey(),
  ts: timestamp('ts', { withTimezone: true, mode: 'date' }).notNull(),
  metric: varchar('metric', { length: 32 }).notNull(), // responseTime | throughput | errorRate | latency
  value: doublePrecision('value').notNull(),
});

export const analyticsUsageByEndpoint = pgTable('analytics_usage_by_endpoint', {
  id: serial('id').primaryKey(),
  ts: timestamp('ts', { withTimezone: true, mode: 'date' }).notNull(),
  endpoint: varchar('endpoint', { length: 256 }).notNull(),
  requests: integer('requests').notNull(),
  avgTime: integer('avg_time_ms').notNull(),
});

export const analyticsUsageByUserAgent = pgTable('analytics_usage_by_user_agent', {
  id: serial('id').primaryKey(),
  ts: timestamp('ts', { withTimezone: true, mode: 'date' }).notNull(),
  agent: varchar('agent', { length: 128 }).notNull(),
  count: integer('count').notNull(),
  percentage: doublePrecision('percentage').notNull(),
});

export const analyticsUsageByCountry = pgTable('analytics_usage_by_country', {
  id: serial('id').primaryKey(),
  ts: timestamp('ts', { withTimezone: true, mode: 'date' }).notNull(),
  country: varchar('country', { length: 64 }).notNull(),
  requests: integer('requests').notNull(),
  flag: varchar('flag', { length: 8 }).notNull(),
});

export const analyticsUsageByHour = pgTable('analytics_usage_by_hour', {
  id: serial('id').primaryKey(),
  ts: timestamp('ts', { withTimezone: true, mode: 'date' }).notNull(),
  hour: integer('hour').notNull(),
  requests: integer('requests').notNull(),
});

export const analyticsErrorsRecent = pgTable('analytics_errors_recent', {
  id: serial('id').primaryKey(),
  ts: timestamp('ts', { withTimezone: true, mode: 'date' }).notNull(),
  message: text('message').notNull(),
  endpoint: varchar('endpoint', { length: 256 }).notNull(),
  userAgent: varchar('user_agent', { length: 128 }).notNull(),
});

export const analyticsErrorsByType = pgTable('analytics_errors_by_type', {
  id: serial('id').primaryKey(),
  ts: timestamp('ts', { withTimezone: true, mode: 'date' }).notNull(),
  type: varchar('type', { length: 64 }).notNull(),
  count: integer('count').notNull(),
  percentage: doublePrecision('percentage').notNull(),
});

export const analyticsErrorsTrends = pgTable('analytics_errors_trends', {
  id: serial('id').primaryKey(),
  date: varchar('date', { length: 10 }).notNull(), // yyyy-mm-dd
  count: integer('count').notNull(),
});

export const analyticsSystemHealth = pgTable('analytics_system_health', {
  id: serial('id').primaryKey(),
  ts: timestamp('ts', { withTimezone: true, mode: 'date' }).notNull(),
  cpuUsage: doublePrecision('cpu_usage').notNull(),
  memoryUsage: doublePrecision('memory_usage').notNull(),
  diskUsage: doublePrecision('disk_usage').notNull(),
  networkIO: doublePrecision('network_io').notNull(),
  activeConnections: integer('active_connections').notNull(),
  cacheHitRate: doublePrecision('cache_hit_rate').notNull(),
  extra: jsonb('extra'),
});
