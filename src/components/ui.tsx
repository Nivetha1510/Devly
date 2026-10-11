// Small shared building blocks: buttons, chips, progress, cards.
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Platform, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useApp, useColors } from '../context/AppContext';
import { F } from '../theme/fonts';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

// ---------- Buttons ----------

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'soft' | 'ghost';
  size?: 'lg' | 'md';
  icon?: IconName;
  iconLeft?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', size = 'lg', icon, iconLeft, disabled, style }: ButtonProps) {
  const c = useColors();
  const look = {
    primary: { bg: c.primary, fg: c.onPrimary, border: c.primary },
    secondary: { bg: c.surface, fg: c.text, border: c.border },
    soft: { bg: c.primarySoft, fg: c.primaryText, border: c.primarySoft },
    ghost: { bg: 'transparent', fg: c.primaryText, border: 'transparent' },
  }[variant];
  const bg = disabled ? c.track : look.bg;
  const fg = disabled ? c.muted : look.fg;
  const lg = size === 'lg';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: lg ? 56 : 46,
          borderRadius: lg ? 18 : 15,
          paddingHorizontal: lg ? 20 : 16,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: disabled ? c.track : look.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {iconLeft ? <Ionicons name={iconLeft} size={17} color={fg} /> : null}
      <Text style={{ color: fg, fontFamily: F.heavy, fontSize: lg ? 17 : 15 }}>{label}</Text>
      {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
    </Pressable>
  );
}

type IconButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: string;
  bg?: string;
  bordered?: boolean;
  size?: number;
  iconSize?: number;
  dot?: boolean;
  selected?: boolean;
  elevated?: boolean;
};

export function IconButton({ icon, label, onPress, color, bg, bordered = true, size = 44, iconSize = 21, dot, selected, elevated }: IconButtonProps) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? undefined : { selected }}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg ?? c.surface,
          borderWidth: bordered ? 1 : 0,
          borderColor: c.border,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.75 : 1,
        },
        elevated && shadow(c.shadow),
      ]}
    >
      <Ionicons name={icon} size={iconSize} color={color ?? c.text} />
      {dot ? (
        <View style={{ position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: c.danger }} />
      ) : null}
    </Pressable>
  );
}

export function ThemeToggle() {
  const { isDark, toggleDark } = useApp();
  return (
    <IconButton
      icon={isDark ? 'sunny-outline' : 'moon-outline'}
      label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onPress={toggleDark}
    />
  );
}

// ---------- Selection ----------

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        paddingHorizontal: 18,
        borderRadius: 22,
        justifyContent: 'center',
        backgroundColor: selected ? c.primary : c.surface,
        borderWidth: 1,
        borderColor: selected ? c.primary : c.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ fontFamily: F.bold, fontSize: 14, color: selected ? c.onPrimary : c.text }}>{label}</Text>
    </Pressable>
  );
}

type SegmentedProps<T extends string | number> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  compact?: boolean;
};

export function Segmented<T extends string | number>({ options, value, onChange, compact }: SegmentedProps<T>) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: 3, backgroundColor: c.surface2, borderRadius: 15, padding: 3 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[
              {
                flex: compact ? undefined : 1,
                minHeight: compact ? 40 : 44,
                paddingHorizontal: 12,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: on ? c.surface : 'transparent',
              },
              on && shadow(c.shadow, 0.08),
            ]}
          >
            <Text style={{ fontFamily: F.heavy, fontSize: 13, color: on ? c.text : c.muted }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------- Display ----------

export function Card({ children, style, tint }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; tint?: string }) {
  const c = useColors();
  return (
    <View
      style={[
        {
          backgroundColor: tint ?? c.surface,
          borderRadius: 24,
          padding: 16,
          borderWidth: tint ? 0 : 1,
          borderColor: c.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Pill({ label, icon, bg, fg }: { label: string; icon?: IconName; bg: string; fg: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' }}>
      {icon ? <Ionicons name={icon} size={13} color={fg} /> : null}
      <Text style={{ fontFamily: F.heavy, fontSize: 12, color: fg }}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value, color, track, height = 8 }: { value: number; color?: string; track?: string; height?: number }) {
  const c = useColors();
  const pct = Math.max(0, Math.min(1, value));
  const anim = useRef(new Animated.Value(pct)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 350, useNativeDriver: false }).start();
  }, [pct, anim]);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={{ height, borderRadius: height / 2, backgroundColor: track ?? c.track, overflow: 'hidden' }}
    >
      <Animated.View
        style={{
          height,
          borderRadius: height / 2,
          backgroundColor: color ?? c.primary,
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}

export function Ring({ value, size = 64, stroke = 7, color, track, children }: { value: number; size?: number; stroke?: number; color: string; track: string; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circ * pct} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

// Fades and slides content in when it first appears.
export function FadeIn({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 260, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [v]);
  return (
    <Animated.View
      style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}
    >
      {children}
    </Animated.View>
  );
}

export function shadow(color: string, opacity = 0.12): ViewStyle {
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  };
}

// ---------- Responsive grid ----------

// Lays children out in as many equal columns as fit (each at least `minItem` wide).
// One column on phones, two or three on tablets and desktops.
export function Grid({ children, minItem = 320, gap = 12 }: { children: React.ReactNode; minItem?: number; gap?: number }) {
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setW(Math.floor(e.nativeEvent.layout.width));
  const cols = w ? Math.max(1, Math.floor((w + gap) / (minItem + gap))) : 1;
  const itemW = w ? Math.floor((w - gap * (cols - 1)) / cols) : undefined;
  return (
    <View onLayout={onLayout} style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {React.Children.toArray(children).map((child, i) => (
        <View key={i} style={{ width: itemW ?? '100%' }}>
          {child}
        </View>
      ))}
    </View>
  );
}
