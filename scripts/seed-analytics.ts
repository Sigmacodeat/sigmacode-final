import 'dotenv/config';
import { getDb } from '../database/db';
import {
  analyticsOverview,
  analyticsPerformanceTS,
  analyticsUsageByEndpoint,
  analyticsUsageByUserAgent,
  analyticsUsageByCountry,
  analyticsUsageByHour,
  analyticsErrorsRecent,
  analyticsErrorsByType,
  analyticsErrorsTrends,
  analyticsSystemHealth,
} from '../database/schema/analytics';

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

async function seedOverview(db: Awaited<ReturnType<typeof getDb>>) {
  const now = new Date();
  await db.insert(analyticsOverview).values({
    ts: new Date(now.getTime() - 5 * 60 * 1000) as any,
    totalRequests: Math.floor(rand(50_000, 150_000)),
    activeUsers: Math.floor(rand(100, 1500)),
    avgResponseTime: Math.floor(rand(80, 250)),
    errorRate: Number(rand(0.1, 2.5).toFixed(2)),
    uptime: Number(rand(99.0, 99.99).toFixed(2)),
    throughput: Number(rand(30, 300).toFixed(2)),
  });
}

async function seedPerformance(db: Awaited<ReturnType<typeof getDb>>) {
  const now = new Date();
  const points: {
    ts: Date;
    metric: 'responseTime' | 'throughput' | 'errorRate' | 'latency';
    value: number;
  }[] = [];
  for (let i = 0; i <= 24 * 6; i++) {
    const ts = new Date(now.getTime() - i * 10 * 60 * 1000);
    points.push({
      ts,
      metric: 'responseTime',
      value: Math.max(40, Math.round(rand(60, 240))),
    });
    points.push({
      ts,
      metric: 'throughput',
      value: Number(rand(10, 250).toFixed(2)),
    });
    points.push({
      ts,
      metric: 'errorRate',
      value: Number(rand(0, 3.5).toFixed(2)),
    });
    points.push({
      ts,
      metric: 'latency',
      value: Math.max(30, Math.round(rand(50, 300))),
    });
  }
  for (let i = 0; i < points.length; i += 200) {
    await db
      .insert(analyticsPerformanceTS)
      .values(
        points
          .slice(i, i + 200)
          .map((p) => ({ ts: p.ts as any, metric: p.metric, value: p.value })),
      );
  }
}

async function seedUsage(db: Awaited<ReturnType<typeof getDb>>) {
  const now = new Date();
  const endpoints = [
    '/api/chat',
    '/api/agents',
    '/api/analytics',
    '/api/firewall/logs',
    '/api/firewall/events',
  ];
  await db.insert(analyticsUsageByEndpoint).values(
    endpoints.map((endpoint, idx) => ({
      ts: new Date(now.getTime() - idx * 5 * 60 * 1000) as any,
      endpoint,
      requests: Math.floor(rand(100, 5000)),
      avgTime: Math.floor(rand(50, 300)),
    })),
  );

  const uas = ['Chrome', 'Safari', 'Firefox', 'Edge'];
  await db.insert(analyticsUsageByUserAgent).values(
    uas.map((agent, idx) => ({
      ts: new Date(now.getTime() - idx * 7 * 60 * 1000) as any,
      agent,
      count: Math.floor(rand(100, 5000)),
      percentage: Number(rand(5, 60).toFixed(2)),
    })),
  );

  const countries: [string, string][] = [
    ['DE', '🇩🇪'],
    ['US', '🇺🇸'],
    ['FR', '🇫🇷'],
    ['ES', '🇪🇸'],
    ['IN', '🇮🇳'],
  ];
  await db.insert(analyticsUsageByCountry).values(
    countries.map(([country, flag], idx) => ({
      ts: new Date(now.getTime() - idx * 11 * 60 * 1000) as any,
      country,
      requests: Math.floor(rand(100, 4000)),
      flag,
    })),
  );

  // By hour for last 24h
  const byHour = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    requests: Math.floor(rand(100, 3000)),
  }));
  await db.insert(analyticsUsageByHour).values(
    byHour.map((row, idx) => ({
      ts: new Date(now.getTime() - idx * 60 * 60 * 1000) as any,
      hour: row.hour,
      requests: row.requests,
    })),
  );
}

async function seedErrors(db: Awaited<ReturnType<typeof getDb>>) {
  const now = new Date();
  const recent = [
    {
      ts: new Date(now.getTime() - 2 * 60 * 1000) as any,
      message: 'Timeout while calling upstream',
      endpoint: '/api/chat',
      userAgent: 'Chrome',
    },
    {
      ts: new Date(now.getTime() - 8 * 60 * 1000) as any,
      message: 'Rate limit exceeded',
      endpoint: '/api/agents',
      userAgent: 'Safari',
    },
  ];
  await db.insert(analyticsErrorsRecent).values(recent);

  await db.insert(analyticsErrorsByType).values([
    {
      ts: new Date(now.getTime() - 5 * 60 * 1000) as any,
      type: 'timeout',
      count: Math.floor(rand(5, 20)),
      percentage: Number(rand(1, 20).toFixed(2)),
    },
    {
      ts: new Date(now.getTime() - 10 * 60 * 1000) as any,
      type: 'validation',
      count: Math.floor(rand(3, 10)),
      percentage: Number(rand(1, 10).toFixed(2)),
    },
    {
      ts: new Date(now.getTime() - 15 * 60 * 1000) as any,
      type: 'upstream',
      count: Math.floor(rand(2, 8)),
      percentage: Number(rand(1, 10).toFixed(2)),
    },
  ]);

  const days = 30;
  await db.insert(analyticsErrorsTrends).values(
    Array.from({ length: days }, (_, i) => ({
      date: new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      count: Math.floor(rand(0, 50)),
    })),
  );
}

async function seedSystem(db: Awaited<ReturnType<typeof getDb>>) {
  const now = new Date();
  const points = [] as any[];
  for (let i = 0; i <= 24 * 6; i++) {
    const ts = new Date(now.getTime() - i * 10 * 60 * 1000);
    points.push({
      ts: ts as any,
      cpuUsage: Number(rand(5, 85).toFixed(2)),
      memoryUsage: Number(rand(20, 90).toFixed(2)),
      diskUsage: Number(rand(10, 80).toFixed(2)),
      networkIO: Number(rand(1, 200).toFixed(2)),
      activeConnections: Math.floor(rand(10, 500)),
      cacheHitRate: Number(rand(60, 99).toFixed(2)),
      extra: null,
    });
  }
  for (let i = 0; i < points.length; i += 200) {
    await db.insert(analyticsSystemHealth).values(points.slice(i, i + 200));
  }
}

async function main() {
  const db = await getDb();
  await seedOverview(db);
  await seedPerformance(db);
  await seedUsage(db);
  await seedErrors(db);
  await seedSystem(db);
  console.log('✅ Seed Analytics done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
