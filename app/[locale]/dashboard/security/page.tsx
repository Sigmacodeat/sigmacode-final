/**
 * Advanced Security Dashboard - Threat Intelligence & Compliance
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  Eye,
  Lock,
  Globe,
  Zap,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
  Users,
  Database,
  Server,
  Network,
  Target,
  BarChart3,
  Settings,
  Download,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';

interface Threat {
  id: string;
  type: 'malware' | 'ddos' | 'injection' | 'xss' | 'brute_force' | 'recon';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  timestamp: Date;
  status: 'active' | 'blocked' | 'investigating' | 'resolved';
  description: string;
  indicators: string[];
}

interface SecurityMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

interface ComplianceReport {
  standard: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'pending';
  score: number;
  lastAudit: Date;
  nextAudit: Date;
  issues: string[];
}

interface FirewallRule {
  id: string;
  name: string;
  type: 'allow' | 'block' | 'rate_limit' | 'custom';
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
  hits: number;
  lastHit?: Date;
}

export default function SecurityDashboard({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [activeTab, setActiveTab] = useState<'overview' | 'threats' | 'rules' | 'compliance'>(
    'overview',
  );
  const [threats, setThreats] = useState<Threat[]>([]);
  const [rules, setRules] = useState<FirewallRule[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      // Mock data - in production, fetch from security APIs
      const mockThreats: Threat[] = [
        {
          id: '1',
          type: 'injection',
          severity: 'high',
          source: '192.168.1.100',
          target: '/api/users',
          timestamp: new Date(Date.now() - 300000),
          status: 'blocked',
          description: 'SQL injection attempt detected in user login endpoint',
          indicators: ['UNION SELECT', 'DROP TABLE', 'suspicious payload'],
        },
        {
          id: '2',
          type: 'ddos',
          severity: 'critical',
          source: 'Multiple IPs',
          target: 'Global',
          timestamp: new Date(Date.now() - 600000),
          status: 'investigating',
          description: 'Distributed denial of service attack detected',
          indicators: ['High traffic volume', 'Botnet patterns', 'SYN flood'],
        },
        {
          id: '3',
          type: 'xss',
          severity: 'medium',
          source: '203.0.113.45',
          target: '/contact',
          timestamp: new Date(Date.now() - 900000),
          status: 'resolved',
          description: 'Cross-site scripting attempt in contact form',
          indicators: ['<script> tag', 'onload event', 'document.cookie'],
        },
      ];

      const mockRules: FirewallRule[] = [
        {
          id: '1',
          name: 'Block SQL Injection',
          type: 'block',
          condition: 'Request contains SQL keywords',
          action: 'Block and log',
          priority: 1,
          enabled: true,
          hits: 45,
          lastHit: new Date(Date.now() - 180000),
        },
        {
          id: '2',
          name: 'Rate Limit API',
          type: 'rate_limit',
          condition: 'API requests > 100/min per IP',
          action: 'Rate limit to 10 req/min',
          priority: 2,
          enabled: true,
          hits: 234,
          lastHit: new Date(Date.now() - 60000),
        },
        {
          id: '3',
          name: 'Allow Trusted IPs',
          type: 'allow',
          condition: 'Source IP in trusted list',
          action: 'Allow without checks',
          priority: 10,
          enabled: true,
          hits: 1250,
          lastHit: new Date(Date.now() - 30000),
        },
      ];

      const mockCompliance: ComplianceReport[] = [
        {
          standard: 'SOC 2 Type II',
          status: 'compliant',
          score: 95,
          lastAudit: new Date('2024-08-15'),
          nextAudit: new Date('2025-08-15'),
          issues: [],
        },
        {
          standard: 'GDPR',
          status: 'partial',
          score: 78,
          lastAudit: new Date('2024-07-01'),
          nextAudit: new Date('2025-07-01'),
          issues: ['Data retention policy needs update', 'Consent mechanism review required'],
        },
        {
          standard: 'ISO 27001',
          status: 'pending',
          score: 0,
          lastAudit: new Date('2024-06-01'),
          nextAudit: new Date('2025-06-01'),
          issues: ['Initial audit scheduled'],
        },
      ];

      setThreats(mockThreats);
      setRules(mockRules);
      setComplianceReports(mockCompliance);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics: SecurityMetric[] = [
    {
      title: 'Active Threats',
      value: threats.filter((t) => t.status === 'active').length.toString(),
      change: '+2',
      trend: 'up',
      icon: AlertTriangle,
      color: 'text-red-600',
    },
    {
      title: 'Blocked Attacks',
      value: threats.filter((t) => t.status === 'blocked').length.toString(),
      change: '+15%',
      trend: 'down',
      icon: Shield,
      color: 'text-green-600',
    },
    {
      title: 'Security Score',
      value: '94/100',
      change: '+2',
      trend: 'up',
      icon: Target,
      color: 'text-blue-600',
    },
    {
      title: 'Compliance Rate',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-purple-600',
    },
  ];

  const getThreatIcon = (type: Threat['type']) => {
    switch (type) {
      case 'ddos':
        return <Network className="h-4 w-4" />;
      case 'injection':
        return <Database className="h-4 w-4" />;
      case 'xss':
        return <Globe className="h-4 w-4" />;
      case 'brute_force':
        return <Lock className="h-4 w-4" />;
      case 'recon':
        return <Eye className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: Threat['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusColor = (status: Threat['status']) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'blocked':
        return 'bg-green-100 text-green-800';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportSecurityReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      threats: threats.length,
      activeThreats: threats.filter((t) => t.status === 'active').length,
      blockedThreats: threats.filter((t) => t.status === 'blocked').length,
      complianceScore: 87,
      topThreats: threats.slice(0, 5).map((t) => ({
        type: t.type,
        severity: t.severity,
        status: t.status,
        timestamp: t.timestamp,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Advanced Security</h1>
            <p className="text-sm text-muted-foreground">
              Threat intelligence, compliance monitoring, and advanced security controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadSecurityData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportSecurityReport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      <DashboardBreadcrumbs />

      {/* Tab Navigation */}
      <div className="flex border-b">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'threats', label: 'Threat Intelligence', icon: AlertTriangle },
          { id: 'rules', label: 'Firewall Rules', icon: Shield },
          { id: 'compliance', label: 'Compliance', icon: FileText },
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
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Security Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p
                      className={`text-xs flex items-center gap-1 ${
                        metric.trend === 'up'
                          ? 'text-green-600'
                          : metric.trend === 'down'
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }`}
                    >
                      <TrendingUp
                        className={`h-3 w-3 ${metric.trend === 'down' ? 'rotate-180' : ''}`}
                      />
                      {metric.change} from last week
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg bg-gray-100`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Threats & Compliance Status */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Threats */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent Threats
              </h3>
              <div className="space-y-3">
                {threats.slice(0, 5).map((threat) => (
                  <div key={threat.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">{getThreatIcon(threat.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {threat.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(threat.severity)}`}
                        >
                          {threat.severity}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(threat.status)}`}
                        >
                          {threat.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{threat.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {threat.timestamp.toLocaleString()} • {threat.source}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Overview */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Compliance Status
              </h3>
              <div className="space-y-4">
                {complianceReports.map((report) => (
                  <div key={report.standard} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{report.standard}</h4>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            report.status === 'compliant'
                              ? 'bg-green-100 text-green-800'
                              : report.status === 'partial'
                                ? 'bg-yellow-100 text-yellow-800'
                                : report.status === 'non_compliant'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {report.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium">{report.score}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full ${
                          report.status === 'compliant'
                            ? 'bg-green-500'
                            : report.status === 'partial'
                              ? 'bg-yellow-500'
                              : report.status === 'non_compliant'
                                ? 'bg-red-500'
                                : 'bg-gray-500'
                        }`}
                        style={{ width: `${report.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last audit: {report.lastAudit.toLocaleDateString()} • Next:{' '}
                      {report.nextAudit.toLocaleDateString()}
                    </p>
                    {report.issues.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-red-600">Issues:</p>
                        <ul className="text-xs text-muted-foreground list-disc list-inside">
                          {report.issues.slice(0, 2).map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'threats' && (
        <div className="bg-card rounded-lg border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Threat Intelligence</h2>
              <div className="flex items-center gap-3">
                <select className="px-3 py-1 border rounded text-sm">
                  <option>All Types</option>
                  <option>SQL Injection</option>
                  <option>XSS</option>
                  <option>DDoS</option>
                  <option>Brute Force</option>
                </select>
                <select className="px-3 py-1 border rounded text-sm">
                  <option>All Severities</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="divide-y">
            {threats.map((threat) => (
              <div key={threat.id} className="p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">{getThreatIcon(threat.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">
                          {threat.type.replace('_', ' ').toUpperCase()}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(threat.severity)}`}
                        >
                          {threat.severity}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(threat.status)}`}
                        >
                          {threat.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{threat.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Source: {threat.source}</span>
                        <span>Target: {threat.target}</span>
                        <span>{threat.timestamp.toLocaleString()}</span>
                      </div>
                      {threat.indicators.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Indicators:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {threat.indicators.map((indicator, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded">
                                {indicator}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 text-sm border rounded hover:bg-accent">
                      Investigate
                    </button>
                    {threat.status !== 'resolved' && (
                      <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Firewall Rules</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              <Settings className="h-4 w-4" />
              Add Rule
            </button>
          </div>

          <div className="grid gap-4">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        rule.enabled ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                    <h3 className="font-medium">{rule.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        rule.type === 'allow'
                          ? 'bg-green-100 text-green-800'
                          : rule.type === 'block'
                            ? 'bg-red-100 text-red-800'
                            : rule.type === 'rate_limit'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {rule.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Priority: {rule.priority}</span>
                    <button className="p-1 hover:bg-accent rounded">
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Condition</p>
                    <p>{rule.condition}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Action</p>
                    <p>{rule.action}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Statistics</p>
                    <p>Hits: {rule.hits.toLocaleString()}</p>
                    {rule.lastHit && (
                      <p className="text-xs text-muted-foreground">
                        Last: {rule.lastHit.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Compliance Reports</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              <Download className="h-4 w-4" />
              Generate Report
            </button>
          </div>

          <div className="grid gap-6">
            {complianceReports.map((report) => (
              <div key={report.standard} className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{report.standard}</h3>
                    <p className="text-sm text-muted-foreground">
                      Compliance Score: {report.score}%
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        report.status === 'compliant'
                          ? 'bg-green-100 text-green-800'
                          : report.status === 'partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : report.status === 'non_compliant'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {report.status === 'compliant' && <CheckCircle className="h-4 w-4" />}
                      {report.status === 'non_compliant' && <XCircle className="h-4 w-4" />}
                      {report.status.charAt(0).toUpperCase() +
                        report.status.slice(1).replace('_', ' ')}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className={`h-3 rounded-full ${
                      report.status === 'compliant'
                        ? 'bg-green-500'
                        : report.status === 'partial'
                          ? 'bg-yellow-500'
                          : report.status === 'non_compliant'
                            ? 'bg-red-500'
                            : 'bg-gray-500'
                    }`}
                    style={{ width: `${report.score}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Audit</p>
                    <p className="text-sm">{report.lastAudit.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Next Audit</p>
                    <p className="text-sm">{report.nextAudit.toLocaleDateString()}</p>
                  </div>
                </div>

                {report.issues.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Issues & Recommendations</h4>
                    <ul className="space-y-1">
                      {report.issues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
