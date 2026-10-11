import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Txt from '../components/Txt';
import { Button, IconButton } from '../components/ui';
import { useApp, useStyles } from '../context/AppContext';
import { getCourse } from '../data/courses';
import { codeForEditor, langForFile } from '../data/editor';
import { cardsFor, Flashcard, SwipeDirection } from '../data/flashcards';
import { highlight } from '../data/lessons';
import { RootScreenProps } from '../navigation/types';
import { F } from '../theme/fonts';
import { Colors, SYNTAX } from '../theme/palette';

// One card per page. The learner chooses whether pages move right-to-left or bottom-to-top.
export default function FlashcardViewerScreen({ navigation, route }: RootScreenProps<'FlashcardViewer'>) {
  const { colors: c, prefs, update, markCard, toggleCardBookmark } = useApp();
  const s = useStyles(makeStyles);
  const course = getCourse(route.params.courseId);

  const cards = useMemo(() => {
    const byId = new Map(cardsFor(course).map((x) => [x.id, x]));
    return route.params.ids.map((id) => byId.get(id)).filter((x): x is Flashcard => !!x);
  }, [course, route.params.ids]);

  const [index, setIndex] = useState(Math.min(route.params.start, Math.max(0, cards.length - 1)));
  const [box, setBox] = useState({ w: 0, h: 0 });
  const list = useRef<FlatList<Flashcard>>(null);
  const dir: SwipeDirection = prefs.swipe;
  const horizontal = dir === 'horizontal';
  const size = horizontal ? box.w : box.h;
  const card = cards[index];

  // A card counts as "in progress" as soon as it is shown.
  useEffect(() => {
    if (card) markCard(card.id, 'seen');
  }, [card?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = (i: number) => {
    const next = Math.max(0, Math.min(cards.length - 1, i));
    setIndex(next);
    list.current?.scrollToIndex({ index: next, animated: true });
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!size) return;
    const offset = horizontal ? e.nativeEvent.contentOffset.x : e.nativeEvent.contentOffset.y;
    const i = Math.round(offset / size);
    if (i !== index && i >= 0 && i < cards.length) setIndex(i);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (Math.round(width) !== box.w || Math.round(height) !== box.h) setBox({ w: Math.round(width), h: Math.round(height) });
  };

  if (cards.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, padding: 20, gap: 16 }}>
        <IconButton icon="chevron-back" label="Back" onPress={() => navigation.goBack()} />
        <Txt v="h2">No flashcards here</Txt>
      </SafeAreaView>
    );
  }

  const done = card && prefs.cards[card.id] === 'done';
  const saved = card && !!prefs.cardBookmarks[card.id];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Top bar */}
      <View style={s.topBar}>
        <IconButton icon="chevron-back" label="Back" onPress={() => navigation.goBack()} />
        <View style={{ flex: 1 }}>
          <Txt v="bodyBold" style={{ fontSize: 15 }}>
            {index + 1} of {cards.length}
          </Txt>
          <Txt v="caption">{card?.seconds} sec</Txt>
        </View>
        <View style={s.dirBox} accessibilityRole="radiogroup" accessibilityLabel="Swipe direction">
          <DirButton icon="swap-horizontal" label="Swipe right to left" on={horizontal} onPress={() => update({ swipe: 'horizontal' })} />
          <DirButton icon="swap-vertical" label="Swipe bottom to top" on={!horizontal} onPress={() => update({ swipe: 'vertical' })} />
        </View>
        <IconButton
          icon={saved ? 'bookmark' : 'bookmark-outline'}
          label={saved ? 'Remove bookmark' : 'Bookmark card'}
          selected={!!saved}
          color={saved ? c.primary : c.text}
          onPress={() => card && toggleCardBookmark(card.id)}
        />
      </View>

      {/* Pages */}
      <View style={{ flex: 1 }} onLayout={onLayout}>
        {size > 0 ? (
          <FlatList
            ref={list}
            key={dir}
            data={cards}
            keyExtractor={(x) => x.id}
            horizontal={horizontal}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            initialScrollIndex={index}
            getItemLayout={(_, i) => ({ length: size, offset: size * i, index: i })}
            onScroll={onScroll}
            scrollEventThrottle={16}
            windowSize={3}
            renderItem={({ item }) => (
              <Page
                card={item}
                width={box.w}
                height={box.h}
                done={prefs.cards[item.id] === 'done'}
                onToggleDone={() => markCard(item.id, prefs.cards[item.id] === 'done' ? 'review' : 'done')}
                onOpenEditor={(code, lang) => navigation.navigate('CodeEditor', { code, lang })}
              />
            )}
          />
        ) : null}
      </View>

      {/* Hint + controls */}
      <Txt v="caption" style={{ textAlign: 'center', paddingVertical: 6 }}>
        {horizontal ? 'Swipe right to left for the next card' : 'Swipe bottom to top for the next card'}
      </Txt>
      <View style={s.footer}>
        <IconButton icon="chevron-back" label="Previous card" onPress={() => goTo(index - 1)} />
        <Button
          label="Review again"
          variant="secondary"
          size="md"
          onPress={() => {
            if (card) markCard(card.id, 'review');
            goTo(index + 1);
          }}
          style={{ flex: 1 }}
        />
        <Button
          label={done ? 'Known ✓' : 'Got it'}
          size="md"
          iconLeft="checkmark"
          onPress={() => {
            if (card) markCard(card.id, 'done');
            goTo(index + 1);
          }}
          style={{ flex: 1 }}
        />
        <IconButton icon="chevron-forward" label="Next card" onPress={() => goTo(index + 1)} />
      </View>
    </SafeAreaView>
  );
}

function DirButton({ icon, label, on, onPress }: { icon: 'swap-horizontal' | 'swap-vertical'; label: string; on: boolean; onPress: () => void }) {
  const { colors: c } = useApp();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected: on, checked: on }}
      onPress={onPress}
      style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.primary : 'transparent' }}
    >
      <Ionicons name={icon} size={22} color={on ? c.onPrimary : c.muted} />
    </Pressable>
  );
}

function Page({
  card,
  width,
  height,
  done,
  onToggleDone,
  onOpenEditor,
}: {
  card: Flashcard;
  width: number;
  height: number;
  done: boolean;
  onToggleDone: () => void;
  onOpenEditor: (code: string, lang: NonNullable<ReturnType<typeof langForFile>>) => void;
}) {
  const { colors: c } = useApp();
  const s = useStyles(makeStyles);
  const [tab, setTab] = useState<'theory' | 'code'>('theory');
  const [copied, setCopied] = useState(false);
  const lang = card.code ? langForFile(card.code.file) : null;

  const copy = async () => {
    if (!card.code) return;
    try {
      await Clipboard.setStringAsync(card.code.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <View style={{ width, height, padding: 16 }}>
      <View style={s.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={s.kind}>
            <Ionicons name={card.kind === 'concept' ? 'document-text-outline' : 'bulb-outline'} size={16} color={c.onPrimary} />
            <Txt v="caption" color={c.onPrimary} style={{ fontFamily: F.heavy }}>
              {card.kind === 'concept' ? 'Core concept' : 'Practice'}
            </Txt>
          </View>
          <Txt v="caption" style={{ flex: 1 }} numberOfLines={1}>
            {card.topic}
          </Txt>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={done ? 'Mark as not known' : 'Mark as known'}
            accessibilityState={{ selected: done }}
            onPress={onToggleDone}
            style={[s.check, done && { backgroundColor: c.success, borderColor: c.success }]}
          >
            <Ionicons name="checkmark" size={22} color={done ? c.onPrimary : c.muted} />
          </Pressable>
        </View>

        <Txt v="h2" color={c.primaryText} style={{ fontSize: 24, lineHeight: 30 }}>
          {card.title}
        </Txt>

        {card.code ? (
          <View style={s.tabs}>
            <TabButton label="Theory" icon="document-text-outline" on={tab === 'theory'} onPress={() => setTab('theory')} />
            <TabButton label="Code" icon="code-slash" on={tab === 'code'} onPress={() => setTab('code')} />
          </View>
        ) : null}

        {tab === 'theory' || !card.code ? (
          <ScrollView style={s.body} contentContainerStyle={{ padding: 16 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            <Txt v="body" style={{ fontSize: 17, lineHeight: 28 }}>
              {card.theory}
            </Txt>
          </ScrollView>
        ) : (
          <View style={[s.body, { backgroundColor: c.code, borderColor: c.code }]}>
            <View style={s.codeHead}>
              <Text style={s.fileName}>{card.code.file}</Text>
              <IconButton icon={copied ? 'checkmark' : 'copy-outline'} label="Copy code" onPress={copy} bordered={false} bg="transparent" color={SYNTAX.plain} size={40} />
              {lang ? (
                <IconButton
                  icon="create-outline"
                  label="Open in code editor"
                  onPress={() => onOpenEditor(codeForEditor(card.code!.file, card.code!.text), lang)}
                  bordered={false}
                  bg="transparent"
                  color={SYNTAX.fn}
                  size={40}
                />
              ) : null}
            </View>
            <ScrollView horizontal nestedScrollEnabled contentContainerStyle={{ padding: 14 }}>
              <View>
                {card.code.text.split('\n').map((line, i) => (
                  <Text key={i} style={s.code}>
                    {highlight(line).map(([text, kind], j) => (
                      <Text key={j} style={{ color: SYNTAX[kind] }}>
                        {text}
                      </Text>
                    ))}
                  </Text>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

function TabButton({ label, icon, on, onPress }: { label: string; icon: 'document-text-outline' | 'code-slash'; on: boolean; onPress: () => void }) {
  const { colors: c } = useApp();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 48,
        borderRadius: 14,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: on ? c.primary : c.surface,
        borderWidth: on ? 0 : 1,
        borderColor: c.border,
      }}
    >
      <Ionicons name={icon} size={18} color={on ? c.onPrimary : c.text} />
      <Txt v="bodyBold" color={on ? c.onPrimary : c.text} style={{ fontSize: 15 }}>
        {label}
      </Txt>
    </Pressable>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    topBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
    dirBox: { flexDirection: 'row', backgroundColor: c.surface2, borderRadius: 14, padding: 2 },
    footer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4 },
    card: { flex: 1, backgroundColor: c.surface, borderRadius: 28, borderWidth: 1, borderColor: c.border, padding: 16, gap: 14 },
    kind: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.primary, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
    check: { width: 46, height: 46, borderRadius: 14, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
    tabs: { flexDirection: 'row', gap: 10 },
    body: { flex: 1, backgroundColor: c.bg, borderRadius: 18, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
    codeHead: { flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: 4, minHeight: 48, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
    fileName: { flex: 1, fontFamily: F.bold, fontSize: 13, color: SYNTAX.plain },
    code: { fontFamily: F.mono, fontSize: 15, lineHeight: 26, color: SYNTAX.plain },
  });
