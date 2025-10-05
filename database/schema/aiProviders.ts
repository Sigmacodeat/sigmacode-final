import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  numeric,
  timestamp as pgTimestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

// AI Provider Configuration for Multi-Model Support
export const aiProviders = pgTable(
  'ai_providers',
  {
    id: text('id').primaryKey(), // uuid
    tenantId: text('tenant_id').notNull(),
    name: varchar('name', { length: 128 }).notNull(), // OpenAI, Anthropic, etc.
    providerType: varchar('provider_type', { length: 64 }).notNull(), // openai, anthropic, mistral, etc.
    baseUrl: varchar('base_url', { length: 512 }), // Custom endpoint
    apiKey: text('api_key'), // Encrypted API key
    isActive: boolean('is_active').notNull().default(true),
    isDefault: boolean('is_default').notNull().default(false),
    rateLimits: jsonb('rate_limits').default({}), // Provider-specific rate limits
    tokenCosts: jsonb('token_costs').default({}), // Cost per 1k tokens for different models
    models: jsonb('models').default([]), // Available models for this provider
    metadata: jsonb('metadata').default({}), // Provider-specific configuration
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    tenantIdx: index('ai_providers_tenant_idx').on(t.tenantId),
    typeIdx: index('ai_providers_type_idx').on(t.providerType),
    activeIdx: index('ai_providers_active_idx').on(t.isActive),
  }),
);

// Token Usage Tracking
export const tokenUsage = pgTable(
  'token_usage',
  {
    id: text('id').primaryKey(), // uuid
    tenantId: text('tenant_id').notNull(),
    userId: text('user_id'),
    providerId: text('provider_id').notNull(),
    model: varchar('model', { length: 128 }).notNull(),
    inputTokens: integer('input_tokens').notNull(),
    outputTokens: integer('output_tokens').notNull(),
    totalTokens: integer('total_tokens').notNull(),
    cost: numeric('cost', { precision: 10, scale: 6 }), // Cost in USD
    requestType: varchar('request_type', { length: 32 }).notNull(), // firewall, completion, chat
    metadata: jsonb('metadata').default({}),
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => ({
    tenantIdx: index('token_usage_tenant_idx').on(t.tenantId),
    providerIdx: index('token_usage_provider_idx').on(t.providerId),
    modelIdx: index('token_usage_model_idx').on(t.model),
    createdAtIdx: index('token_usage_created_at_idx').on(t.createdAt),
  }),
);

export type AiProvider = typeof aiProviders.$inferSelect;
export type NewAiProvider = typeof aiProviders.$inferInsert;
export type TokenUsage = typeof tokenUsage.$inferSelect;
export type NewTokenUsage = typeof tokenUsage.$inferInsert;
