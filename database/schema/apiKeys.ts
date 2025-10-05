import {
  pgTable,
  text,
  timestamp as pgTimestamp,
  index,
  varchar,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core';
import { users } from './users';

// API-Keys für Kunden (Mandanten)
export const apiKeys = pgTable(
  'api_keys',
  {
    id: text('id').primaryKey(), // UUID
    keyId: varchar('key_id', { length: 64 }).notNull().unique(), // Public-facing key ID (prefix)
    hashedKey: text('hashed_key').notNull(), // SHA-256 hash of the full API key
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 128 }), // Human-readable name
    scopes: jsonb('scopes'), // Array of allowed scopes: ["agents:invoke", "firewall:logs:read"]
    status: varchar('status', { length: 32 }).notNull().default('active'), // active, revoked, expired
    expiresAt: pgTimestamp('expires_at', { withTimezone: true, mode: 'date' }),
    lastUsedAt: pgTimestamp('last_used_at', { withTimezone: true, mode: 'date' }),
    rateLimitRpm: integer('rate_limit_rpm').default(60), // Requests per minute
    rateLimitTpm: integer('rate_limit_tpm').default(100000), // Tokens per minute
    quotaLimit: integer('quota_limit').default(1000000), // Monthly token quota
    quotaUsed: integer('quota_used').default(0), // Current usage
    quotaResetAt: pgTimestamp('quota_reset_at', { withTimezone: true, mode: 'date' }).defaultNow(),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    userIdx: index('api_keys_user_id_idx').on(t.userId),
    statusIdx: index('api_keys_status_idx').on(t.status),
    keyIdIdx: index('api_keys_key_id_idx').on(t.keyId),
  }),
);

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
