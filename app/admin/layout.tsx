import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { COOKIE_NAME, requireAuth } from '@/lib/auth';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

async function logoutAction() {
  'use server';
  await requireAuth();
  (await cookies()).delete(COOKIE_NAME);
  redirect('/admin/login');
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#e5e5e5', fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 14 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '0 28px', background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', height: 50 }}>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#888' }}>root@arranvanaerschot/admin</span>
        <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
          {[
            ['dashboard', '/admin'],
            ['identity',  '/admin/identity'],
            ['projects',  '/admin/projects'],
            ['experience','/admin/experience'],
            ['skills',    '/admin/skills'],
            ['now',       '/admin/now'],
          ].map(([label, href]) => (
            <Link key={href} href={href} style={{ padding: '0 12px', height: 50, display: 'flex', alignItems: 'center', color: '#888', textDecoration: 'none', fontSize: 13 }}>
              {label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction}>
          <button type="submit" style={{ background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 5, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
            sign out
          </button>
        </form>
      </header>
      <main>{children}</main>
    </div>
  );
}
