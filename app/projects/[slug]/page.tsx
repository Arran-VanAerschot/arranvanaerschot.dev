import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getProject } from '@/lib/content';
import { Arch, Lane, Node, Arrow } from '@/components/case/arch';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return { title: project.title };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project || !project.published) notFound();

  return (
    <div className="case-page" style={{
      minHeight: '100vh',
      background: '#0c0d0e',
      color: '#d4d3cc',
      fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
      fontSize: 14,
      lineHeight: 1.6,
    }}>
      {/* Chrome bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        borderBottom: '1px solid #2a2b27',
        background: 'color-mix(in oklab, #0c0d0e 80%, #000 8%)',
        height: 36,
        fontSize: 12,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'color-mix(in oklab, #c97b9d 70%, transparent)' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'color-mix(in oklab, #e8a13a 70%, transparent)' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'color-mix(in oklab, #7eb87e 70%, transparent)' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'center', color: '#5d5e57' }}>
          root@arranvanaerschot ~ /portfolio/cases/{slug} · less
        </div>
        <div style={{ color: '#5d5e57' }}>↑ q to quit</div>
      </div>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px' }}>
        {/* Terminal prompt */}
        <div style={{ padding: '28px 0 0', fontSize: 13 }}>
          <span style={{ color: '#e8a13a' }}>root</span>
          <span style={{ color: '#5d5e57' }}>@</span>
          <span style={{ color: '#7eb87e' }}>arranvanaerschot</span>
          <span style={{ color: '#5d5e57' }}>:</span>
          <span style={{ color: '#6ab0b3' }}>~/cases</span>
          <span style={{ color: '#5d5e57' }}>$ </span>
          <span>cat {slug}.md</span>
        </div>

        {/* Title + tagline */}
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 500, letterSpacing: '-0.01em', color: '#e8a13a', margin: '18px 0 6px' }}>
          ./{slug}
        </h1>
        <p style={{ color: 'color-mix(in oklab, #d4d3cc 80%, #0c0d0e)', margin: '0 0 22px' }}>{project.tagline}</p>

        {/* Meta table */}
        <dl style={{
          display: 'grid',
          gridTemplateColumns: '90px 1fr',
          gap: '8px 16px',
          fontSize: 13,
          padding: '16px 18px',
          border: '1px solid #2a2b27',
          background: 'color-mix(in oklab, #0c0d0e 92%, #d4d3cc 3%)',
          marginBottom: 32,
        }}>
          <dt style={{ color: '#5d5e57', margin: 0 }}>kind</dt>
          <dd style={{ margin: 0 }}>{project.kind}</dd>
          <dt style={{ color: '#5d5e57', margin: 0 }}>year</dt>
          <dd style={{ margin: 0 }}>{project.year}</dd>
          <dt style={{ color: '#5d5e57', margin: 0 }}>stack</dt>
          <dd style={{ margin: 0 }}>
            {project.stack.map((s, i) => (
              <span key={s}>
                <code style={{ background: 'color-mix(in oklab, #e8a13a 14%, #0c0d0e)', color: '#e8a13a', padding: '1px 6px', borderRadius: 2, fontSize: 12.5 }}>{s}</code>
                {i < project.stack.length - 1 && <span style={{ color: '#5d5e57' }}> · </span>}
              </span>
            ))}
          </dd>
        </dl>

        {/* Body */}
        <div className="case-content">
          <MDXRemote source={project.body} components={{ Arch, Lane, Node, Arrow }} />
        </div>

        {/* Terminal cursor */}
        <div style={{ marginTop: 60, fontSize: 13 }}>
          <span style={{ color: '#e8a13a' }}>root</span>
          <span style={{ color: '#5d5e57' }}>@</span>
          <span style={{ color: '#7eb87e' }}>arranvanaerschot</span>
          <span style={{ color: '#5d5e57' }}>:</span>
          <span style={{ color: '#6ab0b3' }}>~/cases</span>
          <span style={{ color: '#5d5e57' }}>$ </span>
          <span style={{ color: '#e8a13a' }}>▌</span>
        </div>

        {/* Back link */}
        <Link href="/#sec-projects" style={{
          display: 'inline-block',
          padding: '6px 12px',
          border: '1px solid #2a2b27',
          marginTop: 24,
          color: '#d4d3cc',
          textDecoration: 'none',
          fontSize: 13,
        }}
          className="case-back"
        >
          ← back to ~/projects
        </Link>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #2a2b27',
          marginTop: 60,
          padding: '16px 0',
          display: 'flex',
          justifyContent: 'space-between',
          color: '#5d5e57',
          fontSize: 12,
        }}>
          <span>./{slug} · case study · arran van aerschot</span>
          <span>set in jetbrains mono</span>
        </div>
      </div>
    </div>
  );
}
