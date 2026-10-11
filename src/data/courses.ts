import { TileKey } from '../theme/palette';
import { AvatarKey } from './people';

export type ArtKind = 'code' | 'ai' | 'web' | 'git' | 'data' | 'cloud';
export type Category = 'Python' | 'Web' | 'AI' | 'Data' | 'Tools' | 'Cloud';

export type Course = {
  id: string;
  title: string;
  cat: Category;
  level: string;
  lessons: number;
  done: number;
  time: string;
  art: ArtKind;
  tile: TileKey;
  mentor: AvatarKey;
  about: string;
  outcomes: string[];
  modules: { title: string; lessons: number; topics: string[] }[]; // topics = lesson titles; a course has 10 lessons in total
};

// Sample catalogue. Replace with data from your API later.
export const COURSES: Course[] = [
  {
    id: 'py',
    title: 'Python for Beginners',
    cat: 'Python',
    level: 'Beginner',
    lessons: 10,
    done: 6,
    time: '2h 30m',
    art: 'code',
    tile: 'lav',
    mentor: 'arjun',
    about: 'Write your first programs, work with data and build small tools, one bite-sized lesson at a time.',
    outcomes: ['Think like a programmer', 'Use loops, lists and functions', 'Build a small command-line tool'],
    modules: [
      { title: 'Getting started', lessons: 2, topics: ['Introduction to Python', 'Your first program with print'] },
      { title: 'Variables and types', lessons: 3, topics: ['Variables and data types', 'Operators and user input', 'Lists and dictionaries'] },
      { title: 'Loops and iteration', lessons: 3, topics: ['Conditions with if and else', 'for loops and range()', 'while loops, break and continue'] },
      { title: 'Functions', lessons: 2, topics: ['Defining and calling functions', 'Parameters and return values'] },
    ],
  },
  {
    id: 'ai',
    title: 'Intro to Generative AI',
    cat: 'AI',
    level: 'Beginner',
    lessons: 10,
    done: 3,
    time: '2h 50m',
    art: 'ai',
    tile: 'peach',
    mentor: 'lena',
    about: 'Understand how language models work, write prompts that give reliable results and build your first AI-powered feature.',
    outcomes: ['How language models generate text', 'Prompt patterns that work', 'Calling an AI API from your app'],
    modules: [
      { title: 'What is generative AI?', lessons: 3, topics: ['What generative AI is', 'How language models work', 'Strengths and limits'] },
      { title: 'Writing great prompts', lessons: 3, topics: ['Prompt basics: be specific', 'Context, roles and examples', 'Iterating and refining prompts'] },
      { title: 'Building with an AI API', lessons: 2, topics: ['Your first API request', 'Messages, streaming and errors'] },
      { title: 'Using AI responsibly', lessons: 2, topics: ['Bias, privacy and safety', 'Verifying and using AI responsibly'] },
    ],
  },
  {
    id: 'web',
    title: 'Web Foundations',
    cat: 'Web',
    level: 'Beginner',
    lessons: 10,
    done: 0,
    time: '2h 10m',
    art: 'web',
    tile: 'sky',
    mentor: 'sofia',
    about: 'Build and style real web pages with HTML, CSS and JavaScript, then publish your first site.',
    outcomes: ['Structure pages with HTML', 'Style layouts with CSS', 'Add interaction with JavaScript'],
    modules: [
      { title: 'HTML structure', lessons: 3, topics: ['How the web and HTML pages work', 'Headings, text, links and images', 'Lists, tables and forms'] },
      { title: 'Styling with CSS', lessons: 3, topics: ['CSS selectors and colours', 'The box model and spacing', 'Flexbox layouts'] },
      { title: 'JavaScript basics', lessons: 2, topics: ['Variables and functions', 'Events and the DOM'] },
      { title: 'Your first website', lessons: 2, topics: ['Building a responsive page', 'Publishing your site'] },
    ],
  },
  {
    id: 'git',
    title: 'Git and GitHub Essentials',
    cat: 'Tools',
    level: 'Beginner',
    lessons: 10,
    done: 8,
    time: '1h 40m',
    art: 'git',
    tile: 'mint',
    mentor: 'kofi',
    about: 'Track changes, branch safely and collaborate on code the way real teams do.',
    outcomes: ['Commit and review history', 'Branch and merge safely', 'Open your first pull request'],
    modules: [
      { title: 'Why version control', lessons: 2, topics: ['What version control is', 'Installing and configuring Git'] },
      { title: 'Commits and history', lessons: 3, topics: ['Creating a repository', 'Staging and committing', 'Viewing history'] },
      { title: 'Branches and merges', lessons: 3, topics: ['Creating and switching branches', 'Merging branches', 'Resolving conflicts'] },
      { title: 'Pull requests', lessons: 2, topics: ['Pushing to GitHub', 'Opening a pull request'] },
    ],
  },
  {
    id: 'sql',
    title: 'SQL and Databases',
    cat: 'Data',
    level: 'Beginner',
    lessons: 10,
    done: 0,
    time: '2h 0m',
    art: 'data',
    tile: 'butter',
    mentor: 'arjun',
    about: 'Query, filter and join data to answer real questions about the world.',
    outcomes: ['Read data with SELECT', 'Filter and sort results', 'Join tables together'],
    modules: [
      { title: 'Tables and rows', lessons: 2, topics: ['Databases, tables and rows', 'Creating tables and inserting data'] },
      { title: 'SELECT and WHERE', lessons: 3, topics: ['SELECT and choosing columns', 'Filtering with WHERE', 'Sorting with ORDER BY and LIMIT'] },
      { title: 'Joining tables', lessons: 3, topics: ['Primary and foreign keys', 'INNER JOIN', 'LEFT JOIN'] },
      { title: 'Grouping and totals', lessons: 2, topics: ['COUNT, SUM and AVG', 'GROUP BY and HAVING'] },
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud Fundamentals',
    cat: 'Cloud',
    level: 'Beginner',
    lessons: 10,
    done: 0,
    time: '1h 50m',
    art: 'cloud',
    tile: 'lav',
    mentor: 'kofi',
    about: 'Learn how apps run in the cloud, from servers and storage to your first deploy.',
    outcomes: ['What the cloud really is', 'Compute, storage and networks', 'Deploy a small app'],
    modules: [
      { title: 'What is the cloud?', lessons: 3, topics: ['What cloud computing is', 'IaaS, PaaS and SaaS', 'Regions and availability zones'] },
      { title: 'Compute and storage', lessons: 3, topics: ['Virtual machines and containers', 'Storage and databases', 'Networking and load balancers'] },
      { title: 'Deploying an app', lessons: 2, topics: ['Deploying your first app', 'Domains, HTTPS and logs'] },
      { title: 'Costs and security', lessons: 2, topics: ['Understanding costs', 'Security and access basics'] },
    ],
  },
];

export const CATEGORIES: ('All' | Category)[] = ['All', 'Python', 'Web', 'AI', 'Data', 'Tools', 'Cloud'];

export type GoalId = 'web' | 'ai' | 'data' | 'python';
export const GOALS: { id: GoalId; label: string; art: ArtKind; tile: TileKey; cat: Category }[] = [
  { id: 'web', label: 'Web development', art: 'web', tile: 'sky', cat: 'Web' },
  { id: 'ai', label: 'AI and prompting', art: 'ai', tile: 'peach', cat: 'AI' },
  { id: 'data', label: 'Data and SQL', art: 'data', tile: 'butter', cat: 'Data' },
  { id: 'python', label: 'Python coding', art: 'code', tile: 'lav', cat: 'Python' },
];

export function getCourse(id: string): Course {
  return COURSES.find((c) => c.id === id) ?? COURSES[0];
}

// Lesson numbers (1-based) the learner has marked complete. Everyone starts with none done.
export function doneSet(_course: Course, extra: number[] = []): Set<number> {
  return new Set(extra);
}

export function coursePercent(c: Course, extra?: number[]): number {
  return c.lessons ? Math.min(1, doneSet(c, extra).size / c.lessons) : 0;
}

export function isCourseComplete(c: Course, extra?: number[]): boolean {
  return doneSet(c, extra).size >= c.lessons;
}

// First lesson that is not finished yet, or null when the whole course is done.
export function nextLessonNumber(c: Course, extra?: number[]): number | null {
  const done = doneSet(c, extra);
  for (let n = 1; n <= c.lessons; n++) if (!done.has(n)) return n;
  return null;
}

// 'todo' is not started yet. Nothing is locked: learners can open any lesson in any order.
export type ModuleStatus = 'done' | 'current' | 'todo';

// Works out each lesson's status (done, next up, to do) and rolls it up per module.
export function courseModules(course: Course, extra?: number[]) {
  const done = doneSet(course, extra);
  const next = nextLessonNumber(course, extra);
  let total = 0;
  return course.modules.map((m, i) => {
    const start = total;
    total += m.lessons;
    const items = m.topics.map((title, n) => {
      const number = start + n + 1; // lesson number within the whole course
      const status: ModuleStatus = done.has(number) ? 'done' : number === next ? 'current' : 'todo';
      return { number, title, status };
    });
    const finished = items.filter((l) => l.status === 'done').length;
    const status: ModuleStatus = finished === items.length ? 'done' : items.some((l) => l.status === 'current') ? 'current' : 'todo';
    const label = status === 'done' ? 'Completed' : finished > 0 ? 'In progress' : status === 'current' ? 'Up next' : 'Not started';
    return { ...m, index: i + 1, status, label, items };
  });
}
