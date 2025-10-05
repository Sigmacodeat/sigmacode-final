import {
  pgTable,
  text,
  integer,
  timestamp as pgTimestamp,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users';

// NextAuth Accounts-Tabelle für OAuth-Provider etc.
export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Multi-tenant: Account gehört zu einem Tenant
    tenantId: text('tenant_id').notNull().default('global'),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    // Composite Primary Key laut NextAuth-Konvention
    pk: primaryKey({
      columns: [t.provider, t.providerAccountId],
      name: 'accounts_provider_provider_account_id_pk',
    }),
    userIdx: index('accounts_user_id_idx').on(t.userId),
    tenantIdx: index('accounts_tenant_idx').on(t.tenantId),
    providerIdx: index('accounts_provider_idx').on(t.provider),
  }),
);

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
