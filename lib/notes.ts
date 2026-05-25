import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const NOTES_DIR = path.join(process.cwd(), 'content/notes');

export interface NoteMetadata {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
}

export function listNotes(): NoteMetadata[] {
  if (!fs.existsSync(NOTES_DIR)) return [];
  return fs
    .readdirSync(NOTES_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const slug = f.replace(/\.mdx$/, '');
      const raw = fs.readFileSync(path.join(NOTES_DIR, f), 'utf8');
      const { data } = matter(raw);
      return {
        slug,
        title: String(data.title || slug),
        date: data.date ? String(data.date).slice(0, 10) : '',
        summary: String(data.summary || ''),
        tags: Array.isArray(data.tags) ? data.tags : [],
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getNote(slug: string): { metadata: NoteMetadata; content: string } | null {
  const filePath = path.join(NOTES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  return {
    metadata: {
      slug,
      title: String(data.title || slug),
      date: data.date ? String(data.date).slice(0, 10) : '',
      summary: String(data.summary || ''),
      tags: Array.isArray(data.tags) ? data.tags : [],
    },
    content,
  };
}
