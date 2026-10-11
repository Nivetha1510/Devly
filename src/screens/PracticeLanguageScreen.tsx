import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import CourseBadge from '../components/CourseBadge';
import Screen from '../components/Screen';
import Txt from '../components/Txt';
import { Button, Card, IconButton, Pill } from '../components/ui';
import { useApp, useStyles } from '../context/AppContext';
import { getCourse } from '../data/courses';
import {
  bestMaster,
  COUNT_OPTIONS,
  courseQuestionCount,
  isPass,
  PASS_PERCENT,
  percentOf,
  topicAccuracy,
  topicsOf,
} from '../data/practice';
import { RootScreenProps } from '../navigation/types';
import { Colors } from '../theme/palette';

// One screen for every language: the course id decides the icon, colours, topics and stats.
export default function PracticeLanguageScreen({ navigation, route }: RootScreenProps<'PracticeLanguage'>) {
  const { colors: c, prefs } = useApp();
  const s = useStyles(makeStyles);
  const course = getCourse(route.params.courseId);

  const topics = useMemo(() => topicsOf(course), [course]);
  const accuracy = topicAccuracy(prefs.attempts, course.id);
  const best = bestMaster(prefs.attempts, course.id);
  const cert = prefs.certificates.find((x) => x.course_id === course.id);
  const lessonsDone = (prefs.completed[course.id] ?? []).length;

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [count, setCount] = useState(10);

  const chosen = topics.filter((t) => selected[t.title]);
  const available = chosen.reduce((n, t) => n + t.questions, 0);
  const allSelected = chosen.length === topics.length;

  // 5, 10, 15 - but never more than the chosen topics can supply (always offer at least one chip).
  const counts = COUNT_OPTIONS.filter((n) => n <= available);
  const chips = counts.length ? counts : available > 0 ? [available] : [];
  const effective = Math.min(count, available);
  const short = available > 0 && count > available;

  const toggle = (title: string) => setSelected((cur) => ({ ...cur, [title]: !cur[title] }));
  const selectAll = () => setSelected(Object.fromEntries(topics.map((t) => [t.title, true])));
  const clear = () => setSelected({});

  const start = () =>
    navigation.navigate('QuizSession', {
      courseId: course.id,
      module: 0,
      kind: 'topic',
      topics: chosen.map((t) => t.title),
      count: effective,
    });

  const bestPct = best ? percentOf(best.correct, best.total) : null;
  const passed = best ? isPass(best.correct, best.total) : false;

  return (
    <Screen
      footer={
        <Button
          label={chosen.length ? `Start practice · ${effective} questions` : 'Choose at least one topic'}
          icon="play"
          disabled={chosen.length === 0 || available === 0}
          onPress={start}
          style={{ flex: 1 }}
        />
      }
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconButton icon="chevron-back" label="Back" onPress={() => navigation.goBack()} />
        <Txt v="eyebrow">PRACTICE</Txt>
      </View>

      {/* Header */}
      <View style={s.head}>
        <CourseBadge course={course} size={64} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt v="h2">{course.title}</Txt>
          <Txt v="small">
            {topics.length} topics · {courseQuestionCount(course)} questions
          </Txt>
        </View>
      </View>

      {/* Master Quiz */}
      <Card tint={c.primarySoft} style={{ gap: 12, borderRadius: 26 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="trophy" size={26} color={c.primaryText} />
          <View style={{ flex: 1 }}>
            <Txt v="h3">Master Quiz</Txt>
            <Txt v="caption" color={c.primaryText}>
              Covers all {topics.length} topics · up to 20 questions · pass mark {PASS_PERCENT}%
            </Txt>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Pill
            label={bestPct === null ? 'Best score: not attempted' : `Best score: ${bestPct}%`}
            bg={c.surface}
            fg={c.primaryText}
          />
          {bestPct !== null ? (
            <Pill label={passed ? 'Passed' : 'Not passed yet'} bg={passed ? c.successSoft : c.warnSoft} fg={passed ? c.successText : c.warnText} />
          ) : null}
          {cert ? <Pill icon="ribbon" label="Certified" bg={c.successSoft} fg={c.successText} /> : null}
        </View>
        <Txt v="caption" color={c.primaryText}>
          Lesson progress: {lessonsDone} of {course.lessons} lessons done
        </Txt>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            label={bestPct === null ? 'Start Master Quiz' : 'Take it again'}
            icon="arrow-forward"
            size="md"
            onPress={() => navigation.navigate('QuizSession', { courseId: course.id, module: -1, kind: 'master' })}
            style={{ flex: 1 }}
          />
          {cert ? (
            <Button
              label="Certificate"
              variant="secondary"
              size="md"
              iconLeft="ribbon-outline"
              onPress={() => navigation.navigate('Certificate', { courseId: course.id })}
              style={{ flex: 1 }}
            />
          ) : passed ? (
            <Button
              label="Get certificate"
              variant="secondary"
              size="md"
              iconLeft="ribbon-outline"
              onPress={() => navigation.navigate('Certificate', { courseId: course.id })}
              style={{ flex: 1 }}
            />
          ) : null}
        </View>
      </Card>

      {/* Topic picker */}
      <View style={{ gap: 10 }}>
        <View style={s.rowBetween}>
          <Txt v="h3">Choose your topics</Txt>
          <View style={{ flexDirection: 'row' }}>
            <Button label="Select all" variant="ghost" size="md" onPress={selectAll} disabled={allSelected} />
            <Button label="Clear" variant="ghost" size="md" onPress={clear} disabled={chosen.length === 0} />
          </View>
        </View>
        {topics.map((t) => {
          const on = !!selected[t.title];
          const acc = accuracy[t.title];
          return (
            <Pressable
              key={t.title}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${t.title}, ${t.questions} questions`}
              onPress={() => toggle(t.title)}
              style={({ pressed }) => [
                s.topic,
                { borderColor: on ? c.primary : c.border, backgroundColor: on ? c.primarySoft : c.surface },
                pressed && { opacity: 0.9 },
              ]}
            >
              <View style={[s.box, { borderColor: on ? c.primary : c.muted, backgroundColor: on ? c.primary : 'transparent' }]}>
                {on ? <Ionicons name="checkmark" size={16} color={c.onPrimary} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Txt v="bodyBold" style={{ fontSize: 15 }}>
                  {t.title}
                </Txt>
                <Txt v="caption">{t.questions} questions</Txt>
              </View>
              {acc && acc.total > 0 ? (
                <Pill label={`${percentOf(acc.correct, acc.total)}%`} bg={c.surface2} fg={c.text} />
              ) : (
                <Txt v="caption">Not attempted</Txt>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Question count */}
      <View style={{ gap: 10 }}>
        <Txt v="h3">Number of questions</Txt>
        {chips.length === 0 ? (
          <Txt v="small">Choose a topic to see how many questions you can practise.</Txt>
        ) : (
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            {chips.map((n) => {
              const on = effective === n;
              return (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => setCount(n)}
                  style={[s.chip, { borderColor: on ? c.primary : c.border, backgroundColor: on ? c.primarySoft : c.surface }]}
                >
                  <Txt v="bodyBold" color={on ? c.primaryText : c.text}>
                    {n}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
        )}
        {short ? (
          <Txt v="caption" color={c.warnText}>
            Your chosen topics have only {available} questions, so you will get {available}.
          </Txt>
        ) : null}
        <Txt v="caption">Topic practice does not give XP, but your answers count towards your strong and weak topics.</Txt>
      </View>
    </Screen>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    topic: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, borderWidth: 2, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
    box: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    chip: { minWidth: 64, minHeight: 48, borderWidth: 2, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  });
