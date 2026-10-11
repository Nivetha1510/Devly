import React from 'react';
import { Image, View } from 'react-native';
import { useApp } from '../context/AppContext';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { AvatarKey, HAIR, PEOPLE } from '../data/people';

type Props = { who: AvatarKey; size?: number; ring?: string; photo?: string };

// Friendly illustrated avatar drawn in SVG. `ring` adds a coloured border around it.
export default function Avatar({ who, size = 48, ring, photo }: Props) {
  const p = PEOPLE[who];
  const hair = HAIR[p.style];

  const face = (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${p.first} avatar`}
      style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: p.bg }}
    >
      {photo ? (
        <Image source={{ uri: photo }} style={{ width: size, height: size }} />
      ) : (
      <Svg width={size} height={size} viewBox="0 0 64 64">
        {hair.back ? <Path d={hair.back} fill={p.hair} /> : null}
        <Path d="M11 66c2-12 10-17.5 21-17.5S51 54 53 66z" fill={p.shirt} />
        <Path d="M27.5 40h9v11h-9z" fill={p.skin} />
        <Ellipse cx={32} cy={31} rx={12.5} ry={13.5} fill={p.skin} />
        <Path d={hair.front} fill={p.hair} />
        <Circle cx={27.3} cy={32.2} r={1.7} fill="#2A2233" />
        <Circle cx={36.7} cy={32.2} r={1.7} fill="#2A2233" />
        <Circle cx={24.4} cy={36.6} r={2.3} fill="#F08A8A" opacity={0.45} />
        <Circle cx={39.6} cy={36.6} r={2.3} fill="#F08A8A" opacity={0.45} />
        <Path d="M28.6 37.8q3.4 3 6.8 0" fill="none" stroke="#2A2233" strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
      )}
    </View>
  );

  if (!ring) return face;
  const border = Math.max(2, Math.round(size / 16));
  return (
    <View style={{ padding: border, borderRadius: size, backgroundColor: ring, alignSelf: 'flex-start' }}>{face}</View>
  );
}

// The signed-in learner's avatar: their own photo if they picked one, otherwise the illustrated character.
export function MyAvatar({ size, ring }: { size?: number; ring?: string }) {
  const { prefs } = useApp();
  return <Avatar who={prefs.avatar} photo={prefs.photo || undefined} size={size} ring={ring} />;
}
