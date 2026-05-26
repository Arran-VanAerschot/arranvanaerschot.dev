import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from './db';
import { COOKIE_NAME } from './cookie';

export { COOKIE_NAME };

const secret = () => {
  const val = process.env.AUTH_SECRET;
  if (!val) throw new Error('AUTH_SECRET environment variable is not set');
  return new TextEncoder().encode(val);
};
const ALG = 'HS256';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: MAX_AGE,
};

export async function createSession(email: string, stamp: string): Promise<string> {
  return new SignJWT({ email, stamp })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(
  token: string,
): Promise<{ email: string; stamp: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: [ALG] });
    return { email: payload.email as string, stamp: payload.stamp as string };
  } catch {
    return null;
  }
}

// requireAuth must be called at the top of every admin Server Action and page.
// Middleware is a first-layer gate only; this is the authoritative check.
export async function requireAuth(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) redirect('/admin/login');
  const payload = await verifySession(token);
  if (!payload) redirect('/admin/login');
  const { adminUsers } = await import('./db/schema');
  const user = await db.query.adminUsers.findFirst({
    where: (t, { eq }) => eq(t.email, payload.email),
  });
  if (!user || user.securityStamp !== payload.stamp) redirect('/admin/login');
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Computed once per process lifetime — used for timing equalization in loginAction.
let _dummyHashPromise: Promise<string> | null = null;
export function getDummyHash(): Promise<string> {
  if (!_dummyHashPromise) _dummyHashPromise = bcrypt.hash('__timing_equalization__', 12);
  return _dummyHashPromise;
}
