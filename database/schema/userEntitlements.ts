import {
  pgTable,
  text,
  jsonb,
  timestamp as pgTimestamp,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { entitlements } from './entitlements';

// Benutzer-/Mandantennahe Entitlements (Overrides auf Plan-Level)
// value als string (kann Zahl/JSON serialisiert enthalten); metadata für Kontext
export const userEntitlements = pgTable(
  'user_entitlements',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    entitlementId: text('entitlement_id')
      .notNull()
      .references(() => entitlements.id, { onDelete: 'cascade' }),
    value: text('value'),
    metadata: jsonb('metadata'),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    pk: primaryKey({
      columns: [t.userId, t.entitlementId],
      name: 'user_entitlements_pk',
    }),
    userIdx: index('user_entitlements_user_id_idx').on(t.userId),
    entIdx: index('user_entitlements_entitlement_id_idx').on(t.entitlementId),
  }),
);

export type UserEntitlement = typeof userEntitlements.$inferSelect;
export type NewUserEntitlement = typeof userEntitlements.$inferInsert;
