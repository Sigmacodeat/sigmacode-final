'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'default' | 'neon' | 'pulse';
  color?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
  variant = 'default',
  color,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const baseClasses = cn(
    'animate-spin rounded-full border-2 border-current border-t-transparent',
    sizeClasses[size],
    className,
  );

  if (variant === 'neon') {
    return (
      <div className="relative">
        <div className={cn(baseClasses, 'opacity-20', color || 'text-violet-500')} />
        <div
          className={cn(
            'absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet-500',
            sizeClasses[size],
          )}
          style={{
            background: `conic-gradient(from 0deg, transparent, ${color || '#8b5cf6'}, transparent)`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
          }}
        />
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className="relative">
        <div className={cn(baseClasses, color || 'text-violet-500', 'animate-pulse')} />
        <div
          className={cn(
            'absolute inset-0 rounded-full animate-ping',
            sizeClasses[size],
            color || 'bg-violet-500',
          )}
          style={{ opacity: 0.3 }}
        />
      </div>
    );
  }

  return <div className={cn(baseClasses, color || 'text-violet-500')} />;
}

// Skeleton Loader für Content-Bereiche
export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-zinc-200 dark:bg-zinc-700 rounded h-4 mb-2" />
      <div className="bg-zinc-200 dark:bg-zinc-700 rounded h-4 w-3/4" />
    </div>
  );
}

// Dots Loader für Button-States
export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  );
}
