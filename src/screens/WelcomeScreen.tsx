import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import Txt from '../components/Txt';
import { Button, shadow, ThemeToggle } from '../components/ui';
import { useApp, useStyles } from '../context/AppContext';
import { RootScreenProps } from '../navigation/types';
import { F } from '../theme/fonts';
import { Colors, SYNTAX } from '../theme/palette';

export default function WelcomeScreen({ navigation }: RootScreenProps<'Welcome'>) {
  const { colors: c } = useApp();
  const s = useStyles(makeStyles);
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }} bounces={false}>
      <View style={[s.hero, { paddingTop: insets.top + 12 }]}>
        <View style={s.topRow}>
          <View style={s.brand}>
            <View style={s.logo}>
              <Ionicons name="code-slash" size={20} color={c.onPrimary} />
            </View>
            <Text style={s.brandName}>Devly</Text>
          </View>
          <ThemeToggle />
        </View>

        {/* Illustration stage: fixed size, centred, so it looks the same on every phone */}
        <View style={s.stage}>
          <View style={s.glow} />
          <View style={s.codeCard}>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
              <View style={[s.dot, { backgroundColor: '#F28B82' }]} />
              <View style={[s.dot, { backgroundColor: '#F6CD6B' }]} />
              <View style={[s.dot, { backgroundColor: '#74D3AE' }]} />
            </View>
            <Text style={s.code}>
              <Text style={{ color: SYNTAX.kw }}>def</Text> <Text style={{ color: SYNTAX.fn }}>learn</Text>(skill):{'\n'}
              {'    '}<Text style={{ color: SYNTAX.kw }}>return</Text> <Text style={{ color: SYNTAX.str }}>f"I can {'{skill}'}!"</Text>{'\n\n'}
              <Text style={{ color: SYNTAX.fn }}>print</Text>(learn(<Text style={{ color: SYNTAX.str }}>"code"</Text>))
            </Text>
          </View>

          <View style={[s.float, { left: 8, top: 0 }]}>
            <Avatar who="lena" size={64} ring={c.surface} />
          </View>
          <View style={[s.float, { right: 14, top: 8 }]}>
            <Avatar who="arjun" size={56} ring={c.surface} />
          </View>
          <View style={[s.float, { right: 8, top: 236 }]}>
            <Avatar who="kofi" size={70} ring={c.surface} />
          </View>
          <View style={[s.float, { left: 16, top: 258 }]}>
            <Avatar who="sofia" size={56} ring={c.surface} />
          </View>

          <View style={[s.badge, { left: 92, top: 256 }]}>
            <View style={s.badgeIcon}>
              <Ionicons name="checkmark" size={15} color={c.successText} />
            </View>
            <Text style={s.badgeText}>Lesson complete</Text>
          </View>
          <View style={[s.xp, { left: 138, top: 312 }]}>
            <Ionicons name="flash" size={14} color={c.warnText} />
            <Text style={[s.badgeText, { color: c.warnText }]}>+20 XP</Text>
          </View>
        </View>
      </View>

      <View style={s.body}>
        <Txt v="hero">Learn tech skills, a few minutes a day</Txt>
        <Txt v="body" color={c.muted} style={{ marginTop: 12, fontSize: 16, lineHeight: 24 }}>
          Bite-sized lessons, real code and friendly quizzes in Python, web, AI and more.
        </Txt>
        <View style={{ flex: 1, minHeight: 24 }} />
        <Button label="Get started" icon="arrow-forward" onPress={() => navigation.navigate('SignIn', { mode: 'signup' })} />
        <Button label="I already have an account" variant="ghost" onPress={() => navigation.navigate('SignIn', { mode: 'signin' })} style={{ marginTop: 6 }} />
      </View>
    </ScrollView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    hero: {
      backgroundColor: c.primarySoft,
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      paddingHorizontal: 20,
      paddingBottom: 24,
      overflow: 'hidden',
    },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logo: { width: 38, height: 38, borderRadius: 12, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    brandName: { fontFamily: F.display, fontSize: 23, color: c.primaryText },
    stage: { width: 350, height: 360, alignSelf: 'center', marginTop: 16 },
    glow: { position: 'absolute', left: 45, top: 20, width: 260, height: 260, borderRadius: 130, backgroundColor: c.surface, opacity: 0.6 },
    codeCard: {
      position: 'absolute',
      left: 48,
      top: 76,
      width: 254,
      backgroundColor: c.code,
      borderRadius: 22,
      padding: 16,
      transform: [{ rotate: '-4deg' }],
      ...shadow('#141628', 0.28),
    },
    dot: { width: 9, height: 9, borderRadius: 5 },
    code: { fontFamily: F.mono, fontSize: 13, lineHeight: 22, color: SYNTAX.plain },
    float: { position: 'absolute' },
    badge: {
      position: 'absolute',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.surface,
      borderRadius: 16,
      paddingVertical: 8,
      paddingHorizontal: 12,
      ...shadow(c.shadow),
    },
    badgeIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: c.successSoft, alignItems: 'center', justifyContent: 'center' },
    badgeText: { fontFamily: F.heavy, fontSize: 13, color: c.text },
    xp: {
      position: 'absolute',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.warnSoft,
      borderRadius: 999,
      paddingVertical: 7,
      paddingHorizontal: 13,
      ...shadow(c.shadow),
    },
    body: { flex: 1, paddingHorizontal: 24, paddingTop: 28 },
  });
