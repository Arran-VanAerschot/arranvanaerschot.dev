export const TD = {
  identity: {
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
  },
  projects: [
    {
      id: 'ledger', y: 2025, kind: 'tool', stack: ['dotnet', 'pg', 'react'], stars: 142,
      title: 'Ledger',
      tagline: 'reconciliation engine — 14h batch → 9min',
      desc: 'A finance reconciliation engine that replaced a fragile overnight batch with a streaming pipeline. Cut close from 14h to under 9min, eliminated 3 standing alerts.',
      href: null as string | null,
    },
    {
      id: 'conduit', y: 2024, kind: 'platform', stack: ['csharp', 'docker', 'grpc'], stars: 89,
      title: 'Conduit',
      tagline: 'visual workflow builder for ops teams',
      desc: '500+ plays in production. Drag-and-drop workflow builder over a C# job engine; ops teams now ship runbooks without filing tickets to engineering.',
      href: null as string | null,
    },
    {
      id: 'fieldnotes', y: 2024, kind: 'app', stack: ['next', 'pg', 'workbox'], stars: 56,
      title: 'Field Notes',
      tagline: 'offline-first cms for field technicians',
      desc: 'Sync-on-reconnect CMS for technicians working in faraday-cage warehouses. Writes queue locally, conflict resolution on reconnect.',
      href: null as string | null,
    },
    {
      id: 'pipe', y: 2025, kind: 'cli', stack: ['rust'], stars: 31,
      title: 'pipe',
      tagline: 'streaming json mutator, jq for the impatient',
      desc: 'Side project. Stream-mutate huge JSONL files without loading them into memory. My first published crate.',
      href: null as string | null,
    },
    {
      id: 'halftone', y: 2025, kind: 'web', stack: ['ts', 'wasm'], stars: 18,
      title: 'Halftone',
      tagline: 'image dithering playground',
      desc: 'Browser-side image dithering via Rust→WASM. Drag in any image, pick an algorithm, export.',
      href: null as string | null,
    },
    {
      id: 'quartz', y: 2024, kind: 'lib', stack: ['csharp'], stars: 24,
      title: 'Quartz.Mini',
      tagline: 'minimal job scheduling for .NET workers',
      desc: 'A 400-line job scheduler I extracted from Conduit. Cron syntax, postgres-backed, no servers.',
      href: null as string | null,
    },
    {
      id: 'mailroom', y: 2024, kind: 'svc', stack: ['go', 'redis'], stars: 12,
      title: 'Mailroom',
      tagline: 'inbound email parser & router',
      desc: 'A small Go service that ingests SMTP, classifies via rules, and posts webhooks. Handles ~40k/day for a former contract client.',
      href: null as string | null,
    },
    {
      id: 'foreman', y: 2023, kind: 'cli', stack: ['bash'], stars: 9,
      title: 'foreman',
      tagline: 'process supervisor for laptop dev stacks',
      desc: 'A small Bash script I wrote to stop fighting docker-compose for purely-local dev. Pop it in your dotfiles.',
      href: null as string | null,
    },
  ],
  experience: [
    {
      when: '2024 — Now', role: 'Junior Software Engineer', co: 'Northwind Systems', loc: 'Brussels',
      bullets: [
        'Backend and internal tools across logistics and finance domains',
        'Migrated 73 legacy SOAP endpoints to REST + OpenAPI; zero downtime',
        'Built reconciliation engine (Ledger) — finance close went 14h → 9min',
        'On-call rotation for 11 production services',
      ],
    },
    {
      when: '2023 — 2024', role: 'Automation Engineer', co: 'Helix Automation', loc: 'Antwerp',
      bullets: [
        'Wrote monitoring + control software for warehouse robotics',
        'Shipped supervisory stack across 4 sites; uptime 99.94%',
        'Liaison between firmware team and warehouse ops',
      ],
    },
    {
      when: '2021 — 2023', role: 'Web Developer (contract)', co: 'Independent', loc: 'Remote',
      bullets: [
        '14 client projects · small-business sites and Shopify apps',
        'Two e-commerce migrations to Next.js (one ~40k monthly orders)',
      ],
    },
    {
      when: '2018 — 2021', role: 'BSc Applied Informatics', co: 'University of Ghent', loc: 'Ghent',
      bullets: [
        'Graduated with distinction',
        'Thesis: distributed task scheduling under network partition',
      ],
    },
  ],
  skills: [
    { proc: 'dotnet/csharp', cpu: 92, cmd: 'dotnet build src/Worker --runtime linux-x64' },
    { proc: 'postgres', cpu: 84, cmd: 'psql -d production -c "EXPLAIN ANALYZE …"' },
    { proc: 'typescript', cpu: 71, cmd: 'tsc --noEmit --watch' },
    { proc: 'react/next', cpu: 69, cmd: 'next dev --turbo' },
    { proc: 'docker', cpu: 66, cmd: 'docker compose up --build' },
    { proc: 'github-actions', cpu: 58, cmd: 'act -j build' },
    { proc: 'sql', cpu: 56, cmd: 'CREATE INDEX CONCURRENTLY idx_ledger_…' },
    { proc: 'python', cpu: 42, cmd: 'uv run scripts/etl.py --since 24h' },
    { proc: 'bash/linux', cpu: 38, cmd: "awk '/ERR/ {print $1, $7}' app.log" },
    { proc: 'redis', cpu: 28, cmd: 'redis-cli --scan --pattern "session:*"' },
    { proc: 'go', cpu: 24, cmd: 'go test ./... -race' },
    { proc: 'rust', cpu: 12, cmd: 'cargo build --release  # learning' },
  ],
  now: [
    { tag: 'BUILD', text: 'self-hosted observability stack for a warehouse robot fleet' },
    { tag: 'READ ', text: 'hillel wayne — practical formal methods' },
    { tag: 'LEARN', text: 'rust ownership / cargo workspaces' },
    { tag: 'OPEN ', text: 'contract work Q3 2026 · remote EU / Brussels' },
  ],
} as const;

export type Project = typeof TD.projects[number];
export type Experience = typeof TD.experience[number];
export type Skill = typeof TD.skills[number];
export type NowEntry = typeof TD.now[number];
