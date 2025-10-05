// Compliance & Audit System for SIGMACODE AI Firewall
// SOC2, ISO27001, GDPR compliance with comprehensive audit trails

import { NextResponse } from 'next/server';
import { z } from 'zod';

// Audit Trail System
export class AuditService {
  private static instance: AuditService;
  private auditLog: AuditEvent[] = [];
  private immutable = true;

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  async logEvent(event: CreateAuditEvent): Promise<void> {
    const auditEvent: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      eventType: event.eventType,
      category: event.category,
      severity: event.severity,
      userId: event.userId,
      tenantId: event.tenantId,
      resource: event.resource,
      action: event.action,
      result: event.result,
      details: event.details || {},
      metadata: {
        ipAddress: event.ipAddress || 'unknown',
        userAgent: event.userAgent || 'system',
        sessionId: event.sessionId,
        requestId: event.requestId,
        correlationId: event.correlationId,
        source: event.source || 'sigmacode-ai',
        ...event.metadata,
      },
      compliance: event.compliance || [],
      retention: event.retention || '7years',
      immutable: true,
      hash: this.calculateHash(event),
    };

    this.auditLog.push(auditEvent);

    // Keep only recent events in memory (in production, use external storage)
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-5000);
    }

    // Send to SIEM if configured
    if (event.sendToSIEM !== false) {
      await this.sendToSIEM(auditEvent);
    }

    // Trigger alerts for critical events
    if (event.severity === 'critical') {
      await this.triggerAlert(auditEvent);
    }
  }

  async queryAuditLog(query: AuditQuery): Promise<AuditEvent[]> {
    let results = [...this.auditLog];

    // Apply filters
    if (query.userId) {
      results = results.filter((e) => e.userId === query.userId);
    }

    if (query.tenantId) {
      results = results.filter((e) => e.tenantId === query.tenantId);
    }

    if (query.eventType) {
      results = results.filter((e) => e.eventType === query.eventType);
    }

    if (query.category) {
      results = results.filter((e) => e.category === query.category);
    }

    if (query.severity) {
      results = results.filter((e) => e.severity === query.severity);
    }

    const resource = query.resource;
    if (resource) {
      results = results.filter((e) => e.resource.includes(resource));
    }

    if (query.startDate) {
      const startDate = new Date(query.startDate!);
      results = results.filter((e) => new Date(e.timestamp) >= startDate);
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate!);
      results = results.filter((e) => new Date(e.timestamp) <= endDate);
    }

    // Apply sorting
    results.sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();
      return query.sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
    });

    // Apply pagination
    const start = query.offset || 0;
    const limit = query.limit || 100;
    return results.slice(start, start + limit);
  }

  async getAuditSummary(timeRange: string): Promise<AuditSummary> {
    const endDate = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '1h':
        startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
    }

    const relevantEvents = this.auditLog.filter(
      (e) => new Date(e.timestamp) >= startDate && new Date(e.timestamp) <= endDate,
    );

    const summary: AuditSummary = {
      timeRange,
      totalEvents: relevantEvents.length,
      eventsByCategory: {},
      eventsBySeverity: {},
      eventsByUser: {},
      eventsByResource: {},
      complianceViolations: 0,
      securityIncidents: 0,
    };

    for (const event of relevantEvents) {
      // Count by category
      summary.eventsByCategory[event.category] =
        (summary.eventsByCategory[event.category] || 0) + 1;

      // Count by severity
      summary.eventsBySeverity[event.severity] =
        (summary.eventsBySeverity[event.severity] || 0) + 1;

      // Count by user
      if (event.userId) {
        summary.eventsByUser[event.userId] = (summary.eventsByUser[event.userId] || 0) + 1;
      }

      // Count by resource
      summary.eventsByResource[event.resource] =
        (summary.eventsByResource[event.resource] || 0) + 1;

      // Count compliance violations
      if (event.compliance.some((c) => c.status === 'violation')) {
        summary.complianceViolations++;
      }

      // Count security incidents
      if (event.severity === 'critical' && event.category === 'security') {
        summary.securityIncidents++;
      }
    }

    return summary;
  }

  private calculateHash(event: CreateAuditEvent): string {
    const data = JSON.stringify({
      timestamp: new Date().toISOString(),
      eventType: event.eventType,
      userId: event.userId,
      resource: event.resource,
      action: event.action,
      details: event.details,
    });

    // In production, use proper cryptographic hash
    return Buffer.from(data).toString('base64');
  }

  private async sendToSIEM(event: AuditEvent): Promise<void> {
    try {
      // This would integrate with the SIEM system
      console.log('Sending audit event to SIEM:', event.id);
    } catch (error) {
      console.error('Failed to send audit event to SIEM:', error);
    }
  }

  private async triggerAlert(event: AuditEvent): Promise<void> {
    try {
      // This would integrate with the alert system
      console.log('Triggering critical event alert:', event.id);
    } catch (error) {
      console.error('Failed to trigger alert:', error);
    }
  }
}

// Compliance Management System
export class ComplianceService {
  private static instance: ComplianceService;
  private frameworks: Map<string, ComplianceFramework> = new Map();
  private assessments: Map<string, ComplianceAssessment> = new Map();
  private evidence: Map<string, ComplianceEvidence[]> = new Map();

  static getInstance(): ComplianceService {
    if (!ComplianceService.instance) {
      ComplianceService.instance = new ComplianceService();
    }
    return ComplianceService.instance;
  }

  async initialize(): Promise<void> {
    await this.loadComplianceFrameworks();
    console.log('Compliance Service initialized');
  }

  async checkCompliance(tenantId: string, frameworkId: string): Promise<ComplianceCheck> {
    const framework = this.frameworks.get(frameworkId);
    if (!framework) {
      throw new Error(`Compliance framework not found: ${frameworkId}`);
    }

    const assessmentId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const assessment: ComplianceAssessment = {
      id: assessmentId,
      tenantId,
      frameworkId,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      controls: [],
    };

    // Check each control
    for (const control of framework.controls) {
      const controlResult = await this.checkControl(tenantId, control);
      assessment.controls.push(controlResult);
    }

    assessment.status = 'completed';
    assessment.completedAt = new Date().toISOString();
    assessment.score = this.calculateScore(assessment.controls);

    this.assessments.set(assessmentId, assessment);

    return {
      frameworkId,
      assessmentId,
      score: assessment.score,
      status: assessment.status,
      findings: assessment.controls.filter((c) => !c.compliant),
      recommendations: this.generateRecommendations(assessment.controls),
      nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
    };
  }

  async getEvidence(tenantId: string, controlId: string): Promise<ComplianceEvidence[]> {
    const tenantEvidence = this.evidence.get(tenantId) || [];
    return tenantEvidence.filter((e) => e.controlId === controlId);
  }

  async addEvidence(tenantId: string, evidence: CreateEvidence): Promise<ComplianceEvidence> {
    const evidenceId = `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const complianceEvidence: ComplianceEvidence = {
      id: evidenceId,
      tenantId,
      controlId: evidence.controlId,
      type: evidence.type,
      title: evidence.title,
      description: evidence.description,
      location: evidence.location,
      createdAt: new Date().toISOString(),
      createdBy: evidence.createdBy,
      tags: evidence.tags || [],
      metadata: evidence.metadata || {},
    };

    const tenantEvidence = this.evidence.get(tenantId) || [];
    tenantEvidence.push(complianceEvidence);
    this.evidence.set(tenantId, tenantEvidence);

    return complianceEvidence;
  }

  async generateReport(tenantId: string, frameworkId: string): Promise<ComplianceReport> {
    const framework = this.frameworks.get(frameworkId);
    if (!framework) {
      throw new Error(`Compliance framework not found: ${frameworkId}`);
    }

    const assessments = Array.from(this.assessments.values()).filter(
      (a) => a.tenantId === tenantId && a.frameworkId === frameworkId,
    );

    const latestAssessment = assessments.sort(
      (a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime(),
    )[0];

    if (!latestAssessment) {
      throw new Error('No assessment found for the specified framework');
    }

    const report: ComplianceReport = {
      tenantId,
      frameworkId,
      frameworkName: framework.name,
      assessmentId: latestAssessment.id,
      generatedAt: new Date().toISOString(),
      score: latestAssessment.score ?? this.calculateScore(latestAssessment.controls),
      status: latestAssessment.status,
      controls: latestAssessment.controls,
      summary: this.generateComplianceSummary(latestAssessment.controls),
      recommendations: this.generateRecommendations(latestAssessment.controls),
      evidence: await this.getEvidence(tenantId, 'all'),
    };

    return report;
  }

  private async checkControl(tenantId: string, control: ComplianceControl): Promise<ControlResult> {
    // This would implement actual control checking logic
    // For now, we'll simulate based on control type
    const compliant = Math.random() > 0.3; // 70% compliance rate for demo

    return {
      controlId: control.id,
      title: control.title,
      compliant,
      lastChecked: new Date().toISOString(),
      findings: compliant
        ? []
        : [
            {
              severity: 'medium',
              description: `Control ${control.id} not fully compliant`,
              recommendation: `Implement ${control.title}`,
            },
          ],
      evidence: [],
    };
  }

  private calculateScore(controls: ControlResult[]): number {
    if (controls.length === 0) return 0;

    const compliantControls = controls.filter((c) => c.compliant).length;
    return Math.round((compliantControls / controls.length) * 100);
  }

  private generateRecommendations(controls: ControlResult[]): string[] {
    const recommendations: string[] = [];

    for (const control of controls) {
      if (!control.compliant) {
        recommendations.push(...control.findings.map((f) => f.recommendation));
      }
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  private generateComplianceSummary(controls: ControlResult[]): ComplianceSummary {
    const total = controls.length;
    const compliant = controls.filter((c) => c.compliant).length;
    const nonCompliant = total - compliant;

    return {
      totalControls: total,
      compliantControls: compliant,
      nonCompliantControls: nonCompliant,
      compliancePercentage: Math.round((compliant / total) * 100),
      criticalFindings: controls.filter((c) => c.findings.some((f) => f.severity === 'critical'))
        .length,
      highFindings: controls.filter((c) => c.findings.some((f) => f.severity === 'high')).length,
      mediumFindings: controls.filter((c) => c.findings.some((f) => f.severity === 'medium'))
        .length,
    };
  }

  private async loadComplianceFrameworks(): Promise<void> {
    // SOC2 Framework
    const soc2Framework: ComplianceFramework = {
      id: 'soc2',
      name: 'SOC 2 Type II',
      version: '2017',
      description: 'System and Organization Controls 2',
      categories: [
        'Security',
        'Availability',
        'Processing Integrity',
        'Confidentiality',
        'Privacy',
      ],
      controls: [
        {
          id: 'CC1.1',
          category: 'Security',
          title: 'Access Control Policy',
          description: 'The entity has defined and documented its access control policy.',
          criteria:
            'The entity has a defined and documented access control policy that includes the identification of users and their access privileges.',
        },
        {
          id: 'CC2.1',
          category: 'Security',
          title: 'Firewall Configuration',
          description: 'The entity uses firewalls to protect its systems.',
          criteria: 'Firewalls are configured to protect the system from unauthorized access.',
        },
        {
          id: 'A1.1',
          category: 'Availability',
          title: 'System Availability',
          description: 'The entity maintains the availability of its systems.',
          criteria: 'Systems are monitored for availability and performance.',
        },
      ],
    };

    // ISO 27001 Framework
    const iso27001Framework: ComplianceFramework = {
      id: 'iso27001',
      name: 'ISO/IEC 27001',
      version: '2022',
      description: 'Information Security Management Systems',
      categories: [
        'Information Security Policies',
        'Organization of Information Security',
        'Asset Management',
      ],
      controls: [
        {
          id: 'A.5.1.1',
          category: 'Information Security Policies',
          title: 'Policies for Information Security',
          description: 'A set of policies for information security shall be defined.',
          criteria: 'Information security policies are established and reviewed regularly.',
        },
        {
          id: 'A.9.1.1',
          category: 'Access Control',
          title: 'Access Control Policy',
          description: 'An access control policy shall be established.',
          criteria: 'Access control policies are documented and implemented.',
        },
      ],
    };

    // GDPR Framework
    const gdprFramework: ComplianceFramework = {
      id: 'gdpr',
      name: 'GDPR',
      version: '2018',
      description: 'General Data Protection Regulation',
      categories: ['Data Protection Principles', 'Lawful Basis', 'Rights of Data Subjects'],
      controls: [
        {
          id: 'Art.5',
          category: 'Data Protection Principles',
          title: 'Principles Relating to Processing of Personal Data',
          description:
            'Personal data shall be processed lawfully, fairly and in a transparent manner.',
          criteria: 'Data processing activities comply with GDPR principles.',
        },
        {
          id: 'Art.25',
          category: 'Data Protection by Design',
          title: 'Data Protection by Design and by Default',
          description: 'Data protection by design and by default shall be implemented.',
          criteria: 'Privacy by design principles are applied to system architecture.',
        },
      ],
    };

    this.frameworks.set('soc2', soc2Framework);
    this.frameworks.set('iso27001', iso27001Framework);
    this.frameworks.set('gdpr', gdprFramework);
  }
}

// Policy Management System
export class PolicyService {
  private static instance: PolicyService;
  private policies: Map<string, SecurityPolicy> = new Map();
  private policyHistory: Map<string, PolicyHistory[]> = new Map();

  static getInstance(): PolicyService {
    if (!PolicyService.instance) {
      PolicyService.instance = new PolicyService();
    }
    return PolicyService.instance;
  }

  async createPolicy(policyData: CreatePolicyRequest): Promise<SecurityPolicy> {
    const policyId = `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const policy: SecurityPolicy = {
      id: policyId,
      name: policyData.name,
      description: policyData.description,
      type: policyData.type,
      category: policyData.category,
      content: policyData.content,
      rules: policyData.rules,
      status: policyData.status || 'draft',
      version: 1,
      createdBy: policyData.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      effectiveDate: policyData.effectiveDate,
      reviewDate: policyData.reviewDate,
      approvalWorkflow: policyData.approvalWorkflow || [],
      compliance: policyData.compliance || [],
      metadata: policyData.metadata || {},
    };

    this.policies.set(policyId, policy);
    this.initializePolicyHistory(policyId);

    // Log policy creation
    await AuditService.getInstance().logEvent({
      eventType: 'policy_created',
      category: 'governance',
      severity: 'medium',
      userId: policyData.createdBy,
      resource: policyId,
      action: 'create',
      result: 'success',
      details: { policyName: policyData.name, policyType: policyData.type },
    });

    return policy;
  }

  async updatePolicy(
    policyId: string,
    updates: UpdatePolicyRequest,
    userId: string,
  ): Promise<SecurityPolicy | null> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      return null;
    }

    const oldVersion = { ...policy };

    const updatedPolicy = {
      ...policy,
      ...updates,
      version: policy.version + 1,
      updatedAt: new Date().toISOString(),
    };

    this.policies.set(policyId, updatedPolicy);
    this.addPolicyVersion(policyId, oldVersion, updatedPolicy, userId);

    // Log policy update
    await AuditService.getInstance().logEvent({
      eventType: 'policy_updated',
      category: 'governance',
      severity: 'medium',
      userId,
      resource: policyId,
      action: 'update',
      result: 'success',
      details: { policyName: policy.name, changes: Object.keys(updates) },
    });

    return updatedPolicy;
  }

  async approvePolicy(
    policyId: string,
    approverId: string,
    approval: PolicyApproval,
  ): Promise<boolean> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      return false;
    }

    if (policy.status !== 'pending_approval') {
      return false;
    }

    const workflow = policy.approvalWorkflow;
    const currentStep = workflow.find((step) => step.status === 'pending');

    if (!currentStep) {
      return false;
    }

    currentStep.status = approval.approved ? 'approved' : 'rejected';
    currentStep.approvedBy = approverId;
    currentStep.approvedAt = new Date().toISOString();
    currentStep.comments = approval.comments;

    // Check if all approvals are complete
    const allApproved = workflow.every((step) => step.status === 'approved');

    if (allApproved) {
      policy.status = 'active';
      policy.effectiveDate = new Date().toISOString();
    } else if (workflow.some((step) => step.status === 'rejected')) {
      policy.status = 'draft';
    }

    // Log approval
    await AuditService.getInstance().logEvent({
      eventType: 'policy_approved',
      category: 'governance',
      severity: 'medium',
      userId: approverId,
      resource: policyId,
      action: 'approve',
      result: approval.approved ? 'success' : 'failure',
      details: {
        policyName: policy.name,
        approved: approval.approved,
        comments: approval.comments,
      },
    });

    return true;
  }

  async getPolicy(policyId: string): Promise<SecurityPolicy | null> {
    return this.policies.get(policyId) || null;
  }

  async getPoliciesByType(type: string): Promise<SecurityPolicy[]> {
    return Array.from(this.policies.values()).filter((p) => p.type === type);
  }

  async getPolicyHistory(policyId: string): Promise<PolicyHistory[]> {
    return this.policyHistory.get(policyId) || [];
  }

  private initializePolicyHistory(policyId: string): void {
    this.policyHistory.set(policyId, []);
  }

  private addPolicyVersion(
    policyId: string,
    oldVersion: SecurityPolicy,
    newVersion: SecurityPolicy,
    userId: string,
  ): void {
    const history = this.policyHistory.get(policyId) || [];
    history.push({
      version: oldVersion.version,
      changedBy: userId,
      changedAt: new Date().toISOString(),
      changes: this.diffPolicies(oldVersion, newVersion),
    });
    this.policyHistory.set(policyId, history);
  }

  private diffPolicies(oldPolicy: SecurityPolicy, newPolicy: SecurityPolicy): PolicyChange[] {
    const changes: PolicyChange[] = [];

    // Compare basic fields
    const fields = ['name', 'description', 'content', 'status'] as const;

    for (const field of fields) {
      if (oldPolicy[field] !== newPolicy[field]) {
        changes.push({
          field,
          oldValue: oldPolicy[field],
          newValue: newPolicy[field],
        });
      }
    }

    return changes;
  }
}

// Types and Interfaces
export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: string;
  category: 'security' | 'governance' | 'operations' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  tenantId?: string;
  resource: string;
  action: string;
  result: 'success' | 'failure' | 'error';
  details: Record<string, any>;
  metadata: {
    ipAddress: string;
    userAgent: string;
    sessionId?: string;
    requestId?: string;
    correlationId?: string;
    source: string;
    [key: string]: any;
  };
  compliance: ComplianceInfo[];
  retention: string;
  immutable: boolean;
  hash: string;
}

export interface CreateAuditEvent {
  eventType: string;
  category: 'security' | 'governance' | 'operations' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  tenantId?: string;
  resource: string;
  action: string;
  result: 'success' | 'failure' | 'error';
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  correlationId?: string;
  source?: string;
  sendToSIEM?: boolean;
  compliance?: ComplianceInfo[];
  retention?: string;
  metadata?: Record<string, any>;
}

export interface AuditQuery {
  userId?: string;
  tenantId?: string;
  eventType?: string;
  category?: string;
  severity?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditSummary {
  timeRange: string;
  totalEvents: number;
  eventsByCategory: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  eventsByUser: Record<string, number>;
  eventsByResource: Record<string, number>;
  complianceViolations: number;
  securityIncidents: number;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  categories: string[];
  controls: ComplianceControl[];
}

export interface ComplianceControl {
  id: string;
  category: string;
  title: string;
  description: string;
  criteria: string;
}

export interface ComplianceAssessment {
  id: string;
  tenantId: string;
  frameworkId: string;
  status: 'in_progress' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  score?: number;
  controls: ControlResult[];
}

export interface ControlResult {
  controlId: string;
  title: string;
  compliant: boolean;
  lastChecked: string;
  findings: ComplianceFinding[];
  evidence: string[];
}

export interface ComplianceFinding {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

export interface ComplianceEvidence {
  id: string;
  tenantId: string;
  controlId: string;
  type: 'document' | 'screenshot' | 'log' | 'configuration' | 'other';
  title: string;
  description: string;
  location: string;
  createdAt: string;
  createdBy: string;
  tags: string[];
  metadata: Record<string, any>;
}

export interface CreateEvidence {
  controlId: string;
  type: 'document' | 'screenshot' | 'log' | 'configuration' | 'other';
  title: string;
  description: string;
  location: string;
  createdBy: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ComplianceCheck {
  frameworkId: string;
  assessmentId: string;
  score: number;
  status: string;
  findings: ControlResult[];
  recommendations: string[];
  nextAssessment: string;
}

export interface ComplianceReport {
  tenantId: string;
  frameworkId: string;
  frameworkName: string;
  assessmentId: string;
  generatedAt: string;
  score: number;
  status: string;
  controls: ControlResult[];
  summary: ComplianceSummary;
  recommendations: string[];
  evidence: ComplianceEvidence[];
}

export interface ComplianceSummary {
  totalControls: number;
  compliantControls: number;
  nonCompliantControls: number;
  compliancePercentage: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
}

export interface ComplianceInfo {
  regulation: string;
  status: 'compliant' | 'violation' | 'warning';
  details: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  type: 'security' | 'privacy' | 'access_control' | 'data_retention';
  category: string;
  content: string;
  rules: PolicyRule[];
  status: 'draft' | 'pending_approval' | 'active' | 'deprecated' | 'rejected';
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  effectiveDate?: string;
  reviewDate?: string;
  approvalWorkflow: PolicyApprovalStep[];
  compliance: string[];
  metadata: Record<string, any>;
}

export interface PolicyRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
}

export interface PolicyApprovalStep {
  step: number;
  approver: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
}

export interface PolicyHistory {
  version: number;
  changedBy: string;
  changedAt: string;
  changes: PolicyChange[];
}

export interface PolicyChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface CreatePolicyRequest {
  name: string;
  description: string;
  type: 'security' | 'privacy' | 'access_control' | 'data_retention';
  category: string;
  content: string;
  rules: PolicyRule[];
  status?: 'draft' | 'pending_approval' | 'active' | 'deprecated' | 'rejected';
  createdBy: string;
  effectiveDate?: string;
  reviewDate?: string;
  approvalWorkflow?: PolicyApprovalStep[];
  compliance?: string[];
  metadata?: Record<string, any>;
}

export interface UpdatePolicyRequest {
  name?: string;
  description?: string;
  content?: string;
  rules?: PolicyRule[];
  status?: 'draft' | 'pending_approval' | 'active' | 'deprecated' | 'rejected';
  effectiveDate?: string;
  reviewDate?: string;
  approvalWorkflow?: PolicyApprovalStep[];
  compliance?: string[];
  metadata?: Record<string, any>;
}

export interface PolicyApproval {
  approved: boolean;
  comments?: string;
}

export interface SLACompliance {
  overall: number;
  byMetric: Record<string, number>;
}

export interface AggregatedMetric {
  type: string;
  average: number;
  min: number;
  max: number;
  count: number;
}

export interface SLAReportSummary {
  totalMetrics: number;
  totalViolations: number;
  uptime: number;
  averageResponseTime: number;
  averageThroughput: number;
  mostCommonViolation: string | null;
}

export interface SLAReport {
  tenantId: string;
  slaId: string;
  timeRange: string;
  generatedAt: string;
  metrics: AggregatedMetric[];
  violations: SLAViolation[];
  compliance: SLACompliance;
  summary: SLAReportSummary;
}

export interface SLAMetric {
  id: string;
  tenantId: string;
  type: string;
  value: number;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface SLAViolation {
  id: string;
  slaId: string;
  metricType: string;
  threshold: number;
  actualValue: number;
  violationTime: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface SLA {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  serviceTier: 'basic' | 'premium' | 'enterprise';
  metrics: SLAMetricDefinition[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface SLAMetricDefinition {
  type: string;
  threshold: number;
  operator: 'gte' | 'lte' | 'gt' | 'lt' | 'eq';
  unit: string;
  description: string;
}

export interface CreateSLARequest {
  name: string;
  description: string;
  tenantId: string;
  serviceTier: 'basic' | 'premium' | 'enterprise';
  metrics: SLAMetricDefinition[];
}

export interface TenantQuotas {
  maxUsers: number;
  maxRequestsPerMonth: number;
  maxStorageGB: number;
  features: string[];
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: TenantPlan;
  status: 'active' | 'inactive' | 'suspended';
  settings: Record<string, any>;
  quotas: TenantQuotas;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantRequest {
  name: string;
  domain: string;
  plan: TenantPlan;
  settings?: Record<string, any>;
  quotas?: Partial<TenantQuotas>;
}

export type TenantPlan = 'starter' | 'professional' | 'enterprise';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
  parentRoles: string[];
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  permission: string;
  resource: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: RolePermission[];
  parentRoles?: string[];
  settings?: Record<string, any>;
}

export interface SSOProvider {
  name: string;
  type: 'saml' | 'oauth2' | 'oidc';
  generateAuthUrl(session: SSOSession): Promise<string>;
  exchangeCode(callbackData: SSOCallback): Promise<SSOUserInfo>;
  getUserInfo(userId: string): Promise<SSOUserInfo>;
}

export interface SSOSession {
  id: string;
  providerName: string;
  state: 'initiated' | 'completed' | 'failed';
  request: SSORequest;
  userInfo?: SSOUserInfo;
  createdAt: string;
  expiresAt: string;
  completedAt?: string;
}

export interface SSORequest {
  redirectUri: string;
  state: string;
  scope?: string;
  metadata?: Record<string, any>;
}

export interface SSOResponse {
  sessionId: string;
  authUrl: string;
  expiresIn: number;
}

export interface SSOCallback {
  code: string;
  state: string;
  error?: string;
}

export interface SSOUserInfo {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  groups: string[];
  metadata: Record<string, any>;
}

export interface SSOToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  userInfo: SSOUserInfo;
}

export interface SSOProviderConfig {
  name: string;
  type: 'saml' | 'oauth2' | 'oidc';
  config: SSOConfig;
}

export interface SSOConfig {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  redirectUri: string;
}

export interface SAMLConfig extends SSOConfig {
  entryPoint: string;
  logoutUrl?: string;
  signatureAlgorithm: string;
  digestAlgorithm: string;
}

export interface OAuth2Config extends SSOConfig {
  scope: string;
  responseType: string;
}

export interface OIDCConfig extends SSOConfig {
  scope: string;
  responseType: string;
  idTokenSigningAlg: string;
}
