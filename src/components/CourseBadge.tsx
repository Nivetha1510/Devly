import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { useApp } from '../context/AppContext';
import { Course } from '../data/courses';
import { tileColors } from '../theme/palette';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// One icon per course. Colours come from the course's tile, so each language has its own accent.
// (Ionicons is already loaded by the app, so this adds no extra icon font.)
const ICONS: Record<string, IconName> = {
  py: 'logo-python',
  ai: 'sparkles',
  web: 'logo-html5',
  git: 'git-branch',
  sql: 'server',
  cloud: 'cloud',
};

export function courseIcon(courseId: string): IconName {
  return ICONS[courseId] ?? 'book';
}

export default function CourseBadge({ course, size = 48 }: { course: Course; size?: number }) {
  const { isDark } = useApp();
  const tile = tileColors(isDark, course.tile);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: tile.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={courseIcon(course.id)} size={size * 0.52} color={tile.ink} />
    </View>
  );
}
