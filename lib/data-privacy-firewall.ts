// SIGMACODE Data Privacy Firewall
// GDPR/CCPA Compliance with Automatic PII Detection

export interface PrivacyRule {
  id: string;
  name: string;
  regulation: 'gdpr' | 'ccpa' | 'hipaa' | 'sox' | 'custom';
  piiType:
    | 'email'
    | 'phone'
    | 'ssn'
    | 'credit_card'
    | 'address'
    | 'name'
    | 'medical'
    | 'financial'
    | 'custom';
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'redact' | 'block' | 'alert' | 'anonymize';
  enabled: boolean;
  description: string;
}

export interface PrivacyViolation {
  id: string;
  timestamp: Date;
  piiType: string;
  regulation: string;
  severity: string;
  content: string;
  redactedContent: string;
  action: string;
  confidence: number;
  userId?: string;
  metadata: Record<string, any>;
}

export interface ComplianceReport {
  period: {
    start: Date;
    end: Date;
  };
  totalRequests: number;
  violations: {
    total: number;
    byRegulation: Record<string, number>;
    byPIIType: Record<string, number>;
    byAction: Record<string, number>;
  };
  complianceScore: number;
  recommendations: string[];
  generatedAt: Date;
}

export class DataPrivacyFirewall {
  private privacyRules: PrivacyRule[] = [];
  private violations: PrivacyViolation[] = [];
  private complianceReports: ComplianceReport[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    this.privacyRules = [
      // GDPR Rules
      {
        id: 'gdpr_email',
        name: 'GDPR Email Detection',
        regulation: 'gdpr',
        piiType: 'email',
        pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
        severity: 'high',
        action: 'redact',
        enabled: true,
        description: 'Detects and redacts email addresses for GDPR compliance',
      },
      {
        id: 'gdpr_phone',
        name: 'GDPR Phone Number Detection',
        regulation: 'gdpr',
        piiType: 'phone',
        pattern: '(\\+\\d{1,3}[- ]?)?\\d{1,4}[- ]?\\d{1,4}[- ]?\\d{1,9}',
        severity: 'high',
        action: 'redact',
        enabled: true,
        description: 'Detects and redacts phone numbers for GDPR compliance',
      },
      {
        id: 'gdpr_name',
        name: 'GDPR Name Detection',
        regulation: 'gdpr',
        piiType: 'name',
        pattern: '\\b[A-Z][a-z]+ [A-Z][a-z]+\\b',
        severity: 'medium',
        action: 'redact',
        enabled: true,
        description: 'Detects and redacts full names for GDPR compliance',
      },

      // CCPA Rules
      {
        id: 'ccpa_address',
        name: 'CCPA Address Detection',
        regulation: 'ccpa',
        piiType: 'address',
        pattern: '\\d+ [A-Za-z\\s]+, [A-Za-z\\s]+, [A-Z]{2} \\d{5}',
        severity: 'high',
        action: 'redact',
        enabled: true,
        description: 'Detects and redacts addresses for CCPA compliance',
      },
      {
        id: 'ccpa_financial',
        name: 'CCPA Financial Data Detection',
        regulation: 'ccpa',
        piiType: 'financial',
        pattern: '\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b',
        severity: 'critical',
        action: 'block',
        enabled: true,
        description: 'Detects and blocks credit card numbers for CCPA compliance',
      },

      // HIPAA Rules
      {
        id: 'hipaa_medical',
        name: 'HIPAA Medical Information',
        regulation: 'hipaa',
        piiType: 'medical',
        pattern: '\\b(patient|diagnosis|treatment|medication|medical record)\\b',
        severity: 'critical',
        action: 'block',
        enabled: true,
        description: 'Detects and blocks medical information for HIPAA compliance',
      },
      {
        id: 'hipaa_health_id',
        name: 'HIPAA Health ID Detection',
        regulation: 'hipaa',
        piiType: 'medical',
        pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b',
        severity: 'critical',
        action: 'redact',
        enabled: true,
        description: 'Detects and redacts SSN-like health identifiers',
      },

      // SOX Rules
      {
        id: 'sox_financial',
        name: 'SOX Financial Data',
        regulation: 'sox',
        piiType: 'financial',
        pattern: '\\b(account|balance|transaction|financial statement)\\b',
        severity: 'high',
        action: 'redact',
        enabled: true,
        description: 'Detects and redacts financial data for SOX compliance',
      },
    ];
  }

  async analyzeContent(
    content: string,
    context: {
      userId?: string;
      regulations?: string[];
      privacyMode?: 'strict' | 'balanced' | 'permissive';
    } = {},
  ): Promise<{
    violations: PrivacyViolation[];
    redactedContent: string;
    complianceScore: number;
    recommendations: string[];
  }> {
    const violations: PrivacyViolation[] = [];
    let redactedContent = content;
    const applicableRules = this.getApplicableRules(context.regulations);

    for (const rule of applicableRules) {
      const matches = this.findMatches(content, rule);

      for (const match of matches) {
        const violation = await this.createViolation(rule, match, context.userId);
        violations.push(violation);

        // Apply redaction based on rule action
        if (rule.action === 'redact' || rule.action === 'anonymize') {
          redactedContent = this.applyRedaction(redactedContent, match, rule);
        }
      }
    }

    const complianceScore = this.calculateComplianceScore(violations);
    const recommendations = this.generateRecommendations(violations, context.privacyMode);

    return {
      violations,
      redactedContent,
      complianceScore,
      recommendations,
    };
  }

  private getApplicableRules(regulations?: string[]): PrivacyRule[] {
    if (!regulations || regulations.length === 0) {
      return this.privacyRules.filter((rule) => rule.enabled);
    }

    return this.privacyRules.filter(
      (rule) => rule.enabled && regulations.includes(rule.regulation),
    );
  }

  private findMatches(
    content: string,
    rule: PrivacyRule,
  ): Array<{
    value: string;
    start: number;
    end: number;
    confidence: number;
  }> {
    const matches: Array<{
      value: string;
      start: number;
      end: number;
      confidence: number;
    }> = [];

    const regex = new RegExp(rule.pattern, 'gi');
    let match;

    while ((match = regex.exec(content)) !== null) {
      const value = match[0];
      const confidence = this.calculateConfidence(value, rule);

      matches.push({
        value,
        start: match.index,
        end: match.index + value.length,
        confidence,
      });
    }

    return matches;
  }

  private calculateConfidence(value: string, rule: PrivacyRule): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on context
    const contextIndicators: Record<string, string[]> = {
      email: ['@', '.com', '.org', '.net'],
      phone: ['+', '-', '(', ')', 'phone', 'mobile', 'tel'],
      address: ['street', 'avenue', 'road', 'blvd', 'st.', 'ave.'],
      financial: ['credit', 'card', 'account', 'balance', 'bank'],
      medical: ['patient', 'diagnosis', 'treatment', 'medical', 'health'],
      name: ['first', 'last', 'name', 'firstname', 'lastname'],
      ssn: ['ssn', 'social', 'security', 'number'],
      credit_card: ['credit', 'card', 'visa', 'mastercard', 'amex', 'discover'],
    };

    const indicators = contextIndicators[rule.piiType] || [];
    const contextScore = indicators.filter((indicator: string) =>
      value.toLowerCase().includes(indicator.toLowerCase()),
    ).length;

    confidence += contextScore * 0.2;

    // Adjust based on length and format
    if (value.length > 5 && value.length < 100) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  private async createViolation(
    rule: PrivacyRule,
    match: { value: string; start: number; end: number; confidence: number },
    userId?: string,
  ): Promise<PrivacyViolation> {
    const violation: PrivacyViolation = {
      id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      piiType: rule.piiType,
      regulation: rule.regulation,
      severity: rule.severity,
      content: match.value,
      redactedContent: this.redactPII(match.value, rule.piiType),
      action: rule.action,
      confidence: match.confidence,
      userId,
      metadata: {
        ruleId: rule.id,
        pattern: rule.pattern,
        position: { start: match.start, end: match.end },
      },
    };

    this.violations.push(violation);
    return violation;
  }

  private applyRedaction(content: string, match: any, rule: PrivacyRule): string {
    const replacement = this.getRedactionPlaceholder(rule.piiType, rule.action);
    return content.substring(0, match.start) + replacement + content.substring(match.end);
  }

  private getRedactionPlaceholder(
    piiType:
      | 'email'
      | 'phone'
      | 'ssn'
      | 'credit_card'
      | 'address'
      | 'name'
      | 'medical'
      | 'financial'
      | 'custom',
    action: string,
  ): string {
    const placeholders: Record<string, string> = {
      email: '[EMAIL_REDACTED]',
      phone: '[PHONE_REDACTED]',
      address: '[ADDRESS_REDACTED]',
      name: '[NAME_REDACTED]',
      financial: '[FINANCIAL_DATA_REDACTED]',
      medical: '[MEDICAL_DATA_REDACTED]',
      ssn: '[SSN_REDACTED]',
      credit_card: '[CREDIT_CARD_REDACTED]',
    };

    return placeholders[piiType] || '[PII_REDACTED]';
  }

  private redactPII(value: string, piiType: string): string {
    switch (piiType) {
      case 'email':
        return value.replace(/(.{1,3}).*(@.*)/, '$1***$2');
      case 'phone':
        return value.replace(/(\d{1,3}).*(\d{2})/, '$1***$2');
      case 'credit_card':
        return value.replace(/(\d{4}).*(\d{4})/, '$1 **** **** $2');
      case 'ssn':
        return value.replace(/(\d{3}).*(\d{2})/, '$1-$2-****');
      default:
        return '[REDACTED]';
    }
  }

  private calculateComplianceScore(violations: PrivacyViolation[]): number {
    if (violations.length === 0) return 100;

    const criticalViolations = violations.filter((v) => v.severity === 'critical').length;
    const highViolations = violations.filter((v) => v.severity === 'high').length;
    const mediumViolations = violations.filter((v) => v.severity === 'medium').length;

    // Weighted scoring
    const score = 100 - (criticalViolations * 50 + highViolations * 25 + mediumViolations * 10);

    return Math.max(0, score);
  }

  private generateRecommendations(violations: PrivacyViolation[], privacyMode?: string): string[] {
    const recommendations: string[] = [];

    if (violations.length === 0) {
      recommendations.push('No privacy violations detected - excellent compliance!');
    } else {
      const criticalCount = violations.filter((v) => v.severity === 'critical').length;
      const highCount = violations.filter((v) => v.severity === 'high').length;

      if (criticalCount > 0) {
        recommendations.push(
          `URGENT: Address ${criticalCount} critical privacy violations immediately`,
        );
      }

      if (highCount > 0) {
        recommendations.push(`Address ${highCount} high-severity privacy violations`);
      }

      if (privacyMode === 'strict') {
        recommendations.push('Consider privacy mode: balanced for less restrictive processing');
      }

      if (privacyMode === 'permissive') {
        recommendations.push('Consider privacy mode: balanced for better compliance');
      }
    }

    return recommendations;
  }

  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    regulations?: string[],
  ): Promise<ComplianceReport> {
    const periodViolations = this.violations.filter(
      (v) => v.timestamp >= startDate && v.timestamp <= endDate,
    );

    const totalRequests = 1000; // This would come from actual request logs
    const violationsByRegulation: Record<string, number> = {};
    const violationsByPIIType: Record<string, number> = {};
    const violationsByAction: Record<string, number> = {};

    // Aggregate violations
    for (const violation of periodViolations) {
      violationsByRegulation[violation.regulation] =
        (violationsByRegulation[violation.regulation] || 0) + 1;

      violationsByPIIType[violation.piiType] = (violationsByPIIType[violation.piiType] || 0) + 1;

      violationsByAction[violation.action] = (violationsByAction[violation.action] || 0) + 1;
    }

    const complianceScore = this.calculateComplianceScore(periodViolations);

    const recommendations = this.generateRecommendations(periodViolations);

    const report: ComplianceReport = {
      period: { start: startDate, end: endDate },
      totalRequests,
      violations: {
        total: periodViolations.length,
        byRegulation: violationsByRegulation,
        byPIIType: violationsByPIIType,
        byAction: violationsByAction,
      },
      complianceScore,
      recommendations,
      generatedAt: new Date(),
    };

    this.complianceReports.push(report);
    return report;
  }

  async addPrivacyRule(rule: Omit<PrivacyRule, 'id'>): Promise<void> {
    const newRule: PrivacyRule = {
      ...rule,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.privacyRules.push(newRule);
  }

  async updatePrivacyRule(id: string, updates: Partial<PrivacyRule>): Promise<void> {
    const index = this.privacyRules.findIndex((rule) => rule.id === id);
    if (index !== -1) {
      this.privacyRules[index] = { ...this.privacyRules[index], ...updates };
    }
  }

  async disablePrivacyRule(id: string): Promise<void> {
    const rule = this.privacyRules.find((rule) => rule.id === id);
    if (rule) {
      rule.enabled = false;
    }
  }

  getPrivacyRules(): PrivacyRule[] {
    return this.privacyRules;
  }

  getViolations(): PrivacyViolation[] {
    return this.violations;
  }

  getComplianceReports(): ComplianceReport[] {
    return this.complianceReports;
  }
}

// Export singleton instance
export const dataPrivacyFirewall = new DataPrivacyFirewall();
