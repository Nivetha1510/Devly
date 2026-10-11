import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import CourseArt from '../components/CourseArt';
import { Footer } from '../components/Screen';
import Txt from '../components/Txt';
import { Button, Card, IconButton, Pill } from '../components/ui';
import { useApp, useStyles } from '../context/AppContext';
import { coursePercent, courseModules, getCourse, isCourseComplete, nextLessonNumber } from '../data/courses';
import { PEOPLE } from '../data/people';
import { RootScreenProps } from '../navigation/types';
import { Colors, tileColors } from '../theme/palette';

export default function CourseDetailScreen({ navigation, route }: RootScreenProps<'CourseDetail'>) {
  const { colors: c, isDark, prefs, toggleSaved } = useApp();
  const s = useStyles(makeStyles);
  const insets = useSafeAreaInsets();

  const course = getCourse(route.params.courseId);
  const tile = tileColors(isDark, course.tile);
  const mentor = PEOPLE[course.mentor];
  const saved = !!prefs.saved[course.id];
  const extra = prefs.completed[course.id];
  const modules = courseModules(course, extra);
  const complete = isCourseComplete(course, extra);
  const doneCount = Math.round(coursePercent(course, extra) * course.lessons);
  const lessons = modules.flatMap((m) => m.items);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[s.banner, { backgroundColor: tile.bg, paddingTop: insets.top + 56 }]}>
          <CourseArt kind={course.art} ink={tile.ink} ink2={tile.ink2} paper={c.paper} width={220} />
          <View style={[s.bannerBar, { top: insets.top + 10 }]}>
            <IconButton icon="chevron-back" label="Back" onPress={() => navigation.goBack()} bordered={false} elevated />
            <IconButton
              icon={saved ? 'bookmark' : 'bookmark-outline'}
              label={saved ? 'Remove from saved' : 'Save course'}
              selected={saved}
              color={saved ? c.primary : c.text}
              onPress={() => toggleSaved(course.id)}
              bordered={false}
              elevated
            />
          </View>
        </View>

        <View style={s.body}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pill label={course.cat} bg={c.primarySoft} fg={c.primaryText} />
            <Pill label={course.level} bg={c.surface2} fg={c.muted} />
          </View>
          <Txt v="h1">{course.title}</Txt>
          <View style={{ flexDirection: 'row', gap: 18 }}>
            <Meta icon="book-outline" label={`${course.lessons} lessons`} />
            <Meta icon="time-outline" label={course.time} />
            <Meta icon="trophy-outline" label="Certificate" />
          </View>

          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
            <Avatar who={course.mentor} size={48} />
            <View style={{ flex: 1 }}>
              <Txt v="caption">Your mentor</Txt>
              <Txt v="bodyBold">{mentor.full}</Txt>
              <Txt v="small">{mentor.role}</Txt>
            </View>
          </Card>

          <Txt v="body" color={c.muted}>
            {course.about}
          </Txt>

          <View style={{ gap: 10 }}>
            <Txt v="h3">What you will learn</Txt>
            {course.outcomes.map((o) => (
              <View key={o} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={s.tick}>
                  <Ionicons name="checkmark" size={14} color={c.successText} />
                </View>
                <Txt v="small" color={c.text} style={{ fontSize: 14 }}>
                  {o}
                </Txt>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Txt v="h3">Lessons</Txt>
            <Txt v="caption">
              {doneCount} of {course.lessons} lessons
            </Txt>
          </View>
          <Card style={{ padding: 6 }}>
            {lessons.map((l) => {
              return (
                <Pressable
                  key={l.title}
                  accessibilityRole="button"
                  accessibilityLabel={`Lesson ${l.number}, ${l.title}`}
                  onPress={() => navigation.navigate('Lesson', { courseId: course.id, lesson: l.number })}
                  style={({ pressed }) => [s.lessonRow, l.status === 'current' && { backgroundColor: c.primarySoft }, pressed && { backgroundColor: c.surface2 }]}
                >
                  <View style={[s.lessonDot, { backgroundColor: l.status === 'done' ? c.successSoft : l.status === 'current' ? c.primary : c.surface2 }]}>
                    {l.status === 'done' ? (
                      <Ionicons name="checkmark" size={15} color={c.successText} />
                    ) : l.status === 'current' ? (
                      <Ionicons name="play" size={13} color={c.onPrimary} />
                    ) : (
                      <Txt v="caption" color={c.muted} style={{ fontSize: 12 }}>
                        {l.number}
                      </Txt>
                    )}
                  </View>
                  <Txt v="bodyBold" color={c.text} style={{ flex: 1, fontSize: 14 }}>
                    {l.number}. {l.title}
                  </Txt>
                </Pressable>
              );
            })}
          </Card>

          {complete ? (
            <Card tint={c.successSoft} style={{ gap: 10 }}>
              <Txt v="bodyBold" color={c.successText}>
                You finished every lesson!
              </Txt>
              <Txt v="small" color={c.successText}>
                Test what you learned with the Master Quiz.
              </Txt>
              <Button
                label="Take the Master Quiz"
                icon="arrow-forward"
                onPress={() => navigation.navigate('QuizSession', { courseId: course.id, module: -1, kind: 'master' })}
              />
            </Card>
          ) : (
            <Txt v="caption">Finish all {course.lessons} lessons, then take the Master Quiz.</Txt>
          )}
        </View>
      </ScrollView>

      <Footer>
        {complete ? (
          <Button
            label="Take the Master Quiz"
            icon="arrow-forward"
            onPress={() => navigation.navigate('QuizSession', { courseId: course.id, module: -1, kind: 'master' })}
            style={{ flex: 1 }}
          />
        ) : (
          <Button
            label={doneCount > 0 ? `Continue · Lesson ${nextLessonNumber(course, extra)}` : 'Start course'}
            icon="play"
            onPress={() => navigation.navigate('Lesson', { courseId: course.id })}
            style={{ flex: 1 }}
          />
        )}
      </Footer>
    </View>
  );
}

function Meta({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  const { colors: c } = useApp();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Ionicons name={icon} size={17} color={c.muted} />
      <Txt v="caption" style={{ fontSize: 13 }}>
        {label}
      </Txt>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    banner: {
      alignItems: 'center',
      paddingBottom: 24,
      borderBottomLeftRadius: 36,
      borderBottomRightRadius: 36,
    },
    bannerBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
    body: { padding: 20, paddingBottom: 32, gap: 16, width: '100%', maxWidth: 760, alignSelf: 'center' },
    tick: { width: 24, height: 24, borderRadius: 12, backgroundColor: c.successSoft, alignItems: 'center', justifyContent: 'center' },
    lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 10, borderRadius: 14 },
    lessonDot: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  });
