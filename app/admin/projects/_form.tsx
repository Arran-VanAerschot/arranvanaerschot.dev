import { A } from '../_styles';

interface ProjectFormProps {
  defaultValues?: {
    slug?: string; title?: string; year?: number; kind?: string;
    stack?: string[]; stars?: number; tagline?: string; desc?: string;
    body?: string; published?: boolean; sortOrder?: number;
  };
  slugReadOnly?: boolean;
}

export default function ProjectForm({ defaultValues: d = {}, slugReadOnly }: ProjectFormProps) {
  const F = (name: string, label: string, value: string | number, type = 'text', required = false) => (
    <div style={A.field}>
      <label style={A.label}>{label}</label>
      <input name={name} type={type} defaultValue={String(value)} required={required}
        readOnly={name === 'slug' && slugReadOnly}
        style={{ ...A.input, opacity: name === 'slug' && slugReadOnly ? 0.5 : 1 }} />
    </div>
  );

  return (
    <>
      <div style={A.card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {F('slug',      'Slug (URL key)', d.slug      ?? '', 'text', true)}
          {F('title',     'Title',          d.title     ?? '', 'text', true)}
          {F('year',      'Year',           d.year      ?? new Date().getFullYear(), 'number')}
          {F('kind',      'Kind',           d.kind      ?? '')}
          {F('stars',     '★ Stars',        d.stars     ?? 0, 'number')}
          {F('sortOrder', 'Sort order',     d.sortOrder ?? 99, 'number')}
        </div>
        {F('stack',   'Stack (comma-separated)',  d.stack?.join(', ')   ?? '')}
        {F('tagline', 'Tagline',                  d.tagline             ?? '')}
        <div style={A.field}>
          <label style={A.label}>Short description</label>
          <textarea name="desc" rows={3} defaultValue={d.desc ?? ''} style={A.textarea} />
        </div>
        <div style={A.field}>
          <label style={{ ...A.label, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input name="published" type="checkbox" defaultChecked={d.published ?? false} style={{ width: 'auto' }} />
            Published (case study visible at /projects/slug)
          </label>
        </div>
      </div>
      <div style={A.card}>
        <h2 style={A.h2}>Case study body</h2>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Markdown / MDX. Only shown when project is published.</div>
        <textarea name="body" rows={20} defaultValue={d.body ?? ''} style={A.textarea} />
      </div>
    </>
  );
}
