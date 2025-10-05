// SIEM Integration System for SIGMACODE AI Firewall
// Enterprise-grade security information and event management

import { NextResponse } from 'next/server';
import { z } from 'zod';

// Base SIEM Event Interface
export interface SIEMEvent {
  id: string;
  timestamp: string;
  source: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  message: string;
  data: Record<string, any>;
  metadata: {
    userId?: string;
    sessionId?: string;
    ipAddress: string;
    userAgent: string;
    endpoint: string;
    method: string;
    statusCode?: number;
    responseTime?: number;
  };
}

// SIEM Provider Interface
export interface SIEMProvider {
  name: string;
  type: 'splunk' | 'elastic' | 'datadog' | 'generic';
  config: SIEMConfig;
  sendEvent(event: SIEMEvent): Promise<boolean>;
  healthCheck(): Promise<boolean>;
}

// Base SIEM Configuration
export interface SIEMConfig {
  enabled: boolean;
  endpoint: string;
  apiKey?: string;
  token?: string;
  index?: string;
  source?: string;
  batchSize: number;
  flushInterval: number;
  retryAttempts: number;
  retryDelay: number;
}

// Splunk Integration
export class SplunkProvider implements SIEMProvider {
  name = 'Splunk';
  type: 'splunk' = 'splunk';
  config: SplunkConfig;
  private eventQueue: SIEMEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: SplunkConfig) {
    this.config = config;
    this.startBatchFlush();
  }

  async sendEvent(event: SIEMEvent): Promise<boolean> {
    if (!this.config.enabled) return true;

    this.eventQueue.push(event);

    if (this.eventQueue.length >= this.config.batchSize) {
      return this.flushEvents();
    }

    return true;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/services/collector/health`, {
        method: 'GET',
        headers: {
          Authorization: `Splunk ${this.config.token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.status === 200;
    } catch (error) {
      console.error('Splunk health check failed:', error);
      return false;
    }
  }

  private async flushEvents(): Promise<boolean> {
    if (this.eventQueue.length === 0) return true;

    const events = this.eventQueue.splice(0);

    try {
      const response = await fetch(`${this.config.endpoint}/services/collector`, {
        method: 'POST',
        headers: {
          Authorization: `Splunk ${this.config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: this.config.source || 'sigmacode-ai',
          sourcetype: 'json',
          index: this.config.index || 'main',
          event: events,
        }),
      });

      if (response.status !== 200) {
        throw new Error(`Splunk API error: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to send events to Splunk:', error);

      // Retry logic
      if (this.config.retryAttempts > 0) {
        await this.retrySendEvents(events);
      }

      return false;
    }
  }

  private async retrySendEvents(events: SIEMEvent[]): Promise<void> {
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay * attempt));
        await this.sendEventsDirectly(events);
        return;
      } catch (error) {
        console.error(`Splunk retry ${attempt} failed:`, error);
      }
    }

    console.error('All Splunk retry attempts failed');
  }

  private async sendEventsDirectly(events: SIEMEvent[]): Promise<void> {
    const response = await fetch(`${this.config.endpoint}/services/collector`, {
      method: 'POST',
      headers: {
        Authorization: `Splunk ${this.config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: this.config.source || 'sigmacode-ai',
        sourcetype: 'json',
        index: this.config.index || 'main',
        event: events,
      }),
    });

    if (response.status !== 200) {
      throw new Error(`Splunk API error: ${response.status}`);
    }
  }

  private startBatchFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval);
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushEvents(); // Flush remaining events
  }
}

// Elasticsearch Integration
export class ElasticProvider implements SIEMProvider {
  name = 'Elasticsearch';
  type: 'elastic' = 'elastic';
  config: ElasticConfig;
  private eventQueue: SIEMEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: ElasticConfig) {
    this.config = config;
    this.startBatchFlush();
  }

  async sendEvent(event: SIEMEvent): Promise<boolean> {
    if (!this.config.enabled) return true;

    this.eventQueue.push(event);

    if (this.eventQueue.length >= this.config.batchSize) {
      return this.flushEvents();
    }

    return true;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/_cluster/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const raw = await response.json().catch(() => ({}));
      const health = raw as Partial<{ status: string }>;
      const status = typeof health.status === 'string' ? health.status : 'yellow';
      return status !== 'red';
    } catch (error) {
      console.error('Elasticsearch health check failed:', error);
      return false;
    }
  }

  private async flushEvents(): Promise<boolean> {
    if (this.eventQueue.length === 0) return true;

    const events = this.eventQueue.splice(0);
    const bulkBody = this.formatBulkRequest(events);

    try {
      const response = await fetch(`${this.config.endpoint}/_bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-ndjson',
        },
        body: bulkBody,
      });

      if (response.status !== 200) {
        throw new Error(`Elasticsearch API error: ${response.status}`);
      }

      const rawResult = await response.json().catch(() => ({}));
      const result = rawResult as Partial<{ errors: boolean }>;

      if (result.errors === true) {
        console.error('Elasticsearch bulk operation had errors:', result);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to send events to Elasticsearch:', error);

      // Retry logic
      if (this.config.retryAttempts > 0) {
        await this.retrySendEvents(events);
      }

      return false;
    }
  }

  private formatBulkRequest(events: SIEMEvent[]): string {
    return (
      events
        .map((event) => {
          const indexName = this.config.index || 'sigmacode-security';
          const action = { index: { _index: indexName } };
          return `${JSON.stringify(action)}\n${JSON.stringify(event)}`;
        })
        .join('\n') + '\n'
    );
  }

  private async retrySendEvents(events: SIEMEvent[]): Promise<void> {
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay * attempt));
        await this.sendEventsDirectly(events);
        return;
      } catch (error) {
        console.error(`Elasticsearch retry ${attempt} failed:`, error);
      }
    }

    console.error('All Elasticsearch retry attempts failed');
  }

  private async sendEventsDirectly(events: SIEMEvent[]): Promise<void> {
    const bulkBody = this.formatBulkRequest(events);

    const response = await fetch(`${this.config.endpoint}/_bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-ndjson',
      },
      body: bulkBody,
    });

    if (response.status !== 200) {
      throw new Error(`Elasticsearch API error: ${response.status}`);
    }
  }

  private startBatchFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval);
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushEvents(); // Flush remaining events
  }
}

// Datadog Integration
export class DatadogProvider implements SIEMProvider {
  name = 'Datadog';
  type: 'datadog' = 'datadog';
  config: DatadogConfig;
  private eventQueue: SIEMEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: DatadogConfig) {
    this.config = config;
    this.startBatchFlush();
  }

  async sendEvent(event: SIEMEvent): Promise<boolean> {
    if (!this.config.enabled) return true;

    this.eventQueue.push(event);

    if (this.eventQueue.length >= this.config.batchSize) {
      return this.flushEvents();
    }

    return true;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/api/v1/validate`, {
        method: 'GET',
        headers: {
          'DD-API-KEY': this.config.apiKey,
          'Content-Type': 'application/json',
        },
      });

      return response.status === 200;
    } catch (error) {
      console.error('Datadog health check failed:', error);
      return false;
    }
  }

  private async flushEvents(): Promise<boolean> {
    if (this.eventQueue.length === 0) return true;

    const events = this.eventQueue.splice(0);

    try {
      // Convert SIEM events to Datadog logs
      const logs = events.map((event) => this.transformToDatadogLog(event));

      const response = await fetch(`${this.config.endpoint}/api/v2/logs`, {
        method: 'POST',
        headers: {
          'DD-API-KEY': this.config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logs),
      });

      if (response.status !== 202) {
        throw new Error(`Datadog API error: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to send events to Datadog:', error);

      // Retry logic
      if (this.config.retryAttempts > 0) {
        await this.retrySendEvents(events);
      }

      return false;
    }
  }

  private transformToDatadogLog(event: SIEMEvent): DatadogLog {
    return {
      message: event.message,
      timestamp: new Date(event.timestamp).getTime(),
      service: 'sigmacode-ai-firewall',
      status: this.mapSeverityToDatadog(event.severity),
      tags: [
        `source:${event.source}`,
        `event_type:${event.eventType}`,
        `category:${event.category}`,
        `severity:${event.severity}`,
        `user_id:${event.metadata.userId || 'unknown'}`,
        `endpoint:${event.metadata.endpoint}`,
      ],
      attributes: {
        ...event.data,
        ...event.metadata,
        event_id: event.id,
      },
    };
  }

  private mapSeverityToDatadog(severity: string): 'debug' | 'info' | 'warn' | 'error' {
    const mapping = {
      low: 'debug' as const,
      medium: 'info' as const,
      high: 'warn' as const,
      critical: 'error' as const,
    };

    return mapping[severity as keyof typeof mapping] || 'info';
  }

  private async retrySendEvents(events: SIEMEvent[]): Promise<void> {
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay * attempt));
        await this.sendEventsDirectly(events);
        return;
      } catch (error) {
        console.error(`Datadog retry ${attempt} failed:`, error);
      }
    }

    console.error('All Datadog retry attempts failed');
  }

  private async sendEventsDirectly(events: SIEMEvent[]): Promise<void> {
    const logs = events.map((event) => this.transformToDatadogLog(event));

    const response = await fetch(`${this.config.endpoint}/api/v2/logs`, {
      method: 'POST',
      headers: {
        'DD-API-KEY': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logs),
    });

    if (response.status !== 202) {
      throw new Error(`Datadog API error: ${response.status}`);
    }
  }

  private startBatchFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval);
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushEvents(); // Flush remaining events
  }
}

// SIEM Manager - Central coordination
export class SIEMManager {
  private static instance: SIEMManager;
  private providers: Map<string, SIEMProvider> = new Map();
  private isInitialized = false;

  static getInstance(): SIEMManager {
    if (!SIEMManager.instance) {
      SIEMManager.instance = new SIEMManager();
    }
    return SIEMManager.instance;
  }

  async initialize(configs: SIEMProviderConfig[]): Promise<void> {
    if (this.isInitialized) return;

    for (const config of configs) {
      let provider: SIEMProvider;

      switch (config.type) {
        case 'splunk':
          provider = new SplunkProvider(config.config as SplunkConfig);
          break;
        case 'elastic':
          provider = new ElasticProvider(config.config as ElasticConfig);
          break;
        case 'datadog':
          provider = new DatadogProvider(config.config as DatadogConfig);
          break;
        default:
          throw new Error(`Unsupported SIEM provider: ${config.type}`);
      }

      this.providers.set(config.name, provider);
    }

    this.isInitialized = true;
    console.log('SIEM Manager initialized with providers:', Array.from(this.providers.keys()));
  }

  async sendEvent(event: SIEMEvent): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('SIEM Manager not initialized');
      return false;
    }

    const results = await Promise.all(
      Array.from(this.providers.values()).map((provider) => provider.sendEvent(event)),
    );

    return results.every((result) => result);
  }

  async healthCheck(): Promise<{ [provider: string]: boolean }> {
    const results: { [provider: string]: boolean } = {};

    for (const [name, provider] of this.providers) {
      results[name] = await provider.healthCheck();
    }

    return results;
  }

  destroy(): void {
    for (const provider of this.providers.values()) {
      if ('destroy' in provider) {
        (provider as any).destroy();
      }
    }
    this.providers.clear();
    this.isInitialized = false;
  }
}

// Configuration Types
export interface SIEMProviderConfig {
  name: string;
  type: 'splunk' | 'elastic' | 'datadog';
  config: SIEMConfig;
}

export interface SplunkConfig extends SIEMConfig {
  token: string;
  index?: string;
  source?: string;
}

export interface ElasticConfig extends SIEMConfig {
  username?: string;
  password?: string;
  index?: string;
}

export interface DatadogConfig extends SIEMConfig {
  apiKey: string;
  site?: string; // datadoghq.com, datadoghq.eu, etc.
}

export interface DatadogLog {
  message: string;
  timestamp: number;
  service: string;
  status: 'debug' | 'info' | 'warn' | 'error';
  tags: string[];
  attributes: Record<string, any>;
}

// Utility functions for creating SIEM events
export const SIEMEventFactory = {
  createSecurityEvent(
    eventType: string,
    message: string,
    data: Record<string, any> = {},
    metadata: Partial<SIEMEvent['metadata']> = {},
  ): SIEMEvent {
    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      source: 'sigmacode-ai-firewall',
      eventType,
      severity: 'medium',
      category: 'security',
      message,
      data,
      metadata: {
        ipAddress: metadata.ipAddress || 'unknown',
        userAgent: metadata.userAgent || '',
        endpoint: metadata.endpoint || '',
        method: metadata.method || '',
        ...metadata,
      },
    };
  },

  createAuditEvent(
    action: string,
    resource: string,
    details: Record<string, any> = {},
    userId?: string,
  ): SIEMEvent {
    return {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      source: 'sigmacode-ai-audit',
      eventType: 'audit',
      severity: 'low',
      category: 'audit',
      message: `Audit: ${action} on ${resource}`,
      data: { action, resource, details },
      metadata: {
        userId,
        ipAddress: 'system',
        userAgent: 'system',
        endpoint: '/api/audit',
        method: 'POST',
      },
    };
  },

  createThreatEvent(
    threatType: string,
    description: string,
    threatData: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high',
  ): SIEMEvent {
    return {
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      source: 'sigmacode-ai-firewall',
      eventType: 'threat_detected',
      severity,
      category: 'threat',
      message: `Threat detected: ${description}`,
      data: { threatType, threatData },
      metadata: {
        ipAddress: threatData.ipAddress || 'unknown',
        userAgent: threatData.userAgent || '',
        endpoint: threatData.endpoint || '',
        method: threatData.method || '',
      },
    };
  },
};
