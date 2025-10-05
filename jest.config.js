// jest.config.js
const nextJest = require('next/jest');
// Provide the path to your Next.js app to load next.config.js and .env files
const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  // Frühe Polyfills (vor dem Environment), damit Request/Response/Headers/fetch verfügbar sind
  setupFiles: ['<rootDir>/test-utils/setup-request-polyfill.ts'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  moduleNameMapper: {
    '^next/navigation$': '<rootDir>/test-utils/mocks/next-navigation.ts',
    '^next/router$': '<rootDir>/test-utils/mocks/next-router.ts',
    '^next-intl$': '<rootDir>/test-utils/mocks/next-intl.ts',
    '^next-auth/react$': '<rootDir>/test-utils/mocks/next-auth-react.ts',
    '^next-auth/next$': '<rootDir>/test-utils/mocks/next-auth-next.ts',
    '^next/font/(.*)$': '<rootDir>/test-utils/mocks/next-font/$1',
    '^next/link$': '<rootDir>/test-utils/mocks/next-link.tsx',
    '^next/image$': '<rootDir>/test-utils/mocks/next-image.tsx',
    '^next/headers$': '<rootDir>/test-utils/mocks/next-headers.ts',
    '^next/cache$': '<rootDir>/test-utils/mocks/next-cache.ts',
    // Wichtig: nutze die JS-Version, um SWC/TS Parsingfehler zu vermeiden
    '^next/server$': '<rootDir>/test-utils/mocks/next-server.js',

    // Component mocks
    '^@/components/ui/Reveal$': '<rootDir>/test-utils/mocks/Reveal.tsx',
    '^@/components/use-cases/UseCaseLayout$': '<rootDir>/test-utils/mocks/UseCaseLayout.tsx',
    '^@/components/ui/LoadingSpinner$': '<rootDir>/test-utils/mocks/LoadingSpinner.tsx',
    '^@/components/ui/ErrorBoundary$': '<rootDir>/test-utils/mocks/ErrorBoundary.tsx',
    '^@/components/ui/ErrorMessage$': '<rootDir>/test-utils/mocks/ErrorMessage.tsx',

    // Content and data mocks
    '^@/content/landing$': '<rootDir>/test-utils/mocks/content-landing.ts',
    '^@/content/(.*)$': '<rootDir>/app/content/$1',
    '^content/(.*)$': '<rootDir>/app/content/$1',
    '^(?:\..\/){1,3}content\/(.*)$': '<rootDir>/app/content/$1',

    // Path aliases
    '^@/components/(.*)$': '<rootDir>/app/components/$1',
    '^(?:\.\.\/){1,3}components\/(.*)$': '<rootDir>/app/components/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/api/(.*)$': '<rootDir>/app/api/$1',
    // Map deep relative imports to app/api for legacy tests
    '^(?:\.{1,6}\/)+api\/(.*)$': '<rootDir>/app/api/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    // WICHTIG: Spezifische DB-Mocks vor dem generischen Mapping
    '^@/database/db$': '<rootDir>/test-utils/mocks/db.ts',
    '^@/database/schema/ml-models$': '<rootDir>/test-utils/mocks/schema-ml-models.ts',
    '^@/database/schema/alerts$': '<rootDir>/test-utils/mocks/schema-alerts.ts',
    '^@/database/(.*)$': '<rootDir>/database/$1',
    '^@/test-utils/(.*)$': '<rootDir>/test-utils/$1',
    '^tests/(.*)$': '<rootDir>/supabase/apps/studio/tests/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/__tests__/**/*.spec.ts',
  ],
  // Ignoriere Pfade, die mit Vitest laufen oder externe Projekte enthalten
  testPathIgnorePatterns: [
    '<rootDir>/app/__tests__/',
    '<rootDir>/supabase/',
    '<rootDir>/dify/',
    '<rootDir>/e2e/',
  ],
  // Watch plugins for better DX
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
    'jest-watch-select-projects',
    'jest-watch-suspend',
  ],

  // Reset mocks between tests
  resetMocks: true,

  // Clear mocks between tests
  clearMocks: true,

  // Reset modules between tests to avoid state leakage
  resetModules: true,

  // Setup files after the environment is set up
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts',
    '<rootDir>/test-utils/setup-globals.ts',
    '@testing-library/jest-dom',
  ],

  // Test timeout (30 seconds)
  testTimeout: 30000,
};

// Ensure Next.js Jest preset wraps our config
module.exports = createJestConfig(config);
