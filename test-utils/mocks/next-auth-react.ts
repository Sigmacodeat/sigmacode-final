// Mock für next-auth/react (Vitest)
import { vi } from 'vitest';
import type { Session } from 'next-auth';

// Standard Mock-Session (respektiert die Augmentation in app/types/next-auth.d.ts)
export const mockSession: Session = {
  user: {
    id: 'test-user-id',
    roles: ['user'],
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.jpg',
  } as Session['user'],
  expires: new Date(Date.now() + 2 * 86400 * 1000).toISOString(),
};

// Mock-Implementierungen
export const signIn = vi.fn(async () => ({}) as Record<string, unknown>);
export const signOut = vi.fn(async () => ({}) as Record<string, unknown>);
export const getSession = vi.fn<() => Promise<Session | null>>(async () => null);
export const getCsrfToken = vi.fn<() => Promise<string>>(async () => 'mock-csrf-token');
export const getProviders = vi.fn<() => Promise<Record<string, unknown>>>(async () => ({}));

type UseSessionStatus = 'authenticated' | 'unauthenticated' | 'loading';
type UseSessionReturn = {
  data: Session | null;
  status: UseSessionStatus;
  update: () => Promise<Session | null>;
};
export const useSession = vi.fn<() => UseSessionReturn>(() => ({
  data: null,
  status: 'unauthenticated',
  update: vi.fn<() => Promise<Session | null>>(async () => null),
}));

// Test-Hilfsfunktionen
export const mockUseSession = (session: Session = mockSession) => {
  useSession.mockImplementation(() => ({
    data: session,
    status: 'authenticated',
    update: vi.fn<() => Promise<Session | null>>(async () => session),
  }));
  return session;
};

export const mockSignIn = (response: Record<string, unknown> = {}) => {
  signIn.mockImplementation(async () => response);
};

export const mockSignOut = (response: Record<string, unknown> = {}) => {
  signOut.mockImplementation(async () => response);
};

export const mockGetSession = (session: Session | null = mockSession) => {
  getSession.mockResolvedValue(session);
};

export const mockGetCsrfToken = (token = 'mock-csrf-token') => {
  getCsrfToken.mockImplementation(async () => token);
};

export const mockGetProviders = (providers: Record<string, unknown> = {}) => {
  getProviders.mockImplementation(async () => providers);
};

// Reset-Funktion für Test-Setup
export const resetAllMocks = () => {
  vi.clearAllMocks();
};

// Default-Export für next-auth/react
export default {
  signIn,
  signOut,
  getSession,
  getCsrfToken,
  getProviders,
  useSession,
  // Test-Helper
  mockUseSession,
  mockSignIn,
  mockSignOut,
  mockGetSession,
  mockGetCsrfToken,
  mockGetProviders,
  resetAllMocks,
};
