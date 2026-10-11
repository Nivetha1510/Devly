// Web version: a hidden, sandboxed iframe hosts the runner page (scripts allowed, nothing else).
import { useCallback, useEffect, useRef } from 'react';
import { RUNNER_HTML } from './runnerHtml';
import { RunResult, Runner } from './types';

export function useRunner(): Runner {
  const frame = useRef<HTMLIFrameElement | null>(null);
  const ready = useRef(false);
  const queue = useRef<unknown[]>([]);
  const waiters = useRef(new Map<number, (r: RunResult) => void>());
  const counter = useRef(0);

  useEffect(() => {
    const el = document.createElement('iframe');
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('sandbox', 'allow-scripts');
    el.style.cssText = 'position:fixed;width:0;height:0;border:0;left:-10px;top:-10px;';
    el.srcdoc = RUNNER_HTML;
    frame.current = el;

    const onMessage = (e: MessageEvent) => {
      if (e.source !== el.contentWindow) return;
      const msg = e.data as { type: string; id?: number; ok?: boolean; output?: string; error?: string };
      if (msg.type === 'ready') {
        ready.current = true;
        queue.current.splice(0).forEach((m) => el.contentWindow?.postMessage(m, '*'));
      } else if (msg.type === 'result' && msg.id !== undefined) {
        const done = waiters.current.get(msg.id);
        waiters.current.delete(msg.id);
        done?.({ ok: !!msg.ok, output: msg.output ?? '', error: msg.error });
      }
    };
    window.addEventListener('message', onMessage);
    document.body.appendChild(el);
    return () => {
      window.removeEventListener('message', onMessage);
      document.body.removeChild(el);
      ready.current = false;
    };
  }, []);

  const run: Runner['run'] = useCallback(
    (lang, code) =>
      new Promise<RunResult>((resolve) => {
        const id = ++counter.current;
        waiters.current.set(id, resolve);
        const msg = { type: 'run', id, lang, code };
        if (ready.current) frame.current?.contentWindow?.postMessage(msg, '*');
        else queue.current.push(msg);
      }),
    [],
  );

  return { run, view: null };
}
