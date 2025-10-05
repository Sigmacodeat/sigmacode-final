import { pgTable, text, varchar, timestamp as pgTimestamp, index } from 'drizzle-orm/pg-core';

export const tenants = pgTable(
  'tenants',
  {
    id: text('id').primaryKey(), // uuid
    name: varchar('name', { length: 128 }).notNull(),
    slug: varchar('slug', { length: 128 }).notNull().unique(),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    slugIdx: index('tenants_slug_idx').on(t.slug),
  }),
);

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
