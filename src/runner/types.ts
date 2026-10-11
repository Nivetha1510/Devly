import type { ReactNode } from 'react';
import { EditorLang } from '../data/editor';

export type RunResult = { ok: boolean; output: string; error?: string };

export type Runner = {
  // Runs Python, JavaScript or SQL code and resolves with what it printed (or the error).
  run: (lang: Exclude<EditorLang, 'html'>, code: string) => Promise<RunResult>;
  // Element that must be mounted somewhere in the screen (a hidden WebView on phones, nothing on web).
  view: ReactNode;
};
