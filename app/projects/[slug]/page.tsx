import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getProject } from '@/lib/content';

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
          <Link href="/#sec-projects" style={{ color: '#5d5e57', textDecoration: 'none' }}>projects</Link>
          <span>/</span>
          <span style={{ color: '#d4d3cc' }}>{slug}</span>
        </nav>

        <div style={{ color: '#5d5e57', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          {project.kind} · {project.year}
        </div>
        <h1 style={{ margin: '0 0 10px', fontWeight: 500, fontSize: 'clamp(26px, 4vw, 40px)', lineHeight: 1.1, color: '#e8a13a' }}>
          {project.title}
        </h1>
        <p style={{ margin: '0 0 10px', fontSize: 16, color: '#d4d3cc', opacity: 0.8 }}>{project.tagline}</p>
        <div style={{ marginBottom: 48, fontSize: 12, color: '#6ab0b3' }}>{project.stack.join(' · ')}</div>

        <div className="mdx-content">
          <MDXRemote source={project.body} />
        </div>

        <div style={{ marginTop: 64, borderTop: '1px solid #2a2b27', paddingTop: 24, fontSize: 12, color: '#5d5e57' }}>
          <Link href="/" style={{ color: '#e8a13a', textDecoration: 'none' }}>← back to portfolio</Link>
        </div>
      </div>
    </div>
  );
}
