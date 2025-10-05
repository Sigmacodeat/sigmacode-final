// Performance optimization utilities for SIGMACODE AI

// Critical CSS for above-the-fold content
export function getCriticalCSS() {
  return `
    /* Critical above-the-fold styles */
    body {
      font-family: var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0;
      background: var(--bg, #ffffff);
      color: var(--fg, #0f172a);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 1rem;
    }

    .fade-in {
      animation: fadeIn 0.6s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Performance optimizations */
    img {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }

    * {
      box-sizing: border-box;
    }
  `;
}

// Performance monitoring hook
export function usePerformance() {
  const reportWebVitals = (metric: any) => {
    console.log('Web Vitals:', metric);

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }
  };

  return { reportWebVitals };
}

// Service Worker registration
export function registerServiceWorker() {
  if ('serviceWorker' in navigator && typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// Performance budget monitoring
export function monitorPerformanceBudget() {
  if (typeof window !== 'undefined') {
    // Monitor Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.log('FID:', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Monitor Cumulative Layout Shift
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      let clsValue = 0;
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
}
