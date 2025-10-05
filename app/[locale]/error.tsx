'use client';
import Link from 'next/link';
import { Home, RefreshCw, AlertTriangle, Mail } from 'lucide-react';
import React from 'react';
import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import * as Sentry from '@sentry/nextjs';

interface ErrorPageProps {
  error?: Error;
  reset?: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const locale = useLocale();
  const prefix = `/${locale}`;

  // Report error to Sentry on mount/update
  useEffect(() => {
    if (error) {
      Sentry.captureException(error);
      if (isDevelopment) {
        // Zusätzlich lokal loggen
        // eslint-disable-next-line no-console
        console.error('[ErrorPage]', error);
      }
    }
  }, [error, isDevelopment]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
      <div className="max-w-lg w-full mx-4">
        <div className="text-center">
          {/* Error Illustration */}
          <div className="mb-8">
            <div className="relative">
              <div className="text-8xl font-bold text-red-300 dark:text-red-700 select-none">
                500
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <AlertTriangle className="w-16 h-16 text-red-500" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-4">Serverfehler</h1>

          <p className="text-red-700 dark:text-red-300 mb-8 leading-relaxed">
            Es ist ein unerwarteter Fehler aufgetreten. Unsere Entwickler wurden automatisch
            benachrichtigt und arbeiten an der Lösung.
          </p>

          {/* Error Details (Development only) */}
          {isDevelopment && error && (
            <div className="mb-8 p-4 bg-red-100 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-800">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                Fehlerdetails (Entwicklung):
              </h3>
              <pre className="text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap break-all">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href={`${prefix}/`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Home className="w-4 h-4" />
              Zur Startseite
            </Link>

            {reset && (
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-6 py-3 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-200 w-full justify-center"
              >
                <RefreshCw className="w-4 h-4" />
                Erneut versuchen
              </button>
            )}

            <Link
              href={`${prefix}/contact`}
              className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 w-full justify-center"
            >
              <Mail className="w-4 h-4" />
              Support kontaktieren
            </Link>
          </div>

          {/* Troubleshooting Tips */}
          <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
              Was Sie versuchen können:
            </h3>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <li>• Aktualisieren Sie die Seite</li>
              <li>• Leeren Sie Ihren Browser-Cache</li>
              <li>• Versuchen Sie es in einem anderen Browser</li>
              <li>• Überprüfen Sie Ihre Internetverbindung</li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="mt-6 pt-6 border-t border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">
              Problem weiterhin vorhanden?{' '}
              <Link
                href={`${prefix}/contact`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Kontaktieren Sie unser Support-Team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
