/**
 * Advanced Performance Monitoring Dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Server,
  BarChart3,
  LineChart,
  PieChart,
  RefreshCw,
  Filter,
  Calendar,
  Target,
  Gauge,
  Thermometer,
  Lightbulb,
  Download,
} from 'lucide-react';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
}

interface SystemMetrics {
  cpu: PerformanceMetric;
  memory: PerformanceMetric;
  disk: PerformanceMetric;
  network: PerformanceMetric;
  responseTime: PerformanceMetric;
  throughput: PerformanceMetric;
  errorRate: PerformanceMetric;
  uptime: PerformanceMetric;
}

interface PerformanceAlert {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'response' | 'errors';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  value: number;
  threshold: number;
}

interface OptimizationSuggestion {
  id: string;
  category: 'database' | 'cache' | 'code' | 'infrastructure' | 'network';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  potentialGain: string;
  implemented: boolean;
}

interface APMData {
  metrics: SystemMetrics;
  alerts: PerformanceAlert[];
  suggestions: OptimizationSuggestion[];
  historicalData: Array<{
    timestamp: Date;
    cpu: number;
    memory: number;
    responseTime: number;
    requests: number;
  }>;
  recommendations: string[];
}

export default function PerformanceMonitoringPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'alerts' | 'optimization'>(
    'overview',
  );
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [apmData, setApmData] = useState<APMData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadPerformanceData();
    if (autoRefresh) {
      const interval = setInterval(loadPerformanceData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Mock performance data - in production, this would fetch from monitoring APIs
      const mockData: APMData = {
        metrics: {
          cpu: {
            name: 'CPU Usage',
            value: 67.5,
            unit: '%',
            trend: 'up',
            change: 5.2,
            threshold: 80,
            status: 'good',
          },
          memory: {
            name: 'Memory Usage',
            value: 73.2,
            unit: '%',
            trend: 'stable',
            change: -2.1,
            threshold: 85,
            status: 'good',
          },
          disk: {
            name: 'Disk Usage',
            value: 45.8,
            unit: '%',
            trend: 'down',
            change: -1.5,
            threshold: 90,
            status: 'good',
          },
          network: {
            name: 'Network I/O',
            value: 234.5,
            unit: 'Mbps',
            trend: 'up',
            change: 12.3,
            threshold: 500,
            status: 'good',
          },
          responseTime: {
            name: 'Avg Response Time',
            value: 145,
            unit: 'ms',
            trend: 'down',
            change: -8.5,
            threshold: 200,
            status: 'good',
          },
          throughput: {
            name: 'Requests/sec',
            value: 1250,
            unit: 'req/s',
            trend: 'up',
            change: 15.7,
            threshold: 2000,
            status: 'good',
          },
          errorRate: {
            name: 'Error Rate',
            value: 0.12,
            unit: '%',
            trend: 'down',
            change: -0.03,
            threshold: 1,
            status: 'good',
          },
          uptime: {
            name: 'Uptime',
            value: 99.97,
            unit: '%',
            trend: 'stable',
            change: 0.01,
            threshold: 99.9,
            status: 'good',
          },
        },
        alerts: [
          {
            id: '1',
            type: 'cpu',
            severity: 'medium',
            message: 'CPU usage spiked to 85% for 5 minutes',
            timestamp: new Date(Date.now() - 3600000),
            resolved: true,
            value: 85,
            threshold: 80,
          },
          {
            id: '2',
            type: 'response',
            severity: 'high',
            message: 'Response time exceeded 300ms threshold',
            timestamp: new Date(Date.now() - 7200000),
            resolved: false,
            value: 320,
            threshold: 200,
          },
        ],
        suggestions: [
          {
            id: '1',
            category: 'database',
            title: 'Add Database Indexes',
            description:
              'Add composite indexes on frequently queried columns to improve query performance',
            impact: 'high',
            effort: 'medium',
            potentialGain: '40-60% faster queries',
            implemented: false,
          },
          {
            id: '2',
            category: 'cache',
            title: 'Implement Redis Caching',
            description: 'Cache frequently accessed data to reduce database load',
            impact: 'high',
            effort: 'medium',
            potentialGain: '50-70% reduced response time',
            implemented: true,
          },
          {
            id: '3',
            category: 'code',
            title: 'Optimize React Components',
            description: 'Use React.memo and useMemo for expensive computations',
            impact: 'medium',
            effort: 'low',
            potentialGain: '20-30% faster renders',
            implemented: false,
          },
          {
            id: '4',
            category: 'infrastructure',
            title: 'Implement CDN',
            description: 'Use CDN for static assets to reduce latency',
            impact: 'medium',
            effort: 'low',
            potentialGain: '30-50% faster asset loading',
            implemented: true,
          },
        ],
        historicalData: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 3600000),
          cpu: 60 + Math.random() * 20,
          memory: 65 + Math.random() * 15,
          responseTime: 120 + Math.random() * 50,
          requests: 1000 + Math.random() * 500,
        })),
        recommendations: [
          'Consider implementing horizontal scaling for peak hours',
          'Optimize database queries with proper indexing',
          'Implement response compression for API endpoints',
          'Consider implementing circuit breaker pattern for external services',
        ],
      };

      setApmData(mockData);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getSeverityColor = (severity: PerformanceAlert['severity']) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
    }
  };

  const getImpactColor = (impact: OptimizationSuggestion['impact']) => {
    switch (impact) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-green-100 text-green-800';
    }
  };

  const getEffortColor = (effort: OptimizationSuggestion['effort']) => {
    switch (effort) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name) {
      case 'CPU Usage':
        return <Cpu className="h-5 w-5" />;
      case 'Memory Usage':
        return <HardDrive className="h-5 w-5" />;
      case 'Disk Usage':
        return <Database className="h-5 w-5" />;
      case 'Network I/O':
        return <Wifi className="h-5 w-5" />;
      case 'Avg Response Time':
        return <Clock className="h-5 w-5" />;
      case 'Requests/sec':
        return <Activity className="h-5 w-5" />;
      case 'Error Rate':
        return <AlertTriangle className="h-5 w-5" />;
      case 'Uptime':
        return <Server className="h-5 w-5" />;
      default:
        return <Gauge className="h-5 w-5" />;
    }
  };

  const exportPerformanceReport = () => {
    if (!apmData) return;

    const report = {
      generatedAt: new Date().toISOString(),
      timeRange,
      metrics: apmData.metrics,
      activeAlerts: apmData.alerts.filter((a) => !a.resolved).length,
      implementedOptimizations: apmData.suggestions.filter((s) => s.implemented).length,
      totalOptimizations: apmData.suggestions.length,
      recommendations: apmData.recommendations,
      summary: {
        overallHealth: 'Good',
        averageResponseTime: `${apmData.metrics.responseTime.value}ms`,
        errorRate: `${apmData.metrics.errorRate.value}%`,
        uptime: `${apmData.metrics.uptime.value}%`,
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading && !apmData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Performance Monitoring</h1>
            <p className="text-sm text-muted-foreground">
              Advanced APM with real-time metrics and optimization insights
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Auto Refresh:</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRefresh ? 'bg-green-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={loadPerformanceData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportPerformanceReport}
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
          { id: 'metrics', label: 'Detailed Metrics', icon: LineChart },
          { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
          { id: 'optimization', label: 'Optimization', icon: Target },
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
      {activeTab === 'overview' && apmData && (
        <div className="space-y-8">
          {/* Key Performance Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Object.values(apmData.metrics).map((metric, index) => (
              <div key={index} className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${getStatusColor(metric.status).split(' ')[1]}`}>
                    {getMetricIcon(metric.name)}
                  </div>
                  <div
                    className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(metric.status)}`}
                  >
                    {metric.status}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  </div>

                  <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>

                  <div className="flex items-center gap-1 text-xs">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    ) : (
                      <div className="h-3 w-3 rounded-full bg-gray-400" />
                    )}
                    <span
                      className={`font-medium ${
                        metric.change > 0
                          ? 'text-green-600'
                          : metric.change < 0
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }`}
                    >
                      {metric.change > 0 ? '+' : ''}
                      {metric.change}%
                    </span>
                    <span className="text-muted-foreground">from last period</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metric.value > metric.threshold
                          ? 'bg-red-500'
                          : metric.value > metric.threshold * 0.8
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Insights */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Active Alerts */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Alerts ({apmData.alerts.filter((a) => !a.resolved).length})
              </h3>
              <div className="space-y-3">
                {apmData.alerts
                  .filter((alert) => !alert.resolved)
                  .slice(0, 5)
                  .map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          alert.severity === 'critical'
                            ? 'bg-red-500'
                            : alert.severity === 'high'
                              ? 'bg-orange-500'
                              : alert.severity === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{alert.type.toUpperCase()}</span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.timestamp.toLocaleString()} • Value: {alert.value} (Threshold:{' '}
                          {alert.threshold})
                        </p>
                      </div>
                    </div>
                  ))}
                {apmData.alerts.filter((a) => !a.resolved).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active alerts</p>
                  </div>
                )}
              </div>
            </div>

            {/* Optimization Opportunities */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Optimization Opportunities
              </h3>
              <div className="space-y-3">
                {apmData.suggestions
                  .filter((s) => !s.implemented)
                  .slice(0, 5)
                  .map((suggestion) => (
                    <div key={suggestion.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{suggestion.title}</h4>
                        <div className="flex items-center gap-1">
                          <span
                            className={`px-2 py-1 text-xs rounded ${getImpactColor(suggestion.impact)}`}
                          >
                            {suggestion.impact} impact
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded ${getEffortColor(suggestion.effort)}`}
                          >
                            {suggestion.effort} effort
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                      <p className="text-xs font-medium text-green-600">
                        Potential gain: {suggestion.potentialGain}
                      </p>
                    </div>
                  ))}
                {apmData.suggestions.filter((s) => !s.implemented).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>All optimizations implemented</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Recommendations
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {apmData.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'metrics' && apmData && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* CPU & Memory */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">System Resources</h3>
              <div className="space-y-4">
                {['cpu', 'memory', 'disk'].map((key) => {
                  const metric = apmData.metrics[key as keyof SystemMetrics] as PerformanceMetric;
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {metric.value}
                          {metric.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            metric.status === 'critical'
                              ? 'bg-red-500'
                              : metric.status === 'warning'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${(metric.value / metric.threshold) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Threshold: {metric.threshold}
                          {metric.unit}
                        </span>
                        <span>Status: {metric.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Application Performance */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Application Performance</h3>
              <div className="space-y-4">
                {['responseTime', 'throughput', 'errorRate', 'uptime'].map((key) => {
                  const metric = apmData.metrics[key as keyof SystemMetrics] as PerformanceMetric;
                  return (
                    <div key={key} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {getMetricIcon(metric.name)}
                        <span className="text-sm font-medium">{metric.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {metric.value}
                          {metric.unit}
                        </div>
                        <div
                          className={`text-xs ${
                            metric.change > 0
                              ? 'text-green-600'
                              : metric.change < 0
                                ? 'text-red-600'
                                : 'text-gray-600'
                          }`}
                        >
                          {metric.change > 0 ? '+' : ''}
                          {metric.change}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Historical Trends */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Historical Trends (Last 24 Hours)</h3>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Interactive charts would be displayed here</p>
                <p className="text-sm">
                  Integration with charting libraries (Chart.js, D3.js, etc.)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && apmData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Performance Alerts</h2>
            <div className="flex items-center gap-3">
              <select className="px-3 py-1 border rounded text-sm">
                <option>All Severities</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select className="px-3 py-1 border rounded text-sm">
                <option>All Types</option>
                <option>CPU</option>
                <option>Memory</option>
                <option>Response Time</option>
                <option>Errors</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {apmData.alerts.map((alert) => (
              <div key={alert.id} className="bg-card rounded-lg border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-3 h-3 rounded-full mt-1 ${
                        alert.severity === 'critical'
                          ? 'bg-red-500'
                          : alert.severity === 'high'
                            ? 'bg-orange-500'
                            : alert.severity === 'medium'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{alert.type.toUpperCase()} Alert</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}
                        >
                          {alert.severity}
                        </span>
                        {alert.resolved && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{alert.timestamp.toLocaleString()}</span>
                        <span>
                          Value: {alert.value} | Threshold: {alert.threshold}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}

            {apmData.alerts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No alerts to display</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'optimization' && apmData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Performance Optimization</h2>
            <div className="flex items-center gap-3">
              <select className="px-3 py-1 border rounded text-sm">
                <option>All Categories</option>
                <option>Database</option>
                <option>Cache</option>
                <option>Code</option>
                <option>Infrastructure</option>
                <option>Network</option>
              </select>
              <select className="px-3 py-1 border rounded text-sm">
                <option>All Efforts</option>
                <option>Low Effort</option>
                <option>Medium Effort</option>
                <option>High Effort</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Optimization Suggestions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Optimization Suggestions</h3>
              {apmData.suggestions
                .filter((s) => !s.implemented)
                .map((suggestion) => (
                  <div key={suggestion.id} className="bg-card rounded-lg border p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded ${getImpactColor(suggestion.impact)}`}
                        >
                          {suggestion.impact} impact
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded ${getEffortColor(suggestion.effort)}`}
                        >
                          {suggestion.effort} effort
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">
                        Potential gain: {suggestion.potentialGain}
                      </span>
                      <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                        Implement
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Implemented Optimizations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Implemented Optimizations</h3>
              {apmData.suggestions
                .filter((s) => s.implemented)
                .map((suggestion) => (
                  <div key={suggestion.id} className="bg-card rounded-lg border p-6 opacity-75">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <h4 className="font-medium">{suggestion.title}</h4>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${getImpactColor(suggestion.impact)}`}
                      >
                        {suggestion.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                    <span className="text-sm font-medium text-green-600">
                      ✓ Implemented - {suggestion.potentialGain} improvement achieved
                    </span>
                  </div>
                ))}

              {apmData.suggestions.filter((s) => s.implemented).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No optimizations implemented yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Score */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Score</h3>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">87/100</div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div className="bg-green-500 h-4 rounded-full" style={{ width: '87%' }} />
                </div>
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div className="text-center">
                    <div className="font-medium text-green-600">95%</div>
                    <div className="text-muted-foreground">Availability</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-blue-600">82%</div>
                    <div className="text-muted-foreground">Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-purple-600">89%</div>
                    <div className="text-muted-foreground">Reliability</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-orange-600">91%</div>
                    <div className="text-muted-foreground">Efficiency</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
