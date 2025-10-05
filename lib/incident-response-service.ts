// SIGMACODE Incident Response Automation
// Automated Security Orchestration and Response (SOAR)

export interface IncidentRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'firewall_blocked' | 'high_threat_score' | 'multiple_violations' | 'custom';
    conditions: Record<string, any>;
    threshold?: number;
    timeWindow?: number; // minutes
  };
  actions: IncidentAction[];
  cooldown: number; // minutes between triggers
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface IncidentAction {
  type:
    | 'slack_notification'
    | 'teams_notification'
    | 'email'
    | 'api_call'
    | 'disable_api_key'
    | 'create_ticket'
    | 'log_only';
  config: Record<string, any>;
  delay?: number; // minutes to wait before action
}

export interface SecurityIncident {
  id: string;
  timestamp: Date;
  ruleId: string;
  ruleName: string;
  priority: string;
  triggerType: string;
  description: string;
  affectedResources: string[];
  status: 'new' | 'investigating' | 'contained' | 'resolved' | 'false_positive';
  actionsTaken: IncidentActionResult[];
  metadata: Record<string, any>;
}

export interface IncidentActionResult {
  actionType: string;
  timestamp: Date;
  success: boolean;
  result?: any;
  error?: string;
}

export class IncidentResponseService {
  private incidentRules: IncidentRule[] = [];
  private activeIncidents: SecurityIncident[] = [];
  private actionHistory: IncidentActionResult[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    this.incidentRules = [
      // Critical Security Incidents
      {
        id: 'critical_firewall_breach',
        name: 'Critical Firewall Breach',
        description: 'Multiple critical firewall violations detected',
        trigger: {
          type: 'firewall_blocked',
          conditions: { severity: 'critical' },
          threshold: 3,
          timeWindow: 5,
        },
        actions: [
          {
            type: 'slack_notification',
            config: {
              channel: '#security-incidents',
              priority: 'urgent',
              mentionTeam: true,
            },
          },
          {
            type: 'disable_api_key',
            config: { reason: 'Critical security violations detected' },
            delay: 1,
          },
          {
            type: 'create_ticket',
            config: {
              system: 'jira',
              project: 'SEC',
              priority: 'critical',
              assignee: 'security-team',
            },
            delay: 2,
          },
        ],
        cooldown: 10,
        enabled: true,
        priority: 'critical',
      },

      // High Threat Score
      {
        id: 'high_threat_score',
        name: 'High Threat Score Detected',
        description: 'AI agent showing suspicious behavior patterns',
        trigger: {
          type: 'high_threat_score',
          conditions: { score: { $gte: 0.8 } },
          threshold: 1,
          timeWindow: 1,
        },
        actions: [
          {
            type: 'teams_notification',
            config: {
              team: 'Security Operations',
              priority: 'high',
            },
          },
          {
            type: 'email',
            config: {
              to: 'security@company.com',
              subject: 'High Threat Score Alert',
              template: 'high_threat_alert',
            },
          },
        ],
        cooldown: 5,
        enabled: true,
        priority: 'high',
      },

      // Multiple Violations
      {
        id: 'multiple_violations',
        name: 'Multiple Security Violations',
        description: 'User showing pattern of security violations',
        trigger: {
          type: 'multiple_violations',
          conditions: { userId: 'same' },
          threshold: 5,
          timeWindow: 15,
        },
        actions: [
          {
            type: 'api_call',
            config: {
              endpoint: '/api/security/flag-user',
              method: 'POST',
              payload: { flagReason: 'Multiple violations' },
            },
          },
          {
            type: 'log_only',
            config: { level: 'warning' },
          },
        ],
        cooldown: 30,
        enabled: true,
        priority: 'medium',
      },
    ];
  }

  async processFirewallEvent(event: {
    type: string;
    userId?: string;
    apiKeyId?: string;
    severity: string;
    threatScore: number;
    blocked: boolean;
    metadata: Record<string, any>;
  }): Promise<void> {
    console.log('🔥 Processing firewall event for incident response...');

    // Check each incident rule
    for (const rule of this.incidentRules) {
      if (!rule.enabled) continue;

      const shouldTrigger = await this.evaluateTrigger(rule, event);

      if (shouldTrigger) {
        console.log(`🚨 Incident rule triggered: ${rule.name}`);

        const incident = await this.createIncident(rule, event);
        await this.executeIncidentActions(incident);
      }
    }
  }

  private async evaluateTrigger(rule: IncidentRule, event: any): Promise<boolean> {
    const { trigger } = rule;

    // Check cooldown
    const lastIncident = this.getLastIncidentForRule(rule.id);
    if (lastIncident && this.isWithinCooldown(lastIncident, rule.cooldown)) {
      return false;
    }

    switch (trigger.type) {
      case 'firewall_blocked':
        return this.evaluateFirewallBlockedTrigger(trigger, event);

      case 'high_threat_score':
        return this.evaluateThreatScoreTrigger(trigger, event);

      case 'multiple_violations':
        return this.evaluateMultipleViolationsTrigger(trigger, event);

      default:
        return false;
    }
  }

  private async evaluateFirewallBlockedTrigger(trigger: any, event: any): Promise<boolean> {
    if (!event.blocked) return false;

    const { conditions, threshold, timeWindow } = trigger;

    // Count recent violations matching conditions
    const recentIncidents = this.activeIncidents.filter((incident) => {
      const age = Date.now() - incident.timestamp.getTime();
      return age < (timeWindow || 15) * 60 * 1000;
    });

    const matchingIncidents = recentIncidents.filter((incident) => {
      if (conditions.severity && incident.priority !== conditions.severity) {
        return false;
      }
      if (conditions.userId && incident.affectedResources.includes(conditions.userId)) {
        return false;
      }
      return true;
    });

    return matchingIncidents.length >= threshold;
  }

  private async evaluateThreatScoreTrigger(trigger: any, event: any): Promise<boolean> {
    const { conditions, threshold } = trigger;

    if (conditions.score && typeof conditions.score === 'object') {
      const { $gte } = conditions.score;
      return event.threatScore >= $gte;
    }

    return event.threatScore >= (threshold || 0.8);
  }

  private async evaluateMultipleViolationsTrigger(trigger: any, event: any): Promise<boolean> {
    const { conditions, threshold, timeWindow } = trigger;

    const recentIncidents = this.activeIncidents.filter((incident) => {
      const age = Date.now() - incident.timestamp.getTime();
      return age < (timeWindow || 15) * 60 * 1000;
    });

    if (conditions.userId) {
      const userIncidents = recentIncidents.filter((incident) =>
        incident.affectedResources.includes(event.userId),
      );
      return userIncidents.length >= threshold;
    }

    return recentIncidents.length >= threshold;
  }

  private async createIncident(rule: IncidentRule, event: any): Promise<SecurityIncident> {
    const incident: SecurityIncident = {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ruleId: rule.id,
      ruleName: rule.name,
      priority: rule.priority,
      triggerType: rule.trigger.type,
      description: this.generateIncidentDescription(rule, event),
      affectedResources: this.extractAffectedResources(event),
      status: 'new',
      actionsTaken: [],
      metadata: {
        eventData: event,
        ruleConfig: rule,
      },
    };

    this.activeIncidents.push(incident);
    return incident;
  }

  private generateIncidentDescription(rule: IncidentRule, event: any): string {
    const descriptions: Record<string, string> = {
      firewall_blocked: `Multiple firewall violations detected with severity: ${event.severity}`,
      high_threat_score: `High threat score detected: ${(event.threatScore * 100).toFixed(1)}%`,
      multiple_violations: `User showing pattern of security violations`,
      custom: `Custom incident detected`,
    };

    return descriptions[rule.trigger.type] || 'Security incident detected';
  }

  private extractAffectedResources(event: any): string[] {
    const resources = [];

    if (event.userId) resources.push(`user:${event.userId}`);
    if (event.apiKeyId) resources.push(`api_key:${event.apiKeyId}`);
    if (event.metadata?.sessionId) resources.push(`session:${event.metadata.sessionId}`);

    return resources;
  }

  private async executeIncidentActions(incident: SecurityIncident): Promise<void> {
    const rule = this.incidentRules.find((r) => r.id === incident.ruleId);
    if (!rule) return;

    for (const action of rule.actions) {
      if (action.delay) {
        // Schedule delayed action
        setTimeout(
          () => {
            this.executeAction(action, incident);
          },
          action.delay * 60 * 1000,
        );
      } else {
        // Execute immediately
        await this.executeAction(action, incident);
      }
    }
  }

  private async executeAction(action: IncidentAction, incident: SecurityIncident): Promise<void> {
    const result: IncidentActionResult = {
      actionType: action.type,
      timestamp: new Date(),
      success: false,
    };

    try {
      switch (action.type) {
        case 'slack_notification':
          await this.sendSlackNotification(action.config, incident);
          result.success = true;
          break;

        case 'teams_notification':
          await this.sendTeamsNotification(action.config, incident);
          result.success = true;
          break;

        case 'email':
          await this.sendEmailNotification(action.config, incident);
          result.success = true;
          break;

        case 'api_call':
          await this.makeAPICall(action.config, incident);
          result.success = true;
          break;

        case 'disable_api_key':
          await this.disableAPIKey(action.config, incident);
          result.success = true;
          break;

        case 'create_ticket':
          const ticketResult = await this.createSupportTicket(action.config, incident);
          result.success = true;
          result.result = ticketResult;
          break;

        case 'log_only':
          console.log(`[INCIDENT] ${incident.description}`, incident);
          result.success = true;
          break;

        default:
          result.error = `Unknown action type: ${action.type}`;
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to execute incident action ${action.type}:`, error);
    }

    incident.actionsTaken.push(result);
    this.actionHistory.push(result);
  }

  private async sendSlackNotification(config: any, incident: SecurityIncident): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error('Slack webhook URL not configured');
    }

    const payload = {
      channel: config.channel || '#security-incidents',
      username: 'SIGMACODE Security',
      icon_emoji: ':warning:',
      attachments: [
        {
          color: this.getSlackColor(incident.priority),
          title: `🚨 Security Incident: ${incident.ruleName}`,
          fields: [
            {
              title: 'Priority',
              value: incident.priority.toUpperCase(),
              short: true,
            },
            {
              title: 'Incident ID',
              value: incident.id,
              short: true,
            },
            {
              title: 'Description',
              value: incident.description,
              short: false,
            },
            {
              title: 'Affected Resources',
              value: incident.affectedResources.join(', '),
              short: false,
            },
          ],
          footer: 'SIGMACODE Neural Firewall',
          ts: Math.floor(incident.timestamp.getTime() / 1000),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.status}`);
    }
  }

  private async sendTeamsNotification(config: any, incident: SecurityIncident): Promise<void> {
    const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error('Teams webhook URL not configured');
    }

    const payload = {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            type: 'AdaptiveCard',
            version: '1.2',
            body: [
              {
                type: 'TextBlock',
                text: `🚨 Security Incident: ${incident.ruleName}`,
                weight: 'Bolder',
                size: 'Medium',
              },
              {
                type: 'FactSet',
                facts: [
                  { title: 'Priority:', value: incident.priority },
                  { title: 'Incident ID:', value: incident.id },
                  { title: 'Description:', value: incident.description },
                ],
              },
            ],
          },
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Teams notification failed: ${response.status}`);
    }
  }

  private async sendEmailNotification(config: any, incident: SecurityIncident): Promise<void> {
    // Email implementation would use your email service
    console.log(`📧 Sending email notification: ${config.subject} to ${config.to}`);
  }

  private async makeAPICall(config: any, incident: SecurityIncident): Promise<void> {
    const response = await fetch(config.endpoint, {
      method: config.method || 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...config.payload, incident }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
  }

  private async disableAPIKey(config: any, incident: SecurityIncident): Promise<void> {
    // Implementation would disable the API key
    console.log(`🔑 Disabling API key due to incident: ${incident.id}`);
  }

  private async createSupportTicket(config: any, incident: SecurityIncident): Promise<any> {
    // Implementation would create ticket in your ticketing system
    console.log(`🎫 Creating support ticket in ${config.system}: ${incident.id}`);
    return { ticketId: `TICKET-${incident.id}`, status: 'created' };
  }

  private getSlackColor(priority: string): string {
    const colors = {
      low: 'good',
      medium: 'warning',
      high: 'danger',
      critical: 'danger',
    };
    return colors[priority as keyof typeof colors] || 'good';
  }

  private isWithinCooldown(lastIncident: SecurityIncident, cooldownMinutes: number): boolean {
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const timeSinceLast = Date.now() - lastIncident.timestamp.getTime();
    return timeSinceLast < cooldownMs;
  }

  private getLastIncidentForRule(ruleId: string): SecurityIncident | null {
    const ruleIncidents = this.activeIncidents
      .filter((incident) => incident.ruleId === ruleId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return ruleIncidents[0] || null;
  }

  getActiveIncidents(): SecurityIncident[] {
    return this.activeIncidents;
  }

  getIncidentRules(): IncidentRule[] {
    return this.incidentRules;
  }

  getActionHistory(): IncidentActionResult[] {
    return this.actionHistory;
  }
}

// Export singleton instance
export const incidentResponseService = new IncidentResponseService();
