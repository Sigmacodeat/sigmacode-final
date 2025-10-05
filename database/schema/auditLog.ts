import { pgTable, text, jsonb, timestamp as pgTimestamp, index } from 'drizzle-orm/pg-core';

// Append-only Audit Log mit Hash-Chain
export const auditLog = pgTable(
  'audit_log',
  {
    id: text('id').primaryKey(), // UUID
    orgId: text('org_id'), // optional: falls Multi-Tenant via Orgs später ergänzt wird
    actorType: text('actor_type').notNull(), // user | service
    actorId: text('actor_id').notNull(),
    action: text('action').notNull(), // e.g., auth.login, billing.plan_change, agent.invoke
    resourceType: text('resource_type'), // e.g., agent, subscription
    resourceId: text('resource_id'),
    payload: jsonb('payload'),
    previousHash: text('previous_hash'),
    hash: text('hash').notNull(),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    actorIdx: index('audit_log_actor_idx').on(t.actorType, t.actorId),
    actionIdx: index('audit_log_action_idx').on(t.action),
    resourceIdx: index('audit_log_resource_idx').on(t.resourceType, t.resourceId),
    createdIdx: index('audit_log_created_at_idx').on(t.createdAt),
  }),
);

export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
