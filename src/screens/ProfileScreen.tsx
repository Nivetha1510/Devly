import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';
import { signOut } from '../auth/authService';
import Avatar, { MyAvatar } from '../components/Avatar';
import Screen from '../components/Screen';
import TimePickerModal from '../components/TimePickerModal';
import Txt from '../components/Txt';
import { Button, IconButton, IconName, Pill, Segmented } from '../components/ui';
import { useApp, useStyles } from '../context/AppContext';
import { GOALS } from '../data/courses';
import { avatarsFor, Gender } from '../data/people';
import { formatTime } from '../data/reminder';
import { TabScreenProps } from '../navigation/types';
import { ACCENT_ORDER, ACCENTS, Colors } from '../theme/palette';

// On web, React Native's Switch colours the thumb teal unless told otherwise.
const WEB_THUMB = { activeThumbColor: '#FFFFFF' } as object;

export default function ProfileScreen({ navigation }: TabScreenProps<'Profile'>) {
  const { colors: c, isDark, prefs, update, toggleDark, stats, setGender, endSession } = useApp();
  const s = useStyles(makeStyles);
  const goal = GOALS.find((g) => g.id === prefs.goal) ?? GOALS[0];

  const nextAvatar = () => {
    const list = avatarsFor(prefs.gender);
    const i = list.indexOf(prefs.avatar);
    update({ avatar: list[(i + 1) % list.length] });
  };

  // Choose a photo from the gallery / files. Stored as a small data URI so it survives restarts.
  const pickPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Allow photo access to choose a profile picture.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });
      if (res.canceled || !res.assets[0]) return;
      const a = res.assets[0];
      update({ photo: a.base64 ? `data:${a.mimeType ?? 'image/jpeg'};base64,${a.base64}` : a.uri });
    } catch {
      Alert.alert('Could not open photos', 'Please try again.');
    }
  };

  const [pickTime, setPickTime] = useState(false);

  const switchColors = { false: c.track, true: c.primary };

  return (
    <Screen inTabs>
      <Txt v="h1">Profile</Txt>

      <View style={[s.card, { alignItems: 'center', paddingVertical: 22, gap: 6 }]}>
        <View>
          <MyAvatar size={96} />
          <View style={s.editAvatar}>
            <IconButton icon="camera" label="Choose a photo" onPress={pickPhoto} bg={c.primary} color={c.onPrimary} iconSize={17} bordered={false} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
          {prefs.photo ? <Button label="Use illustrated avatar" variant="ghost" size="md" onPress={() => update({ photo: '' })} /> : <Button label="Change avatar" variant="ghost" size="md" onPress={nextAvatar} />}
        </View>
        <Txt v="h2" style={{ marginTop: 10 }}>
          {prefs.name || 'Learner'}
        </Txt>
        {prefs.email ? <Txt v="small">{prefs.email}</Txt> : null}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          <Pill label={`Level ${stats.level}`} bg={c.primarySoft} fg={c.primaryText} />
          <Pill icon="flame" label={`${stats.streak}-day streak`} bg={c.warnSoft} fg={c.warnText} />
          <Pill icon="ribbon" label={`${prefs.certificates.length} ${prefs.certificates.length === 1 ? 'certificate' : 'certificates'}`} bg={c.successSoft} fg={c.successText} />
        </View>
      </View>

      <View style={[s.card, { gap: 10 }]}>
        <Txt v="bodyBold">I am</Txt>
        <Segmented<Gender>
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ]}
          value={prefs.gender as Gender}
          onChange={setGender}
        />
      </View>

      <View style={[s.card, s.goalRow]}>
        <View style={s.iconBox}>
          <Ionicons name="locate" size={20} color={c.primaryText} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt v="caption">Learning goal</Txt>
          <Txt v="bodyBold">{goal.label}</Txt>
        </View>
        <Button label="Change" variant="ghost" size="md" onPress={() => navigation.navigate('EditGoal')} />
      </View>

      <View style={[s.card, { padding: 0, overflow: 'hidden' }]}>
        <Txt v="eyebrow" color={c.muted} style={s.sectionLabel}>
          APPEARANCE
        </Txt>
        <SettingRow icon="moon-outline" label="Dark mode">
          <Switch value={isDark} onValueChange={toggleDark} trackColor={switchColors} thumbColor="#FFFFFF" {...WEB_THUMB} ios_backgroundColor={c.track} accessibilityLabel="Dark mode" />
        </SettingRow>
        <View style={s.divider} />
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48 }}>
            <Txt v="bodyBold">Accent colour</Txt>
            <Txt v="caption">{ACCENTS[prefs.accent].name}</Txt>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {ACCENT_ORDER.map((k) => {
              const on = k === prefs.accent;
              const swatch = ACCENTS[k][isDark ? 'dark' : 'light'].primary;
              return (
                <Pressable
                  key={k}
                  accessibilityRole="button"
                  accessibilityLabel={`${ACCENTS[k].name} accent`}
                  accessibilityState={{ selected: on }}
                  onPress={() => update({ accent: k })}
                  style={[s.swatchRing, { borderColor: on ? c.text : 'transparent' }]}
                >
                  <View style={[s.swatch, { backgroundColor: swatch }]}>
                    {on ? <Ionicons name="checkmark" size={17} color={c.onPrimary} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={[s.card, { padding: 0, overflow: 'hidden' }]}>
        <Txt v="eyebrow" color={c.muted} style={s.sectionLabel}>
          LEARNING
        </Txt>
        <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 14, gap: 10 }}>
          <Txt v="bodyBold">Daily goal</Txt>
          <Segmented
            options={[5, 10, 15, 20].map((m) => ({ value: m, label: `${m} min` }))}
            value={prefs.dailyGoal}
            onChange={(dailyGoal) => update({ dailyGoal })}
          />
        </View>
        <View style={s.divider} />
        <SettingRow
          icon="notifications-outline"
          label="Daily reminder"
          sub={prefs.reminders ? `Every day at ${formatTime(prefs.reminderTime)}` : 'Off'}
          onPress={prefs.reminders ? () => setPickTime(true) : undefined}
          hint="Tap to change the time"
        >
          <Switch
            value={prefs.reminders}
            onValueChange={(reminders) => update({ reminders })}
            trackColor={switchColors}
            thumbColor="#FFFFFF"
            {...WEB_THUMB}
            ios_backgroundColor={c.track}
            accessibilityLabel="Daily reminder"
          />
        </SettingRow>
      </View>

      <View style={[s.card, { padding: 0, overflow: 'hidden' }]}>
        <MenuRow
          icon="ribbon-outline"
          label={`My certificates (${prefs.certificates.length})`}
          onPress={() => navigation.navigate('Practice', { tab: 'certificates' })}
        />
        <View style={s.divider} />
        <MenuRow icon="help-circle-outline" label="Help and support" onPress={() => Alert.alert('Help and support', 'Support chat is coming soon.')} />
        <View style={s.divider} />
        <MenuRow
          icon="log-out-outline"
          label="Sign out"
          danger
          onPress={() => {
            signOut();
            endSession();
          }}
        />
      </View>
      <TimePickerModal
        visible={pickTime}
        value={prefs.reminderTime}
        onCancel={() => setPickTime(false)}
        onSave={(reminderTime) => {
          update({ reminderTime });
          setPickTime(false);
        }}
      />
    </Screen>
  );
}

function SettingRow({
  icon,
  label,
  sub,
  children,
  onPress,
  hint,
}: {
  icon: IconName;
  label: string;
  sub?: string;
  children: React.ReactNode;
  onPress?: () => void; // makes the text area tappable (the switch keeps working on its own)
  hint?: string;
}) {
  const { colors: c } = useApp();
  return (
    <View style={{ minHeight: 60, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <Ionicons name={icon} size={22} color={c.primary} />
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={onPress ? `${label}. ${sub ?? ''}. ${hint ?? ''}` : undefined}
        disabled={!onPress}
        onPress={onPress}
        style={{ flex: 1, minHeight: 44, justifyContent: 'center' }}
      >
        <Txt v="bodyBold">{label}</Txt>
        {sub ? (
          <Txt v="small" color={onPress ? c.primaryText : undefined}>
            {sub}
          </Txt>
        ) : null}
      </Pressable>
      {children}
    </View>
  );
}

function MenuRow({ icon, label, onPress, danger }: { icon: IconName; label: string; onPress: () => void; danger?: boolean }) {
  const { colors: c } = useApp();
  const color = danger ? c.dangerText : c.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ minHeight: 58, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14, opacity: pressed ? 0.7 : 1 })}
    >
      <Ionicons name={icon} size={22} color={danger ? c.dangerText : c.primary} />
      <Txt v="bodyBold" color={color} style={{ flex: 1 }}>
        {label}
      </Txt>
      {!danger ? <Ionicons name="chevron-forward" size={18} color={c.muted} /> : null}
    </Pressable>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 24, padding: 16 },
    editAvatar: { position: 'absolute', right: -10, bottom: -6, borderRadius: 26, borderWidth: 4, borderColor: c.surface },
    goalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, paddingRight: 6 },
    iconBox: { width: 40, height: 40, borderRadius: 13, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
    sectionLabel: { paddingHorizontal: 16, paddingTop: 14 },
    divider: { height: 1, backgroundColor: c.border },
    swatchRing: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    swatch: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  });
