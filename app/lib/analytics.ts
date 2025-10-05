'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

// Enhanced Analytics Event Interface
export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  customData?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
  url: string;
  userAgent: string;
  viewport: { width: number; height: number };
}

// Performance Metrics Interface
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'web-vitals' | 'custom' | 'navigation' | 'resource';
  metadata?: Record<string, any>;
}

/**
 * trackEvent - Wrapper für Plausible Events mit erweiterten Features
 */
export function trackEvent(name: string, props?: AnalyticsProps) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plausible = (typeof window !== 'undefined' && (window as any).plausible) as
      | ((eventName: string, options?: { props?: AnalyticsProps }) => void)
      | undefined;

    // Nur aufrufen, wenn plausible tatsächlich verfügbar ist
    if (plausible && typeof plausible === 'function') {
      plausible(name, props ? { props } : undefined);
    }
  } catch (_) {
    // no-op
  }
}

// Enhanced Analytics Manager Class
class EnhancedAnalyticsManager {
  private sessionId: string;
  private userId?: string;
  private eventsQueue: AnalyticsEvent[] = [];
  private performanceQueue: PerformanceMetric[] = [];
  private isEnabled: boolean = true;
  private flushInterval: NodeJS.Timeout | null = null;
  private pageStartTime: number = Date.now();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeAnalytics();
    this.setupPerformanceMonitoring();
    this.setupErrorTracking();
    this.startPeriodicFlush();
  }
  setupPerformanceMonitoring() {
    // No-op placeholder: Performance monitoring is initialized via trackPerformance()
    // This method remains for backward compatibility and can be extended if needed.
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeAnalytics() {
    this.isEnabled = this.getAnalyticsConsent() && !this.isDoNotTrack();

    if (this.isEnabled) {
      this.trackPageView();
      this.trackUserEngagement();
      this.trackPerformance();
    }
  }

  private getAnalyticsConsent(): boolean {
    if (typeof window === 'undefined') return false;
    const consent = localStorage.getItem('analytics-consent');
    return consent === 'granted';
  }

  private isDoNotTrack(): boolean {
    if (typeof window === 'undefined') return false;
    return window.navigator.doNotTrack === '1' || false;
  }

  // Enhanced Event Tracking
  public trackEvent(
    event: Omit<AnalyticsEvent, 'timestamp' | 'sessionId' | 'url' | 'userAgent' | 'viewport'>,
  ) {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    this.eventsQueue.push(analyticsEvent);

    // Send immediately for critical events
    if (event.category === 'error' || event.category === 'conversion') {
      this.flushEvents();
    }

    // Also send to Plausible
    trackEvent(event.name, {
      category: event.category,
      action: event.action,
      label: event.label,
      value: event.value,
      ...event.customData,
    });
  }

  public trackPageView(customData?: Record<string, any>) {
    const pageViewEvent = {
      name: 'page_view',
      category: 'navigation',
      action: 'view',
      label: window.location.pathname,
      customData: {
        referrer: document.referrer,
        title: document.title,
        timeOnPage: Date.now() - this.pageStartTime,
        ...customData,
      },
    };

    this.trackEvent(pageViewEvent);

    // Track with Plausible
    trackEvent('pageview');
  }

  public trackUserEngagement() {
    // Track scroll depth
    let maxScroll = 0;
    const trackScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100,
      );
      if (scrollPercentage > maxScroll) {
        maxScroll = scrollPercentage;
        if (scrollPercentage % 25 === 0) {
          this.trackEvent({
            name: 'scroll_depth',
            category: 'engagement',
            action: 'scroll',
            value: scrollPercentage,
          });
        }
      }
    };

    window.addEventListener('scroll', trackScroll);

    // Track time on page
    const trackTimeOnPage = () => {
      const timeSpent = Date.now() - this.pageStartTime;
      this.trackEvent({
        name: 'time_on_page',
        category: 'engagement',
        action: 'time_spent',
        value: Math.round(timeSpent / 1000),
      });
    };

    window.addEventListener('beforeunload', trackTimeOnPage);
  }

  private trackPerformance() {
    if (!this.isEnabled || typeof window === 'undefined') return;

    // Web Vitals monitoring
    this.observeWebVitals();
    this.observeResourceTiming();
    this.observeNavigationTiming();
  }

  private observeWebVitals() {
    if (!('PerformanceObserver' in window)) return;

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.trackPerformanceMetric({
          name: 'LCP',
          value: entry.startTime,
          category: 'web-vitals',
        });
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.trackPerformanceMetric({
          name: 'FID',
          value: (entry as any).processingStart - entry.startTime,
          category: 'web-vitals',
        });
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.trackPerformanceMetric({
        name: 'CLS',
        value: clsValue,
        category: 'web-vitals',
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }

  private observeResourceTiming() {
    if (!('PerformanceObserver' in window)) return;

    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming;
        if (resourceEntry.duration > 1000) {
          this.trackPerformanceMetric({
            name: 'slow_resource',
            value: resourceEntry.duration,
            category: 'resource',
            metadata: {
              url: resourceEntry.name,
              type: resourceEntry.initiatorType,
            },
          });
        }
      }
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
  }

  private observeNavigationTiming() {
    if (!('performance' in window)) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    this.trackPerformanceMetric({
      name: 'navigation_timing',
      value: navigation.loadEventEnd - navigation.startTime,
      category: 'navigation',
      metadata: {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
        loadComplete: navigation.loadEventEnd - navigation.startTime,
      },
    });
  }

  private trackPerformanceMetric(metric: Omit<PerformanceMetric, 'timestamp'>) {
    if (!this.isEnabled) return;

    const performanceMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.performanceQueue.push(performanceMetric);
    this.flushPerformanceMetrics();
  }

  private setupErrorTracking() {
    if (!this.isEnabled || typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.trackEvent({
        name: 'javascript_error',
        category: 'error',
        action: 'uncaught',
        label: event.message,
        customData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        },
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent({
        name: 'promise_rejection',
        category: 'error',
        action: 'unhandled',
        label: event.reason?.message || 'Unhandled Promise Rejection',
        customData: {
          reason: event.reason,
        },
      });
    });
  }

  private startPeriodicFlush() {
    if (!this.isEnabled) return;

    this.flushInterval = setInterval(() => {
      this.flushEvents();
      this.flushPerformanceMetrics();
    }, 30000);

    window.addEventListener('beforeunload', () => {
      this.flushEvents();
      this.flushPerformanceMetrics();
    });
  }

  private async flushEvents() {
    if (this.eventsQueue.length === 0) return;

    const eventsToSend = [...this.eventsQueue];
    this.eventsQueue = [];

    try {
      await this.sendToAnalyticsEndpoint('/api/analytics/events', eventsToSend);
    } catch (error) {
      console.error('Failed to flush events:', error);
      this.eventsQueue.unshift(...eventsToSend);
    }
  }

  private async flushPerformanceMetrics() {
    if (this.performanceQueue.length === 0) return;

    const metricsToSend = [...this.performanceQueue];
    this.performanceQueue = [];

    try {
      await this.sendToAnalyticsEndpoint('/api/analytics/performance', metricsToSend);
    } catch (error) {
      console.error('Failed to flush performance metrics:', error);
      this.performanceQueue.unshift(...metricsToSend);
    }
  }

  private async sendToAnalyticsEndpoint(endpoint: string, data: any) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          userId: this.userId,
          timestamp: Date.now(),
          data,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analytics request failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send analytics data:', error);
      throw error;
    }
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public getSessionId() {
    return this.sessionId;
  }
}

// Singleton instance
let analyticsInstance: EnhancedAnalyticsManager | null = null;

export function getAnalytics(): EnhancedAnalyticsManager {
  if (!analyticsInstance) {
    analyticsInstance = new EnhancedAnalyticsManager();
  }
  return analyticsInstance;
}

// React Hook for components
export function useAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const analytics = getAnalytics();

  const trackEvent = useCallback(
    (event: Parameters<typeof analytics.trackEvent>[0]) => {
      analytics.trackEvent(event);
    },
    [analytics],
  );

  const trackPageView = useCallback(
    (customData?: Record<string, any>) => {
      analytics.trackPageView({
        pathname,
        search: searchParams?.toString() ?? '',
        ...customData,
      });
    },
    [analytics, pathname, searchParams],
  );

  const setUserId = useCallback(
    (userId: string) => {
      analytics.setUserId(userId);
    },
    [analytics],
  );

  const getSessionId = useCallback(() => {
    return analytics.getSessionId();
  }, [analytics]);

  // Track route changes
  useEffect(() => {
    trackPageView();
  }, [pathname, trackPageView]);

  return {
    trackEvent,
    trackPageView,
    setUserId,
    getSessionId,
  };
}

// Utility functions for common tracking scenarios
export const analyticsUtils = {
  trackButtonClick: (buttonName: string, context?: Record<string, any>) => {
    getAnalytics().trackEvent({
      name: 'button_click',
      category: 'interaction',
      action: 'click',
      label: buttonName,
      customData: context,
    });
  },

  trackFormSubmission: (formName: string, success: boolean, context?: Record<string, any>) => {
    getAnalytics().trackEvent({
      name: 'form_submission',
      category: 'conversion',
      action: success ? 'success' : 'failure',
      label: formName,
      customData: context,
    });
  },

  trackFeatureUsage: (featureName: string, context?: Record<string, any>) => {
    getAnalytics().trackEvent({
      name: 'feature_usage',
      category: 'product',
      action: 'use',
      label: featureName,
      customData: context,
    });
  },

  trackSearch: (query: string, resultsCount: number) => {
    getAnalytics().trackEvent({
      name: 'search',
      category: 'search',
      action: 'query',
      label: query,
      value: resultsCount,
    });
  },

  trackError: (error: Error, context?: Record<string, any>) => {
    getAnalytics().trackEvent({
      name: 'error',
      category: 'error',
      action: 'occurred',
      label: error.message,
      customData: {
        stack: error.stack,
        ...context,
      },
    });
  },
};
