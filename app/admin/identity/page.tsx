import React from 'react';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { identity } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { A } from '../_styles';
import { SavedBanner } from '../_saved-banner';

async function saveIdentity(formData: FormData) {
  'use server';
  const data = {
    name:      String(formData.get('name')     ?? ''),
    handle:    String(formData.get('handle')   ?? ''),
    role:      String(formData.get('role')     ?? ''),
    loc:       String(formData.get('loc')      ?? ''),
    open:      String(formData.get('open')     ?? ''),
    email:     String(formData.get('email')    ?? ''),
    github:    String(formData.get('github')   ?? ''),
    linkedin:  String(formData.get('linkedin') ?? ''),
    readcv:    String(formData.get('readcv')   ?? ''),
    resumeUrl: formData.get('resumeUrl') ? String(formData.get('resumeUrl')) : null,
    avatarUrl: formData.get('avatarUrl') ? String(formData.get('avatarUrl')) : null,
    bio:       String(formData.get('bio')      ?? ''),
    stats:     [0,1,2,3].map(i => ({
      k: String(formData.get(`sk${i}`) ?? '').trim(),
      v: String(formData.get(`sv${i}`) ?? '').trim(),
      d: String(formData.get(`sd${i}`) ?? '').trim(),
    })).filter(s => s.k || s.v),
  };
  await db.update(identity).set(data).where(eq(identity.id, 1));
  revalidatePath('/');
  revalidatePath('/admin/identity');
  redirect('/admin/identity?saved=1');
}

export default async function IdentityPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  noStore();
  const { saved } = await searchParams;
  const id = await db.query.identity.findFirst();
  const F = (name: string, label: string, value: string, type = 'text') => (
    <div style={A.field}>
      <label style={A.label}>{label}</label>
      <input name={name} type={type} defaultValue={value} style={A.input} />
    </div>
  );

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 28px' }}>
      {saved && <SavedBanner />}
      <h1 style={A.h1}>Identity</h1>
      <form action={saveIdentity}>
        <div style={A.card}>
          <h2 style={A.h2}>Personal</h2>
          {F('name',   'Full name',  id?.name   ?? '')}
          {F('handle', 'Handle',     id?.handle ?? '')}
          {F('role',   'Role',       id?.role   ?? '')}
          {F('loc',    'Location',   id?.loc    ?? '')}
          {F('open',   'Open for',   id?.open   ?? '')}
        </div>
        <div style={A.card}>
          <h2 style={A.h2}>Contact &amp; links</h2>
          {F('email',     'Email',       id?.email     ?? '', 'email')}
          {F('github',    'GitHub',      id?.github    ?? '')}
          {F('linkedin',  'LinkedIn',    id?.linkedin  ?? '')}
          {F('readcv',    'Read.cv',     id?.readcv    ?? '')}
          {F('resumeUrl', 'Resume URL',  id?.resumeUrl ?? '')}
          {F('avatarUrl', 'Avatar image URL', id?.avatarUrl ?? '')}
        </div>
        <div style={A.card}>
          <h2 style={A.h2}>Bio</h2>
          <div style={A.field}>
            <label style={A.label}>Short description (shown on homepage)</label>
            <textarea name="bio" rows={4} defaultValue={id?.bio ?? ''} style={A.textarea} />
          </div>
        </div>
        <div style={A.card}>
          <h2 style={A.h2}>Stats banner</h2>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>Up to 4 stat boxes shown below the bio. Leave all empty to hide the banner.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: '8px 12px', alignItems: 'end' }}>
            <span style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Label</span>
            <span style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Value</span>
            <span style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descriptor</span>
            {[0,1,2,3].map(i => {
              const s = id?.stats?.[i];
              return (
                <React.Fragment key={i}>
                  <input name={`sk${i}`} defaultValue={s?.k ?? ''} placeholder="e.g. YEARS" style={A.input} />
                  <input name={`sv${i}`} defaultValue={s?.v ?? ''} placeholder="03" style={A.input} />
                  <input name={`sd${i}`} defaultValue={s?.d ?? ''} placeholder="shipping" style={A.input} />
                </React.Fragment>
              );
            })}
          </div>
        </div>
        <button type="submit" style={A.btn}>Save identity</button>
      </form>
    </div>
  );
}
