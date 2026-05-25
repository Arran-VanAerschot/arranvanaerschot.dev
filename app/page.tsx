import { getContent } from '@/lib/content';
import { listNotes } from '@/lib/notes';
import { ContentProvider } from '@/components/terminal/content-context';
import TerminalApp from '@/components/terminal/app';

export default async function Home() {
  const [content, notes] = await Promise.all([getContent(), listNotes()]);
  return (
    <ContentProvider value={{ ...content, notes }}>
      <TerminalApp />
    </ContentProvider>
  );
}
