import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ className, type, label, error, required, id, ...props }, ref) => {
    const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="space-y-1">
        <label htmlFor={fieldId} className="block text-sm font-medium text-zinc-800">
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-label="erforderlich">
              *
            </span>
          )}
        </label>
        <input
          id={fieldId}
          type={type}
          ref={ref}
          className={cn(
            'mt-1 w-full rounded-md border border-border p-2 text-sm transition-colors',
            'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className,
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${fieldId}-error`} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = 'FormField';

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ className, label, error, required, id, ...props }, ref) => {
    const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="space-y-1">
        <label htmlFor={fieldId} className="block text-sm font-medium text-zinc-800">
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-label="erforderlich">
              *
            </span>
          )}
        </label>
        <textarea
          id={fieldId}
          ref={ref}
          className={cn(
            'mt-1 w-full rounded-md border border-border p-2 text-sm transition-colors',
            'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'min-h-[90px] resize-y',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className,
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${fieldId}-error`} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

TextareaField.displayName = 'TextareaField';
