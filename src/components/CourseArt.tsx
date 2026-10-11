import React from 'react';
import { Platform } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { ArtKind } from '../data/courses';

// Decorative art: hidden from screen readers. The native props are unknown DOM attributes on web, so web gets aria-hidden.
const HIDDEN = (
  Platform.OS === 'web' ? { 'aria-hidden': true } : { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' }
) as object;

type Props = { kind: ArtKind; ink: string; ink2: string; paper: string; width?: number };

// Small flat illustrations for each course topic (4:3 ratio).
export default function CourseArt({ kind, ink, ink2, paper, width = 120 }: Props) {
  const height = Math.round(width * 0.75);
  return (
    <Svg width={width} height={height} viewBox="0 0 120 90" {...HIDDEN}>
      {kind === 'code' && (
        <>
          <Rect x={22} y={14} width={76} height={50} rx={7} fill={paper} stroke={ink} strokeWidth={3} />
          <Rect x={31} y={25} width={22} height={5} rx={2.5} fill={ink} />
          <Rect x={57} y={25} width={16} height={5} rx={2.5} fill={ink2} />
          <Rect x={37} y={36} width={30} height={5} rx={2.5} fill={ink2} />
          <Rect x={31} y={47} width={18} height={5} rx={2.5} fill={ink} />
          <Rect x={53} y={47} width={12} height={5} rx={2.5} fill={ink} opacity={0.5} />
          <Path d="M10 68h100l-7 9H17z" fill={ink} />
          <Circle cx={98} cy={16} r={10} fill={ink2} />
          <Path d="M94 16l3 3 5-5.5" stroke={paper} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {kind === 'ai' && (
        <>
          <Path d="M28 62L58 30L92 56L28 62M58 30L60 76" stroke={ink} strokeWidth={3} fill="none" strokeLinejoin="round" />
          <Circle cx={28} cy={62} r={9} fill={paper} stroke={ink} strokeWidth={3} />
          <Circle cx={58} cy={30} r={12} fill={ink} />
          <Circle cx={58} cy={30} r={4} fill={paper} />
          <Circle cx={92} cy={56} r={9} fill={paper} stroke={ink} strokeWidth={3} />
          <Circle cx={60} cy={76} r={7} fill={paper} stroke={ink} strokeWidth={3} />
          <Path d="M97 8l3 7.5 7.5 3-7.5 3-3 7.5-3-7.5-7.5-3 7.5-3z" fill={ink2} />
          <Path d="M20 16l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z" fill={ink2} />
        </>
      )}
      {kind === 'web' && (
        <>
          <Rect x={14} y={12} width={92} height={66} rx={9} fill={paper} stroke={ink} strokeWidth={3} />
          <Path d="M14 27h92" stroke={ink} strokeWidth={3} />
          <Circle cx={24} cy={19.5} r={2.6} fill={ink2} />
          <Circle cx={32} cy={19.5} r={2.6} fill={ink} />
          <Circle cx={40} cy={19.5} r={2.6} fill={ink} opacity={0.5} />
          <Rect x={24} y={36} width={40} height={32} rx={5} fill={ink2} />
          <Path d="M30 61l9-10 7 7 4-4 8 7" stroke={paper} strokeWidth={2.6} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <Circle cx={53} cy={44} r={3} fill={paper} />
          <Rect x={72} y={37} width={24} height={6} rx={3} fill={ink} />
          <Rect x={72} y={49} width={24} height={6} rx={3} fill={ink} opacity={0.5} />
          <Rect x={72} y={61} width={16} height={6} rx={3} fill={ink} opacity={0.5} />
        </>
      )}
      {kind === 'git' && (
        <>
          <Path d="M40 22v46" stroke={ink} strokeWidth={4} strokeLinecap="round" />
          <Path d="M40 50c0-14 42-8 42-24" stroke={ink2} strokeWidth={4} fill="none" strokeLinecap="round" />
          <Circle cx={40} cy={20} r={9} fill={paper} stroke={ink} strokeWidth={3.5} />
          <Circle cx={40} cy={70} r={9} fill={paper} stroke={ink} strokeWidth={3.5} />
          <Circle cx={82} cy={22} r={9} fill={ink2} />
          <Circle cx={40} cy={47} r={6} fill={ink} />
          <Rect x={66} y={58} width={34} height={6} rx={3} fill={ink} opacity={0.5} />
          <Rect x={66} y={70} width={22} height={6} rx={3} fill={ink} opacity={0.5} />
        </>
      )}
      {kind === 'data' && (
        <>
          <Path d="M14 77h92" stroke={ink} strokeWidth={3} strokeLinecap="round" />
          <Rect x={22} y={49} width={14} height={28} rx={4} fill={ink2} />
          <Rect x={42} y={33} width={14} height={44} rx={4} fill={ink} />
          <Rect x={62} y={43} width={14} height={34} rx={4} fill={ink2} />
          <Rect x={82} y={19} width={14} height={58} rx={4} fill={ink} />
          <Circle cx={29} cy={38} r={4} fill={paper} stroke={ink} strokeWidth={2.5} />
          <Circle cx={69} cy={32} r={4} fill={paper} stroke={ink} strokeWidth={2.5} />
          <Path d="M98 8l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill={ink2} />
        </>
      )}
      {kind === 'cloud' && (
        <>
          <Path d="M34 68a15 15 0 0 1 1-30 21 21 0 0 1 40-5 16 16 0 0 1 9 35z" fill={paper} stroke={ink} strokeWidth={3} strokeLinejoin="round" />
          <Path d="M60 60V42M52 49l8-8 8 8" stroke={ink2} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={100} cy={20} r={5} fill={ink2} />
          <Circle cx={18} cy={24} r={3.5} fill={ink} opacity={0.5} />
          <Circle cx={104} cy={70} r={3} fill={ink} opacity={0.5} />
        </>
      )}
    </Svg>
  );
}
