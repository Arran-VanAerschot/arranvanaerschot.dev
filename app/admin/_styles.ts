import type { CSSProperties } from 'react';

export const A: Record<string, CSSProperties> = {
  page:      { minHeight: '100vh', background: '#111', color: '#e5e5e5', fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 14, padding: '0 0 80px' },
  topbar:    { display: 'flex', alignItems: 'center', gap: 24, padding: '14px 28px', background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', marginBottom: 32 },
  container: { maxWidth: 820, margin: '0 auto', padding: '0 28px' },
  card:      { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: 24, marginBottom: 24 },
  h1:        { fontSize: 22, fontWeight: 600, margin: '0 0 24px', color: '#fff' },
  h2:        { fontSize: 16, fontWeight: 600, margin: '0 0 16px', color: '#e5e5e5' },
  label:     { display: 'block', color: '#888', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' },
  input:     { width: '100%', background: '#111', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', color: '#e5e5e5', fontFamily: 'inherit', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  textarea:  { width: '100%', background: '#111', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', color: '#e5e5e5', fontFamily: 'ui-monospace, monospace', fontSize: 13, boxSizing: 'border-box', outline: 'none', resize: 'vertical' },
  btn:       { background: '#e8a13a', color: '#111', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 },
  btnSm:     { background: '#2a2a2a', color: '#e5e5e5', border: 'none', borderRadius: 5, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 },
  btnDanger: { background: 'transparent', color: '#f87171', border: '1px solid #f87171', borderRadius: 5, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 },
  link:      { color: '#e8a13a', textDecoration: 'none' },
  row:       { display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #222' },
  field:     { marginBottom: 20 },
};
