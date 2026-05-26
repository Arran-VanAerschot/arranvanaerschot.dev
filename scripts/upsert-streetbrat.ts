import { db } from '../lib/db';
import { projects } from '../lib/db/schema';

const BODY = `
Streetbrat is a culture publication covering art, beauty, fashion, film, music, and more. Off-the-shelf platforms — Squarespace, WordPress — impose structure that fights a brand like this at every turn: rigid themes, lowest-common-denominator image handling, CMS UIs built for blog posts not editorial spreads. I built the whole stack from scratch instead: a .NET 10 API, a Next.js 16 reader site, and a bespoke admin that gives editors the tools they actually need — focal-point image picking, multiple hero layouts, a pitch inbox, newsletter broadcasts, and a full audit log. Four months from first commit to production.

---

## the problem

Three things a generic platform can't give a culture publication:

**Image control.** Hero images are the product. Squarespace centers everything. I needed per-image focal-point picking so a portrait doesn't get its face cropped out on mobile, and per-article hero layout choice (stacked, split, title-over, full-bleed) so each piece can be art-directed.

**An owned editorial pipeline.** Pitch inbox → draft → review → publish is a workflow, not a blog. There's no plugin that maps cleanly to it without bringing three other things you don't want.

**A reader experience that isn't a theme.** The frontend needed to be the brand, not a customised template. That means total control over fonts (Druk), typography scale, spacing, and navigation — none of which survive a theme engine intact.

> "We tried three platforms. They all made the site look like every other site."
>
> — editor, kickoff

---

## the approach

Three constraints, in order:

**Editorial UX first, API second.** I spent the first two weeks sketching the admin screens before writing a line of API code. The data model fell out of what editors needed to do, not the other way around.

**Own the auth surface.** A bespoke CMS with a weak login is worse than Squarespace. ASP.NET Identity with TOTP 2FA, account lockout, token-stamp revocation, and magic-byte validation on uploads — the security posture had to match the access model.

**Server-first frontend.** Next.js App Router with React Server Components by default. No client-side state that doesn't need to be client-side. Server Actions for all mutations. The reader site fetches from the .NET API at request time; there's no build-time export step to break.

\`\`\`
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  pitch inbox ──▶ [ draft ] ──▶ [ review ] ──▶ [ publish ]              │
│                                                    │                    │
│                                              postgres (articles)         │
│                                                    │                    │
│                       ┌────────────────────────────┘                    │
│                       │                                                  │
│             next.js reader site                                          │
│         (RSC · server actions · no client state)                        │
│                       │                                                  │
│          .NET 10 API  ←──── admin panel (bespoke)                       │
│               │                    │                                    │
│        postgres · s3         identity · TOTP                            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
\`\`\`

The image pipeline is a single POST to the API: magic-byte check, dimension validation, strip EXIF, upload to S3, return a URL with the focal-point coordinate stored alongside. The Next.js \`<Image>\` component uses the coordinate to set CSS \`object-position\` — no client-side crop, no canvas, no lambda.

Every admin action — article create/update/delete, user changes, settings edits — writes to an append-only audit log. On-call for a one-person editorial team means you need to be able to answer "what changed and when" at 11pm.

---

## outcome

<div className="kpis">
  <div className="kpi"><div className="lbl">Hero Layouts</div><div className="v">4</div><div className="d">stacked · split · title-over · full-bleed</div></div>
  <div className="kpi"><div className="lbl">Image Control</div><div className="v">focal·pt</div><div className="d">per image, per article</div></div>
  <div className="kpi"><div className="lbl">Auth</div><div className="v">TOTP</div><div className="d">2FA + lockout + stamp revocation</div></div>
  <div className="kpi"><div className="lbl">Migrations</div><div className="v">45</div><div className="d">zero manual schema changes in prod</div></div>
  <div className="kpi"><div className="lbl">Controllers</div><div className="v">27</div><div className="d">articles · images · newsletter · pitches · more</div></div>
  <div className="kpi"><div className="lbl">Commits</div><div className="v">220</div><div className="d">Jan → May 2026</div></div>
</div>

---

## before / after

<div className="diff">
  <div className="before">
    <h4>before</h4>
    <dl>
      <dt>brand fit</dt><dd>theme constraints, perpetual overrides</dd>
      <dt>image handling</dt><dd>auto-centered, no focal control</dd>
      <dt>hero layouts</dt><dd>1 (whatever the theme does)</dd>
      <dt>pitch workflow</dt><dd>email thread + spreadsheet</dd>
      <dt>newsletter</dt><dd>third-party, separate login</dd>
      <dt>audit trail</dt><dd>none</dd>
      <dt>2FA</dt><dd>optional, platform-dependent</dd>
    </dl>
  </div>
  <div className="after">
    <h4>after</h4>
    <dl>
      <dt>brand fit</dt><dd>total — fonts, spacing, colour, motion owned</dd>
      <dt>image handling</dt><dd>drag-to-focal, coordinate stored per image</dd>
      <dt>hero layouts</dt><dd>4, chosen per article in the editor</dd>
      <dt>pitch workflow</dt><dd>inbox → draft → publish in one UI</dd>
      <dt>newsletter</dt><dd>in-house broadcasts via Resend, same admin</dd>
      <dt>audit trail</dt><dd>append-only log, every admin action</dd>
      <dt>2FA</dt><dd>TOTP enforced, no bypass</dd>
    </dl>
  </div>
</div>

---

## what i'd do differently

**Newsletter and pitch inbox were retrofitted.** I built them late in the project, which meant retrofitting the domain model. Both should have been in the schema from week one — the access patterns were predictable.

**One Next.js app for both admin and reader.** The admin is a single Next.js app sharing the reader's routing. It works, but the admin and reader have meaningfully different caching and auth needs. I'd separate them into distinct Next.js apps behind the same reverse proxy next time — cleaner cache boundaries, simpler middleware.

**Integration tests after launch.** I delayed writing integration tests until after launch. The FluentValidation rules are correct, but I had to verify that by reading code rather than running tests. Three edge cases in the image pipeline would have been caught earlier.

---

## what shipped

- A .NET 10 API (27 controllers, 45 migrations, TOTP 2FA, audit log) running in Docker on a Linux VM.
- A Next.js 16 reader site — six editorial categories, four hero layouts, focal-point images, article TOC, sitemap, structured SEO fields.
- A bespoke admin panel: article editor (TinyMCE), image manager, pitch inbox, newsletter broadcasts, social links, redirects, tags, site settings, user management, analytics dashboard.
- A deployment stack: single multi-target Dockerfile, docker-compose for the full environment, automatic migration on startup.

> "We finally have a site that looks like us."
>
> — editor, launch day
`.trim();

async function main() {
  const row = {
    slug:      'streetbrat',
    title:     'Streetbrat',
    year:      2026,
    kind:      'platform',
    stack:     ['.NET 10', 'PostgreSQL', 'Next.js 16', 'AWS S3', 'Docker'],
    stars:     0,
    sortOrder: -1,
    tagline:   'built the entire editorial stack for a culture publication from scratch',
    desc:      'CMS, image pipeline, newsletter, and auth — shipped in four months, solo.',
    body:      BODY,
    published: true,
  };

  await db.insert(projects).values(row)
    .onConflictDoUpdate({ target: projects.slug, set: row });

  console.log('Done — streetbrat upserted.');
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
