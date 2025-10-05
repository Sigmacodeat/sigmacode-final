import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth-config';

const authInstance = NextAuth(authConfig);

export const {
  handlers: { GET, POST },
} = authInstance;
