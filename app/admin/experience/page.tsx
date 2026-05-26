import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { experience } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { A } from '../_styles';
import { SavedBanner } from '../_saved-banner';

async function deleteExperience(formData: FormData) {
  'use server';
  await requireAuth();
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id <= 0) return;
  await db.delete(experience).where(eq(experience.id, id));
  revalidatePath('/');
  revalidatePath('/admin/experience');
}

async function addExperience(formData: FormData) {
  'use server';
  await requireAuth();
  await db.insert(experience).values({
    whenLabel: String(formData.get('whenLabel') ?? ''),
    role:      String(formData.get('role')      ?? ''),
    co:        String(formData.get('co')        ?? ''),
    loc:       String(formData.get('loc')       ?? ''),
    bullets:   String(formData.get('bullets')   ?? '').split('\n').map(s => s.trim()).filter(Boolean),
    sortOrder: Number(formData.get('sortOrder') ?? 99),
  });
  revalidatePath('/');
  redirect('/admin/experience?saved=1');
}

export default async function ExperiencePage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const items = await db.select().from(experience).orderBy(asc(experience.sortOrder));
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 28px' }}>
      {saved && <SavedBanner />}
      <h1 style={A.h1}>Experience</h1>

      {/* List */}
      <div style={A.card}>
        {items.map((e) => (
          <div key={e.id} style={{ ...A.row, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Link href={`/admin/experience/${e.id}`} style={A.link}>{e.role} @ {e.co}</Link>
              <span style={{ color: '#555', marginLeft: 10, fontSize: 12 }}>{e.whenLabel}</span>
            </div>
            <form action={deleteExperience}>
              <input type="hidden" name="id" value={e.id} />
              <button type="submit" style={A.btnDanger}>delete</button>
            </form>
          </div>
        ))}
        {items.length === 0 && <div style={{ color: '#555' }}>no entries yet.</div>}
      </div>

      {/* Add */}
      <h2 style={{ ...A.h2, marginTop: 32 }}>Add entry</h2>
      <div style={A.card}>
        <form action={addExperience} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['whenLabel','Period (e.g. 2024 — Now)'],['role','Role'],['co','Company'],['loc','Location']].map(([name, label]) => (
              <div key={name}>
                <label style={A.label}>{label}</label>
                <input name={name} style={A.input} />
              </div>
            ))}
            <div>
              <label style={A.label}>Sort order</label>
              <input name="sortOrder" type="number" defaultValue={99} style={A.input} />
            </div>
          </div>
          <div>
            <label style={A.label}>Bullets (one per line)</label>
            <textarea name="bullets" rows={5} style={A.textarea} />
          </div>
          <div><button type="submit" style={A.btn}>Add entry</button></div>
        </form>
      </div>
    </div>
  );
}
