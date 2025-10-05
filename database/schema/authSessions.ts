import { pgTable, text, timestamp as pgTimestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';

// NextAuth-kompatible Sessions-Tabelle (separat von eurer eigenen `sessions`)
export const authSessions = pgTable(
  'auth_sessions',
  {
    sessionToken: text('session_token').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: pgTimestamp('expires', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    userIdx: index('auth_sessions_user_id_idx').on(t.userId),
  }),
);

export type AuthSession = typeof authSessions.$inferSelect;
export type NewAuthSession = typeof authSessions.$inferInsert;
