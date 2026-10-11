import React, { useState } from 'react';
import { LayoutChangeEvent, Text, View } from 'react-native';
import { Certificate, formatIssued } from '../data/practice';
import { F } from '../theme/fonts';

// The certificate is a printed document, so it keeps its own paper colours in light and dark mode
// (the same palette as the PDF template in data/practice.ts).
const PAPER = '#FFFFFF';
const INK = '#1C2340';
const MUTED = '#4A5272';
const GOLD = '#B8923A';
const ACCENT = '#2B3A8C';

// Landscape (A4-like) certificate. Sizes scale with the card width.
export default function CertificateCard({ cert }: { cert: Certificate }) {
  const [w, setW] = useState(0);
  const k = (w || 640) / 640;
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  return (
    <View
      accessible
      accessibilityLabel={`Certificate of completion. ${cert.name} completed ${cert.course_title} with ${cert.percent} percent. Code ${cert.code}.`}
      onLayout={onLayout}
      style={{ width: '100%', aspectRatio: 1.414, backgroundColor: PAPER, borderWidth: 6 * k, borderColor: INK, padding: 6 * k }}
    >
      <View
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: GOLD,
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 14 * k,
          paddingHorizontal: 20 * k,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: F.heavy, fontSize: 10 * k, letterSpacing: 4 * k, color: GOLD }}>DEVLY</Text>
          <Text style={{ fontFamily: F.heavy, fontSize: 25 * k, color: INK, marginTop: 2 * k, textAlign: 'center' }}>
            Certificate of Completion
          </Text>
        </View>

        <View style={{ alignItems: 'center', gap: 3 * k }}>
          <Text style={{ fontFamily: F.semi, fontSize: 11 * k, color: MUTED }}>This is to certify that</Text>
          <Text
            numberOfLines={2}
            style={{
              fontFamily: F.heavy,
              fontSize: 27 * k,
              color: INK,
              textAlign: 'center',
              borderBottomWidth: 1,
              borderBottomColor: GOLD,
              paddingHorizontal: 12 * k,
              paddingBottom: 2 * k,
            }}
          >
            {cert.name}
          </Text>
          <Text style={{ fontFamily: F.semi, fontSize: 11 * k, color: MUTED, textAlign: 'center' }}>
            has successfully completed the master assessment for
          </Text>
          <Text numberOfLines={2} style={{ fontFamily: F.heavy, fontSize: 20 * k, color: ACCENT, textAlign: 'center' }}>
            {cert.course_title}
          </Text>
          <Text style={{ fontFamily: F.bold, fontSize: 11 * k, color: MUTED }}>with a score of {Math.round(cert.percent)}%</Text>
        </View>

        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontFamily: F.semi, fontSize: 8 * k, color: MUTED }}>Issued on</Text>
            <Text style={{ fontFamily: F.bold, fontSize: 9 * k, color: INK }}>{formatIssued(cert.issued_at)}</Text>
          </View>
          <View style={{ alignItems: 'center', borderTopWidth: 1, borderTopColor: INK, paddingTop: 3 * k, minWidth: 120 * k }}>
            <Text style={{ fontFamily: F.semi, fontSize: 8 * k, color: INK }}>Devly Learning Platform</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 8 * k, color: MUTED }}>Certificate code</Text>
            <Text style={{ fontFamily: F.bold, fontSize: 9 * k, color: INK }}>{cert.code}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
