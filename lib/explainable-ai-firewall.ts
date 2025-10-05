// SIGMACODE Explainable AI++
// Advanced AI Decision Transparency and Policy Insights

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'privacy' | 'compliance' | 'custom';
  type: 'keyword' | 'regex' | 'pattern' | 'ml' | 'context' | 'behavior';
  condition: {
    field: string;
    operator: 'contains' | 'equals' | 'regex' | 'gt' | 'lt' | 'in' | 'exists';
    value: any;
    context?: Record<string, any>;
  };
  action: 'block' | 'redact' | 'sanitize' | 'alert' | 'transform';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  enabled: boolean;
  metadata: {
    author: string;
    createdAt: Date;
    updatedAt: Date;
    version: string;
    tags: string[];
    examples: string[];
    documentation?: string;
  };
}

export interface DecisionExplanation {
  decisionId: string;
  timestamp: Date;
  input: {
    content: string;
    type: string;
    metadata: Record<string, any>;
  };
  output: {
    decision: 'allow' | 'block' | 'redact' | 'sanitize';
    confidence: number;
    reason: string;
    reasonCode: string;
  };
  triggeredRules: Array<{
    rule: PolicyRule;
    matchDetails: {
      matchedContent: string;
      matchPosition: { start: number; end: number };
      confidence: number;
      context: Record<string, any>;
    };
    contribution: number; // How much this rule contributed to the decision
  }>;
  alternatives: Array<{
    action: string;
    reason: string;
    expectedImpact: string;
    confidence: number;
  }>;
  policyContext: {
    activePolicies: string[];
    policyVersion: string;
    modelProfile?: string;
    securityLevel: 'permissive' | 'balanced' | 'strict';
  };
  tuningSuggestions: Array<{
    type: 'rule_adjustment' | 'policy_change' | 'configuration_update';
    description: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    code?: string;
  }>;
  metadata: {
    processingTime: number;
    modelUsed?: string;
    featuresUsed: string[];
    version: string;
  };
}

export interface PolicyTuningSession {
  id: string;
  userId: string;
  policyId: string;
  startTime: Date;
  status: 'active' | 'completed' | 'abandoned';
  changes: Array<{
    timestamp: Date;
    type: 'rule_enabled' | 'rule_disabled' | 'rule_modified' | 'policy_created' | 'policy_deleted';
    description: string;
    before: any;
    after: any;
  }>;
  testResults: Array<{
    testId: string;
    input: string;
    expectedDecision: string;
    actualDecision: string;
    explanation: string;
  }>;
  endTime?: Date;
}

export class ExplainableAIFirewall {
  private policyRules: Map<string, PolicyRule> = new Map();
  private decisionHistory: DecisionExplanation[] = [];
  private tuningSessions: Map<string, PolicyTuningSession> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    const defaultRules: PolicyRule[] = [
      {
        id: 'pii_email_detection',
        name: 'PII Email Detection',
        description: 'Detects and handles email addresses in content',
        category: 'privacy',
        type: 'regex',
        condition: {
          field: 'content',
          operator: 'regex',
          value: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
        },
        action: 'redact',
        severity: 'medium',
        confidence: 0.95,
        enabled: true,
        metadata: {
          author: 'SIGMACODE',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          version: '1.0.0',
          tags: ['pii', 'email', 'privacy'],
          examples: ['user@example.com', 'test.email@domain.org'],
          documentation: 'https://docs.sigmaguard.ai/rules/pii-email',
        },
      },
      {
        id: 'jailbreak_override_attempt',
        name: 'Jailbreak Override Attempt',
        description: 'Detects attempts to override system instructions',
        category: 'security',
        type: 'keyword',
        condition: {
          field: 'content',
          operator: 'contains',
          value: 'ignore previous instructions',
        },
        action: 'block',
        severity: 'critical',
        confidence: 0.98,
        enabled: true,
        metadata: {
          author: 'SIGMACODE',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          version: '1.0.0',
          tags: ['jailbreak', 'override', 'security'],
          examples: ['Ignore all previous instructions', 'Override system prompt'],
          documentation: 'https://docs.sigmaguard.ai/rules/jailbreak-override',
        },
      },
      {
        id: 'toxic_content_hate',
        name: 'Hate Speech Detection',
        description: 'Detects hate speech and discriminatory content',
        category: 'security',
        type: 'ml',
        condition: {
          field: 'content',
          operator: 'contains',
          value: 'hate|discrimination|racist|sexist',
          context: { model: 'toxicity_classifier' },
        },
        action: 'block',
        severity: 'high',
        confidence: 0.85,
        enabled: true,
        metadata: {
          author: 'SIGMACODE',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          version: '1.0.0',
          tags: ['toxicity', 'hate', 'ml'],
          examples: ['I hate all [group]', 'Discriminatory content'],
          documentation: 'https://docs.sigmaguard.ai/rules/toxic-content',
        },
      },
      {
        id: 'compliance_gdpr_data',
        name: 'GDPR Data Processing',
        description: 'Ensures GDPR compliance for data processing',
        category: 'compliance',
        type: 'context',
        condition: {
          field: 'metadata.region',
          operator: 'equals',
          value: 'EU',
          context: { regulation: 'gdpr' },
        },
        action: 'redact',
        severity: 'high',
        confidence: 1.0,
        enabled: true,
        metadata: {
          author: 'SIGMACODE',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          version: '1.0.0',
          tags: ['gdpr', 'compliance', 'privacy'],
          examples: ['EU user data processing', 'GDPR compliance check'],
          documentation: 'https://docs.sigmaguard.ai/rules/gdpr-compliance',
        },
      },
    ];

    for (const rule of defaultRules) {
      this.policyRules.set(rule.id, rule);
    }
  }

  async analyzeWithExplanation(
    input: string,
    context: {
      userId?: string;
      sessionId?: string;
      model?: string;
      region?: string;
      securityLevel?: 'permissive' | 'balanced' | 'strict';
      policies?: string[];
    } = {},
  ): Promise<DecisionExplanation> {
    const decisionId = `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    console.log(`🔍 Analyzing input with Explainable AI: ${decisionId}`);

    // Evaluate all applicable rules
    const triggeredRules = await this.evaluateRules(input, context);

    // Make decision based on triggered rules
    const decision = this.makeDecision(triggeredRules);

    // Generate detailed explanation
    const explanation = this.generateDetailedExplanation(
      decisionId,
      input,
      decision,
      triggeredRules,
      context,
      startTime,
    );

    this.decisionHistory.push(explanation);

    return explanation;
  }

  private async evaluateRules(
    input: string,
    context: any,
  ): Promise<
    Array<{
      rule: PolicyRule;
      matchDetails: {
        matchedContent: string;
        matchPosition: { start: number; end: number };
        confidence: number;
        context: Record<string, any>;
      };
      contribution: number;
    }>
  > {
    const triggeredRules: Array<{
      rule: PolicyRule;
      matchDetails: {
        matchedContent: string;
        matchPosition: { start: number; end: number };
        confidence: number;
        context: Record<string, any>;
      };
      contribution: number;
    }> = [];

    for (const rule of this.policyRules.values()) {
      if (!rule.enabled) continue;

      const match = await this.evaluateRule(rule, input, context);

      if (match) {
        const contribution = this.calculateRuleContribution(rule, match);
        triggeredRules.push({
          rule,
          matchDetails: match,
          contribution,
        });
      }
    }

    // Sort by contribution (most important first)
    return triggeredRules.sort((a, b) => b.contribution - a.contribution);
  }

  private async evaluateRule(
    rule: PolicyRule,
    input: string,
    context: any,
  ): Promise<{
    matchedContent: string;
    matchPosition: { start: number; end: number };
    confidence: number;
    context: Record<string, any>;
  } | null> {
    // Evaluate rule condition
    let matches = false;
    let matchedContent = '';
    let matchPosition = { start: -1, end: -1 };
    let confidence = rule.confidence;

    switch (rule.condition.operator) {
      case 'contains':
        const index = input.toLowerCase().indexOf(String(rule.condition.value).toLowerCase());
        if (index !== -1) {
          matches = true;
          matchedContent = input.substring(index, index + rule.condition.value.length);
          matchPosition = { start: index, end: index + rule.condition.value.length };
        }
        break;

      case 'regex':
        const regex = new RegExp(rule.condition.value, 'gi');
        const regexMatch = regex.exec(input);
        if (regexMatch) {
          matches = true;
          matchedContent = regexMatch[0];
          matchPosition = { start: regexMatch.index, end: regexMatch.index + regexMatch[0].length };
        }
        break;

      case 'equals':
        if (input === rule.condition.value) {
          matches = true;
          matchedContent = input;
          matchPosition = { start: 0, end: input.length };
        }
        break;

      case 'in':
        if (Array.isArray(rule.condition.value) && rule.condition.value.includes(input)) {
          matches = true;
          matchedContent = input;
          matchPosition = { start: 0, end: input.length };
        }
        break;

      case 'exists':
        matches = input.length > 0;
        matchedContent = input;
        matchPosition = { start: 0, end: input.length };
        break;
    }

    if (matches) {
      // Adjust confidence based on context
      if (rule.type === 'ml') {
        confidence = await this.getMLConfidence(input, rule);
      }

      return {
        matchedContent,
        matchPosition,
        confidence,
        context: {
          ruleType: rule.type,
          category: rule.category,
          severity: rule.severity,
        },
      };
    }

    return null;
  }

  private async getMLConfidence(input: string, rule: PolicyRule): Promise<number> {
    // Simulate ML confidence calculation
    // In a real implementation, this would call an ML model
    const baseConfidence = rule.confidence;

    // Add some randomness to simulate ML uncertainty
    const variation = (Math.random() - 0.5) * 0.1;
    return Math.max(0.5, Math.min(1.0, baseConfidence + variation));
  }

  private calculateRuleContribution(rule: PolicyRule, match: any): number {
    // Calculate how much this rule contributes to the final decision
    let contribution =
      rule.severity === 'critical'
        ? 1.0
        : rule.severity === 'high'
          ? 0.8
          : rule.severity === 'medium'
            ? 0.6
            : 0.4;

    // Boost contribution for ML-based rules
    if (rule.type === 'ml') {
      contribution *= 1.2;
    }

    // Adjust based on confidence
    contribution *= match.confidence;

    return Math.min(1.0, contribution);
  }

  private makeDecision(
    triggeredRules: Array<{
      rule: PolicyRule;
      matchDetails: any;
      contribution: number;
    }>,
  ): {
    decision: 'allow' | 'block' | 'redact' | 'sanitize';
    confidence: number;
    reason: string;
    reasonCode: string;
  } {
    if (triggeredRules.length === 0) {
      return {
        decision: 'allow',
        confidence: 1.0,
        reason: 'No security rules triggered',
        reasonCode: 'NO_THREATS_DETECTED',
      };
    }

    // Find the most severe action required
    const actions = triggeredRules.map((r) => r.rule.action);
    const hasBlock = actions.includes('block');
    const hasRedact = actions.includes('redact');
    const hasSanitize = actions.includes('sanitize');

    let decision: 'allow' | 'block' | 'redact' | 'sanitize' = 'allow';
    let reason = '';
    let reasonCode = '';

    if (hasBlock) {
      decision = 'block';
      reason = 'Critical security violation detected';
      reasonCode = 'CRITICAL_SECURITY_VIOLATION';
    } else if (hasRedact) {
      decision = 'redact';
      reason = 'Sensitive information detected and redacted';
      reasonCode = 'PII_DETECTED';
    } else if (hasSanitize) {
      decision = 'sanitize';
      reason = 'Content sanitized for security';
      reasonCode = 'CONTENT_SANITIZED';
    }

    // Calculate overall confidence
    const totalContribution = triggeredRules.reduce((sum, r) => sum + r.contribution, 0);
    const averageConfidence = totalContribution / triggeredRules.length;

    return {
      decision,
      confidence: averageConfidence,
      reason,
      reasonCode,
    };
  }

  private generateDetailedExplanation(
    decisionId: string,
    input: string,
    decision: any,
    triggeredRules: Array<{
      rule: PolicyRule;
      matchDetails: any;
      contribution: number;
    }>,
    context: any,
    startTime: number,
  ): DecisionExplanation {
    // Generate alternative decisions
    const alternatives = this.generateAlternatives(decision, triggeredRules);

    // Generate tuning suggestions
    const tuningSuggestions = this.generateTuningSuggestions(triggeredRules, decision);

    // Determine active policies
    const activePolicies = ['default-security', 'privacy-protection', 'compliance-gdpr'];

    return {
      decisionId,
      timestamp: new Date(),
      input: {
        content: input,
        type: 'text',
        metadata: context,
      },
      output: decision,
      triggeredRules,
      alternatives,
      policyContext: {
        activePolicies,
        policyVersion: '1.0.0',
        modelProfile: context.model,
        securityLevel: context.securityLevel || 'balanced',
      },
      tuningSuggestions,
      metadata: {
        processingTime: Date.now() - startTime,
        modelUsed: 'explainable-ai-v1',
        featuresUsed: ['rule_evaluation', 'context_analysis', 'ml_confidence'],
        version: '1.0.0',
      },
    };
  }

  private generateAlternatives(
    decision: any,
    triggeredRules: Array<{
      rule: PolicyRule;
      matchDetails: any;
      contribution: number;
    }>,
  ): Array<{
    action: string;
    reason: string;
    expectedImpact: string;
    confidence: number;
  }> {
    const alternatives: Array<{
      action: string;
      reason: string;
      expectedImpact: string;
      confidence: number;
    }> = [];

    // Alternative: Allow with warning
    if (decision.decision === 'block') {
      alternatives.push({
        action: 'allow',
        reason: 'Allow content with security warning instead of blocking',
        expectedImpact: 'May allow potentially harmful content through',
        confidence: 0.3,
      });
    }

    // Alternative: Different redaction method
    if (decision.decision === 'redact') {
      alternatives.push({
        action: 'sanitize',
        reason: 'Sanitize content instead of redacting specific parts',
        expectedImpact: 'More aggressive content modification',
        confidence: 0.7,
      });
    }

    // Alternative: Stricter enforcement
    alternatives.push({
      action: 'block',
      reason: 'Apply stricter blocking policy for this content type',
      expectedImpact: 'Higher false positive rate but better security',
      confidence: 0.9,
    });

    return alternatives;
  }

  private generateTuningSuggestions(
    triggeredRules: Array<{
      rule: PolicyRule;
      matchDetails: any;
      contribution: number;
    }>,
    decision: any,
  ): Array<{
    type: 'rule_adjustment' | 'policy_change' | 'configuration_update';
    description: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    code?: string;
  }> {
    const suggestions: Array<{
      type: 'rule_adjustment' | 'policy_change' | 'configuration_update';
      description: string;
      impact: 'low' | 'medium' | 'high';
      effort: 'low' | 'medium' | 'high';
      code?: string;
    }> = [];

    // Rule-specific suggestions
    for (const triggered of triggeredRules) {
      if (triggered.matchDetails.confidence < 0.7) {
        suggestions.push({
          type: 'rule_adjustment',
          description: `Consider adjusting confidence threshold for rule "${triggered.rule.name}" (currently ${triggered.matchDetails.confidence})`,
          impact: 'medium',
          effort: 'low',
          code: `// Adjust rule confidence\nconfidence: ${Math.max(0.8, triggered.matchDetails.confidence + 0.1)}`,
        });
      }

      if (triggered.rule.type === 'keyword' && triggeredRules.length > 1) {
        suggestions.push({
          type: 'rule_adjustment',
          description: `Convert "${triggered.rule.name}" from keyword to regex for better accuracy`,
          impact: 'medium',
          effort: 'medium',
          code: `// Convert to regex pattern\npattern: "/${triggered.rule.condition.value}/i"`,
        });
      }
    }

    // General suggestions
    if (decision.decision === 'block' && triggeredRules.length === 1) {
      suggestions.push({
        type: 'policy_change',
        description:
          'Consider implementing graduated response levels instead of immediate blocking',
        impact: 'high',
        effort: 'high',
      });
    }

    if (triggeredRules.some((r) => r.rule.category === 'privacy')) {
      suggestions.push({
        type: 'configuration_update',
        description: 'Review privacy settings and consider adding data minimization policies',
        impact: 'medium',
        effort: 'low',
      });
    }

    return suggestions;
  }

  async createTuningSession(
    userId: string,
    policyId: string,
    initialChanges: any[] = [],
  ): Promise<PolicyTuningSession> {
    const session: PolicyTuningSession = {
      id: `tuning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      policyId,
      startTime: new Date(),
      status: 'active',
      changes: initialChanges,
      testResults: [],
    };

    this.tuningSessions.set(session.id, session);
    return session;
  }

  async updateTuningSession(
    sessionId: string,
    updates: Partial<PolicyTuningSession>,
  ): Promise<void> {
    const session = this.tuningSessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
      this.tuningSessions.set(sessionId, session);
    }
  }

  async addTuningTestResult(
    sessionId: string,
    testResult: {
      testId: string;
      input: string;
      expectedDecision: string;
      actualDecision: string;
      explanation: string;
    },
  ): Promise<void> {
    const session = this.tuningSessions.get(sessionId);
    if (session) {
      session.testResults.push(testResult);
      this.tuningSessions.set(sessionId, session);
    }
  }

  async completeTuningSession(sessionId: string): Promise<void> {
    const session = this.tuningSessions.get(sessionId);
    if (session) {
      session.status = 'completed';
      session.endTime = new Date();
      this.tuningSessions.set(sessionId, session);
    }
  }

  getDecisionHistory(
    limit: number = 100,
    filter?: {
      userId?: string;
      decision?: string;
      ruleId?: string;
      timeRange?: { start: Date; end: Date };
    },
  ): DecisionExplanation[] {
    let history = [...this.decisionHistory];

    if (filter) {
      if (filter.userId) {
        history = history.filter((h) => h.input.metadata.userId === filter.userId);
      }

      if (filter.decision) {
        history = history.filter((h) => h.output.decision === filter.decision);
      }

      if (filter.ruleId) {
        history = history.filter((h) => h.triggeredRules.some((r) => r.rule.id === filter.ruleId));
      }

      if (filter.timeRange) {
        history = history.filter(
          (h) => h.timestamp >= filter.timeRange!.start && h.timestamp <= filter.timeRange!.end,
        );
      }
    }

    return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  }

  getPolicyRules(category?: string): PolicyRule[] {
    const rules = Array.from(this.policyRules.values());

    if (category) {
      return rules.filter((rule) => rule.category === category);
    }

    return rules;
  }

  async createPolicyRule(rule: Omit<PolicyRule, 'id' | 'metadata'>): Promise<PolicyRule> {
    const newRule: PolicyRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        author: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        tags: [],
        examples: [],
      },
    };

    this.policyRules.set(newRule.id, newRule);
    return newRule;
  }

  async updatePolicyRule(id: string, updates: Partial<PolicyRule>): Promise<void> {
    const rule = this.policyRules.get(id);
    if (rule) {
      const updatedRule = {
        ...rule,
        ...updates,
        metadata: {
          ...rule.metadata,
          ...updates.metadata,
          updatedAt: new Date(),
        },
      };
      this.policyRules.set(id, updatedRule);
    }
  }

  async deletePolicyRule(id: string): Promise<void> {
    this.policyRules.delete(id);
  }

  getTuningSessions(userId?: string): PolicyTuningSession[] {
    const sessions = Array.from(this.tuningSessions.values());

    if (userId) {
      return sessions.filter((session) => session.userId === userId);
    }

    return sessions;
  }

  async exportDecisionData(format: 'json' | 'csv' | 'xml' = 'json', filter?: any): Promise<string> {
    const decisions = this.getDecisionHistory(1000, filter);

    switch (format) {
      case 'json':
        return JSON.stringify(decisions, null, 2);

      case 'csv':
        return this.exportToCSV(decisions);

      case 'xml':
        return this.exportToXML(decisions);

      default:
        return JSON.stringify(decisions, null, 2);
    }
  }

  private exportToCSV(decisions: DecisionExplanation[]): string {
    const headers = [
      'Decision ID',
      'Timestamp',
      'Input Content',
      'Decision',
      'Confidence',
      'Reason',
      'Triggered Rules',
      'Processing Time',
    ];

    const rows = decisions.map((decision) => [
      decision.decisionId,
      decision.timestamp.toISOString(),
      `"${decision.input.content.replace(/"/g, '""')}"`,
      decision.output.decision,
      decision.output.confidence.toFixed(3),
      `"${decision.output.reason}"`,
      decision.triggeredRules.map((r) => r.rule.name).join('; '),
      decision.metadata.processingTime,
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  private exportToXML(decisions: DecisionExplanation[]): string {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<decisionExplanations>
  ${decisions
    .map(
      (decision) => `
  <decision>
    <decisionId>${decision.decisionId}</decisionId>
    <timestamp>${decision.timestamp.toISOString()}</timestamp>
    <input>${decision.input.content}</input>
    <decision>${decision.output.decision}</decision>
    <confidence>${decision.output.confidence}</confidence>
    <reason>${decision.output.reason}</reason>
    <triggeredRules>
      ${decision.triggeredRules
        .map(
          (rule) => `
      <rule>
        <name>${rule.rule.name}</name>
        <category>${rule.rule.category}</category>
        <severity>${rule.rule.severity}</severity>
        <contribution>${rule.contribution}</contribution>
      </rule>`,
        )
        .join('')}
    </triggeredRules>
  </decision>`,
    )
    .join('')}
</decisionExplanations>`;

    return xml;
  }
}

// Export singleton instance
export const explainableAIFirewall = new ExplainableAIFirewall();
