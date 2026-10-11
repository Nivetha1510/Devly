// Code editor: supported languages, starter code and small helpers. No React Native imports.

export type EditorLang = 'python' | 'javascript' | 'sql' | 'html';

export const EDITOR_LANGS: { id: EditorLang; label: string; file: string; starter: string; note?: string }[] = [
  {
    id: 'python',
    label: 'Python',
    file: 'main.py',
    starter: 'name = "Devly"\nfor i in range(3):\n    print("Hello from", name, i)\n',
    note: 'Runs real Python in your browser or phone. The first run downloads the Python engine (about 10 MB).',
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    file: 'app.js',
    starter: 'const names = ["Asha", "Ravi", "Meena"];\nfor (const n of names) {\n  console.log("Hello, " + n);\n}\n',
  },
  {
    id: 'sql',
    label: 'SQL',
    file: 'query.sql',
    starter: 'SELECT name, age\nFROM students\nWHERE age > 20\nORDER BY age DESC;\n',
    note: 'Sample tables: students(id, name, age) and orders(id, student_id, item). Use CREATE TABLE to make your own.',
  },
  {
    id: 'html',
    label: 'HTML + CSS',
    file: 'index.html',
    starter:
      '<style>\n  h1 { color: #6c67e0; }\n  .card { border: 1px solid #ccc; padding: 12px; border-radius: 8px; }\n</style>\n<h1>Hello web!</h1>\n<div class="card">This is a card.</div>\n',
    note: 'Shows a live preview of your page.',
  },
];

export function langInfo(id: EditorLang) {
  return EDITOR_LANGS.find((l) => l.id === id) ?? EDITOR_LANGS[0];
}

// Which editor language a lesson example (by file name) can be opened in, or null if it cannot run.
export function langForFile(file: string): EditorLang | null {
  const ext = file.split('.').pop()?.toLowerCase();
  if (ext === 'py') return 'python';
  if (ext === 'js') return 'javascript';
  if (ext === 'sql') return 'sql';
  if (ext === 'html' || ext === 'css') return 'html';
  return null;
}

// CSS examples need some markup to style, so they open as a small page.
export function codeForEditor(file: string, code: string): string {
  if (file.toLowerCase().endsWith('.css')) {
    return `<style>\n${code}\n</style>\n<h1>Heading</h1>\n<div class="card nav grid">Some content</div>\n`;
  }
  return code;
}

// 1-based line and column of a character index in `text`.
export function cursorPosition(text: string, index: number): { line: number; col: number } {
  const i = Math.max(0, Math.min(index, text.length));
  const before = text.slice(0, i);
  const line = before.split('\n').length;
  const col = i - (before.lastIndexOf('\n') + 1) + 1;
  return { line, col };
}

export function lineCount(text: string): number {
  return text.split('\n').length;
}

export function longestLine(text: string): number {
  return text.split('\n').reduce((n, l) => Math.max(n, l.length), 0);
}

// Setup data for SQL runs (skipped when the learner creates their own tables).
export const SQL_SAMPLE_DATA = [
  'CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, age INTEGER);',
  "INSERT INTO students VALUES (1, 'Asha', 20), (2, 'Ravi', 22), (3, 'Meena', 21);",
  'CREATE TABLE orders (id INTEGER PRIMARY KEY, student_id INTEGER, item TEXT);',
  "INSERT INTO orders VALUES (1, 1, 'Notebook'), (2, 2, 'Pen'), (3, 1, 'Pencil'), (4, 1, 'Eraser');",
].join('\n');

export const FONT_MIN = 10;
export const FONT_MAX = 24;
