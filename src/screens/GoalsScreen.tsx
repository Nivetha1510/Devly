import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import CourseArt from '../components/CourseArt';
import Screen from '../components/Screen';
import Txt from '../components/Txt';
import { Button, IconButton, Segmented } from '../components/ui';
import { Level, useApp, useStyles } from '../context/AppContext';
import { GOALS } from '../data/courses';
import { RootScreenProps } from '../navigation/types';
import { Colors, tileColors } from '../theme/palette';

const LEVELS: Level[] = ['Beginner', 'Improving', 'Confident'];

// Used for onboarding ('Goals') and for changing the goal later from Profile ('EditGoal').
export default function GoalsScreen({ navigation }: RootScreenProps<'Goals' | 'EditGoal'>) {
  const { colors: c, isDark, prefs, update } = useApp();
  const s = useStyles(makeStyles);

  // First time: finishing onboarding swaps to the main app.
  // Later (from Profile): just go back.
  const finish = () => {
    if (prefs.onboarded) navigation.goBack();
    else update({ onboarded: true });
  };

  return (
    <Screen footer={<Button label={prefs.onboarded ? 'Save goal' : 'Continue'} icon="arrow-forward" onPress={finish} style={{ flex: 1 }} />}>
      <View style={s.topRow}>
        <IconButton icon="chevron-back" label="Back" onPress={() => navigation.goBack()} />
        {!prefs.onboarded ? <Button label="Skip" variant="ghost" size="md" onPress={finish} /> : null}
      </View>

      <View>
        <Txt v="h1">What do you want to learn?</Txt>
        <Txt v="body" color={c.muted} style={{ marginTop: 8 }}>
          Pick a goal and we will suggest courses for you.
        </Txt>
      </View>

      <View style={s.grid}>
        {GOALS.map((g) => {
          const on = g.id === prefs.goal;
          const tile = tileColors(isDark, g.tile);
          return (
            <Pressable
              key={g.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => update({ goal: g.id })}
              style={({ pressed }) => [
                s.card,
                { borderColor: on ? c.primary : c.border, backgroundColor: on ? c.primarySoft : c.surface },
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
            >
              <View style={[s.art, { backgroundColor: tile.bg }]}>
                <CourseArt kind={g.art} ink={tile.ink} ink2={tile.ink2} paper={c.paper} width={110} />
              </View>
              <Txt v="bodyBold" style={{ paddingHorizontal: 4, paddingBottom: 4 }}>
                {g.label}
              </Txt>
              {on ? (
                <View style={s.check}>
                  <Ionicons name="checkmark" size={15} color={c.onPrimary} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: 10 }}>
        <Txt v="h3">Your level</Txt>
        <Segmented options={LEVELS.map((l) => ({ value: l, label: l }))} value={prefs.level} onChange={(level) => update({ level })} />
      </View>
    </Screen>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    card: { flexBasis: '46%', flexGrow: 1, borderWidth: 2, borderRadius: 22, padding: 10, gap: 10 },
    art: { height: 96, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    check: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
