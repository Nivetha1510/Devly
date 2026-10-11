import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useApp, useStyles } from '../context/AppContext';
import { Course, coursePercent } from '../data/courses';
import { PEOPLE } from '../data/people';
import { Colors, tileColors } from '../theme/palette';
import Avatar from './Avatar';
import CourseArt from './CourseArt';
import Txt from './Txt';
import { ProgressBar } from './ui';

// Row used in the Explore list.
export function CourseRow({ course, onPress }: { course: Course; onPress: () => void }) {
  const { colors: c, isDark, prefs, toggleSaved } = useApp();
  const s = useStyles(makeStyles);
  const tile = tileColors(isDark, course.tile);
  const saved = !!prefs.saved[course.id];
  const pct = coursePercent(course, prefs.completed[course.id]);
  return (
    <View style={s.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${course.title}, ${course.lessons} lessons`}
        onPress={onPress}
        style={({ pressed }) => [s.rowMain, { opacity: pressed ? 0.8 : 1 }]}
      >
        <View style={[s.rowTile, { backgroundColor: tile.bg }]}>
          <CourseArt kind={course.art} ink={tile.ink} ink2={tile.ink2} paper={c.paper} width={62} />
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Txt v="bodyBold">{course.title}</Txt>
          <Txt v="small" style={{ fontSize: 12, lineHeight: 16 }}>
            {course.level} · {course.lessons} lessons · {course.time}
          </Txt>
          {pct > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <View style={{ flex: 1 }}>
                <ProgressBar value={pct} height={6} />
              </View>
              <Txt v="caption" color={c.primaryText}>
                {Math.round(pct * 100)}%
              </Txt>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <Avatar who={course.mentor} size={20} />
              <Txt v="caption">with {PEOPLE[course.mentor].first}</Txt>
            </View>
          )}
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={saved ? `Remove ${course.title} from saved` : `Save ${course.title}`}
        accessibilityState={{ selected: saved }}
        onPress={() => toggleSaved(course.id)}
        hitSlop={6}
        style={s.save}
      >
        <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={saved ? c.primary : c.muted} />
      </Pressable>
    </View>
  );
}

// Card used in the horizontal "Picked for you" list.
export function CourseTile({ course, onPress, fill }: { course: Course; onPress: () => void; fill?: boolean }) {
  const { colors: c, isDark } = useApp();
  const s = useStyles(makeStyles);
  const tile = tileColors(isDark, course.tile);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={course.title}
      onPress={onPress}
      style={({ pressed }) => [s.tileCard, fill && { width: '100%' }, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}
    >
      <View style={[s.tileArt, { backgroundColor: tile.bg }]}>
        <CourseArt kind={course.art} ink={tile.ink} ink2={tile.ink2} paper={c.paper} width={140} />
      </View>
      <View style={{ paddingHorizontal: 4, paddingBottom: 4, gap: 6 }}>
        <Txt v="bodyBold" numberOfLines={2}>
          {course.title}
        </Txt>
        <Txt v="caption">
          {course.lessons} lessons · {course.time}
        </Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Avatar who={course.mentor} size={24} />
          <Txt v="caption" color={c.text}>
            {PEOPLE[course.mentor].first}
          </Txt>
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    row: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 22,
      paddingVertical: 10,
      paddingLeft: 10,
      paddingRight: 4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
    rowTile: { width: 76, height: 76, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    save: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    tileCard: {
      width: 200,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 22,
      padding: 10,
      gap: 10,
    },
    tileArt: { height: 120, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  });
