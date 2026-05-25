import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { A } from '../../_styles';
import ProjectForm from '../_form';

async function createProject(formData: FormData) {
  'use server';
  const slug = String(formData.get('slug') ?? '').trim().toLowerCase().replace(/\s+/g, '-');
  if (!slug) return;
  await db.insert(projects).values({
    slug,
    title:     String(formData.get('title')   ?? ''),
    year:      Number(formData.get('year')    ?? new Date().getFullYear()),
    kind:      String(formData.get('kind')    ?? ''),
    stack:     String(formData.get('stack')   ?? '').split(',').map(s => s.trim()).filter(Boolean),
    stars:     Number(formData.get('stars')   ?? 0),
    tagline:   String(formData.get('tagline') ?? ''),
    desc:      String(formData.get('desc')    ?? ''),
    body:      String(formData.get('body')    ?? ''),
    published: formData.get('published') === 'on',
    sortOrder: Number(formData.get('sortOrder') ?? 99),
  });
  revalidatePath('/');
  redirect('/admin/projects?saved=1');
}

export default function NewProjectPage() {
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 28px' }}>
      <h1 style={A.h1}>New project</h1>
      <form action={createProject}>
        <ProjectForm />
        <button type="submit" style={A.btn}>Create project</button>
      </form>
    </div>
  );
}
