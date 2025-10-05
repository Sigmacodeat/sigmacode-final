import { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getDrizzleForAdapter } from '@/database/db';
import * as schema from '@/database/schema';
import { eq } from 'drizzle-orm';
import { users } from '@/database/schema/users';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Dummy-Hash für konstante Zeit bei unbekannten E-Mails (verhindert Timing-/Enum-Angriffe)
const DUMMY_HASH = bcrypt.hashSync('invalid_password_value', 10);

const adapterDb = getDrizzleForAdapter();

export const authConfig = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/de/login',
    signOut: '/de/login',
    error: '/de/login',
    newUser: '/de/dashboard',
  },
  adapter: DrizzleAdapter(adapterDb, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }) as any,
  providers: [
    Credentials({
      id: 'credentials',
      name: 'E-Mail & Passwort',
      credentials: {
        email: { label: 'E-Mail', type: 'email' },
        password: { label: 'Passwort', type: 'password' },
      },
      async authorize(credentials) {
        const schemaZ = z.object({
          email: z.string().email().max(255),
          password: z.string().min(8).max(1024),
        });
        const parsed = schemaZ.safeParse(credentials ?? {});
        if (!parsed.success) {
          return null;
        }
        const email = parsed.data.email.toLowerCase();
        const password = parsed.data.password;

        const [user] = await adapterDb.select().from(users).where(eq(users.email, email));

        const hash = user?.passwordHash || DUMMY_HASH;
        const ok = await bcrypt.compare(password, hash);
        if (!user || !user.passwordHash || !ok) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          roles: [user.role as any],
        } as any;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id ?? token.sub;
        token.roles = (user as any).roles ?? token.roles ?? ['user'];
      }
      if (!token.roles && token.email && typeof token.email === 'string') {
        const [u] = await adapterDb
          .select({ role: users.role })
          .from(users)
          .where(eq(users.email, token.email.toLowerCase()));
        token.roles = u ? [u.role as any] : ['user'];
      }
      return token as any;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id || token.sub;
        (session.user as any).roles = (token as any).roles || ['user'];
      }
      return session;
    },
  },
  cookies: {},
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
