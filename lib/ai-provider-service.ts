// SIGMACODE AI Provider Service
// Multi-Model Support with Token Cost Tracking

import { getDb } from '@/database/db';
import {
  aiProviders,
  tokenUsage,
  type AiProvider,
  type NewTokenUsage,
} from '@/database/schema/aiProviders';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
// Hinweis: SDKs werden dynamisch importiert, um optionale Abhängigkeiten zu erlauben
async function dynamicImport(moduleName: string): Promise<any> {
  // Verhindert, dass TypeScript versucht, das Modul zur Build-Zeit aufzulösen
  // und ermöglicht optional installierbare SDKs.
  const importer = new Function('m', 'return import(m)');
  return importer(moduleName);
}

// Provider Types
export type ProviderType = 'openai' | 'anthropic' | 'mistral' | 'llama' | 'custom';

// Model Configuration
export interface ModelConfig {
  id: string;
  name: string;
  provider: ProviderType;
  contextLength: number;
  inputCostPer1k: number; // Cost per 1k input tokens
  outputCostPer1k: number; // Cost per 1k output tokens
  maxTokens: number;
  capabilities: string[]; // chat, completion, embeddings
}

// Default Model Configurations
export const DEFAULT_MODELS: Record<ProviderType, ModelConfig[]> = {
  openai: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      contextLength: 128000,
      inputCostPer1k: 0.005,
      outputCostPer1k: 0.015,
      maxTokens: 4096,
      capabilities: ['chat', 'completion'],
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      contextLength: 128000,
      inputCostPer1k: 0.00015,
      outputCostPer1k: 0.0006,
      maxTokens: 4096,
      capabilities: ['chat', 'completion'],
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      contextLength: 128000,
      inputCostPer1k: 0.01,
      outputCostPer1k: 0.03,
      maxTokens: 4096,
      capabilities: ['chat', 'completion'],
    },
  ],
  anthropic: [
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      contextLength: 200000,
      inputCostPer1k: 0.003,
      outputCostPer1k: 0.015,
      maxTokens: 8192,
      capabilities: ['chat', 'completion'],
    },
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      contextLength: 200000,
      inputCostPer1k: 0.015,
      outputCostPer1k: 0.075,
      maxTokens: 4096,
      capabilities: ['chat', 'completion'],
    },
  ],
  mistral: [
    {
      id: 'mistral-large-latest',
      name: 'Mistral Large',
      provider: 'mistral',
      contextLength: 128000,
      inputCostPer1k: 0.002,
      outputCostPer1k: 0.006,
      maxTokens: 4096,
      capabilities: ['chat', 'completion'],
    },
    {
      id: 'mistral-medium-latest',
      name: 'Mistral Medium',
      provider: 'mistral',
      contextLength: 32000,
      inputCostPer1k: 0.0007,
      outputCostPer1k: 0.0018,
      maxTokens: 4096,
      capabilities: ['chat', 'completion'],
    },
  ],
  llama: [
    {
      id: 'llama-3.1-70b',
      name: 'Llama 3.1 70B',
      provider: 'llama',
      contextLength: 128000,
      inputCostPer1k: 0.0009,
      outputCostPer1k: 0.0009,
      maxTokens: 4096,
      capabilities: ['chat', 'completion'],
    },
    {
      id: 'llama-3.1-8b',
      name: 'Llama 3.1 8B',
      provider: 'llama',
      contextLength: 128000,
      inputCostPer1k: 0.0001,
      outputCostPer1k: 0.0001,
      maxTokens: 4096,
      capabilities: ['chat', 'completion'],
    },
  ],
  custom: [],
};

export class AiProviderService {
  private static instance: AiProviderService;
  private providers: Map<string, any> = new Map();

  static getInstance(): AiProviderService {
    if (!AiProviderService.instance) {
      AiProviderService.instance = new AiProviderService();
    }
    return AiProviderService.instance;
  }

  // Initialize provider client
  async getProviderClient(providerId: string) {
    const db = await getDb();
    const providerArr = await db
      .select()
      .from(aiProviders)
      .where(eq(aiProviders.id, providerId))
      .limit(1);
    const provider = providerArr[0];

    if (!provider || !provider.isActive) {
      throw new Error(`Provider ${providerId} not found or inactive`);
    }

    if (this.providers.has(providerId)) {
      return this.providers.get(providerId);
    }

    let client: any;

    switch (provider.providerType) {
      case 'openai': {
        try {
          const mod = await dynamicImport('openai');
          const OpenAI = mod.default || (mod as any);
          client = new OpenAI({
            apiKey: provider.apiKey,
            baseURL: provider.baseUrl || undefined,
          });
        } catch (e) {
          throw new Error('OpenAI SDK ist nicht installiert. Bitte `pnpm add openai` ausführen.');
        }
        break;
      }

      case 'anthropic': {
        try {
          const mod = await dynamicImport('@anthropic-ai/sdk');
          const Anthropic = (mod as any).default || (mod as any);
          client = new Anthropic({
            apiKey: provider.apiKey,
          });
        } catch (e) {
          throw new Error(
            'Anthropic SDK ist nicht installiert. Bitte `pnpm add @anthropic-ai/sdk` ausführen.',
          );
        }
        break;
      }

      case 'mistral': {
        try {
          const mod = await dynamicImport('openai');
          const OpenAI = mod.default || (mod as any);
          client = new OpenAI({
            apiKey: provider.apiKey,
            baseURL: provider.baseUrl || 'https://api.mistral.ai/v1',
          });
        } catch (e) {
          throw new Error(
            'OpenAI-kompatibles SDK für Mistral fehlt. Bitte `pnpm add openai` ausführen.',
          );
        }
        break;
      }

      case 'llama': {
        // Für Llama-Modelle OpenAI-kompatibles SDK verwenden
        try {
          const mod = await dynamicImport('openai');
          const OpenAI = mod.default || (mod as any);
          client = new OpenAI({
            apiKey: provider.apiKey,
            baseURL: provider.baseUrl,
          });
        } catch (e) {
          throw new Error(
            'OpenAI-kompatibles SDK für Llama fehlt. Bitte `pnpm add openai` ausführen.',
          );
        }
        break;
      }

      case 'custom': {
        try {
          const mod = await dynamicImport('openai');
          const OpenAI = mod.default || (mod as any);
          client = new OpenAI({
            apiKey: provider.apiKey,
            baseURL: provider.baseUrl,
          });
        } catch (e) {
          throw new Error(
            'OpenAI-kompatibles SDK für Custom fehlt. Bitte `pnpm add openai` ausführen.',
          );
        }
        break;
      }

      default:
        throw new Error(`Unsupported provider type: ${provider.providerType}`);
    }

    this.providers.set(providerId, client);
    return client;
  }

  // Get available models for a provider
  async getAvailableModels(providerId: string): Promise<ModelConfig[]> {
    const db = await getDb();
    const providerArr = await db
      .select()
      .from(aiProviders)
      .where(eq(aiProviders.id, providerId))
      .limit(1);
    const provider = providerArr[0];

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    return DEFAULT_MODELS[provider.providerType as ProviderType] || [];
  }

  // Calculate token cost
  calculateTokenCost(model: string, inputTokens: number, outputTokens: number): number {
    const allModels = Object.values(DEFAULT_MODELS).flat();
    const modelConfig = allModels.find((m) => m.id === model);

    if (!modelConfig) {
      // Fallback cost calculation
      return ((inputTokens + outputTokens) * 0.001) / 1000;
    }

    const inputCost = (inputTokens / 1000) * modelConfig.inputCostPer1k;
    const outputCost = (outputTokens / 1000) * modelConfig.outputCostPer1k;

    return inputCost + outputCost;
  }

  // Track token usage
  async trackTokenUsage(usage: NewTokenUsage): Promise<void> {
    const db = await getDb();
    await db.insert(tokenUsage).values(usage);
  }

  // Get token usage statistics
  async getTokenUsageStats(tenantId: string, startDate?: Date, endDate?: Date) {
    const db = await getDb();

    // Vereinfachte Filterung (optional Date-Range kann später ergänzt werden)
    const usage = await db
      .select()
      .from(tokenUsage)
      .where(eq(tokenUsage.tenantId, tenantId))
      .orderBy((tokenUsage as any).createdAt as any);

    const totalInputTokens = usage.reduce((sum, u) => sum + u.inputTokens, 0);
    const totalOutputTokens = usage.reduce((sum, u) => sum + u.outputTokens, 0);
    const totalCost = usage.reduce((sum, u) => sum + Number(u.cost || 0), 0);

    return {
      totalRequests: usage.length,
      totalInputTokens,
      totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens,
      totalCost,
      averageCostPerRequest: usage.length > 0 ? totalCost / usage.length : 0,
      usageByModel: usage.reduce(
        (acc, u) => {
          acc[u.model] = (acc[u.model] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  // Create a new provider
  async createProvider(
    providerData: Omit<AiProvider, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<AiProvider> {
    const db = await getDb();
    const id = uuidv4();

    const provider: AiProvider = {
      ...providerData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AiProvider;

    await db.insert(aiProviders).values(provider);
    return provider;
  }

  // Get default provider for tenant
  async getDefaultProvider(tenantId: string): Promise<AiProvider | null> {
    const db = await getDb();
    const resArr = await db
      .select()
      .from(aiProviders)
      .where(
        and(
          eq(aiProviders.tenantId, tenantId),
          eq(aiProviders.isDefault, true),
          eq(aiProviders.isActive, true),
        ),
      )
      .limit(1);
    return (resArr[0] as any) ?? null;
  }
}

export const aiProviderService = AiProviderService.getInstance();
