'use client';

import { cn } from '@/app/lib/utils';
import { ReactNode } from 'react';

interface PremiumTrustBadgeProps {
  icon: ReactNode;
  topLabel: string;
  title: string;
  variant?: 'soc2' | 'iso' | 'uptime' | 'latency' | 'custom';
  className?: string;
  size?: 'md' | 'sm';
  onClick?: () => void;
}

const variantStyles: Record<NonNullable<PremiumTrustBadgeProps['variant']>, string> = {
  soc2: 'from-sky-400/30 via-sky-300/20 to-sky-400/30',
  iso: 'from-teal-400/30 via-teal-300/20 to-teal-400/30',
  uptime: 'from-emerald-400/30 via-emerald-300/20 to-emerald-400/30',
  latency: 'from-cyan-400/30 via-cyan-300/20 to-cyan-400/30',
  custom: 'from-brand-500/30 via-brand-400/20 to-brand-500/30',
};

export function PremiumTrustBadge({
  icon,
  topLabel,
  title,
  variant = 'custom',
  className,
  size = 'md',
  onClick,
}: PremiumTrustBadgeProps) {
  return (
    <div
      className={cn('relative rounded-xl group', onClick && 'cursor-pointer', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div
        className={cn(
          'rounded-xl p-[1px] bg-gradient-to-r transition-colors',
          variantStyles[variant],
        )}
      >
        <div
          className={cn(
            'rounded-[11px] bg-white/8 dark:bg-white/5 backdrop-blur-sm border border-white/10 flex items-center transition-colors',
            'group-hover:border-white/20',
            size === 'sm' ? 'px-3 py-2 gap-2' : 'px-4 py-3 gap-3',
          )}
        >
          <div
            className={cn(
              'flex items-center justify-center rounded-lg bg-white/10 border border-white/15 text-brand-300',
              size === 'sm' ? 'h-7 w-7' : 'h-9 w-9',
            )}
          >
            {icon}
          </div>
          <div className="leading-tight">
            <div
              className={cn(
                'uppercase tracking-wide text-slate-300',
                size === 'sm' ? 'text-[9px]' : 'text-[10px]',
              )}
            >
              {topLabel}
            </div>
            <div
              className={cn('font-semibold text-white', size === 'sm' ? 'text-[12px]' : 'text-sm')}
            >
              {title}
            </div>
          </div>
        </div>
      </div>
      {/* subtle radial aura */}
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 inset-0 rounded-xl opacity-20 blur-2xl bg-[radial-gradient(closest-side,rgba(59,130,246,0.25),transparent)]"
      />
    </div>
  );
}
