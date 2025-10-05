// SIGMACODE Self-Learning ML Firewall
// Adaptive AI Security that learns from every interaction

import { getDb } from '@/database/db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getRedisCache } from '@/lib/cache/redis-v2';

export interface LearningEvent {
  id: string;
  timestamp: Date;
  input: string;
  output: string;
  blocked: boolean;
  reason?: string;
  reasonCode?: string;
  userId?: string;
  model?: string;
  confidence: number;
  feedback?: 'positive' | 'negative' | 'false_positive';
  metadata: Record<string, any>;
}

export interface AdaptiveRule {
  id: string;
  pattern: string;
  type: 'keyword' | 'regex' | 'sentiment' | 'toxicity' | 'pii';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  falsePositiveRate: number;
  createdAt: Date;
  updatedAt: Date;
  source: 'manual' | 'auto_learned' | 'threat_intel';
  enabled: boolean;
}

export class SelfLearningFirewall {
  private redis = getRedisCache();
  private learningEnabled = true;
  private minConfidence = 0.7;
  private maxFalsePositiveRate = 0.1;

  async recordLearningEvent(event: LearningEvent): Promise<void> {
    if (!this.learningEnabled) return;

    // Store event in database
    await this.storeEvent(event);

    // Extract patterns from blocked content
    if (event.blocked && event.confidence > this.minConfidence) {
      await this.extractAndLearnPatterns(event);
    }

    // Update rule performance based on feedback
    if (event.feedback) {
      await this.updateRulePerformance(event);
    }

    // Clean up old learning data
    await this.cleanupOldData();
  }

  private async extractAndLearnPatterns(event: LearningEvent): Promise<void> {
    const patterns = await this.extractPatterns(event.input, event.output);

    for (const pattern of patterns) {
      const existingRule = await this.findSimilarRule(pattern);

      if (existingRule) {
        // Update existing rule confidence
        await this.updateRuleConfidence(existingRule.id, event.confidence);
      } else {
        // Create new adaptive rule
        await this.createAdaptiveRule(pattern, event);
      }
    }
  }

  private async extractPatterns(input: string, output: string): Promise<string[]> {
    const patterns: string[] = [];

    // Extract suspicious keywords
    const keywords = this.extractKeywords(input);
    patterns.push(...keywords);

    // Extract regex patterns from blocked content
    const regexPatterns = this.extractRegexPatterns(input);
    patterns.push(...regexPatterns);

    // Extract PII patterns
    const piiPatterns = this.extractPIIPatterns(input);
    patterns.push(...piiPatterns);

    return [...new Set(patterns)]; // Remove duplicates
  }

  private extractKeywords(text: string): string[] {
    const keywords = [
      'system prompt',
      'ignore previous',
      'override',
      'admin password',
      'bypass security',
      'jailbreak',
      'exploit',
      'hack',
      'malware',
      'sql injection',
      'xss',
      'csrf',
      'rce',
      'remote code execution',
    ];

    return keywords.filter((keyword) => text.toLowerCase().includes(keyword.toLowerCase()));
  }

  private extractRegexPatterns(text: string): string[] {
    // Look for common attack patterns
    const patterns = [
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Email
      /\d{3}-\d{2}-\d{4}/, // SSN pattern
      /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/, // Credit card
      /password\s*[=:]\s*['"]?[^'"\s]+/, // Password patterns
      /api[_-]?key\s*[=:]\s*['"]?[^'"\s]+/, // API keys
    ];

    const foundPatterns: string[] = [];

    for (const pattern of patterns) {
      if (pattern.test(text)) {
        foundPatterns.push(pattern.source);
      }
    }

    return foundPatterns;
  }

  private extractPIIPatterns(text: string): string[] {
    const piiIndicators = [
      'social security number',
      'ssn',
      'credit card',
      'cvv',
      'phone number',
      'address',
      'birth date',
      'medical record',
      'health information',
      'financial data',
      'bank account',
    ];

    return piiIndicators.filter((indicator) =>
      text.toLowerCase().includes(indicator.toLowerCase()),
    );
  }

  private async findSimilarRule(pattern: string): Promise<AdaptiveRule | null> {
    // Check if we have a similar rule already
    const similarRules = await this.getAdaptiveRules();
    return (
      similarRules.find((rule) => this.calculateSimilarity(rule.pattern, pattern) > 0.8) || null
    );
  }

  private calculateSimilarity(pattern1: string, pattern2: string): number {
    // Simple similarity calculation
    const len1 = pattern1.length;
    const len2 = pattern2.length;
    const maxLen = Math.max(len1, len2);

    if (maxLen === 0) return 1;

    const distance = this.levenshteinDistance(pattern1, pattern2);
    return (maxLen - distance) / maxLen;
  }

  private levenshteinDistance(s1: string, s2: string): number {
    const matrix = Array(s2.length + 1)
      .fill(null)
      .map(() => Array(s1.length + 1).fill(null));

    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator,
        );
      }
    }

    return matrix[s2.length][s1.length];
  }

  private async createAdaptiveRule(pattern: string, event: LearningEvent): Promise<void> {
    const rule: AdaptiveRule = {
      id: `adaptive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pattern,
      type: this.determineRuleType(pattern),
      severity: this.determineSeverity(event),
      confidence: event.confidence,
      falsePositiveRate: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'auto_learned',
      enabled: true,
    };

    // Store in Redis for fast access
    await this.redis.set(`adaptive_rule:${rule.id}`, JSON.stringify(rule));
  }

  private determineRuleType(
    pattern: string,
  ): 'keyword' | 'regex' | 'sentiment' | 'toxicity' | 'pii' {
    const lowerPattern = pattern.toLowerCase();

    if (
      lowerPattern.includes('email') ||
      lowerPattern.includes('phone') ||
      lowerPattern.includes('ssn')
    ) {
      return 'pii';
    }

    if (
      lowerPattern.includes('hate') ||
      lowerPattern.includes('abuse') ||
      lowerPattern.includes('toxic')
    ) {
      return 'toxicity';
    }

    if (
      lowerPattern.includes('jailbreak') ||
      lowerPattern.includes('bypass') ||
      lowerPattern.includes('override')
    ) {
      return 'keyword';
    }

    return 'regex';
  }

  private determineSeverity(event: LearningEvent): 'low' | 'medium' | 'high' | 'critical' {
    if (event.reasonCode?.includes('PII') || event.reasonCode?.includes('MALWARE')) {
      return 'critical';
    }

    if (event.reasonCode?.includes('INJECTION') || event.reasonCode?.includes('TOXICITY')) {
      return 'high';
    }

    return 'medium';
  }

  private async updateRuleConfidence(ruleId: string, newConfidence: number): Promise<void> {
    const rule = await this.getAdaptiveRule(ruleId);
    if (!rule) return;

    const updatedConfidence = (rule.confidence + newConfidence) / 2;
    rule.confidence = updatedConfidence;
    rule.updatedAt = new Date();

    await this.redis.set(`adaptive_rule:${ruleId}`, JSON.stringify(rule));
  }

  private async updateRulePerformance(event: LearningEvent): Promise<void> {
    // This would update rule performance based on user feedback
    // If feedback is 'false_positive', increase false positive rate
    // If feedback is 'positive', increase confidence
    // Implementation would depend on how rules are stored and accessed
  }

  async getAdaptiveRules(): Promise<AdaptiveRule[]> {
    const keys = await this.redis.keys('adaptive_rule:*');
    const rules: AdaptiveRule[] = [];

    for (const key of keys) {
      const ruleData = await this.redis.get(key);
      if (ruleData && typeof ruleData === 'string') {
        rules.push(JSON.parse(ruleData));
      }
    }

    return rules.filter(
      (rule) => rule.enabled && rule.falsePositiveRate <= this.maxFalsePositiveRate,
    );
  }

  async getAdaptiveRule(id: string): Promise<AdaptiveRule | null> {
    const ruleData = await this.redis.get(`adaptive_rule:${id}`);
    return ruleData && typeof ruleData === 'string' ? JSON.parse(ruleData) : null;
  }

  async disableRule(id: string): Promise<void> {
    const rule = await this.getAdaptiveRule(id);
    if (rule) {
      rule.enabled = false;
      await this.redis.set(`adaptive_rule:${id}`, JSON.stringify(rule));
    }
  }

  async enableRule(id: string): Promise<void> {
    const rule = await this.getAdaptiveRule(id);
    if (rule) {
      rule.enabled = true;
      await this.redis.set(`adaptive_rule:${id}`, JSON.stringify(rule));
    }
  }

  private async storeEvent(event: LearningEvent): Promise<void> {
    // Store learning event in database for analysis
    // This would use the database schema for learning events
  }

  private async cleanupOldData(): Promise<void> {
    // Clean up old learning data older than 30 days
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Remove old events and update rule statistics
    // Implementation would depend on database schema
  }

  async getLearningStats(): Promise<{
    totalEvents: number;
    blockedEvents: number;
    learnedRules: number;
    avgConfidence: number;
    falsePositiveRate: number;
  }> {
    // Get statistics about learning performance
    const rules = await this.getAdaptiveRules();

    return {
      totalEvents: 0, // Would be calculated from database
      blockedEvents: 0,
      learnedRules: rules.length,
      avgConfidence: rules.reduce((sum, rule) => sum + rule.confidence, 0) / rules.length || 0,
      falsePositiveRate:
        rules.reduce((sum, rule) => sum + rule.falsePositiveRate, 0) / rules.length || 0,
    };
  }
}

// Export singleton instance
export const selfLearningFirewall = new SelfLearningFirewall();
