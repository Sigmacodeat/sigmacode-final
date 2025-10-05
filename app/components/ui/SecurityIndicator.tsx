'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export type SecurityStatus = 'unsecured' | 'processing' | 'protected' | 'warning';

export interface SecurityIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status: SecurityStatus;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
  animated?: boolean;
}

const statusConfig: Record<
  SecurityStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    border: string;
    label: string;
  }
> = {
  unsecured: {
    icon: AlertTriangle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    label: 'Unsecured',
  },
  processing: {
    icon: Loader2,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    label: 'Processing',
  },
  protected: {
    icon: CheckCircle,
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
    label: 'Protected',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    label: 'Warning',
  },
};

export function SecurityIndicator({
  status,
  label,
  showIcon = true,
  size = 'default',
  animated = true,
  className,
  ...props
}: SecurityIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizes = {
    sm: {
      container: 'h-8 px-3 text-xs gap-1.5',
      icon: 'h-3.5 w-3.5',
    },
    default: {
      container: 'h-10 px-4 text-sm gap-2',
      icon: 'h-4 w-4',
    },
    lg: {
      container: 'h-12 px-5 text-base gap-2.5',
      icon: 'h-5 w-5',
    },
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xl border font-medium transition-all duration-300',
        config.bg,
        config.border,
        config.color,
        sizes[size].container,
        className,
      )}
      {...props}
    >
      {showIcon && (
        <Icon
          className={cn(sizes[size].icon, animated && status === 'processing' && 'animate-spin')}
        />
      )}
      <span>{label || config.label}</span>

      {/* Pulse indicator for protected status */}
      {status === 'protected' && animated && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
        </span>
      )}

      {/* Glow effect for unsecured status */}
      {status === 'unsecured' && animated && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
        </span>
      )}
    </div>
  );
}

export default SecurityIndicator;
