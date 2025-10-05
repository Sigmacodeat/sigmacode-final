import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | 'icon';
  loading?: boolean;
  glow?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'brand', size = 'default', loading, glow, children, disabled, ...props },
    ref,
  ) => {
    const variants = {
      brand:
        'bg-gradient-brand text-white hover:opacity-90 shadow-md hover:shadow-glow-electric transition-all duration-300',
      success:
        'bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-glow-success',
      warning:
        'bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:shadow-glow-danger',
      danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
      outline:
        'border-2 border-brand-electric bg-transparent text-brand-electric hover:bg-brand-electric/10',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-brand-electric underline-offset-4 hover:underline',
    };

    const sizes = {
      xs: 'h-7 px-2.5 text-xs rounded-md',
      sm: 'h-9 px-3 text-sm rounded-lg',
      default: 'h-10 px-4 py-2 text-sm rounded-lg',
      lg: 'h-12 px-6 text-base rounded-xl',
      xl: 'h-14 px-8 text-lg rounded-xl',
      icon: 'h-10 w-10 rounded-lg',
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium',
          'ring-offset-background transition-all duration-250 ease-smooth',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-[0.98]',
          glow && 'hover:shadow-glow-electric',
          variants[variant],
          sizes[size],
          className,
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button };
