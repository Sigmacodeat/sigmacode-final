'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

export function SessionProviders({ children }: { children: ReactNode }) {
  // Stabilere Defaults: kein aggressives Refetching im Dev, verhindert flackernde Statuswechsel
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      {children}
    </SessionProvider>
  );
}
