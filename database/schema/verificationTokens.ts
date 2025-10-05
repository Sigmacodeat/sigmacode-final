import { pgTable, text, timestamp as pgTimestamp, primaryKey, index } from 'drizzle-orm/pg-core';

// NextAuth Verification Tokens (z. B. E-Mail-Login, Passwort-Reset, etc.)
export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
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
    pk: primaryKey({
      columns: [t.identifier, t.token],
      name: 'verification_tokens_identifier_token_pk',
    }),
    identifierIdx: index('verification_tokens_identifier_idx').on(t.identifier),
  }),
);

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
