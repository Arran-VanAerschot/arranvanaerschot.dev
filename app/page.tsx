import type { Metadata } from 'next';

export const revalidate = 3600;
import { getContent } from '@/lib/content';
import { listNotes } from '@/lib/notes';
import { ContentProvider } from '@/components/terminal/content-context';
import TerminalApp from '@/components/terminal/app';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const id = content.identity;
  const title = `${id.handle} ~ portfolio`;
  const description = id.bio || id.role;
  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: { title, description, url: '/' },
  };
}

export default async function Home() {
  const [content, notes] = await Promise.all([getContent(), listNotes()]);
  const id = content.identity;
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: id.name,
          url: SITE_URL,
          jobTitle: id.role,
          sameAs: [id.github, id.linkedin].filter(Boolean),
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
        }}
      />
      <ContentProvider value={{ ...content, notes }}>
        <TerminalApp />
      </ContentProvider>
    </>
  );
}
