'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'error' | 'warning' | 'success' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

export function ErrorMessage({
  title,
  message,
  variant = 'error',
  size = 'md',
  className,
  dismissible = false,
  onDismiss,
  icon,
}: ErrorMessageProps) {
  const variants = {
    error: {
      icon: icon || <AlertCircle className="h-5 w-5" />,
      styles:
        'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    warning: {
      icon: icon || <AlertTriangle className="h-5 w-5" />,
      styles:
        'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    success: {
      icon: icon || <CheckCircle className="h-5 w-5" />,
      styles:
        'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    info: {
      icon: icon || <Info className="h-5 w-5" />,
      styles:
        'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  };

  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4',
    lg: 'p-6 text-lg',
  };

  const currentVariant = variants[variant];

  return (
    <div
      className={cn(
        'rounded-lg border-l-4 flex gap-3',
        currentVariant.styles,
        sizeClasses[size],
        className,
      )}
    >
      <div className={cn('flex-shrink-0 mt-0.5', currentVariant.iconColor)}>
        {currentVariant.icon}
      </div>
      <div className="flex-1 min-w-0">
        {title && <h3 className="font-medium mb-1">{title}</h3>}
        <p className="text-sm">{message}</p>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors',
            currentVariant.iconColor,
          )}
          aria-label="Schließen"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Inline Error Message für Formulare
export function InlineError({ message, className }: { message: string; className?: string }) {
  return (
    <p
      className={cn(
        'text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1',
        className,
      )}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      {message}
    </p>
  );
}

// Toast-Style Notification
export function Notification({
  message,
  variant = 'info',
  className,
  onClose,
}: {
  message: string;
  variant?: 'error' | 'warning' | 'success' | 'info';
  className?: string;
  onClose?: () => void;
}) {
  const variants = {
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    success: 'bg-green-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div
      className={cn(
        'rounded-lg p-4 shadow-lg flex items-start gap-3 animate-in slide-in-from-right-2',
        variants[variant],
        className,
      )}
    >
      <div className="flex-1">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
