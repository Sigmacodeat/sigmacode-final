import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error | null) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnChange?: any[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public static defaultProps: Partial<ErrorBoundaryProps> = {
    resetOnChange: [],
  };

  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnChange } = this.props;

    if (
      resetOnChange &&
      resetOnChange.length > 0 &&
      JSON.stringify(prevProps.resetOnChange) !== JSON.stringify(resetOnChange)
    ) {
      this.resetErrorBoundary();
    }
  }

  public resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (typeof fallback === 'function') {
        return fallback(error);
      }
      return (
        fallback || (
          <div data-testid="error-boundary">
            <h2>Something went wrong</h2>
            {error && <p>{error.toString()}</p>}
            {errorInfo?.componentStack && (
              <details style={{ whiteSpace: 'pre-wrap' }}>{errorInfo.componentStack}</details>
            )}
          </div>
        )
      );
    }

    return children;
  }
}

export default ErrorBoundary;
