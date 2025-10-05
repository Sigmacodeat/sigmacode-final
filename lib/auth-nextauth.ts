/**
 * NextAuth v5 Integration
 * Export configured auth functions for use in API routes and server components
 */

import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth-config';

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
