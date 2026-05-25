import type { Content } from '@/lib/content';
import type { NoteMetadata } from '@/lib/notes';

export type { Content, NoteMetadata };

export interface Theme {
  bg: string; fg: string; dim: string; border: string;
  accent: string; ok: string; info: string; warn: string;
}

export interface Density {
  row: number; sec: number; font: number; line: number;
}
export type ContentProject    = Content['projects'][number];
export type ContentExperience = Content['experience'][number];
export type ContentSkill      = Content['skills'][number];
export type ContentNow        = Content['now'][number];
export type ContentIdentity   = Content['identity'];

export interface TweakValues {
  theme: string;
  font: string;
  density: string;
  fontSize: number;
  boot: boolean;
  crt: boolean;
  crtIntensity: number;
  noise: boolean;
  ascii: boolean;
  banner: boolean;
  projectsVariant: string;
  animation: number;
}

export type SetTweak = (keyOrEdits: string | Partial<TweakValues>, val?: unknown) => void;

export interface OutputLine {
  kind: 'err' | 'ok' | 'info' | 'dim' | 'out' | 'help';
  text: string;
}

export interface HistoryEntry {
  cmd: string;
  results: OutputLine[];
}
