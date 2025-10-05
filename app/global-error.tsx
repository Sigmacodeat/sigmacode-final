'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report the error to Sentry once on mount
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h2>Es ist ein Fehler aufgetreten.</h2>
          {error?.digest && <p style={{ color: '#888' }}>Fehler-ID: {error.digest}</p>}
          <button
            onClick={() => reset()}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: 8,
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
