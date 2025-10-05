'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'neon' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  pulse?: boolean;
  elevated?: boolean; // dezente 3D-Anmutung
  shine?: boolean; // animierter Glanz
}

export function NeonButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  glow = false,
  pulse = false,
  elevated,
  shine,
  ...props
}: NeonButtonProps) {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variants = {
    primary: 'text-[var(--brand-foreground)] border-2 transition-all duration-300',
    secondary: 'text-zinc-900 dark:text-zinc-100 border-2 transition-all duration-300',
    ghost: 'text-zinc-700 dark:text-zinc-300 border-transparent transition-all duration-300',
    neon: 'text-[var(--brand-foreground)] border-2 transition-all duration-300',
    accent: 'text-white border-2 transition-all duration-300',
  } as const;

  const glowClasses = glow ? 'shadow-lg transition-all duration-300' : '';

  const pulseClasses = pulse ? 'animate-pulse' : '';

  // Premium Defaults für accent/neon
  const premium = {
    elevated: elevated ?? (variant === 'accent' || variant === 'neon'),
    shine: shine ?? (variant === 'accent' || variant === 'neon'),
  };

  // Farbpalette per Variant bestimmen (über CSS-Variablen nutzbar in Overlays)
  const palette =
    variant === 'accent'
      ? {
          start: '#00F6FF', // Neon Cyan
          end: '#06B6D4', // Cyan 500
          fg: '#FFFFFF',
          solid: '#0891B2', // Cyan 600
          border: '#0E7490', // Cyan 700
          ring: '#06B6D4',
        }
      : {
          start: 'var(--brand-600)',
          end: 'var(--brand-800)',
          fg: 'var(--brand-foreground)',
          solid: 'var(--brand-700)',
          border: 'var(--brand-800)',
          ring: 'var(--ring)',
        };

  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 will-change-transform',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'group overflow-hidden',
        // dezente 3D-Interaktion
        premium.elevated ? 'hover:-translate-y-0.5 active:translate-y-0' : '',
        sizes[size],
        variants[variant],
        glowClasses,
        pulseClasses,
        className,
      )}
      style={
        {
          backgroundColor:
            variant === 'primary'
              ? 'var(--brand-600)'
              : variant === 'secondary'
                ? 'var(--card)'
                : variant === 'neon'
                  ? 'var(--brand-700)'
                  : variant === 'accent'
                    ? palette.solid
                    : 'transparent',
          borderColor:
            variant === 'primary'
              ? 'var(--brand-700)'
              : variant === 'secondary'
                ? 'var(--border)'
                : variant === 'neon'
                  ? 'var(--brand-800)'
                  : variant === 'accent'
                    ? palette.border
                    : 'transparent',
          boxShadow:
            glow || premium.elevated
              ? variant === 'accent'
                ? '0 10px 24px -6px rgba(6,182,212,0.35), 0 6px 12px -6px rgba(8,145,178,0.35)'
                : '0 10px 20px -3px rgba(37,99,235,0.25), 0 6px 10px -2px rgba(30,64,175,0.25)'
              : undefined,
          '--tw-ring-color': palette.ring as any,
          // Overlay-Variablen
          ['--btn-start' as any]: palette.start,
          ['--btn-end' as any]: palette.end,
          ['--btn-fg' as any]: palette.fg,
        } as React.CSSProperties
      }
      {...props}
    >
      {/* Flüssiger Hintergrund-Effekt */}
      <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--btn-start)]/20 to-[color:var(--btn-end)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Neon-Glanz-Effekt */}
      {premium.shine && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[color:var(--btn-fg)]/12 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
      )}

      {/* Ripple-Effekt beim Klick */}
      <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-active:opacity-100 transition-opacity duration-150" />

      {/* Innere Kontur & Top-Highlight (edel) */}
      {premium.elevated && (
        <>
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10 dark:ring-white/5" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-60" />
        </>
      )}

      {/* Button-Inhalt */}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
