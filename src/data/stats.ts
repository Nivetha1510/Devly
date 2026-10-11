// Learning stats worked out from what the signed-in learner has actually done.
import { COURSES } from './courses';

export const MINUTES_PER_LESSON = 5;
const XP_PER_LESSON = 20;
const XP_PER_LEVEL = 200;
const LEVEL_NAMES = ['Newcomer', 'Explorer', 'Builder', 'Achiever', 'Expert'];

export function dayKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export type Stats = {
  lessonsDone: number;
  coursesDone: number;
  xp: number;
  level: number;
  levelName: string;
  levelProgress: number; // 0..1 within the current level
  xpToNext: number;
  minutesToday: number;
  streak: number;
  week: [string, number][]; // Mon..Sun of the current week
  month: [string, number][]; // last four 7-day blocks, oldest first
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function computeStats(completed: Record<string, number[]>, activity: Record<string, number>, bonusXp = 0): Stats {
  const lessonsDone = Object.values(completed).reduce((n, l) => n + l.length, 0);
  const coursesDone = COURSES.filter((c) => (completed[c.id] ?? []).length >= c.lessons).length;
  const xp = lessonsDone * XP_PER_LESSON + bonusXp;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;

  const minutesOn = (d: Date) => activity[dayKey(d)] ?? 0;
  const minutesToday = minutesOn(new Date());

  // Streak: consecutive active days ending today (or yesterday, if today has not started yet).
  let streak = 0;
  for (let i = minutesToday > 0 ? 0 : 1; minutesOn(daysAgo(i)) > 0; i++) streak++;

  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0
  const week = WEEKDAYS.map((label, i): [string, number] => [label, i <= todayIndex ? minutesOn(daysAgo(todayIndex - i)) : 0]);

  const month = [3, 2, 1, 0].map((block, i): [string, number] => {
    let total = 0;
    for (let d = 0; d < 7; d++) total += minutesOn(daysAgo(block * 7 + d));
    return [`Week ${i + 1}`, total];
  });

  return {
    lessonsDone,
    coursesDone,
    xp,
    level,
    levelName: LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)],
    levelProgress: into / XP_PER_LEVEL,
    xpToNext: XP_PER_LEVEL - into,
    minutesToday,
    streak,
    week,
    month,
  };
}
