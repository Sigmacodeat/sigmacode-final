/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

const baseConfig = {
  plugins: [
    react(),
    // Nutze die Pfadaliase aus tsconfig.json
    tsconfigPaths(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test-utils/setup.ts',
    // Aktiviere Test-Isolation
    isolate: true,
    // Definiere explizit die Testdateien
    include: ['app/__tests__/**/*.test.{ts,tsx}'],
    // Testumgebungsvariablen
    env: {
      NODE_ENV: 'test',
    },
    // Deaktiviere Threads für bessere Fehlermeldungen
    // threads: false, // Wurde in neueren Versionen entfernt
    // Mock für Node-Module
    deps: {
      inline: ['@testing-library/user-event'],
    },
    // Coverage-Report
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['app/**/*.{ts,tsx}'],
      exclude: ['**/node_modules/**', '**/__tests__/**', '**/*.d.ts'],
    },
  },
};

export default defineConfig(baseConfig);
