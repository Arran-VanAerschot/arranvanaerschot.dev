import { ImageResponse } from 'next/og';
import { getProject, listPublishedProjects } from '@/lib/content';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  const projects = await listPublishedProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  const title = project?.title ?? slug;
  const tagline = project?.tagline ?? '';
  const stack = project?.stack ?? [];

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
        <div style={{ fontSize: 14, color: '#5d5e57', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          case study
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, color: '#e8a13a', lineHeight: 1.05, marginBottom: 20 }}>
          {title}
        </div>
        {tagline && (
          <div style={{ fontSize: 26, color: '#d4d3cc', lineHeight: 1.4, marginBottom: 32 }}>
            {tagline}
          </div>
        )}
        {stack.length > 0 && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
            {stack.slice(0, 5).map((s) => (
              <div key={s} style={{ background: '#1a1e16', color: '#e8a13a', padding: '4px 14px', fontSize: 14 }}>
                {s}
              </div>
            ))}
          </div>
        )}
        <div style={{ fontSize: 16, color: '#5d5e57' }}>root@arranvanaerschot · cases</div>
      </div>
    ),
    { ...size },
  );
}
