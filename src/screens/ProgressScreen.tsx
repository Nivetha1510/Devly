import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Avatar, { MyAvatar } from '../components/Avatar';
import Screen from '../components/Screen';
import Txt from '../components/Txt';
import { Card, FadeIn, IconName, Pill, ProgressBar, Segmented, ThemeToggle } from '../components/ui';
import { useApp, useStyles } from '../context/AppContext';
import { LEAGUE } from '../data/learning';
import { CERTIFIED_BADGE, certifiedBadgeEarned } from '../data/practice';
import { TabScreenProps } from '../navigation/types';
import { Colors } from '../theme/palette';

type Range = 'week' | 'month';
const CHART_HEIGHT = 112;

export default function ProgressScreen(_: TabScreenProps<'Progress'>) {
  const { colors: c, prefs, stats } = useApp();
  const s = useStyles(makeStyles);
  const [range, setRange] = useState<Range>('week');
  const rows = range === 'week' ? stats.week : stats.month;
  const defaultBar = range === 'week' ? (new Date().getDay() + 6) % 7 : rows.length - 1;
  const [bar, setBar] = useState<number | null>(null);
  const selected = bar !== null && bar < rows.length ? bar : defaultBar;
  const max = Math.max(1, ...rows.map((r) => r[1]));
  const total = rows.reduce((n, r) => n + r[1], 0);

  const league = [...LEAGUE.map((r) => (r.who === 'me' ? { ...r, name: 'You', xp: stats.xp } : r))].sort((a, b) => b.xp - a.xp);

  const badges = [
    { label: 'First lesson', icon: 'code-slash' as IconName, bg: c.primarySoft, fg: c.primaryText, locked: stats.lessonsDone < 1 },
    { label: '3-day streak', icon: 'flame' as IconName, bg: c.warnSoft, fg: c.warnText, locked: stats.streak < 3 },
    { label: 'Course done', icon: 'checkmark-circle' as IconName, bg: c.successSoft, fg: c.successText, locked: stats.coursesDone < 1 },
    { label: CERTIFIED_BADGE.label, icon: 'ribbon' as IconName, bg: c.successSoft, fg: c.successText, locked: !certifiedBadgeEarned(prefs.certificates) },
    { label: '7-day streak', icon: 'trophy' as IconName, bg: c.warnSoft, fg: c.warnText, locked: stats.streak < 7 },
  ].map((b) => (b.locked ? { ...b, icon: 'lock-closed' as IconName, bg: c.surface2, fg: c.muted } : b));
  const earned = badges.filter((b) => !b.locked).length;

  return (
    <Screen inTabs>
      <View style={s.header}>
        <Txt v="h1">Progress</Txt>
        <ThemeToggle />
      </View>

      <Card tint={c.primarySoft} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 26 }}>
        <MyAvatar size={56} />
        <View style={{ flex: 1, gap: 7 }}>
          <Txt v="bodyBold" style={{ fontSize: 16 }}>
            Level {stats.level} · {stats.levelName}
          </Txt>
          <ProgressBar value={stats.levelProgress} track={c.surface} />
          <Txt v="caption" color={c.primaryText}>
            {stats.xpToNext} XP to reach Level {stats.level + 1}
          </Txt>
        </View>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <View>
            <Txt v="h3" style={{ fontSize: 16 }}>
              Learning time
            </Txt>
            <Txt v="small">
              {total} min this {range}
            </Txt>
          </View>
          <Segmented<Range>
            compact
            options={[
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
            value={range}
            onChange={(r) => {
              setRange(r);
              setBar(null);
            }}
          />
        </View>
        <FadeIn key={`${range}-${selected}`} style={{ marginTop: 14 }}>
          <Pill label={`${rows[selected][0]} · ${rows[selected][1]} min`} bg={c.primarySoft} fg={c.primaryText} />
        </FadeIn>
        <View style={s.chart}>
          {rows.map(([label, value], i) => {
            const on = i === selected;
            return (
              <Pressable
                key={label}
                accessibilityRole="button"
                accessibilityLabel={`${label}: ${value} minutes`}
                accessibilityState={{ selected: on }}
                onPress={() => setBar(i)}
                style={s.barCol}
              >
                <View
                  style={{
                    width: range === 'week' ? 28 : 48,
                    height: Math.max(8, Math.round((value / max) * CHART_HEIGHT)),
                    borderRadius: 10,
                    backgroundColor: on ? c.primary : c.primarySoft,
                  }}
                />
                <Txt v="caption" color={on ? c.text : c.muted}>
                  {range === 'week' ? label.charAt(0) : `W${i + 1}`}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <StatTile icon="flame" value={`${stats.streak} days`} label="Current streak" bg={c.warnSoft} fg={c.warnText} />
        <StatTile icon="checkmark" value={String(stats.lessonsDone)} label="Lessons done" bg={c.successSoft} fg={c.successText} />
      </View>

      <View style={{ gap: 10 }}>
        <View style={s.sectionRow}>
          <Txt v="h3" style={{ fontSize: 16 }}>
            Badges
          </Txt>
          <Txt v="caption">{earned} of {badges.length} earned</Txt>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {badges.map((b) => (
            <View key={b.label} style={{ width: '19%', alignItems: 'center', gap: 6, opacity: b.locked ? 0.6 : 1 }}>
              <View style={[s.badge, { backgroundColor: b.bg }]}>
                <Ionicons name={b.icon} size={26} color={b.fg} />
              </View>
              <Txt v="caption" color={c.text} style={{ fontSize: 11, textAlign: 'center' }}>
                {b.label}
              </Txt>
            </View>
          ))}
        </View>
      </View>

      <Card style={{ padding: 14 }}>
        <View style={[s.sectionRow, { paddingHorizontal: 4, paddingBottom: 10 }]}>
          <Txt v="h3" style={{ fontSize: 16 }}>
            Weekly league
          </Txt>
          <Txt v="caption">Ends in 2 days</Txt>
        </View>
        {league.map((row, i) => {
          const me = row.who === 'me';
          return (
            <View key={row.name} style={[s.leagueRow, me && { backgroundColor: c.primarySoft }]}>
              <Txt v="bodyBold" color={i === 0 ? c.warnText : c.muted} style={{ width: 20, fontSize: 14 }}>
                {i + 1}
              </Txt>
              {row.who === 'me' ? <MyAvatar size={40} /> : <Avatar who={row.who} size={40} />}
              <Txt v="bodyBold" style={{ flex: 1, fontSize: 14 }}>
                {row.name}
              </Txt>
              <Txt v="bodyBold" style={{ fontSize: 14 }}>
                {row.xp.toLocaleString()} XP
              </Txt>
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}

function StatTile({ icon, value, label, bg, fg }: { icon: IconName; value: string; label: string; bg: string; fg: string }) {
  return (
    <Card style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20 }}>
      <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={22} color={fg} />
      </View>
      <View>
        <Txt v="h3" style={{ fontSize: 19 }}>
          {value}
        </Txt>
        <Txt v="caption">{label}</Txt>
      </View>
    </Card>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    chart: { flexDirection: 'row', alignItems: 'flex-end', height: CHART_HEIGHT + 40, marginTop: 8, gap: 4 },
    barCol: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
    sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
    badge: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    leagueRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 16 },
  });
