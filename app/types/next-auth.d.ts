import type { DefaultSession } from 'next-auth';

// Zentralisierte Modul-Augmentationen für NextAuth (web)
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      id: string;
      roles: Array<'user' | 'editor' | 'admin' | 'service'>;
      plan?: {
        id: string;
        name: string;
        status: string;
      } | null;
      entitlements?: string[];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    roles?: Array<'user' | 'editor' | 'admin' | 'service'>;
    plan?: {
      id: string;
      name: string;
      status: string;
    } | null;
    entitlements?: string[];
  }
}
