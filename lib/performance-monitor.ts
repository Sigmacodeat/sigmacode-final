// SIGMACODE AI - Performance Monitoring & Metrics Collection
// Production-grade performance monitoring with comprehensive metrics

import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

// Performance Metrics Interface
export interface PerformanceMetrics {
  // Request metrics
  responseTime: number;
  throughput: number;
  errorRate: number;

  // System metrics
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  concurrentRequests: number;

  // Database metrics
  dbConnectionPoolSize: number;
  dbActiveConnections: number;
  dbQueryLatency: number;

  // Cache metrics
  cacheHitRate: number;
  cacheMissRate: number;

  // ML Model metrics
  mlModelLatency: number;
  mlModelAccuracy: number;
  mlThreatDetectionRate: number;

  // Security metrics
  blockedRequests: number;
  suspiciousActivityCount: number;

  // Business metrics
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;

  // Timestamp
  timestamp: number;
  period: number; // in milliseconds
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastHealthCheck: number;
  issues: string[];
  recommendations: string[];
}

export interface AlertCondition {
  metric: keyof PerformanceMetrics;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  cooldownMinutes: number;
}

// Performance Monitor Class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: LRUCache<string, PerformanceMetrics> = new LRUCache({
    max: 1000,
    ttl: 24 * 60 * 60 * 1000, // 24 hours
  });

  private alertConditions: AlertCondition[] = [
    {
      metric: 'errorRate',
      operator: '>',
      threshold: 0.05, // 5%
      severity: 'high',
      message: 'Error rate exceeded 5%',
      cooldownMinutes: 5,
    },
    {
      metric: 'responseTime',
      operator: '>',
      threshold: 2000, // 2 seconds
      severity: 'medium',
      message: 'Average response time exceeded 2 seconds',
      cooldownMinutes: 10,
    },
    {
      metric: 'cpuUsage',
      operator: '>',
      threshold: 80, // 80%
      severity: 'high',
      message: 'CPU usage exceeded 80%',
      cooldownMinutes: 5,
    },
    {
      metric: 'memoryUsage',
      operator: '>',
      threshold: 85, // 85%
      severity: 'high',
      message: 'Memory usage exceeded 85%',
      cooldownMinutes: 5,
    },
  ];

  private lastAlerts: Map<string, number> = new Map();
  private startTime: number = Date.now();

  private constructor() {
    // Start periodic metrics collection
    this.startPeriodicCollection();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Record request metrics
  async recordRequest(
    request: NextRequest,
    responseTime: number,
    statusCode: number,
    userId?: string,
  ): Promise<void> {
    const now = Date.now();
    const clientIP = this.getClientIP(request);
    const endpoint = request.nextUrl.pathname;

    // Update basic metrics
    const key = this.getCurrentPeriodKey();
    const currentMetrics = this.metrics.get(key) || this.getEmptyMetrics();

    currentMetrics.totalRequests++;
    currentMetrics.responseTime = (currentMetrics.responseTime + responseTime) / 2;

    if (statusCode >= 400) {
      currentMetrics.failedRequests++;
    } else {
      currentMetrics.successfulRequests++;
    }

    currentMetrics.errorRate = currentMetrics.failedRequests / currentMetrics.totalRequests;
    currentMetrics.throughput = currentMetrics.totalRequests / (currentMetrics.period / 1000);

    // Update concurrent requests (simplified)
    currentMetrics.concurrentRequests = Math.max(
      1,
      Math.min(100, currentMetrics.concurrentRequests + 1),
    );

    // Update system metrics (simplified - in production use system monitoring)
    currentMetrics.cpuUsage = this.getSimulatedCPUUsage();
    currentMetrics.memoryUsage = this.getSimulatedMemoryUsage();
    currentMetrics.activeConnections = currentMetrics.concurrentRequests;

    this.metrics.set(key, currentMetrics);

    // Check for alerts
    await this.checkAlerts(currentMetrics);

    // Log slow requests
    if (responseTime > 5000) {
      console.warn(`Slow request detected: ${responseTime}ms - ${endpoint} - ${clientIP}`);
    }

    // Log high error rates
    if (currentMetrics.errorRate > 0.1) {
      console.error(`High error rate detected: ${(currentMetrics.errorRate * 100).toFixed(2)}%`);
    }
  }

  // Get current metrics
  getCurrentMetrics(): PerformanceMetrics | null {
    const key = this.getCurrentPeriodKey();
    return this.metrics.get(key) || null;
  }

  // Get metrics for a specific period
  getMetricsForPeriod(minutes: number = 60): PerformanceMetrics[] {
    const metrics: PerformanceMetrics[] = [];
    const now = Date.now();

    for (let i = 0; i < minutes; i++) {
      const timestamp = now - i * 60 * 1000;
      const key = this.getPeriodKey(timestamp);
      const periodMetrics = this.metrics.get(key);

      if (periodMetrics) {
        metrics.push(periodMetrics);
      }
    }

    return metrics.reverse();
  }

  // Get system health
  async getSystemHealth(): Promise<SystemHealth> {
    const currentMetrics = this.getCurrentMetrics();
    const issues: string[] = [];
    const recommendations: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (!currentMetrics) {
      return {
        status: 'warning',
        uptime: Date.now() - this.startTime,
        lastHealthCheck: Date.now(),
        issues: ['No metrics available'],
        recommendations: ['Check monitoring system'],
      };
    }

    // Check various health indicators
    if (currentMetrics.errorRate > 0.05) {
      issues.push(`High error rate: ${(currentMetrics.errorRate * 100).toFixed(2)}%`);
      recommendations.push('Investigate recent errors and fix issues');
      status = 'warning';
    }

    if (currentMetrics.responseTime > 2000) {
      issues.push(`High response time: ${currentMetrics.responseTime.toFixed(0)}ms`);
      recommendations.push('Optimize slow endpoints or scale resources');
      status = status === 'warning' ? 'warning' : 'critical';
    }

    if (currentMetrics.cpuUsage > 80) {
      issues.push(`High CPU usage: ${currentMetrics.cpuUsage.toFixed(1)}%`);
      recommendations.push('Consider scaling CPU resources');
      status = status === 'warning' ? 'warning' : 'critical';
    }

    if (currentMetrics.memoryUsage > 85) {
      issues.push(`High memory usage: ${currentMetrics.memoryUsage.toFixed(1)}%`);
      recommendations.push('Optimize memory usage or scale memory');
      status = status === 'warning' ? 'warning' : 'critical';
    }

    if (currentMetrics.concurrentRequests > 50) {
      issues.push(`High concurrent requests: ${currentMetrics.concurrentRequests}`);
      recommendations.push('Monitor system load and consider horizontal scaling');
      status = status === 'warning' ? 'warning' : 'critical';
    }

    return {
      status,
      uptime: Date.now() - this.startTime,
      lastHealthCheck: Date.now(),
      issues,
      recommendations,
    };
  }

  // Get performance summary
  getPerformanceSummary(): {
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
    throughput: number;
    uptime: number;
    healthScore: number;
  } {
    const allMetrics = Array.from(this.metrics.values());
    if (allMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        totalRequests: 0,
        errorRate: 0,
        throughput: 0,
        uptime: Date.now() - this.startTime,
        healthScore: 0,
      };
    }

    const totalRequests = allMetrics.reduce((sum, m) => sum + m.totalRequests, 0);
    const totalResponseTime = allMetrics.reduce(
      (sum, m) => sum + m.responseTime * m.totalRequests,
      0,
    );
    const totalErrors = allMetrics.reduce((sum, m) => sum + m.failedRequests, 0);
    const totalTime = allMetrics.reduce((sum, m) => sum + m.period, 0);

    const averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;
    const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;
    const throughput = totalTime > 0 ? totalRequests / (totalTime / 1000) : 0;

    // Calculate health score (0-100)
    const healthScore = Math.max(
      0,
      Math.min(100, 100 - errorRate * 1000 - Math.max(0, averageResponseTime - 1000) / 10),
    );

    return {
      averageResponseTime,
      totalRequests,
      errorRate,
      throughput,
      uptime: Date.now() - this.startTime,
      healthScore,
    };
  }

  // Add custom alert condition
  addAlertCondition(condition: AlertCondition): void {
    this.alertConditions.push(condition);
  }

  // Remove alert condition
  removeAlertCondition(index: number): void {
    if (index >= 0 && index < this.alertConditions.length) {
      this.alertConditions.splice(index, 1);
    }
  }

  // Private methods
  private getCurrentPeriodKey(): string {
    return this.getPeriodKey(Date.now());
  }

  private getPeriodKey(timestamp: number): string {
    const periodStart = Math.floor(timestamp / 60000) * 60000; // 1-minute periods
    return `metrics:${periodStart}`;
  }

  private getEmptyMetrics(): PerformanceMetrics {
    return {
      responseTime: 0,
      throughput: 0,
      errorRate: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      activeConnections: 0,
      concurrentRequests: 0,
      dbConnectionPoolSize: 10,
      dbActiveConnections: 0,
      dbQueryLatency: 0,
      cacheHitRate: 0,
      cacheMissRate: 0,
      mlModelLatency: 0,
      mlModelAccuracy: 0,
      mlThreatDetectionRate: 0,
      blockedRequests: 0,
      suspiciousActivityCount: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      timestamp: Date.now(),
      period: 60000,
    };
  }

  private async checkAlerts(metrics: PerformanceMetrics): Promise<void> {
    const now = Date.now();

    for (const condition of this.alertConditions) {
      const metricValue = metrics[condition.metric] as number;
      const alertKey = `${condition.metric}:${condition.threshold}`;

      let shouldAlert = false;

      switch (condition.operator) {
        case '>':
          shouldAlert = metricValue > condition.threshold;
          break;
        case '<':
          shouldAlert = metricValue < condition.threshold;
          break;
        case '>=':
          shouldAlert = metricValue >= condition.threshold;
          break;
        case '<=':
          shouldAlert = metricValue <= condition.threshold;
          break;
        case '==':
          shouldAlert = metricValue === condition.threshold;
          break;
        case '!=':
          shouldAlert = metricValue !== condition.threshold;
          break;
      }

      if (shouldAlert) {
        const lastAlert = this.lastAlerts.get(alertKey) || 0;
        const cooldownMs = condition.cooldownMinutes * 60 * 1000;

        if (now - lastAlert > cooldownMs) {
          this.lastAlerts.set(alertKey, now);

          // Trigger alert (in production, send to monitoring system)
          console.warn(
            `🚨 PERFORMANCE ALERT: ${condition.severity.toUpperCase()} - ${condition.message}`,
          );
          console.warn(
            `Metric: ${condition.metric} = ${metricValue}, Threshold: ${condition.threshold}`,
          );

          // Here you would integrate with your alert system
          // await this.sendAlert(condition, metricValue)
        }
      }
    }
  }

  private getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');

    if (cfConnectingIP) return cfConnectingIP.split(',')[0].trim();
    if (forwardedFor) return forwardedFor.split(',')[0].trim();
    if (realIP) return realIP.trim();

    return '127.0.0.1';
  }

  private getSimulatedCPUUsage(): number {
    // In production, get actual CPU usage from system
    return 20 + Math.random() * 40; // 20-60% for simulation
  }

  private getSimulatedMemoryUsage(): number {
    // In production, get actual memory usage from system
    return 40 + Math.random() * 30; // 40-70% for simulation
  }

  private startPeriodicCollection(): void {
    // Collect system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Clean up old metrics every hour
    setInterval(
      () => {
        this.cleanupOldMetrics();
      },
      60 * 60 * 1000,
    );
  }

  private collectSystemMetrics(): void {
    // In production, collect actual system metrics
    // For now, this is a placeholder
    const key = this.getCurrentPeriodKey();
    const currentMetrics = this.metrics.get(key) || this.getEmptyMetrics();

    // Update system metrics
    currentMetrics.cpuUsage = this.getSimulatedCPUUsage();
    currentMetrics.memoryUsage = this.getSimulatedMemoryUsage();
    currentMetrics.timestamp = Date.now();

    this.metrics.set(key, currentMetrics);
  }

  private cleanupOldMetrics(): void {
    // Remove metrics older than 24 hours
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const keysToDelete: string[] = [];

    for (const [key] of this.metrics.entries()) {
      if (key.startsWith('metrics:')) {
        const timestamp = parseInt(key.split(':')[1]);
        if (timestamp < cutoff) {
          keysToDelete.push(key);
        }
      }
    }

    keysToDelete.forEach((key) => this.metrics.delete(key));
  }

  // API endpoint for metrics
  async getMetricsAPI(): Promise<{
    current: PerformanceMetrics | null;
    summary: ReturnType<PerformanceMonitor['getPerformanceSummary']>;
    health: SystemHealth;
    history: PerformanceMetrics[];
  }> {
    return {
      current: this.getCurrentMetrics(),
      summary: this.getPerformanceSummary(),
      health: await this.getSystemHealth(),
      history: this.getMetricsForPeriod(60), // Last hour
    };
  }
}

// Middleware wrapper for performance monitoring
export function withPerformanceMonitoring(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const monitor = PerformanceMonitor.getInstance();
    const startTime = Date.now();

    try {
      const response = await handler(request);
      const responseTime = Date.now() - startTime;

      // Record metrics asynchronously
      monitor.recordRequest(request, responseTime, response.status);

      // Add performance headers
      response.headers.set('X-Response-Time', responseTime.toString());
      response.headers.set('X-Performance-Monitor', 'enabled');

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Record error metrics
      monitor.recordRequest(request, responseTime, 500);

      throw error;
    }
  };
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
