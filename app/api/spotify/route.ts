import { NextResponse } from 'next/server';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const CACHE_TTL_MS = 8_000;

// Short-lived server-side cache so rapid client polls don't hammer the Spotify API.
let cache: { data: unknown; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    throw new Error('Spotify env vars are not configured');
  }
  const creds = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: SPOTIFY_REFRESH_TOKEN });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Spotify token error: ${data.error ?? 'no access_token'}`);
  return data.access_token;
}

export async function GET() {
  if (cache && cache.expiresAt > Date.now()) {
    return NextResponse.json(cache.data);
  }

  try {
    const token = await getAccessToken();
    const res = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    let data: unknown;
    if (res.status === 204) {
      data = { isPlaying: false };
    } else if (!res.ok) {
      console.warn(`[spotify] unexpected status ${res.status}`);
      data = { isPlaying: false };
    } else {
      const body = await res.json();
      if (!body.is_playing || body.currently_playing_type !== 'track') {
        data = { isPlaying: false };
      } else {
        data = {
          isPlaying: true,
          title: body.item.name,
          artist: body.item.artists.map((a: { name: string }) => a.name).join(', '),
          url: body.item.external_urls.spotify,
        };
      }
    }

    cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    return NextResponse.json(data, { headers: { 'Cache-Control': `public, max-age=${CACHE_TTL_MS / 1000}` } });
  } catch (err) {
    console.warn('[spotify] fetch failed:', err);
    return NextResponse.json({ isPlaying: false });
  }
}
