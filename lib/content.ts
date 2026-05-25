import { asc } from 'drizzle-orm';
import { db } from './db';
import { identity, projects, experience, skills, nowItems } from './db/schema';
import type { NoteMetadata } from './notes';

export async function getContent() {
  const [id, projs, exp, sk, now] = await Promise.all([
    db.query.identity.findFirst(),
    db.select().from(projects).orderBy(asc(projects.sortOrder)),
    db.select().from(experience).orderBy(asc(experience.sortOrder)),
    db.select().from(skills).orderBy(asc(skills.sortOrder)),
    db.select().from(nowItems).orderBy(asc(nowItems.sortOrder)),
  ]);

  return {
    identity: id!,
    projects: projs.map((p) => ({
      id:        p.slug,
      y:         p.year,
      kind:      p.kind,
      stack:     p.stack,
      stars:     p.stars,
      title:     p.title,
      tagline:   p.tagline,
      desc:      p.desc,
      published: p.published,
    })),
    experience: exp.map((e) => ({
      when:    e.whenLabel,
      role:    e.role,
      co:      e.co,
      loc:     e.loc,
      bullets: e.bullets,
    })),
    skills: sk.map((s) => ({
      proc: s.proc,
      cpu:  s.cpu,
      cmd:  s.cmd,
    })),
    now: now.map((n) => ({
      tag:  n.tag,
      text: n.text,
    })),
    notes: [] as NoteMetadata[],
  };
}

export type Content = Awaited<ReturnType<typeof getContent>>;

export async function getProject(slug: string) {
  return db.query.projects.findFirst({
    where: (t, { eq }) => eq(t.slug, slug),
  }) ?? null;
}
