/**
 * SIGMACODE AI - Tool Registry
 *
 * Zentrale Registry für alle verfügbaren Tools, die Agents nutzen können.
 * Tools sind kategorisiert und können über die UI hinzugefügt werden.
 */

import { z } from 'zod';

export const ToolCategorySchema = z.enum([
  'llm', // LLM-Provider (OpenAI, Anthropic, etc.)
  'database', // Database-Operationen (PostgreSQL, MongoDB, etc.)
  'api', // HTTP API Calls
  'saas', // SaaS-Integrationen (Slack, Gmail, etc.)
  'search', // Web Search, Retrieval
  'custom', // Benutzerdefinierte Tools
]);

export type ToolCategory = z.infer<typeof ToolCategorySchema>;

export const ToolAuthTypeSchema = z.enum(['none', 'api_key', 'oauth', 'basic', 'bearer']);

export type ToolAuthType = z.infer<typeof ToolAuthTypeSchema>;

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon?: string;

  // Authentifizierung
  authType: ToolAuthType;
  authConfig?: {
    apiKeyHeader?: string;
    oauthScopes?: string[];
    tokenUrl?: string;
  };

  // Parameter
  parameters: ToolParameter[];

  // Endpoint-Konfiguration
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  // Execution Handler
  execute: (params: Record<string, any>, context: ToolExecutionContext) => Promise<any>;

  // Verfügbarkeit
  isEnabled: boolean;
  isPublic: boolean;
  requiresFirewall: boolean; // Wenn true, wird immer Firewall-Check durchgeführt
}

export interface ToolExecutionContext {
  userId: string;
  agentId: string;
  workflowId?: string;
  requestId: string;
  credentials?: Record<string, string>;
}

/**
 * Tool Registry - Singleton
 */
class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  register(tool: ToolDefinition) {
    this.tools.set(tool.id, tool);
  }

  get(id: string): ToolDefinition | undefined {
    return this.tools.get(id);
  }

  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getByCategory(category: ToolCategory): ToolDefinition[] {
    return this.getAll().filter((t) => t.category === category);
  }

  getEnabled(): ToolDefinition[] {
    return this.getAll().filter((t) => t.isEnabled);
  }

  async execute(
    toolId: string,
    params: Record<string, any>,
    context: ToolExecutionContext,
  ): Promise<any> {
    const tool = this.get(toolId);
    if (!tool) {
      throw new Error(`Tool not found: ${toolId}`);
    }

    if (!tool.isEnabled) {
      throw new Error(`Tool is disabled: ${toolId}`);
    }

    // Validate parameters
    this.validateParameters(tool, params);

    // Execute tool
    return await tool.execute(params, context);
  }

  private validateParameters(tool: ToolDefinition, params: Record<string, any>) {
    for (const param of tool.parameters) {
      if (param.required && !(param.name in params)) {
        throw new Error(`Missing required parameter: ${param.name}`);
      }

      if (param.name in params) {
        const value = params[param.name];
        const expectedType = param.type;

        // Basic type checking
        if (expectedType === 'string' && typeof value !== 'string') {
          throw new Error(`Parameter ${param.name} must be a string`);
        }
        if (expectedType === 'number' && typeof value !== 'number') {
          throw new Error(`Parameter ${param.name} must be a number`);
        }
        if (expectedType === 'boolean' && typeof value !== 'boolean') {
          throw new Error(`Parameter ${param.name} must be a boolean`);
        }
        if (expectedType === 'object' && typeof value !== 'object') {
          throw new Error(`Parameter ${param.name} must be an object`);
        }
        if (expectedType === 'array' && !Array.isArray(value)) {
          throw new Error(`Parameter ${param.name} must be an array`);
        }
      }
    }
  }
}

export const toolRegistry = new ToolRegistry();

/**
 * Default Tools
 */

// HTTP Request Tool
toolRegistry.register({
  id: 'http-request',
  name: 'HTTP Request',
  category: 'api',
  description: 'Macht HTTP-Anfragen an beliebige APIs',
  icon: '🌐',
  authType: 'none',
  parameters: [
    {
      name: 'url',
      type: 'string',
      description: 'Target URL',
      required: true,
    },
    {
      name: 'method',
      type: 'string',
      description: 'HTTP Method (GET, POST, etc.)',
      required: true,
      default: 'GET',
    },
    {
      name: 'headers',
      type: 'object',
      description: 'HTTP Headers',
      required: false,
    },
    {
      name: 'body',
      type: 'object',
      description: 'Request Body (für POST/PUT)',
      required: false,
    },
  ],
  isEnabled: true,
  isPublic: true,
  requiresFirewall: true, // URLs müssen durch Firewall
  async execute(params, context) {
    const { url, method, headers, body } = params;

    const response = await fetch(url, {
      method: method || 'GET',
      headers: headers || {},
      body: body ? JSON.stringify(body) : undefined,
    });

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: await response.json(),
    };
  },
});

// OpenAI Tool
toolRegistry.register({
  id: 'openai',
  name: 'OpenAI',
  category: 'llm',
  description: 'OpenAI GPT-4 Integration',
  icon: '🤖',
  authType: 'api_key',
  authConfig: {
    apiKeyHeader: 'Authorization',
  },
  parameters: [
    {
      name: 'prompt',
      type: 'string',
      description: 'Prompt für das LLM',
      required: true,
    },
    {
      name: 'model',
      type: 'string',
      description: 'Model Name (z.B. gpt-4)',
      required: false,
      default: 'gpt-4',
    },
    {
      name: 'temperature',
      type: 'number',
      description: 'Temperatur (0-2)',
      required: false,
      default: 0.7,
    },
  ],
  isEnabled: true,
  isPublic: true,
  requiresFirewall: true,
  async execute(params, context) {
    const { prompt, model, temperature } = params;
    const apiKey = context.credentials?.['openai_api_key'];

    if (!apiKey) {
      throw new Error('OpenAI API Key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: temperature || 0.7,
      }),
    });

    const data = await response.json();
    return {
      response: data.choices[0].message.content,
      usage: data.usage,
    };
  },
});

// PostgreSQL Query Tool
toolRegistry.register({
  id: 'postgres-query',
  name: 'PostgreSQL Query',
  category: 'database',
  description: 'Führt SQL-Queries auf PostgreSQL aus',
  icon: '🐘',
  authType: 'basic',
  parameters: [
    {
      name: 'query',
      type: 'string',
      description: 'SQL Query',
      required: true,
    },
    {
      name: 'params',
      type: 'array',
      description: 'Query-Parameter (für Prepared Statements)',
      required: false,
    },
  ],
  isEnabled: true,
  isPublic: false, // Nur für Enterprise-Kunden
  requiresFirewall: true,
  async execute(params, context) {
    // TODO: Implement actual PostgreSQL connection
    throw new Error('PostgreSQL integration not yet implemented');
  },
});

// Slack Integration
toolRegistry.register({
  id: 'slack-send',
  name: 'Slack Send Message',
  category: 'saas',
  description: 'Sendet Nachrichten an Slack',
  icon: '💬',
  authType: 'oauth',
  authConfig: {
    oauthScopes: ['chat:write'],
  },
  parameters: [
    {
      name: 'channel',
      type: 'string',
      description: 'Slack Channel ID',
      required: true,
    },
    {
      name: 'text',
      type: 'string',
      description: 'Nachrichtentext',
      required: true,
    },
  ],
  isEnabled: true,
  isPublic: true,
  requiresFirewall: false,
  async execute(params, context) {
    const { channel, text } = params;
    const token = context.credentials?.['slack_token'];

    if (!token) {
      throw new Error('Slack token not configured');
    }

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        channel,
        text,
      }),
    });

    return await response.json();
  },
});

export default toolRegistry;
