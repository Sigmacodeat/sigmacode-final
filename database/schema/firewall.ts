import { pgTable, serial, varchar, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const firewallLogs = pgTable('firewall_logs', {
  id: serial('id').primaryKey(),
  ts: timestamp('ts', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  requestId: varchar('request_id', { length: 64 }).notNull(),
  backend: varchar('backend', { length: 64 }).notNull(), // e.g., dify | superagent
  policy: varchar('policy', { length: 128 }).notNull(),
  action: varchar('action', { length: 32 }).notNull(), // allow | block | shadow-allow | shadow-block
  latencyMs: integer('latency_ms').notNull(),
  status: integer('status').notNull(),
  userId: varchar('user_id', { length: 64 }),
  meta: jsonb('meta'),
});
