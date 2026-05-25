# arranvanaerschot.dev

My personal portfolio — a terminal-style interface built with Next.js 16, Drizzle ORM, and Neon Postgres. Features a fully interactive terminal emulator, live Spotify now-playing, a CMS-backed admin panel, and MDX notes.

## Stack

- **Framework** — Next.js 16 (App Router, Turbopack)
- **Database** — Neon Postgres via Drizzle ORM
- **Auth** — JWT cookies with bcrypt, brute-force lockout, and security stamp revocation
- **Content** — Admin CMS for projects, experience, skills, and now-items; MDX files for notes
- **Integrations** — Spotify Web API (currently playing), Vercel Analytics, Speed Insights
- **Styling** — Inline styles with CSS custom properties, CRT/noise overlays

## Running locally

**Prerequisites:** Node 20+, a [Neon](https://neon.tech) database

```bash
git clone https://github.com/Arran-VanAerschot/arranvanaerschot.dev
cd arranvanaerschot.dev
npm install
cp .env.example .env.local   # fill in your values
npm run db:push              # apply schema to your database
npm run db:seed              # create the initial admin user
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See [`.env.example`](.env.example) for the full list. Required:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `AUTH_SECRET` | 32-byte hex string for JWT signing |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `SPOTIFY_CLIENT_ID` | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | Spotify app client secret |
| `SPOTIFY_REFRESH_TOKEN` | Spotify refresh token (see below) |

### Getting a Spotify refresh token

1. Create an app at [developer.spotify.com](https://developer.spotify.com/dashboard)
2. Add `https://oauth.pstmn.io/v1/callback` as a redirect URI
3. Authorize: `https://accounts.spotify.com/authorize?client_id=YOUR_ID&response_type=code&redirect_uri=https://oauth.pstmn.io/v1/callback&scope=user-read-currently-playing`
4. Exchange the code: `curl -X POST https://accounts.spotify.com/api/token -d "grant_type=authorization_code&code=CODE&redirect_uri=https://oauth.pstmn.io/v1/callback" -u "CLIENT_ID:CLIENT_SECRET"`
5. Copy the `refresh_token` from the response

## Adding notes

Drop `.mdx` files into `content/notes/`:

```mdx
---
title: My note title
date: 2026-05-25
summary: One-line description shown in the list.
tags: [tag1, tag2]
---

Content here...
```

The filename becomes the URL slug.

## Admin panel

Available at `/admin` — log in with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Manage identity, projects, experience, skills, and now-items from there.

## License

MIT — see [LICENSE](LICENSE).
