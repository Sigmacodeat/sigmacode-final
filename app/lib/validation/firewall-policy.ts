import { z } from 'zod';

export const guardrailSchema = z.object({
  id: z.string().min(1, 'rule.id required'),
  name: z.string().min(1, 'rule.name required'),
  type: z.enum(['input_filter', 'output_filter', 'context_check', 'format_validation']),
  condition: z.string().default(''),
  action: z.enum(['block', 'sanitize', 'warn', 'transform']),
  priority: z.number().int().positive().optional(),
  enabled: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

export const policySchema = z.object({
  id: z.string().min(1, 'policy.id required'),
  name: z.string().min(1, 'policy.name required'),
  version: z.string().optional().or(z.number().optional()).or(z.date().optional()),
  mode: z.enum(['enforce', 'shadow', 'off']),
  updatedAt: z.string().optional(),
  rules: z.array(guardrailSchema).default([]),
});

export type GuardrailInput = z.infer<typeof guardrailSchema>;
export type PolicyInput = z.infer<typeof policySchema>;
