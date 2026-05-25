'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Prompt, BlinkCursor } from './components';
import { useContent } from './content-context';
import type { Content, OutputLine, HistoryEntry, SetTweak } from './types';

const CMD_HELP: [string, string][] = [
  ['help',              'show this list'],
  ['whoami',            'short bio'],
  ['ls projects',       'list projects'],
  ['ls notes',          'list writing'],
  ['cat <project>',     'read a project blurb · try `cat ledger`'],
  ['cat <note>',        'read a note summary'],
  ['open <project>',    'open case study (if published)'],
  ['open <note>',       'open a note'],
  ['cd <section>',      'jump to section · hero/projects/work/stack/now/contact'],
  ['skills',            'list stack'],
  ['now',               'what i am up to'],
  ['contact',           'how to reach me'],
  ['resume',            'open resume.pdf'],
  ['gh, in, mail',      'open github / linkedin / email'],
  ['theme <name>',      'amber|green|cyan|magenta|paper'],
  ['density <name>',    'compact|comfy|roomy'],
  ['banner',            'reprint the boot banner'],
  ['clear',             'clear scrollback'],
  ['date · uptime · echo', 'the usual suspects'],
  ['sudo …',            "you don't have those powers"],
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
  navigate: (url: string) => void;
  setTweak: SetTweak;
  reboot: () => void;
  clear: () => void;
  content: Content;
}

function scrollTo(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  const y = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top: y, behavior: 'smooth' });
  return true;
}

function interpret(raw: string, ctx: InterpretCtx): OutputLine[] | null {
  const { content } = ctx;
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
      CMD_HELP.forEach(([c, d]) => push('help', `  ${c.padEnd(22)} ${d}`));
      return out;
    }
    case 'whoami': {
      push('out', `${content.identity.name} · ${content.identity.role}`);
      push('out', `${content.identity.loc} · ${content.identity.open}`);
      ctx.go('sec-hero');
      return out;
    }
    case 'ls': {
      if (arg.startsWith('proj')) {
        content.projects.forEach((p) => push('out', `${p.id.padEnd(14)} ${String(p.y).padEnd(6)} ${p.kind.padEnd(10)} ${p.tagline}`));
      } else if (arg === 'notes' || arg.startsWith('notes')) {
        if (content.notes.length === 0) {
          push('dim', 'no notes yet.');
        } else {
          content.notes.forEach((n) => push('out', `${n.slug.padEnd(24)} ${n.date}  ${n.title}`));
        }
      } else {
        push('out', 'about/  projects/  experience/  stack/  now/  contact/  notes/  resume.pdf');
      }
      return out;
    }
    case 'cat': {
      const note = content.notes.find((n) => n.slug === arg);
      if (note) {
        push('info', `── ${note.title} (${note.date}) ──`);
        push('out', note.summary);
        if (note.tags.length) push('dim', `tags: ${note.tags.join(', ')}`);
        push('dim', `→ open ${note.slug}  to read`);
        return out;
      }
      const p = content.projects.find((x) => x.id === arg);
      if (!p) { push('err', `cat: ${arg || '<missing>'}: no such file`); return out; }
      push('info', `── ${p.title.toUpperCase()} (${p.y}) ──`);
      push('out', p.tagline);
      push('out', '');
      push('out', p.desc);
      push('out', '');
      push('dim', `stack: ${p.stack.join(', ')} · ★ ${p.stars}`);
      if (p.published) push('dim', `→ open ${p.id}  to read case study`);
      return out;
    }
    case 'open': {
      const note = content.notes.find((n) => n.slug === arg);
      if (note) {
        push('out', `opening /notes/${note.slug} ...`);
        setTimeout(() => ctx.navigate('/notes/' + note.slug), 150);
        return out;
      }
      const p = content.projects.find((x) => x.id === arg);
      if (!p) { push('err', `open: ${arg || '<missing>'}: no such project or note`); return out; }
      if (!p.published) { push('err', `open: ${arg}: case study not yet published`); return out; }
      push('out', `opening /projects/${arg} ...`);
      setTimeout(() => ctx.navigate('/projects/' + arg), 150);
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
      const url = content.identity.resumeUrl;
      if (!url) { push('out', 'resume.pdf not yet uploaded · check back soon'); return out; }
      push('out', `opening ${url} ...`);
      setTimeout(() => window.open(url, '_blank'), 200);
      return out;
    }
    case 'gh':
    case 'github': { push('out', `→ ${content.identity.github}`); return out; }
    case 'in':
    case 'linkedin': { push('out', `→ ${content.identity.linkedin}`); return out; }
    case 'mail':
    case 'email': {
      push('out', `→ mailto:${content.identity.email}`);
      setTimeout(() => { window.location.href = 'mailto:' + content.identity.email; }, 200);
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
    case 'sudo': { push('err', `${content.identity.handle.split('@')[0]} is not in the sudoers file. This incident will be reported.`); return out; }
    case 'rm': { push('err', 'rm: i am not falling for that one'); return out; }
    case 'man': {
      if (arg === 'arran') {
        push('info', 'ARRAN(1)                  PORTFOLIO MANUAL                  ARRAN(1)');
        push('out', '');
        push('out', 'NAME');
        push('out', `       ${content.identity.name} — ${content.identity.role.toLowerCase()}`);
        push('out', '');
        push('out', 'SYNOPSIS');
        push('out', '       hire(arran) -> ships(quietly)');
        push('out', '');
        push('out', 'DESCRIPTION');
        push('out', '       Writes backend services in .NET. Automates the boring parts.');
        push('out', '       Brings a React UI along when one is needed. Currently in');
        push('out', `       ${content.identity.loc} — ${content.identity.open}.`);
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
  const content = useContent();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [draft, setDraft] = useState('');
  const [stack, setStack] = useState<string[]>([]);
  const [stackIdx, setStackIdx] = useState(-1);
  const [hint, setHint] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Refs to read current state inside the stable global keydown listener
  const stackRef    = useRef(stack);
  const stackIdxRef = useRef(stackIdx);
  const hintRef     = useRef(hint);
  useEffect(() => { stackRef.current    = stack;    }, [stack]);
  useEffect(() => { stackIdxRef.current = stackIdx; }, [stackIdx]);
  useEffect(() => { hintRef.current     = hint;     }, [hint]);

  const ctx = useMemo<InterpretCtx>(() => ({
    go: scrollTo,
    navigate: (url: string) => router.push(url),
    setTweak,
    reboot,
    clear: () => setHistory([]),
    content,
  }), [setTweak, reboot, content, router]);

  // Keep a ref to submit so the global listener can call it without being
  // re-registered on every keystroke (submit changes every time draft changes).
  // Initialized to a stub; synced after submit is defined below.
  const submitRef = useRef<() => void>(() => {});

  useEffect(() => {
    const SKIP_KEYS = new Set([
      'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
      'Tab','CapsLock','NumLock','ScrollLock','Pause','Insert',
      'Home','End','PageUp','PageDown','ContextMenu',
      'Meta','Alt','Control','Shift','Dead','Unidentified',
    ]);

    const handler = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K — always focus + select regardless of where focus is
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }

      // Already in the input — handled by React's onKeyDown
      if (e.target === inputRef.current) return;

      // Don't steal keys from links, buttons, other inputs
      const tag = (e.target as HTMLElement)?.tagName?.toUpperCase() ?? '';
      if (['INPUT','TEXTAREA','SELECT','BUTTON','A'].includes(tag)) return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      // Pass through modifier combos (browser shortcuts)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (SKIP_KEYS.has(e.key)) return;

      e.preventDefault();

      if (e.key === 'Backspace') {
        setDraft((d) => d.slice(0, -1));
      } else if (e.key === 'Enter') {
        submitRef.current();
      } else if (e.key === 'ArrowUp') {
        const next = Math.min(stackRef.current.length - 1, stackIdxRef.current + 1);
        setStackIdx(next);
        if (stackRef.current[next] !== undefined) setDraft(stackRef.current[next]);
      } else if (e.key === 'ArrowDown') {
        const next = Math.max(-1, stackIdxRef.current - 1);
        setStackIdx(next);
        setDraft(next === -1 ? '' : stackRef.current[next]);
      } else if (e.key === 'Tab') {
        if (hintRef.current) {
          setDraft((d) => d + hintRef.current);
          setHint('');
        }
      } else if (e.key === 'Escape') {
        setDraft('');
        setHint('');
      } else if (e.key.length === 1) {
        setDraft((d) => d + e.key);
      }

      inputRef.current?.focus();
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []); // stable — all mutable values accessed through refs

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
      const p = content.projects.find((x) => x.id.startsWith(last) && x.id !== last);
      const n = content.notes.find((x) => x.slug.startsWith(last) && x.slug !== last);
      setHint(p ? p.id.slice(last.length) : n ? n.slug.slice(last.length) : '');
    } else if (head === 'cd') {
      const last = rest.join(' ');
      const keys = Object.keys(SECTION_MAP);
      const m = keys.find((k) => k.startsWith(last) && k !== last);
      setHint(m ? m.slice(last.length) : '');
    } else {
      setHint('');
    }
  }, [draft, content]);

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
  useEffect(() => { submitRef.current = submit; }, [submit]);

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
              caretColor: 'transparent',
            }}
          />
          <span style={{ position: 'absolute', left: `${draft.length}ch`, top: 0, pointerEvents: 'none' }}>
            <BlinkCursor />
          </span>
          {hint && (
            <span style={{
              position: 'absolute', left: `${draft.length + 1}ch`, color: 'var(--t-dim)',
              pointerEvents: 'none', whiteSpace: 'pre',
            }}>{hint}<span style={{ fontSize: 10, marginLeft: 4 }}>[tab]</span></span>
          )}
        </div>
      </form>
    </div>
  );
}
