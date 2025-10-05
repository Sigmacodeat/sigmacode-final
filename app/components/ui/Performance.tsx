'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

// Optimized Image Component with lazy loading and multiple formats
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className = '',
  onLoad,
  onError,
  placeholder,
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  if (hasError) {
    return (
      <div
        className={`bg-muted flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={`Bild konnte nicht geladen werden: ${alt}`}
      >
        <span className="text-muted-foreground text-sm">Bild nicht verfügbar</span>
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {inView && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          quality={quality}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {!isLoaded && inView && (
        <div className="absolute inset-0 bg-muted animate-pulse" aria-hidden="true" />
      )}
    </div>
  );
}

// Lazy loading wrapper for any component
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export function LazyComponent({
  children,
  fallback,
  rootMargin = '50px',
  threshold = 0.1,
}: LazyComponentProps) {
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  return (
    <div ref={ref}>
      {inView ? children : fallback || <div className="h-32 bg-muted animate-pulse rounded" />}
    </div>
  );
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    domReady: 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Measure load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      setMetrics((prev) => ({ ...prev, loadTime }));
    });

    // Measure DOM ready
    if (document.readyState === 'complete') {
      setMetrics((prev) => ({ ...prev, domReady: performance.now() }));
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        setMetrics((prev) => ({ ...prev, domReady: performance.now() }));
      });
    }

    // Measure paint timings
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'paint') {
            setMetrics((prev) => ({
              ...prev,
              [entry.name === 'first-paint' ? 'firstPaint' : 'firstContentfulPaint']:
                entry.startTime,
            }));
          }
        });
      });

      observer.observe({ entryTypes: ['paint'] });
    }

    return () => {
      // Cleanup observers
    };
  }, []);

  return metrics;
}

// Resource preloading utilities
export function useResourcePreloader() {
  const preloadImage = useCallback((src: string, as: 'image' = 'image') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = as;
    link.href = src;
    document.head.appendChild(link);
  }, []);

  const preloadScript = useCallback((src: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    document.head.appendChild(link);
  }, []);

  const preloadFont = useCallback(
    (src: string, type: 'font/woff2' | 'font/woff' = 'font/woff2') => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = type;
      link.href = src;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    },
    [],
  );

  return { preloadImage, preloadScript, preloadFont };
}

// Web Vitals monitoring
export function useWebVitals() {
  const [vitals, setVitals] = useState({
    CLS: 0,
    FID: 0,
    FCP: 0,
    LCP: 0,
    TTFB: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const name = entry.entryType === 'navigation' ? 'TTFB' : entry.name;

        setVitals((prev) => ({
          ...prev,
          [name]: entry.startTime || entry.duration || 0,
        }));
      });
    });

    observer.observe({ entryTypes: ['navigation', 'measure', 'paint'] });

    return () => observer.disconnect();
  }, []);

  return vitals;
}

// Critical CSS inlining helper
export function CriticalCSS({ children, css }: { children: React.ReactNode; css: string }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {children}
    </>
  );
}

// Bundle analyzer helper (for development)
export function useBundleAnalysis() {
  const [bundleInfo, setBundleInfo] = useState({
    chunks: 0,
    size: 0,
    warnings: [] as string[],
  });

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // This would typically be populated by webpack bundle analyzer
      // In a real implementation, you'd get this data from webpack stats

      const checkBundleSize = async () => {
        try {
          const response = await fetch('/api/bundle-info');
          const data = (await response.json()) as {
            chunks?: number;
            size?: number;
            warnings?: string[];
          };
          setBundleInfo({
            chunks: data.chunks ?? 0,
            size: data.size ?? 0,
            warnings: data.warnings ?? [],
          });
        } catch (error) {
          console.log('Bundle analysis not available');
        }
      };

      checkBundleSize();
    }
  }, []);

  return bundleInfo;
}
