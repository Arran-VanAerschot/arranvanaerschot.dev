import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { skills } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import { A } from '../_styles';

async function updateSkill(formData: FormData) {
  'use server';
  const id = Number(formData.get('id'));
  await db.update(skills).set({
    proc:      String(formData.get('proc')  ?? ''),
    cpu:       Number(formData.get('cpu')   ?? 0),
    cmd:       String(formData.get('cmd')   ?? ''),
    sortOrder: Number(formData.get('sort')  ?? 0),
  }).where(eq(skills.id, id));
  revalidatePath('/');
}

async function deleteSkill(formData: FormData) {
  'use server';
  await db.delete(skills).where(eq(skills.id, Number(formData.get('id'))));
  revalidatePath('/');
}

async function addSkill(formData: FormData) {
  'use server';
  await db.insert(skills).values({
    proc:      String(formData.get('proc') ?? ''),
    cpu:       Number(formData.get('cpu')  ?? 0),
    cmd:       String(formData.get('cmd')  ?? ''),
    sortOrder: Number(formData.get('sort') ?? 99),
  });
  revalidatePath('/');
  redirect('/admin/skills');
}

export default async function SkillsPage() {
  const items = await db.select().from(skills).orderBy(asc(skills.sortOrder));

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 28px' }}>
      <h1 style={A.h1}>Skills</h1>

      <div style={A.card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 60px 2fr 60px 60px 100px', gap: 8, fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 0 12px', borderBottom: '1px solid #2a2a2a', marginBottom: 8 }}>
          <span>process</span><span>cpu%</span><span>cmd</span><span>sort</span><span></span><span></span>
        </div>
        {items.map((s) => (
          <form key={s.id} action={updateSkill} style={{ display: 'grid', gridTemplateColumns: '1.2fr 60px 2fr 60px 80px 80px', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #1e1e1e' }}>
            <input type="hidden" name="id" value={s.id} />
            <input name="proc" defaultValue={s.proc} style={{ ...A.input, padding: '5px 8px', fontSize: 13 }} />
            <input name="cpu"  type="number" min={0} max={100} defaultValue={s.cpu}  style={{ ...A.input, padding: '5px 8px', fontSize: 13 }} />
            <input name="cmd"  defaultValue={s.cmd}  style={{ ...A.input, padding: '5px 8px', fontSize: 12, fontFamily: 'ui-monospace, monospace' }} />
            <input name="sort" type="number" defaultValue={s.sortOrder} style={{ ...A.input, padding: '5px 8px', fontSize: 13 }} />
            <button type="submit" style={A.btnSm}>save</button>
            <form action={deleteSkill} style={{ display: 'inline' }}>
              <input type="hidden" name="id" value={s.id} />
              <button type="submit" style={A.btnDanger}>del</button>
            </form>
          </form>
        ))}
      </div>

      <h2 style={{ ...A.h2, marginTop: 32 }}>Add skill</h2>
      <div style={A.card}>
        <form action={addSkill} style={{ display: 'grid', gridTemplateColumns: '1.2fr 80px 2fr 80px auto', gap: 12, alignItems: 'flex-end' }}>
          {[['proc','Process'],['cpu','CPU %'],['cmd','Command'],['sort','Sort']].map(([name, label], i) => (
            <div key={name}>
              <label style={A.label}>{label}</label>
              <input name={name} type={i === 1 || i === 3 ? 'number' : 'text'} defaultValue={i === 3 ? 99 : ''} style={A.input} />
            </div>
          ))}
          <button type="submit" style={{ ...A.btn, alignSelf: 'flex-end' }}>Add</button>
        </form>
      </div>
    </div>
  );
}
