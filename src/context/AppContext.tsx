import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import { GoalId } from '../data/courses';
import { AvatarKey, avatarsFor, Gender } from '../data/people';
import { cardAwardKey, CARD_XP, nextCardState, SwipeDirection } from '../data/flashcards';
import { DEFAULT_REMINDER } from '../data/reminder';
import {
  addAttempt,
  Attempt,
  awardXp,
  bestMaster,
  Certificate,
  issueCertificate,
  masterAwardKey,
  MASTER_XP,
  percentOf,
  totalAwardedXp,
} from '../data/practice';
import { computeStats, dayKey, MINUTES_PER_LESSON, Stats } from '../data/stats';
import { AccentKey, buildColors, Colors } from '../theme/palette';

export type Level = 'Beginner' | 'Improving' | 'Confident';

// Everything that belongs to one learner. Kept per account so a new user starts clean.
export type UserData = {
  gender: Gender | '';
  avatar: AvatarKey;
  photo: string; // data URI of a picture the learner chose; empty = use the illustrated avatar
  goal: GoalId;
  level: Level;
  saved: Record<string, boolean>;
  lessonBookmarks: Record<string, boolean>;
  completed: Record<string, number[]>; // courseId -> lesson numbers marked complete
  activity: Record<string, number>; // YYYY-MM-DD -> minutes learned that day
  dailyGoal: number;
  attempts: Attempt[]; // practice history, newest first
  certificates: Certificate[];
  xpAwards: Record<string, number>; // one-off XP awards by key, e.g. master:py
  cards: Record<string, 'seen' | 'done'>; // flashcard progress by card id
  cardBookmarks: Record<string, boolean>;
};

export type Prefs = UserData & {
  name: string; // signed-in learner's name
  email: string;
  dark: boolean | null; // null = follow the phone's setting
  accent: AccentKey;
  reminders: boolean;
  reminderTime: string; // 24-hour HH:MM
  swipe: SwipeDirection; // how flashcards move: right-to-left or bottom-to-top
  onboarded: boolean;
  profiles: Record<string, UserData>; // saved data of learners who signed out, by email
};

const FRESH_USER: UserData = {
  gender: '',
  avatar: 'maya',
  photo: '',
  goal: 'web',
  level: 'Beginner',
  saved: {},
  lessonBookmarks: {},
  completed: {},
  activity: {},
  dailyGoal: 15,
  attempts: [],
  certificates: [],
  xpAwards: {},
  cards: {},
  cardBookmarks: {},
};

const DEFAULTS: Prefs = {
  ...FRESH_USER,
  name: '',
  email: '',
  dark: null,
  accent: 'iris',
  reminders: true,
  reminderTime: DEFAULT_REMINDER,
  swipe: 'horizontal',
  onboarded: false,
  profiles: {},
};

const USER_KEYS = Object.keys(FRESH_USER) as (keyof UserData)[];

function pickUser(p: Prefs): UserData {
  const out: Partial<UserData> = {};
  for (const k of USER_KEYS) (out as Record<string, unknown>)[k] = p[k];
  return out as UserData;
}

const STORAGE_KEY = 'devly:prefs:v1';

type AppCtx = {
  prefs: Prefs;
  ready: boolean;
  isDark: boolean;
  colors: Colors;
  update: (patch: Partial<Prefs>) => void;
  toggleDark: () => void;
  toggleSaved: (courseId: string) => void;
  setLessonComplete: (courseId: string, lesson: number, done: boolean) => void;
  stats: Stats;
  // Saves a practice attempt. Passing a Master Quiz for the first time awards XP once per language.
  recordAttempt: (attempt: Attempt) => { xpAwarded: number };
  // Issues (or returns the existing) certificate for a language the learner has passed.
  issueCertificateFor: (courseId: string, courseTitle: string, name: string) => Certificate | null;
  markCard: (id: string, action: 'seen' | 'done' | 'review') => void;
  toggleCardBookmark: (id: string) => void;
  setGender: (gender: Gender) => void;
  // Start a session: new accounts get a clean slate, returning ones get their saved data back.
  beginSession: (user: { name: string; email: string; gender?: Gender }, isNew: boolean) => void;
  // End the session: keep this learner's data for next time and clear it from the screen.
  endSession: () => void;
};

const AppContext = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [ready, setReady] = useState(false);

  // Load saved preferences once.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const loaded: Prefs = { ...DEFAULTS, ...JSON.parse(raw) };
          // Keep the avatar in line with the saved gender.
          if (loaded.gender && !avatarsFor(loaded.gender).includes(loaded.avatar)) loaded.avatar = avatarsFor(loaded.gender)[0];
          setPrefs(loaded);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  // Save whenever something changes.
  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)).catch(() => {});
  }, [prefs, ready]);

  const isDark = prefs.dark ?? system === 'dark';
  const colors = useMemo(() => buildColors(isDark, prefs.accent), [isDark, prefs.accent]);

  const update = useCallback((patch: Partial<Prefs>) => setPrefs((cur) => ({ ...cur, ...patch })), []);
  const toggleDark = useCallback(
    () => setPrefs((cur) => ({ ...cur, dark: !(cur.dark ?? system === 'dark') })),
    [system],
  );
  const toggleSaved = useCallback(
    (id: string) => setPrefs((cur) => ({ ...cur, saved: { ...cur.saved, [id]: !cur.saved[id] } })),
    [],
  );

  const setLessonComplete = useCallback(
    (id: string, lesson: number, done: boolean) =>
      setPrefs((cur) => {
        const had = (cur.completed[id] ?? []).includes(lesson);
        const rest = (cur.completed[id] ?? []).filter((n) => n !== lesson);
        const next = { ...cur, completed: { ...cur.completed, [id]: done ? [...rest, lesson] : rest } };
        if (done && !had) {
          const today = dayKey();
          next.activity = { ...cur.activity, [today]: (cur.activity[today] ?? 0) + MINUTES_PER_LESSON };
        }
        return next;
      }),
    [],
  );

  const setGender = useCallback(
    (gender: Gender) => setPrefs((cur) => ({ ...cur, gender, avatar: avatarsFor(gender)[0] })),
    [],
  );

  const beginSession = useCallback(
    (user: { name: string; email: string; gender?: Gender }, isNew: boolean) =>
      setPrefs((cur) => {
        const key = user.email.toLowerCase();
        const saved = isNew ? undefined : cur.profiles[key];
        const data: UserData = { ...FRESH_USER, ...saved };
        if (user.gender) {
          data.gender = user.gender;
          data.avatar = avatarsFor(user.gender)[0];
        } else if (!saved) {
          data.avatar = avatarsFor('')[0];
        }
        return { ...cur, ...data, name: user.name, email: user.email, onboarded: !isNew };
      }),
    [],
  );

  const endSession = useCallback(
    () =>
      setPrefs((cur) => {
        const profiles = cur.email ? { ...cur.profiles, [cur.email.toLowerCase()]: pickUser(cur) } : cur.profiles;
        return { ...cur, ...FRESH_USER, profiles, name: '', email: '', onboarded: false };
      }),
    [],
  );

  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  const recordAttempt = useCallback((attempt: Attempt) => {
    const cur = prefsRef.current;
    let awards = cur.xpAwards;
    let xpAwarded = 0;
    if (attempt.kind === 'master' && attempt.passed) {
      const res = awardXp(awards, masterAwardKey(attempt.courseId), MASTER_XP);
      awards = res.awards;
      xpAwarded = res.awarded;
    }
    setPrefs((p) => ({ ...p, attempts: addAttempt(p.attempts, attempt), xpAwards: { ...p.xpAwards, ...awards } }));
    return { xpAwarded };
  }, []);

  const issueCertificateFor = useCallback((courseId: string, courseTitle: string, name: string) => {
    const cur = prefsRef.current;
    const best = bestMaster(cur.attempts.filter((a) => a.passed), courseId);
    const existing = cur.certificates.find((c) => c.course_id === courseId);
    if (!best && !existing) return null; // never passed: nothing to certify
    const percent = best ? percentOf(best.correct, best.total) : existing!.percent;
    const res = issueCertificate(cur.certificates, {
      userId: cur.email.toLowerCase() || 'local',
      courseId,
      courseTitle,
      name,
      percent,
    });
    if (res.created) setPrefs((p) => ({ ...p, certificates: res.list }));
    return res.certificate;
  }, []);

  // Flashcard progress. Completing a card for the first time adds a minute of learning and a little XP.
  const markCard = useCallback((id: string, action: 'seen' | 'done' | 'review') => {
    setPrefs((p) => {
      const cards = nextCardState(p.cards, id, action);
      if (cards === p.cards) return p;
      const next = { ...p, cards };
      if (action === 'done' && p.cards[id] !== 'done') {
        const key = cardAwardKey(id);
        if (!(key in p.xpAwards)) next.xpAwards = { ...p.xpAwards, [key]: CARD_XP };
        const today = dayKey();
        next.activity = { ...p.activity, [today]: (p.activity[today] ?? 0) + 1 };
      }
      return next;
    });
  }, []);

  const toggleCardBookmark = useCallback(
    (id: string) => setPrefs((p) => ({ ...p, cardBookmarks: { ...p.cardBookmarks, [id]: !p.cardBookmarks[id] } })),
    [],
  );

  const stats = useMemo(
    () => computeStats(prefs.completed, prefs.activity, totalAwardedXp(prefs.xpAwards)),
    [prefs.completed, prefs.activity, prefs.xpAwards],
  );

  const value = useMemo(
    () => ({ prefs, ready, isDark, colors, update, toggleDark, toggleSaved, setLessonComplete, stats, recordAttempt, issueCertificateFor, markCard, toggleCardBookmark, setGender, beginSession, endSession }),
    [prefs, ready, isDark, colors, update, toggleDark, toggleSaved, setLessonComplete, stats, recordAttempt, issueCertificateFor, markCard, toggleCardBookmark, setGender, beginSession, endSession],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppCtx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

export function useColors(): Colors {
  return useApp().colors;
}

// Build a StyleSheet from the current colours: const s = useStyles(makeStyles)
// Define makeStyles outside the component so it is only rebuilt when colours change.
export function useStyles<T>(factory: (c: Colors) => T): T {
  const colors = useColors();
  return useMemo(() => factory(colors), [colors, factory]);
}
