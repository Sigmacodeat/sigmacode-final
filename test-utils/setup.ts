// Vitest Setup
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Erweitere expect mit den Testing Library Matchern (Vereinfachte Registrierung)
expect.extend(matchers as any);

// Jest-Kompatibilitätslayer für Vitest-Umgebung
// Stellt eine globale `jest` API bereit, damit bestehende Tests mit Vitest laufen
// Abdeckung der häufig genutzten Funktionen: fn, spyOn, mock, doMock, clearAllMocks, resetAllMocks, restoreAllMocks, useFakeTimers, useRealTimers, advanceTimersByTime
const jestCompat = {
  fn: vi.fn.bind(vi),
  spyOn: vi.spyOn.bind(vi),
  mock: vi.mock.bind(vi),
  doMock: vi.doMock.bind(vi),
  unmock: vi.unmock.bind(vi),
  clearAllMocks: vi.clearAllMocks.bind(vi),
  resetAllMocks: vi.resetAllMocks.bind(vi),
  restoreAllMocks: vi.restoreAllMocks.bind(vi),
  useFakeTimers: vi.useFakeTimers.bind(vi),
  useRealTimers: vi.useRealTimers.bind(vi),
  advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
  setSystemTime: vi.setSystemTime.bind(vi),
};

// global verfügbar machen
(globalThis as any).jest = (globalThis as any).jest ?? jestCompat;

// Säubere nach jedem Test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
