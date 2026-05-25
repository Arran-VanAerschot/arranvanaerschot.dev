import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import {
  verifyPassword, createSession, getDummyHash,
  COOKIE_NAME, COOKIE_OPTS,
} from '@/lib/auth';

const MAX_ATTEMPTS = 10;
const LOCKOUT_MINUTES = 15;

async function loginAction(formData: FormData) {
  'use server';
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const user = await db.query.adminUsers.findFirst({
    where: (t, { eq }) => eq(t.email, email),
  });

  // Lockout check before doing any expensive work
  if (user?.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    redirect('/admin/login?err=2');
  }

  // Always run bcrypt — equalizes timing whether user exists or not
  const hashToCheck = user?.passwordHash ?? await getDummyHash();
  const passwordOk = await verifyPassword(password, hashToCheck);

  if (!user || !passwordOk) {
    if (user) {
      const attempts = (user.failedAttempts ?? 0) + 1;
      const lockedUntil = attempts >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
        : null;
      await db.update(adminUsers)
        .set({ failedAttempts: attempts, ...(lockedUntil ? { lockedUntil } : {}) })
        .where(eq(adminUsers.email, email));
    }
    redirect('/admin/login?err=1');
  }

  // Rotate security stamp — invalidates any existing sessions
  const stamp = crypto.randomUUID();
  await db.update(adminUsers)
    .set({ failedAttempts: 0, lockedUntil: null, securityStamp: stamp })
    .where(eq(adminUsers.email, email));

  const token = await createSession(email, stamp);
  (await cookies()).set(COOKIE_NAME, token, COOKIE_OPTS);
  redirect('/admin');
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  const { err } = await searchParams;
  return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ width: 340, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: 32 }}>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 24, fontFamily: 'ui-monospace, monospace' }}>arran@ava · /admin</div>
        {err === '1' && (
          <div style={{ marginBottom: 16, padding: '8px 12px', background: '#2a1a1a', border: '1px solid #5a2a2a', borderRadius: 6, color: '#f87171', fontSize: 13 }}>
            invalid credentials
          </div>
        )}
        {err === '2' && (
          <div style={{ marginBottom: 16, padding: '8px 12px', background: '#2a1a1a', border: '1px solid #5a2a2a', borderRadius: 6, color: '#f87171', fontSize: 13 }}>
            account locked — try again in {LOCKOUT_MINUTES} minutes
          </div>
        )}
        <form action={loginAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', color: '#888', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>email</label>
            <input name="email" type="email" required autoFocus
              style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: 6, padding: '9px 12px', color: '#e5e5e5', fontFamily: 'inherit', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#888', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>password</label>
            <input name="password" type="password" required
              style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: 6, padding: '9px 12px', color: '#e5e5e5', fontFamily: 'inherit', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <button type="submit" style={{ background: '#e8a13a', color: '#111', border: 'none', borderRadius: 6, padding: '10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
            sign in
          </button>
        </form>
      </div>
    </div>
  );
}
