import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#0c0d0e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          fontSize: 72,
          fontWeight: 700,
          color: '#e8a13a',
          letterSpacing: '-2px',
        }}
      >
        {'> _'}
      </div>
    ),
    { ...size },
  );
}
