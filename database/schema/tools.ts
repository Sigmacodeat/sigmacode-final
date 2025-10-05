import { pgTable, uuid, varchar, boolean, text, timestamp } from 'drizzle-orm/pg-core';

export const tools = pgTable('tools', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  category: varchar('category', { length: 64 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 64 }),
  requiresAuth: boolean('requires_auth').notNull().default(false),
  authType: varchar('auth_type', { length: 64 }),
  isEnabled: boolean('is_enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});
