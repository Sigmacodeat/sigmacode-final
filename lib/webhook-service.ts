// SIGMACODE Webhook & Alerts Service
// Comprehensive notification system for security events

import { getDb } from '@/database/db';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Alert Types
export type AlertType =
  | 'firewall_block'
  | 'firewall_threat'
  | 'firewall_error'
  | 'policy_violation'
  | 'rate_limit_exceeded'
  | 'suspicious_activity'
  | 'system_error'
  | 'config_change'
  | 'user_action'
  | 'security_incident';

// Alert Severity
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

// Webhook Configuration
export interface WebhookConfig {
  id: string;
  tenantId: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  enabled: boolean;
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
  rateLimit?: {
    maxPerMinute: number;
    maxPerHour: number;
  };
  filters?: {
    alertTypes?: AlertType[];
    minSeverity?: AlertSeverity;
    includeRawData?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Alert Message
export interface AlertMessage {
  id: string;
  timestamp: Date;
  tenantId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  data: Record<string, any>;
  source: string;
  tags?: string[];
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Webhook Delivery Status
export interface WebhookDelivery {
  id: string;
  webhookId: string;
  alertId: string;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attemptCount: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  responseStatus?: number;
  responseBody?: string;
  errorMessage?: string;
  deliveredAt?: Date;
}

// Rate Limiting
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  checkLimit(key: string, maxPerMinute: number, maxPerHour: number): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    const requests = this.requests.get(key) || [];

    // Clean old requests
    const recentRequests = requests.filter((time) => time > oneMinuteAgo);

    // Check per-minute limit
    const perMinuteCount = recentRequests.length;

    // Check per-hour limit
    const perHourCount = requests.filter((time) => time > oneHourAgo).length;

    if (perMinuteCount >= maxPerMinute || perHourCount >= maxPerHour) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    return true;
  }
}

export class WebhookService {
  private static instance: WebhookService;
  private rateLimiter = new RateLimiter();
  private deliveryQueue: WebhookDelivery[] = [];
  private isProcessing = false;

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  // Send alert to all configured webhooks
  async sendAlert(alert: AlertMessage): Promise<void> {
    // Get webhook configurations for tenant
    const webhooks = await this.getWebhooksForTenant(alert.tenantId);

    for (const webhook of webhooks) {
      if (!webhook.enabled) continue;

      // Check filters
      if (!this.shouldSendAlert(webhook, alert)) continue;

      // Check rate limits
      if (
        !this.rateLimiter.checkLimit(
          webhook.id,
          webhook.rateLimit?.maxPerMinute || 60,
          webhook.rateLimit?.maxPerHour || 1000,
        )
      ) {
        console.warn(`Rate limit exceeded for webhook ${webhook.id}`);
        continue;
      }

      // Queue webhook delivery
      const delivery: WebhookDelivery = {
        id: uuidv4(),
        webhookId: webhook.id,
        alertId: alert.id,
        status: 'pending',
        attemptCount: 0,
      };

      this.deliveryQueue.push(delivery);

      // Process queue if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }
    }
  }

  // Send test alert to webhook
  async sendTestAlert(webhookId: string): Promise<void> {
    const testAlert: AlertMessage = {
      id: `test_${Date.now()}`,
      timestamp: new Date(),
      tenantId: 'test',
      type: 'system_error',
      severity: 'medium',
      title: 'Test Alert',
      message: 'This is a test alert from SIGMACODE Firewall',
      data: { test: true },
      source: 'webhook_test',
      tags: ['test'],
    };

    await this.sendAlert(testAlert);
  }

  // Process webhook delivery queue
  private async processQueue() {
    if (this.isProcessing || this.deliveryQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.deliveryQueue.length > 0) {
      const delivery = this.deliveryQueue.shift()!;
      await this.deliverToWebhook(delivery);
    }

    this.isProcessing = false;
  }

  // Deliver single webhook
  private async deliverToWebhook(delivery: WebhookDelivery) {
    try {
      // Get webhook configuration
      const webhook = await this.getWebhookById(delivery.webhookId);
      if (!webhook) {
        console.error(`Webhook ${delivery.webhookId} not found`);
        return;
      }

      // Get alert
      const alert = await this.getAlertById(delivery.alertId);
      if (!alert) {
        console.error(`Alert ${delivery.alertId} not found`);
        return;
      }

      // Prepare payload
      const payload = this.formatAlertPayload(alert, webhook);

      // Send to webhook
      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SIGMACODE-Firewall/1.0',
          'X-Signature': this.generateSignature(payload),
          ...webhook.headers,
        },
        body: JSON.stringify(payload),
      });

      // Update delivery status
      delivery.status = response.ok ? 'delivered' : 'failed';
      delivery.responseStatus = response.status;
      delivery.lastAttemptAt = new Date();
      delivery.attemptCount++;

      if (response.ok) {
        delivery.deliveredAt = new Date();
      } else {
        delivery.responseBody = await response.text();
        delivery.errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        // Schedule retry if needed
        if (delivery.attemptCount < (webhook.retryPolicy?.maxRetries || 3)) {
          delivery.status = 'retrying';
          delivery.nextRetryAt = this.calculateNextRetryTime(delivery.attemptCount, webhook);
          this.deliveryQueue.push(delivery);
        }
      }

      // Store delivery status (in production, save to database)
      await this.storeDeliveryStatus(delivery);
    } catch (error) {
      console.error('Webhook delivery error:', error);

      delivery.status = 'failed';
      delivery.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      delivery.lastAttemptAt = new Date();
      delivery.attemptCount++;

      await this.storeDeliveryStatus(delivery);
    }
  }

  // Check if alert should be sent to webhook based on filters
  private shouldSendAlert(webhook: WebhookConfig, alert: AlertMessage): boolean {
    const filters = webhook.filters || {};

    // Check alert type filter
    if (filters.alertTypes && filters.alertTypes.length > 0) {
      if (!filters.alertTypes.includes(alert.type)) {
        return false;
      }
    }

    // Check severity filter
    if (filters.minSeverity) {
      const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
      const minLevel = severityLevels[filters.minSeverity];
      const alertLevel = severityLevels[alert.severity];

      if (alertLevel < minLevel) {
        return false;
      }
    }

    return true;
  }

  // Format alert payload for webhook
  private formatAlertPayload(alert: AlertMessage, webhook: WebhookConfig): any {
    const basePayload = {
      id: alert.id,
      timestamp: alert.timestamp.toISOString(),
      tenantId: alert.tenantId,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      source: alert.source,
      tags: alert.tags || [],
    };

    // Include raw data if configured
    if (webhook.filters?.includeRawData) {
      return {
        ...basePayload,
        data: alert.data,
        userId: alert.userId,
        sessionId: alert.sessionId,
        ipAddress: alert.ipAddress,
        userAgent: alert.userAgent,
      };
    }

    return basePayload;
  }

  // Generate signature for webhook payload
  private generateSignature(payload: any): string {
    // In production, use HMAC-SHA256 with secret key
    const payloadString = JSON.stringify(payload);
    const encoder = new TextEncoder();
    const data = encoder.encode(payloadString);

    // Simple hash for demo - use crypto.subtle in production
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return hash.toString(36);
  }

  // Calculate next retry time using exponential backoff
  private calculateNextRetryTime(attemptCount: number, webhook: WebhookConfig): Date {
    const retryPolicy = webhook.retryPolicy || { initialDelay: 1000, backoffMultiplier: 2 };
    const delay =
      retryPolicy.initialDelay * Math.pow(retryPolicy.backoffMultiplier, attemptCount - 1);
    return new Date(Date.now() + delay);
  }

  // Get webhooks for tenant
  async getWebhooksForTenant(tenantId: string): Promise<WebhookConfig[]> {
    // Implementation would query database
    return [];
  }

  // Get webhook by ID
  async getWebhookById(webhookId: string): Promise<WebhookConfig | null> {
    // Implementation would query database
    return null;
  }

  // Get alert by ID
  async getAlertById(alertId: string): Promise<AlertMessage | null> {
    // Implementation would query database
    return null;
  }

  // Store delivery status
  async storeDeliveryStatus(delivery: WebhookDelivery): Promise<void> {
    // Implementation would store in database
    console.log('Webhook delivery status:', delivery);
  }

  // Create webhook configuration
  async createWebhookConfig(config: Omit<WebhookConfig, 'id' | 'createdAt' | 'updatedAt'>) {
    return {
      ...config,
      id: `webhook_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Send system alert (internal use)
  async sendSystemAlert(
    tenantId: string,
    type: AlertType,
    severity: AlertSeverity,
    title: string,
    message: string,
    data: Record<string, any> = {},
  ) {
    const alert: AlertMessage = {
      id: uuidv4(),
      timestamp: new Date(),
      tenantId,
      type,
      severity,
      title,
      message,
      data,
      source: 'system',
    };

    await this.sendAlert(alert);
  }
}

export const webhookService = WebhookService.getInstance();

// Helper function to send alerts from anywhere in the system
export async function sendAlert(
  tenantId: string,
  type: AlertType,
  severity: AlertSeverity,
  title: string,
  message: string,
  data: Record<string, any> = {},
) {
  await webhookService.sendSystemAlert(tenantId, type, severity, title, message, data);
}
