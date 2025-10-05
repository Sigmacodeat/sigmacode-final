import { pgTable, text, timestamp as pgTimestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { plans } from './plans';

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: text('id').primaryKey(), // e.g., sub_xxx or UUID
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    planId: text('plan_id')
      .notNull()
      .references(() => plans.id, { onDelete: 'restrict' }),
    status: text('status').notNull(), // active, trialing, past_due, canceled, unpaid
    startAt: pgTimestamp('start_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    trialEndsAt: pgTimestamp('trial_ends_at', {
      withTimezone: true,
      mode: 'date',
    }),
    currentPeriodEnd: pgTimestamp('current_period_end', {
      withTimezone: true,
      mode: 'date',
    }),
    cancelAt: pgTimestamp('cancel_at', { withTimezone: true, mode: 'date' }),
    canceledAt: pgTimestamp('canceled_at', {
      withTimezone: true,
      mode: 'date',
    }),
    externalCustomerId: text('external_customer_id'), // e.g., Stripe customer id
    externalSubscriptionId: text('external_subscription_id'), // e.g., Stripe subscription id
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    subUserIdx: index('subscriptions_user_id_idx').on(t.userId),
    subPlanIdx: index('subscriptions_plan_id_idx').on(t.planId),
    subStatusIdx: index('subscriptions_status_idx').on(t.status),
  }),
);

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
