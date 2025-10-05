'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const locale = useLocale();
  const prefix = `/${locale}`;
  const withLocale = (href: string) => {
    if (/^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:'))
      return href;
    if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href;
    if (href === '/') return prefix + '/';
    if (href.startsWith('/#')) return `${prefix}${href}`;
    return `${prefix}${href}`;
  };

  return (
    <div
      className="min-h-[400px] flex items-center justify-center p-8"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center max-w-md">
        <div className="mb-6">
          <AlertTriangle
            className="h-16 w-16 mx-auto mb-4"
            style={{ color: 'var(--destructive)' }}
            aria-hidden="true"
          />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--destructive)' }}>
            Etwas ist schiefgelaufen
          </h2>
          <p className="text-muted-foreground mb-4">
            Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kehren Sie
            zur Startseite zurück.
          </p>
          {process.env.NODE_ENV === 'development' && error && (
            <details className="text-left bg-muted p-4 rounded-lg text-sm">
              <summary className="cursor-pointer font-medium mb-2">
                Fehlerdetails (Development)
              </summary>
              <pre
                className="whitespace-pre-wrap text-xs"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={resetError}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
            aria-label="Seite neu laden und Fehler zurücksetzen"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Erneut versuchen
          </button>

          <Link
            href={withLocale('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--fg)',
            }}
            aria-label="Zurück zur Startseite"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);

      // Here you would typically send to error monitoring service
      // Example: Sentry.captureException(error, { contexts: { errorInfo } });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// HOC for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
