// Mock für next-auth/next
import { vi } from 'vitest';
import { Session, DefaultSession, User } from 'next-auth';

// Erweitere den Standard-User-Typ um zusätzliche Felder
type ExtendedUser = User & {
  id: string;
  roles: ('user' | 'editor' | 'admin' | 'service')[];
  plan?: {
    id: string;
    name: string;
    status: string;
  } | null;
  entitlements?: string[];
  [key: string]: any; // Für zusätzliche Eigenschaften
};

// Erweitere die Session-Schnittstelle
export interface MockSession extends Session {
  user: ExtendedUser;
  expires: string;
  error?: string;
}

// Standard-Benutzer für Tests
const defaultUser: ExtendedUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  image: 'https://example.com/avatar.jpg',
  roles: ['user'],
  plan: null,
  entitlements: [],
};

// Initialer Mock-Session-Zustand
let mockSession: MockSession | null = {
  user: { ...defaultUser },
  expires: new Date(Date.now() + 2 * 86400 * 1000).toISOString(), // 2 Tage in der Zukunft
};

let mockToken = 'mock-access-token';

// Mock für getServerSession
export const getServerSession = vi.fn(async (): Promise<MockSession | null> => {
  return mockSession;
});

// Mock für getToken
export const getToken = vi.fn(async (): Promise<string | null> => {
  return mockToken;
});

// Test-Hilfsfunktionen
export const mockGetServerSession = (
  session: Partial<MockSession> | null = null,
): MockSession | null => {
  if (session === null) {
    mockSession = null;
  } else {
    mockSession = {
      ...mockSession!,
      ...session,
      user: {
        ...defaultUser,
        ...(mockSession?.user || {}),
        ...(session.user || {}),
      },
      expires:
        session.expires ||
        mockSession?.expires ||
        new Date(Date.now() + 2 * 86400 * 1000).toISOString(),
    } as MockSession;
  }
  return mockSession;
};

export const mockGetToken = (token: string = 'mock-access-token'): string => {
  mockToken = token;
  return mockToken;
};

export const resetAuthMocks = (): void => {
  mockSession = {
    user: { ...defaultUser },
    expires: new Date(Date.now() + 2 * 86400 * 1000).toISOString(),
  };
  mockToken = 'mock-access-token';
  (getServerSession as any).mockClear?.();
  (getToken as any).mockClear?.();
};

export default {
  getServerSession,
  getToken,
  // Test-Hilfsfunktionen
  mockGetServerSession,
  mockGetToken,
  resetAuthMocks,
  defaultUser,
};
