import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import CourseBadge from '../components/CourseBadge';
import Screen from '../components/Screen';
import Txt from '../components/Txt';
import { Card, IconButton, Pill } from '../components/ui';
import { useApp, useStyles } from '../context/AppContext';
import { getCourse } from '../data/courses';
import { CardStatus, cardsFor, deckCounts, filterCards, statusOf } from '../data/flashcards';
import { RootScreenProps } from '../navigation/types';
import { F } from '../theme/fonts';
import { Colors } from '../theme/palette';

type StatusFilter = CardStatus | 'all' | 'saved';

const STATUS_CHIPS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'saved', label: 'Saved' },
];

export default function FlashcardDeckScreen({ navigation, route }: RootScreenProps<'FlashcardDeck'>) {
  const { colors: c, prefs } = useApp();
  const s = useStyles(makeStyles);
  const course = getCourse(route.params.courseId);

  const all = useMemo(() => cardsFor(course), [course]);
  const [topic, setTopic] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');

  const counts = deckCounts(all, prefs.cards);
  const shown = useMemo(() => {
    const base = filterCards(all, { topic, status: status === 'saved' ? 'all' : status, query }, prefs.cards);
    return status === 'saved' ? base.filter((x) => prefs.cardBookmarks[x.id]) : base;
  }, [all, topic, status, query, prefs.cards, prefs.cardBookmarks]);

  const open = (index: number) =>
    navigation.navigate('FlashcardViewer', { courseId: course.id, ids: shown.map((x) => x.id), start: index });

  return (
    <Screen>
      {/* Header */}
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 26 }}>
        <IconButton icon="chevron-back" label="Back" onPress={() => navigation.goBack()} />
        <CourseBadge course={course} size={48} />
        <View style={{ flex: 1, gap: 4 }}>
          <Txt v="h3" style={{ fontSize: 17 }} numberOfLines={1}>
            {course.title}
          </Txt>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <Txt v="caption">{counts.total} flashcards</Txt>
            <Pill icon="checkmark-circle" label={`${counts.completed}/${counts.total}`} bg={c.successSoft} fg={c.successText} />
            <Pill icon="play-circle" label={String(counts.inProgress)} bg={c.warnSoft} fg={c.warnText} />
          </View>
        </View>
      </Card>

      {/* Topic filter */}
      <View style={{ gap: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label="All topics" on={topic === null} onPress={() => setTopic(null)} />
          {course.modules.map((m) => (
            <Chip key={m.title} label={m.title} on={topic === m.title} onPress={() => setTopic(m.title)} />
          ))}
        </ScrollView>
      </View>

      {/* Search + status */}
      <View style={s.searchBox}>
        <Ionicons name="search" size={20} color={c.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search flashcards..."
          placeholderTextColor={c.muted}
          accessibilityLabel="Search flashcards"
          style={s.search}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {STATUS_CHIPS.map((chip) => (
          <Chip key={chip.value} label={chip.label} on={status === chip.value} onPress={() => setStatus(chip.value)} />
        ))}
      </ScrollView>

      {/* Cards */}
      {shown.length === 0 ? (
        <Card style={{ alignItems: 'center', gap: 6, paddingVertical: 24 }}>
          <Txt v="bodyBold">No flashcards found</Txt>
          <Txt v="small">Try another topic, status or search.</Txt>
        </Card>
      ) : (
        shown.map((card, i) => {
          const st = statusOf(prefs.cards, card.id);
          const saved = !!prefs.cardBookmarks[card.id];
          return (
            <Pressable
              key={card.id}
              accessibilityRole="button"
              accessibilityLabel={`Flashcard ${i + 1}: ${card.title}`}
              onPress={() => open(i)}
              style={({ pressed }) => [s.card, pressed && { opacity: 0.9 }]}
            >
              <View style={s.cardTop}>
                <View style={s.num}>
                  <Txt v="caption" color={c.primaryText}>
                    {i + 1}
                  </Txt>
                </View>
                <Pill
                  icon={card.kind === 'concept' ? 'star' : 'bulb'}
                  label={card.kind === 'concept' ? 'Core concept' : 'Practice'}
                  bg={c.surface2}
                  fg={c.muted}
                />
                {card.code ? <Pill icon="code-slash" label="Code" bg={c.primarySoft} fg={c.primaryText} /> : null}
                <View style={{ flex: 1 }} />
                <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={saved ? c.primary : c.muted} />
              </View>
              <Txt v="h3" style={{ fontSize: 18 }}>
                {card.title}
              </Txt>
              <Txt v="small" numberOfLines={3}>
                {card.theory}
              </Txt>
              <View style={s.cardBottom}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="time-outline" size={16} color={c.muted} />
                  <Txt v="caption">{card.seconds} sec</Txt>
                </View>
                {st === 'completed' ? (
                  <Pill icon="checkmark-circle" label="Completed" bg={c.successSoft} fg={c.successText} />
                ) : st === 'in_progress' ? (
                  <Pill icon="play-circle" label="In progress" bg={c.warnSoft} fg={c.warnText} />
                ) : (
                  <Pill label="Not started" bg={c.surface2} fg={c.muted} />
                )}
              </View>
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const { colors: c } = useApp();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={{
        minHeight: 44,
        paddingHorizontal: 16,
        borderRadius: 22,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: on ? c.primary : c.border,
        backgroundColor: on ? c.primarySoft : c.surface,
      }}
    >
      <Txt v="bodyBold" color={on ? c.primaryText : c.text} style={{ fontSize: 14, fontFamily: F.bold }}>
        {label}
      </Txt>
    </Pressable>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, borderRadius: 18, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface, paddingHorizontal: 16 },
    search: { flex: 1, height: '100%', fontFamily: F.semi, fontSize: 15, color: c.text, ...({ outlineStyle: 'none' } as object) },
    card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 24, padding: 16, gap: 10 },
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    num: { width: 34, height: 34, borderRadius: 10, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
  });
