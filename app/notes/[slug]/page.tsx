import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getNote, listNotes } from '@/lib/notes';

export async function generateStaticParams() {
  return listNotes().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return {};
  return { title: note.metadata.title };
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

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
          <Link href="/" style={{ color: '#5d5e57', textDecoration: 'none' }}>root@arranvanaerschot</Link>
          <span>/</span>
          <Link href="/notes" style={{ color: '#5d5e57', textDecoration: 'none' }}>notes</Link>
          <span>/</span>
          <span style={{ color: '#d4d3cc' }}>{slug}</span>
        </nav>

        <div style={{ marginBottom: 8, fontSize: 11, color: '#5d5e57', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {note.metadata.date}
        </div>
        <h1 style={{ margin: '0 0 16px', fontWeight: 500, fontSize: 'clamp(22px, 3.5vw, 34px)', lineHeight: 1.15, color: '#e8a13a' }}>
          {note.metadata.title}
        </h1>
        {note.metadata.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 48 }}>
            {note.metadata.tags.map((t) => (
              <span key={t} style={{ fontSize: 11, color: '#6ab0b3', border: '1px solid #1a2e36', padding: '2px 8px' }}>{t}</span>
            ))}
          </div>
        )}

        <div className="mdx-content">
          <MDXRemote source={note.content} />
        </div>

        <div style={{ marginTop: 64, borderTop: '1px solid #2a2b27', paddingTop: 24, fontSize: 12 }}>
          <Link href="/notes" style={{ color: '#e8a13a', textDecoration: 'none' }}>← all notes</Link>
        </div>
      </div>
    </div>
  );
}
