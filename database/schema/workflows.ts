/**
 * SIGMACODE AI - Workflow Schema
 *
 * Workflows sind die eigentlichen ausführbaren Prozesse.
 * Ein Agent kann mehrere Workflows haben.
 */

import {
  pgTable,
  text,
  boolean,
  jsonb,
  timestamp as pgTimestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { agents } from './agents';
import { users } from './users';

export const workflows = pgTable(
  'workflows',
  {
    id: text('id').primaryKey(),
    agentId: text('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
    ownerUserId: text('owner_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    name: text('name').notNull(),
    description: text('description'),

    // Workflow Definition (JSON)
    definition: jsonb('definition').notNull(), // { nodes, edges, variables }

    // Status
    isActive: boolean('is_active').notNull().default(true),
    version: integer('version').notNull().default(1),

    // Trigger Configuration
    triggerType: text('trigger_type').notNull(), // manual | schedule | webhook | event
    triggerConfig: jsonb('trigger_config'), // Cron, Webhook URL, etc.

    // Execution Settings
    timeout: integer('timeout').notNull().default(300), // seconds
    maxRetries: integer('max_retries').notNull().default(3),

    // Statistics
    executionCount: integer('execution_count').notNull().default(0),
    lastExecutedAt: pgTimestamp('last_executed_at', { withTimezone: true, mode: 'date' }),

    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    agentIdx: index('workflows_agent_id_idx').on(t.agentId),
    ownerIdx: index('workflows_owner_user_id_idx').on(t.ownerUserId),
    activeIdx: index('workflows_is_active_idx').on(t.isActive),
  }),
);

export const workflowExecutions = pgTable(
  'workflow_executions',
  {
    id: text('id').primaryKey(),
    workflowId: text('workflow_id')
      .notNull()
      .references(() => workflows.id, { onDelete: 'cascade' }),

    // Input & Output
    input: jsonb('input'),
    output: jsonb('output'),

    // Execution Status
    status: text('status').notNull(), // pending | running | success | failed | cancelled
    error: text('error'),

    // Firewall Results
    firewallPreCheck: jsonb('firewall_pre_check'),
    firewallPostCheck: jsonb('firewall_post_check'),

    // Performance Metrics
    startedAt: pgTimestamp('started_at', { withTimezone: true, mode: 'date' }),
    completedAt: pgTimestamp('completed_at', { withTimezone: true, mode: 'date' }),
    duration: integer('duration'), // milliseconds

    // Logs
    logs: jsonb('logs'), // Array of log entries

    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    workflowIdx: index('workflow_executions_workflow_id_idx').on(t.workflowId),
    statusIdx: index('workflow_executions_status_idx').on(t.status),
    createdIdx: index('workflow_executions_created_at_idx').on(t.createdAt),
  }),
);

export const workflowTools = pgTable(
  'workflow_tools',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull().unique(),
    category: text('category').notNull(), // llm | database | api | saas | custom

    // Tool Configuration
    config: jsonb('config').notNull(), // Schema, Auth, Endpoints
    icon: text('icon'),
    description: text('description'),

    // Authentication Required
    requiresAuth: boolean('requires_auth').notNull().default(false),
    authType: text('auth_type'), // oauth | api_key | basic | none

    // Availability
    isEnabled: boolean('is_enabled').notNull().default(true),
    isPublic: boolean('is_public').notNull().default(true),

    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    categoryIdx: index('workflow_tools_category_idx').on(t.category),
    enabledIdx: index('workflow_tools_is_enabled_idx').on(t.isEnabled),
  }),
);

export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;

export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type NewWorkflowExecution = typeof workflowExecutions.$inferInsert;

export type WorkflowTool = typeof workflowTools.$inferSelect;
export type NewWorkflowTool = typeof workflowTools.$inferInsert;
