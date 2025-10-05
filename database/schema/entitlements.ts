import { pgTable, text, boolean, timestamp as pgTimestamp, index } from 'drizzle-orm/pg-core';

export const entitlements = pgTable(
  'entitlements',
  {
    id: text('id').primaryKey(), // e.g., feature_api, feature_priority_support
    name: text('name').notNull(),
    description: text('description'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    entActiveIdx: index('entitlements_active_idx').on(t.isActive),
  }),
);

export type Entitlement = typeof entitlements.$inferSelect;
export type NewEntitlement = typeof entitlements.$inferInsert;
