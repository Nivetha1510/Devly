import React from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../context/AppContext';
import { MAX_READING, MAX_WIDE, useLayout } from '../theme/layout';

type Props = {
  children: React.ReactNode;
  footer?: React.ReactNode; // sticky bar at the bottom (e.g. a main button)
  inTabs?: boolean; // tab screens let the tab bar handle the bottom safe area
  contentStyle?: StyleProp<ViewStyle>;
  wide?: boolean; // dashboards / card grids may use the wider column on big screens
};

// Standard screen wrapper: themed background, safe areas, scrolling content.
export default function Screen({ children, footer, inTabs, contentStyle, wide }: Props) {
  const c = useColors();
  const { pad } = useLayout();
  const edges: Edge[] = footer || inTabs ? ['top'] : ['top', 'bottom'];
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          { padding: pad, paddingBottom: 32, gap: 18, width: '100%', maxWidth: wide ? MAX_WIDE : MAX_READING, alignSelf: 'center' },
          contentStyle,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer ? <Footer wide={wide}>{footer}</Footer> : null}
    </SafeAreaView>
  );
}

export function Footer({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  const c = useColors();
  const { pad } = useLayout();
  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: c.nav, borderTopWidth: 1, borderTopColor: c.border }}>
      <View
        style={{
          paddingHorizontal: pad,
          paddingVertical: 14,
          flexDirection: 'row',
          gap: 12,
          width: '100%',
          maxWidth: wide ? MAX_WIDE : MAX_READING,
          alignSelf: 'center',
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
