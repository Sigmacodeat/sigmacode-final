import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  status?: 'default' | 'success' | 'warning' | 'error';
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, status = 'default', fullWidth, ...props }, ref) => {
    const statusStyles = {
      default: 'border-border focus-visible:ring-brand-electric',
      success: 'border-success/30 focus-visible:ring-success bg-success/5',
      warning: 'border-warning/30 focus-visible:ring-warning bg-warning/5',
      error: 'border-destructive/30 focus-visible:ring-destructive bg-destructive/5',
    };

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 rounded-lg border bg-background px-3 py-2 text-sm',
          'ring-offset-background transition-all duration-250',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'hover:border-brand-electric/50',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border',
          fullWidth && 'w-full',
          statusStyles[status],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
