import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  timestamp as pgTimestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

// Multi-tenant Policy Definition
export const firewallPolicies = pgTable(
  'firewall_policies',
  {
    id: text('id').primaryKey(), // uuid
    tenantId: text('tenant_id').notNull(),
    name: varchar('name', { length: 128 }).notNull(),
    description: varchar('description', { length: 512 }),
    priority: integer('priority').notNull().default(100), // niedrigere Zahl => höhere Priorität
    isActive: boolean('is_active').notNull().default(true),
    mode: varchar('mode', { length: 16 }).notNull().default('enforce'), // enforce | shadow
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    tenantIdx: index('firewall_policies_tenant_idx').on(t.tenantId),
    activeIdx: index('firewall_policies_active_idx').on(t.isActive),
    priorityIdx: index('firewall_policies_priority_idx').on(t.priority),
  }),
);

// Structured Rules with Condition JSON (AND/OR etc.)
export const firewallRules = pgTable(
  'firewall_rules',
  {
    id: text('id').primaryKey(), // uuid
    policyId: text('policy_id').notNull(),
    name: varchar('name', { length: 128 }).notNull(),
    description: varchar('description', { length: 512 }),
    // Beispiel Condition:
    // { any: [ { pii: true }, { regex: "credit_card" }, { tokensOver: 8000 } ] }
    conditions: jsonb('conditions').notNull().default({}),
    // action: allow | block | sanitize
    action: varchar('action', { length: 32 }).notNull(),
    severity: varchar('severity', { length: 16 }).notNull().default('medium'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    policyIdx: index('firewall_rules_policy_idx').on(t.policyId),
    activeIdx: index('firewall_rules_active_idx').on(t.isActive),
    actionIdx: index('firewall_rules_action_idx').on(t.action),
  }),
);

// Bindings to scope policies (apiKey, userId, agentId, routePrefix)
export const firewallBindings = pgTable(
  'firewall_bindings',
  {
    id: text('id').primaryKey(), // uuid
    policyId: text('policy_id').notNull(),
    tenantId: text('tenant_id').notNull(),
    // Null bedeutet "global für Tenant"
    apiKeyId: text('api_key_id'),
    userId: text('user_id'),
    agentId: text('agent_id'),
    routePrefix: varchar('route_prefix', { length: 256 }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    tenantIdx: index('firewall_bindings_tenant_idx').on(t.tenantId),
    policyIdx: index('firewall_bindings_policy_idx').on(t.policyId),
    apiKeyIdx: index('firewall_bindings_apikey_idx').on(t.apiKeyId),
    agentIdx: index('firewall_bindings_agent_idx').on(t.agentId),
    userIdx: index('firewall_bindings_user_idx').on(t.userId),
  }),
);

export type FirewallPolicy = typeof firewallPolicies.$inferSelect;
export type NewFirewallPolicy = typeof firewallPolicies.$inferInsert;
export type FirewallRule = typeof firewallRules.$inferSelect;
export type NewFirewallRule = typeof firewallRules.$inferInsert;
export type FirewallBinding = typeof firewallBindings.$inferSelect;
export type NewFirewallBinding = typeof firewallBindings.$inferInsert;
