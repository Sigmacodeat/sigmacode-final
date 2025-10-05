// Mock für next/router
import React from 'react';
import { jest } from '@jest/globals';
import { useRouter as useNextRouter, NextRouter } from 'next/router';
import { useRouter as useAppRouter } from 'next/navigation';

type AppRouter = ReturnType<typeof useAppRouter>;
// Router-Mock-Implementierung (als NextRouter gecastet)
const mockRouter = {
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  reload: jest.fn(() => {
    if (typeof window !== 'undefined') window.location.reload();
  }),
  back: jest.fn(() => {
    if (typeof window !== 'undefined') window.history.back();
  }),
  forward: jest.fn(() => {
    if (typeof window !== 'undefined') window.history.forward();
  }),
  prefetch: jest.fn(() => Promise.resolve()),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isPreview: false,
  isReady: true,
  isLocaleDomain: false,
  locale: 'en',
  locales: ['en'],
  defaultLocale: 'en',
  domainLocales: [],
} as NextRouter;
// App-Router-Mock-Implementierung
const createAppRouterMock = (overrides: Partial<AppRouter> = {}): AppRouter => ({
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  refresh: jest.fn(() => {}),
  back: jest.fn(() => {}),
  forward: jest.fn(() => {}),
  prefetch: jest.fn(() => Promise.resolve()),
  ...overrides,
});
// Globale Router-Instanz
let appRouterInstance: AppRouter | null = null;
// useRouter Hook-Implementierung
export const useRouter = (): NextRouter => {
  try {
    // Versuche den App-Router zu verwenden
    const appRouter = appRouterInstance || createAppRouterMock();

    if (!appRouterInstance) {
      appRouterInstance = appRouter;
    }

    // Gib ein kompatibles Router-Objekt zurück
    return Object.assign({}, mockRouter, {
      push: (url: string) => {
        (appRouter.push as any)(url);
        return Promise.resolve(true);
      },
      replace: (url: string) => {
        (appRouter.replace as any)(url);
        return Promise.resolve(true);
      },
      back: () => {
        (appRouter.back as any)();
      },
      prefetch: (url: string) => {
        (appRouter.prefetch as any)(url);
        return Promise.resolve();
      },
    }) as NextRouter;
  } catch (e) {
    // Fallback zum Pages-Router
    try {
      const router = useNextRouter();
      return {
        ...mockRouter,
        ...(router || {}),
      };
    } catch (e) {
      // Wenn beides fehlschlägt, gib den Mock-Router zurück
      return mockRouter;
    }
  }
};

// withRouter HOC-Implementierung
export const withRouter = <P extends { router: NextRouter }>(
  Component: React.ComponentType<P>,
): React.FC<Omit<P, 'router'>> => {
  const Wrapper: React.FC<Omit<P, 'router'>> = (props) => {
    const router = useRouter();
    // @ts-ignore - TypeScript hat Probleme mit dem Spread hier
    return React.createElement(Component, { ...props, router } as P);
  };
  Wrapper.displayName = `withRouter(${Component.displayName || Component.name || 'Component'})`;
  return Wrapper;
};

// Test-Hilfsfunktionen
export const mockAppRouter = (overrides: Partial<AppRouter> = {}): AppRouter => {
  appRouterInstance = createAppRouterMock(overrides);
  return appRouterInstance;
};

export const resetRouterMocks = (): void => {
  appRouterInstance = null;
  // Mocks zurücksetzen
  (mockRouter.push as any).mockClear?.();
  (mockRouter.replace as any).mockClear?.();
  (mockRouter.reload as any).mockClear?.();
  (mockRouter.back as any).mockClear?.();
  (mockRouter.forward as any).mockClear?.();
  (mockRouter.prefetch as any).mockClear?.();
  (mockRouter.beforePopState as any).mockClear?.();
  (mockRouter.events.on as any).mockClear?.();
  (mockRouter.events.off as any).mockClear?.();
  (mockRouter.events.emit as any).mockClear?.();
};

// Standard-Export
export default {
  useRouter,
  withRouter,
  mockAppRouter,
  resetRouterMocks,
  ...mockRouter,
};
