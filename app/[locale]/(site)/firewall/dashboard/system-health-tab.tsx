import { useState, useEffect, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3,
  Cpu,
  HardDrive,
  Zap,
  Shield,
  Database,
  Clock,
  Server,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  concurrentRequests: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  timestamp: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastHealthCheck: number;
  issues: string[];
  recommendations: string[];
}

interface MetricsSummary {
  [x: string]: ReactNode;
  averageResponseTime: number;
  totalRequests: number;
  errorRate: number;
  throughput: number;
  uptime: number;
  healthScore: number;
}

export default function SystemHealthTab() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const loadMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/metrics?health=true');
      if (response.ok) {
        const data = (await response.json()) as {
          current: PerformanceMetrics;
          health: SystemHealth;
          summary: MetricsSummary;
        };
        setMetrics(data.current);
        setHealth(data.health);
        setSummary(data.summary);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">System Health & Performance</h3>
          <p className="text-sm text-muted-foreground">Real-time monitoring and system metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={loadMetrics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {health && getStatusIcon(health.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={health ? getStatusColor(health.status) : 'text-gray-600'}>
                {health?.status.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Uptime: {summary ? formatUptime(summary.uptime) : '0s'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? `${Math.round(summary.healthScore)}%` : '0%'}
            </div>
            <Progress value={summary?.healthScore || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? summary.totalRequests.toLocaleString() : '0'}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{summary ? summary.throughput.toFixed(1) : '0'}/s</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? `${(summary.errorRate * 100).toFixed(2)}%` : '0%'}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{summary ? summary.failedRequests : '0'} failed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="health">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Response Time</CardTitle>
                <CardDescription>Average response time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? `${metrics.responseTime.toFixed(0)}ms` : '0ms'}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                  <Zap className="h-3 w-3" />
                  <span>Current period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Throughput</CardTitle>
                <CardDescription>Requests per second</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? metrics.throughput.toFixed(1) : '0.0'}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>Requests/sec</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Connections</CardTitle>
                <CardDescription>Current connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? metrics.activeConnections : '0'}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                  <Server className="h-3 w-3" />
                  <span>Connections</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">CPU Usage</CardTitle>
                <CardDescription>System CPU utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? `${metrics.cpuUsage.toFixed(1)}%` : '0.0%'}
                </div>
                <Progress value={metrics?.cpuUsage || 0} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Memory Usage</CardTitle>
                <CardDescription>System memory utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? `${metrics.memoryUsage.toFixed(1)}%` : '0.0%'}
                </div>
                <Progress value={metrics?.memoryUsage || 0} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Concurrent Requests</CardTitle>
                <CardDescription>Active request handlers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? metrics.concurrentRequests : '0'}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                  <Activity className="h-3 w-3" />
                  <span>Active</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          {health && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Issues</CardTitle>
                  <CardDescription>Current system issues</CardDescription>
                </CardHeader>
                <CardContent>
                  {health.issues.length > 0 ? (
                    <div className="space-y-2">
                      {health.issues.map((issue, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          <span className="text-sm">{issue}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">No issues detected</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recommendations</CardTitle>
                  <CardDescription>Suggested improvements</CardDescription>
                </CardHeader>
                <CardContent>
                  {health.recommendations.length > 0 ? (
                    <div className="space-y-2">
                      {health.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">System is optimal</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
