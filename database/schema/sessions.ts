import { pgTable, text, timestamp as pgTimestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

// NextAuth expects columns: sessionToken (PK), userId (FK), expires
export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: pgTimestamp('expires', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
