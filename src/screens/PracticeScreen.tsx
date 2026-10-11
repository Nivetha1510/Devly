import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import CourseBadge from '../components/CourseBadge';
import Screen from '../components/Screen';
import Txt from '../components/Txt';
import { Button, Card, Grid, Pill, Segmented, ThemeToggle } from '../components/ui';
import { useApp, useStyles } from '../context/AppContext';
import { COURSES, getCourse } from '../data/courses';
import { analytics, Certificate, formatIssued, percentOf, practisedTopics } from '../data/practice';
import { TabScreenProps } from '../navigation/types';
import { Colors } from '../theme/palette';
import { downloadCertificate } from '../utils/certificateFile';

type Tab = 'languages' | 'dashboard' | 'certificates';

// Practice tab: Languages (pick a language to practise), Dashboard (analytics) and Certificates.
export default function PracticeScreen({ navigation, route }: TabScreenProps<'Practice'>) {
  const { colors: c, prefs } = useApp();
  const s = useStyles(makeStyles);
  const [tab, setTab] = useState<Tab>(route.params?.tab ?? 'languages');

  // Opened from elsewhere (for example Profile -> My certificates).
  useEffect(() => {
    if (route.params?.tab) setTab(route.params.tab);
  }, [route.params?.tab]);

  return (
    <Screen inTabs wide>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Txt v="h1">Practice</Txt>
          <Txt v="small">Test your knowledge</Txt>
        </View>
        <ThemeToggle />
      </View>

      <Segmented<Tab>
        options={[
          { value: 'languages', label: 'Languages' },
          { value: 'dashboard', label: 'Dashboard' },
          { value: 'certificates', label: 'Certificates' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'languages' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open the code editor. Run Python, JavaScript, SQL and HTML."
          onPress={() => navigation.navigate('CodeEditor')}
          style={({ pressed }) => [s.editorCard, pressed && { opacity: 0.9 }]}
        >
          <View style={s.editorIcon}>
            <Ionicons name="code-slash" size={26} color={c.onPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt v="bodyBold">Code editor</Txt>
            <Txt v="caption" color={c.primaryText}>
              Write and run Python, JavaScript, SQL and HTML
            </Txt>
          </View>
          <Ionicons name="chevron-forward" size={20} color={c.primaryText} />
        </Pressable>
      ) : null}

      {tab === 'languages' ? (
        <Grid minItem={150}>
          {COURSES.map((course) => {
            const certified = prefs.certificates.some((x) => x.course_id === course.id);
            const practised = practisedTopics(prefs.attempts, course);
            return (
              <Pressable
                key={course.id}
                accessibilityRole="button"
                accessibilityLabel={`${course.title}. ${practised} of ${course.modules.length} topics practised${certified ? '. Certified' : ''}`}
                onPress={() => navigation.navigate('PracticeLanguage', { courseId: course.id })}
                style={({ pressed }) => [s.langCard, pressed && { opacity: 0.85 }]}
              >
                <CourseBadge course={course} size={52} />
                <Txt v="bodyBold" style={{ fontSize: 15 }} numberOfLines={2}>
                  {course.title}
                </Txt>
                <Txt v="caption">
                  {practised}/{course.modules.length} topics practised
                </Txt>
                {certified ? <Pill icon="ribbon" label="Certified" bg={c.successSoft} fg={c.successText} /> : null}
              </Pressable>
            );
          })}
        </Grid>
      ) : null}

      {tab === 'dashboard' ? <Dashboard /> : null}

      {tab === 'certificates' ? <Certificates onView={(id) => navigation.navigate('Certificate', { courseId: id })} /> : null}
    </Screen>
  );
}

function Dashboard() {
  const { colors: c, prefs } = useApp();
  const s = useStyles(makeStyles);
  const a = analytics(prefs.attempts);

  if (a.taken === 0) {
    return (
      <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 28 }}>
        <Ionicons name="stats-chart-outline" size={34} color={c.muted} />
        <Txt v="bodyBold">No practice yet</Txt>
        <Txt v="small" style={{ textAlign: 'center' }}>
          Take a topic practice or a Master Quiz and your results will show up here.
        </Txt>
      </Card>
    );
  }

  const topicName = (courseId: string, topic: string) => `${getCourse(courseId).title} · ${topic}`;

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Card style={s.statTile}>
          <Txt v="h2">{a.taken}</Txt>
          <Txt v="caption">Quizzes taken</Txt>
        </Card>
        <Card style={s.statTile}>
          <Txt v="h2">{a.accuracy}%</Txt>
          <Txt v="caption">Accuracy</Txt>
        </Card>
      </View>

      <TopicList title="Strong topics" empty="Keep practising to find your strengths." items={a.strong} fg={c.successText} bg={c.successSoft} name={topicName} />
      <TopicList title="Topics to work on" empty="No weak topics. Great!" items={a.weak} fg={c.warnText} bg={c.warnSoft} name={topicName} />

      <View style={{ gap: 8 }}>
        <Txt v="h3">History</Txt>
        {prefs.attempts.slice(0, 10).map((at) => {
          const pct = percentOf(at.correct, at.total);
          return (
            <Card key={at.id} style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18 }}>
              <View style={{ flex: 1 }}>
                <Txt v="bodyBold" style={{ fontSize: 14 }}>
                  {getCourse(at.courseId).title}
                </Txt>
                <Txt v="caption">
                  {at.kind === 'master' ? 'Master Quiz' : 'Topic practice'} · {formatIssued(at.at)}
                </Txt>
              </View>
              {at.kind === 'master' ? (
                <Pill label={at.passed ? 'Passed' : 'Not passed'} bg={at.passed ? c.successSoft : c.warnSoft} fg={at.passed ? c.successText : c.warnText} />
              ) : null}
              <Txt v="bodyBold">
                {at.correct}/{at.total} · {pct}%
              </Txt>
            </Card>
          );
        })}
      </View>
    </View>
  );
}

function TopicList({
  title,
  empty,
  items,
  fg,
  bg,
  name,
}: {
  title: string;
  empty: string;
  items: { courseId: string; topic: string; percent: number }[];
  fg: string;
  bg: string;
  name: (courseId: string, topic: string) => string;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Txt v="h3">{title}</Txt>
      {items.length === 0 ? (
        <Txt v="small">{empty}</Txt>
      ) : (
        items.slice(0, 6).map((t) => (
          <Card key={`${t.courseId}|${t.topic}`} style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18 }}>
            <Txt v="bodyBold" style={{ flex: 1, fontSize: 14 }}>
              {name(t.courseId, t.topic)}
            </Txt>
            <Pill label={`${t.percent}%`} bg={bg} fg={fg} />
          </Card>
        ))
      )}
    </View>
  );
}

function Certificates({ onView }: { onView: (courseId: string) => void }) {
  const { colors: c, prefs } = useApp();
  const [busy, setBusy] = useState<string | null>(null);
  const list = [...prefs.certificates].sort((a, b) => b.issued_at.localeCompare(a.issued_at));

  const download = async (cert: Certificate) => {
    setBusy(cert.id);
    try {
      await downloadCertificate(cert);
    } catch (e) {
      Alert.alert('Could not create the PDF', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(null);
    }
  };

  if (list.length === 0) {
    return (
      <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 28 }}>
        <Ionicons name="ribbon-outline" size={36} color={c.muted} />
        <Txt v="bodyBold">No certificates yet</Txt>
        <Txt v="small" style={{ textAlign: 'center' }}>
          Pass a Master Quiz to earn your first certificate
        </Txt>
      </Card>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {list.map((cert) => {
        const course = getCourse(cert.course_id);
        return (
          <Card key={cert.id} style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <CourseBadge course={course} size={46} />
              <View style={{ flex: 1 }}>
                <Txt v="bodyBold">{cert.course_title}</Txt>
                <Txt v="caption">
                  {formatIssued(cert.issued_at)} · {Math.round(cert.percent)}% · {cert.code}
                </Txt>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="View" variant="secondary" size="md" iconLeft="eye-outline" onPress={() => onView(cert.course_id)} style={{ flex: 1 }} />
              <Button
                label={busy === cert.id ? 'Preparing…' : 'Download'}
                size="md"
                iconLeft="download-outline"
                disabled={busy === cert.id}
                onPress={() => download(cert)}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    langCard: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 24, padding: 14, gap: 8, minHeight: 168 },
    editorCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: c.primarySoft, borderRadius: 24, padding: 14, minHeight: 76 },
    editorIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    statTile: { flex: 1, alignItems: 'center', paddingVertical: 16, gap: 2 },
  });
