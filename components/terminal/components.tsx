'use client';

import { useEffect, useState, ReactNode, CSSProperties } from 'react';
import type { Theme, Density } from './types';

export const T_THEMES: Record<string, Theme> = {
  amber:   { bg: '#0c0d0e', fg: '#d4d3cc', dim: '#5d5e57', border: '#2a2b27', accent: '#e8a13a', ok: '#7eb87e', info: '#6ab0b3', warn: '#c97b9d' },
  green:   { bg: '#06120a', fg: '#c8e6c8', dim: '#4f6b54', border: '#1a3320', accent: '#5dd06a', ok: '#a0e0a0', info: '#6ab0b3', warn: '#e89a5e' },
  cyan:    { bg: '#06121a', fg: '#cbe0e6', dim: '#4d6770', border: '#1a2e36', accent: '#5fc8e0', ok: '#7eb87e', info: '#a0d8e0', warn: '#e89a5e' },
  magenta: { bg: '#0e0a14', fg: '#e0d4e6', dim: '#665270', border: '#28203a', accent: '#d56fa8', ok: '#7eb87e', info: '#9eb8e0', warn: '#e89a5e' },
  paper:   { bg: '#f4f1ea', fg: '#1c1c1a', dim: '#7a7972', border: '#cdc8bd', accent: '#a04e1f', ok: '#3e7b4d', info: '#2a6a7a', warn: '#a04e6e' },
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
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline' }}>
      <span style={{ color: 'var(--t-accent)' }}>arran</span>
      <span style={{ color: 'var(--t-dim)' }}>@</span>
      <span style={{ color: 'var(--t-ok)' }}>ava</span>
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
  return (
    <section id={id} style={{ marginTop: 'var(--t-sec)' }}>
      <Prompt path={path} cmd={cmd} />
      <div style={{
        padding: 'var(--t-row) 0 0 28px',
        borderLeft: '1px solid var(--t-border)',
        marginLeft: 8,
        marginTop: 6,
      }}>
        {children}
      </div>
    </section>
  );
}

// ── BlinkCursor ──────────────────────────────────────────────────────────────

export function BlinkCursor({ ch = '▌' }: { ch?: string }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const i = setInterval(() => setOn((x) => !x), 530);
    return () => clearInterval(i);
  }, []);
  return <span style={{ color: on ? 'var(--t-accent)' : 'transparent', transition: 'color 0.08s' }}>{ch}</span>;
}

// ── Sparkline ────────────────────────────────────────────────────────────────

export function Sparkline({ values, width = 16 }: { values: number[]; width?: number }) {
  const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const max = Math.max(...values, 1);
  const out = values.slice(-width).map((v) => chars[Math.min(7, Math.floor((v / max) * 8))]).join('');
  return <span style={{ fontFamily: 'inherit', color: 'var(--t-accent)', letterSpacing: 0 }}>{out}</span>;
}

// ── CharBar ──────────────────────────────────────────────────────────────────

export function CharBar({ pct, width = 18 }: { pct: number; width?: number }) {
  const filled = Math.round((pct / 100) * width);
  return (
    <span style={{ letterSpacing: 0 }}>
      <span style={{ color: 'var(--t-accent)' }}>{'█'.repeat(filled)}</span>
      <span style={{ color: 'var(--t-border)' }}>{'░'.repeat(width - filled)}</span>
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
