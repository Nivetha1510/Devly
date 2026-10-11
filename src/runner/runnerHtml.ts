// The page that actually runs learner code. It is loaded in a hidden iframe (web) or a hidden WebView
// (phone). Code runs inside a Web Worker, so an endless loop can be stopped without freezing the app.
//
//   Python     -> Pyodide (real CPython compiled to WebAssembly), downloaded from a CDN on first use
//   JavaScript -> the worker's own engine
//   SQL        -> sql.js (real SQLite compiled to WebAssembly), downloaded from a CDN on first use
//
// Written with String.raw and no backticks or dollar-brace sequences, so it can be embedded as plain text.
import { SQL_SAMPLE_DATA } from '../data/editor';

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
const SQLJS_URL = 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/';

export const WORKER_SOURCE = String.raw`
var PYODIDE = '__PYODIDE__';
var SQLJS = '__SQLJS__';
var SAMPLE = __SAMPLE__;
var pyodide = null, SQL = null;
var NL = String.fromCharCode(10);

function show(v) {
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && v !== null) { try { return JSON.stringify(v); } catch (e) {} }
  return String(v);
}

function table(res) {
  var cols = res.columns;
  var rows = res.values.map(function (r) { return r.map(function (c) { return c === null ? 'NULL' : String(c); }); });
  var widths = cols.map(function (c, i) {
    return Math.max.apply(null, [c.length].concat(rows.map(function (r) { return r[i].length; })));
  });
  var pad = function (s, w) { while (s.length < w) s += ' '; return s; };
  var line = function (cells) { return cells.map(function (c, i) { return pad(c, widths[i]); }).join(' | '); };
  var sep = widths.map(function (w) { return new Array(w + 1).join('-'); }).join('-+-');
  return [line(cols), sep].concat(rows.map(line)).join(NL);
}

self.onmessage = async function (e) {
  var id = e.data.id, lang = e.data.lang, code = e.data.code;
  var out = [];
  function done(ok, error) { self.postMessage({ id: id, ok: ok, output: out.join(NL), error: error }); }
  try {
    if (lang === 'javascript') {
      var log = function () { out.push(Array.prototype.map.call(arguments, show).join(' ')); };
      var con = { log: log, info: log, warn: log, error: log, debug: log };
      var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      await new AsyncFunction('console', code)(con);
    } else if (lang === 'python') {
      if (!pyodide) {
        importScripts(PYODIDE + 'pyodide.js');
        pyodide = await loadPyodide({ indexURL: PYODIDE });
      }
      pyodide.setStdout({ batched: function (s) { out.push(s); } });
      pyodide.setStderr({ batched: function (s) { out.push(s); } });
      var scope = pyodide.globals.get('dict')();
      await pyodide.runPythonAsync(code, { globals: scope });
      scope.destroy();
    } else if (lang === 'sql') {
      if (!SQL) {
        importScripts(SQLJS + 'sql-wasm.js');
        SQL = await initSqlJs({ locateFile: function (f) { return SQLJS + f; } });
      }
      var db = new SQL.Database();
      try {
        if (!/create\s+table/i.test(code)) db.exec(SAMPLE);
        var results = db.exec(code);
        if (results.length === 0) out.push('Query OK. No rows returned.');
        results.forEach(function (r, i) {
          if (i > 0) out.push('');
          out.push(table(r));
          out.push('(' + r.values.length + ' row' + (r.values.length === 1 ? '' : 's') + ')');
        });
      } finally { db.close(); }
    } else {
      throw new Error('This language cannot be run here.');
    }
    done(true);
  } catch (err) {
    var msg = String(err && err.message ? err.message : err);
    var lines = msg.split(NL).filter(function (l) { return l.trim().length > 0; });
    // Python errors: hide the engine's own frames and start at the learner's code.
    var at = -1;
    lines.forEach(function (l, i) { if (l.indexOf('"<exec>"') !== -1) at = i; });
    if (at >= 0) lines = ['Traceback (most recent call last):'].concat(lines.slice(at));
    done(false, lines.slice(-6).join(NL));
  }
};
`
  .replace('__PYODIDE__', PYODIDE_URL)
  .replace('__SQLJS__', SQLJS_URL)
  .replace('__SAMPLE__', JSON.stringify(SQL_SAMPLE_DATA));

const PAGE = String.raw`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body><script>
var WORKER_SRC = __WORKER__;
var worker = null;
var pending = {};
var loaded = {};

function send(msg) {
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  else parent.postMessage(msg, '*');
}

function ensureWorker() {
  if (worker) return;
  var blob = new Blob([WORKER_SRC], { type: 'text/javascript' });
  worker = new Worker(URL.createObjectURL(blob));
  worker.onmessage = function (e) {
    var m = e.data;
    var p = pending[m.id];
    if (!p) return;
    clearTimeout(p.timer);
    delete pending[m.id];
    loaded[p.lang] = true;
    send({ type: 'result', id: m.id, ok: m.ok, output: m.output, error: m.error });
  };
}

function reset(reason) {
  if (worker) { worker.terminate(); worker = null; }
  loaded = {};
  Object.keys(pending).forEach(function (id) {
    clearTimeout(pending[id].timer);
    send({ type: 'result', id: Number(id), ok: false, output: '', error: reason });
  });
  pending = {};
}

function run(req) {
  try { ensureWorker(); } catch (e) {
    send({ type: 'result', id: req.id, ok: false, output: '', error: 'Could not start the code engine: ' + e });
    return;
  }
  // First use of Python or SQL downloads an engine, so allow longer. After that, stop runaway code quickly.
  var limit = loaded[req.lang] || req.lang === 'javascript' ? 10000 : 120000;
  var timer = setTimeout(function () {
    reset('Stopped: the code ran for too long. Check for an endless loop.');
  }, limit);
  pending[req.id] = { timer: timer, lang: req.lang };
  worker.postMessage({ id: req.id, lang: req.lang, code: req.code });
}

window.__run = run;
window.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'run') run(e.data);
});
send({ type: 'ready' });
</script></body></html>`;

export const RUNNER_HTML = PAGE.replace('__WORKER__', () => JSON.stringify(WORKER_SOURCE).replace(/</g, '\\u003c'));
