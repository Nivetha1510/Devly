// Flashcards, derived from the lesson content (src/data/lessons.ts). No React Native imports.
import { Course } from './courses';
import { getLessonContent } from './lessons';

export type CardStatus = 'not_started' | 'in_progress' | 'completed';
export type SwipeDirection = 'horizontal' | 'vertical';

export type Flashcard = {
  id: string; // course:lesson:a|b
  courseId: string;
  lesson: number;
  topic: string; // module title
  kind: 'concept' | 'practice';
  title: string;
  theory: string;
  code?: { file: string; text: string };
  seconds: number; // estimated reading time
};

const WORDS_PER_SECOND = 3;

function seconds(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(10, Math.round(words / WORDS_PER_SECOND / 5) * 5);
}

// Topic (module) title for a 1-based lesson number.
function topicOf(course: Course, lesson: number): string {
  let seen = 0;
  for (const m of course.modules) {
    seen += m.lessons;
    if (lesson <= seen) return m.title;
  }
  return course.modules[course.modules.length - 1].title;
}

// Two cards per lesson: the core concept (with its code example) and a practice card.
export function cardsFor(course: Course): Flashcard[] {
  const out: Flashcard[] = [];
  for (let n = 1; n <= course.lessons; n++) {
    const content = getLessonContent(course.id, n);
    if (!content) continue;
    const title = course.modules.flatMap((m) => m.topics)[n - 1] ?? `Lesson ${n}`;
    const topic = topicOf(course, n);
    const conceptText = content.body[0] ?? '';
    out.push({
      id: `${course.id}:${n}:a`,
      courseId: course.id,
      lesson: n,
      topic,
      kind: 'concept',
      title,
      theory: conceptText,
      code: content.code ? { file: content.code.file, text: content.code.lines.join('\n') } : undefined,
      seconds: seconds(conceptText),
    });
    const practiceText = [...content.body.slice(1), `Try it: ${content.tryIt}`].join('\n\n');
    out.push({
      id: `${course.id}:${n}:b`,
      courseId: course.id,
      lesson: n,
      topic,
      kind: 'practice',
      title: `${title}: key ideas`,
      theory: practiceText,
      seconds: seconds(practiceText),
    });
  }
  return out;
}

export function statusOf(cards: Record<string, 'seen' | 'done'>, id: string): CardStatus {
  const s = cards[id];
  return s === 'done' ? 'completed' : s === 'seen' ? 'in_progress' : 'not_started';
}

export function filterCards(
  list: Flashcard[],
  opts: { topic: string | null; status: CardStatus | 'all'; query: string },
  cards: Record<string, 'seen' | 'done'>,
): Flashcard[] {
  const q = opts.query.trim().toLowerCase();
  return list.filter((c) => {
    if (opts.topic && c.topic !== opts.topic) return false;
    if (opts.status !== 'all' && statusOf(cards, c.id) !== opts.status) return false;
    if (q && !`${c.title} ${c.theory} ${c.code?.text ?? ''}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function deckCounts(list: Flashcard[], cards: Record<string, 'seen' | 'done'>) {
  let completed = 0;
  let inProgress = 0;
  for (const c of list) {
    const s = statusOf(cards, c.id);
    if (s === 'completed') completed++;
    else if (s === 'in_progress') inProgress++;
  }
  return { total: list.length, completed, inProgress };
}

// A card only moves forward (not started -> seen -> done), except when the learner asks to review it again.
export function nextCardState(
  cards: Record<string, 'seen' | 'done'>,
  id: string,
  action: 'seen' | 'done' | 'review',
): Record<string, 'seen' | 'done'> {
  const cur = cards[id];
  if (action === 'seen') return cur ? cards : { ...cards, [id]: 'seen' };
  if (action === 'done') return cur === 'done' ? cards : { ...cards, [id]: 'done' };
  return cur === 'seen' ? cards : { ...cards, [id]: 'seen' };
}

export const CARD_XP = 2;
export const cardAwardKey = (id: string) => `card:${id}`;
