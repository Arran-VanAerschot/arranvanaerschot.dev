import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { A } from '../../_styles';
import ProjectForm from '../_form';

async function updateProject(slug: string, formData: FormData) {
  'use server';
  const data = {
    title:     String(formData.get('title')   ?? ''),
    year:      Number(formData.get('year')    ?? 0),
    kind:      String(formData.get('kind')    ?? ''),
    stack:     String(formData.get('stack')   ?? '').split(',').map(s => s.trim()).filter(Boolean),
    stars:     Number(formData.get('stars')   ?? 0),
    tagline:   String(formData.get('tagline') ?? ''),
    desc:      String(formData.get('desc')    ?? ''),
    body:      String(formData.get('body')    ?? ''),
    published: formData.get('published') === 'on',
    sortOrder: Number(formData.get('sortOrder') ?? 0),
  };
  await db.update(projects).set(data).where(eq(projects.slug, slug));
  revalidatePath('/');
  revalidatePath(`/projects/${slug}`);
  redirect('/admin/projects?saved=1');
}

export default async function EditProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await db.query.projects.findFirst({ where: (t, { eq }) => eq(t.slug, slug) });
  if (!project) notFound();

  const action = updateProject.bind(null, slug);

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 28px' }}>
      <h1 style={A.h1}>Edit · {slug}</h1>
      <form action={action}>
        <ProjectForm defaultValues={{ ...project, stack: project.stack }} slugReadOnly />
        <button type="submit" style={A.btn}>Save changes</button>
      </form>
    </div>
  );
}
