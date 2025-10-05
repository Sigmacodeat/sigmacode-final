import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'soft';
  size?: 'sm' | 'default' | 'lg';
  pulse?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'brand', size = 'default', pulse, ...props }, ref) => {
    const variants = {
      brand: 'bg-brand-electric/10 text-brand-electric border-brand-electric/20',
      success: 'bg-success/10 text-success border-success/20',
      warning: 'bg-warning/10 text-warning border-warning/20',
      danger: 'bg-destructive/10 text-destructive border-destructive/20',
      info: 'bg-info/10 text-info border-info/20',
      outline: 'bg-transparent text-foreground border-border',
      soft: 'bg-muted text-muted-foreground border-transparent',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-[10px]',
      default: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border font-semibold',
          'transition-colors duration-250',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {pulse && (
          <span
            className={cn(
              'relative flex h-2 w-2',
              variant === 'brand' && 'text-brand-electric',
              variant === 'success' && 'text-success',
              variant === 'warning' && 'text-warning',
              variant === 'danger' && 'text-destructive',
            )}
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
          </span>
        )}
        {props.children}
      </div>
    );
  },
);
Badge.displayName = 'Badge';

export { Badge };
