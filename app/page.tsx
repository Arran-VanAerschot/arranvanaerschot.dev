import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { listNotes } from '@/lib/notes';
import { ContentProvider } from '@/components/terminal/content-context';
import TerminalApp from '@/components/terminal/app';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const id = content.identity;
  return {
    title: `${id.handle} ~ portfolio`,
    description: id.bio || id.role,
  };
}

export default async function Home() {
  const [content, notes] = await Promise.all([getContent(), listNotes()]);
  return (
    <ContentProvider value={{ ...content, notes }}>
      <TerminalApp />
    </ContentProvider>
  );
}
