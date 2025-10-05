import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  status?: 'default' | 'success' | 'warning' | 'error';
  fullWidth?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, status = 'default', fullWidth, ...props }, ref) => {
    const statusStyles = {
      default: 'border-border focus-visible:ring-brand-electric',
      success: 'border-success/30 focus-visible:ring-success bg-success/5',
      warning: 'border-warning/30 focus-visible:ring-warning bg-warning/5',
      error: 'border-destructive/30 focus-visible:ring-destructive bg-destructive/5',
    } as const;

    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[100px] w-full rounded-lg border bg-background px-3 py-2 text-sm',
          'ring-offset-background transition-all duration-250',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'hover:border-brand-electric/50',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border',
          fullWidth && 'w-full',
          statusStyles[status],
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
