import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import { A } from '../_styles';

async function deleteProject(formData: FormData) {
  'use server';
  const slug = String(formData.get('slug'));
  await db.delete(projects).where(eq(projects.slug, slug));
  revalidatePath('/');
  revalidatePath('/admin/projects');
}

export default async function ProjectsListPage() {
  const items = await db.select().from(projects).orderBy(asc(projects.sortOrder));
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ ...A.h1, margin: 0 }}>Projects</h1>
        <Link href="/admin/projects/new" style={{ ...A.btn, display: 'inline-block', textDecoration: 'none' } as React.CSSProperties}>+ new project</Link>
      </div>
      <div style={A.card}>
        {items.map((p) => (
          <div key={p.slug} style={{ ...A.row, gap: 16 }}>
            <div style={{ flex: 1 }}>
              <span style={{ color: p.published ? '#4ade80' : '#888', marginRight: 10, fontSize: 11 }}>{p.published ? '● live' : '○ draft'}</span>
              <Link href={`/admin/projects/${p.slug}`} style={A.link}>{p.slug}</Link>
              <span style={{ color: '#555', marginLeft: 8, fontSize: 12 }}>{p.tagline}</span>
            </div>
            <form action={deleteProject} style={{ display: 'inline' }}>
              <input type="hidden" name="slug" value={p.slug} />
              <button type="submit" style={A.btnDanger} onClick={undefined}>delete</button>
            </form>
          </div>
        ))}
        {items.length === 0 && <div style={{ color: '#555', padding: '8px 0' }}>no projects yet.</div>}
      </div>
    </div>
  );
}
