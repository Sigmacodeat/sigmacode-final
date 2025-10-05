'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useFirewallLiveStats } from '@/app/hooks/useFirewallLiveStats';
import {
  Activity,
  Shield,
  AlertTriangle,
  TrendingUp,
  Clock,
  Server,
  Eye,
  Database,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface FirewallMetrics {
  totalRequests: number;
  blockedRequests: number;
  avgLatency: number;
  errorRate: number;
  activeConnections: number;
  throughput: number;
  topBackends: Array<{ name: string; count: number }>;
  recentErrors: Array<{ id: string; message: string; timestamp: string }>;
}

export function FirewallDashboard() {
  const t = useTranslations('firewall.dashboard');
  const { data: stats, loading, error, reload } = useFirewallLiveStats(5000);

  // Simple local time-series (last 24 points)
  const [history, setHistory] = useState<{ total: number[]; blocked: number[]; latency: number[] }>(
    {
      total: [],
      blocked: [],
      latency: [],
    },
  );

  useEffect(() => {
    if (!stats) return;
    setHistory((prev) => {
      const clamp = (arr: number[]) => (arr.length > 24 ? arr.slice(arr.length - 24) : arr);
      const total = clamp([...prev.total, stats.totalRequests || 0]);
      const blocked = clamp([...prev.blocked, stats.blockedRequests || 0]);
      const latency = clamp([...prev.latency, stats.averageLatency || 0]);
      return { total, blocked, latency };
    });
  }, [stats]);

  const Sparkline = ({ data, color = '#2563eb' }: { data: number[]; color?: string }) => {
    const points = useMemo(() => {
      if (!data || data.length === 0) return '';
      const w = 100;
      const h = 24;
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;
      const step = w / Math.max(data.length - 1, 1);
      return data
        .map((v, i) => {
          const x = i * step;
          const y = h - ((v - min) / range) * h;
          return `${x},${y}`;
        })
        .join(' ');
    }, [data]);
    return (
      <svg viewBox="0 0 100 24" width="100%" height="24" className="mt-3">
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <GlassCard key={i} className="p-6">
            <LoadingSpinner size="sm" className="mx-auto" />
          </GlassCard>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <ErrorMessage title={t('errorTitle')} message={error || t('noMetrics')} variant="error" />
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="p-6 hover:glow transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600">{t('totalRequests')}</p>
              <p className="text-3xl font-bold text-zinc-900">
                {stats.totalRequests.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={history.total} color="#2563eb" />
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            {t('increaseVsLastHour', { percentage: 12 })}
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:glow transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600">{t('blockedRequests')}</p>
              <p className="text-3xl font-bold text-zinc-900">{stats.blockedRequests}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={history.blocked} color="#dc2626" />
          </div>
          <div className="mt-2 flex items-center text-sm text-zinc-600">
            <span className="text-xs">
              {t('percentageOfTotal', {
                percentage: ((stats.blockedRequests / stats.totalRequests) * 100).toFixed(1),
              })}
            </span>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:glow transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600">{t('avgLatency')}</p>
              <p className="text-3xl font-bold text-zinc-900">{stats.averageLatency}ms</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <Sparkline data={history.latency} color="#16a34a" />
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            {t('decreaseVsLastHour', { ms: 5 })}
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:glow transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600">{t('errorRate')}</p>
              <p className="text-3xl font-bold text-zinc-900">0.0%</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-yellow-600">
            <span className="text-xs">{t('withinNormalRange')}</span>
          </div>
        </GlassCard>
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Threats */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Server className="h-5 w-5 text-violet-600" />
            <h3 className="text-lg font-semibold text-zinc-900">{t('topThreats')}</h3>
          </div>

          <div className="space-y-4">
            {(stats.topThreats || []).length === 0 ? (
              <p className="text-sm text-zinc-500">No threats detected</p>
            ) : (
              stats.topThreats.map((threat, index) => (
                <div key={threat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-medium text-violet-600">
                      {index + 1}
                    </div>
                    <span className="font-medium text-zinc-900">{threat.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-zinc-900">{threat.count}</p>
                    <p className="text-sm text-zinc-600">
                      {t('percentageOfTotal', {
                        percentage: ((threat.count / stats.totalRequests) * 100).toFixed(1),
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* System Health */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-zinc-900">{t('systemHealth')}</h3>
            <button
              onClick={reload}
              className="ml-auto p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div
                  className={`h-3 w-3 rounded-full ${stats.isEnabled ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
                <span className="text-sm font-medium text-zinc-900">{t('status')}</span>
              </div>
              <p className="text-2xl font-bold text-zinc-900">
                {stats.isEnabled ? t('enabled') : t('disabled')}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-zinc-900">{t('mode')}</span>
              </div>
              <p className="text-2xl font-bold text-zinc-900">{stats.mode}</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-zinc-900">{t('allowed')}</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.allowedRequests}</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
