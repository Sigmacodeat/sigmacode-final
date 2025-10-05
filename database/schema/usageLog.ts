import { pgTable, text, timestamp, integer, index, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Usage Log für Token-basiertes Billing
 * Trackt alle Token-Verbrauchsaktionen der Benutzer
 */
export const usageLog = pgTable(
  'usage_log',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    action: text('action').notNull(), // chat_message, workflow_run, agent_execution, etc.
    tokensCost: integer('tokens_cost').notNull(), // Anzahl verbrauchter Tokens
    metadata: jsonb('metadata'), // Zusätzliche Informationen (z.B. agentId, workflowId)
    timestamp: timestamp('timestamp', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (t: any) => ({
    userIdIdx: index('usage_log_user_id_idx').on(t.userId),
    timestampIdx: index('usage_log_timestamp_idx').on(t.timestamp),
    actionIdx: index('usage_log_action_idx').on(t.action),
  }),
);

export type UsageLog = typeof usageLog.$inferSelect;
export type NewUsageLog = typeof usageLog.$inferInsert;
