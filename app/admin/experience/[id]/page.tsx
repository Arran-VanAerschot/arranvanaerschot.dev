import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { experience } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { A } from '../../_styles';

async function updateExperience(id: number, formData: FormData) {
  'use server';
  await requireAuth();
  await db.update(experience).set({
    whenLabel: String(formData.get('whenLabel') ?? ''),
    role:      String(formData.get('role')      ?? ''),
    co:        String(formData.get('co')        ?? ''),
    loc:       String(formData.get('loc')       ?? ''),
    bullets:   String(formData.get('bullets')   ?? '').split('\n').map(s => s.trim()).filter(Boolean),
    sortOrder: Number(formData.get('sortOrder') ?? 0),
  }).where(eq(experience.id, id));
  revalidatePath('/');
  redirect('/admin/experience?saved=1');
}

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await db.query.experience.findFirst({ where: (t, { eq }) => eq(t.id, Number(id)) });
  if (!entry) notFound();

  const action = updateExperience.bind(null, entry.id);

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 28px' }}>
      <h1 style={A.h1}>Edit experience</h1>
      <div style={A.card}>
        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {([['whenLabel','Period',entry.whenLabel],['role','Role',entry.role],['co','Company',entry.co],['loc','Location',entry.loc]] as [string,string,string][]).map(([name, label, val]) => (
              <div key={name}>
                <label style={A.label}>{label}</label>
                <input name={name} defaultValue={val} style={A.input} />
              </div>
            ))}
            <div>
              <label style={A.label}>Sort order</label>
              <input name="sortOrder" type="number" defaultValue={entry.sortOrder} style={A.input} />
            </div>
          </div>
          <div>
            <label style={A.label}>Bullets (one per line)</label>
            <textarea name="bullets" rows={6} defaultValue={entry.bullets.join('\n')} style={A.textarea} />
          </div>
          <div><button type="submit" style={A.btn}>Save</button></div>
        </form>
      </div>
    </div>
  );
}
