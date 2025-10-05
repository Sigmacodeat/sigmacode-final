// Webhooks and Alert System for SIGMACODE AI Firewall
// Enterprise-grade alerting for Slack, Teams, and custom webhooks

import { NextResponse } from 'next/server';
import { z } from 'zod';

// Alert Types and Interfaces
export interface Alert {
  id: string;
  timestamp: string;
  type: 'security' | 'performance' | 'audit' | 'system' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data: Record<string, any>;
  channels: string[];
  metadata: {
    source: string;
    userId?: string;
    requestId?: string;
    correlationId?: string;
    priority: number;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: AlertCondition[];
  actions: AlertAction[];
  cooldown: number; // minutes
  lastTriggered?: string;
}

export interface AlertCondition {
  type: 'threshold' | 'pattern' | 'anomaly' | 'custom';
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'contains' | 'regex';
  value: any;
  timeframe?: number; // minutes
}

export interface AlertAction {
  type: 'webhook' | 'slack' | 'teams' | 'email' | 'sms';
  config: Record<string, any>;
  retryAttempts: number;
  retryDelay: number;
}

// Webhook Provider Interface
export interface WebhookProvider {
  name: string;
  type: 'slack' | 'teams' | 'generic' | 'custom';
  sendAlert(alert: Alert): Promise<boolean>;
  healthCheck(): Promise<boolean>;
}

// Slack Integration
export class SlackProvider implements WebhookProvider {
  name = 'Slack';
  type: 'slack' = 'slack';
  config: SlackConfig;

  constructor(config: SlackConfig) {
    this.config = config;
  }

  async sendAlert(alert: Alert): Promise<boolean> {
    try {
      const slackMessage = this.formatSlackMessage(alert);

      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage),
      });

      if (response.status !== 200) {
        throw new Error(`Slack webhook error: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to send alert to Slack:', error);
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: '🔍 SIGMACODE AI Firewall - Health Check',
          channel: this.config.channel,
        }),
      });

      return response.status === 200;
    } catch (error) {
      console.error('Slack health check failed:', error);
      return false;
    }
  }

  private formatSlackMessage(alert: Alert): SlackMessage {
    const color = this.getSeverityColor(alert.severity);
    const emoji = this.getSeverityEmoji(alert.severity);

    return {
      channel: this.config.channel,
      username: 'SIGMACODE AI Firewall',
      icon_emoji: ':shield:',
      attachments: [
        {
          color,
          title: `${emoji} ${alert.title}`,
          fields: [
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true,
            },
            {
              title: 'Type',
              value: alert.type.toUpperCase(),
              short: true,
            },
            {
              title: 'Source',
              value: alert.metadata.source,
              short: true,
            },
            {
              title: 'Time',
              value: new Date(alert.timestamp).toLocaleString(),
              short: true,
            },
            {
              title: 'Message',
              value: alert.message,
              short: false,
            },
          ],
          footer: 'SIGMACODE AI Firewall',
          ts: Math.floor(new Date(alert.timestamp).getTime() / 1000),
        },
      ],
    };
  }

  private getSeverityColor(severity: string): string {
    const colors = {
      low: 'good',
      medium: 'warning',
      high: 'danger',
      critical: 'danger',
    };
    return colors[severity as keyof typeof colors] || 'good';
  }

  private getSeverityEmoji(severity: string): string {
    const emojis = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🚨',
      critical: '🚨',
    };
    return emojis[severity as keyof typeof emojis] || 'ℹ️';
  }
}

// Microsoft Teams Integration
export class TeamsProvider implements WebhookProvider {
  name = 'Microsoft Teams';
  type: 'teams' = 'teams';
  config: TeamsConfig;

  constructor(config: TeamsConfig) {
    this.config = config;
  }

  async sendAlert(alert: Alert): Promise<boolean> {
    try {
      const teamsMessage = this.formatTeamsMessage(alert);

      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamsMessage),
      });

      if (response.status !== 200) {
        throw new Error(`Teams webhook error: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to send alert to Teams:', error);
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'message',
          attachments: [
            {
              contentType: 'application/vnd.microsoft.card.adaptive',
              content: {
                type: 'AdaptiveCard',
                body: [
                  {
                    type: 'TextBlock',
                    text: '🔍 SIGMACODE AI Firewall - Health Check',
                    weight: 'bolder',
                  },
                ],
              },
            },
          ],
        }),
      });

      return response.status === 200;
    } catch (error) {
      console.error('Teams health check failed:', error);
      return false;
    }
  }

  private formatTeamsMessage(alert: Alert): TeamsMessage {
    const color = this.getSeverityColor(alert.severity);

    return {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            type: 'AdaptiveCard',
            version: '1.4',
            msteams: {
              width: 'Full',
            },
            body: [
              {
                type: 'TextBlock',
                text: `🚨 ${alert.title}`,
                weight: 'bolder',
                size: 'medium',
                color,
              },
              {
                type: 'FactSet',
                facts: [
                  {
                    title: 'Severity:',
                    value: alert.severity.toUpperCase(),
                  },
                  {
                    title: 'Type:',
                    value: alert.type.toUpperCase(),
                  },
                  {
                    title: 'Source:',
                    value: alert.metadata.source,
                  },
                  {
                    title: 'Time:',
                    value: new Date(alert.timestamp).toLocaleString(),
                  },
                ],
              },
              {
                type: 'TextBlock',
                text: alert.message,
                wrap: true,
              },
            ],
          },
        },
      ],
    };
  }

  private getSeverityColor(
    severity: string,
  ): 'default' | 'accent' | 'good' | 'warning' | 'attention' {
    const colors = {
      low: 'default',
      medium: 'warning',
      high: 'attention',
      critical: 'attention',
    } as const;
    return colors[severity as keyof typeof colors] ?? 'default';
  }
}

// Generic Webhook Provider
export class GenericWebhookProvider implements WebhookProvider {
  name = 'Generic Webhook';
  type: 'generic' = 'generic';
  config: GenericWebhookConfig;

  constructor(config: GenericWebhookConfig) {
    this.config = config;
  }

  async sendAlert(alert: Alert): Promise<boolean> {
    try {
      const payload = this.formatPayload(alert);

      const response = await fetch(this.config.url, {
        method: this.config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify(payload),
      });

      if (!this.config.expectedStatusCodes.includes(response.status)) {
        throw new Error(`Unexpected status code: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to send alert to webhook:', error);
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.config.url, {
        method: 'GET',
        headers: this.config.headers,
      });

      return this.config.expectedStatusCodes.includes(response.status);
    } catch (error) {
      console.error('Webhook health check failed:', error);
      return false;
    }
  }

  private formatPayload(alert: Alert): Record<string, any> {
    const basePayload = {
      id: alert.id,
      timestamp: alert.timestamp,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      data: alert.data,
      metadata: alert.metadata,
    };

    if (this.config.customFormatter) {
      return this.config.customFormatter(basePayload, alert);
    }

    return basePayload;
  }
}

// Alert Manager - Central coordination
export class AlertManager {
  private static instance: AlertManager;
  private providers: Map<string, WebhookProvider> = new Map();
  private rules: AlertRule[] = [];
  private alertHistory: Alert[] = [];
  private cooldowns: Map<string, number> = new Map();
  private isInitialized = false;

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  async initialize(configs: WebhookProviderConfig[]): Promise<void> {
    if (this.isInitialized) return;

    for (const config of configs) {
      let provider: WebhookProvider;

      switch (config.type) {
        case 'slack':
          provider = new SlackProvider(config.config as SlackConfig);
          break;
        case 'teams':
          provider = new TeamsProvider(config.config as TeamsConfig);
          break;
        case 'generic':
          provider = new GenericWebhookProvider(config.config as GenericWebhookConfig);
          break;
        default:
          throw new Error(`Unsupported webhook provider: ${config.type}`);
      }

      this.providers.set(config.name, provider);
    }

    this.loadAlertRules();
    this.isInitialized = true;
    console.log('Alert Manager initialized with providers:', Array.from(this.providers.keys()));
  }

  async sendAlert(alert: Alert): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('Alert Manager not initialized');
      return false;
    }

    // Check rate limiting
    if (this.isRateLimited(alert)) {
      console.log('Alert rate limited:', alert.title);
      return false;
    }

    // Evaluate alert rules
    const matchingRules = this.evaluateRules(alert);
    if (matchingRules.length === 0) {
      console.log('No matching alert rules for:', alert.title);
      return false;
    }

    // Update cooldowns
    this.updateCooldowns(alert);

    // Store in history
    this.alertHistory.push(alert);

    // Keep only recent history
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-500);
    }

    // Send to all configured providers
    const results = await Promise.all(
      Array.from(this.providers.values()).map((provider) => provider.sendAlert(alert)),
    );

    const success = results.some((result) => result); // At least one provider should succeed

    if (success) {
      console.log('Alert sent successfully:', alert.title);
    } else {
      console.error('Failed to send alert to all providers:', alert.title);
    }

    return success;
  }

  private isRateLimited(alert: Alert): boolean {
    const key = `${alert.type}_${alert.severity}_${alert.metadata.source}`;
    const lastSent = this.cooldowns.get(key);

    if (!lastSent) return false;

    const cooldownMs = 60000; // 1 minute default cooldown
    return Date.now() - lastSent < cooldownMs;
  }

  private updateCooldowns(alert: Alert): void {
    const key = `${alert.type}_${alert.severity}_${alert.metadata.source}`;
    this.cooldowns.set(key, Date.now());
  }

  private evaluateRules(alert: Alert): AlertRule[] {
    return this.rules.filter((rule) => {
      if (!rule.enabled) return false;

      return rule.conditions.every((condition) => {
        return this.evaluateCondition(condition, alert);
      });
    });
  }

  private evaluateCondition(condition: AlertCondition, alert: Alert): boolean {
    const value = this.getFieldValue(condition.field, alert);

    switch (condition.operator) {
      case 'gt':
        return value > condition.value;
      case 'lt':
        return value < condition.value;
      case 'eq':
        return value === condition.value;
      case 'ne':
        return value !== condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'regex':
        return new RegExp(condition.value).test(String(value));
      default:
        return false;
    }
  }

  private getFieldValue(field: string, alert: Alert): any {
    switch (field) {
      case 'severity':
        return alert.severity;
      case 'type':
        return alert.type;
      case 'source':
        return alert.metadata.source;
      case 'userId':
        return alert.metadata.userId;
      default:
        // Support dot-notation like "metadata.source" or "data.someKey"
        if (field.includes('.')) {
          const [root, key] = field.split('.', 2);
          if (root === 'data') {
            return (alert.data as Record<string, any>)?.[key];
          }
          if (root === 'metadata') {
            return (alert.metadata as unknown as Record<string, any>)?.[key];
          }
        }

        // Fallback: try dynamic lookup on data first, then metadata
        const dataVal = (alert.data as Record<string, any>)?.[field];
        if (dataVal !== undefined) return dataVal;

        const metaVal = (alert.metadata as unknown as Record<string, any>)?.[field];
        return metaVal;
    }
  }

  private loadAlertRules(): void {
    // Load default alert rules
    this.rules = [
      {
        id: 'critical-security-alerts',
        name: 'Critical Security Alerts',
        description: 'Alert on all critical security events',
        enabled: true,
        conditions: [
          {
            type: 'threshold',
            field: 'severity',
            operator: 'eq',
            value: 'critical',
          },
        ],
        actions: [
          {
            type: 'slack',
            config: { channel: '#security-alerts' },
            retryAttempts: 3,
            retryDelay: 1000,
          },
          {
            type: 'teams',
            config: { channel: 'Security Team' },
            retryAttempts: 3,
            retryDelay: 1000,
          },
        ],
        cooldown: 5,
      },
      {
        id: 'high-threat-detection',
        name: 'High Threat Detection',
        description: 'Alert on high-severity threat detection',
        enabled: true,
        conditions: [
          {
            type: 'threshold',
            field: 'severity',
            operator: 'eq',
            value: 'high',
          },
          {
            type: 'threshold',
            field: 'type',
            operator: 'eq',
            value: 'security',
          },
        ],
        actions: [
          {
            type: 'slack',
            config: { channel: '#security-alerts' },
            retryAttempts: 3,
            retryDelay: 1000,
          },
        ],
        cooldown: 10,
      },
      {
        id: 'audit-policy-changes',
        name: 'Audit Policy Changes',
        description: 'Alert on policy and configuration changes',
        enabled: true,
        conditions: [
          {
            type: 'threshold',
            field: 'type',
            operator: 'eq',
            value: 'audit',
          },
          {
            type: 'pattern',
            field: 'message',
            operator: 'contains',
            value: 'policy',
          },
        ],
        actions: [
          {
            type: 'teams',
            config: { channel: 'Compliance Team' },
            retryAttempts: 3,
            retryDelay: 1000,
          },
        ],
        cooldown: 15,
      },
    ];
  }

  async healthCheck(): Promise<{ [provider: string]: boolean }> {
    const results: { [provider: string]: boolean } = {};

    for (const [name, provider] of this.providers) {
      results[name] = await provider.healthCheck();
    }

    return results;
  }

  getAlertHistory(limit: number = 100): Alert[] {
    return this.alertHistory.slice(-limit);
  }

  destroy(): void {
    this.providers.clear();
    this.rules = [];
    this.alertHistory = [];
    this.cooldowns.clear();
    this.isInitialized = false;
  }
}

// Configuration Types
export interface WebhookProviderConfig {
  name: string;
  type: 'slack' | 'teams' | 'generic';
  config: WebhookConfig;
}

export interface SlackConfig extends WebhookConfig {
  webhookUrl: string;
  channel: string;
  username?: string;
  iconEmoji?: string;
}

export interface TeamsConfig extends WebhookConfig {
  webhookUrl: string;
  channel?: string;
}

export interface GenericWebhookConfig extends WebhookConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT';
  headers?: Record<string, string>;
  expectedStatusCodes: number[];
  customFormatter?: (basePayload: any, alert: Alert) => Record<string, any>;
}

export interface WebhookConfig {
  enabled: boolean;
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
}

// Message Format Types
export interface SlackMessage {
  channel?: string;
  username?: string;
  icon_emoji?: string;
  text?: string;
  attachments?: SlackAttachment[];
}

export interface SlackAttachment {
  color?: string;
  title?: string;
  fields?: SlackField[];
  footer?: string;
  ts?: number;
}

export interface SlackField {
  title: string;
  value: string;
  short: boolean;
}

export interface TeamsMessage {
  type: string;
  attachments: TeamsAttachment[];
}

export interface TeamsAttachment {
  contentType: string;
  content: any;
}

// Utility functions for creating alerts
export const AlertFactory = {
  createSecurityAlert(
    title: string,
    message: string,
    data: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata: Partial<Alert['metadata']> = {},
  ): Alert {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'security',
      severity,
      title,
      message,
      data,
      channels: ['#security-alerts'],
      metadata: {
        source: 'sigmacode-ai-firewall',
        priority: severity === 'critical' ? 1 : severity === 'high' ? 2 : 3,
        ...metadata,
      },
    };
  },

  createThreatAlert(
    threatType: string,
    description: string,
    threatData: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high',
  ): Alert {
    return {
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'security',
      severity,
      title: `Threat Detected: ${threatType}`,
      message: description,
      data: threatData,
      channels: ['#security-alerts', '#threat-intel'],
      metadata: {
        source: 'sigmacode-ai-firewall',
        priority: 1,
        correlationId: threatData.correlationId,
      },
    };
  },

  createAuditAlert(
    action: string,
    resource: string,
    details: Record<string, any> = {},
    userId?: string,
  ): Alert {
    return {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'audit',
      severity: 'low',
      title: `Audit: ${action}`,
      message: `Action performed on ${resource}`,
      data: { action, resource, details },
      channels: ['#audit-log'],
      metadata: {
        source: 'sigmacode-ai-audit',
        priority: 4,
        userId,
      },
    };
  },

  createSystemAlert(
    component: string,
    status: 'up' | 'down' | 'degraded',
    message: string,
    metrics?: Record<string, any>,
  ): Alert {
    const severity = status === 'down' ? 'critical' : status === 'degraded' ? 'high' : 'low';

    return {
      id: `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'system',
      severity,
      title: `System ${status.toUpperCase()}: ${component}`,
      message,
      data: { component, status, metrics },
      channels: ['#system-alerts'],
      metadata: {
        source: 'sigmacode-ai-system',
        priority: severity === 'critical' ? 1 : 2,
      },
    };
  },
};
