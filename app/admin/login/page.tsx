import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import { verifyPassword, createSession, COOKIE_NAME, COOKIE_OPTS } from '@/lib/auth';

async function loginAction(formData: FormData) {
  'use server';
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const user = await db.query.adminUsers.findFirst({ where: (t, { eq }) => eq(t.email, email) });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect('/admin/login?err=1');
  }
  const token = await createSession(email);
  (await cookies()).set(COOKIE_NAME, token, COOKIE_OPTS);
  redirect('/admin');
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ width: 340, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: 32 }}>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 24, fontFamily: 'ui-monospace, monospace' }}>arran@ava · /admin</div>
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
