'use client';

import { cn } from '@/lib/utils';
import { Wifi } from 'lucide-react';
import * as React from 'react';

export type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  tone?: StatusTone;
  icon?: React.ReactNode;
  soft?: boolean; // softer background
  size?: 'sm' | 'md'; // chip size
}

export function StatusBadge({
  label,
  tone = 'neutral',
  icon,
  soft = true,
  size = 'md',
  className,
  ...props
}: StatusBadgeProps) {
  const tones: Record<StatusTone, { bg: string; border: string; text: string; icon: string }> = {
    success: {
      bg: soft
        ? 'bg-emerald-50/90 dark:bg-emerald-900/15'
        : 'bg-emerald-100 dark:bg-emerald-900/30',
      border: 'border-emerald-200/80 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: 'text-emerald-600 dark:text-emerald-400',
    },
    warning: {
      bg: soft ? 'bg-amber-50/90 dark:bg-amber-900/15' : 'bg-amber-100 dark:bg-amber-900/30',
      border: 'border-amber-200/80 dark:border-amber-800/60',
      text: 'text-amber-700 dark:text-amber-300',
      icon: 'text-amber-600 dark:text-amber-400',
    },
    error: {
      bg: soft ? 'bg-rose-50/90 dark:bg-rose-900/15' : 'bg-rose-100 dark:bg-rose-900/30',
      border: 'border-rose-200/80 dark:border-rose-800/60',
      text: 'text-rose-700 dark:text-rose-300',
      icon: 'text-rose-600 dark:text-rose-400',
    },
    info: {
      bg: soft ? 'bg-sky-50/90 dark:bg-sky-900/15' : 'bg-sky-100 dark:bg-sky-900/30',
      border: 'border-sky-200/80 dark:border-sky-800/60',
      text: 'text-sky-700 dark:text-sky-300',
      icon: 'text-sky-600 dark:text-sky-400',
    },
    neutral: {
      bg: soft ? 'bg-zinc-50/90 dark:bg-zinc-900/20' : 'bg-zinc-100 dark:bg-zinc-900/40',
      border: 'border-zinc-200/80 dark:border-zinc-700/60',
      text: 'text-zinc-700 dark:text-zinc-300',
      icon: 'text-zinc-600 dark:text-zinc-400',
    },
  };

  const sizes = {
    sm: 'h-6 px-2.5 text-[11px] gap-1.5',
    md: 'h-7 px-3 text-xs gap-2',
  } as const;

  const t = tones[tone];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border backdrop-blur-sm shadow-sm/10',
        t.bg,
        t.border,
        t.text,
        sizes[size],
        className,
      )}
      {...props}
    >
      <span className={cn('inline-flex items-center', t.icon)}>
        {icon ?? <Wifi className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />}
      </span>
      <span className="leading-none">{label}</span>
    </div>
  );
}
