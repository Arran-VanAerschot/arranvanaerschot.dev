'use client';

import { useState, useEffect, useCallback, useRef, CSSProperties } from 'react';
import Link from 'next/link';
import { T_THEMES, T_FONTS, T_DENSITY, useIsMobile, useVisibleInterval } from './components';
import { useContent } from './content-context';
import { HeroSection, ProjectsSection, ExperienceSection, StackSection, NowSection, ContactSection } from './sections';
import { TerminalPrompt } from './prompt';
import type { TweakValues, SetTweak } from './types';

const DEFAULTS: TweakValues = {
  theme: 'amber',
  font: 'jetbrains',
  density: 'comfy',
  fontSize: 13,
  boot: true,
  crt: true,
  crtIntensity: 0.6,
  noise: true,
  ascii: true,
  banner: true,
  projectsVariant: 'table',
  animation: 2,
};

const bootLines = (handle: string) => [
  { d: 60,  ok: 'OK', text: `Loading kernel … linux 6.7.4-${handle.split('@')[0]}-portfolio`, info: false },
  { d: 90,  ok: 'OK', text: `Mounting /etc/identity … ${handle}`,                             info: true  },
  { d: 80,  ok: 'OK', text: 'Started resume.service',                                         info: true  },
  { d: 100, ok: 'OK', text: 'Started projects.target · 8 unit(s)',                            info: true  },
  { d: 80,  ok: 'OK', text: 'Started experience.timer',                                        info: true  },
  { d: 70,  ok: 'OK', text: 'Started stack.htop · 12 procs',                                  info: true  },
  { d: 70,  ok: 'OK', text: 'Started now.stream',                                             info: true  },
  { d: 50,  ok: 'OK', text: 'Started contact.daemon',                                         info: true  },
  { d: 90,  ok: '··', text: 'Reaching recruiters.local … welcome',                            info: false },
];

function BootSequence({ skip, onDone }: { skip: boolean; onDone: () => void }) {
  const { identity } = useContent();
  const BOOT_LINES = bootLines(identity.handle);
  const [step, setStep] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (skip) { doneRef.current(); return; }
    if (step >= BOOT_LINES.length) {
      const t = setTimeout(() => doneRef.current(), 220);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), BOOT_LINES[Math.min(step, BOOT_LINES.length - 1)].d);
    return () => clearTimeout(t);
  }, [step, skip]);

  if (skip) return null;
  return (
    <div style={{ padding: '22px 16px 4px', fontSize: 13 }}>
      <div style={{ color: 'var(--t-dim)', marginBottom: 8 }}>booting {identity.handle} · press any key to skip</div>
      {BOOT_LINES.slice(0, step).map((l, k) => (
        <div key={k} style={{ display: 'flex', gap: 14, alignItems: 'baseline', padding: '2px 0', lineHeight: 1.4 }}>
          <span style={{ color: l.ok === 'OK' ? 'var(--t-ok)' : 'var(--t-accent)', width: 50, flexShrink: 0 }}>
            [ {l.ok} ]
          </span>
          <span style={{ flex: 1, minWidth: 0, color: l.info ? 'var(--t-info)' : 'inherit' }}>{l.text}</span>
        </div>
      ))}
    </div>
  );
}

function StatusBarTop() {
  const { identity } = useContent();
  const mobile = useIsMobile();
  const [time, setTime] = useState(() =>
    new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
  );
  useVisibleInterval(() => {
    setTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
  }, 1000);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '8px 14px',
      borderBottom: '1px solid var(--t-border)',
      background: 'color-mix(in oklab, var(--t-bg) 80%, #000 8%)',
      fontSize: 12, height: 36, boxSizing: 'border-box',
      position: 'sticky', top: 0, zIndex: 31,
    }}>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'color-mix(in oklab, var(--t-warn) 70%, transparent)' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'color-mix(in oklab, var(--t-accent) 70%, transparent)' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'color-mix(in oklab, var(--t-ok) 70%, transparent)' }} />
      </div>
      {!mobile && (
        <div style={{ flex: 1, textAlign: 'center', color: 'var(--t-dim)' }}>
          {identity.handle} ~ /portfolio · zsh ·{' '}
          <span style={{ color: 'var(--t-accent)' }}>v3.1.4</span>
        </div>
      )}
      <div style={{ flex: mobile ? 1 : undefined, textAlign: mobile ? 'right' : undefined, color: 'var(--t-dim)' }}>{time}</div>
    </div>
  );
}

function StatusBarBottom({ section }: { section: string }) {
  const mobile = useIsMobile();
  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, height: 28,
      background: 'var(--t-accent)', color: 'var(--t-bg)',
      display: 'flex', alignItems: 'center', padding: '0 14px',
      fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase',
      zIndex: 40, fontWeight: 600,
    }}>
      <span style={{ background: 'var(--t-bg)', color: 'var(--t-accent)', padding: '2px 8px', marginRight: 12 }}>NORMAL</span>
      <span>{section}</span>
      <span style={{ flex: 1 }} />
      {!mobile && (
        <>
          <span>main ↑0 · ↓0 · clean</span>
          <span style={{ marginLeft: 20 }}>utf-8</span>
          <span style={{ marginLeft: 20 }}>{new Date().getFullYear()}</span>
        </>
      )}
    </div>
  );
}

const SECTION_IDS = ['sec-hero', 'sec-projects', 'sec-experience', 'sec-stack', 'sec-now', 'sec-contact'];
const SECTION_LABELS: Record<string, string> = {
  'sec-hero':       '~/hero',
  'sec-projects':   '~/projects',
  'sec-experience': '~/experience',
  'sec-stack':      '~/stack',
  'sec-now':        '~/now',
  'sec-contact':    '~/contact',
};

const STORAGE_KEY = 'terminal-tweaks';

export default function TerminalApp() {
  const mobile = useIsMobile();
  const [t, setValues] = useState<TweakValues>(() => {
    if (typeof window === 'undefined') return DEFAULTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });
  const [booted, setBooted] = useState(false);
  const [bootKey, setBootKey] = useState(0);
  const [section, setSection] = useState('~/hero');

  const setTweak: SetTweak = useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits as string]: val };
    setValues((prev) => ({ ...prev, ...edits }));
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); } catch { /* ignore */ }
  }, [t]);

  useEffect(() => {
    if (!t.boot) setBooted(true);
  }, [t.boot, bootKey]);

  useEffect(() => {
    if (booted) return;
    const skip = () => setBooted(true);
    window.addEventListener('keydown', skip, { once: true });
    return () => window.removeEventListener('keydown', skip);
  }, [booted]);

  useEffect(() => {
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        });
        let active = SECTION_IDS[0];
        for (const id of SECTION_IDS) {
          if (visible.has(id)) active = id;
        }
        setSection(SECTION_LABELS[active] || '~/hero');
      },
      { rootMargin: '-80px 0px -20% 0px', threshold: 0 },
    );
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const theme = T_THEMES[t.theme] || T_THEMES.amber;
  const fontStack = T_FONTS[t.font] || T_FONTS.jetbrains;
  const d = T_DENSITY[t.density] || T_DENSITY.comfy;

  const reboot = () => { setBooted(false); setBootKey((k) => k + 1); };

  const rootStyle: CSSProperties = {
    minHeight: '100vh',
    background: theme.bg,
    color: theme.fg,
    fontFamily: fontStack,
    fontSize: t.fontSize || d.font,
    lineHeight: d.line,
    paddingBottom: 60,
    ['--t-bg' as string]: theme.bg,
    ['--t-fg' as string]: theme.fg,
    ['--t-dim' as string]: theme.dim,
    ['--t-border' as string]: theme.border,
    ['--t-accent' as string]: theme.accent,
    ['--t-bar' as string]: theme.bar,
    ['--t-ok' as string]: theme.ok,
    ['--t-info' as string]: theme.info,
    ['--t-warn' as string]: theme.warn,
    ['--t-row' as string]: d.row + 'px',
    ['--t-sec' as string]: d.sec + 'px',
  };

  return (
    <div style={rootStyle} className={`t-app anim-${t.animation}`}>
      <StatusBarTop />

      <div style={{
        display: 'flex', borderBottom: '1px solid var(--t-border)',
        padding: '0 14px', background: 'color-mix(in oklab, var(--t-bg) 90%, #000 5%)',
        fontSize: 12, height: 30, alignItems: 'stretch',
      }}>
        {([
          { label: '~/portfolio', href: '/',       active: true  },
          { label: '~/notes',     href: '/notes',  active: false },
        ] as const).map(({ label, href, active }) => (
          <Link key={label} href={href} style={{
            padding: '0 14px', display: 'flex', alignItems: 'center',
            borderBottom: '2px solid ' + (active ? 'var(--t-accent)' : 'transparent'),
            color: active ? 'var(--t-accent)' : 'var(--t-dim)',
            textDecoration: 'none',
          }}>{label}</Link>
        ))}
        <div style={{ flex: 1 }} />
        {!mobile && <div style={{ display: 'flex', alignItems: 'center', color: 'var(--t-dim)' }}>uptime 14d · 0 alerts · main ↑0</div>}
      </div>

      <TerminalPrompt setTweak={setTweak} reboot={reboot} />

      {!booted ? (
        <BootSequence key={bootKey} skip={!t.boot} onDone={() => setBooted(true)} />
      ) : (
        <div className="boot-fade" style={{ padding: '14px 16px 80px' }}>
          <HeroSection ascii={t.ascii} banner={t.banner} />
          <ProjectsSection variant={t.projectsVariant} />
          <ExperienceSection />
          <StackSection />
          <NowSection />
          <ContactSection />

          <div style={{
            marginTop: 'var(--t-sec)', borderTop: '1px solid var(--t-border)',
            paddingTop: 18, display: 'flex', justifyContent: 'space-between',
            color: 'var(--t-dim)', fontSize: 11,
          }}>
            <span>© 2026 ava · v3.1.4 · build {new Date().toISOString().slice(0, 10)}</span>
            <span>set in {t.font} · theme {t.theme} · density {t.density}</span>
          </div>
        </div>
      )}

      <StatusBarBottom section={section} />

      {t.crt && (
        <div className="crt-overlay" style={{ ['--crt-intensity' as string]: 0.025 + t.crtIntensity * 0.05 }} />
      )}
      {t.noise && <div className="noise-overlay" />}
    </div>
  );
}
