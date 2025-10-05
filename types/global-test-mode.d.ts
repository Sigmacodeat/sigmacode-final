// types/global-test-mode.d.ts
/* eslint-disable no-var */

export {};

declare global {
  // Flag, das in Tests gesetzt wird, um spezielles Verhalten zu steuern
  // Zugriff über (globalThis as any).__TEST_MODE__
  var __TEST_MODE__: boolean | undefined;

  // Optional: Hilfsobjekt für Tests
  var testUtils: {
    createMockResponse: (
      data: any,
      success?: boolean,
    ) => {
      success: boolean;
      data: any;
      timestamp: string;
      version: string;
    };
    waitFor: (ms?: number) => Promise<unknown>;
    mockFetch: (data: any, options?: { status?: number; delay?: number }) => any;
  };
}
