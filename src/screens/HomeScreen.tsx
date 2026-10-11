import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar, { MyAvatar } from '../components/Avatar';
import CourseArt from '../components/CourseArt';
import { CourseTile } from '../components/CourseCards';
import Screen from '../components/Screen';
import Txt from '../components/Txt';
import { Button, Card, Grid, IconButton, IconName, Pill, ProgressBar, Ring, ThemeToggle } from '../components/ui';
import { useApp, useStyles } from '../context/AppContext';
import { COURSES, coursePercent, courseModules, getCourse, GOALS } from '../data/courses';
import { STUDY_ROOM_URL } from '../data/studyRoom';
import { TabScreenProps } from '../navigation/types';
import { useLayout } from '../theme/layout';
import { Colors, tileColors } from '../theme/palette';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Opens the study-room meeting link in the browser (or the meeting app).
function joinStudyRoom() {
  Linking.openURL(STUDY_ROOM_URL).catch(() => Alert.alert('Could not open the study room', STUDY_ROOM_URL));
}

export default function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const { colors: c, isDark, prefs, stats, setGender } = useApp();
  const s = useStyles(makeStyles);
  const { isWide } = useLayout();

  const firstName = prefs.name.trim().split(/\s+/)[0] || 'there';

  const goal = GOALS.find((g) => g.id === prefs.goal) ?? GOALS[0];

  // Resume the course the learner is part-way through; brand-new learners start on their goal's course.
  const inProgress = COURSES.find((x) => {
    const n = (prefs.completed[x.id] ?? []).length;
    return n > 0 && n < x.lessons;
  });
  const current = inProgress ?? COURSES.find((x) => x.cat === goal.cat) ?? COURSES[0];
  const tile = tileColors(isDark, current.tile);
  const extra = prefs.completed[current.id];
  const pct = coursePercent(current, extra);
  const lessonsDone = Math.round(pct * current.lessons);
  const started = lessonsDone > 0;
  const nextLesson = courseModules(current, extra).flatMap((m) => m.items).find((l) => l.status === 'current');
  const others = COURSES.filter((x) => x.id !== current.id);
  const picked = [...others.filter((x) => x.cat === goal.cat), ...others.filter((x) => x.cat !== goal.cat)].slice(0, 4);

  const minutes = stats.minutesToday;
  const reached = minutes >= prefs.dailyGoal;
  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0

  return (
    <Screen inTabs wide>
      {/* Header */}
      <View style={s.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => navigation.navigate('Profile')}>
          <MyAvatar size={48} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Txt v="small">{greeting()}</Txt>
          <Txt v="h2" style={{ fontSize: 24, lineHeight: 29 }}>
            Hi, {firstName}
          </Txt>
        </View>
        <ThemeToggle />
        <IconButton icon="notifications-outline" label="Notifications" dot onPress={() => navigation.navigate('Progress')} />
      </View>

      {!prefs.gender ? (
        <Card tint={c.primarySoft} style={{ gap: 12 }}>
          <Txt v="bodyBold">Pick your avatar</Txt>
          <Txt v="small">Tell us who you are and we will match your avatar.</Txt>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Male" variant="secondary" size="md" iconLeft="male" onPress={() => setGender('male')} style={{ flex: 1 }} />
            <Button label="Female" variant="secondary" size="md" iconLeft="female" onPress={() => setGender('female')} style={{ flex: 1 }} />
            <Button label="Other" variant="secondary" size="md" onPress={() => setGender('other')} style={{ flex: 1 }} />
          </View>
        </Card>
      ) : null}

      <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 18, alignItems: 'stretch' }}>
      {/* Continue learning */}
      <Card tint={c.primarySoft} style={[{ borderRadius: 28, padding: 18, gap: 14 }, isWide && { flex: 1 }]}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, gap: 6 }}>
            <Pill label={started ? 'CONTINUE LEARNING' : 'START LEARNING'} bg={c.surface} fg={c.primaryText} />
            <Txt v="h2">{current.title}</Txt>
            <Txt v="caption" color={c.primaryText}>
              {nextLesson ? `Lesson ${nextLesson.number} · ${nextLesson.title}` : 'Course complete'}
            </Txt>
          </View>
          <View style={[s.continueArt, { backgroundColor: tile.bg }]}>
            <CourseArt kind={current.art} ink={tile.ink} ink2={tile.ink2} paper={c.paper} width={86} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ flex: 1, gap: 7 }}>
            <ProgressBar value={pct} track={c.surface} />
            <Txt v="caption" color={c.primaryText}>
              {lessonsDone} of {current.lessons} lessons · {Math.round(pct * 100)}%
            </Txt>
          </View>
          <Button label={started ? 'Resume' : 'Start'} size="md" icon="play" onPress={() => navigation.navigate('Lesson', { courseId: current.id })} />
        </View>
      </Card>

      {/* Daily goal + streak */}
      <Card style={[{ gap: 16 }, isWide && { flex: 1 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Ring value={minutes / prefs.dailyGoal} color={c.success} track={c.track}>
            <Txt v="h3">{minutes}</Txt>
          </Ring>
          <View style={{ flex: 1 }}>
            <Txt v="h3" style={{ fontSize: 16 }}>
              Daily goal
            </Txt>
            <Txt v="small">
              {minutes} of {prefs.dailyGoal} min today
            </Txt>
            <Txt v="caption" color={c.successText}>
              {reached ? 'Goal reached, nice work!' : minutes === 0 ? 'Complete a lesson to get started' : `${prefs.dailyGoal - minutes} min to go`}
            </Txt>
          </View>
          <View style={{ gap: 6, alignItems: 'flex-end' }}>
            <Pill icon="flame" label={`${stats.streak} days`} bg={c.warnSoft} fg={c.warnText} />
            <Pill icon="flash" label={`${stats.xp.toLocaleString()} XP`} bg={c.primarySoft} fg={c.primaryText} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {DAYS.map((d, i) => {
            const done = stats.week[i][1] > 0 && i <= todayIndex && i !== todayIndex;
            const today = i === todayIndex;
            return (
              <View key={i} style={{ alignItems: 'center', gap: 6 }}>
                <View
                  style={[
                    s.day,
                    { backgroundColor: done ? c.success : 'transparent', borderColor: done ? c.success : today ? c.primary : c.border },
                  ]}
                >
                  {done ? <Ionicons name="checkmark" size={16} color={c.onPrimary} /> : null}
                  {today ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary }} /> : null}
                </View>
                <Txt v="caption" color={today ? c.primaryText : c.muted}>
                  {d}
                </Txt>
              </View>
            );
          })}
        </View>
      </Card>

      </View>

      {/* Practice */}
      <View style={{ gap: 10 }}>
        <Txt v="h3">Time to practise</Txt>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <PracticeTile
            icon="book"
            title="Courses"
            hint="Learn something new"
            bg={c.primarySoft}
            fg={c.primaryText}
            onPress={() => navigation.navigate('Courses')}
          />
          <PracticeTile
            icon="help-circle"
            title="Practise"
            hint="Test your knowledge"
            bg={c.warnSoft}
            fg={c.warnText}
            onPress={() => navigation.navigate('Practice')}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <PracticeTile
            icon="layers"
            title="Flashcards"
            hint="Swipe through concepts"
            bg={c.successSoft}
            fg={c.successText}
            onPress={() => navigation.navigate('Flashcards')}
          />
          <PracticeTile
            icon="code-slash"
            title="Code editor"
            hint="Write and run code"
            bg={c.surface2}
            fg={c.text}
            onPress={() => navigation.navigate('CodeEditor')}
          />
        </View>
      </View>

      {/* Picked for you */}
      <View style={s.sectionRow}>
        <View>
          <Txt v="h3">Picked for you</Txt>
          <Txt v="small">For your goal: {goal.label}</Txt>
        </View>
        <Button label="See all" variant="ghost" size="md" onPress={() => navigation.navigate('Courses')} />
      </View>
      {isWide ? (
        <Grid minItem={220}>
          {picked.map((course) => (
            <CourseTile key={course.id} fill course={course} onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })} />
          ))}
        </Grid>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginTop: -8 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {picked.map((course) => (
            <CourseTile key={course.id} course={course} onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })} />
          ))}
        </ScrollView>
      )}

      {/* Study room */}
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}>
        <View style={{ flexDirection: 'row' }}>
          <Avatar who="arjun" size={36} ring={c.surface} />
          <View style={{ marginLeft: -14 }}>
            <Avatar who="lena" size={36} ring={c.surface} />
          </View>
          <View style={{ marginLeft: -14 }}>
            <Avatar who="kofi" size={36} ring={c.surface} />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Txt v="bodyBold" style={{ fontSize: 14 }}>
            Study room is live
          </Txt>
          <Txt v="caption">Arjun, Lena and Kofi are learning now</Txt>
        </View>
        <Button label="Join" variant="soft" size="md" icon="videocam" onPress={joinStudyRoom} />
      </Card>
    </Screen>
  );
}

function PracticeTile({
  icon,
  title,
  hint,
  bg,
  fg,
  onPress,
}: {
  icon: IconName;
  title: string;
  hint: string;
  bg: string;
  fg: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${hint}`}
      onPress={onPress}
      style={({ pressed }) => [{ flex: 1, minHeight: 104, borderRadius: 22, padding: 14, gap: 10, backgroundColor: bg, opacity: pressed ? 0.85 : 1 }]}
    >
      <Ionicons name={icon} size={26} color={fg} />
      <View>
        <Txt v="bodyBold" color={fg}>
          {title}
        </Txt>
        <Txt v="caption" color={fg}>
          {hint}
        </Txt>
      </View>
    </Pressable>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    continueArt: { width: 100, height: 84, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    day: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    sectionRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: -6 },
  });
