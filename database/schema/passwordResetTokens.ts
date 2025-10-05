import { pgTable, text, timestamp as pgTimestamp, primaryKey, index } from 'drizzle-orm/pg-core';
import { users } from './users';

// Password Reset Tokens für sichere Passwort-Zurücksetzung
export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    token: text('token').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    email: text('email').notNull(), // Für schnellen Lookup ohne User-Join
    expiresAt: pgTimestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
    usedAt: pgTimestamp('used_at', { withTimezone: true, mode: 'date' }),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    pk: primaryKey({
      columns: [t.token],
      name: 'password_reset_tokens_token_pk',
    }),
    userIdx: index('password_reset_tokens_user_id_idx').on(t.userId),
    emailIdx: index('password_reset_tokens_email_idx').on(t.email),
    expiresIdx: index('password_reset_tokens_expires_at_idx').on(t.expiresAt),
  }),
);

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
