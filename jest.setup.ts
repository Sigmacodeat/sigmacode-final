// jest.setup.ts
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock Next.js auth
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

// Import and extend Jest with custom matchers
import { CustomMatchers } from './test-utils/jest-matchers';
// Note: do not import from '@jest/globals' to avoid ESM interop issues

// Extend Jest with custom matchers (guarded)
const maybeExpect = (globalThis as any).expect;
if (maybeExpect && typeof maybeExpect.extend === 'function') {
  maybeExpect.extend(CustomMatchers as any);
}

// Ensure test mode environment flag is set for route test branches
// Prefer direct set to avoid reassigning the readonly env object type
process.env.TEST_MODE = 'true';

// Also set a global variable for better TypeScript support
// Use globalThis for environment-agnostic global reference
(globalThis as any).__TEST_MODE__ = true;
// WICHTIG: Kein globales __ALERT_SERVICE__ vordefinieren und getInstance() nicht überschreiben.
// Einzelne Tests binden ihr lokales Mock selbst (z.B. über global.__ALERT_SERVICE__ oder Mock von getInstance()).

// --- Polyfills für Next.js/Node-Tests ---
// Request/Response/Headers/fetch via undici
try {
  const { Request, Response, Headers, fetch } = require('undici');
  if (typeof (globalThis as any).Request === 'undefined') {
    (globalThis as any).Request = Request;
  }
  if (typeof (globalThis as any).Response === 'undefined') {
    (globalThis as any).Response = Response;
  }
  if (typeof (globalThis as any).Headers === 'undefined') {
    (globalThis as any).Headers = Headers;
  }
  if (typeof (globalThis as any).fetch === 'undefined') {
    (globalThis as any).fetch = fetch;
  }
} catch {}

// TextEncoder/TextDecoder für Bibliotheken wie pg/webcrypto
try {
  if (
    typeof (globalThis as any).TextEncoder === 'undefined' ||
    typeof (globalThis as any).TextDecoder === 'undefined'
  ) {
    const { TextEncoder, TextDecoder } = require('util');
    if (typeof (globalThis as any).TextEncoder === 'undefined') {
      (globalThis as any).TextEncoder = TextEncoder;
    }
    if (typeof (globalThis as any).TextDecoder === 'undefined') {
      (globalThis as any).TextDecoder = TextDecoder;
    }
  }
} catch {}

// Polyfill Fetch API für Node-Umgebung (erzwinge konsistente Implementierung)
try {
  const g: any = globalThis as any;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { fetch, Request, Response, Headers } = require('undici');
  g.fetch = fetch;
  g.Request = Request;
  g.Response = Response;
  g.Headers = Headers;
} catch {}

// WebCrypto-Polyfill (crypto.randomUUID, subtle, etc.)
try {
  const g: any = globalThis as any;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeCrypto = require('crypto');
  // Bevorzugt die WebCrypto-API für SubtleCrypto/getRandomValues
  g.crypto = nodeCrypto.webcrypto || g.crypto || {};
  // Stelle sicher, dass randomUUID existiert
  if (typeof g.crypto.randomUUID !== 'function') {
    if (typeof nodeCrypto.randomUUID === 'function') {
      g.crypto.randomUUID = nodeCrypto.randomUUID.bind(nodeCrypto);
    } else {
      // Fallback: generiere eine RFC4122 v4 UUID
      g.crypto.randomUUID = () =>
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
    }
  }
} catch {}

// Global test utilities
(globalThis as any).testUtils = {
  // Create mock API response
  createMockResponse: (data: any, success = true) => ({
    success,
    data,
    timestamp: new Date().toISOString(),
    version: 'v1',
  }),

  // Wait for async operations
  waitFor: (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Mock fetch
  mockFetch: (data: any, options: { status?: number; delay?: number } = {}) => {
    const { status = 200, delay = 0 } = options;
    return jest.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: status >= 200 && status < 300,
              status,
              json: () => Promise.resolve(data),
              text: () => Promise.resolve(JSON.stringify(data)),
              headers: {
                get: (key: string) => {
                  if (key === 'content-type') return 'application/json';
                  return null;
                },
              },
            });
          }, delay);
        }),
    );
  },
};

// Global helper for tests to create alerts without importing route directly
(globalThis as any).createAlert = async (request: any) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const alertsRoute = require('./app/api/alerts/route');
  return alertsRoute.POST(request);
};
