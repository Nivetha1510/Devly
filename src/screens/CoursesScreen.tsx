import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Avatar from '../components/Avatar';
import CourseArt from '../components/CourseArt';
import { CourseRow, CourseTile } from '../components/CourseCards';
import Screen from '../components/Screen';
import Txt from '../components/Txt';
import { Button, Card, Chip, Grid, ThemeToggle } from '../components/ui';
import { useApp, useStyles } from '../context/AppContext';
import { CATEGORIES, Category, COURSES, GOALS } from '../data/courses';
import { TabScreenProps } from '../navigation/types';
import { F } from '../theme/fonts';
import { useLayout } from '../theme/layout';
import { Colors, tileColors } from '../theme/palette';

export default function CoursesScreen({ navigation }: TabScreenProps<'Courses'>) {
  const { colors: c, isDark } = useApp();
  const s = useStyles(makeStyles);
  const { isWide } = useLayout();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<'All' | Category>('All');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COURSES.filter(
      (x) => (cat === 'All' || x.cat === cat) && (!q || x.title.toLowerCase().includes(q) || x.cat.toLowerCase().includes(q)),
    );
  }, [query, cat]);

  return (
    <Screen inTabs wide>
      <View style={s.header}>
        <View>
          <Txt v="h1">Explore</Txt>
          <Txt v="small">Find your next skill</Txt>
        </View>
        <ThemeToggle />
      </View>

      <View style={s.search}>
        <Ionicons name="search" size={20} color={c.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Python, web, AI…"
          placeholderTextColor={c.muted}
          accessibilityLabel="Search courses"
          returnKeyType="search"
          style={s.input}
        />
        {query ? (
          <Ionicons name="close-circle" size={20} color={c.muted} onPress={() => setQuery('')} accessibilityLabel="Clear search" />
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {CATEGORIES.map((k) => (
          <Chip key={k} label={k} selected={k === cat} onPress={() => setCat(k)} />
        ))}
      </ScrollView>

      <Txt v="caption" style={{ marginBottom: -6 }}>
        {results.length} {results.length === 1 ? 'course' : 'courses'}
      </Txt>

      {/* Big screens get bigger cards so the page fills out; phones keep compact rows. */}
      <Grid minItem={isWide ? 240 : 340}>
        {results.map((course) =>
          isWide ? (
            <CourseTile key={course.id} fill course={course} onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })} />
          ) : (
            <CourseRow key={course.id} course={course} onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })} />
          ),
        )}
      </Grid>

      <View style={{ gap: 12, marginTop: 6 }}>
        <View>
          <Txt v="h3">Learning paths</Txt>
          <Txt v="small">Not sure where to start? Pick a goal.</Txt>
        </View>
        <Grid minItem={240}>
          {GOALS.map((g) => {
            const tile = tileColors(isDark, g.tile);
            const on = cat === g.cat;
            return (
              <Pressable
                key={g.id}
                accessibilityRole="button"
                accessibilityLabel={`Show ${g.label} courses`}
                accessibilityState={{ selected: on }}
                onPress={() => setCat(g.cat)}
                style={({ pressed }) => [s.path, { backgroundColor: tile.bg, borderColor: on ? c.primary : 'transparent', opacity: pressed ? 0.85 : 1 }]}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <Txt v="bodyBold" color={tile.ink}>
                    {g.label}
                  </Txt>
                  <Txt v="caption" color={tile.ink}>
                    {COURSES.filter((x) => x.cat === g.cat).length} courses
                  </Txt>
                </View>
                <CourseArt kind={g.art} ink={tile.ink} ink2={tile.ink2} paper={c.paper} width={72} />
              </Pressable>
            );
          })}
        </Grid>
      </View>

      {results.length === 0 ? (
        <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 28 }}>
          <Avatar who="sofia" size={72} />
          <Txt v="h3" style={{ marginTop: 4 }}>
            No courses found
          </Txt>
          <Txt v="small">Try another word or category.</Txt>
          <Button
            label="Clear filters"
            variant="soft"
            size="md"
            onPress={() => {
              setQuery('');
              setCat('All');
            }}
            style={{ marginTop: 6 }}
          />
        </Card>
      ) : null}
    </Screen>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    path: { minHeight: 96, borderRadius: 22, borderWidth: 2, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      height: 52,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      paddingHorizontal: 16,
    },
    input: {
      flex: 1,
      height: '100%',
      fontFamily: F.semi,
      fontSize: 15,
      color: c.text,
      // Hide the browser focus box on web; the rounded field already shows focus.
      ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
    },
  });
