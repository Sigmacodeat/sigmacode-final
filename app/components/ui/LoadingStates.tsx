'use client';

import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  state?: LoadingState;
  message?: string;
  className?: string;
  showMessage?: boolean;
  'aria-label'?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const stateIcons = {
  idle: null,
  loading: Loader2,
  success: CheckCircle,
  error: AlertCircle,
};

const stateColors = {
  idle: 'var(--muted-foreground)',
  loading: 'var(--primary)',
  success: 'var(--green-600)',
  error: 'var(--destructive)',
};

export function LoadingSpinner({
  size = 'md',
  state = 'loading',
  message,
  className = '',
  showMessage = true,
  'aria-label': ariaLabel,
}: LoadingSpinnerProps) {
  const Icon = stateIcons[state];
  const iconClass = sizeClasses[size];
  const color = stateColors[state];

  const defaultAriaLabel = {
    idle: 'Inaktiv',
    loading: 'Lädt...',
    success: 'Erfolgreich geladen',
    error: 'Fehler beim Laden',
  }[state];

  const displayMessage = message || defaultAriaLabel;

  if (state === 'idle') {
    return null;
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-label={ariaLabel || defaultAriaLabel}
      aria-live="polite"
    >
      {Icon && (
        <Icon
          className={`${iconClass} ${state === 'loading' ? 'animate-spin' : ''}`}
          style={{ color }}
          aria-hidden="true"
        />
      )}

      {showMessage && (
        <p className="text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>
          {displayMessage}
        </p>
      )}

      {/* Screen reader only content for better accessibility */}
      <span className="sr-only">
        {state === 'loading' && 'Inhalt wird geladen, bitte warten'}
        {state === 'success' && 'Inhalt erfolgreich geladen'}
        {state === 'error' && 'Fehler beim Laden des Inhalts'}
      </span>
    </div>
  );
}

// Hook for managing loading states
import { useState, useCallback } from 'react';

export function useLoadingState(initialState: LoadingState = 'idle') {
  const [state, setState] = useState<LoadingState>(initialState);

  const setLoading = useCallback(() => setState('loading'), []);
  const setSuccess = useCallback(() => setState('success'), []);
  const setError = useCallback(() => setState('error'), []);
  const setIdle = useCallback(() => setState('idle'), []);
  const reset = useCallback(() => setState(initialState), [initialState]);

  return {
    state,
    setLoading,
    setSuccess,
    setError,
    setIdle,
    reset,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    isIdle: state === 'idle',
  };
}

// Skeleton loader for content placeholders
interface SkeletonProps {
  className?: string;
  lines?: number;
  width?: string | string[];
  height?: string;
}

export function Skeleton({ className = '', lines = 1, width, height = 'h-4' }: SkeletonProps) {
  const widths = Array.isArray(width) ? width : Array(lines).fill(width || 'w-full');

  return (
    <div className={`animate-pulse ${className}`} role="presentation" aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-muted rounded ${height} mb-2`}
          style={{
            width: widths[index] === 'w-full' ? '100%' : widths[index],
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}

// Progressive loading wrapper
interface ProgressiveLoaderProps {
  children: React.ReactNode;
  loading?: boolean;
  skeleton?: React.ReactNode;
  error?: React.ReactNode;
  delay?: number;
}

export function ProgressiveLoader({
  children,
  loading = false,
  skeleton,
  error,
  delay = 0,
}: ProgressiveLoaderProps) {
  const [showSkeleton, setShowSkeleton] = useState(delay === 0);

  useState(() => {
    if (loading && delay > 0) {
      const timer = setTimeout(() => setShowSkeleton(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(loading);
    }
  });

  if (error) {
    return <>{error}</>;
  }

  if (loading && showSkeleton) {
    return skeleton ? <>{skeleton}</> : <Skeleton lines={3} />;
  }

  return <>{children}</>;
}
