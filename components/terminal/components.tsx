'use client';

import { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react';
import type { Theme, Density } from './types';
import { useContent } from './content-context';

export function useIsMobile(breakpoint = 640): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return mobile;
}

export function useVisibleInterval(callback: () => void, delay: number): void {
  const cbRef = useRef(callback);
  cbRef.current = callback;
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;
    const start = () => { if (id === null) id = setInterval(() => cbRef.current(), delay); };
    const stop = () => { if (id !== null) { clearInterval(id); id = null; } };
    const onVisibility = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => { stop(); document.removeEventListener('visibilitychange', onVisibility); };
  }, [delay]);
}

export const T_THEMES: Record<string, Theme> = {
  amber:   { bg: '#0c0d0e', fg: '#d4d3cc', dim: '#5d5e57', border: '#2a2b27', accent: '#c9943a', bar: '#9a7030', ok: '#84ad84', info: '#6aa6a9', warn: '#c08299' },
  green:   { bg: '#06120a', fg: '#c8e6c8', dim: '#4f6b54', border: '#1a3320', accent: '#5cbf66', bar: '#479a54', ok: '#93cf93', info: '#6aa6a9', warn: '#d89461' },
  cyan:    { bg: '#06121a', fg: '#cbe0e6', dim: '#4d6770', border: '#1a2e36', accent: '#5cb8cf', bar: '#458b9e', ok: '#84ad84', info: '#94c9d4', warn: '#d89461' },
  magenta: { bg: '#0e0a14', fg: '#e0d4e6', dim: '#665270', border: '#28203a', accent: '#c66f9c', bar: '#9a5478', ok: '#84ad84', info: '#94abd4', warn: '#d89461' },
  paper:   { bg: '#f4f1ea', fg: '#1c1c1a', dim: '#7a7972', border: '#cdc8bd', accent: '#9a5226', bar: '#b07b50', ok: '#3e7b4d', info: '#2a6a7a', warn: '#a04e6e' },
};

export const T_FONTS: Record<string, string> = {
  jetbrains: 'var(--font-jetbrains), ui-monospace, monospace',
  plex:      'var(--font-plex), ui-monospace, monospace',
  geist:     'var(--font-geist-mono), ui-monospace, monospace',
  ibmvga:    'var(--font-vt323), "IBM Plex Mono", monospace',
};

export const T_DENSITY: Record<string, Density> = {
  compact: { row: 6,  sec: 24, font: 12, line: 1.45 },
  comfy:   { row: 9,  sec: 32, font: 13, line: 1.55 },
  roomy:   { row: 12, sec: 44, font: 14, line: 1.65 },
};

// ── Prompt line ──────────────────────────────────────────────────────────────

interface PromptProps {
  path?: string;
  cmd?: string;
  dim?: boolean;
  children?: ReactNode;
}

export function Prompt({ path = '~', cmd, dim, children }: PromptProps) {
  const { identity } = useContent();
  const [user, host] = identity.handle.split('@');
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline' }}>
      <span style={{ color: 'var(--t-accent)' }}>{user}</span>
      <span style={{ color: 'var(--t-dim)' }}>@</span>
      <span style={{ color: 'var(--t-ok)' }}>{host}</span>
      <span style={{ color: 'var(--t-dim)' }}>:</span>
      <span style={{ color: 'var(--t-info)' }}>{path}</span>
      <span style={{ color: 'var(--t-dim)' }}>$&nbsp;</span>
      {cmd && <span style={{ color: dim ? 'var(--t-dim)' : 'var(--t-fg)' }}>{cmd}</span>}
      {children}
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────

interface SectionProps {
  id: string;
  cmd: string;
  path?: string;
  label: string;
  children: ReactNode;
}

export function Section({ id, cmd, path = '~', children }: SectionProps) {
  const mobile = useIsMobile();
  return (
    <section id={id} style={{ marginTop: 'var(--t-sec)' }}>
      <Prompt path={path} cmd={cmd} />
      <div style={{
        padding: mobile ? 'var(--t-row) 0 0 12px' : 'var(--t-row) 0 0 28px',
        borderLeft: '1px solid var(--t-border)',
        marginLeft: mobile ? 0 : 8,
        marginTop: 6,
      }}>
        {children}
      </div>
    </section>
  );
}

// ── BlinkCursor ──────────────────────────────────────────────────────────────

export function BlinkCursor({ ch = '▏' }: { ch?: string }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const i = setInterval(() => setOn((x) => !x), 530);
    return () => clearInterval(i);
  }, []);
  return <span style={{ color: on ? 'var(--t-accent)' : 'transparent', transition: 'color 0.08s' }}>{ch}</span>;
}

// ── Oscilloscope ─────────────────────────────────────────────────────────────

export function Oscilloscope({ values, width = 120, height = 22 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) {
    return <span style={{ display: 'inline-block', width, height }} />;
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pad = 2;
  const n = values.length;

  const pts = values.map((v, i) => {
    const x = (i / (n - 1)) * width;
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });

  // smooth the trace with quadratic midpoints
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const xc = (x0 + x1) / 2;
    const yc = (y0 + y1) / 2;
    d += ` Q${x0.toFixed(1)},${y0.toFixed(1)} ${xc.toFixed(1)},${yc.toFixed(1)}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  d += ` L${lx.toFixed(1)},${ly.toFixed(1)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', overflow: 'visible', verticalAlign: 'middle' }}
      preserveAspectRatio="none"
    >
      <line x1={0} y1={height / 2} x2={width} y2={height / 2}
        stroke="var(--t-border)" strokeWidth={0.5} strokeDasharray="2 3" opacity={0.6} />
      <path d={d} fill="none" stroke="var(--t-accent)" strokeWidth={1.4}
        strokeLinejoin="round" strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 2.5px var(--t-accent))' }} />
      <circle cx={lx} cy={ly} r={1.8} fill="var(--t-accent)"
        style={{ filter: 'drop-shadow(0 0 3px var(--t-accent))' }} />
    </svg>
  );
}

// ── CharBar ──────────────────────────────────────────────────────────────────

export function CharBar({ pct, width = 18 }: { pct: number; width?: number }) {
  const filled = Math.max(0, Math.min(width, Math.round((pct / 100) * width)));
  const tip = filled > 0 ? 1 : 0;
  return (
    <span style={{ letterSpacing: '2px' }}>
      <span style={{ color: 'var(--t-bar)' }}>{'▰'.repeat(filled - tip)}</span>
      {tip > 0 && <span style={{ color: 'var(--t-accent)' }}>{'▰'}</span>}
      <span style={{ color: 'color-mix(in oklab, var(--t-border) 70%, var(--t-bg))' }}>{'▱'.repeat(width - filled)}</span>
    </span>
  );
}

// ── BoxFrame ─────────────────────────────────────────────────────────────────

interface BoxFrameProps {
  title?: string;
  glow?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}

export function BoxFrame({ title, glow, children, style }: BoxFrameProps) {
  return (
    <div style={{
      border: '1px solid var(--t-border)',
      padding: '10px 14px',
      position: 'relative',
      background: 'color-mix(in oklab, var(--t-bg) 88%, var(--t-fg) 4%)',
      boxShadow: glow ? '0 0 0 1px var(--t-accent), 0 0 12px color-mix(in oklab, var(--t-accent) 60%, transparent)' : 'none',
      ...style,
    }}>
      {title && (
        <div style={{
          position: 'absolute', top: -8, left: 10, padding: '0 6px',
          background: 'var(--t-bg)', fontSize: 11, letterSpacing: '0.08em',
          color: 'var(--t-dim)', textTransform: 'uppercase',
        }}>{title}</div>
      )}
      {children}
    </div>
  );
}
