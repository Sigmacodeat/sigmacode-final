import * as React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

export interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const SubmitButton = React.forwardRef<HTMLButtonElement, SubmitButtonProps>(
  ({ className, loading, loadingText, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={loading || disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'hover:shadow-md active:scale-[0.98]',
          className,
        )}
        style={{ backgroundColor: 'var(--brand)', color: 'var(--brand-foreground)' }}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" className="mr-2 h-4 w-4" />}
        {loading ? loadingText || 'Lädt...' : children}
      </button>
    );
  },
);

SubmitButton.displayName = 'SubmitButton';
