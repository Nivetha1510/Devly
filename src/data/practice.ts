// Practice logic: topic quizzes, the Master Quiz, scoring, XP awards and certificates.
// Pure functions with no React Native imports, so they can be tested in plain Node (see tests/).
import { Course } from './courses';
import { Question } from './learning';
import { getQuiz } from './quizzes';

export const PASS_PERCENT = 70; // Master Quiz pass mark
export const MASTER_MAX_QUESTIONS = 20;
export const MASTER_XP = 100;
export const COUNT_OPTIONS = [5, 10, 15];
export const NAME_MIN = 2;
export const NAME_MAX = 60;
export const HISTORY_LIMIT = 100;

export type Rng = () => number;

export type PracticeQuestion = Question & { id: string; topic: string };

// ---------- Topics ----------

// A course's topics are its module titles.
export function topicsOf(course: Course): { title: string; questions: number }[] {
  return course.modules.map((m) => ({ title: m.title, questions: getQuiz(m.title).length }));
}

export function topicQuestions(course: Course, topic: string): PracticeQuestion[] {
  return getQuiz(topic).map((qq, i) => ({ ...qq, id: `${course.id}:${topic}:${i + 1}`, topic }));
}

export function courseQuestionCount(course: Course): number {
  return course.modules.reduce((n, m) => n + getQuiz(m.title).length, 0);
}

// ---------- Shuffling and building ----------

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Shuffles the answer options and keeps `answer` pointing at the right one.
function shuffleOptions(qq: PracticeQuestion, rng: Rng): PracticeQuestion {
  const order = shuffle(qq.options.map((_, i) => i), rng);
  return { ...qq, options: order.map((i) => qq.options[i]), answer: order.indexOf(qq.answer) };
}

export type TopicQuiz = { questions: PracticeQuestion[]; requested: number; available: number };

// Questions from the chosen topics only, shuffled, limited to `count`.
export function buildTopicQuiz(course: Course, topics: string[], count: number, rng: Rng = Math.random): TopicQuiz {
  const wanted = course.modules.map((m) => m.title).filter((t) => topics.includes(t));
  const pool = wanted.flatMap((t) => topicQuestions(course, t));
  const questions = shuffle(pool, rng)
    .slice(0, Math.max(0, count))
    .map((qq) => shuffleOptions(qq, rng));
  return { questions, requested: count, available: pool.length };
}

// Master Quiz: questions spread evenly over every topic (round-robin, so at least 2 per topic when
// there is room), no duplicates, at most `max`, in a fresh random order every time.
export function buildMasterQuiz(course: Course, rng: Rng = Math.random, max: number = MASTER_MAX_QUESTIONS): PracticeQuestion[] {
  const queues = course.modules.map((m) => shuffle(topicQuestions(course, m.title), rng));
  const picked: PracticeQuestion[] = [];
  while (picked.length < max && queues.some((qs) => qs.length > 0)) {
    for (const qs of shuffle(queues, rng)) {
      if (picked.length >= max) break;
      const next = qs.shift();
      if (next) picked.push(next);
    }
  }
  return shuffle(picked, rng).map((qq) => shuffleOptions(qq, rng));
}

// ---------- Scoring ----------

export function percentOf(correct: number, total: number): number {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

// Pass when the exact (unrounded) score is at least PASS_PERCENT.
export function isPass(correct: number, total: number): boolean {
  return total > 0 && correct * 100 >= PASS_PERCENT * total;
}

export type TopicScore = Record<string, [correct: number, total: number]>;

export function topicBreakdown(questions: PracticeQuestion[], answers: (number | null)[]): TopicScore {
  const out: TopicScore = {};
  questions.forEach((qq, i) => {
    const cur = out[qq.topic] ?? [0, 0];
    out[qq.topic] = [cur[0] + (answers[i] === qq.answer ? 1 : 0), cur[1] + 1];
  });
  return out;
}

// ---------- Attempts and analytics ----------

export type Attempt = {
  id: string;
  at: string; // ISO date
  courseId: string;
  kind: 'topic' | 'master';
  correct: number;
  total: number;
  per: TopicScore;
  passed?: boolean; // master quizzes only
};

export function addAttempt(history: Attempt[], attempt: Attempt): Attempt[] {
  return [attempt, ...history].slice(0, HISTORY_LIMIT);
}

export function hasPassedMaster(history: Attempt[], courseId: string): boolean {
  return history.some((a) => a.kind === 'master' && a.courseId === courseId && a.passed);
}

export function bestMaster(history: Attempt[], courseId: string): Attempt | undefined {
  return history
    .filter((a) => a.kind === 'master' && a.courseId === courseId)
    .reduce<Attempt | undefined>((best, a) => (!best || percentOf(a.correct, a.total) > percentOf(best.correct, best.total) ? a : best), undefined);
}

// Accuracy per topic, from every attempt (topic practice and master quizzes).
export function topicAccuracy(history: Attempt[], courseId: string): Record<string, { correct: number; total: number }> {
  const out: Record<string, { correct: number; total: number }> = {};
  for (const a of history) {
    if (a.courseId !== courseId) continue;
    for (const [topic, [c, t]] of Object.entries(a.per)) {
      const cur = out[topic] ?? { correct: 0, total: 0 };
      out[topic] = { correct: cur.correct + c, total: cur.total + t };
    }
  }
  return out;
}

export function practisedTopics(history: Attempt[], course: Course): number {
  const acc = topicAccuracy(history, course.id);
  return course.modules.filter((m) => (acc[m.title]?.total ?? 0) > 0).length;
}

export type Analytics = {
  taken: number;
  accuracy: number; // percent over every answered question
  strong: { courseId: string; topic: string; percent: number }[];
  weak: { courseId: string; topic: string; percent: number }[];
};

export function analytics(history: Attempt[]): Analytics {
  let correct = 0;
  let total = 0;
  const topics = new Map<string, { courseId: string; topic: string; correct: number; total: number }>();
  for (const a of history) {
    correct += a.correct;
    total += a.total;
    for (const [topic, [c, t]] of Object.entries(a.per)) {
      const key = `${a.courseId}|${topic}`;
      const cur = topics.get(key) ?? { courseId: a.courseId, topic, correct: 0, total: 0 };
      topics.set(key, { ...cur, correct: cur.correct + c, total: cur.total + t });
    }
  }
  const scored = [...topics.values()]
    .filter((t) => t.total > 0)
    .map((t) => ({ courseId: t.courseId, topic: t.topic, percent: percentOf(t.correct, t.total) }));
  return {
    taken: history.length,
    accuracy: percentOf(correct, total),
    strong: scored.filter((t) => t.percent >= 80).sort((a, b) => b.percent - a.percent),
    weak: scored.filter((t) => t.percent < 60).sort((a, b) => a.percent - b.percent),
  };
}

// ---------- XP awards (once per key) ----------

export const masterAwardKey = (courseId: string) => `master:${courseId}`;

export function awardXp(awards: Record<string, number>, key: string, amount: number): { awards: Record<string, number>; awarded: number } {
  if (key in awards) return { awards, awarded: 0 };
  return { awards: { ...awards, [key]: amount }, awarded: amount };
}

export function totalAwardedXp(awards: Record<string, number>): number {
  return Object.values(awards).reduce((n, v) => n + v, 0);
}

// ---------- Certificates ----------

export type Certificate = {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string;
  name: string;
  percent: number;
  issued_at: string; // ISO date
  code: string;
};

export function validateName(raw: string): { ok: true; value: string } | { ok: false; error: string } {
  const value = raw.replace(/\s+/g, ' ').trim();
  if (value.length < NAME_MIN) return { ok: false, error: `Enter at least ${NAME_MIN} characters` };
  if (value.length > NAME_MAX) return { ok: false, error: `Use at most ${NAME_MAX} characters` };
  return { ok: true, value };
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no look-alikes (0/O, 1/I)

export function newCertificateCode(rng: Rng = Math.random, length = 8): string {
  let s = '';
  for (let i = 0; i < length; i++) s += CODE_CHARS[Math.floor(rng() * CODE_CHARS.length)];
  return `DVL-${s}`;
}

// The "Certified" badge is earned with the first certificate.
export const CERTIFIED_BADGE = { code: 'certified', label: 'Certified' };
export function certifiedBadgeEarned(list: Certificate[]): boolean {
  return list.length >= 1;
}

export function findCertificate(list: Certificate[], userId: string, courseId: string): Certificate | undefined {
  return list.find((c) => c.user_id === userId && c.course_id === courseId);
}

// One certificate per learner and language. Passing again keeps the original (same code).
export function issueCertificate(
  list: Certificate[],
  input: { userId: string; courseId: string; courseTitle: string; name: string; percent: number },
  rng: Rng = Math.random,
  now: Date = new Date(),
): { list: Certificate[]; certificate: Certificate; created: boolean } {
  const existing = findCertificate(list, input.userId, input.courseId);
  if (existing) return { list, certificate: existing, created: false };
  const certificate: Certificate = {
    id: `${input.userId}:${input.courseId}`,
    user_id: input.userId,
    course_id: input.courseId,
    course_title: input.courseTitle,
    name: input.name,
    percent: input.percent,
    issued_at: now.toISOString(),
    code: newCertificateCode(rng),
  };
  return { list: [...list, certificate], certificate, created: true };
}

// ---------- PDF template ----------

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatIssued(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function certificateFileName(courseTitle: string): string {
  const slug = courseTitle.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'Course';
  return `Devly-Certificate-${slug}.pdf`;
}

// A4 landscape, inline CSS and system fonts only. Everything user-supplied is escaped.
export function certificateHtml(cert: Certificate): string {
  const name = escapeHtml(cert.name);
  const course = escapeHtml(cert.course_title);
  const code = escapeHtml(cert.code);
  const date = escapeHtml(formatIssued(cert.issued_at));
  const score = escapeHtml(String(Math.round(cert.percent)));
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Certificate - ${course}</title>
<style>
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #ffffff; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1c2340; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { width: 297mm; height: 210mm; padding: 10mm; }
  .frame { width: 100%; height: 100%; border: 3mm solid #1c2340; padding: 3mm; }
  .inner { width: 100%; height: 100%; border: 0.6mm solid #b8923a; text-align: center; padding: 12mm 16mm; display: flex; flex-direction: column; justify-content: space-between; }
  .brand { font-family: Arial, Helvetica, sans-serif; letter-spacing: 6px; font-size: 14px; font-weight: 700; color: #b8923a; }
  h1 { margin: 6px 0 0; font-size: 44px; font-weight: 700; letter-spacing: 1px; }
  .small { font-size: 16px; color: #4a5272; }
  .name { font-size: 46px; font-weight: 700; margin: 6px 0; border-bottom: 0.5mm solid #b8923a; display: inline-block; padding: 0 16px 4px; }
  .course { font-size: 32px; font-weight: 700; margin: 6px 0; color: #2b3a8c; }
  .row { display: flex; justify-content: space-between; align-items: flex-end; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #4a5272; }
  .sig { width: 70mm; border-top: 0.4mm solid #1c2340; padding-top: 4px; text-align: center; }
  .note { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #6b7390; margin-top: 4px; }
</style></head>
<body><div class="page"><div class="frame"><div class="inner">
  <div>
    <div class="brand">DEVLY</div>
    <h1>Certificate of Completion</h1>
  </div>
  <div>
    <div class="small">This is to certify that</div>
    <div class="name">${name}</div>
    <div class="small">has successfully completed the master assessment for</div>
    <div class="course">${course}</div>
    <div class="small">with a score of ${score}%</div>
  </div>
  <div>
    <div class="row">
      <div>Issued on<br><strong>${date}</strong></div>
      <div class="sig">Devly Learning Platform</div>
      <div>Certificate code<br><strong>${code}</strong></div>
    </div>
    <div class="note">Issued by the Devly app on this device.</div>
  </div>
</div></div></div></body></html>`;
}
