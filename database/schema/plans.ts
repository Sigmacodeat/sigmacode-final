import {
  pgTable,
  text,
  numeric,
  boolean,
  timestamp as pgTimestamp,
  index,
} from 'drizzle-orm/pg-core';

export const plans = pgTable(
  'plans',
  {
    id: text('id').primaryKey(), // e.g., plan_basic, plan_pro, plan_enterprise
    name: text('name').notNull(),
    description: text('description'),
    priceMonthly: numeric('price_monthly', {
      precision: 10,
      scale: 2,
    }).notNull(),
    priceYearly: numeric('price_yearly', { precision: 10, scale: 2 }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    planActiveIdx: index('plans_active_idx').on(t.isActive),
  }),
);

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
