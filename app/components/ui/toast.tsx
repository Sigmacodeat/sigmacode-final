import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  className?: string;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ title, description, variant = 'default', className, ...props }, ref) => {
    const variantClasses = {
      default: 'border-gray-200 bg-white text-gray-900',
      destructive: 'border-red-200 bg-red-50 text-red-900',
      success: 'border-green-200 bg-green-50 text-green-900',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'pointer-events-auto flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        <div className="grid gap-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
      </div>
    );
  },
);
Toast.displayName = 'Toast';

export { Toast };
