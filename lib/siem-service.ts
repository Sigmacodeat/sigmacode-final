// SIGMACODE SIEM Integration Service
// Support for Splunk, Elastic, Datadog, and other SIEM systems

import { getDb } from '@/database/db';
import { eq } from 'drizzle-orm';

// SIEM Types
export type SIEMType = 'splunk' | 'elastic' | 'datadog' | 'webhook' | 'syslog';

// SIEM Configuration
export interface SIEMConfig {
  id: string;
  tenantId: string;
  name: string;
  type: SIEMType;
  enabled: boolean;
  config: {
    // Splunk
    splunkUrl?: string;
    splunkToken?: string;
    splunkIndex?: string;

    // Elastic
    elasticUrl?: string;
    elasticApiKey?: string;
    elasticIndex?: string;

    // Datadog
    datadogApiKey?: string;
    datadogSite?: string;
    datadogService?: string;
    datadogTags?: string[];

    // Webhook
    webhookUrl?: string;
    webhookHeaders?: Record<string, string>;
    webhookMethod?: 'POST' | 'PUT';

    // Syslog
    syslogHost?: string;
    syslogPort?: number;
    syslogProtocol?: 'tcp' | 'udp';
    syslogFacility?: string;

    // Common
    batchSize?: number;
    flushInterval?: number;
    retryAttempts?: number;
    rateLimit?: number; // events per minute
  };
  filters?: {
    minSeverity?: 'low' | 'medium' | 'high' | 'critical';
    eventTypes?: string[];
    includeRawLogs?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// SIEM Event
export interface SIEMEvent {
  id: string;
  timestamp: Date;
  tenantId: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  message: string;
  data: Record<string, any>;
  tags?: string[];
}

// Event Queue for batching
class SIEMEventQueue {
  private queue: SIEMEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private config: SIEMConfig;

  constructor(config: SIEMConfig) {
    this.config = config;
  }

  enqueue(event: SIEMEvent) {
    this.queue.push(event);

    // Check if we should flush
    if (this.shouldFlush()) {
      this.flush();
    } else if (!this.flushTimer) {
      // Start flush timer
      this.flushTimer = setTimeout(() => {
        this.flush();
      }, this.config.config.flushInterval || 30000);
    }
  }

  private shouldFlush(): boolean {
    const batchSize = this.config.config.batchSize || 100;
    const rateLimit = this.config.config.rateLimit || 1000;

    return this.queue.length >= batchSize;
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    try {
      await this.sendToSIEM(events);
    } catch (error) {
      console.error('SIEM flush error:', error);
      // Re-queue events for retry
      this.queue.unshift(...events);
    }
  }

  private async sendToSIEM(events: SIEMEvent[]) {
    const siemService = SIEMService.getInstance();

    const maxRetries = this.config.config.retryAttempts ?? 3;

    for (let i = 0; i < maxRetries; i++) {
      try {
        await siemService.sendEvents(this.config, events);
        return;
      } catch (error) {
        console.error(`SIEM send attempt ${i + 1} failed:`, error);
        if (i === maxRetries - 1) {
          throw error;
        }
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
}

export class SIEMService {
  private static instance: SIEMService;
  private queues: Map<string, SIEMEventQueue> = new Map();

  static getInstance(): SIEMService {
    if (!SIEMService.instance) {
      SIEMService.instance = new SIEMService();
    }
    return SIEMService.instance;
  }

  // Send event to SIEM
  async sendEvent(config: SIEMConfig, event: SIEMEvent) {
    // Check if event should be sent based on filters
    if (!this.shouldSendEvent(config, event)) {
      return;
    }

    // Get or create queue for this config
    const queueKey = `${config.tenantId}-${config.id}`;
    let queue = this.queues.get(queueKey);

    if (!queue) {
      queue = new SIEMEventQueue(config);
      this.queues.set(queueKey, queue);
    }

    queue.enqueue(event);
  }

  // Send multiple events to SIEM
  async sendEvents(config: SIEMConfig, events: SIEMEvent[]) {
    const filteredEvents = events.filter((event) => this.shouldSendEvent(config, event));

    if (filteredEvents.length === 0) {
      return;
    }

    switch (config.type) {
      case 'splunk':
        await this.sendToSplunk(config, filteredEvents);
        break;
      case 'elastic':
        await this.sendToElastic(config, filteredEvents);
        break;
      case 'datadog':
        await this.sendToDatadog(config, filteredEvents);
        break;
      case 'webhook':
        await this.sendToWebhook(config, filteredEvents);
        break;
      case 'syslog':
        await this.sendToSyslog(config, filteredEvents);
        break;
      default:
        throw new Error(`Unsupported SIEM type: ${config.type}`);
    }
  }

  // Check if event should be sent based on filters
  private shouldSendEvent(config: SIEMConfig, event: SIEMEvent): boolean {
    const filters = config.filters || {};

    // Check severity filter
    if (filters.minSeverity) {
      const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
      const minLevel = severityLevels[filters.minSeverity];
      const eventLevel = severityLevels[event.severity];

      if (eventLevel < minLevel) {
        return false;
      }
    }

    // Check event type filter
    if (filters.eventTypes && filters.eventTypes.length > 0) {
      if (!filters.eventTypes.includes(event.eventType)) {
        return false;
      }
    }

    return true;
  }

  // Send to Splunk
  private async sendToSplunk(config: SIEMConfig, events: SIEMEvent[]) {
    const splunkConfig = config.config;

    if (!splunkConfig.splunkUrl || !splunkConfig.splunkToken) {
      throw new Error('Splunk URL and token are required');
    }

    const response = await fetch(`${splunkConfig.splunkUrl}/services/collector`, {
      method: 'POST',
      headers: {
        Authorization: `Splunk ${splunkConfig.splunkToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        index: splunkConfig.splunkIndex || 'firewall',
        sourcetype: 'sigmacode_firewall',
        source: 'firewall',
        events: events.map((event) => ({
          time: Math.floor(event.timestamp.getTime() / 1000),
          event: event.message,
          fields: {
            id: event.id,
            tenantId: event.tenantId,
            eventType: event.eventType,
            severity: event.severity,
            source: event.source,
            tags: event.tags || [],
            ...event.data,
          },
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Splunk API error: ${response.status} ${response.statusText}`);
    }
  }

  // Send to Elastic
  private async sendToElastic(config: SIEMConfig, events: SIEMEvent[]) {
    const elasticConfig = config.config;

    if (!elasticConfig.elasticUrl || !elasticConfig.elasticApiKey) {
      throw new Error('Elastic URL and API key are required');
    }

    const response = await fetch(
      `${elasticConfig.elasticUrl}/${elasticConfig.elasticIndex || 'firewall'}/_bulk`,
      {
        method: 'POST',
        headers: {
          Authorization: `ApiKey ${elasticConfig.elasticApiKey}`,
          'Content-Type': 'application/x-ndjson',
        },
        body:
          events
            .map((event, index) => {
              const action = index % 2 === 0 ? 'create' : '';
              const doc = index % 2 === 1 ? event : { id: event.id };

              if (index % 2 === 0) {
                return JSON.stringify({
                  create: { _index: elasticConfig.elasticIndex || 'firewall' },
                });
              } else {
                return JSON.stringify({
                  '@timestamp': event.timestamp.toISOString(),
                  id: event.id,
                  tenantId: event.tenantId,
                  eventType: event.eventType,
                  severity: event.severity,
                  source: event.source,
                  message: event.message,
                  tags: event.tags || [],
                  ...event.data,
                });
              }
            })
            .join('\n') + '\n',
      },
    );

    if (!response.ok) {
      throw new Error(`Elastic API error: ${response.status} ${response.statusText}`);
    }
  }

  // Send to Datadog
  private async sendToDatadog(config: SIEMConfig, events: SIEMEvent[]) {
    const datadogConfig = config.config;

    if (!datadogConfig.datadogApiKey) {
      throw new Error('Datadog API key is required');
    }

    const logs = events.map((event) => ({
      message: event.message,
      timestamp: Math.floor(event.timestamp.getTime() / 1000),
      service: datadogConfig.datadogService || 'sigmacode-firewall',
      hostname: 'sigmacode-firewall',
      status: event.severity,
      tags: [
        `tenant:${event.tenantId}`,
        `event_type:${event.eventType}`,
        `source:${event.source}`,
        ...(event.tags || []),
        ...(datadogConfig.datadogTags || []),
      ],
      attributes: {
        id: event.id,
        ...event.data,
      },
    }));

    const response = await fetch(
      `https://http-intake.logs.${datadogConfig.datadogSite || 'datadoghq.com'}/api/v2/logs`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': datadogConfig.datadogApiKey,
        },
        body: JSON.stringify(logs),
      },
    );

    if (!response.ok) {
      throw new Error(`Datadog API error: ${response.status} ${response.statusText}`);
    }
  }

  // Send to Webhook
  private async sendToWebhook(config: SIEMConfig, events: SIEMEvent[]) {
    const webhookConfig = config.config;

    if (!webhookConfig.webhookUrl) {
      throw new Error('Webhook URL is required');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...webhookConfig.webhookHeaders,
    };

    const payload = {
      events,
      config: {
        tenantId: config.tenantId,
        siemType: config.type,
        timestamp: new Date().toISOString(),
      },
    };

    const response = await fetch(webhookConfig.webhookUrl, {
      method: webhookConfig.webhookMethod || 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
    }
  }

  // Send to Syslog
  private async sendToSyslog(config: SIEMConfig, events: SIEMEvent[]) {
    const syslogConfig = config.config;

    if (!syslogConfig.syslogHost || !syslogConfig.syslogPort) {
      throw new Error('Syslog host and port are required');
    }

    // For this implementation, we'll use a simple HTTP-based syslog
    // In production, you might want to use a proper syslog library
    const syslogEvents = events.map((event) => {
      const facility = syslogConfig.syslogFacility || 'security';
      const severityMap = { low: 7, medium: 6, high: 5, critical: 4 };
      const priority = (facility === 'security' ? 13 : 16) * 8 + severityMap[event.severity];

      return `<${priority}>${new Date().toISOString()} ${syslogConfig.syslogHost} sigmacode-firewall: ${event.message}`;
    });

    // This is a simplified implementation
    // In production, you'd use a proper syslog client
    console.log('Syslog events:', syslogEvents);
  }

  // Create SIEM configuration
  async createSIEMConfig(config: Omit<SIEMConfig, 'id' | 'createdAt' | 'updatedAt'>) {
    // Implementation would store in database
    // For now, return the config with generated ID
    return {
      ...config,
      id: `siem_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Get SIEM configurations for tenant
  async getSIEMConfigs(tenantId: string): Promise<SIEMConfig[]> {
    // Implementation would query database
    // For now, return empty array
    return [];
  }
}

export const siemService = SIEMService.getInstance();
