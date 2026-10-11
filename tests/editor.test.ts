import assert from 'node:assert/strict';
import { test } from 'node:test';
import { codeForEditor, cursorPosition, EDITOR_LANGS, langForFile, lineCount, longestLine } from '../src/data/editor';
import { RUNNER_HTML, WORKER_SOURCE } from '../src/runner/runnerHtml';

test('cursor position is 1-based line and column', () => {
  const text = 'ab\ncde\n\nf';
  assert.deepEqual(cursorPosition(text, 0), { line: 1, col: 1 });
  assert.deepEqual(cursorPosition(text, 2), { line: 1, col: 3 });
  assert.deepEqual(cursorPosition(text, 3), { line: 2, col: 1 });
  assert.deepEqual(cursorPosition(text, 6), { line: 2, col: 4 });
  assert.deepEqual(cursorPosition(text, 99), { line: 4, col: 2 });
  assert.equal(lineCount(text), 4);
  assert.equal(longestLine(text), 3);
});

test('lesson files map to an editor language', () => {
  assert.equal(langForFile('main.py'), 'python');
  assert.equal(langForFile('app.js'), 'javascript');
  assert.equal(langForFile('query.sql'), 'sql');
  assert.equal(langForFile('index.html'), 'html');
  assert.equal(langForFile('style.css'), 'html');
  assert.equal(langForFile('terminal'), null);
  assert.ok(codeForEditor('style.css', 'h1 { color: red; }').includes('<style>'));
  assert.ok(EDITOR_LANGS.every((l) => l.starter.length > 0));
});

test('runner page embeds the worker safely', () => {
  assert.ok(RUNNER_HTML.includes('importScripts'));
  assert.ok(!RUNNER_HTML.includes('__WORKER__'));
  assert.ok(!WORKER_SOURCE.includes('__PYODIDE__') && !WORKER_SOURCE.includes('__SQLJS__') && !WORKER_SOURCE.includes('__SAMPLE__'));
  // The embedded script must not be able to close its own <script> tag early.
  const inner = RUNNER_HTML.slice(RUNNER_HTML.indexOf('<script>') + 8, RUNNER_HTML.lastIndexOf('</script>'));
  assert.ok(!inner.includes('</script'));
});

// Runs the worker's message handler in Node with a fake worker scope.
async function runInWorker(lang: string, code: string) {
  const posted: { ok: boolean; output: string; error?: string }[] = [];
  const scope: { onmessage?: (e: { data: unknown }) => Promise<void>; postMessage: (m: never) => void } = {
    postMessage: (m) => posted.push(m as never),
  };
  new Function('self', 'importScripts', WORKER_SOURCE)(scope, () => {
    throw new Error('offline');
  });
  await scope.onmessage!({ data: { id: 1, lang, code } });
  return posted[0];
}

test('worker runs JavaScript and captures console output', async () => {
  const r = await runInWorker('javascript', 'console.log("a", 1); console.log({x: 2}); await Promise.resolve(); console.log([1,2].join("-"))');
  assert.equal(r.ok, true);
  assert.equal(r.output, 'a 1\n{"x":2}\n1-2');
});

test('worker reports JavaScript errors without crashing', async () => {
  const r = await runInWorker('javascript', 'console.log("before"); nope();');
  assert.equal(r.ok, false);
  assert.equal(r.output, 'before');
  assert.match(r.error ?? '', /nope/);
});

test('worker rejects unknown languages', async () => {
  const r = await runInWorker('cobol', 'x');
  assert.equal(r.ok, false);
});
