import { pgTable, text, timestamp as pgTimestamp, index, integer } from 'drizzle-orm/pg-core';
import { apiKeys } from './apiKeys';

// API Key Usage Tracking für Rate Limiting und Quotas
export const apiKeyUsage = pgTable(
  'api_key_usage',
  {
    id: text('id').primaryKey(), // UUID
    apiKeyId: text('api_key_id')
      .notNull()
      .references(() => apiKeys.id, { onDelete: 'cascade' }),
    requestCount: integer('request_count').notNull().default(0), // Requests in current window
    tokenCount: integer('token_count').notNull().default(0), // Tokens in current window
    windowStart: pgTimestamp('window_start', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    apiKeyIdx: index('api_key_usage_api_key_id_idx').on(t.apiKeyId),
    windowIdx: index('api_key_usage_window_idx').on(t.windowStart),
  }),
);

export type ApiKeyUsage = typeof apiKeyUsage.$inferSelect;
export type NewApiKeyUsage = typeof apiKeyUsage.$inferInsert;
