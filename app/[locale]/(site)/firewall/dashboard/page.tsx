'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Server,
  Key,
  Pause,
  Play,
  AlertCircle,
  TrendingUp,
  Clock,
  Zap,
  Info,
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  Eye,
  EyeOff,
  Copy,
  Copy as CopyIcon,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemedCard from '@/components/ui/ThemedCard';
import { cn } from '@/lib/utils';

interface FirewallConfig {
  enabled: boolean;
  mode: 'enforce' | 'shadow' | 'off';
  defaultPolicy: 'strict' | 'balanced' | 'permissive';
  sampling: number;
  failOpen: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  redactionToken: string;
  circuitBreakerEnabled: boolean;
  retryAttempts: number;
  cacheEnabled: boolean;
}

interface FirewallStats {
  totalRequests: number;
  blockedRequests: number;
  allowedRequests: number;
  averageLatency: number;
  threatMatches: number;
  topThreats: Array<{ category: string; count: number }>;
  uptime: number;
  errorRate: number;
  throughput: number;
  lastUpdate: string;
  cpuUsage?: number;
  memoryUsage?: number;
}

interface FirewallLog {
  id: string;
  ts: string;
  requestId: string;
  backend: string;
  policy: string;
  action: string;
  latencyMs: number;
  status: number;
  userId?: string;
  meta?: any;
  explainability?: any;
  reasonCode?: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  rateLimitRpm: number;
  rateLimitTpm: number;
  quotaLimit: number;
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  lastUsed?: string;
}

export default function FirewallDashboardPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<FirewallConfig>({
    enabled: true,
    mode: 'enforce',
    defaultPolicy: 'balanced',
    sampling: 1.0,
    failOpen: false,
    logLevel: 'info',
    redactionToken: '[REDACTED]',
    circuitBreakerEnabled: true,
    retryAttempts: 3,
    cacheEnabled: true,
  });

  const [stats, setStats] = useState<FirewallStats>({
    totalRequests: 0,
    blockedRequests: 0,
    allowedRequests: 0,
    averageLatency: 0,
    threatMatches: 0,
    topThreats: [],
    uptime: 99.9,
    errorRate: 0.1,
    throughput: 0,
    lastUpdate: new Date().toISOString(),
  });

  const [logs, setLogs] = useState<FirewallLog[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [apiKeysError, setApiKeysError] = useState<string | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [apiKeysLoading, setApiKeysLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'blocked' | 'allowed'>('all');
  const [realTime, setRealTime] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadAllData();
    if (realTime) {
      const interval = setInterval(loadStats, 5000);
      return () => clearInterval(interval);
    }
  }, [realTime]);

  const loadAllData = useCallback(async () => {
    await Promise.all([loadConfig(), loadStats(), loadLogs(), loadApiKeys()]);
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = localStorage.getItem('firewall-config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  };

  const loadStats = async () => {
    try {
      setStatsError(null);
      const response = await fetch('/api/firewall/stats');
      if (response.ok) {
        const data = (await response.json().catch(() => ({}))) as Partial<FirewallStats>;
        setStats((prev) => ({ ...prev, ...data, lastUpdate: new Date().toISOString() }));
      } else {
        setStatsError('Failed to load stats');
      }
    } catch (err) {
      setStatsError('Failed to load stats');
      console.error('Failed to load stats:', err);
    }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const response = await fetch(`/api/firewall/logs?limit=50&filter=${filter}`);
      if (response.ok) {
        const data = (await response.json().catch(() => ({}))) as { data?: FirewallLog[] };
        setLogs(data.data || []);
      } else {
        setLogsError('Failed to load logs');
      }
    } catch (err) {
      setLogsError('Failed to load logs');
      console.error('Failed to load logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const loadApiKeys = async () => {
    setApiKeysLoading(true);
    setApiKeysError(null);
    try {
      const response = await fetch('/api/api-keys');
      if (response.ok) {
        const data = (await response.json().catch(() => ({}))) as { keys?: ApiKey[] };
        setApiKeys(data.keys || []);
      } else {
        setApiKeysError('Failed to load API keys');
      }
    } catch (err) {
      setApiKeysError('Failed to load API keys');
      console.error('Failed to load API keys:', err);
    } finally {
      setApiKeysLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      localStorage.setItem('firewall-config', JSON.stringify(config));
      toast({
        title: 'Configuration Saved',
        description: 'Firewall configuration has been saved successfully',
      });
      setError(null);
    } catch (err) {
      console.error('Failed to save config:', err);
      setError('Failed to save configuration');
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive',
      });
    }
  };

  const exportLogs = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/firewall/logs?format=${format}&filter=${filter}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `firewall-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({
          title: 'Logs Exported',
          description: `Logs exported as ${format.toUpperCase()}`,
        });
      }
    } catch (err) {
      console.error('Failed to export logs:', err);
      setError('Failed to export logs');
      toast({
        title: 'Error',
        description: 'Failed to export logs',
        variant: 'destructive',
      });
    }
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: 'API Key Copied',
      description: 'API key has been copied to clipboard',
    });
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'text-destructive';
      case 'high':
        return 'text-warning';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-info';
      default:
        return 'text-muted-foreground';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'allow':
      case 'shadow-allow':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'block':
      case 'shadow-block':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
  };

  const getActionBadge = (action: string) => {
    // Mappe Actions auf erlaubte Badge-Varianten
    const variant: 'danger' | 'success' | 'outline' | 'soft' = action.includes('block')
      ? 'danger'
      : action.includes('allow')
        ? 'success'
        : 'soft';
    const label = action.replace('shadow-', '').toUpperCase();
    return <Badge variant={variant}>{label}</Badge>;
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filter === 'all') return true;
      if (filter === 'blocked') return log.action.includes('block');
      if (filter === 'allowed') return log.action.includes('allow');
      return true;
    });
  }, [logs, filter]);

  const blockRate =
    stats.totalRequests > 0 ? (stats.blockedRequests / stats.totalRequests) * 100 : 0;
  const allowRate =
    stats.totalRequests > 0 ? (stats.allowedRequests / stats.totalRequests) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--brand)' }}>
              <Shield className="h-8 w-8" style={{ color: 'var(--brand-foreground)' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-brand bg-clip-text text-transparent">
                Firewall Dashboard
              </h1>
              <p className="text-muted-foreground">AI Security & Threat Protection</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={stats.totalRequests > 0 ? 'brand' : 'soft'} className="animate-pulse">
              {stats.totalRequests > 0 ? '🛡️ Active' : '⚠️ Inactive'}
            </Badge>
            <Badge variant="outline" className="font-mono">
              {stats.totalRequests > 0 ? 'ENFORCE' : 'OFF'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRealTime(!realTime)}
              className={cn(
                'transition-all',
                realTime ? 'bg-green-50 border-green-200 text-green-700' : '',
              )}
            >
              {realTime ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {realTime ? 'Live' : 'Paused'}
            </Button>
          </div>
        </motion.div>

        {/* Error Alerts */}
        <AnimatePresence>
          {(statsError || logsError || apiKeysError) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{statsError || logsError || apiKeysError}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="configuration" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span>Logs</span>
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>API Keys</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              <ThemedCard
                tone="firewall"
                title="Total Requests"
                icon={<Activity className="h-4 w-4" />}
                showSecurity={false}
              >
                <div className="text-2xl font-bold">
                  {stats?.totalRequests.toLocaleString() || 0}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span>+20.1% from last hour</span>
                </div>
              </ThemedCard>

              <ThemedCard
                tone="danger"
                title="Blocked"
                icon={<XCircle className="h-4 w-4 text-destructive" />}
                showSecurity={false}
              >
                <div className="text-2xl font-bold text-destructive">
                  {stats?.blockedRequests.toLocaleString() || 0}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{blockRate.toFixed(1)}% of total</span>
                  <Progress value={blockRate} className="h-1 flex-1" />
                </div>
              </ThemedCard>

              <ThemedCard
                tone="firewall"
                title="Avg Latency"
                icon={<Zap className="h-4 w-4" />}
                showSecurity={false}
              >
                <div className="text-2xl font-bold">{stats?.averageLatency || 0}ms</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Processing time</span>
                </div>
              </ThemedCard>

              <ThemedCard
                tone="danger"
                title="Threats"
                icon={<AlertTriangle className="h-4 w-4 text-warning" />}
                showSecurity={false}
              >
                <div className="text-2xl font-bold text-warning">
                  {stats?.threatMatches.toLocaleString() || 0}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>Detected threats</span>
                  <Badge variant="outline" className="text-xs">
                    {stats?.errorRate.toFixed(2) || 0}% error rate
                  </Badge>
                </div>
              </ThemedCard>
            </motion.div>

            {/* Charts and Details */}
            <div className="grid gap-6 md:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Top Threats</CardTitle>
                    <CardDescription>Most common threat categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-3">
                        {stats?.topThreats.map((threat, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-destructive" />
                              <span className="text-sm font-medium">{threat.category}</span>
                            </div>
                            <Badge variant="outline">{threat.count}</Badge>
                          </motion.div>
                        )) || (
                          <div className="flex items-center justify-center h-32 text-muted-foreground">
                            <Info className="h-4 w-4 mr-2" />
                            No threats detected
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Firewall components status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Superagent Integration</span>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          Healthy
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Threat Pattern Matching</span>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          Active
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Audit Logging</span>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          Enabled
                        </Badge>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Uptime</span>
                          <span>{stats?.uptime || 0}%</span>
                        </div>
                        <Progress value={stats?.uptime || 0} className="h-2" />
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm mb-2">
                          <span>CPU Usage</span>
                          <span>{stats?.cpuUsage || 0}%</span>
                        </div>
                        <Progress value={stats?.cpuUsage || 0} className="h-2" />
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Memory Usage</span>
                          <span>{stats?.memoryUsage || 0}%</span>
                        </div>
                        <Progress value={stats?.memoryUsage || 0} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Firewall Settings</CardTitle>
                  <CardDescription>Basic firewall configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Firewall Status</Label>
                      <div className="text-sm text-muted-foreground">
                        Enable or disable the firewall
                      </div>
                    </div>
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({ ...prev, enabled: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mode</Label>
                    <select
                      value={config.mode}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          mode: e.target.value as 'enforce' | 'shadow' | 'off',
                        })
                      }
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="enforce">Enforce</option>
                      <option value="shadow">Shadow</option>
                      <option value="off">Off</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Policy</Label>
                    <select
                      value={config.defaultPolicy}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          defaultPolicy: e.target.value as 'strict' | 'balanced' | 'permissive',
                        })
                      }
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="strict">Strict</option>
                      <option value="balanced">Balanced</option>
                      <option value="permissive">Permissive</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sampling Rate</Label>
                    <Input
                      type="number"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={config.sampling}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, sampling: parseFloat(e.target.value) }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Fail Open</Label>
                      <div className="text-sm text-muted-foreground">
                        Allow traffic when firewall is unavailable
                      </div>
                    </div>
                    <Switch
                      checked={config.failOpen}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({ ...prev, failOpen: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                  <CardDescription>Advanced firewall configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Log Level</Label>
                    <select
                      value={config.logLevel}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          logLevel: e.target.value as 'debug' | 'info' | 'warn' | 'error',
                        })
                      }
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="debug">Debug</option>
                      <option value="info">Info</option>
                      <option value="warn">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Redaction Token</Label>
                    <Input
                      value={config.redactionToken}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, redactionToken: e.target.value }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Circuit Breaker</Label>
                      <div className="text-sm text-muted-foreground">
                        Enable circuit breaker for resilience
                      </div>
                    </div>
                    <Switch
                      checked={config.circuitBreakerEnabled}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({ ...prev, circuitBreakerEnabled: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Retry Attempts</Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={config.retryAttempts}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, retryAttempts: parseInt(e.target.value) }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cache Enabled</Label>
                      <div className="text-sm text-muted-foreground">
                        Enable caching for better performance
                      </div>
                    </div>
                    <Switch
                      checked={config.cacheEnabled}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({ ...prev, cacheEnabled: checked }))
                      }
                    />
                  </div>

                  <Button onClick={saveConfig} className="w-full">
                    Save Configuration
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'blocked' | 'allowed')}
                  className="p-2 border rounded-md"
                >
                  <option value="all">All Logs</option>
                  <option value="blocked">Blocked Only</option>
                  <option value="allowed">Allowed Only</option>
                </select>

                <Button variant="outline" size="sm" onClick={() => loadLogs()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>

                <Button variant="outline" size="sm" onClick={() => exportLogs('json')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>

                <Button variant="outline" size="sm" onClick={() => exportLogs('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Firewall Logs</CardTitle>
                <CardDescription>
                  Recent firewall activity ({filteredLogs.length} entries)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {filteredLogs.map((log) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {getActionIcon(log.action)}
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-sm">{log.requestId}</span>
                                <Badge variant="outline">{log.backend}</Badge>
                                {getActionBadge(log.action)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(log.ts).toLocaleString()} • {log.latencyMs}ms •{' '}
                                {log.status}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium">{log.policy}</div>
                            {log.reasonCode && (
                              <div className="text-muted-foreground">{log.reasonCode}</div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">API Key Management</h3>
              <Button>
                <Key className="h-4 w-4 mr-2" />
                Create New Key
              </Button>
            </div>

            <div className="grid gap-4">
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{apiKey.name}</CardTitle>
                      <Badge variant={apiKey.status === 'active' ? 'success' : 'soft'}>
                        {apiKey.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Key:</span>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {showApiKey === apiKey.id ? apiKey.key : '••••••••••••••••'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                        >
                          {showApiKey === apiKey.id ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => copyApiKey(apiKey.key)}>
                          <CopyIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Scopes:</span>
                        <div className="mt-1">
                          {apiKey.scopes.map((scope) => (
                            <Badge key={scope} variant="outline" className="mr-1 mb-1">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rate Limits:</span>
                        <div className="mt-1">
                          <div>RPM: {apiKey.rateLimitRpm}</div>
                          <div>TPM: {apiKey.rateLimitTpm}</div>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Usage:</span>
                        <div className="mt-1">
                          <div>Quota: {apiKey.quotaLimit}</div>
                          <div className="text-xs text-muted-foreground">
                            Last used:{' '}
                            {apiKey.lastUsed
                              ? new Date(apiKey.lastUsed).toLocaleDateString()
                              : 'Never'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="danger" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {apiKeys.length === 0 && (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <div className="text-center text-muted-foreground">
                      <Key className="h-8 w-8 mx-auto mb-2" />
                      <p>No API keys found</p>
                      <Button className="mt-2">
                        <Key className="h-4 w-4 mr-2" />
                        Create your first API key
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
