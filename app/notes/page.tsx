import Link from 'next/link';
import { listNotes } from '@/lib/notes';

export const metadata = { title: 'notes · arran@ava' };

export default function NotesPage() {
  const notes = listNotes();
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0c0d0e',
      color: '#d4d3cc',
      fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
      padding: '48px 24px 80px',
    }}>
      <div style={{ maxWidth: 740, margin: '0 auto' }}>
        <nav style={{ display: 'flex', gap: 6, marginBottom: 48, fontSize: 12, color: '#5d5e57' }}>
          <Link href="/" style={{ color: '#5d5e57', textDecoration: 'none' }}>arran@ava</Link>
          <span>/</span>
          <span style={{ color: '#d4d3cc' }}>notes</span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 32 }}>
          <span style={{ color: '#e8a13a' }}>arran</span>
          <span style={{ color: '#5d5e57' }}>@</span>
          <span style={{ color: '#7eb87e' }}>ava</span>
          <span style={{ color: '#5d5e57' }}>:~/notes$&nbsp;</span>
          <span>ls -la</span>
        </div>

        {notes.length === 0 ? (
          <div style={{ color: '#5d5e57' }}>no notes yet.</div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 16, fontSize: 11, color: '#5d5e57', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 8px', borderBottom: '1px solid #2a2b27', marginBottom: 4 }}>
              <span>title</span>
              <span>date</span>
            </div>
            {notes.map((note) => (
              <Link key={note.slug} href={`/notes/${note.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="t-row-hover" style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 16, padding: '10px 8px', borderBottom: '1px solid color-mix(in oklab, #2a2b27 50%, transparent)', cursor: 'pointer' }}>
                  <div>
                    <div style={{ color: '#e8a13a' }}>{note.title}</div>
                    {note.summary && <div style={{ marginTop: 4, fontSize: 12, color: '#5d5e57' }}>{note.summary}</div>}
                    {note.tags.length > 0 && (
                      <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                        {note.tags.map((t) => (
                          <span key={t} style={{ fontSize: 10, color: '#6ab0b3', border: '1px solid #1a2e36', padding: '1px 6px' }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#5d5e57', paddingTop: 2 }}>{note.date}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginTop: 64, fontSize: 12, color: '#5d5e57' }}>
          <Link href="/" style={{ color: '#e8a13a', textDecoration: 'none' }}>← back to portfolio</Link>
        </div>
      </div>
    </div>
  );
}
