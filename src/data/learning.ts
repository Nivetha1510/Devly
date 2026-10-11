// Sample lesson, quiz and progress data used by the screens.
import { LearnerKey } from './people';

export type TokenKind = 'kw' | 'fn' | 'str' | 'num' | 'plain';
export type CodeLine = [string, TokenKind][];

export const LESSON = {
  course: 'Python for Beginners',
  number: 7,
  total: 10,
  title: 'Loops and iteration',
  meta: '6 min read · 1 practice task',
  mentorTip: "A loop repeats code for you, so you only write it once. Let's see one in action.",
  fileName: 'main.py',
  code: [
    [['for', 'kw'], [' i ', 'plain'], ['in', 'kw'], [' ', 'plain'], ['range', 'fn'], ['(', 'plain'], ['3', 'num'], ['):', 'plain']],
    [['    ', 'plain'], ['print', 'fn'], ['(', 'plain'], ['"Step"', 'str'], [', i)', 'plain']],
  ] as CodeLine[],
  output: ['Step 0', 'Step 1', 'Step 2'],
  tip: 'change 3 to 5. What will the last line say?',
};

export type Question = {
  before: string;
  code?: string;
  after?: string;
  options: string[];
  answer: number;
  monoOptions: boolean;
  explain: string;
};

export const QUIZ: Question[] = [
  {
    before: 'Which values does ',
    code: 'range(3)',
    after: ' produce?',
    options: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', '3'],
    answer: 1,
    monoOptions: true,
    explain: 'range(3) starts at 0 and stops before 3, so you get 0, 1 and 2.',
  },
  {
    before: 'Which keyword stops a loop early?',
    options: ['stop', 'exit', 'break', 'return'],
    answer: 2,
    monoOptions: true,
    explain: 'break ends the loop straight away, and the code after the loop runs next.',
  },
  {
    before: 'How many times does ',
    code: 'for ch in "hey":',
    after: ' run?',
    options: ['Once', 'Twice', 'Three times', 'It never runs'],
    answer: 2,
    monoOptions: false,
    explain: 'A for loop over a string visits each character, and "hey" has three of them.',
  },
];

export const STATS = {
  streak: 12,
  lessonsDone: 38,
  xp: 1240,
  level: 4,
  levelName: 'Explorer',
  xpToNext: 350,
  levelProgress: 0.78,
  minutesToday: 12,
};

export const WEEK: [string, number][] = [
  ['Mon', 20],
  ['Tue', 28],
  ['Wed', 12],
  ['Thu', 32],
  ['Fri', 24],
  ['Sat', 16],
  ['Sun', 12],
];

export const MONTH: [string, number][] = [
  ['Week 1', 95],
  ['Week 2', 140],
  ['Week 3', 110],
  ['Week 4', 150],
];

export const LEAGUE: { who: 'me' | LearnerKey; name: string; xp: number }[] = [
  { who: 'priya', name: 'Priya', xp: 1480 },
  { who: 'me', name: 'You', xp: 1240 },
  { who: 'diego', name: 'Diego', xp: 1120 },
  { who: 'amara', name: 'Amara', xp: 980 },
  { who: 'noah', name: 'Noah', xp: 860 },
];
