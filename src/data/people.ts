// Illustrated characters used as avatars and course mentors.
// All drawn with react-native-svg (see components/Avatar.tsx) — no image files needed.

export type MentorKey = 'arjun' | 'lena' | 'kofi' | 'sofia';
export type LearnerKey = 'maya' | 'priya' | 'diego' | 'amara' | 'noah';
export type AvatarKey = MentorKey | LearnerKey;
type HairStyle = 'short' | 'long' | 'bun' | 'curly';

export const HAIR: Record<HairStyle, { back?: string; front: string }> = {
  short: {
    front: 'M19.5 30c-1.5-10 5-16.5 12.5-16.5S46 20 44.5 30c-3-4.5-7-7-11-7.5-3 3.5-8 6-14 7.5z',
  },
  long: {
    back: 'M17.5 31C16.5 19 23 12.5 32 12.5S47.5 19 46.5 31L48 49c-5 3.5-27 3.5-32 0z',
    front: 'M20 29c0-9 5-14.5 12-14.5S44 20 44 29c-5.5-1.5-9.5-4.5-12-9-2.5 4.5-6.5 7.5-12 9z',
  },
  bun: {
    back: 'M32 4a7 7 0 1 1 0 14 7 7 0 1 1 0-14z',
    front: 'M19.5 29c-1-9 5-15 12.5-15s13.5 6 12.5 15c-3.5-3.5-7.5-5.5-12.5-5.5s-9 2-12.5 5.5z',
  },
  curly: {
    front: 'M19 30c-3-3-2-9 2-11 0-5 6-8 10-6 3-3 9-2 11 2 4 1 6 6 4 10 1 2 0 4-1 5-2-4-6-7-13-7s-11 3-13 7z',
  },
};

export type Person = {
  first: string;
  full: string;
  role: string;
  bg: string;
  skin: string;
  hair: string;
  shirt: string;
  style: HairStyle;
};

export const PEOPLE: Record<AvatarKey, Person> = {
  maya: { first: 'Maya', full: 'Maya Rao', role: 'Learner', bg: '#FFD9C7', skin: '#C68B66', hair: '#2B1D16', shirt: '#6C67E0', style: 'long' },
  arjun: { first: 'Arjun', full: 'Arjun Mehta', role: 'Backend engineer', bg: '#CDEFE2', skin: '#A86F4C', hair: '#1E1A17', shirt: '#2F8F74', style: 'short' },
  lena: { first: 'Lena', full: 'Lena Park', role: 'Machine learning engineer', bg: '#E2DDFB', skin: '#F1C7A6', hair: '#B5652B', shirt: '#D9693D', style: 'bun' },
  kofi: { first: 'Kofi', full: 'Kofi Mensah', role: 'DevOps engineer', bg: '#FBEBBE', skin: '#6E4630', hair: '#141010', shirt: '#2F6FC2', style: 'curly' },
  sofia: { first: 'Sofia', full: 'Sofia Ruiz', role: 'Frontend developer', bg: '#D3E6FA', skin: '#E8B48F', hair: '#7A3B1E', shirt: '#B07C12', style: 'long' },
  // Fellow learners in the weekly league (kept distinct from the mentors above).
  priya: { first: 'Priya', full: 'Priya Nair', role: 'Learner', bg: '#F9D6E4', skin: '#B97B58', hair: '#1B1412', shirt: '#C2417A', style: 'bun' },
  diego: { first: 'Diego', full: 'Diego Torres', role: 'Learner', bg: '#D9EBD0', skin: '#D7A27C', hair: '#2A1B12', shirt: '#4C8A3A', style: 'curly' },
  amara: { first: 'Amara', full: 'Amara Okafor', role: 'Learner', bg: '#FFE3B8', skin: '#5E3A28', hair: '#0F0C0B', shirt: '#E08A1E', style: 'curly' },
  noah: { first: 'Noah', full: 'Noah Bennett', role: 'Learner', bg: '#D6E0F5', skin: '#F0C9A8', hair: '#5A3A22', shirt: '#3D5FB5', style: 'short' },
};

export type Gender = 'male' | 'female' | 'other';

// Avatars offered on the Profile screen, matched to the learner's gender (first one is the default).
export const AVATARS_BY_GENDER: Record<Gender, AvatarKey[]> = {
  male: ['noah', 'arjun', 'kofi', 'diego'],
  female: ['maya', 'sofia', 'lena', 'priya', 'amara'],
  other: ['noah', 'maya', 'arjun', 'sofia', 'kofi', 'lena'],
};

export function avatarsFor(gender: Gender | ''): AvatarKey[] {
  return AVATARS_BY_GENDER[gender || 'other'];
}
