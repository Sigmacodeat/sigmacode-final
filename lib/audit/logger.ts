export interface AuditEvent {
  id: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// In-memory store for demo purposes. Replace with database in production.
let AUDIT_EVENTS: AuditEvent[] = [];

export class AuditLogger {
  static log(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
    const auditEvent: AuditEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };

    AUDIT_EVENTS.push(auditEvent);

    // Keep only last 10,000 events in memory (for demo)
    if (AUDIT_EVENTS.length > 10000) {
      AUDIT_EVENTS = AUDIT_EVENTS.slice(-10000);
    }

    console.log(
      `[AUDIT] ${event.severity.toUpperCase()}: ${event.action} on ${event.resource}`,
      event,
    );
  }

  static getEvents(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    status?: AuditEvent['status'];
    severity?: AuditEvent['severity'];
    limit?: number;
    offset?: number;
  }): { events: AuditEvent[]; total: number } {
    let filtered = [...AUDIT_EVENTS];

    if (filters?.userId) {
      filtered = filtered.filter((e) => e.userId === filters.userId);
    }

    if (filters?.action) {
      filtered = filtered.filter((e) => e.action === filters.action);
    }

    if (filters?.resource) {
      filtered = filtered.filter((e) => e.resource === filters.resource);
    }

    if (filters?.status) {
      filtered = filtered.filter((e) => e.status === filters.status);
    }

    if (filters?.severity) {
      filtered = filtered.filter((e) => e.severity === filters.severity);
    }

    const total = filtered.length;

    if (filters?.offset) {
      filtered = filtered.slice(filters.offset);
    }

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return { events: filtered, total };
  }

  static clearEvents() {
    AUDIT_EVENTS = [];
  }
}

// Common audit actions
export const AuditActions = {
  // Authentication
  LOGIN: 'user.login',
  LOGOUT: 'user.logout',
  PASSWORD_CHANGE: 'user.password_change',
  MFA_ENABLED: 'user.mfa_enabled',
  MFA_DISABLED: 'user.mfa_disabled',

  // Data operations
  CREATE: 'data.create',
  READ: 'data.read',
  UPDATE: 'data.update',
  DELETE: 'data.delete',

  // Admin actions
  USER_CREATE: 'admin.user_create',
  USER_UPDATE: 'admin.user_update',
  USER_DELETE: 'admin.user_delete',
  SETTINGS_CHANGE: 'admin.settings_change',

  // Security
  PERMISSION_GRANTED: 'security.permission_granted',
  PERMISSION_REVOKED: 'security.permission_revoked',
  SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',
  BREACH_ATTEMPT: 'security.breach_attempt',

  // GDPR
  DATA_EXPORT: 'gdpr.data_export',
  DATA_DELETE: 'gdpr.data_delete',
  CONSENT_UPDATE: 'gdpr.consent_update',

  // API
  API_KEY_CREATED: 'api.key_created',
  API_KEY_REVOKED: 'api.key_revoked',
  RATE_LIMIT_HIT: 'api.rate_limit_hit',
} as const;
