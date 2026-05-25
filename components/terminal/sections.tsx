'use client';

import { useState, useEffect, useRef } from 'react';
import { Section, BlinkCursor, Sparkline, CharBar, BoxFrame, useIsMobile } from './components';
import { useContent } from './content-context';
import type { ContentProject } from './types';

// ── Hero ─────────────────────────────────────────────────────────────────────

export function HeroSection({ banner, ascii: _ascii }: { banner: boolean; ascii?: boolean }) {
  const { identity } = useContent();
  const mobile = useIsMobile();
  return (
    <Section id="sec-hero" label="01 Hero" path="~" cmd="whoami --verbose">
      <div>
        <h1 style={{ margin: 0, fontWeight: 500, letterSpacing: '-0.01em', fontSize: 'clamp(28px, 3.6vw, 44px)', lineHeight: 1.05 }}>
          {identity.role.split('·').map((part, i) => (
            <span key={i}>
              {i > 0 && <><br /><span style={{ color: 'var(--t-fg)' }}>+ </span></>}
              <span style={{ color: i === 0 ? 'var(--t-accent)' : 'var(--t-fg)' }}>{part.trim().toLowerCase()}</span>
            </span>
          ))}
        </h1>
        <p style={{ marginTop: 18, maxWidth: 640, color: 'color-mix(in oklab, var(--t-fg) 78%, var(--t-bg))', lineHeight: 1.6 }}>
          {identity.bio}
        </p>
        <div style={{ marginTop: 22, display: 'flex', gap: 22, flexWrap: 'wrap', fontSize: 13 }}>
          {[
            ['cat', 'resume.pdf'],
            ['ssh', identity.email],
            ['gh', 'follow Arran-VanAerschot'],
          ].map(([c, t], i) => (
            <span key={i} style={{ whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--t-dim)' }}>$ </span>
              <span style={{ color: 'var(--t-accent)' }}>{c}</span>
              <span> {t}</span>
            </span>
          ))}
        </div>
        {banner && identity.stats.length > 0 && (
          <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
            {identity.stats.map((s) => (
              <BoxFrame key={s.k} title={s.k}>
                <div style={{ fontSize: 28, color: 'var(--t-accent)' }}>{s.v}</div>
                <div style={{ fontSize: 11, color: 'var(--t-dim)' }}>{s.d}</div>
              </BoxFrame>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

// ── Projects ─────────────────────────────────────────────────────────────────

type SortKey = 'id' | 'kind' | 'y' | 'stars';

export function ProjectsSection({ variant }: { variant: string }) {
  const { projects } = useContent();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('y');
  const [dir, setDir] = useState<1 | -1>(-1);

  const filtered = projects.filter((p) =>
    !query
    || p.id.includes(query.toLowerCase())
    || p.stack.join(',').includes(query.toLowerCase())
    || p.kind.includes(query.toLowerCase())
    || p.tagline.toLowerCase().includes(query.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sort], bv = b[sort];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });

  const toggle = (col: SortKey) => {
    if (sort === col) setDir((d) => d > 0 ? -1 : 1);
    else { setSort(col); setDir(1); }
  };
  const arrow = (col: SortKey) => sort === col ? (dir > 0 ? ' ↑' : ' ↓') : '';

  return (
    <Section id="sec-projects" label="02 Projects" path="~/projects" cmd={`ls -la | grep --color '${query || ''}'`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', border: '1px solid var(--t-border)', marginBottom: 12, background: 'color-mix(in oklab, var(--t-bg) 90%, transparent)' }}>
        <span style={{ color: 'var(--t-accent)' }}>⌕</span>
        <span style={{ color: 'var(--t-dim)' }}>filter:</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="try `csharp`, `cli`, `2025`…"
          spellCheck={false}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--t-fg)', font: 'inherit' }}
        />
        <span style={{ color: 'var(--t-dim)', fontSize: 11 }}>{filtered.length}/{projects.length}</span>
      </div>

      {variant === 'cards'  ? <ProjectsCards  items={sorted} /> :
       variant === 'gitlog' ? <ProjectsGitLog items={sorted} /> :
       <ProjectsTable items={sorted} toggle={toggle} arrow={arrow} />}
    </Section>
  );
}

function ProjectsTable({ items, toggle, arrow }: {
  items: ContentProject[];
  toggle: (col: SortKey) => void;
  arrow: (col: SortKey) => string;
}) {
  const mobile = useIsMobile();
  const grid = '24px 1.1fr 70px 60px 1.6fr 1.8fr 50px';

  if (mobile) {
    return (
      <div>
        {items.map((p, i) => (
          <div key={p.id} className="t-row-hover"
            style={{ padding: '10px 8px', borderBottom: '1px solid color-mix(in oklab, var(--t-border) 50%, transparent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span>
                <span style={{ color: 'var(--t-dim)', fontSize: 11, marginRight: 6 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ color: 'var(--t-accent)' }}>./</span>
                <span style={{ textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: 3, textDecorationColor: 'var(--t-border)' }}>{p.id}</span>
              </span>
              <span style={{ color: 'var(--t-ok)', fontSize: 12 }}>★ {p.stars}</span>
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: 'color-mix(in oklab, var(--t-fg) 80%, var(--t-bg))' }}>{p.tagline}</div>
            <div style={{ marginTop: 4, display: 'flex', gap: 8, fontSize: 11 }}>
              <span style={{ color: 'var(--t-warn)' }}>{p.kind}</span>
              <span style={{ color: 'var(--t-dim)' }}>{p.y}</span>
              <span style={{ color: 'var(--t-info)' }}>{p.stack.join(', ')}</span>
            </div>
          </div>
        ))}
        {items.length === 0 && <div style={{ padding: 14, color: 'var(--t-dim)' }}>no matches.</div>}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: grid, gap: 12, color: 'var(--t-dim)', fontSize: 11, padding: '6px 8px', borderBottom: '1px solid var(--t-border)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        <span>#</span>
        <span onClick={() => toggle('id')} style={{ cursor: 'pointer' }}>name{arrow('id')}</span>
        <span onClick={() => toggle('kind')} style={{ cursor: 'pointer' }}>kind{arrow('kind')}</span>
        <span onClick={() => toggle('y')} style={{ cursor: 'pointer' }}>year{arrow('y')}</span>
        <span>stack</span>
        <span>desc</span>
        <span onClick={() => toggle('stars')} style={{ textAlign: 'right', cursor: 'pointer' }}>★{arrow('stars')}</span>
      </div>
      {items.map((p, i) => (
        <div key={p.id} className="t-row-hover"
          style={{ display: 'grid', gridTemplateColumns: grid, gap: 12, padding: '8px', borderBottom: '1px solid color-mix(in oklab, var(--t-border) 50%, transparent)', alignItems: 'center' }}>
          <span style={{ color: 'var(--t-dim)' }}>{String(i + 1).padStart(2, '0')}</span>
          <span>
            <span style={{ color: 'var(--t-accent)' }}>./</span>
            <span style={{ textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: 3, textDecorationColor: 'var(--t-border)' }}>{p.id}</span>
          </span>
          <span style={{ color: 'var(--t-warn)' }}>{p.kind}</span>
          <span style={{ color: 'var(--t-dim)' }}>{p.y}</span>
          <span style={{ color: 'var(--t-info)', fontSize: 11 }}>{p.stack.join(',')}</span>
          <span style={{ color: 'color-mix(in oklab, var(--t-fg) 80%, var(--t-bg))', fontSize: 12 }}>{p.tagline}</span>
          <span style={{ textAlign: 'right', color: 'var(--t-ok)' }}>{p.stars}</span>
        </div>
      ))}
      {items.length === 0 && <div style={{ padding: 14, color: 'var(--t-dim)' }}>no matches.</div>}
    </div>
  );
}

function ProjectsCards({ items }: { items: ContentProject[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
      {items.map((p) => (
        <BoxFrame key={p.id} title={`${p.kind}/${p.y}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ color: 'var(--t-accent)', fontSize: 18 }}>./{p.id}</div>
            <div style={{ color: 'var(--t-ok)', fontSize: 12 }}>★ {p.stars}</div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'color-mix(in oklab, var(--t-fg) 80%, var(--t-bg))' }}>{p.tagline}</div>
          <div style={{ marginTop: 14, color: 'var(--t-info)', fontSize: 11 }}>{p.stack.join(' · ')}</div>
        </BoxFrame>
      ))}
    </div>
  );
}

function ProjectsGitLog({ items }: { items: ContentProject[] }) {
  return (
    <div>
      {items.map((p) => (
        <div key={p.id} className="t-row-hover"
          style={{ display: 'block', padding: '10px 8px', borderBottom: '1px solid color-mix(in oklab, var(--t-border) 50%, transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--t-accent)', fontSize: 11 }}>{(p.id + p.y).slice(0, 8)}</span>
            <span style={{ color: 'var(--t-dim)' }}>({p.y})</span>
            <span style={{ color: 'var(--t-warn)', fontSize: 11 }}>[{p.kind}]</span>
            <span style={{ color: 'var(--t-fg)' }}>{p.title} — {p.tagline}</span>
            <span style={{ marginLeft: 'auto', color: 'var(--t-ok)' }}>★{p.stars}</span>
          </div>
          <div style={{ paddingLeft: 16, marginTop: 4, fontSize: 11, color: 'var(--t-info)' }}>{p.stack.join(' / ')}</div>
        </div>
      ))}
    </div>
  );
}

// ── Experience ────────────────────────────────────────────────────────────────

export function ExperienceSection() {
  const { experience } = useContent();
  const mobile = useIsMobile();
  return (
    <Section id="sec-experience" label="03 Experience" path="~" cmd="git log --oneline --branch=career">
      <div>
        {experience.map((e, i) => (
          <div key={i} style={{ borderBottom: '1px solid color-mix(in oklab, var(--t-border) 50%, transparent)', padding: '14px 0', display: 'grid', gridTemplateColumns: mobile ? '1fr' : '160px 1fr', gap: mobile ? 8 : 28 }}>
            <div>
              <div style={{ color: 'var(--t-accent)', fontSize: 12 }}>{e.when}</div>
              <div style={{ color: 'var(--t-dim)', fontSize: 11, marginTop: 4 }}>{e.loc}</div>
            </div>
            <div>
              <div style={{ color: 'var(--t-fg)' }}>
                <span style={{ color: 'var(--t-info)' }}>{e.role}</span>{' '}
                <span style={{ color: 'var(--t-dim)' }}>@</span>{' '}
                {e.co}
              </div>
              <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
                {e.bullets.map((b, j) => (
                  <li key={j} style={{ paddingLeft: 16, position: 'relative', color: 'color-mix(in oklab, var(--t-fg) 80%, var(--t-bg))', fontSize: 12, marginTop: 4 }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--t-dim)' }}>›</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Stack / Skills ────────────────────────────────────────────────────────────

export function StackSection() {
  const { skills } = useContent();
  const mobile = useIsMobile();
  const [history, setHistory] = useState<number[][]>(() =>
    skills.map(() => Array.from({ length: 16 }, () => 30 + Math.random() * 60))
  );

  useEffect(() => {
    const i = setInterval(() => {
      setHistory((h) => h.map((arr, idx) => {
        const target = skills[idx]?.cpu ?? 50;
        const next = Math.round(Math.max(2, Math.min(99, target + (Math.random() - 0.5) * 18)));
        return [...arr.slice(1), next];
      }));
    }, 900);
    return () => clearInterval(i);
  }, [skills]);

  return (
    <Section id="sec-stack" label="04 Stack" path="~" cmd="htop --sort cpu">
      {!mobile && (
        <div style={{ display: 'grid', gridTemplateColumns: '120px 180px 200px 1fr', gap: 16, color: 'var(--t-dim)', fontSize: 11, padding: '6px 8px', borderBottom: '1px solid var(--t-border)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>process</span><span>cpu%</span><span>load</span><span>cmd</span>
        </div>
      )}
      {mobile && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, color: 'var(--t-dim)', fontSize: 11, padding: '6px 8px', borderBottom: '1px solid var(--t-border)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>process</span><span>cpu%</span>
        </div>
      )}
      {skills.map((s, i) => (
        mobile ? (
          <div key={s.proc} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '6px 8px', alignItems: 'center', borderBottom: '1px solid color-mix(in oklab, var(--t-border) 40%, transparent)', fontSize: 12 }}>
            <span style={{ color: 'var(--t-info)' }}>{s.proc}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CharBar pct={s.cpu} width={10} />
              <span style={{ color: 'var(--t-dim)', fontSize: 11 }}>{s.cpu}%</span>
            </span>
          </div>
        ) : (
          <div key={s.proc} style={{ display: 'grid', gridTemplateColumns: '120px 180px 200px 1fr', gap: 16, padding: '6px 8px', alignItems: 'center', borderBottom: '1px solid color-mix(in oklab, var(--t-border) 40%, transparent)', fontSize: 12 }}>
            <span style={{ color: 'var(--t-info)' }}>{s.proc}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CharBar pct={s.cpu} width={14} />
              <span style={{ color: 'var(--t-dim)', fontSize: 11 }}>{s.cpu}%</span>
            </span>
            <span><Sparkline values={history[i] ?? []} width={20} /></span>
            <span style={{ color: 'var(--t-dim)' }}>{s.cmd}</span>
          </div>
        )
      ))}
    </Section>
  );
}

// ── Now ───────────────────────────────────────────────────────────────────────

const TAG_COLORS: Record<string, string> = {
  'BUILD': 'var(--t-ok)',
  'READ ': 'var(--t-info)',
  'LEARN': 'var(--t-warn)',
  'OPEN ': 'var(--t-accent)',
  'PLAY ': '#1DB954',
};

type SpotifyState = { isPlaying: false } | { isPlaying: true; title: string; artist: string; url: string };

function useSpotify() {
  const [state, setState] = useState<SpotifyState>({ isPlaying: false });
  const isPlayingRef = useRef(false);
  useEffect(() => {
    let cancelled = false;
    let id: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const res = await fetch('/api/spotify');
        const data: SpotifyState = await res.json();
        if (!cancelled) {
          isPlayingRef.current = data.isPlaying;
          setState(data);
        }
      } catch { /* ignore */ }
      if (!cancelled) id = setTimeout(poll, isPlayingRef.current ? 5000 : 10000);
    }
    poll();
    return () => { cancelled = true; clearTimeout(id); };
  }, []);
  return state;
}

export function NowSection() {
  const { now } = useContent();
  const mobile = useIsMobile();
  const [tick, setTick] = useState(0);
  const spotify = useSpotify();
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 4000);
    return () => clearInterval(i);
  }, []);

  const fmt = (d: Date) => {
    const iso = d.toISOString().replace('T', ' ');
    return mobile ? iso.slice(11, 19) : iso.slice(0, 19);
  };

  return (
    <Section id="sec-now" label="05 Now" path="~" cmd="tail -f ~/now.log">
      {now.map((n, i) => {
        const ts = fmt(new Date(Date.now() - (now.length - i) * 60000 - tick * 1000));
        return (
          <div key={i} style={{ padding: '4px 0', fontSize: 13 }}>
            <span style={{ color: 'var(--t-dim)' }}>{ts}</span>{' '}
            <span style={{ color: TAG_COLORS[n.tag] || 'var(--t-fg)' }}>[{n.tag}]</span>{' '}
            <span>{n.text}</span>
          </div>
        );
      })}
      {spotify.isPlaying && (
        <div style={{ padding: '4px 0', fontSize: 13 }}>
          <span style={{ color: 'var(--t-dim)' }}>{fmt(new Date(Date.now() - tick * 1000))}</span>{' '}
          <span style={{ color: '#1DB954' }}>[PLAY ]</span>{' '}
          <a href={spotify.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--t-fg)', textDecoration: 'none' }}>
            {spotify.title} <span style={{ color: 'var(--t-dim)' }}>— {spotify.artist}</span>
          </a>
        </div>
      )}
      <div style={{ padding: '4px 0', color: 'var(--t-dim)' }}>(streaming) <BlinkCursor /></div>
    </Section>
  );
}

// ── Contact ───────────────────────────────────────────────────────────────────

export function ContactSection() {
  const { identity } = useContent();
  const mobile = useIsMobile();
  return (
    <Section id="sec-contact" label="06 Contact" path="~" cmd="cat contact.txt">
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ color: 'var(--t-accent)', fontSize: 22, marginBottom: 12 }}>say hello.</div>
          <div style={{ color: 'color-mix(in oklab, var(--t-fg) 78%, var(--t-bg))', maxWidth: 480, lineHeight: 1.6 }}>
            best reached by email or linkedin — i reply within a day. open for contract or perm work from
            <span style={{ color: 'var(--t-accent)' }}> Q3 2026</span>. remote EU or Brussels.
          </div>
          <div style={{ marginTop: 18 }}>
            <a href={`mailto:${identity.email}`} style={{ color: 'var(--t-accent)', fontSize: 14, textDecoration: 'underline', textUnderlineOffset: 4 }}>
              {identity.email}
            </a>
          </div>
        </div>
        <div>
          <BoxFrame title="LINKS">
            {([
              ['github',     identity.github,   '↗', identity.github   || null],
              ['linkedin',   identity.linkedin, '↗', identity.linkedin || null],

              ...(identity.resumeUrl ? [['resume.pdf', 'download', '↓', identity.resumeUrl]] : []),
            ] as [string, string, string, string | null][]).map(([k, v, a, href]) => {
              const slug = v.replace(/^https?:\/\//, '').split('/').filter(Boolean).pop() ?? v;
              return (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderBottom: '1px solid color-mix(in oklab, var(--t-border) 40%, transparent)', fontSize: 13 }}>
                  <span style={{ color: 'var(--t-dim)', flexShrink: 0 }}>{k}</span>
                  {href
                    ? <a href={href} target="_blank" rel="noopener noreferrer">{slug} <span style={{ color: 'var(--t-accent)' }}>{a}</span></a>
                    : <span>{slug} <span style={{ color: 'var(--t-accent)' }}>{a}</span></span>}
                </div>
              );
            })}
          </BoxFrame>
        </div>
      </div>
    </Section>
  );
}
