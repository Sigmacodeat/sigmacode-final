/**
 * Advanced Analytics & Monitoring Dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  ExternalLink,
  Server,
  Shield,
  TrendingUp,
  Users,
  AlertTriangle,
  BarChart3,
  Clock,
  Zap,
  Database,
  Globe,
} from 'lucide-react';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';

const GRAFANA_URL = process.env.NEXT_PUBLIC_GRAFANA_URL || 'http://localhost:3000';

// Analytics data types
interface AnalyticsSummary {
  total: number;
  filtered: number;
  types: {
    performance: number;
    error: number;
    custom: number;
  };
  recentErrors: Array<{
    message: string;
    url: string;
    timestamp: number;
  }>;
}

interface AnalyticsData {
  events: any[];
  summary: AnalyticsSummary;
}

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

export default function MonitoringPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const since = getTimeRangeSince(timeRange);
      const response = await fetch(`/api/analytics?limit=1000&since=${since}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeSince = (range: string) => {
    const now = new Date();
    switch (range) {
      case '1h':
        now.setHours(now.getHours() - 1);
        break;
      case '24h':
        now.setHours(now.getHours() - 24);
        break;
      case '7d':
        now.setDate(now.getDate() - 7);
        break;
      case '30d':
        now.setDate(now.getDate() - 30);
        break;
      default:
        now.setHours(now.getHours() - 24);
    }
    return now.toISOString();
  };

  const metrics: MetricCard[] = [
    {
      title: 'Total Events',
      value: analyticsData?.summary.total.toLocaleString() || '0',
      change: '+12.5%',
      trend: 'up',
      icon: BarChart3,
      color: 'text-blue-600',
    },
    {
      title: 'Active Users',
      value: '1,247',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Error Rate',
      value: '0.12%',
      change: '-5.1%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-red-600',
    },
    {
      title: 'Avg Response Time',
      value: '145ms',
      change: '-2.3%',
      trend: 'down',
      icon: Clock,
      color: 'text-purple-600',
    },
    {
      title: 'API Requests',
      value: '45.2K',
      change: '+15.8%',
      trend: 'up',
      icon: Zap,
      color: 'text-yellow-600',
    },
    {
      title: 'Database Load',
      value: '68%',
      change: '+3.2%',
      trend: 'up',
      icon: Database,
      color: 'text-indigo-600',
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics & Monitoring</h1>
            <p className="text-sm text-muted-foreground">
              Real-time insights and performance metrics
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Time Range:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      <DashboardBreadcrumbs />

      {/* Key Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  {metric.change} from last period
                </p>
              </div>
              <div className={`p-2 rounded-lg bg-gray-100`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Event Summary */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Event Summary
          </h3>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : analyticsData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {analyticsData.summary.types.performance}
                  </p>
                  <p className="text-sm text-muted-foreground">Performance</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {analyticsData.summary.types.error}
                  </p>
                  <p className="text-sm text-muted-foreground">Errors</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {analyticsData.summary.types.custom}
                  </p>
                  <p className="text-sm text-muted-foreground">Custom</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Recent Errors</h4>
                <div className="space-y-2">
                  {analyticsData.summary.recentErrors.slice(0, 3).map((error, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{error.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(error.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No analytics data available</p>
          )}
        </div>

        {/* System Health Cards */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Firewall Dashboard</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Advanced threat monitoring, request patterns, and security metrics.
            </p>
            <Link
              href={`${GRAFANA_URL}/d/firewall`}
              target="_blank"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Open Firewall Dashboard <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Server className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">System Health</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Infrastructure monitoring, container metrics, and service health.
            </p>
            <Link
              href={`${GRAFANA_URL}/d/system`}
              target="_blank"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Open System Dashboard <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">API Performance</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Response times, throughput, error rates, and API usage patterns.
            </p>
            <Link
              href={`${GRAFANA_URL}/d/api`}
              target="_blank"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Open API Dashboard <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {analyticsData?.events.slice(0, 10).map((event, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              <div
                className={`w-2 h-2 rounded-full ${
                  event.type === 'error'
                    ? 'bg-red-500'
                    : event.type === 'performance'
                      ? 'bg-blue-500'
                      : 'bg-green-500'
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {event.type === 'error'
                    ? event.metadata?.message || event.message
                    : event.type === 'performance'
                      ? `Performance: ${event.category}`
                      : event.action || 'Custom Event'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )) || (
            <p className="text-muted-foreground text-center py-8">No recent activity to display</p>
          )}
        </div>
      </div>
    </div>
  );
}
