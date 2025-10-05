// SIGMACODE AI Firewall Plugin for LangChain
// Drop-in security integration for popular AI frameworks

// Base Plugin Interface
export interface AIFirewallPlugin {
  name: string;
  version: string;
  framework: 'langchain' | 'llamaindex' | 'generic';
  initialize(config: PluginConfig): Promise<void>;
  processInput(input: PluginInput): Promise<PluginOutput>;
  processOutput(output: PluginOutput): Promise<PluginOutput>;
  healthCheck(): Promise<boolean>;
}

// Plugin Configuration
export interface PluginConfig {
  id: string;
  enabled: boolean;
  apiKey: string;
  endpoint: string;
  mode: 'enforce' | 'shadow' | 'off';
  rules: SecurityRule[];
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  metadata?: Record<string, any>;
}

export interface SecurityRule {
  id: string;
  name: string;
  type: 'input' | 'output' | 'both';
  enabled: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
}

export interface RuleCondition {
  type: 'keyword' | 'pattern' | 'regex' | 'sentiment' | 'toxicity' | 'pii';
  field: string;
  operator: 'contains' | 'equals' | 'regex' | 'gt' | 'lt';
  value: any;
  caseSensitive: boolean;
}

export interface RuleAction {
  type: 'block' | 'alert' | 'log' | 'sanitize' | 'transform';
  config: Record<string, any>;
}

// Plugin Input/Output
export interface PluginInput {
  id: string;
  timestamp: string;
  type: 'prompt' | 'query' | 'message' | 'document';
  content: string;
  metadata: {
    userId?: string;
    sessionId?: string;
    source?: string;
    framework?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface PluginOutput {
  id: string;
  timestamp: string;
  inputId: string;
  content: string;
  metadata: {
    model?: string;
    tokens?: number;
    processingTime?: number;
    confidence?: number;
  };
  blocked: boolean;
  reason?: string;
  reasonCode?: ReasonCode;
  explainability?: ExplainabilityDetail[];
  policy?: {
    id?: string;
    version?: string;
    mode?: 'enforce' | 'shadow';
  };
  sanitized: boolean;
  alerts: AlertInfo[];
  compliance: ComplianceInfo[];
}

export interface AlertInfo {
  action: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
}

export interface ComplianceInfo {
  regulation: string;
  status: 'compliant' | 'violation' | 'warning';
  details: string;
}

// Reason codes for explainability
export enum ReasonCode {
  PII_EMAIL = 'PII_EMAIL',
  PII_PHONE = 'PII_PHONE',
  PII_ID_NUMBER = 'PII_ID_NUMBER',
  PII_CREDIT_CARD = 'PII_CREDIT_CARD',
  PROMPT_INJECTION = 'PROMPT_INJECTION',
  TOXICITY = 'TOXICITY',
  MALWARE = 'MALWARE',
  SECRETS_MATCH = 'SECRETS_MATCH',
  COMPLIANCE_VIOLATION = 'COMPLIANCE_VIOLATION',
  RATE_LIMIT = 'RATE_LIMIT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  POLICY_RULE_MATCH = 'POLICY_RULE_MATCH',
  UNKNOWN = 'UNKNOWN',
}

export interface ExplainabilityDetail {
  code: ReasonCode;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ruleId?: string;
  evidence?: Record<string, any>;
  mitigation?: string;
  stage?: 'pre' | 'model' | 'post';
}

// Small utility to perform fetch with retry and timeout
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options: { attempts?: number; delayMs?: number; timeoutMs?: number } = {},
): Promise<Response> {
  const attempts = options.attempts ?? 2;
  const delayMs = options.delayMs ?? 250;
  const timeoutMs = options.timeoutMs ?? 10000;

  let lastError: unknown = null;
  for (let attempt = 0; attempt <= attempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const resp = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeout);
      if (resp.status >= 500 && attempt < attempts) {
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      return resp;
    } catch (err) {
      lastError = err;
      if (attempt < attempts) {
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Request failed');
}

// LangChain Plugin Implementation
export class LangChainPlugin implements AIFirewallPlugin {
  name = 'SIGMACODE AI Firewall for LangChain';
  version = '1.0.0';
  framework: 'langchain' = 'langchain';
  config: PluginConfig | undefined;
  private initialized = false;

  async initialize(config: PluginConfig): Promise<void> {
    // Apply sensible defaults without overwriting provided values
    this.config = {
      ...config,
      retryAttempts: config.retryAttempts !== undefined ? config.retryAttempts : 2,
      retryDelay: config.retryDelay !== undefined ? config.retryDelay : 250,
      timeout: config.timeout !== undefined ? config.timeout : 10000,
    };

    if (!config.enabled) {
      console.log('LangChain plugin disabled');
      return;
    }

    if (!config.apiKey || !config.endpoint) {
      throw new Error('API key and endpoint are required for LangChain plugin');
    }

    await this.healthCheck();
    this.initialized = true;
    console.log('LangChain plugin initialized successfully');
  }

  async processInput(input: PluginInput): Promise<PluginOutput> {
    if (!this.initialized || !this.config?.enabled) {
      return this.createOutput(input, input.content);
    }

    try {
      const violations = this.checkSecurityRules(input);

      if (violations.length > 0) {
        const blockedViolation = violations.find((v) => v.action === 'block');
        if (blockedViolation) {
          return this.createBlockedOutput(input, 'Input blocked by security rules', violations);
        }
      }

      const analysis = await this.analyzeWithFirewall(input);

      if (analysis.blocked) {
        const blocked = this.createBlockedOutput(
          input,
          analysis.reason || 'Blocked by AI firewall',
          analysis.alerts,
        );
        return {
          ...blocked,
          reasonCode: analysis.reasonCode,
          explainability: analysis.explainability,
          policy: analysis.policy,
        };
      }

      const finalContent = analysis.sanitized ? analysis.sanitizedContent : input.content;
      const out = this.createOutput(input, finalContent, analysis.alerts, analysis.compliance);
      return {
        ...out,
        reasonCode: analysis.reasonCode,
        explainability: analysis.explainability,
        policy: analysis.policy,
      };
    } catch (error) {
      console.error('Error processing LangChain input:', error);

      if (this.config?.mode === 'enforce') {
        return this.createBlockedOutput(input, 'Firewall processing error', [
          {
            type: 'error',
            severity: 'high',
            message: 'Failed to process input through firewall',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
            action: '',
          },
        ]);
      }

      return this.createOutput(input, input.content);
    }
  }

  async processOutput(output: PluginOutput): Promise<PluginOutput> {
    if (!this.initialized || !this.config?.enabled) {
      return output;
    }

    try {
      const violations = this.checkOutputSecurityRules(output);

      if (violations.length > 0) {
        const blockedViolation = violations.find((v) => v.action === 'block');
        if (blockedViolation) {
          return {
            ...output,
            blocked: true,
            reason: 'Output blocked by security rules',
            alerts: [...output.alerts, ...violations],
          };
        }
      }

      const analysis = await this.analyzeOutputWithFirewall(output);

      if (analysis.blocked) {
        return {
          ...output,
          blocked: true,
          reason: analysis.reason || 'Blocked by AI firewall',
          alerts: [...output.alerts, ...analysis.alerts],
          reasonCode: analysis.reasonCode,
          explainability: analysis.explainability,
          policy: analysis.policy,
        };
      }

      return {
        ...output,
        alerts: [...output.alerts, ...analysis.alerts],
        compliance: [...output.compliance, ...analysis.compliance],
        reasonCode: analysis.reasonCode,
        explainability: analysis.explainability,
        policy: analysis.policy,
      };
    } catch (error) {
      console.error('Error processing LangChain output:', error);

      if (this.config?.mode === 'enforce') {
        return {
          ...output,
          blocked: true,
          reason: 'Firewall processing error',
          alerts: [
            ...output.alerts,
            {
              type: 'error',
              severity: 'high',
              message: 'Failed to process output through firewall',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
              action: '',
            },
          ],
        };
      }

      return output;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.config) return false;
      const { endpoint, apiKey, timeout } = this.config;
      const response = await fetch(`${endpoint}/health`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(timeout),
      });

      return response.status === 200;
    } catch (error) {
      console.error('LangChain plugin health check failed:', error);
      return false;
    }
  }

  private checkSecurityRules(input: PluginInput): AlertInfo[] {
    const alerts: AlertInfo[] = [];

    for (const rule of this.config?.rules || []) {
      if (!rule.enabled || rule.type !== 'input') continue;

      const matches = rule.conditions.some((condition) => {
        return this.evaluateCondition(condition, input);
      });

      if (matches) {
        const action = this.getRuleAction(rule);
        alerts.push({
          type: 'security_rule',
          severity: this.getRuleSeverity(rule),
          message: `Security rule violation: ${rule.name}`,
          details: { ruleId: rule.id, action },
          action: '',
        });
      }
    }

    return alerts;
  }

  private checkOutputSecurityRules(output: PluginOutput): AlertInfo[] {
    const alerts: AlertInfo[] = [];

    for (const rule of this.config?.rules || []) {
      if (!rule.enabled || rule.type !== 'output') continue;

      const matches = rule.conditions.some((condition) => {
        return this.evaluateOutputCondition(condition, output);
      });

      if (matches) {
        const action = this.getRuleAction(rule);
        alerts.push({
          type: 'security_rule',
          severity: this.getRuleSeverity(rule),
          message: `Output security rule violation: ${rule.name}`,
          details: { ruleId: rule.id, action },
          action: '',
        });
      }
    }

    return alerts;
  }

  private evaluateCondition(condition: RuleCondition, input: PluginInput): boolean {
    let value: any;

    switch (condition.field) {
      case 'content':
        value = input.content;
        break;
      case 'type':
        value = input.type;
        break;
      case 'userId':
        value = input.metadata.userId;
        break;
      case 'source':
        value = input.metadata.source;
        break;
      default: {
        const key = condition.field as keyof PluginInput['metadata'];
        value = input.metadata[key];
      }
    }

    if (!value) return false;

    const compareValue = condition.caseSensitive ? value : String(value).toLowerCase();
    const testValue = condition.caseSensitive
      ? condition.value
      : String(condition.value).toLowerCase();

    switch (condition.operator) {
      case 'contains':
        return compareValue.includes(testValue);
      case 'equals':
        return compareValue === testValue;
      case 'regex':
        return new RegExp(testValue).test(compareValue);
      case 'gt':
        return compareValue > testValue;
      case 'lt':
        return compareValue < testValue;
      default:
        return false;
    }
  }

  private evaluateOutputCondition(condition: RuleCondition, output: PluginOutput): boolean {
    let value: any;

    switch (condition.field) {
      case 'content':
        value = output.content;
        break;
      case 'model':
        value = output.metadata.model;
        break;
      case 'tokens':
        value = output.metadata.tokens;
        break;
      default: {
        const key = condition.field as keyof PluginOutput['metadata'];
        value = output.metadata[key];
      }
    }

    if (!value) return false;

    const compareValue = condition.caseSensitive ? value : String(value).toLowerCase();
    const testValue = condition.caseSensitive
      ? condition.value
      : String(condition.value).toLowerCase();

    switch (condition.operator) {
      case 'contains':
        return compareValue.includes(testValue);
      case 'equals':
        return compareValue === testValue;
      case 'regex':
        return new RegExp(testValue).test(compareValue);
      case 'gt':
        return compareValue > testValue;
      case 'lt':
        return compareValue < testValue;
      default:
        return false;
    }
  }

  private getRuleAction(rule: SecurityRule): string {
    return rule.actions.find((a) => a.type === 'block') ? 'block' : 'alert';
  }

  private getRuleSeverity(rule: SecurityRule): 'low' | 'medium' | 'high' | 'critical' {
    const blockAction = rule.actions.find((a) => a.type === 'block');
    if (blockAction) return 'critical';

    const alertAction = rule.actions.find((a) => a.type === 'alert');
    if (alertAction) return 'high';
    return 'medium';
  }

  private async analyzeWithFirewall(input: PluginInput): Promise<any> {
    if (!this.config) throw new Error('Plugin not initialized');
    const { endpoint, apiKey, mode, timeout, retryAttempts, retryDelay } = this.config;
    const response = await fetchWithRetry(
      `${endpoint}/api/firewall/analyze`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input.content,
          type: input.type,
          metadata: input.metadata,
          mode: mode,
        }),
      },
      { attempts: retryAttempts, delayMs: retryDelay, timeoutMs: timeout },
    );

    if (response.status !== 200) {
      throw new Error(`Firewall analysis failed: ${response.status}`);
    }

    return await response.json();
  }

  private async analyzeOutputWithFirewall(output: PluginOutput): Promise<any> {
    if (!this.config) throw new Error('Plugin not initialized');
    const { endpoint, apiKey, mode, timeout, retryAttempts, retryDelay } = this.config;
    const response = await fetchWithRetry(
      `${endpoint}/api/firewall/analyze-output`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          output: output.content,
          inputId: output.inputId,
          metadata: output.metadata,
          mode: mode,
        }),
      },
      { attempts: retryAttempts, delayMs: retryDelay, timeoutMs: timeout },
    );

    if (response.status !== 200) {
      throw new Error(`Output firewall analysis failed: ${response.status}`);
    }

    return await response.json();
  }

  private createOutput(
    input: PluginInput,
    content: string,
    alerts: AlertInfo[] = [],
    compliance: ComplianceInfo[] = [],
  ): PluginOutput {
    return {
      id: `output_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      inputId: input.id,
      content,
      metadata: {},
      blocked: false,
      sanitized: false,
      alerts,
      compliance,
    };
  }

  private createBlockedOutput(
    input: PluginInput,
    reason: string,
    alerts: AlertInfo[],
  ): PluginOutput {
    return {
      id: `blocked_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      inputId: input.id,
      content: '',
      metadata: {},
      blocked: true,
      reason,
      sanitized: false,
      alerts,
      compliance: [],
    };
  }
}

// Plugin Manager
export class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, AIFirewallPlugin> = new Map();
  private initialized = false;

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  async initialize(configs: PluginConfig[]): Promise<void> {
    if (this.initialized) return;

    for (const config of configs) {
      let plugin: AIFirewallPlugin;

      const framework = config.metadata?.framework || 'generic';

      switch (framework) {
        case 'langchain':
          plugin = new LangChainPlugin();
          break;
        default:
          throw new Error(
            `Unsupported framework: ${framework}. Only 'langchain' is currently supported.`,
          );
      }

      await plugin.initialize(config);
      this.plugins.set(config.id, plugin);
    }

    this.initialized = true;
    console.log('Plugin Manager initialized with plugins:', Array.from(this.plugins.keys()));
  }

  getPlugin(id: string): AIFirewallPlugin | undefined {
    return this.plugins.get(id);
  }

  async processInput(pluginId: string, input: PluginInput): Promise<PluginOutput> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    return plugin.processInput(input);
  }

  async processOutput(pluginId: string, output: PluginOutput): Promise<PluginOutput> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    return plugin.processOutput(output);
  }

  async healthCheck(): Promise<{ [plugin: string]: boolean }> {
    const results: { [plugin: string]: boolean } = {};

    for (const [id, plugin] of this.plugins) {
      results[id] = await plugin.healthCheck();
    }

    return results;
  }

  destroy(): void {
    this.plugins.clear();
    this.initialized = false;
  }
}
