import React from 'react';

export function Arch({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', margin: '18px 0' }}>
      {children}
    </div>
  );
}

export function Lane({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #2a2b27', padding: '14px 16px' }}>
      <span style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5d5e57', marginBottom: 10 }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {children}
      </div>
    </div>
  );
}

export function Node({ accent, dim, children }: { accent?: boolean; dim?: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      border: `1px solid ${accent ? '#e8a13a' : '#2a2b27'}`,
      padding: '6px 12px',
      fontSize: 13,
      color: accent ? '#e8a13a' : dim ? '#5d5e57' : '#d4d3cc',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </div>
  );
}

export function Arrow({ left }: { left?: boolean }) {
  return <span style={{ color: '#5d5e57' }}>{left ? '←' : '→'}</span>;
}
