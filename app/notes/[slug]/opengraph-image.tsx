import { ImageResponse } from 'next/og';
import { getNote, listNotes } from '@/lib/notes';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return listNotes().map((n) => ({ slug: n.slug }));
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getNote(slug);
  const title = note?.metadata.title ?? slug;
  const date = note?.metadata.date ?? '';
  const summary = note?.metadata.summary ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0c0d0e',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          fontFamily: 'monospace',
        }}
      >
        {date && (
          <div style={{ fontSize: 14, color: '#5d5e57', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {date}
          </div>
        )}
        <div style={{ fontSize: 56, fontWeight: 700, color: '#e8a13a', lineHeight: 1.1, marginBottom: 28 }}>
          {title}
        </div>
        {summary && (
          <div style={{ fontSize: 24, color: '#d4d3cc', lineHeight: 1.4, marginBottom: 36 }}>
            {summary}
          </div>
        )}
        <div style={{ fontSize: 16, color: '#5d5e57' }}>root@arranvanaerschot · notes</div>
      </div>
    ),
    { ...size },
  );
}
