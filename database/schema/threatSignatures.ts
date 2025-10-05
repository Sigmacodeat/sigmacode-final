import {
  pgTable,
  text,
  timestamp as pgTimestamp,
  index,
  varchar,
  boolean,
} from 'drizzle-orm/pg-core';

// Threat Signatures für Prompt Injection, Context Leakage, etc.
export const threatSignatures = pgTable(
  'threat_signatures',
  {
    id: text('id').primaryKey(), // UUID
    category: varchar('category', { length: 64 }).notNull(), // prompt_injection, context_leakage, pii, secrets, etc.
    pattern: text('pattern').notNull(), // Regex oder Pattern-String
    severity: varchar('severity', { length: 32 }).notNull(), // low, medium, high, critical
    description: text('description'),
    source: varchar('source', { length: 128 }), // rebuff, owasp, custom, etc.
    version: varchar('version', { length: 32 }).notNull(), // Version für Updates
    isActive: boolean('is_active').notNull().default(true),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    categoryIdx: index('threat_signatures_category_idx').on(t.category),
    severityIdx: index('threat_signatures_severity_idx').on(t.severity),
    activeIdx: index('threat_signatures_active_idx').on(t.isActive),
    sourceIdx: index('threat_signatures_source_idx').on(t.source),
  }),
);

export type ThreatSignature = typeof threatSignatures.$inferSelect;
export type NewThreatSignature = typeof threatSignatures.$inferInsert;
