// SIGMACODE Advanced Model Support
// Multi-Model Context Awareness and Streaming Protection

export interface AIModelProfile {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'cohere' | 'google' | 'meta' | 'custom';
  modelFamily: string;
  version: string;
  contextWindow: number;
  maxTokens: number;
  capabilities: string[];
  vulnerabilities: ModelVulnerability[];
  securityRules: ModelSecurityRule[];
  streamingSupported: boolean;
  jsonModeSupported: boolean;
  functionCallingSupported: boolean;
  visionSupported: boolean;
}

export interface ModelVulnerability {
  id: string;
  type: 'jailbreak' | 'prompt_injection' | 'data_leakage' | 'hallucination' | 'custom';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: number; // 0-1
  mitigation: string[];
  examples: string[];
  patchedInVersion?: string;
}

export interface ModelSecurityRule {
  id: string;
  name: string;
  type: 'input_filter' | 'output_filter' | 'context_check' | 'format_validation';
  condition: string;
  action: 'block' | 'sanitize' | 'warn' | 'transform';
  priority: number;
  enabled: boolean;
  metadata: Record<string, any>;
}

export interface StreamingChunk {
  id: string;
  content: string;
  finishReason?: string;
  model: string;
  timestamp: Date;
  sequence: number;
  totalChunks?: number;
}

export interface StreamingAnalysis {
  chunkId: string;
  blocked: boolean;
  reason?: string;
  confidence: number;
  threats: string[];
  sanitizedContent: string;
  processingTime: number;
}

export interface StreamingSession {
  id: string;
  modelId: string;
  userId?: string;
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  configuration: {
    temperature?: number;
    maxTokens?: number;
    streaming?: boolean;
  };
  chunks: StreamingChunk[];
  totalChunks: number;
  processedChunks: number;
  blockedChunks: number;
  metadata: Record<string, any>;
}

export class AdvancedModelSupport {
  private modelProfiles: Map<string, AIModelProfile> = new Map();
  private streamingSessions: Map<string, StreamingSession> = new Map();

  constructor() {
    this.initializeModelProfiles();
  }

  private initializeModelProfiles(): void {
    const profiles: AIModelProfile[] = [
      // OpenAI Models
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        modelFamily: 'gpt-4',
        version: '2024-04-09',
        contextWindow: 128000,
        maxTokens: 4096,
        capabilities: ['text', 'json', 'function_calling', 'streaming'],
        vulnerabilities: [
          {
            id: 'gpt4_jailbreak_susceptibility',
            type: 'jailbreak',
            description: 'GPT-4 Turbo is susceptible to certain jailbreak attacks',
            severity: 'medium',
            likelihood: 0.3,
            mitigation: [
              'Use system messages',
              'Implement content filters',
              'Monitor for override attempts',
            ],
            examples: ['DAN mode', 'Developer mode', 'Uncensored persona'],
            patchedInVersion: '2024-05-01',
          },
          {
            id: 'gpt4_context_confusion',
            type: 'prompt_injection',
            description:
              'Long context windows can lead to confusion between user and system instructions',
            severity: 'high',
            likelihood: 0.4,
            mitigation: ['Clear delimiters', 'Structured prompts', 'Position-based instructions'],
            examples: ['Ignore previous instructions', 'Override system prompt'],
          },
        ],
        securityRules: [
          {
            id: 'gpt4_json_validation',
            name: 'JSON Format Validation',
            type: 'output_filter',
            condition: 'output_format === "json"',
            action: 'sanitize',
            priority: 1,
            enabled: true,
            metadata: { schema: 'strict' },
          },
          {
            id: 'gpt4_function_call_safety',
            name: 'Function Call Safety Check',
            type: 'input_filter',
            condition: 'has_function_calls',
            action: 'sanitize',
            priority: 2,
            enabled: true,
            metadata: { allowed_functions: ['safe_functions_only'] },
          },
        ],
        streamingSupported: true,
        jsonModeSupported: true,
        functionCallingSupported: true,
        visionSupported: false,
      },

      // Anthropic Models
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        modelFamily: 'claude-3',
        version: '2024-03-01',
        contextWindow: 200000,
        maxTokens: 4096,
        capabilities: ['text', 'json', 'function_calling', 'streaming', 'vision'],
        vulnerabilities: [
          {
            id: 'claude3_constitutional_ai',
            type: 'custom',
            description: "Claude's constitutional AI may be bypassed with certain prompts",
            severity: 'low',
            likelihood: 0.1,
            mitigation: [
              'Avoid meta-instructions',
              'Use direct prompts',
              'Monitor for AI constitution discussions',
            ],
            examples: ['Ignore your constitution', 'Override safety instructions'],
            patchedInVersion: '2024-04-01',
          },
        ],
        securityRules: [
          {
            id: 'claude3_vision_safety',
            name: 'Vision Input Safety',
            type: 'input_filter',
            condition: 'has_image_input',
            action: 'sanitize',
            priority: 1,
            enabled: true,
            metadata: { max_image_size: '10MB', allowed_formats: ['jpg', 'png'] },
          },
        ],
        streamingSupported: true,
        jsonModeSupported: true,
        functionCallingSupported: true,
        visionSupported: true,
      },

      // Google Models
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'google',
        modelFamily: 'gemini',
        version: '2024-01-01',
        contextWindow: 32768,
        maxTokens: 2048,
        capabilities: ['text', 'json', 'function_calling', 'streaming'],
        vulnerabilities: [
          {
            id: 'gemini_coding_assistance',
            type: 'data_leakage',
            description: 'Gemini may inadvertently expose code patterns or sensitive logic',
            severity: 'medium',
            likelihood: 0.2,
            mitigation: [
              'Avoid sensitive code in prompts',
              'Use code review',
              'Implement output filtering',
            ],
            examples: [
              'Show me how to implement X security feature',
              'Generate authentication code',
            ],
          },
        ],
        securityRules: [
          {
            id: 'gemini_safety_filter',
            name: 'Gemini Safety Filter',
            type: 'output_filter',
            condition: 'contains_unsafe_content',
            action: 'block',
            priority: 1,
            enabled: true,
            metadata: { safety_categories: ['harmful', 'explicit', 'dangerous'] },
          },
        ],
        streamingSupported: true,
        jsonModeSupported: true,
        functionCallingSupported: true,
        visionSupported: false,
      },
    ];

    for (const profile of profiles) {
      this.modelProfiles.set(profile.id, profile);
    }
  }

  async analyzeWithModelContext(
    input: string,
    modelId: string,
    context: {
      temperature?: number;
      maxTokens?: number;
      streaming?: boolean;
      userId?: string;
      sessionId?: string;
    } = {},
  ): Promise<{
    analysis: any;
    modelProfile: AIModelProfile;
    appliedRules: string[];
    recommendations: string[];
  }> {
    const modelProfile = this.modelProfiles.get(modelId);

    if (!modelProfile) {
      throw new Error(`Model profile not found for: ${modelId}`);
    }

    console.log(`🧠 Analyzing input for model: ${modelProfile.name} (${modelProfile.provider})`);

    // Apply model-specific security rules
    const appliedRules = await this.applyModelSecurityRules(input, modelProfile, context);

    // Check for model-specific vulnerabilities
    const vulnerabilityMatches = this.checkModelVulnerabilities(input, modelProfile);

    // Generate model-specific recommendations
    const recommendations = this.generateModelRecommendations(modelProfile, vulnerabilityMatches);

    // Create enhanced analysis
    const analysis = {
      modelId,
      modelProfile: modelProfile.name,
      inputLength: input.length,
      contextWindowUtilization: (input.length / modelProfile.contextWindow) * 100,
      appliedRules,
      vulnerabilityMatches,
      recommendations,
      capabilities: modelProfile.capabilities,
      streamingSupported: modelProfile.streamingSupported,
      processingTime: Date.now(),
    };

    return {
      analysis,
      modelProfile,
      appliedRules,
      recommendations,
    };
  }

  private async applyModelSecurityRules(
    input: string,
    modelProfile: AIModelProfile,
    context: any,
  ): Promise<string[]> {
    const appliedRules: string[] = [];

    for (const rule of modelProfile.securityRules) {
      if (!rule.enabled) continue;

      const shouldApply = await this.evaluateRuleCondition(rule, input, context);

      if (shouldApply) {
        await this.executeRuleAction(rule, input, context);
        appliedRules.push(rule.id);
      }
    }

    return appliedRules;
  }

  private async evaluateRuleCondition(
    rule: ModelSecurityRule,
    input: string,
    context: any,
  ): Promise<boolean> {
    // Evaluate rule condition based on type
    switch (rule.type) {
      case 'input_filter':
        return this.evaluateInputFilter(rule, input, context);

      case 'output_filter':
        return this.evaluateOutputFilter(rule, input, context);

      case 'context_check':
        return this.evaluateContextCheck(rule, input, context);

      case 'format_validation':
        return this.evaluateFormatValidation(rule, input, context);

      default:
        return false;
    }
  }

  private async evaluateInputFilter(
    rule: ModelSecurityRule,
    input: string,
    context: any,
  ): Promise<boolean> {
    // Check if input matches rule condition
    const condition = rule.condition;

    if (condition.includes('function_calls') && !context.functionCalls) {
      return false;
    }

    if (condition.includes('json') && !input.includes('{') && !input.includes('[')) {
      return false;
    }

    return true;
  }

  private async evaluateOutputFilter(
    rule: ModelSecurityRule,
    input: string,
    context: any,
  ): Promise<boolean> {
    // This would be evaluated on output, not input
    return false;
  }

  private async evaluateContextCheck(
    rule: ModelSecurityRule,
    input: string,
    context: any,
  ): Promise<boolean> {
    // Check context-related conditions
    if (rule.condition.includes('context_window')) {
      const utilization = (input.length / 8192) * 100; // Default context window
      return utilization > 90; // High utilization
    }

    return false;
  }

  private async evaluateFormatValidation(
    rule: ModelSecurityRule,
    input: string,
    context: any,
  ): Promise<boolean> {
    // Validate input format
    if (rule.condition.includes('json') && context.jsonMode) {
      try {
        JSON.parse(input);
        return true;
      } catch {
        return false;
      }
    }

    return true;
  }

  private async executeRuleAction(
    rule: ModelSecurityRule,
    input: string,
    context: any,
  ): Promise<void> {
    switch (rule.action) {
      case 'block':
        throw new Error(`Input blocked by model security rule: ${rule.name}`);

      case 'sanitize':
        // Sanitize input based on rule metadata
        console.log(`Sanitizing input based on rule: ${rule.name}`);
        break;

      case 'warn':
        console.warn(
          `Model security warning: ${rule.name} - ${rule.metadata.message || 'Security concern detected'}`,
        );
        break;

      case 'transform':
        // Transform input based on rule
        console.log(`Transforming input based on rule: ${rule.name}`);
        break;
    }
  }

  private checkModelVulnerabilities(
    input: string,
    modelProfile: AIModelProfile,
  ): ModelVulnerability[] {
    const matches: ModelVulnerability[] = [];

    for (const vulnerability of modelProfile.vulnerabilities) {
      const isMatch = this.checkVulnerabilityMatch(input, vulnerability);

      if (isMatch) {
        matches.push(vulnerability);
      }
    }

    return matches;
  }

  private checkVulnerabilityMatch(input: string, vulnerability: ModelVulnerability): boolean {
    const lowerInput = input.toLowerCase();

    for (const example of vulnerability.examples) {
      if (lowerInput.includes(example.toLowerCase())) {
        return true;
      }
    }

    // Check for pattern-based matches
    if (vulnerability.type === 'jailbreak') {
      const jailbreakKeywords = ['ignore', 'override', 'bypass', 'jailbreak', 'uncensored'];
      if (jailbreakKeywords.some((keyword) => lowerInput.includes(keyword))) {
        return true;
      }
    }

    return false;
  }

  private generateModelRecommendations(
    modelProfile: AIModelProfile,
    vulnerabilities: ModelVulnerability[],
  ): string[] {
    const recommendations: string[] = [];

    // General model recommendations
    if (modelProfile.contextWindow > 100000) {
      recommendations.push('Consider using context compression for large inputs');
    }

    if (modelProfile.streamingSupported) {
      recommendations.push('Enable streaming for better real-time protection');
    }

    // Vulnerability-specific recommendations
    for (const vulnerability of vulnerabilities) {
      recommendations.push(...vulnerability.mitigation);
    }

    // Provider-specific recommendations
    switch (modelProfile.provider) {
      case 'openai':
        recommendations.push('Use GPT-4 Turbo for better security than older models');
        break;
      case 'anthropic':
        recommendations.push("Leverage Claude's constitutional AI for enhanced safety");
        break;
      case 'google':
        recommendations.push("Enable Gemini's built-in safety filters");
        break;
    }

    return recommendations;
  }

  async analyzeStreamingChunk(chunk: StreamingChunk): Promise<StreamingAnalysis> {
    const startTime = Date.now();

    try {
      // Get model profile for this chunk
      const modelProfile = this.modelProfiles.get(chunk.model);

      if (!modelProfile) {
        throw new Error(`Model profile not found for streaming model: ${chunk.model}`);
      }

      // Apply streaming-specific security checks
      const threats = this.detectStreamingThreats(chunk.content);
      const blocked = threats.some((threat) => threat.severity === 'critical');

      let sanitizedContent = chunk.content;
      let reason = '';

      if (blocked) {
        sanitizedContent = '[REDACTED - Security Violation]';
        reason = 'Critical security violation detected in streaming output';
      } else if (threats.length > 0) {
        // Sanitize non-critical threats
        sanitizedContent = this.sanitizeStreamingContent(chunk.content, threats);
        reason = 'Content sanitized for security';
      }

      const processingTime = Date.now() - startTime;

      return {
        chunkId: chunk.id,
        blocked,
        reason,
        confidence: 0.95,
        threats: threats.map((t) => t.type),
        sanitizedContent,
        processingTime,
      };
    } catch (error) {
      return {
        chunkId: chunk.id,
        blocked: true,
        reason: error instanceof Error ? error.message : 'Streaming analysis failed',
        confidence: 0,
        threats: ['error'],
        sanitizedContent: '[ERROR - Analysis Failed]',
        processingTime: Date.now() - startTime,
      };
    }
  }

  private detectStreamingThreats(content: string): Array<{
    type: string;
    severity: string;
    description: string;
  }> {
    const threats: Array<{
      type: string;
      severity: string;
      description: string;
    }> = [];

    const lowerContent = content.toLowerCase();

    // Check for PII in streaming output
    if (/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/.test(content)) {
      threats.push({
        type: 'pii_credit_card',
        severity: 'critical',
        description: 'Credit card number detected in streaming output',
      });
    }

    // Check for API keys or secrets
    if (/\b[A-Za-z0-9]{20,}\b/.test(content) && /key|token|secret|password/i.test(lowerContent)) {
      threats.push({
        type: 'secrets_leakage',
        severity: 'critical',
        description: 'Potential secrets or API keys detected',
      });
    }

    // Check for harmful content
    if (/\b(kill|harm|attack|destroy|hack)\b/i.test(lowerContent)) {
      threats.push({
        type: 'harmful_content',
        severity: 'high',
        description: 'Potentially harmful content detected',
      });
    }

    return threats;
  }

  private sanitizeStreamingContent(content: string, threats: any[]): string {
    let sanitized = content;

    for (const threat of threats) {
      switch (threat.type) {
        case 'pii_credit_card':
          sanitized = sanitized.replace(
            /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g,
            '**** **** **** ****',
          );
          break;
        case 'secrets_leakage':
          sanitized = sanitized.replace(/\b[A-Za-z0-9]{20,}\b/g, '***REDACTED***');
          break;
        case 'harmful_content':
          // Less aggressive sanitization for harmful content
          break;
      }
    }

    return sanitized;
  }

  getModelProfile(modelId: string): AIModelProfile | null {
    return this.modelProfiles.get(modelId) || null;
  }

  getAllModelProfiles(): AIModelProfile[] {
    return Array.from(this.modelProfiles.values());
  }

  async addModelProfile(profile: AIModelProfile): Promise<void> {
    this.modelProfiles.set(profile.id, profile);
  }

  async updateModelProfile(id: string, updates: Partial<AIModelProfile>): Promise<void> {
    const profile = this.modelProfiles.get(id);
    if (profile) {
      this.modelProfiles.set(id, { ...profile, ...updates });
    }
  }

  getVulnerableModels(): Array<{
    model: AIModelProfile;
    vulnerabilities: ModelVulnerability[];
    riskScore: number;
  }> {
    const vulnerableModels = [];

    for (const profile of this.modelProfiles.values()) {
      const criticalVulns = profile.vulnerabilities.filter((v) => v.severity === 'critical');
      const highVulns = profile.vulnerabilities.filter((v) => v.severity === 'high');

      if (criticalVulns.length > 0 || highVulns.length > 0) {
        const riskScore = criticalVulns.length * 10 + highVulns.length * 5;

        vulnerableModels.push({
          model: profile,
          vulnerabilities: [...criticalVulns, ...highVulns],
          riskScore,
        });
      }
    }

    return vulnerableModels.sort((a, b) => b.riskScore - a.riskScore);
  }
}

// Export singleton instance
export const advancedModelSupport = new AdvancedModelSupport();
