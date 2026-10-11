import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Avatar from '../components/Avatar';
import Screen from '../components/Screen';
import Txt from '../components/Txt';
import { Button, FadeIn, IconButton, ProgressBar } from '../components/ui';
import { useApp, useStyles } from '../context/AppContext';
import { courseModules, getCourse, isCourseComplete, nextLessonNumber } from '../data/courses';
import { codeForEditor, langForFile } from '../data/editor';
import { getLessonContent, highlight } from '../data/lessons';
import { PEOPLE } from '../data/people';
import { RootScreenProps } from '../navigation/types';
import { F } from '../theme/fonts';
import { Colors, SYNTAX } from '../theme/palette';

export default function LessonScreen({ navigation, route }: RootScreenProps<'Lesson'>) {
  const { colors: c, prefs, update, setLessonComplete } = useApp();
  const s = useStyles(makeStyles);
  const [runs, setRuns] = useState(0);
  const bookmarked = !!prefs.lessonBookmarks[route.params.courseId];

  const course = getCourse(route.params.courseId);
  const extra = prefs.completed[course.id];
  const lessons = courseModules(course, extra).flatMap((m) => m.items);
  const number = route.params.lesson ?? nextLessonNumber(course, extra) ?? 1;
  const lesson = lessons.find((l) => l.number === number) ?? lessons[0];
  const lessonDone = lesson.status === 'done';

  // The screen can be reused for the next lesson, so start each lesson with no output shown.
  useEffect(() => {
    setRuns(0);
  }, [course.id, lesson.number]);
  const courseDone = isCourseComplete(course, extra);
  const content = getLessonContent(course.id, lesson.number);
  const mentor = PEOPLE[course.mentor];
  const editorLang = content?.code ? langForFile(content.code.file) : null;
  const hasNext = lesson.number < course.lessons;
  const goNext = () => navigation.replace('Lesson', { courseId: course.id, lesson: lesson.number + 1 });

  const toggleBookmark = () =>
    update({ lessonBookmarks: { ...prefs.lessonBookmarks, [route.params.courseId]: !bookmarked } });

  return (
    <Screen
      footer={
        <>
          <Button
            label={lessonDone ? 'Completed' : 'Mark as complete'}
            iconLeft={lessonDone ? 'checkmark-circle' : undefined}
            variant={lessonDone ? 'secondary' : 'primary'}
            onPress={() => setLessonComplete(course.id, lesson.number, !lessonDone)}
            style={{ flex: 1 }}
          />
          {courseDone ? (
            <Button
              label="Take the Master Quiz"
              icon="arrow-forward"
              onPress={() => navigation.navigate('QuizSession', { courseId: course.id, module: -1, kind: 'master' })}
              style={{ flex: 1 }}
            />
          ) : lessonDone && hasNext ? (
            <Button label="Next lesson" icon="arrow-forward" onPress={goNext} style={{ flex: 1 }} />
          ) : null}
        </>
      }
    >
      <View style={s.topRow}>
        <IconButton icon="chevron-back" label="Back to course" onPress={() => navigation.goBack()} />
        <View style={{ flex: 1, gap: 6 }}>
          <Txt v="caption">
            Lesson {lesson.number} of {course.lessons}
          </Txt>
          <ProgressBar value={lesson.number / course.lessons} />
        </View>
        <IconButton
          icon={bookmarked ? 'bookmark' : 'bookmark-outline'}
          label={bookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
          selected={bookmarked}
          color={bookmarked ? c.primary : c.text}
          onPress={toggleBookmark}
        />
      </View>

      <View>
        <Txt v="eyebrow">{course.title.toUpperCase()}</Txt>
        <Txt v="h1" style={{ marginTop: 4 }}>
          {lesson.title}
        </Txt>
        <Txt v="small" style={{ marginTop: 4 }}>
          {content ? `${content.minutes} min read${content.code ? ' · 1 example to run' : ''}` : 'Lesson content coming soon'}
        </Txt>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <Avatar who={course.mentor} size={44} />
        <View style={s.bubble}>
          <Txt v="caption" color={c.primaryText}>
            {mentor.first} · Mentor
          </Txt>
          <Txt v="small" color={c.text} style={{ fontSize: 14, lineHeight: 21, marginTop: 2 }}>
            {content?.tip ?? 'This lesson is being written. Check back soon.'}
          </Txt>
        </View>
      </View>

      {content?.body.map((para, i) => (
        <Txt key={i} v="body" style={{ fontSize: 16, lineHeight: 26 }}>
          {para.split('`').map((part, k) =>
            k % 2 ? (
              <Text key={k} style={s.inlineCode}>
                {part}
              </Text>
            ) : (
              part
            ),
          )}
        </Txt>
      ))}

      {content?.code ? (
        <>
      <View style={s.codeBox}>
        <View style={s.codeHead}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={[s.dot, { backgroundColor: '#F28B82' }]} />
            <View style={[s.dot, { backgroundColor: '#F6CD6B' }]} />
            <View style={[s.dot, { backgroundColor: '#74D3AE' }]} />
            <Text style={s.fileName}>{content.code.file}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {editorLang ? (
              <Button
                label="Edit & run"
                variant="soft"
                iconLeft="create-outline"
                size="md"
                onPress={() => navigation.navigate('CodeEditor', { lang: editorLang, code: codeForEditor(content.code!.file, content.code!.lines.join('\n')) })}
              />
            ) : null}
            <Button label={runs ? 'Run again' : 'Run'} iconLeft="play" size="md" onPress={() => setRuns((n) => n + 1)} />
          </View>
        </View>
        <View style={{ padding: 16, paddingTop: 14 }}>
          {content.code.lines.map((line, i) => (
            <Text key={i} style={s.code}>
              {highlight(line).map(([text, kind], j) => (
                <Text key={j} style={{ color: SYNTAX[kind] }}>
                  {text}
                </Text>
              ))}
            </Text>
          ))}
        </View>
      </View>

      {runs > 0 ? (
        <FadeIn key={runs} style={s.output}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="checkmark-circle" size={16} color={c.successText} />
            <Txt v="caption" color={c.successText}>
              Output · ran in 0.02s
            </Txt>
          </View>
          {content.code.output.map((l) => (
            <Text key={l} style={[s.code, { color: c.text }]}>
              {l}
            </Text>
          ))}
        </FadeIn>
      ) : (
        <View style={s.placeholder}>
          <Txt v="small">Press Run to see what this prints.</Txt>
        </View>
      )}

        </>
      ) : null}

      {content ? (
        <View style={s.tip}>
          <Ionicons name="bulb-outline" size={22} color={c.warnText} />
          <Txt v="small" color={c.warnText} style={{ flex: 1, fontSize: 14, lineHeight: 21 }}>
            <Text style={{ fontFamily: F.heavy }}>Try it: </Text>
            {content.tryIt}
          </Txt>
        </View>
      ) : null}
    </Screen>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    quizIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    bubble: {
      flex: 1,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 20,
      borderTopLeftRadius: 6,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    inlineCode: { fontFamily: F.mono, fontSize: 14, backgroundColor: c.surface2, color: c.text },
    codeBox: { backgroundColor: c.code, borderRadius: 20, overflow: 'hidden' },
    codeHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingLeft: 16,
      paddingRight: 8,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    dot: { width: 9, height: 9, borderRadius: 5 },
    fileName: { fontFamily: F.bold, fontSize: 12, color: '#B3B8D1', marginLeft: 6 },
    code: { fontFamily: F.mono, fontSize: 14, lineHeight: 24, color: SYNTAX.plain },
    output: { backgroundColor: c.successSoft, borderRadius: 18, padding: 14, gap: 4 },
    placeholder: { borderWidth: 2, borderStyle: 'dashed', borderColor: c.border, borderRadius: 18, padding: 14 },
    tip: { backgroundColor: c.warnSoft, borderRadius: 18, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  });
