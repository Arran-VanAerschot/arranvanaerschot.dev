import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { nowItems } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import { A } from '../_styles';
import { SavedBanner } from '../_saved-banner';

const TAGS = ['BUILD', 'READ ', 'LEARN', 'OPEN '];

async function updateNow(formData: FormData) {
  'use server';
  const id = Number(formData.get('id'));
  await db.update(nowItems).set({
    tag:       String(formData.get('tag')  ?? ''),
    text:      String(formData.get('text') ?? ''),
    sortOrder: Number(formData.get('sort') ?? 0),
  }).where(eq(nowItems.id, id));
  revalidatePath('/');
  redirect('/admin/now?saved=1');
}

async function deleteNow(formData: FormData) {
  'use server';
  await db.delete(nowItems).where(eq(nowItems.id, Number(formData.get('id'))));
  revalidatePath('/');
}

async function addNow(formData: FormData) {
  'use server';
  await db.insert(nowItems).values({
    tag:       String(formData.get('tag')  ?? 'BUILD'),
    text:      String(formData.get('text') ?? ''),
    sortOrder: Number(formData.get('sort') ?? 99),
  });
  revalidatePath('/');
  redirect('/admin/now?saved=1');
}

export default async function NowPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const items = await db.select().from(nowItems).orderBy(asc(nowItems.sortOrder));

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 28px' }}>
      {saved && <SavedBanner />}
      <h1 style={A.h1}>Now</h1>

      <div style={A.card}>
        {items.map((n) => (
          <form key={n.id} action={updateNow} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 60px 80px 80px', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1e1e1e' }}>
            <input type="hidden" name="id" value={n.id} />
            <select name="tag" defaultValue={n.tag} style={{ ...A.input, padding: '5px 8px' }}>
              {TAGS.map(t => <option key={t} value={t}>{t.trim()}</option>)}
            </select>
            <input name="text" defaultValue={n.text} style={{ ...A.input, padding: '5px 8px', fontSize: 13 }} />
            <input name="sort" type="number" defaultValue={n.sortOrder} style={{ ...A.input, padding: '5px 8px' }} />
            <button type="submit" style={A.btnSm}>save</button>
            <form action={deleteNow}>
              <input type="hidden" name="id" value={n.id} />
              <button type="submit" style={A.btnDanger}>del</button>
            </form>
          </form>
        ))}
        {items.length === 0 && <div style={{ color: '#555' }}>no items yet.</div>}
      </div>

      <h2 style={{ ...A.h2, marginTop: 32 }}>Add item</h2>
      <div style={A.card}>
        <form action={addNow} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px auto', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <label style={A.label}>Tag</label>
            <select name="tag" style={A.input}>
              {TAGS.map(t => <option key={t} value={t}>{t.trim()}</option>)}
            </select>
          </div>
          <div>
            <label style={A.label}>Text</label>
            <input name="text" style={A.input} />
          </div>
          <div>
            <label style={A.label}>Sort</label>
            <input name="sort" type="number" defaultValue={99} style={A.input} />
          </div>
          <button type="submit" style={{ ...A.btn, alignSelf: 'flex-end' }}>Add</button>
        </form>
      </div>
    </div>
  );
}
