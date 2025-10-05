'use client';

import { useEffect, useState, useMemo } from 'react';
import { GlassCard, LoadingSpinner, ErrorMessage } from '@/components/ui';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Eye,
  Zap,
  Shield,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react';
import { trackEvent } from '../../lib/analytics';
import {
  useAnalytics,
  type Metric,
  type TimeRange,
  type PerformancePoint,
  type ErrorRecent,
} from '../../hooks/useAnalytics';

interface AnalyticsData {
  overview: {
    totalRequests: number;
    activeUsers: number;
    avgResponseTime: number;
    errorRate: number;
    uptime: number;
    throughput: number;
  };
  performance: {
    responseTime: Array<{ time: string; value: number }>;
    throughput: Array<{ time: string; value: number }>;
    errorRate: Array<{ time: string; value: number }>;
    latency: Array<{ time: string; value: number }>;
  };
  usage: {
    byEndpoint: Array<{ endpoint: string; requests: number; avgTime: number }>;
    byUserAgent: Array<{ agent: string; count: number; percentage: number }>;
    byCountry: Array<{ country: string; requests: number; flag: string }>;
    byHour: Array<{ hour: number; requests: number }>;
  };
  errors: {
    recent: Array<{
      id: string;
      message: string;
      timestamp: string;
      endpoint: string;
      userAgent: string;
    }>;
    byType: Array<{ type: string; count: number; percentage: number }>;
    trends: Array<{ date: string; count: number }>;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkIO: number;
    activeConnections: number;
    cacheHitRate: number;
  };
}

// Reale Daten über Hook laden

export function AdvancedAnalytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeRange>('24h');
  const [selectedMetric, setSelectedMetric] = useState<Metric>('responseTime');

  const {
    overview,
    performance,
    usageEndpoints,
    usageUserAgents,
    usageCountries,
    usageByHour,
    errorsRecent,
    errorsByType,
    errorsTrends,
    system,
    loading,
    error,
  } = useAnalytics(selectedTimeframe, selectedMetric);

  useEffect(() => {
    trackEvent('analytics_view', { timeframe: selectedTimeframe });
  }, [selectedTimeframe]);

  const data: AnalyticsData | null = useMemo(() => {
    if (!overview || !system.latest) return null;
    // Performance als Keyed-Objekt aufbereiten; nur ausgewählte Metrik wird benötigt
    const perfBuckets: Record<Metric, { time: string; value: number }[]> = {
      responseTime: [],
      throughput: [],
      errorRate: [],
      latency: [],
    };
    const perfForUI = (performance || []).map((p: PerformancePoint) => ({
      time: p.time ?? (p.ts ? new Date(p.ts).toLocaleTimeString() : ''),
      value: p.value,
    }));
    perfBuckets[selectedMetric] = perfForUI as any;

    return {
      overview: {
        totalRequests: overview.totalRequests,
        activeUsers: overview.activeUsers,
        avgResponseTime: overview.avgResponseTime,
        errorRate: overview.errorRate,
        uptime: overview.uptime,
        throughput: overview.throughput,
      },
      performance: perfBuckets,
      usage: {
        byEndpoint: usageEndpoints,
        byUserAgent: usageUserAgents,
        byCountry: usageCountries,
        byHour: usageByHour,
      },
      errors: {
        recent: (errorsRecent || []).map((e: ErrorRecent) => ({
          id: e.id,
          message: e.message,
          timestamp: e.timestamp ?? (e.ts as string),
          endpoint: e.endpoint,
          userAgent: e.userAgent,
        })),
        byType: errorsByType,
        trends: errorsTrends,
      },
      system: {
        cpuUsage: system.latest.cpuUsage,
        memoryUsage: system.latest.memoryUsage,
        diskUsage: system.latest.diskUsage,
        networkIO: system.latest.networkIO,
        activeConnections: system.latest.activeConnections,
        cacheHitRate: system.latest.cacheHitRate,
      },
    };
  }, [
    overview,
    system.latest,
    performance,
    usageEndpoints,
    usageUserAgents,
    usageCountries,
    usageByHour,
    errorsRecent,
    errorsByType,
    errorsTrends,
    selectedMetric,
  ]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(12)].map((_, i) => (
          <GlassCard
            key={i}
            variant="darkblue"
            size="sm"
            className="hover:scale-[1.005] transition-transform"
          >
            <LoadingSpinner size="sm" className="mx-auto" />
          </GlassCard>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorMessage
        title="Analytics Error"
        message={error || 'No data available'}
        variant="error"
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Advanced Analytics</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Real-time insights into your AI agents performance and usage
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => {
              const val = e.target.value as TimeRange;
              setSelectedTimeframe(val);
              trackEvent('analytics_timeframe_change', { timeframe: val });
            }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
            onClick={() =>
              trackEvent('analytics_export', {
                timeframe: selectedTimeframe,
                format: 'csv',
              })
            }
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700"
            onClick={() => trackEvent('analytics_refresh', { timeframe: selectedTimeframe })}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <GlassCard
          variant="darkblue"
          size="sm"
          className="hover:scale-[1.005] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Total Requests
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatNumber(data.overview.totalRequests)}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            +12.5% from last hour
          </div>
        </GlassCard>

        <GlassCard variant="darkblue" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Users</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatNumber(data.overview.activeUsers)}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            +8.2% from last hour
          </div>
        </GlassCard>

        <GlassCard variant="darkblue" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Avg Response Time
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {data.overview.avgResponseTime}ms
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingDown className="h-4 w-4 mr-1" />
            -5.2% from last hour
          </div>
        </GlassCard>

        <GlassCard variant="darkblue" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Error Rate</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatPercentage(data.overview.errorRate)}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            <TrendingDown className="h-4 w-4 mr-1" />
            -0.1% from last hour
          </div>
        </GlassCard>

        <GlassCard variant="darkblue" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Uptime</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatPercentage(data.overview.uptime)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <span className="text-xs">Excellent</span>
          </div>
        </GlassCard>

        <GlassCard variant="darkblue" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Throughput</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {data.overview.throughput}%
              </p>
            </div>
            <Zap className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            +2.1% from last hour
          </div>
        </GlassCard>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard variant="darkblue" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Response Time</h3>
            <select
              value={selectedMetric}
              onChange={(e) => {
                const val = e.target.value as Metric;
                setSelectedMetric(val);
                trackEvent('analytics_metric_change', { metric: val });
              }}
              className="px-2 py-1 text-sm rounded border border-slate-200 dark:border-slate-700"
            >
              <option value="responseTime">Response Time</option>
              <option value="throughput">Throughput</option>
              <option value="errorRate">Error Rate</option>
              <option value="latency">Latency</option>
            </select>
          </div>

          <div className="h-64 flex items-end justify-between gap-2">
            {data.performance[selectedMetric as keyof typeof data.performance].map(
              (point, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div
                    className="w-8 bg-gradient-to-t from-violet-500 to-purple-500 rounded-t transition-all duration-300 hover:from-violet-600 hover:to-purple-600"
                    style={{ height: `${(point.value / 200) * 100}%` }}
                  />
                  <span className="text-xs text-slate-500 rotate-45 origin-top-left">
                    {point.time}
                  </span>
                </div>
              ),
            )}
          </div>
        </GlassCard>

        <GlassCard variant="darkblue" className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Top Endpoints
          </h3>

          <div className="space-y-4">
            {data.usage.byEndpoint.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    <BarChart3 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {endpoint.endpoint}
                    </p>
                    <p className="text-sm text-slate-500">{endpoint.avgTime}ms avg</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatNumber(endpoint.requests)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {((endpoint.requests / data.overview.totalRequests) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Usage Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard variant="darkblue" className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">User Agents</h3>

          <div className="space-y-3">
            {data.usage.byUserAgent.map((agent, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {agent.agent.includes('Mobile') ? (
                    <Smartphone className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Monitor className="h-4 w-4 text-slate-400" />
                  )}
                  <span className="text-sm text-slate-600 dark:text-slate-300">{agent.agent}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatNumber(agent.count)}
                  </p>
                  <p className="text-xs text-slate-500">{formatPercentage(agent.percentage)}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard variant="darkblue" className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Geographic Distribution
          </h3>

          <div className="space-y-3">
            {data.usage.byCountry.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {country.country}
                  </span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {formatNumber(country.requests)}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard variant="darkblue" className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Error Types</h3>

          <div className="space-y-3">
            {data.errors.byType.map((errorType, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {errorType.type}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatNumber(errorType.count)}
                  </p>
                  <p className="text-xs text-slate-500">{formatPercentage(errorType.percentage)}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* System Health */}
      <GlassCard variant="darkblue" className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">System Health</h3>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Server className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">CPU Usage</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatPercentage(data.system.cpuUsage)}
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${data.system.cpuUsage}%` }}
              />
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Database className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                Memory Usage
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatPercentage(data.system.memoryUsage)}
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${data.system.memoryUsage}%` }}
              />
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                Cache Hit Rate
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatPercentage(data.system.cacheHitRate)}
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${data.system.cacheHitRate}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
