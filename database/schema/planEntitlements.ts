import { pgTable, text, primaryKey, timestamp as pgTimestamp, index } from 'drizzle-orm/pg-core';
import { plans } from './plans';
import { entitlements } from './entitlements';

export const planEntitlements = pgTable(
  'plan_entitlements',
  {
    planId: text('plan_id')
      .notNull()
      .references(() => plans.id, { onDelete: 'cascade' }),
    entitlementId: text('entitlement_id')
      .notNull()
      .references(() => entitlements.id, { onDelete: 'cascade' }),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    pk: primaryKey({
      columns: [t.planId, t.entitlementId],
      name: 'plan_entitlements_pk',
    }),
    planIdx: index('plan_entitlements_plan_id_idx').on(t.planId),
    entIdx: index('plan_entitlements_entitlement_id_idx').on(t.entitlementId),
  }),
);

export type PlanEntitlement = typeof planEntitlements.$inferSelect;
export type NewPlanEntitlement = typeof planEntitlements.$inferInsert;
