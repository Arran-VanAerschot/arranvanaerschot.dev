import { db } from '../lib/db';
import { identity, projects, experience, skills, nowItems, adminUsers } from '../lib/db/schema';
import { hashPassword } from '../lib/auth';
import { eq } from 'drizzle-orm';

// ── Seed data (from original data.ts) ────────────────────────────────────────

const IDENTITY = {
  id: 1,
  name: 'Arran Van Aerschot',
  handle: 'arran@ava',
  role: 'Junior Software Engineer · Automation Engineer',
  loc: 'Brussels, BE',
  open: 'Open Q3 2026 · contract or perm · remote EU',
  email: 'arran@ava.dev',
  github: 'github.com/avanaerschot',
  linkedin: 'linkedin.com/in/avanaerschot',
  readcv: 'read.cv/arran',
  pgp: '7E4A 91FC 22BD 0044',
  resumeUrl: null,
  bio: 'I build backend services — mostly .NET, sometimes Go — wire up React/Next when a UI is needed, and write a lot of glue around docker, postgres, and github actions. Happiest in the gap between "this works" and "this is actually maintained."',
  stats: [
    { k: 'YEARS',       v: '3',      d: 'shipping'       },
    { k: 'COFFEE',      v: '∞',      d: 'per sprint'     },
    { k: 'BUGS FIXED',  v: '> made', d: 'probably'       },
    { k: 'STACKTRACES', v: '100s',   d: 'read this year' },
  ],
};

const PROJECTS = [
  { slug: 'ledger',     title: 'Ledger',       year: 2025, kind: 'tool',     stack: ['dotnet','pg','react'],       stars: 142, sortOrder: 0, published: false, tagline: 'reconciliation engine — 14h batch → 9min',           desc: 'A finance reconciliation engine that replaced a fragile overnight batch with a streaming pipeline. Cut close from 14h to under 9min, eliminated 3 standing alerts.', body: '' },
  { slug: 'conduit',    title: 'Conduit',      year: 2024, kind: 'platform', stack: ['csharp','docker','grpc'],    stars: 89,  sortOrder: 1, published: false, tagline: 'visual workflow builder for ops teams',              desc: '500+ plays in production. Drag-and-drop workflow builder over a C# job engine; ops teams now ship runbooks without filing tickets to engineering.', body: '' },
  { slug: 'fieldnotes', title: 'Field Notes',  year: 2024, kind: 'app',     stack: ['next','pg','workbox'],       stars: 56,  sortOrder: 2, published: false, tagline: 'offline-first cms for field technicians',            desc: 'Sync-on-reconnect CMS for technicians working in faraday-cage warehouses. Writes queue locally, conflict resolution on reconnect.', body: '' },
  { slug: 'pipe',       title: 'pipe',         year: 2025, kind: 'cli',     stack: ['rust'],                      stars: 31,  sortOrder: 3, published: false, tagline: 'streaming json mutator, jq for the impatient',       desc: 'Side project. Stream-mutate huge JSONL files without loading them into memory. My first published crate.', body: '' },
  { slug: 'halftone',   title: 'Halftone',     year: 2025, kind: 'web',     stack: ['ts','wasm'],                 stars: 18,  sortOrder: 4, published: false, tagline: 'image dithering playground',                        desc: 'Browser-side image dithering via Rust→WASM. Drag in any image, pick an algorithm, export.', body: '' },
  { slug: 'quartz',     title: 'Quartz.Mini',  year: 2024, kind: 'lib',     stack: ['csharp'],                   stars: 24,  sortOrder: 5, published: false, tagline: 'minimal job scheduling for .NET workers',            desc: 'A 400-line job scheduler I extracted from Conduit. Cron syntax, postgres-backed, no servers.', body: '' },
  { slug: 'mailroom',   title: 'Mailroom',     year: 2024, kind: 'svc',     stack: ['go','redis'],               stars: 12,  sortOrder: 6, published: false, tagline: 'inbound email parser & router',                      desc: 'A small Go service that ingests SMTP, classifies via rules, and posts webhooks. Handles ~40k/day for a former contract client.', body: '' },
  { slug: 'foreman',    title: 'foreman',      year: 2023, kind: 'cli',     stack: ['bash'],                     stars: 9,   sortOrder: 7, published: false, tagline: 'process supervisor for laptop dev stacks',           desc: 'A small Bash script I wrote to stop fighting docker-compose for purely-local dev. Pop it in your dotfiles.', body: '' },
];

const EXPERIENCE = [
  { whenLabel: '2024 — Now', role: 'Junior Software Engineer', co: 'Northwind Systems', loc: 'Brussels', sortOrder: 0, bullets: ['Backend and internal tools across logistics and finance domains', 'Migrated 73 legacy SOAP endpoints to REST + OpenAPI; zero downtime', 'Built reconciliation engine (Ledger) — finance close went 14h → 9min', 'On-call rotation for 11 production services'] },
  { whenLabel: '2023 — 2024', role: 'Automation Engineer', co: 'Helix Automation', loc: 'Antwerp', sortOrder: 1, bullets: ['Wrote monitoring + control software for warehouse robotics', 'Shipped supervisory stack across 4 sites; uptime 99.94%', 'Liaison between firmware team and warehouse ops'] },
  { whenLabel: '2021 — 2023', role: 'Web Developer (contract)', co: 'Independent', loc: 'Remote', sortOrder: 2, bullets: ['14 client projects · small-business sites and Shopify apps', 'Two e-commerce migrations to Next.js (one ~40k monthly orders)'] },
  { whenLabel: '2018 — 2021', role: 'BSc Applied Informatics', co: 'University of Ghent', loc: 'Ghent', sortOrder: 3, bullets: ['Graduated with distinction', 'Thesis: distributed task scheduling under network partition'] },
];

const SKILLS = [
  { proc: 'dotnet/csharp',  cpu: 92, cmd: 'dotnet build src/Worker --runtime linux-x64',            sortOrder: 0  },
  { proc: 'postgres',       cpu: 84, cmd: 'psql -d production -c "EXPLAIN ANALYZE …"',              sortOrder: 1  },
  { proc: 'typescript',     cpu: 71, cmd: 'tsc --noEmit --watch',                                   sortOrder: 2  },
  { proc: 'react/next',     cpu: 69, cmd: 'next dev --turbo',                                       sortOrder: 3  },
  { proc: 'docker',         cpu: 66, cmd: 'docker compose up --build',                              sortOrder: 4  },
  { proc: 'github-actions', cpu: 58, cmd: 'act -j build',                                           sortOrder: 5  },
  { proc: 'sql',            cpu: 56, cmd: 'CREATE INDEX CONCURRENTLY idx_ledger_…',                 sortOrder: 6  },
  { proc: 'python',         cpu: 42, cmd: 'uv run scripts/etl.py --since 24h',                      sortOrder: 7  },
  { proc: 'bash/linux',     cpu: 38, cmd: "awk '/ERR/ {print $1, $7}' app.log",                     sortOrder: 8  },
  { proc: 'redis',          cpu: 28, cmd: 'redis-cli --scan --pattern "session:*"',                 sortOrder: 9  },
  { proc: 'go',             cpu: 24, cmd: 'go test ./... -race',                                    sortOrder: 10 },
  { proc: 'rust',           cpu: 12, cmd: 'cargo build --release',                                  sortOrder: 11 },
];

const NOW = [
  { tag: 'BUILD', text: 'self-hosted observability stack for a warehouse robot fleet', sortOrder: 0 },
  { tag: 'READ ', text: 'hillel wayne — practical formal methods',                    sortOrder: 1 },
  { tag: 'LEARN', text: 'rust ownership / cargo workspaces',                          sortOrder: 2 },
  { tag: 'OPEN ', text: 'contract work Q3 2026 · remote EU / Brussels',              sortOrder: 3 },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding database…');

  // identity
  await db.insert(identity).values(IDENTITY)
    .onConflictDoUpdate({ target: identity.id, set: IDENTITY });

  // projects
  for (const p of PROJECTS) {
    await db.insert(projects).values(p)
      .onConflictDoUpdate({ target: projects.slug, set: p });
  }

  // experience
  await db.delete(experience);
  await db.insert(experience).values(EXPERIENCE);

  // skills
  await db.delete(skills);
  await db.insert(skills).values(SKILLS);

  // now items
  await db.delete(nowItems);
  await db.insert(nowItems).values(NOW);

  // admin user
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user creation');
  } else {
    const passwordHash = await hashPassword(password);
    await db.insert(adminUsers).values({ email, passwordHash })
      .onConflictDoUpdate({ target: adminUsers.email, set: { passwordHash } });
    console.log(`Admin user: ${email}`);
  }

  console.log('Done.');
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
