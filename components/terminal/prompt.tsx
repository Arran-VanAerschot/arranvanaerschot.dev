'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Prompt, BlinkCursor } from './components';
import { TD } from './data';
import type { OutputLine, HistoryEntry, SetTweak } from './types';

const CMD_HELP: [string, string][] = [
  ['help',           'show this list'],
  ['whoami',         'short bio'],
  ['ls projects',    'list projects'],
  ['cat <project>',  'read a project blurb · try `cat ledger`'],
  ['cd <section>',   'jump to section · hero/projects/work/stack/now/contact'],
  ['skills',         'list stack'],
  ['now',            'what i am up to'],
  ['contact',        'how to reach me'],
  ['resume',         'open resume.pdf'],
  ['gh, in, mail',   'open github / linkedin / email'],
  ['theme <name>',   'amber|green|cyan|magenta|paper'],
  ['density <name>', 'compact|comfy|roomy'],
  ['banner',         'reprint the boot banner'],
  ['clear',          'clear scrollback'],
  ['date · uptime · echo', 'the usual suspects'],
  ['sudo …',         "you don't have those powers"],
];

const SECTION_MAP: Record<string, string> = {
  hero: 'sec-hero', whoami: 'sec-hero', '~': 'sec-hero',
  projects: 'sec-projects', work: 'sec-experience', experience: 'sec-experience',
  stack: 'sec-stack', skills: 'sec-stack',
  now: 'sec-now', contact: 'sec-contact',
};

const ALL_CMDS = ['help', 'whoami', 'ls', 'cat', 'open', 'cd', 'skills', 'now', 'contact', 'resume', 'theme', 'density', 'clear', 'date', 'echo', 'man', 'banner'];

interface InterpretCtx {
  go: (id: string) => boolean;
  setTweak: SetTweak;
  reboot: () => void;
  clear: () => void;
}

function scrollTo(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  const y = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top: y, behavior: 'smooth' });
  return true;
}

function interpret(raw: string, ctx: InterpretCtx): OutputLine[] | null {
  const line = raw.trim();
  if (!line) return null;
  const [cmd, ...rest] = line.split(/\s+/);
  const arg = rest.join(' ').toLowerCase();
  const out: OutputLine[] = [];
  const push = (kind: OutputLine['kind'], text: string) => out.push({ kind, text });

  switch (cmd.toLowerCase()) {
    case 'help':
    case '?': {
      push('info', 'AVAILABLE COMMANDS');
      CMD_HELP.forEach(([c, d]) => push('help', `  ${c.padEnd(20)} ${d}`));
      return out;
    }
    case 'whoami': {
      push('out', `${TD.identity.name} · ${TD.identity.role}`);
      push('out', `${TD.identity.loc} · ${TD.identity.open}`);
      ctx.go('sec-hero');
      return out;
    }
    case 'ls': {
      if (arg.startsWith('proj')) {
        TD.projects.forEach((p) => push('out', `${p.id.padEnd(12)} ${String(p.y).padEnd(6)} ${p.kind.padEnd(8)} ${p.tagline}`));
      } else {
        push('out', 'about/  projects/  experience/  stack/  now/  contact/  resume.pdf');
      }
      return out;
    }
    case 'cat': {
      const p = TD.projects.find((x) => x.id === arg);
      if (!p) { push('err', `cat: ${arg || '<missing>'}: no such project`); return out; }
      push('info', `── ${p.title.toUpperCase()} (${p.y}) ──`);
      push('out', p.tagline);
      push('out', '');
      push('out', p.desc);
      push('out', '');
      push('dim', `stack: ${p.stack.join(', ')} · ★ ${p.stars}`);
      return out;
    }
    case 'open': {
      push('err', `open: ${arg || '<missing>'}: case studies coming soon`);
      return out;
    }
    case 'cd': {
      const target = SECTION_MAP[arg] || (arg && SECTION_MAP[arg.replace(/^\.\.?\/?/, '')]);
      if (!target) { push('err', `cd: ${arg}: no such directory`); return out; }
      if (!ctx.go(target)) { push('err', `cd: ${arg}: not mounted yet`); return out; }
      return null;
    }
    case 'skills':
    case 'stack': { ctx.go('sec-stack'); return null; }
    case 'now': { ctx.go('sec-now'); return null; }
    case 'contact': { ctx.go('sec-contact'); return null; }
    case 'resume': {
      push('out', 'resume.pdf not yet uploaded · check back soon');
      return out;
    }
    case 'gh':
    case 'github': { push('out', `→ ${TD.identity.github}`); return out; }
    case 'in':
    case 'linkedin': { push('out', `→ ${TD.identity.linkedin}`); return out; }
    case 'mail':
    case 'email': {
      push('out', `→ mailto:${TD.identity.email}`);
      setTimeout(() => { window.location.href = 'mailto:' + TD.identity.email; }, 200);
      return out;
    }
    case 'theme': {
      const themes = ['amber', 'green', 'cyan', 'magenta', 'paper'];
      if (!themes.includes(arg)) { push('err', `theme: ${arg}: unknown · try ${themes.join('|')}`); return out; }
      ctx.setTweak('theme', arg);
      push('ok', `theme set to ${arg}`);
      return out;
    }
    case 'density': {
      const densities = ['compact', 'comfy', 'roomy'];
      if (!densities.includes(arg)) { push('err', `density: ${arg}: unknown · try ${densities.join('|')}`); return out; }
      ctx.setTweak('density', arg);
      push('ok', `density set to ${arg}`);
      return out;
    }
    case 'banner': { ctx.reboot(); return null; }
    case 'clear': { ctx.clear(); return null; }
    case 'date': { push('out', new Date().toString()); return out; }
    case 'uptime': { push('out', `${new Date().toLocaleTimeString()}  up 14 days,  load average: 0.42, 0.39, 0.31`); return out; }
    case 'echo': { push('out', rest.join(' ')); return out; }
    case 'sudo': { push('err', `${TD.identity.handle.split('@')[0]} is not in the sudoers file. This incident will be reported.`); return out; }
    case 'rm': { push('err', 'rm: i am not falling for that one'); return out; }
    case 'man': {
      if (arg === 'arran') {
        push('info', 'ARRAN(1)                  PORTFOLIO MANUAL                  ARRAN(1)');
        push('out', '');
        push('out', 'NAME');
        push('out', '       arran — junior software engineer, automation engineer');
        push('out', '');
        push('out', 'SYNOPSIS');
        push('out', '       hire(arran) -> ships(quietly)');
        push('out', '');
        push('out', 'DESCRIPTION');
        push('out', '       Writes backend services in .NET. Automates the boring parts.');
        push('out', '       Brings a React UI along when one is needed. Currently in');
        push('out', '       Brussels — open Q3 2026, contract or perm, remote EU.');
        push('out', '');
        push('out', 'SEE ALSO');
        push('out', '       projects(1), experience(1), contact(1)');
        return out;
      }
      push('err', `no manual entry for ${arg}`);
      return out;
    }
    case 'vim':
    case 'nvim':
    case 'emacs': { push('err', `${cmd}: pick one. (i pick vim.)`); return out; }
    default: { push('err', `${cmd}: command not found · try \`help\``); return out; }
  }
}

interface TerminalPromptProps {
  setTweak: SetTweak;
  reboot: () => void;
}

export function TerminalPrompt({ setTweak, reboot }: TerminalPromptProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [draft, setDraft] = useState('');
  const [stack, setStack] = useState<string[]>([]);
  const [stackIdx, setStackIdx] = useState(-1);
  const [hint, setHint] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ctx = useMemo<InterpretCtx>(() => ({
    go: scrollTo,
    setTweak,
    reboot,
    clear: () => setHistory([]),
  }), [setTweak, reboot]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  useEffect(() => {
    if (!draft) { setHint(''); return; }
    const [head, ...rest] = draft.split(/\s+/);
    if (rest.length === 0) {
      const m = ALL_CMDS.find((c) => c.startsWith(head) && c !== head);
      setHint(m ? m.slice(head.length) : '');
    } else if (head === 'cat' || head === 'open') {
      const last = rest.join(' ');
      const p = TD.projects.find((x) => x.id.startsWith(last) && x.id !== last);
      setHint(p ? p.id.slice(last.length) : '');
    } else if (head === 'cd') {
      const last = rest.join(' ');
      const keys = Object.keys(SECTION_MAP);
      const m = keys.find((k) => k.startsWith(last) && k !== last);
      setHint(m ? m.slice(last.length) : '');
    } else {
      setHint('');
    }
  }, [draft]);

  const submit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const line = draft;
    setDraft('');
    setStack((s) => [line, ...s].slice(0, 50));
    setStackIdx(-1);
    if (!line.trim()) return;
    const results = interpret(line, ctx);
    setHistory((h) => [...h, { cmd: line, results: results ?? [] }]);
  }, [draft, ctx]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(stack.length - 1, stackIdx + 1);
      setStackIdx(next);
      if (stack[next] !== undefined) setDraft(stack[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(-1, stackIdx - 1);
      setStackIdx(next);
      setDraft(next === -1 ? '' : stack[next]);
    } else if (e.key === 'Tab' && hint) {
      e.preventDefault();
      setDraft((d) => d + hint);
      setHint('');
    } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setHistory([]);
    }
  };

  const kindStyle = (k: OutputLine['kind']): React.CSSProperties => ({
    err:  { color: 'var(--t-warn)' },
    ok:   { color: 'var(--t-ok)' },
    info: { color: 'var(--t-accent)' },
    dim:  { color: 'var(--t-dim)' },
    out:  { color: 'var(--t-fg)' },
    help: { color: 'var(--t-fg)' },
  }[k] ?? { color: 'var(--t-fg)' });

  return (
    <div style={{
      borderTop: '1px solid var(--t-border)',
      borderBottom: '1px solid var(--t-border)',
      background: 'color-mix(in oklab, var(--t-bg) 92%, var(--t-fg) 3%)',
      padding: '10px 16px',
      position: 'sticky', top: 36, zIndex: 30,
    }}>
      <div ref={scrollRef} style={{ maxHeight: 168, overflowY: 'auto', paddingBottom: 6 }}>
        {history.length === 0 && (
          <div style={{ color: 'var(--t-dim)' }}>
            try <span style={{ color: 'var(--t-accent)' }}>help</span>,{' '}
            <span style={{ color: 'var(--t-accent)' }}>ls projects</span>,{' '}
            <span style={{ color: 'var(--t-accent)' }}>cat ledger</span>,{' '}
            <span style={{ color: 'var(--t-accent)' }}>theme green</span>{' '}
            · press <span style={{ background: 'var(--t-border)', padding: '0 6px' }}>⌘K</span> to focus
          </div>
        )}
        {history.map((entry, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <Prompt cmd={entry.cmd} />
            {entry.results.map((r, j) => (
              <div key={j} style={{ whiteSpace: 'pre-wrap', ...kindStyle(r.kind) }}>{r.text}</div>
            ))}
          </div>
        ))}
      </div>

      <form onSubmit={submit} style={{ display: 'flex', alignItems: 'baseline', marginTop: 4 }}>
        <Prompt />
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'baseline' }}>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--t-fg)', fontFamily: 'inherit', fontSize: 'inherit',
              caretColor: 'var(--t-accent)',
            }}
          />
          {hint && (
            <span style={{
              position: 'absolute', left: `${draft.length}ch`, color: 'var(--t-dim)',
              pointerEvents: 'none', whiteSpace: 'pre',
            }}>{hint}<span style={{ fontSize: 10, marginLeft: 4 }}>[tab]</span></span>
          )}
        </div>
        <BlinkCursor />
      </form>
    </div>
  );
}
