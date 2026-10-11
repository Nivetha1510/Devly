// Native (iOS / Android) version: a hidden WebView hosts the runner page.
import React, { createElement, useCallback, useRef } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { RUNNER_HTML } from './runnerHtml';
import { RunResult, Runner } from './types';

export function useRunner(): Runner {
  const web = useRef<WebView>(null);
  const ready = useRef(false);
  const queue = useRef<string[]>([]);
  const waiters = useRef(new Map<number, (r: RunResult) => void>());
  const counter = useRef(0);

  const flush = useCallback(() => {
    const js = queue.current.splice(0);
    js.forEach((s) => web.current?.injectJavaScript(s));
  }, []);

  const run: Runner['run'] = useCallback(
    (lang, code) =>
      new Promise<RunResult>((resolve) => {
        const id = ++counter.current;
        waiters.current.set(id, resolve);
        const js = `window.__run(${JSON.stringify({ type: 'run', id, lang, code })}); true;`;
        if (ready.current) web.current?.injectJavaScript(js);
        else queue.current.push(js);
      }),
    [],
  );

  const onMessage = useCallback(
    (e: WebViewMessageEvent) => {
      let msg: { type: string; id?: number; ok?: boolean; output?: string; error?: string };
      try {
        msg = JSON.parse(e.nativeEvent.data);
      } catch {
        return;
      }
      if (msg.type === 'ready') {
        ready.current = true;
        flush();
      } else if (msg.type === 'result' && msg.id !== undefined) {
        const done = waiters.current.get(msg.id);
        waiters.current.delete(msg.id);
        done?.({ ok: !!msg.ok, output: msg.output ?? '', error: msg.error });
      }
    },
    [flush],
  );

  const view = createElement(WebView, {
    ref: web,
    source: { html: RUNNER_HTML },
    originWhitelist: ['*'],
    javaScriptEnabled: true,
    onMessage,
    style: { position: 'absolute', width: 1, height: 1, opacity: 0 },
    pointerEvents: 'none',
  });

  return { run, view };
}
