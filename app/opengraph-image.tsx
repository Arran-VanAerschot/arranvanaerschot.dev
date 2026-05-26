import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0c0d0e',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#c97b9d' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#e8a13a' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#7eb87e' }} />
        </div>
        <div style={{ fontSize: 18, color: '#5d5e57', marginBottom: 24 }}>
          root@arranvanaerschot ~ portfolio
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, color: '#e8a13a', lineHeight: 1.05, marginBottom: 24 }}>
          Arran VanAerschot
        </div>
        <div style={{ fontSize: 28, color: '#d4d3cc', marginBottom: 16 }}>
          Junior Software Engineer · Brussels
        </div>
        <div style={{ fontSize: 16, color: '#5d5e57' }}>arranvanaerschot.dev</div>
      </div>
    ),
    { ...size },
  );
}
