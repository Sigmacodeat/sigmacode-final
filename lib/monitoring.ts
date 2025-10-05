// Production Monitoring System
// lib/monitoring.ts

export interface PerformanceMetrics {
  url: string;
  loadTime: number;
  domReady: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timestamp: number;
  userAgent: string;
  viewport: string;
  connection: string;
}

export interface ErrorMetrics {
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  userAgent: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AnalyticsEvent {
  type: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

class MonitoringService {
  private queue: (PerformanceMetrics | ErrorMetrics | AnalyticsEvent)[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds

  constructor() {
    this.startPeriodicFlush();
    this.setupGlobalErrorHandlers();
    this.setupPerformanceObserver();
  }

  // Performance Monitoring
  trackPerformance(): void {
    if (typeof window === 'undefined') return;

    // Track page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');

      const metrics: PerformanceMetrics = {
        url: window.location.href,
        loadTime: performance.now(),
        domReady: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paintEntries.find((entry) => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint:
          paintEntries.find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: 0, // Will be updated by observer
        cumulativeLayoutShift: 0, // Will be updated by observer
        firstInputDelay: 0, // Will be updated by observer
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        connection: (navigator as any).connection?.effectiveType || 'unknown',
      };

      this.trackEvent(metrics);
    });
  }

  // Error Monitoring
  trackError(error: Error, severity: ErrorMetrics['severity'] = 'medium'): void {
    const errorMetrics: ErrorMetrics = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      line: (error as any).lineNumber,
      column: (error as any).columnNumber,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      severity,
    };

    this.trackEvent(errorMetrics);
  }

  // Analytics Event Tracking
  trackEvent(event: PerformanceMetrics | ErrorMetrics | AnalyticsEvent): void {
    this.queue.push(event);

    if (this.queue.length >= this.BATCH_SIZE) {
      this.flush();
    }
  }

  // Custom Analytics Events
  trackCustomEvent(
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>,
  ): void {
    const event: AnalyticsEvent = {
      type: 'custom',
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      metadata,
    };

    this.trackEvent(event);
  }

  // User Interaction Tracking
  trackUserInteraction(element: HTMLElement, action: string): void {
    const metadata = {
      element: element.tagName.toLowerCase(),
      id: element.id,
      className: element.className,
      textContent: element.textContent?.substring(0, 100),
    };

    this.trackCustomEvent('user_interaction', action, element.tagName, 1, metadata);
  }

  // Page View Tracking
  trackPageView(page: string, referrer?: string): void {
    this.trackCustomEvent('navigation', 'page_view', page, 1, {
      referrer: referrer || document.referrer,
    });
  }

  private setupGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') return;

    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError(new Error(event.message), 'high');
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason?.toString() || 'Unhandled Promise Rejection'), 'high');
    });

    // Resource loading errors
    window.addEventListener(
      'error',
      (event) => {
        if (event.target !== window) {
          this.trackError(new Error(`Resource failed to load: ${event.target}`), 'medium');
        }
      },
      true,
    );
  }

  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.trackCustomEvent('performance', 'lcp', undefined, lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as any; // PerformanceEntry doesn't have processingStart in types
        this.trackCustomEvent(
          'performance',
          'fid',
          undefined,
          fidEntry.processingStart - entry.startTime,
        );
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      list.getEntries().forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
      this.trackCustomEvent('performance', 'cls', undefined, clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sigmacode_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sigmacode_session_id', sessionId);
    }
    return sessionId;
  }

  private startPeriodicFlush(): void {
    this.flushInterval = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.FLUSH_INTERVAL);
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0);

    try {
      // Send to analytics endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: batch }),
      });
    } catch (error) {
      // If analytics fails, store in localStorage as fallback
      try {
        const existing = JSON.parse(localStorage.getItem('sigmacode_analytics_queue') || '[]');
        existing.push(...batch);
        localStorage.setItem('sigmacode_analytics_queue', JSON.stringify(existing.slice(-1000))); // Keep last 1000 events
      } catch (storageError) {
        console.warn('Failed to store analytics data:', storageError);
      }
    }
  }

  // Flush remaining events on page unload
  public flushSync(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Export singleton instance
export const monitoring = new MonitoringService();

// Hook for React components
export function useMonitoring() {
  return {
    trackError: monitoring.trackError.bind(monitoring),
    trackCustomEvent: monitoring.trackCustomEvent.bind(monitoring),
    trackUserInteraction: monitoring.trackUserInteraction.bind(monitoring),
    trackPageView: monitoring.trackPageView.bind(monitoring),
  };
}

// Initialize monitoring
if (typeof window !== 'undefined') {
  monitoring.trackPerformance();

  // Flush on page unload
  window.addEventListener('beforeunload', () => {
    monitoring.flushSync();
  });
}
