'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { SubmitButton } from '@/components/ui/SubmitButton';

// Temporäre Alert-Komponente für Contact-Formular
interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
  role?: string;
}

function Alert({ variant = 'info', children, className = '', role = 'alert' }: AlertProps) {
  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div role={role} className={`rounded-lg border p-3 text-sm ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

export default function ContactPage() {
  const t = useTranslations('contact');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<null | boolean>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Email validation
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t('nameRequired');
    } else if (name.trim().length < 2) {
      newErrors.name = t('nameTooShort');
    }

    if (!email.trim()) {
      newErrors.email = t('emailRequired');
    } else if (!validateEmail(email)) {
      newErrors.email = t('invalidEmail');
    }

    if (!message.trim()) {
      newErrors.message = t('messageRequired');
    } else if (message.trim().length < 10) {
      newErrors.message = t('messageTooShort');
    }

    if (company.trim() && company.trim().length < 2) {
      newErrors.company = t('companyTooShort');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, company, message, validateEmail, t]);

  // Real-time validation
  const handleFieldChange = useCallback(
    (field: string, value: string, setter: (value: string) => void) => {
      setter(value);
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    },
    [errors],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setOk(null);
    setErrors({});

    try {
      const REQUEST_TIMEOUT_MS = 10000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const requestId =
        typeof window !== 'undefined' && (window as any).crypto?.randomUUID
          ? (window as any).crypto.randomUUID()
          : Math.random().toString(36).slice(2);

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-request-id': requestId,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          message: message.trim(),
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      setOk(res.ok);

      // Analytics tracking
      if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible(res.ok ? 'contact_success' : 'contact_fail');
      }

      if (res.ok) {
        // Reset form on success
        setName('');
        setEmail('');
        setCompany('');

        // Auto-hide success message after 5 seconds
        setTimeout(() => setOk(null), 5000);
      } else {
        // Handle server errors
        try {
          const errorData = await res.json();
          const message =
            typeof errorData === 'object' && errorData !== null && 'message' in errorData
              ? String((errorData as any).message)
              : t('unexpectedError');
          setErrors({ submit: message });
        } catch (error) {
          setErrors({ submit: t('unexpectedError') });
        }
      }
    } catch (error) {
      setOk(false);
      setErrors({
        submit: t('networkError'),
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">{t('title')}</h1>
        <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
          {t('requiredFieldsNote')}
        </p>
        {ok !== null && (
          <div
            className="mt-4 rounded-lg border p-3 text-sm"
            style={{
              borderColor: ok ? 'var(--border)' : 'var(--destructive)',
              backgroundColor: ok
                ? 'color-mix(in oklab, var(--card) 90%, transparent)'
                : 'color-mix(in oklab, var(--destructive) 12%, transparent)',
              color: ok ? 'var(--muted-foreground)' : 'var(--destructive)',
            }}
            role="status"
            aria-live="polite"
          >
            {ok ? t('thankYouMessage') : t('errorContactDirectly')}
          </div>
        )}
        <form
          onSubmit={submit}
          className="mt-6 space-y-4 rounded-xl border p-6 shadow-sm backdrop-blur bg-clip-padding"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--card)',
          }}
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              {t('name')} *
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => handleFieldChange('name', e.target.value, setName)}
              required
              autoComplete="name"
              aria-required="true"
              className="mt-1 w-full rounded-md border bg-transparent px-3 py-2 transition-colors"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--fg)',
              }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px var(--ring)')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              {t('email')} *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleFieldChange('email', e.target.value, setEmail)}
              required
              autoComplete="email"
              aria-required="true"
              className="mt-1 w-full rounded-md border bg-transparent px-3 py-2 transition-colors"
              style={{ borderColor: 'var(--border)' }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px var(--ring)')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
            />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium">
              {t('company')}
            </label>
            <input
              id="company"
              value={company}
              onChange={(e) => handleFieldChange('company', e.target.value, setCompany)}
              autoComplete="organization"
              className="mt-1 w-full rounded-md border bg-transparent px-3 py-2 transition-colors"
              style={{ borderColor: 'var(--border)' }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px var(--ring)')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium">
              {t('message')} *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => handleFieldChange('message', e.target.value, setMessage)}
              required
              rows={6}
              placeholder={t('messagePlaceholder')}
              className="mt-1 w-full rounded-md border bg-transparent px-3 py-2 transition-colors"
              style={{ borderColor: 'var(--border)' }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px var(--ring)')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
            />
          </div>
          <div id="message-help" className="sr-only">
            {t('describeIssue')}
          </div>
          {errors.submit && (
            <Alert variant="error" role="alert">
              {errors.submit}
            </Alert>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              {ok === true && (
                <Alert variant="success" className="animate-in fade-in-0 slide-in-from-top-1">
                  <div className="flex items-center">
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t('thankYouMessage')}
                  </div>
                </Alert>
              )}

              {ok === false && !errors.submit && (
                <Alert variant="error" className="animate-in fade-in-0 slide-in-from-top-1">
                  <div className="flex items-center">
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t('errorContactDirectly')}
                  </div>
                </Alert>
              )}
            </div>

            <SubmitButton
              loading={loading}
              loadingText={t('sending')}
              className="w-full sm:w-auto"
              aria-describedby={loading ? 'submit-loading' : undefined}
            >
              {t('send')}
            </SubmitButton>

            {loading && (
              <div id="submit-loading" className="sr-only">
                {t('processingForm')}
              </div>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
