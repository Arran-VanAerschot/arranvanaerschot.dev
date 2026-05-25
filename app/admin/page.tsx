import Link from 'next/link';

const SECTIONS = [
  { href: '/admin/identity',   label: 'Identity',   desc: 'Name, email, links, resume URL' },
  { href: '/admin/projects',   label: 'Projects',   desc: 'Manage and publish case studies' },
  { href: '/admin/experience', label: 'Experience', desc: 'Work history and education' },
  { href: '/admin/skills',     label: 'Skills',     desc: 'Tech stack and proficiency levels' },
  { href: '/admin/now',        label: 'Now',        desc: 'What you\'re currently doing' },
];

export default function AdminDashboard() {
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 28px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 32px', color: '#fff' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {SECTIONS.map(({ href, label, desc }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '20px 20px', cursor: 'pointer', transition: 'border-color 0.15s' }}>
              <div style={{ color: '#e8a13a', fontWeight: 600, marginBottom: 8 }}>{label}</div>
              <div style={{ color: '#888', fontSize: 13 }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 48, padding: '20px 24px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 13, color: '#888' }}>
        <strong style={{ color: '#e5e5e5' }}>Notes</strong> are authored as <code style={{ background: '#111', padding: '1px 5px', borderRadius: 3 }}>.mdx</code> files
        in <code style={{ background: '#111', padding: '1px 5px', borderRadius: 3 }}>content/notes/</code> — edit them directly in your editor and push to deploy.
      </div>
    </div>
  );
}
