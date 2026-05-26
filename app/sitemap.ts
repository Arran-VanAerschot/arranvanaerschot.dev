import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { listNotes } from '@/lib/notes';
import { listPublishedProjects } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const notes = listNotes();
  const projects = await listPublishedProjects();

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/notes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...notes.map((n) => ({
      url: `${SITE_URL}/notes/${n.slug}`,
      lastModified: n.date ? new Date(n.date) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...projects.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
