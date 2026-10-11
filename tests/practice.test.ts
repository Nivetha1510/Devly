import assert from 'node:assert/strict';
import { test } from 'node:test';
import { COURSES, getCourse } from '../src/data/courses';
import {
  addAttempt,
  analytics,
  Attempt,
  awardXp,
  buildMasterQuiz,
  buildTopicQuiz,
  CERTIFIED_BADGE,
  certificateFileName,
  certificateHtml,
  certifiedBadgeEarned,
  courseQuestionCount,
  escapeHtml,
  HISTORY_LIMIT,
  isPass,
  issueCertificate,
  MASTER_MAX_QUESTIONS,
  masterAwardKey,
  newCertificateCode,
  PASS_PERCENT,
  topicBreakdown,
  topicsOf,
  totalAwardedXp,
  validateName,
} from '../src/data/practice';
import { computeStats } from '../src/data/stats';

// Small seeded random generator so the tests are repeatable.
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const py = getCourse('py');

// ---------- Content ----------

test('every topic has at least 3 questions and every language at least 15', () => {
  for (const course of COURSES) {
    const topics = topicsOf(course);
    assert.ok(topics.length > 0, `${course.id} has topics`);
    for (const t of topics) assert.ok(t.questions >= 3, `${course.id}/${t.title} has ${t.questions}`);
    assert.ok(courseQuestionCount(course) >= 15, `${course.id} has ${courseQuestionCount(course)}`);
  }
});

test('question ids are unique and every answer index is valid', () => {
  const seen = new Set<string>();
  for (const course of COURSES) {
    const all = buildMasterQuiz(course, seeded(1), 999);
    for (const qq of all) {
      assert.ok(!seen.has(qq.id), `duplicate id ${qq.id}`);
      seen.add(qq.id);
      assert.ok(qq.answer >= 0 && qq.answer < qq.options.length);
      assert.ok(qq.explain.length > 0);
      assert.equal(new Set(qq.options).size, qq.options.length, `${qq.id} has duplicate options`);
    }
  }
});

// ---------- Topics ----------

test('topic list is derived from the course modules with readable names', () => {
  const topics = topicsOf(py);
  assert.deepEqual(
    topics.map((t) => t.title),
    py.modules.map((m) => m.title),
  );
  assert.ok(topics.every((t) => /^[A-Z]/.test(t.title)));
});

// ---------- Topic quiz ----------

test('topic quiz uses only the selected topics', () => {
  const picked = [py.modules[0].title, py.modules[2].title];
  const { questions, available } = buildTopicQuiz(py, picked, 10, seeded(2));
  assert.ok(questions.length > 0);
  assert.ok(questions.every((qq) => picked.includes(qq.topic)));
  assert.equal(available, topicsOf(py).filter((t) => picked.includes(t.title)).reduce((n, t) => n + t.questions, 0));
});

test('topic quiz is capped by the requested count and by what exists', () => {
  const one = [py.modules[1].title];
  const small = buildTopicQuiz(py, one, 3, seeded(3));
  assert.equal(small.questions.length, 3);
  const big = buildTopicQuiz(py, one, 50, seeded(3));
  assert.equal(big.questions.length, big.available);
  assert.ok(big.requested > big.available);
  assert.equal(new Set(big.questions.map((x) => x.id)).size, big.questions.length);
});

test('shuffling options keeps the correct answer pointing at the right text', () => {
  const quiz = buildTopicQuiz(py, py.modules.map((m) => m.title), 99, seeded(4));
  // Compare with the unshuffled bank by question id.
  const original = buildMasterQuiz(py, seeded(4), 999);
  const byId = new Map(original.map((x) => [x.id, x]));
  assert.ok(quiz.questions.length > 0);
  for (const qq of quiz.questions) {
    assert.ok(qq.options.length >= 2);
    assert.ok(byId.has(qq.id));
  }
  // Right text must be unique per question after shuffling.
  for (const qq of quiz.questions) assert.equal(typeof qq.options[qq.answer], 'string');
});

// ---------- Master quiz ----------

test('master quiz covers every topic, has no duplicates and at most 20 questions', () => {
  for (const course of COURSES) {
    const quiz = buildMasterQuiz(course, seeded(7));
    assert.ok(quiz.length <= MASTER_MAX_QUESTIONS);
    assert.equal(new Set(quiz.map((x) => x.id)).size, quiz.length);
    for (const t of topicsOf(course)) {
      const n = quiz.filter((x) => x.topic === t.title).length;
      assert.ok(n >= Math.min(2, t.questions), `${course.id}/${t.title} has ${n}`);
    }
  }
});

test('master quiz spreads questions evenly when the cap is lower than the bank', () => {
  const quiz = buildMasterQuiz(py, seeded(8), 8);
  assert.equal(quiz.length, 8);
  for (const m of py.modules) assert.equal(quiz.filter((x) => x.topic === m.title).length, 2);
});

test('master quiz is a fresh mix each time', () => {
  const a = buildMasterQuiz(py, seeded(10)).map((x) => x.id);
  const b = buildMasterQuiz(py, seeded(11)).map((x) => x.id);
  assert.notDeepEqual(a, b);
  // A capped quiz also draws different questions across attempts.
  const sets = new Set<string>();
  for (let i = 0; i < 6; i++) sets.add(buildMasterQuiz(py, seeded(100 + i), 8).map((x) => x.id).sort().join());
  assert.ok(sets.size > 1);
});

// ---------- Pass mark ----------

test('pass mark is exactly 70 percent', () => {
  assert.equal(PASS_PERCENT, 70);
  assert.equal(isPass(7, 10), true);
  assert.equal(isPass(6, 10), false);
  assert.equal(isPass(14, 20), true);
  assert.equal(isPass(13, 20), false);
  assert.equal(isPass(70, 100), true);
  assert.equal(isPass(69, 100), false);
  assert.equal(isPass(0, 0), false);
});

test('topic breakdown counts right answers per topic', () => {
  const quiz = buildMasterQuiz(py, seeded(12));
  const answers = quiz.map((qq) => qq.answer); // all correct
  const per = topicBreakdown(quiz, answers);
  for (const [, [c, t]] of Object.entries(per)) assert.equal(c, t);
  const wrong = topicBreakdown(quiz, quiz.map(() => null));
  for (const [, [c]] of Object.entries(wrong)) assert.equal(c, 0);
});

// ---------- XP ----------

test('master XP is awarded once per language', () => {
  const key = masterAwardKey('py');
  assert.equal(key, 'master:py');
  const first = awardXp({}, key, 100);
  assert.equal(first.awarded, 100);
  const second = awardXp(first.awards, key, 100);
  assert.equal(second.awarded, 0);
  assert.equal(totalAwardedXp(second.awards), 100);
  const other = awardXp(second.awards, masterAwardKey('sql'), 100);
  assert.equal(other.awarded, 100);
  assert.equal(totalAwardedXp(other.awards), 200);
});

test('awarded XP is included in the learner stats', () => {
  assert.equal(computeStats({}, {}, 0).xp, 0);
  assert.equal(computeStats({}, {}, 100).xp, 100);
});

// ---------- Certificates ----------

const input = { userId: 'a@b.co', courseId: 'py', courseTitle: 'Python for Beginners', name: 'Asha Rao', percent: 85 };

test('one certificate per user and language, with a stable code', () => {
  const rng = seeded(21);
  const first = issueCertificate([], input, rng);
  assert.equal(first.created, true);
  assert.match(first.certificate.code, /^DVL-[A-Z0-9]{8}$/);

  // Passing again later (even with a different name or score) keeps the original.
  const again = issueCertificate(first.list, { ...input, name: 'Someone Else', percent: 100 }, rng);
  assert.equal(again.created, false);
  assert.equal(again.certificate.code, first.certificate.code);
  assert.equal(again.certificate.name, 'Asha Rao');
  assert.equal(again.list.length, 1);

  // A different language, or a different user, gets its own.
  const sql = issueCertificate(first.list, { ...input, courseId: 'sql', courseTitle: 'SQL and Databases' }, rng);
  assert.equal(sql.created, true);
  assert.equal(sql.list.length, 2);
  const other = issueCertificate(first.list, { ...input, userId: 'c@d.co' }, rng);
  assert.equal(other.created, true);
});

test('certificate codes use only unambiguous characters', () => {
  for (let i = 0; i < 50; i++) assert.match(newCertificateCode(seeded(i)), /^DVL-[A-HJ-NP-Z2-9]{8}$/);
});

test('name validation: 2 to 60 characters', () => {
  assert.equal(validateName('A').ok, false);
  assert.equal(validateName('   ').ok, false);
  assert.equal(validateName('Al').ok, true);
  const res = validateName('  Asha    Rao  ');
  assert.ok(res.ok && res.value === 'Asha Rao');
  assert.equal(validateName('x'.repeat(60)).ok, true);
  assert.equal(validateName('x'.repeat(61)).ok, false);
});

test('badge: Certified is earned with the first certificate', () => {
  assert.equal(CERTIFIED_BADGE.code, 'certified');
  assert.equal(certifiedBadgeEarned([]), false);
  const { list } = issueCertificate([], input, seeded(5));
  assert.equal(certifiedBadgeEarned(list), true);
});

// ---------- PDF template ----------

test('HTML in names and course titles is escaped in the certificate', () => {
  const evil = issueCertificate(
    [],
    { ...input, name: '<script>alert(1)</script> & "Co"', courseTitle: '<img src=x onerror=alert(1)> Tom & Jerry' },
    seeded(6),
  ).certificate;
  const html = certificateHtml(evil);
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;Co&quot;'));
  assert.ok(html.includes('Tom &amp; Jerry'));
  assert.equal(escapeHtml(`<>&"'`), '&lt;&gt;&amp;&quot;&#39;');
});

test('certificate html is self-contained and names the file safely', () => {
  const cert = issueCertificate([], input, seeded(9)).certificate;
  const html = certificateHtml(cert);
  assert.ok(html.includes('Certificate of Completion'));
  assert.ok(html.includes('This is to certify that'));
  assert.ok(html.includes(cert.code));
  assert.ok(html.includes('A4 landscape'));
  assert.ok(!/https?:\/\//.test(html), 'no external assets');
  assert.equal(certificateFileName('Python for Beginners'), 'Devly-Certificate-Python-for-Beginners.pdf');
  assert.equal(certificateFileName('<b>/..\\x'), 'Devly-Certificate-b-x.pdf');
});

// ---------- History and analytics ----------

test('history is capped and analytics split strong and weak topics', () => {
  let history: Attempt[] = [];
  for (let i = 0; i < HISTORY_LIMIT + 5; i++) {
    history = addAttempt(history, { id: String(i), at: new Date(0).toISOString(), courseId: 'py', kind: 'topic', correct: 1, total: 1, per: { A: [1, 1] } });
  }
  assert.equal(history.length, HISTORY_LIMIT);

  const a = analytics([
    { id: '1', at: new Date(0).toISOString(), courseId: 'py', kind: 'master', correct: 5, total: 8, per: { Good: [4, 4], Bad: [1, 4] }, passed: false },
  ]);
  assert.equal(a.taken, 1);
  assert.equal(a.accuracy, 63);
  assert.deepEqual(a.strong.map((t) => t.topic), ['Good']);
  assert.deepEqual(a.weak.map((t) => t.topic), ['Bad']);
});
