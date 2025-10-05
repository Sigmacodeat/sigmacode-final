import { jwtVerify } from 'jose';

export type JwtUser = {
  sub?: string;
  email?: string;
  role?: 'admin' | 'user' | string;
  [key: string]: any;
};

function getJwtSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT secret not configured (NEXTAUTH_SECRET or JWT_SECRET)');
  return new TextEncoder().encode(secret);
}

export async function verifyJwt(authorizationHeader?: string): Promise<JwtUser | null> {
  try {
    if (!authorizationHeader) return null;
    const [scheme, token] = authorizationHeader.split(' ');
    if ((scheme || '').toLowerCase() !== 'bearer' || !token) return null;
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as JwtUser;
  } catch {
    return null;
  }
}

export function requireRole(user: JwtUser | null, roles: Array<string>): boolean {
  if (!user) return false;
  if (!roles || roles.length === 0) return true;
  return roles.includes((user.role || 'user').toString());
}
