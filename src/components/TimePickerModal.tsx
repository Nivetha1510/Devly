import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useApp, useStyles } from '../context/AppContext';
import { formatTime, parseTime, toTime } from '../data/reminder';
import { F } from '../theme/fonts';
import { Colors } from '../theme/palette';
import Txt from './Txt';
import { Button, Segmented } from './ui';

const PRESETS = ['08:00', '12:30', '18:00', '19:30', '21:00'];
const MINUTE_STEP = 5;

type Props = { visible: boolean; value: string; onCancel: () => void; onSave: (time: string) => void };

// Simple time chooser that works the same on phone and web: hour and minute steppers plus AM/PM.
export default function TimePickerModal({ visible, value, onCancel, onSave }: Props) {
  const { colors: c } = useApp();
  const s = useStyles(makeStyles);
  const [h24, setH24] = useState(19);
  const [min, setMin] = useState(30);

  // Start from the saved time each time the dialog opens.
  useEffect(() => {
    if (visible) {
      const t = parseTime(value);
      setH24(t.h);
      setMin(t.m);
    }
  }, [visible, value]);

  const pm = h24 >= 12;
  const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const setHour12 = (h: number) => setH24((h % 12) + (pm ? 12 : 0));
  const setPm = (isPm: boolean) => setH24((h24 % 12) + (isPm ? 12 : 0));
  const current = toTime(h24, min);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={s.backdrop} onPress={onCancel} accessibilityLabel="Close time picker">
        <Pressable style={s.sheet} onPress={() => {}}>
          <Txt v="h3">Reminder time</Txt>
          <Txt v="small">We will remind you to learn at this time every day.</Txt>

          <View style={s.timeRow}>
            <Stepper
              label="Hour"
              value={String(hour12)}
              onUp={() => setHour12(hour12 === 12 ? 1 : hour12 + 1)}
              onDown={() => setHour12(hour12 === 1 ? 12 : hour12 - 1)}
            />
            <Txt v="h1" style={{ paddingTop: 36 }}>
              :
            </Txt>
            <Stepper
              label="Minute"
              value={String(min).padStart(2, '0')}
              onUp={() => setMin((m) => (m + MINUTE_STEP) % 60)}
              onDown={() => setMin((m) => (m - MINUTE_STEP + 60) % 60)}
            />
            <View style={{ width: 120, paddingTop: 22 }}>
              <Segmented<'AM' | 'PM'>
                options={[
                  { value: 'AM', label: 'AM' },
                  { value: 'PM', label: 'PM' },
                ]}
                value={pm ? 'PM' : 'AM'}
                onChange={(v) => setPm(v === 'PM')}
              />
            </View>
          </View>

          <View style={s.presets}>
            {PRESETS.map((p) => {
              const on = p === current;
              return (
                <Pressable
                  key={p}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    const t = parseTime(p);
                    setH24(t.h);
                    setMin(t.m);
                  }}
                  style={[s.preset, { borderColor: on ? c.primary : c.border, backgroundColor: on ? c.primarySoft : c.surface }]}
                >
                  <Txt v="caption" color={on ? c.primaryText : c.text} style={{ fontFamily: F.bold }}>
                    {formatTime(p)}
                  </Txt>
                </Pressable>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Cancel" variant="secondary" onPress={onCancel} style={{ flex: 1 }} />
            <Button label={`Save ${formatTime(current)}`} onPress={() => onSave(current)} style={{ flex: 1.4 }} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Stepper({ label, value, onUp, onDown }: { label: string; value: string; onUp: () => void; onDown: () => void }) {
  const { colors: c } = useApp();
  const s = useStyles(makeStyles);
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <Txt v="caption">{label}</Txt>
      <Pressable accessibilityRole="button" accessibilityLabel={`Increase ${label.toLowerCase()}`} onPress={onUp} style={s.step}>
        <Ionicons name="chevron-up" size={22} color={c.text} />
      </Pressable>
      <View style={s.valueBox}>
        <Txt v="h1" style={{ fontSize: 34 }}>
          {value}
        </Txt>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Decrease ${label.toLowerCase()}`} onPress={onDown} style={s.step}>
        <Ionicons name="chevron-down" size={22} color={c.text} />
      </Pressable>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
    sheet: { width: '100%', maxWidth: 440, backgroundColor: c.surface, borderRadius: 28, padding: 20, gap: 14, borderWidth: 1, borderColor: c.border },
    timeRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 12, paddingVertical: 4 },
    step: { width: 56, height: 48, borderRadius: 16, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' },
    valueBox: { minWidth: 64, height: 56, alignItems: 'center', justifyContent: 'center' },
    presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    preset: { minHeight: 44, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  });
