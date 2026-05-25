import { NextResponse } from 'next/server';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';

async function getAccessToken(): Promise<string> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  const creds = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${SPOTIFY_REFRESH_TOKEN}`,
  });
  const data = await res.json();
  return data.access_token;
}

export async function GET() {
  try {
    const token = await getAccessToken();
    const res = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 30 },
    });

    if (res.status === 204 || res.status > 400) {
      return NextResponse.json({ isPlaying: false });
    }

    const data = await res.json();
    if (!data.is_playing || data.currently_playing_type !== 'track') {
      return NextResponse.json({ isPlaying: false });
    }

    return NextResponse.json({
      isPlaying: true,
      title: data.item.name,
      artist: data.item.artists.map((a: { name: string }) => a.name).join(', '),
      url: data.item.external_urls.spotify,
    });
  } catch {
    return NextResponse.json({ isPlaying: false });
  }
}
