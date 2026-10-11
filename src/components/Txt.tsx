import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { useColors } from '../context/AppContext';
import { F } from '../theme/fonts';

type Variant = 'hero' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyBold' | 'small' | 'caption' | 'eyebrow';

type Props = TextProps & { v?: Variant; color?: string };

// One text component for the whole app so sizes and fonts stay consistent.
export default function Txt({ v = 'body', color, style, ...rest }: Props) {
  const c = useColors();
  const fallback = v === 'small' || v === 'caption' ? c.muted : v === 'eyebrow' ? c.primaryText : c.text;
  return <Text {...rest} style={[styles[v], { color: color ?? fallback }, style]} />;
}

const styles = StyleSheet.create({
  hero: { fontFamily: F.display, fontSize: 32, lineHeight: 37, letterSpacing: -0.6 },
  h1: { fontFamily: F.display, fontSize: 28, lineHeight: 33, letterSpacing: -0.5 },
  h2: { fontFamily: F.display, fontSize: 21, lineHeight: 26, letterSpacing: -0.2 },
  h3: { fontFamily: F.heavy, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: F.regular, fontSize: 15, lineHeight: 23 },
  bodyBold: { fontFamily: F.heavy, fontSize: 15, lineHeight: 20 },
  small: { fontFamily: F.semi, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: F.bold, fontSize: 12, lineHeight: 16 },
  eyebrow: { fontFamily: F.heavy, fontSize: 12, lineHeight: 16, letterSpacing: 0.8 },
});
