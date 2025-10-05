'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}
interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, ...toastData };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after duration
    if (newToast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration || 5000);
    }
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = React.useCallback(
    (message: string, title?: string) => {
      toast({ title, description: message, variant: 'success' });
    },
    [toast],
  );

  const error = React.useCallback(
    (message: string, title?: string) => {
      toast({ title, description: message, variant: 'destructive' });
    },
    [toast],
  );

  const value = React.useMemo(
    () => ({
      toasts,
      toast,
      dismiss,
      success,
      error,
    }),
    [toasts, toast, dismiss, success, error],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const context = React.useContext(ToastContext);
  if (!context) return null;

  return (
    <div className="fixed top-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {context.toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          className="mb-2"
        />
      ))}
    </div>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export interface ToastItemProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  className?: string;
}

const ToastItem = React.forwardRef<HTMLDivElement, ToastItemProps>(
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
ToastItem.displayName = 'ToastItem';
