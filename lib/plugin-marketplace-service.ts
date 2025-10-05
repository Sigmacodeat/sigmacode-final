// SIGMACODE Plugin Marketplace
// Extensible Security Plugin Store and Management

export interface SecurityPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'detector' | 'filter' | 'analyzer' | 'reporter' | 'integration';
  type: 'official' | 'community' | 'enterprise' | 'custom';
  capabilities: string[];
  configuration: PluginConfiguration;
  dependencies: string[];
  compatibility: string[];
  rating: {
    average: number;
    count: number;
    reviews: PluginReview[];
  };
  downloadCount: number;
  price: {
    type: 'free' | 'one_time' | 'subscription' | 'usage_based';
    amount: number;
    currency: string;
    period?: string;
  };
  license: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'deprecated' | 'disabled';
  metadata: Record<string, any>;
}

export interface PluginConfiguration {
  schema: Record<string, any>;
  defaultValues: Record<string, any>;
  requiredFields: string[];
  validation: (config: Record<string, any>) => boolean;
  description: string;
}

export interface PluginReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  createdAt: Date;
  verified: boolean;
}

export interface PluginInstallation {
  id: string;
  pluginId: string;
  version: string;
  configuration: Record<string, any>;
  enabled: boolean;
  installedAt: Date;
  lastUsed: Date;
  usageStats: {
    requestsProcessed: number;
    threatsDetected: number;
    averageLatency: number;
  };
}

export interface MarketplaceStats {
  totalPlugins: number;
  activePlugins: number;
  totalDownloads: number;
  categories: Record<string, number>;
  topRated: SecurityPlugin[];
  recentlyUpdated: SecurityPlugin[];
  featured: SecurityPlugin[];
}

export class PluginMarketplaceService {
  private plugins: Map<string, SecurityPlugin> = new Map();
  private installations: Map<string, PluginInstallation[]> = new Map(); // userId -> installations
  private marketplaceStats: MarketplaceStats | undefined;

  constructor() {
    this.initializeMarketplace();
    this.calculateStats();
  }

  private initializeMarketplace(): void {
    // Initialize with built-in plugins
    const builtInPlugins: SecurityPlugin[] = [
      {
        id: 'pii-detector-advanced',
        name: 'Advanced PII Detector',
        version: '2.1.0',
        description: 'Comprehensive PII detection with ML-powered pattern recognition',
        author: 'SIGMACODE',
        category: 'detector',
        type: 'official',
        capabilities: ['pii_detection', 'pattern_recognition', 'ml_powered'],
        configuration: {
          schema: {
            sensitivity: { type: 'number', min: 0, max: 1, default: 0.8 },
            enableML: { type: 'boolean', default: true },
            customPatterns: { type: 'array', default: [] },
          },
          defaultValues: {
            sensitivity: 0.8,
            enableML: true,
            customPatterns: [],
          },
          requiredFields: ['sensitivity'],
          validation: (config) => config.sensitivity >= 0 && config.sensitivity <= 1,
          description: 'Configure PII detection sensitivity and ML features',
        },
        dependencies: [],
        compatibility: ['>=1.0.0'],
        rating: {
          average: 4.8,
          count: 1250,
          reviews: [],
        },
        downloadCount: 15420,
        price: { type: 'free', amount: 0, currency: 'USD' },
        license: 'MIT',
        tags: ['pii', 'ml', 'detection'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        status: 'active',
        metadata: {
          verified: true,
          featured: true,
          documentation: 'https://docs.sigmaguard.ai/plugins/pii-detector',
        },
      },
      {
        id: 'jailbreak-shield',
        name: 'Jailbreak Shield',
        version: '1.5.0',
        description: 'Advanced jailbreak attempt detection and prevention',
        author: 'SecurityResearch Institute',
        category: 'filter',
        type: 'community',
        capabilities: ['jailbreak_detection', 'prompt_analysis', 'behavior_monitoring'],
        configuration: {
          schema: {
            strictness: { type: 'enum', values: ['low', 'medium', 'high'], default: 'medium' },
            customRules: { type: 'array', default: [] },
            autoUpdate: { type: 'boolean', default: true },
          },
          defaultValues: {
            strictness: 'medium',
            customRules: [],
            autoUpdate: true,
          },
          requiredFields: ['strictness'],
          validation: (config) => ['low', 'medium', 'high'].includes(config.strictness),
          description: 'Configure jailbreak detection strictness and custom rules',
        },
        dependencies: ['pii-detector-advanced'],
        compatibility: ['>=1.2.0'],
        rating: {
          average: 4.6,
          count: 890,
          reviews: [],
        },
        downloadCount: 8750,
        price: { type: 'free', amount: 0, currency: 'USD' },
        license: 'Apache-2.0',
        tags: ['jailbreak', 'security', 'filter'],
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date(),
        status: 'active',
        metadata: {
          verified: true,
          featured: false,
          documentation: 'https://github.com/SecurityResearch/jailbreak-shield',
        },
      },
      {
        id: 'compliance-monitor',
        name: 'Compliance Monitor',
        version: '3.0.0',
        description: 'GDPR, HIPAA, SOX compliance monitoring and reporting',
        author: 'ComplianceCorp',
        category: 'reporter',
        type: 'enterprise',
        capabilities: ['compliance_monitoring', 'audit_reporting', 'policy_enforcement'],
        configuration: {
          schema: {
            regulations: { type: 'array', default: ['gdpr'] },
            reportingFrequency: {
              type: 'enum',
              values: ['daily', 'weekly', 'monthly'],
              default: 'weekly',
            },
            retentionPeriod: { type: 'number', default: 365 },
            alertThreshold: { type: 'number', default: 5 },
          },
          defaultValues: {
            regulations: ['gdpr'],
            reportingFrequency: 'weekly',
            retentionPeriod: 365,
            alertThreshold: 5,
          },
          requiredFields: ['regulations'],
          validation: (config) =>
            Array.isArray(config.regulations) && config.regulations.length > 0,
          description: 'Configure compliance regulations and reporting settings',
        },
        dependencies: ['pii-detector-advanced'],
        compatibility: ['>=2.0.0'],
        rating: {
          average: 4.9,
          count: 450,
          reviews: [],
        },
        downloadCount: 3200,
        price: { type: 'subscription', amount: 99, currency: 'USD', period: 'month' },
        license: 'Commercial',
        tags: ['compliance', 'gdpr', 'hipaa', 'reporting'],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date(),
        status: 'active',
        metadata: {
          verified: true,
          featured: true,
          documentation: 'https://docs.compliancecorp.com/monitor',
        },
      },
      {
        id: 'custom-regex-filter',
        name: 'Custom Regex Filter',
        version: '1.0.0',
        description: 'Create custom regex-based security filters',
        author: 'DevCommunity',
        category: 'filter',
        type: 'community',
        capabilities: ['regex_filtering', 'custom_rules', 'pattern_matching'],
        configuration: {
          schema: {
            patterns: { type: 'array', default: [] },
            actions: { type: 'enum', values: ['block', 'redact', 'alert'], default: 'block' },
            caseSensitive: { type: 'boolean', default: false },
          },
          defaultValues: {
            patterns: [],
            actions: 'block',
            caseSensitive: false,
          },
          requiredFields: ['patterns'],
          validation: (config) => Array.isArray(config.patterns) && config.patterns.length > 0,
          description: 'Define custom regex patterns and actions',
        },
        dependencies: [],
        compatibility: ['>=1.0.0'],
        rating: {
          average: 4.2,
          count: 320,
          reviews: [],
        },
        downloadCount: 2100,
        price: { type: 'free', amount: 0, currency: 'USD' },
        license: 'MIT',
        tags: ['regex', 'custom', 'filter'],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date(),
        status: 'active',
        metadata: {
          verified: false,
          featured: false,
          documentation: 'https://github.com/DevCommunity/custom-regex-filter',
        },
      },
    ];

    for (const plugin of builtInPlugins) {
      this.plugins.set(plugin.id, plugin);
    }
  }

  async searchPlugins(query: {
    search?: string;
    category?: string;
    type?: string;
    price?: string[];
    rating?: number;
    tags?: string[];
    sortBy?: 'name' | 'rating' | 'downloads' | 'updated';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{
    plugins: SecurityPlugin[];
    total: number;
    hasMore: boolean;
  }> {
    let results = Array.from(this.plugins.values()).filter((plugin) => plugin.status === 'active');

    // Apply filters
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      results = results.filter(
        (plugin) =>
          plugin.name.toLowerCase().includes(searchTerm) ||
          plugin.description.toLowerCase().includes(searchTerm) ||
          plugin.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
      );
    }

    if (query.category) {
      results = results.filter((plugin) => plugin.category === query.category);
    }

    if (query.type) {
      results = results.filter((plugin) => plugin.type === query.type);
    }

    if (query.price && query.price.length > 0) {
      results = results.filter((plugin) => query.price!.includes(plugin.price.type));
    }

    if (query.rating) {
      results = results.filter((plugin) => plugin.rating.average >= query.rating!);
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter((plugin) => query.tags!.some((tag) => plugin.tags.includes(tag)));
    }

    // Apply sorting
    const sortBy = query.sortBy || 'name';
    const sortOrder = query.sortOrder || 'asc';

    results.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'rating':
          aValue = a.rating.average;
          bValue = b.rating.average;
          break;
        case 'downloads':
          aValue = a.downloadCount;
          bValue = b.downloadCount;
          break;
        case 'updated':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const total = results.length;
    const limit = query.limit || 20;
    const offset = query.offset || 0;
    const paginatedResults = results.slice(offset, offset + limit);

    return {
      plugins: paginatedResults,
      total,
      hasMore: offset + limit < total,
    };
  }

  async getPluginDetails(pluginId: string): Promise<SecurityPlugin | null> {
    return this.plugins.get(pluginId) || null;
  }

  async installPlugin(
    userId: string,
    pluginId: string,
    configuration: Record<string, any> = {},
  ): Promise<PluginInstallation> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    // Validate configuration
    if (!plugin.configuration.validation(configuration)) {
      throw new Error('Invalid plugin configuration');
    }

    // Check dependencies
    for (const dep of plugin.dependencies) {
      const userInstallations = this.installations.get(userId) || [];
      const hasDependency = userInstallations.some((inst) => inst.pluginId === dep && inst.enabled);

      if (!hasDependency) {
        throw new Error(`Missing dependency: ${dep}`);
      }
    }

    const installation: PluginInstallation = {
      id: `install_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pluginId,
      version: plugin.version,
      configuration,
      enabled: true,
      installedAt: new Date(),
      lastUsed: new Date(),
      usageStats: {
        requestsProcessed: 0,
        threatsDetected: 0,
        averageLatency: 0,
      },
    };

    const userInstallations = this.installations.get(userId) || [];
    userInstallations.push(installation);
    this.installations.set(userId, userInstallations);

    // Update download count
    plugin.downloadCount++;
    this.plugins.set(pluginId, plugin);

    // Recalculate stats
    this.calculateStats();

    return installation;
  }

  async uninstallPlugin(userId: string, installationId: string): Promise<void> {
    const userInstallations = this.installations.get(userId) || [];
    const index = userInstallations.findIndex((inst) => inst.id === installationId);

    if (index > -1) {
      userInstallations.splice(index, 1);
      this.installations.set(userId, userInstallations);
    }

    this.calculateStats();
  }

  async updatePluginConfiguration(
    userId: string,
    installationId: string,
    configuration: Record<string, any>,
  ): Promise<void> {
    const userInstallations = this.installations.get(userId) || [];
    const installation = userInstallations.find((inst) => inst.id === installationId);

    if (installation) {
      installation.configuration = { ...installation.configuration, ...configuration };
      this.installations.set(userId, userInstallations);
    }
  }

  async enablePlugin(userId: string, installationId: string): Promise<void> {
    const userInstallations = this.installations.get(userId) || [];
    const installation = userInstallations.find((inst) => inst.id === installationId);

    if (installation) {
      installation.enabled = true;
      this.installations.set(userId, userInstallations);
    }
  }

  async disablePlugin(userId: string, installationId: string): Promise<void> {
    const userInstallations = this.installations.get(userId) || [];
    const installation = userInstallations.find((inst) => inst.id === installationId);

    if (installation) {
      installation.enabled = false;
      this.installations.set(userId, userInstallations);
    }
  }

  async addReview(
    pluginId: string,
    review: Omit<PluginReview, 'id' | 'createdAt' | 'verified'>,
  ): Promise<void> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    const newReview: PluginReview = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...review,
      createdAt: new Date(),
      verified: false, // Reviews need verification
    };

    plugin.rating.reviews.push(newReview);
    plugin.rating.count++;
    plugin.rating.average = this.calculateAverageRating(plugin.rating.reviews);

    this.plugins.set(pluginId, plugin);
  }

  private calculateAverageRating(reviews: PluginReview[]): number {
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }

  async addCustomPlugin(
    userId: string,
    plugin: Omit<SecurityPlugin, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'rating'>,
  ): Promise<SecurityPlugin> {
    const customPlugin: SecurityPlugin = {
      ...plugin,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      downloadCount: 0,
      rating: {
        average: 0,
        count: 0,
        reviews: [],
      },
      type: 'custom',
    };

    this.plugins.set(customPlugin.id, customPlugin);
    this.calculateStats();

    return customPlugin;
  }

  async updatePlugin(pluginId: string, updates: Partial<SecurityPlugin>): Promise<void> {
    const plugin = this.plugins.get(pluginId);

    if (plugin) {
      const updatedPlugin = { ...plugin, ...updates, updatedAt: new Date() };
      this.plugins.set(pluginId, updatedPlugin);
      this.calculateStats();
    }
  }

  async removePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);

    if (plugin && plugin.type === 'custom') {
      this.plugins.delete(pluginId);
      this.calculateStats();
    } else {
      throw new Error('Cannot remove non-custom plugins');
    }
  }

  getUserInstallations(userId: string): PluginInstallation[] {
    return this.installations.get(userId) || [];
  }

  getMarketplaceStats(): MarketplaceStats {
    if (!this.marketplaceStats) {
      this.calculateStats();
    }
    return this.marketplaceStats!;
  }

  private calculateStats(): void {
    const allPlugins = Array.from(this.plugins.values());
    const activePlugins = allPlugins.filter((p) => p.status === 'active');

    const categories: Record<string, number> = {};
    for (const plugin of activePlugins) {
      categories[plugin.category] = (categories[plugin.category] || 0) + 1;
    }

    const totalDownloads = allPlugins.reduce((sum, p) => sum + p.downloadCount, 0);

    // Sort for top rated and recently updated
    const topRated = [...activePlugins]
      .sort((a, b) => b.rating.average - a.rating.average)
      .slice(0, 10);
    const recentlyUpdated = [...activePlugins]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 10);

    // Featured plugins (official + high rating)
    const featured = activePlugins
      .filter((p) => p.type === 'official' || p.rating.average >= 4.5)
      .slice(0, 10);

    this.marketplaceStats = {
      totalPlugins: allPlugins.length,
      activePlugins: activePlugins.length,
      totalDownloads,
      categories,
      topRated,
      recentlyUpdated,
      featured,
    };
  }

  async validatePluginConfiguration(
    pluginId: string,
    configuration: Record<string, any>,
  ): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      return {
        valid: false,
        errors: ['Plugin not found'],
        warnings: [],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    for (const field of plugin.configuration.requiredFields) {
      if (!(field in configuration)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate against schema
    if (!plugin.configuration.validation(configuration)) {
      errors.push('Configuration validation failed');
    }

    // Check for unknown fields
    const knownFields = Object.keys(plugin.configuration.schema);
    for (const field of Object.keys(configuration)) {
      if (!knownFields.includes(field)) {
        warnings.push(`Unknown configuration field: ${field}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async getCompatiblePlugins(installationIds: string[]): Promise<SecurityPlugin[]> {
    const userInstallations = this.installations.get(installationIds.join(',')) || [];
    const installedPluginIds = new Set(userInstallations.map((inst) => inst.pluginId));

    return Array.from(this.plugins.values())
      .filter((plugin) => plugin.status === 'active')
      .filter((plugin) => {
        // Check if all dependencies are installed
        return plugin.dependencies.every((dep) => installedPluginIds.has(dep));
      });
  }

  async getPluginUsageStats(userId: string): Promise<{
    totalInstallations: number;
    activeInstallations: number;
    totalRequestsProcessed: number;
    totalThreatsDetected: number;
    averageLatency: number;
    topPlugins: Array<{
      pluginId: string;
      name: string;
      requestsProcessed: number;
      threatsDetected: number;
    }>;
  }> {
    const userInstallations = this.installations.get(userId) || [];

    const totalInstallations = userInstallations.length;
    const activeInstallations = userInstallations.filter((inst) => inst.enabled).length;

    const totalRequestsProcessed = userInstallations.reduce(
      (sum, inst) => sum + inst.usageStats.requestsProcessed,
      0,
    );

    const totalThreatsDetected = userInstallations.reduce(
      (sum, inst) => sum + inst.usageStats.threatsDetected,
      0,
    );

    const averageLatency =
      userInstallations.length > 0
        ? userInstallations.reduce((sum, inst) => sum + inst.usageStats.averageLatency, 0) /
          userInstallations.length
        : 0;

    const topPlugins = userInstallations
      .sort((a, b) => b.usageStats.requestsProcessed - a.usageStats.requestsProcessed)
      .slice(0, 5)
      .map((inst) => {
        const plugin = this.plugins.get(inst.pluginId);
        return {
          pluginId: inst.pluginId,
          name: plugin?.name || 'Unknown',
          requestsProcessed: inst.usageStats.requestsProcessed,
          threatsDetected: inst.usageStats.threatsDetected,
        };
      });

    return {
      totalInstallations,
      activeInstallations,
      totalRequestsProcessed,
      totalThreatsDetected,
      averageLatency,
      topPlugins,
    };
  }
}

// Export singleton instance
export const pluginMarketplaceService = new PluginMarketplaceService();
