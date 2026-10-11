import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import CourseBadge from '../components/CourseBadge';
import Screen from '../components/Screen';
import Txt from '../components/Txt';
import { Grid, IconButton } from '../components/ui';
import { useApp, useStyles } from '../context/AppContext';
import { COURSES } from '../data/courses';
import { cardsFor, deckCounts } from '../data/flashcards';
import { RootScreenProps } from '../navigation/types';
import { Colors } from '../theme/palette';

// Subjects grid: one deck per course.
export default function FlashcardsScreen({ navigation }: RootScreenProps<'Flashcards'>) {
  const { prefs } = useApp();
  const s = useStyles(makeStyles);

  return (
    <Screen wide>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconButton icon="chevron-back" label="Back" onPress={() => navigation.goBack()} />
        <View style={{ flex: 1 }}>
          <Txt v="h1">Flashcards</Txt>
          <Txt v="small">Quick concepts to swipe through</Txt>
        </View>
      </View>

      <Grid minItem={150}>
        {COURSES.map((course) => {
          const counts = deckCounts(cardsFor(course), prefs.cards);
          return (
            <Pressable
              key={course.id}
              accessibilityRole="button"
              accessibilityLabel={`${course.title}. ${counts.total} flashcards, ${counts.completed} completed`}
              onPress={() => navigation.navigate('FlashcardDeck', { courseId: course.id })}
              style={({ pressed }) => [s.card, pressed && { opacity: 0.85 }]}
            >
              <CourseBadge course={course} size={56} />
              <Txt v="bodyBold" style={{ fontSize: 15 }} numberOfLines={2}>
                {course.title}
              </Txt>
              <Txt v="caption">
                {counts.completed}/{counts.total} completed
              </Txt>
            </Pressable>
          );
        })}
      </Grid>
    </Screen>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 24, padding: 14, gap: 8, minHeight: 160 },
  });
