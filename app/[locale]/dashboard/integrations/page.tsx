/**
 * Integration Hub - Third-Party Service Integrations
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Link,
  Slack,
  Github,
  GitBranch,
  MessageSquare,
  Calendar,
  Mail,
  Database,
  Cloud,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Key,
  Plus,
  Trash2,
  RefreshCw,
  Zap,
  Webhook,
} from 'lucide-react';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'communication' | 'development' | 'productivity' | 'analytics' | 'storage' | 'other';
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  lastSync?: Date;
  errorMessage?: string;
  webhookUrl?: string;
  apiKey?: string;
  config: Record<string, any>;
}

interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: Integration['category'];
  setupSteps: string[];
  requiredPermissions: string[];
  webhookSupport: boolean;
}

const integrationTemplates: IntegrationTemplate[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    icon: Slack,
    category: 'communication',
    setupSteps: [
      'Create a Slack App in your workspace',
      'Configure OAuth permissions',
      'Add webhook URLs for notifications',
      'Install the app to your workspace',
    ],
    requiredPermissions: ['channels:read', 'chat:write', 'users:read'],
    webhookSupport: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Code repository and CI/CD integration',
    icon: Github,
    category: 'development',
    setupSteps: [
      'Create a GitHub App or Personal Access Token',
      'Configure repository permissions',
      'Set up webhooks for push events',
      'Configure branch protection rules',
    ],
    requiredPermissions: ['repo', 'workflow', 'read:org'],
    webhookSupport: true,
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Project management and issue tracking',
    icon: GitBranch,
    category: 'productivity',
    setupSteps: [
      'Create API token in Jira',
      'Configure project permissions',
      'Set up webhook for issue updates',
      'Map workflows to Jira statuses',
    ],
    requiredPermissions: ['read:jira-work', 'write:jira-work'],
    webhookSupport: true,
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Calendar integration and scheduling',
    icon: Calendar,
    category: 'productivity',
    setupSteps: [
      'Create Google Cloud Project',
      'Enable Calendar API',
      'Configure OAuth consent screen',
      'Generate service account credentials',
    ],
    requiredPermissions: ['https://www.googleapis.com/auth/calendar'],
    webhookSupport: true,
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery and marketing automation',
    icon: Mail,
    category: 'communication',
    setupSteps: [
      'Create SendGrid account',
      'Generate API key',
      'Configure domain authentication',
      'Set up email templates',
    ],
    requiredPermissions: ['mail.send', 'templates.read'],
    webhookSupport: true,
  },
  {
    id: 'datadog',
    name: 'DataDog',
    description: 'Application monitoring and analytics',
    icon: Database,
    category: 'analytics',
    setupSteps: [
      'Create DataDog account',
      'Install agent on servers',
      'Configure APM and logs',
      'Set up dashboards and alerts',
    ],
    requiredPermissions: ['metrics_read', 'logs_read', 'events_read'],
    webhookSupport: false,
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: 'Cloud storage and file management',
    icon: Cloud,
    category: 'storage',
    setupSteps: [
      'Create AWS account and IAM user',
      'Configure S3 bucket permissions',
      'Generate access keys',
      'Set up bucket policies',
    ],
    requiredPermissions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
    webhookSupport: false,
  },
];

const categoryColors = {
  communication: 'bg-blue-100 text-blue-800',
  development: 'bg-green-100 text-green-800',
  productivity: 'bg-purple-100 text-purple-800',
  analytics: 'bg-orange-100 text-orange-800',
  storage: 'bg-gray-100 text-gray-800',
  other: 'bg-indigo-100 text-indigo-800',
};

export default function IntegrationHubPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [activeTab, setActiveTab] = useState<'connected' | 'available' | 'webhooks'>('connected');
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      // Mock data - in production, fetch from API
      const mockIntegrations: Integration[] = [
        {
          id: 'slack-1',
          name: 'Slack',
          description: 'Team communication workspace',
          icon: Slack,
          category: 'communication',
          status: 'connected',
          lastSync: new Date(Date.now() - 300000),
          webhookUrl: 'https://hooks.slack.com/services/...',
          config: {
            workspace: 'sigma-code',
            channels: ['general', 'dev', 'alerts'],
          },
        },
        {
          id: 'github-1',
          name: 'GitHub',
          description: 'Main repository integration',
          icon: Github,
          category: 'development',
          status: 'connected',
          lastSync: new Date(Date.now() - 600000),
          webhookUrl: 'https://github.com/webhooks/...',
          config: {
            owner: 'sigma-code',
            repos: ['frontend', 'backend', 'api'],
          },
        },
        {
          id: 'datadog-1',
          name: 'DataDog',
          description: 'Application monitoring',
          icon: Database,
          category: 'analytics',
          status: 'error',
          lastSync: new Date(Date.now() - 3600000),
          errorMessage: 'API key expired',
          config: {
            region: 'us-east-1',
            environment: 'production',
          },
        },
      ];

      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectIntegration = async (template: IntegrationTemplate) => {
    setSelectedTemplate(template);
    setShowSetupModal(true);
  };

  const testIntegration = async (integration: Integration) => {
    // Mock test - in production, call actual API
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === integration.id
            ? { ...i, status: 'connected', lastSync: new Date(), errorMessage: undefined }
            : i,
        ),
      );
    }, 2000);
  };

  const disconnectIntegration = async (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === integrationId
          ? { ...i, status: 'disconnected', webhookUrl: undefined, apiKey: undefined }
          : i,
      ),
    );
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'configuring':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50';
      case 'disconnected':
        return 'text-gray-600 bg-gray-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'configuring':
        return 'text-blue-600 bg-blue-50';
    }
  };

  const filteredIntegrations = integrations.filter((integration) => {
    switch (activeTab) {
      case 'connected':
        return integration.status === 'connected';
      case 'available':
        return integration.status === 'disconnected';
      case 'webhooks':
        return integration.webhookUrl;
      default:
        return true;
    }
  });

  const availableTemplates = integrationTemplates.filter(
    (template) => !integrations.some((i) => i.name.toLowerCase() === template.name.toLowerCase()),
  );

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
            <Link className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Integration Hub</h1>
            <p className="text-sm text-muted-foreground">
              Connect and manage third-party services and APIs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadIntegrations}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <DashboardBreadcrumbs />

      {/* Integration Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {integrations.filter((i) => i.status === 'connected').length}
              </p>
              <p className="text-sm text-muted-foreground">Connected</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {integrations.filter((i) => i.status === 'error').length}
              </p>
              <p className="text-sm text-muted-foreground">Errors</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Webhook className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {integrations.filter((i) => i.webhookUrl).length}
              </p>
              <p className="text-sm text-muted-foreground">Webhooks</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{integrationTemplates.length}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        {[
          {
            id: 'connected',
            label: 'Connected Services',
            count: integrations.filter((i) => i.status === 'connected').length,
          },
          { id: 'available', label: 'Available Integrations', count: availableTemplates.length },
          {
            id: 'webhooks',
            label: 'Webhooks',
            count: integrations.filter((i) => i.webhookUrl).length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'connected' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Connected Services</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredIntegrations.map((integration) => (
              <div key={integration.id} className="bg-card rounded-lg border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <integration.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(integration.status)}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(integration.status)}`}
                    >
                      {integration.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {integration.lastSync && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last sync:</span>
                      <span>{integration.lastSync.toLocaleString()}</span>
                    </div>
                  )}

                  {integration.errorMessage && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      {integration.errorMessage}
                    </div>
                  )}

                  {integration.webhookUrl && (
                    <div className="flex items-center gap-2 text-xs">
                      <Webhook className="h-3 w-3" />
                      <span className="text-muted-foreground">Webhook configured</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => testIntegration(integration)}
                      className="flex-1 px-3 py-2 text-sm border rounded hover:bg-accent"
                    >
                      Test Connection
                    </button>
                    <button
                      onClick={() => disconnectIntegration(integration.id)}
                      className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredIntegrations.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No connected services</p>
                <p className="text-sm">Switch to "Available Integrations" to add new services</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'available' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available Integrations</h2>
            <div className="flex items-center gap-3">
              <select className="px-3 py-1 border rounded text-sm">
                <option>All Categories</option>
                <option>Communication</option>
                <option>Development</option>
                <option>Productivity</option>
                <option>Analytics</option>
                <option>Storage</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <template.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${categoryColors[template.category]}`}
                      >
                        {template.category}
                      </span>
                    </div>
                  </div>
                  {template.webhookSupport && <Webhook className="h-4 w-4 text-green-500" />}
                </div>

                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    <strong>Permissions needed:</strong> {template.requiredPermissions.length}
                  </div>

                  <button
                    onClick={() => connectIntegration(template)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    Connect {template.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Webhook Management</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Add Webhook
            </button>
          </div>

          <div className="space-y-4">
            {integrations
              .filter((i) => i.webhookUrl)
              .map((integration) => (
                <div key={integration.id} className="bg-card rounded-lg border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <integration.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">Webhook endpoint configured</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integration.status)}
                      <button className="p-1 hover:bg-accent rounded">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded font-mono text-xs mb-4">
                    {integration.webhookUrl}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        Last sync: {integration.lastSync?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 text-sm border rounded hover:bg-accent">
                        Test Webhook
                      </button>
                      <button className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {integrations.filter((i) => i.webhookUrl).length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No webhooks configured</p>
                <p className="text-sm">
                  Connect services with webhook support to enable real-time updates
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Setup Modal */}
      {showSetupModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <selectedTemplate.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Setup {selectedTemplate.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSetupModal(false)}
                className="p-2 hover:bg-accent rounded"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Setup Steps</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {selectedTemplate.setupSteps.map((step, index) => (
                    <li key={index} className="text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-3">Required Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.requiredPermissions.map((permission, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Documentation</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      Need help? Check our integration documentation for detailed setup
                      instructions.
                    </p>
                    <button className="mt-2 text-sm text-blue-600 hover:underline">
                      View Documentation →
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSetupModal(false)}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-accent"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  Start Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
