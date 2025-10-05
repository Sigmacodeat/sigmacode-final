'use client';

import { useEffect, useMemo, useState } from 'react';

export type AnalyticsOverview = {
  totalRequests: number;
  activeUsers: number;
  avgResponseTime: number;
  errorRate: number;
  uptime: number;
  throughput: number;
};

export type PerformancePoint = { ts?: string; time?: string; value: number };

export type UsageEndpoint = {
  endpoint: string;
  requests: number;
  avgTime: number;
};
export type UsageUserAgent = {
  agent: string;
  count: number;
  percentage: number;
};
export type UsageCountry = { country: string; requests: number; flag: string };
export type UsageHour = { hour: number; requests: number };

export type ErrorRecent = {
  id: string;
  message: string;
  timestamp?: string;
  ts?: string;
  endpoint: string;
  userAgent: string;
};
export type ErrorByType = { type: string; count: number; percentage: number };
export type ErrorTrend = { date: string; count: number };

export type SystemHealth = {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIO: number;
  activeConnections: number;
  cacheHitRate: number;
};

export type TimeRange = '1h' | '24h' | '7d' | '30d';
export type Metric = 'responseTime' | 'throughput' | 'errorRate' | 'latency';
export type UsageType = 'endpoint' | 'userAgent' | 'country' | 'hour';

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export function useAnalytics(range: TimeRange, metric: Metric) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [performance, setPerformance] = useState<PerformancePoint[]>([]);
  const [usageEndpoints, setUsageEndpoints] = useState<UsageEndpoint[]>([]);
  const [usageUserAgents, setUsageUserAgents] = useState<UsageUserAgent[]>([]);
  const [usageCountries, setUsageCountries] = useState<UsageCountry[]>([]);
  const [usageByHour, setUsageByHour] = useState<UsageHour[]>([]);
  const [errorsRecent, setErrorsRecent] = useState<ErrorRecent[]>([]);
  const [errorsByType, setErrorsByType] = useState<ErrorByType[]>([]);
  const [errorsTrends, setErrorsTrends] = useState<ErrorTrend[]>([]);
  const [system, setSystem] = useState<{
    latest: SystemHealth | null;
    history: SystemHealth[];
  }>({ latest: null, history: [] });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [ov, perf, usEndpoint, usUA, usCountry, usHour, er, et, tr, sys] = await Promise.all([
          getJSON<{ data: any }>(`/api/analytics/overview`),
          getJSON<{ data: any[] }>(`/api/analytics/performance?metric=${metric}&range=${range}`),
          getJSON<{ data: any[] }>(`/api/analytics/usage?type=endpoint&range=${range}`),
          getJSON<{ data: any[] }>(`/api/analytics/usage?type=userAgent&range=${range}`),
          getJSON<{ data: any[] }>(`/api/analytics/usage?type=country&range=${range}`),
          getJSON<{ data: any[] }>(`/api/analytics/usage?type=hour&range=${range}`),
          getJSON<{ data: any[] }>(`/api/analytics/errors?type=recent&range=${range}`),
          getJSON<{ data: any[] }>(`/api/analytics/errors?type=byType&range=${range}`),
          getJSON<{ data: any[] }>(`/api/analytics/errors?type=trends&range=${range}`),
          getJSON<{ latest: any; history: any[] }>(`/api/analytics/system?range=${range}`),
        ]);

        if (cancelled) return;

        setOverview(ov.data);
        setPerformance(perf.data as any);
        setUsageEndpoints(usEndpoint.data as any);
        setUsageUserAgents(usUA.data as any);
        setUsageCountries(usCountry.data as any);
        setUsageByHour(usHour.data as any);
        setErrorsRecent(er.data as any);
        setErrorsByType(et.data as any);
        setErrorsTrends(tr.data as any);
        setSystem({
          latest: sys.latest as any,
          history: (sys.history || []) as any,
        });
        setLoading(false);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Fehler beim Laden der Analytics');
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [range, metric]);

  return {
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
  };
}
