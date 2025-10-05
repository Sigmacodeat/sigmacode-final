import {
  pgTable,
  text,
  boolean,
  jsonb,
  timestamp as pgTimestamp,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users';

// Agents (State of the Art): pro Agent konfigurierbare Firewall-Settings
export const agents = pgTable(
  'agents',
  {
    id: text('id').primaryKey(),
    ownerUserId: text('owner_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),

    // Per-Agent Firewall Toggle & Policy
    firewallEnabled: boolean('firewall_enabled').notNull().default(false),
    firewallPolicy: text('firewall_policy').notNull().default('off'), // off | basic | strict | custom
    firewallConfig: jsonb('firewall_config'), // JSON-Objekt mit Allow/Deny-Regeln, Domains, MIME, PII-Masken etc.

    // Model/Execution Policies (optional, erweiterbar)
    modelTier: text('model_tier'), // z.B. standard | advanced | premium

    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    ownerIdx: index('agents_owner_user_id_idx').on(t.ownerUserId),
    nameIdx: index('agents_name_idx').on(t.name),
  }),
);

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
