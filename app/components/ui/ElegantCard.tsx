'use client';

import React, { ReactNode, ElementType } from 'react';
import clsx from 'clsx';

export interface ElegantCardProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  as?: ElementType;
  rounded?: string;
  gradient?: boolean;
  tone?:
    | 'default'
    | 'brand'
    | 'glass'
    | 'security'
    | 'success'
    | 'danger'
    | 'navy'
    | 'firewall'
    | 'agents'
    | 'robotics'
    | 'appstore';
  pattern?: 'none' | 'dots' | 'grid' | 'mesh';
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  hover?: boolean;
  role?: string;
  ariaLabel?: string;
  onClick?: () => void;
}

export default function ElegantCard({
  children,
  className,
  innerClassName,
  as = 'div',
  rounded = 'rounded-2xl',
  gradient = true,
  tone = 'default',
  pattern = 'none',
  elevation = 'md',
  glow = false,
  hover = false,
  role,
  ariaLabel,
  onClick,
}: ElegantCardProps) {
  const OuterTag: any = as ?? 'div';

  const elevationClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  type Tone = NonNullable<ElegantCardProps['tone']>;
  const toneStyles: Record<Tone, { border: string; bg: string; gradientBorder: string }> = {
    default: {
      border: 'border-border',
      bg: 'bg-card',
      gradientBorder: 'from-border/50 via-border/30 to-transparent',
    },
    brand: {
      border: 'border-brand-electric/20',
      bg: 'bg-gradient-to-br from-brand-electric/5 to-brand-cyber/5',
      gradientBorder: 'from-brand-electric/40 via-brand-cyber/30 to-brand-deep/40',
    },
    glass: {
      border: 'border-white/10 dark:border-white/5',
      bg: 'bg-card/80 backdrop-blur-lg backdrop-saturate-150',
      gradientBorder:
        'from-white/20 via-white/10 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent',
    },
    security: {
      border: 'border-destructive/20',
      bg: 'bg-gradient-to-br from-destructive/5 to-warning/5',
      gradientBorder: 'from-destructive/40 via-warning/30 to-success/40',
    },
    success: {
      border: 'border-success/20',
      bg: 'bg-gradient-to-br from-success/5 to-success/10',
      gradientBorder: 'from-success/40 via-success/30 to-success/20',
    },
    danger: {
      border: 'border-destructive/20',
      bg: 'bg-gradient-to-br from-destructive/5 to-destructive/10',
      gradientBorder: 'from-destructive/40 via-destructive/30 to-destructive/20',
    },
    navy: {
      border: 'border-slate-800/20',
      bg: 'bg-gradient-to-br from-slate-900/10 via-slate-800/5 to-slate-900/5',
      gradientBorder: 'from-slate-800/40 via-slate-700/30 to-slate-900/40',
    },
    firewall: {
      border: 'border-destructive/30',
      bg: 'bg-gradient-to-br from-[color-mix(in_oklab,var(--status-danger) 8%,transparent)] to-[color-mix(in_oklab,var(--warning) 6%,transparent)]',
      gradientBorder:
        'from-[color-mix(in_oklab,var(--status-danger) 50%,transparent)] via-[color-mix(in_oklab,var(--warning) 35%,transparent)] to-[color-mix(in_oklab,var(--success) 35%,transparent)]',
    },
    agents: {
      border: 'border-brand-electric/25',
      bg: 'bg-gradient-to-br from-brand-electric/5 via-brand-cyber/5 to-brand-deep/5',
      gradientBorder: 'from-brand-electric/40 via-brand-cyber/30 to-brand-deep/40',
    },
    robotics: {
      border: 'border-indigo-400/25',
      bg: 'bg-gradient-to-br from-[color-mix(in_oklab,var(--usp-robotics) 10%,transparent)] to-[color-mix(in_oklab,var(--usp-robotics-light) 8%,transparent)]',
      gradientBorder: 'from-indigo-400/40 via-violet-400/30 to-slate-700/30',
    },
    appstore: {
      border: 'border-emerald-400/25',
      bg: 'bg-gradient-to-br from-[color-mix(in_oklab,var(--usp-appstore) 10%,transparent)] to-[color-mix(in_oklab,var(--usp-appstore-light) 8%,transparent)]',
      gradientBorder: 'from-emerald-400/40 via-teal-400/30 to-blue-400/25',
    },
  };

  return (
    <div
      className={clsx(
        'relative h-full overflow-hidden',
        rounded,
        gradient && 'p-[1px]',
        gradient && `bg-gradient-to-br ${toneStyles[tone].gradientBorder}`,
        elevationClasses[elevation],
        glow && 'shadow-glow-electric hover:shadow-glow-premium transition-all duration-500',
        hover && 'hover:-translate-y-1 hover:shadow-xl cursor-pointer transition-all duration-300',
        className,
      )}
    >
      <OuterTag
        className={clsx(
          'relative h-full box-border border transition-all duration-300',
          toneStyles[tone].border,
          toneStyles[tone].bg,
          rounded,
          innerClassName,
        )}
        role={role}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {children}

        {/* Pattern Overlays */}
        {pattern === 'dots' && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        )}
        {pattern === 'grid' && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        )}
        {pattern === 'mesh' && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                tone === 'security'
                  ? 'var(--mesh-danger)'
                  : tone === 'success'
                    ? 'var(--mesh-success)'
                    : tone === 'firewall'
                      ? 'var(--mesh-danger)'
                      : tone === 'agents'
                        ? 'var(--mesh-brand)'
                        : tone === 'robotics'
                          ? 'var(--mesh-robotics)'
                          : tone === 'appstore'
                            ? 'var(--mesh-appstore)'
                            : 'var(--mesh-brand)',
            }}
          />
        )}

        {/* Premium Glass Effect */}
        {tone === 'glass' && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent dark:from-white/5" />
        )}

        {/* Subtle Top Highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10" />
      </OuterTag>
    </div>
  );
}
