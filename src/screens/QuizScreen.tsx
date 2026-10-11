import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar, { MyAvatar } from '../components/Avatar';
import Screen from '../components/Screen';
import Txt from '../components/Txt';
import { Button, Card, FadeIn, IconButton, Pill, ProgressBar } from '../components/ui';
import { useApp, useStyles } from '../context/AppContext';
import { getCourse } from '../data/courses';
import {
  buildMasterQuiz,
  buildTopicQuiz,
  isPass,
  PASS_PERCENT,
  percentOf,
  PracticeQuestion,
  topicBreakdown,
} from '../data/practice';
import { RootScreenProps } from '../navigation/types';
import { F } from '../theme/fonts';
import { Colors } from '../theme/palette';

type OptionState = 'idle' | 'picked' | 'right' | 'wrong';

// Plain-text version of a question, used in the results review.
const questionText = (q: PracticeQuestion) => `${q.before}${q.code ?? ''}${q.after ?? ''}`;

export default function QuizScreen({ navigation, route }: RootScreenProps<'QuizSession'>) {
  const { colors: c, prefs, recordAttempt } = useApp();
  const s = useStyles(makeStyles);

  const course = getCourse(route.params.courseId);
  const { module: moduleIndex, topics, count, kind } = route.params;
  // Master Quiz: every topic of the course (module -1 is the older way of asking for it).
  const master = kind === 'master' || moduleIndex < 0;
  const single = !master && !topics ? course.modules[moduleIndex] ?? course.modules[0] : null;
  const topicTitle = master
    ? 'Master Quiz'
    : single
      ? single.title
      : topics && topics.length === 1
        ? topics[0]
        : `${topics?.length ?? 0} topics`;

  // Built fresh for every attempt, so the mix and the order change each time.
  const build = (): PracticeQuestion[] => {
    if (master) return buildMasterQuiz(course);
    if (topics) return buildTopicQuiz(course, topics, count ?? topics.length * 5).questions;
    return buildTopicQuiz(course, [single!.title], 99).questions;
  };

  const [questions, setQuestions] = useState<PracticeQuestion[]>(build);
  const total = questions.length;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [checked, setChecked] = useState<boolean[]>(() => questions.map(() => false));
  const [done, setDone] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);
  const saved = useRef(false);

  const correctCount = answers.filter((a, i) => a === questions[i]?.answer).length;

  // Save the attempt once, when the quiz is finished.
  useEffect(() => {
    if (!done || saved.current || total === 0) return;
    saved.current = true;
    const res = recordAttempt({
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
      courseId: course.id,
      kind: master ? 'master' : 'topic',
      correct: correctCount,
      total,
      per: topicBreakdown(questions, answers),
      ...(master ? { passed: isPass(correctCount, total) } : null),
    });
    setXpAwarded(res.xpAwarded);
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = questions[index];
  const picked = answers[index];
  const isChecked = checked[index];
  const last = index === total - 1;

  const setPicked = (i: number) => setAnswers((a) => a.map((v, n) => (n === index ? i : v)));
  const check = () => setChecked((a) => a.map((v, n) => (n === index ? true : v)));
  const advance = () => (last ? setDone(true) : setIndex((i) => i + 1));
  const skip = () => {
    setAnswers((a) => a.map((v, n) => (n === index ? null : v)));
    advance();
  };

  const restart = () => {
    const next = build();
    setQuestions(next);
    setIndex(0);
    setAnswers(next.map(() => null));
    setChecked(next.map(() => false));
    setDone(false);
    setXpAwarded(0);
    saved.current = false;
  };

  if (total === 0) {
    return (
      <Screen>
        <IconButton icon="close" label="Exit quiz" onPress={() => navigation.goBack()} />
        <Txt v="h2">No questions yet</Txt>
        <Txt v="body" color={c.muted}>
          This topic does not have questions yet. Try another topic.
        </Txt>
      </Screen>
    );
  }

  if (done) {
    const score = correctCount;
    const skipped = answers.filter((a) => a === null).length;
    const missed = questions.map((qq, i) => ({ q: qq, i, a: answers[i] })).filter((r) => r.a !== r.q.answer);
    const pct = percentOf(score, total);
    const passed = isPass(score, total);
    const per = Object.entries(topicBreakdown(questions, answers));
    const myCert = prefs.certificates.find((x) => x.course_id === course.id);
    const title = master
      ? passed
        ? 'You passed!'
        : 'Not passed yet'
      : score === total
        ? 'Perfect score!'
        : score / total >= 0.6
          ? 'Great job!'
          : 'Keep practising';
    const failedMaster = master && !passed;
    return (
      <Screen contentStyle={{ alignItems: 'stretch' }}>
        <FadeIn style={s.trophyStage}>
          <View style={s.trophyGlow} />
          <View style={s.trophy}>
            <Ionicons name={failedMaster ? 'ribbon-outline' : 'trophy'} size={72} color={failedMaster ? c.muted : c.warn} />
          </View>
          <View style={{ position: 'absolute', right: 18, bottom: 0 }}>
            <MyAvatar size={56} ring={c.bg} />
          </View>
        </FadeIn>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Txt v="eyebrow">{`${course.title} · ${topicTitle}`.toUpperCase()}</Txt>
          <Txt v="h1" style={{ fontSize: 30, lineHeight: 36, textAlign: 'center' }}>
            {title}
          </Txt>
          <Txt v="body" color={c.muted} style={{ fontSize: 16, textAlign: 'center' }}>
            You got {score} of {total} right ({pct}%)
            {skipped ? ` · ${skipped} skipped` : ''}
          </Txt>
          {master ? (
            <Txt v="small" color={passed ? c.successText : c.dangerText} style={{ textAlign: 'center' }}>
              {passed
                ? `The pass mark is ${PASS_PERCENT}%. Well done!`
                : `You need ${PASS_PERCENT}% to pass. Review the topics below and try again.`}
            </Txt>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat value={`${score}/${total}`} label="Score" color={c.primaryText} />
          <Stat value={`${pct}%`} label="Accuracy" color={c.successText} />
          <Stat value={`+${xpAwarded}`} label="XP earned" color={c.warnText} />
        </View>

        {master && passed ? (
          <Card tint={c.successSoft} style={{ gap: 10, padding: 16 }}>
            <Txt v="h3" color={c.successText}>
              Congratulations!
            </Txt>
            <Txt v="small" color={c.successText}>
              {myCert
                ? 'You already hold a certificate for this course.'
                : `You passed the ${course.title} Master Quiz. Your certificate is ready.`}
            </Txt>
            <Button
              label={myCert ? 'View your certificate' : 'Get your certificate'}
              icon="ribbon"
              onPress={() => navigation.navigate('Certificate', { courseId: course.id })}
            />
          </Card>
        ) : null}

        {per.length > 1 ? (
          <View style={{ gap: 8 }}>
            <Txt v="h3">By topic</Txt>
            {per.map(([topic, [cc, tt]]) => {
              const weak = percentOf(cc, tt) < PASS_PERCENT;
              return (
                <Card key={topic} style={{ padding: 12, gap: 8, borderRadius: 18 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Txt v="bodyBold" style={{ flex: 1, fontSize: 14 }}>
                      {topic}
                    </Txt>
                    <Pill label={weak ? 'Needs work' : 'Strong'} bg={weak ? c.warnSoft : c.successSoft} fg={weak ? c.warnText : c.successText} />
                    <Txt v="caption">
                      {cc}/{tt}
                    </Txt>
                  </View>
                  <ProgressBar value={tt ? cc / tt : 0} color={weak ? c.warn : c.success} />
                </Card>
              );
            })}
          </View>
        ) : null}

        {missed.length > 0 ? (
          <View style={{ gap: 10 }}>
            <Txt v="h3">Review these concepts</Txt>
            {missed.map(({ q: mq, i, a }) => (
              <Card key={mq.id} style={{ gap: 8, padding: 14, borderRadius: 20 }}>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <Pill
                    label={a === null ? 'Skipped' : 'Incorrect'}
                    bg={a === null ? c.warnSoft : c.dangerSoft}
                    fg={a === null ? c.warnText : c.dangerText}
                  />
                  <Txt v="caption">
                    Question {i + 1} · {mq.topic}
                  </Txt>
                </View>
                <Txt v="bodyBold" style={{ fontSize: 15 }}>
                  {questionText(mq)}
                </Txt>
                {a !== null ? (
                  <Txt v="small" color={c.dangerText}>
                    Your answer: {mq.options[a]}
                  </Txt>
                ) : null}
                <Txt v="small" color={c.successText}>
                  Correct answer: {mq.options[mq.answer]}
                </Txt>
                <View style={s.note}>
                  <Ionicons name="bulb-outline" size={18} color={c.primaryText} />
                  <Txt v="small" color={c.text} style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
                    {mq.explain}
                  </Txt>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card tint={c.successSoft} style={{ alignItems: 'center', padding: 16 }}>
            <Txt v="bodyBold" color={c.successText}>
              Every answer was correct. Nothing to review!
            </Txt>
          </Card>
        )}

        <View style={{ gap: 10, marginTop: 4 }}>
          <Button label={master ? 'Try the Master Quiz again' : 'Try again'} onPress={restart} />
          <Button
            label="Back to Practice"
            variant="secondary"
            onPress={() => navigation.navigate('PracticeLanguage', { courseId: course.id })}
          />
        </View>
      </Screen>
    );
  }

  const correct = isChecked && picked === q.answer;

  return (
    <Screen
      footer={
        <>
          <Button label="Skip" variant="secondary" size="md" onPress={skip} disabled={isChecked} style={{ flex: 1 }} />
          <Button label="Check" variant="soft" size="md" onPress={check} disabled={isChecked || picked === null} style={{ flex: 1.2 }} />
          <Button
            label={last ? 'Submit' : 'Next'}
            size="md"
            icon={last ? 'checkmark' : 'arrow-forward'}
            onPress={advance}
            disabled={picked === null}
            style={{ flex: 1.3 }}
          />
        </>
      }
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconButton icon="close" label="Exit quiz" onPress={() => navigation.goBack()} />
        <View style={{ flex: 1, gap: 6 }}>
          <Txt v="caption">
            Question {index + 1} of {total}
          </Txt>
          <ProgressBar value={(index + 1) / total} />
        </View>
        <Pill
          icon="checkmark"
          label={`${answers.filter((a, i) => checked[i] && a === questions[i].answer).length} correct`}
          bg={c.successSoft}
          fg={c.successText}
        />
      </View>

      <View>
        <Txt v="eyebrow">{`${course.title} · ${topicTitle}`.toUpperCase()}</Txt>
        <Txt v="h2" style={{ fontSize: 24, lineHeight: 32, marginTop: 6 }}>
          {q.before}
          {q.code ? <Text style={s.qCode}> {q.code} </Text> : null}
          {q.after}
        </Txt>
      </View>

      <View style={{ gap: 10 }}>
        {q.options.map((opt, i) => {
          let st: OptionState = 'idle';
          if (isChecked && i === q.answer) st = 'right';
          else if (isChecked && i === picked) st = 'wrong';
          else if (i === picked) st = 'picked';
          const look = {
            idle: { bg: c.surface, bd: c.border, badgeBg: c.surface2, badgeFg: c.muted, fg: c.text },
            picked: { bg: c.primarySoft, bd: c.primary, badgeBg: c.primary, badgeFg: c.onPrimary, fg: c.text },
            right: { bg: c.successSoft, bd: c.success, badgeBg: c.success, badgeFg: c.onPrimary, fg: c.successText },
            wrong: { bg: c.dangerSoft, bd: c.danger, badgeBg: c.danger, badgeFg: c.onPrimary, fg: c.dangerText },
          }[st];
          return (
            <Pressable
              key={opt}
              accessibilityRole="button"
              accessibilityState={{ selected: i === picked, disabled: isChecked }}
              onPress={() => !isChecked && setPicked(i)}
              style={({ pressed }) => [s.option, { backgroundColor: look.bg, borderColor: look.bd, transform: [{ scale: pressed && !isChecked ? 0.98 : 1 }] }]}
            >
              <View style={[s.optBadge, { backgroundColor: look.badgeBg }]}>
                {st === 'right' ? (
                  <Ionicons name="checkmark" size={17} color={look.badgeFg} />
                ) : st === 'wrong' ? (
                  <Ionicons name="close" size={17} color={look.badgeFg} />
                ) : (
                  <Text style={{ fontFamily: F.heavy, fontSize: 14, color: look.badgeFg }}>{'ABCD'[i]}</Text>
                )}
              </View>
              <Text style={{ flex: 1, fontFamily: q.monoOptions ? F.monoBold : F.bold, fontSize: 15, color: look.fg }}>{opt}</Text>
              {st === 'right' ? <Text style={[s.optStatus, { color: look.fg }]}>Correct</Text> : null}
              {st === 'wrong' ? <Text style={[s.optStatus, { color: look.fg }]}>Your answer</Text> : null}
            </Pressable>
          );
        })}
      </View>

      {isChecked ? (
        <FadeIn key={index} style={[s.feedback, { backgroundColor: correct ? c.successSoft : c.dangerSoft }]}>
          <Avatar who={course.mentor} size={40} />
          <View style={{ flex: 1 }}>
            <Txt v="bodyBold" color={correct ? c.successText : c.dangerText}>
              {correct ? 'Nice work!' : 'Not quite'}
            </Txt>
            <Txt v="small" color={correct ? c.successText : c.dangerText} style={{ fontSize: 14, lineHeight: 21, marginTop: 2 }}>
              {q.explain}
            </Txt>
          </View>
        </FadeIn>
      ) : null}
    </Screen>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <Card style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8, paddingVertical: 14, borderRadius: 18 }}>
      <Txt v="h3" color={color} style={{ fontSize: 19 }}>
        {value}
      </Txt>
      <Txt v="caption" style={{ marginTop: 2 }}>
        {label}
      </Txt>
    </Card>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    qCode: { fontFamily: F.mono, fontSize: 19, backgroundColor: c.surface2, color: c.text },
    option: { minHeight: 62, borderWidth: 2, borderRadius: 18, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
    optBadge: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    optStatus: { fontFamily: F.heavy, fontSize: 12 },
    feedback: { borderRadius: 20, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    note: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: c.primarySoft, borderRadius: 14, padding: 12 },
    trophyStage: { width: 240, height: 190, alignSelf: 'center' },
    trophyGlow: { position: 'absolute', left: 40, top: 10, width: 160, height: 160, borderRadius: 80, backgroundColor: c.primarySoft },
    trophy: { position: 'absolute', left: 40, top: 10, width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  });
