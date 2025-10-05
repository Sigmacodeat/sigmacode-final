import {
  pgTable,
  text,
  timestamp as pgTimestamp,
  index,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core';

// Rollen-Enum (State of the Art: feste Domäne statt freier Text)
export const userRole = pgEnum('user_role', ['user', 'editor', 'admin', 'service']);

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name'),
    // Multi-tenant: jeder User gehört zu einem Tenant
    tenantId: text('tenant_id').notNull().default('global'),
    role: userRole('role').default('user').notNull(),
    // Token-basiertes Billing
    tokenBalance: integer('token_balance').notNull().default(0),
    // Optional: Passwort-Hash für Credentials-Login (nullable für OAuth-only Konten)
    passwordHash: text('password_hash'),
    // NextAuth-Standardfelder (für DrizzleAdapter)
    image: text('image'),
    emailVerified: pgTimestamp('email_verified', {
      withTimezone: true,
      mode: 'date',
    }),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    emailIdx: index('users_email_idx').on(t.email),
    roleIdx: index('users_role_idx').on(t.role),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export function isAdmin(user?: User | null): boolean {
  return user?.role === 'admin';
}
