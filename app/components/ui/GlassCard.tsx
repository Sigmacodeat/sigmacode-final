'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  variant?: 'default' | 'subtle' | 'neon' | 'darkblue';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  variant = 'default',
  size = 'md',
  onClick,
}: GlassCardProps) {
  const variants = {
    default: 'backdrop-blur-xl border transition-all duration-300',
    subtle: 'backdrop-blur-md border transition-all duration-300',
    neon: 'backdrop-blur-xl border transition-all duration-300',
    darkblue:
      // dark navy surface with subtle gradient and blue border accents
      'border transition-all duration-300 will-change-transform ' +
      'bg-gradient-to-b from-[#0b0c12] to-[#0e1118] dark:from-[#0b0c12] dark:to-[#0e1118] ' +
      'border-brand-800/30 hover:border-brand-700/40 ' +
      'hover:shadow-[0_8px_30px_rgba(16,24,40,0.35)] hover:shadow-brand-700/10 ' +
      'hover:translate-y-[-1px]',
  } as const;

  const glowClasses = glow ? 'shadow-lg transition-all duration-500' : '';

  const hoverClasses = hover ? 'transition-all duration-300 ease-out' : '';

  const sizeClasses = {
    sm: 'p-4 rounded-xl',
    md: 'p-6 rounded-2xl',
    lg: 'p-8 rounded-3xl',
  } as const;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden',
        variants[variant],
        glowClasses,
        hoverClasses,
        sizeClasses[size],
        className,
      )}
      style={
        {
          backgroundColor:
            variant === 'neon'
              ? 'var(--primary)'
              : variant === 'darkblue'
                ? 'transparent' // handled by gradient classes
                : 'var(--card)',
          borderColor:
            variant === 'neon'
              ? 'var(--primary)'
              : variant === 'darkblue'
                ? 'var(--brand-800)'
                : 'var(--border)',
          boxShadow: glow
            ? '0 10px 15px -3px rgba(139, 92, 246, 0.1), 0 4px 6px -2px rgba(139, 92, 246, 0.05)'
            : undefined,
        } as React.CSSProperties
      }
    >
      {/* Subtiler innerer Glanz / Premium Overlays */}
      <div
        className={cn(
          'absolute inset-0 pointer-events-none',
          variant === 'darkblue'
            ? [
                // blue sheen
                'bg-[radial-gradient(900px_400px_at_-10%_-20%,rgba(59,130,246,0.07),transparent_55%)]',
              ].join(' ')
            : 'bg-gradient-to-br from-white/20 via-transparent to-transparent dark:from-white/5',
        )}
      />

      {variant === 'darkblue' && (
        <>
          {/* feiner top highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {/* sanfter inner border glow */}
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/5" />
          {/* corner accents */}
          <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-brand-600/10 blur-2xl" />
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-brand-700/10 blur-2xl" />
        </>
      )}

      {/* Neon-Akzent (optional) */}
      {variant === 'neon' && (
        <>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        </>
      )}

      <div
        className={cn(
          'relative z-10',
          size === 'sm' ? 'p-4' : size === 'lg' ? 'p-8' : 'p-6',
          variant === 'darkblue' ? 'text-card-foreground' : undefined,
        )}
      >
        {children}
      </div>
    </div>
  );
}
