// Colour system for Devly.
// Every screen reads colours from buildColors() so light/dark mode and the
// accent colour can change at runtime without touching any screen code.

export type AccentKey = 'iris' | 'teal' | 'rose' | 'amber';

type AccentSet = { primary: string; soft: string; text: string };

export const ACCENTS: Record<AccentKey, { name: string; light: AccentSet; dark: AccentSet }> = {
  iris: {
    name: 'Iris',
    light: { primary: '#5B5BD6', soft: '#ECECFB', text: '#3D3DB0' },
    dark: { primary: '#9D9EF8', soft: '#2A2A4E', text: '#C9CAFF' },
  },
  teal: {
    name: 'Teal',
    light: { primary: '#11806F', soft: '#DEF2EC', text: '#0A5C50' },
    dark: { primary: '#4FC9B1', soft: '#173A34', text: '#A3E8D9' },
  },
  rose: {
    name: 'Rose',
    light: { primary: '#B44A6F', soft: '#FAE6ED', text: '#8C3053' },
    dark: { primary: '#F293B3', soft: '#40222F', text: '#FFC7D9' },
  },
  amber: {
    name: 'Amber',
    light: { primary: '#9A6412', soft: '#FBEFD8', text: '#704708' },
    dark: { primary: '#EDB85F', soft: '#3D3119', text: '#FFDEA6' },
  },
};

export const ACCENT_ORDER: AccentKey[] = ['iris', 'teal', 'rose', 'amber'];

export type Colors = {
  isDark: boolean;
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  border: string;
  track: string;
  primary: string;
  primarySoft: string;
  primaryText: string;
  onPrimary: string;
  paper: string;
  nav: string;
  code: string;
  success: string;
  successSoft: string;
  successText: string;
  danger: string;
  dangerSoft: string;
  dangerText: string;
  warn: string;
  warnSoft: string;
  warnText: string;
  shadow: string;
};

export function buildColors(dark: boolean, accent: AccentKey): Colors {
  const a = ACCENTS[accent][dark ? 'dark' : 'light'];
  if (dark) {
    return {
      isDark: true,
      bg: '#13151D',
      surface: '#1C1F2A',
      surface2: '#262A37',
      text: '#ECEEF5',
      muted: '#A3A9BE',
      border: '#2D3142',
      track: '#2D3142',
      primary: a.primary,
      primarySoft: a.soft,
      primaryText: a.text,
      onPrimary: '#13151D',
      paper: '#2A2E3C',
      nav: '#181B25',
      code: '#0D0F15',
      success: '#5CCB9F',
      successSoft: '#183A2E',
      successText: '#9FE8C8',
      danger: '#F08A8A',
      dangerSoft: '#402225',
      dangerText: '#FFB4B4',
      warn: '#F2C46B',
      warnSoft: '#3A3019',
      warnText: '#FFE0A3',
      shadow: '#000000',
    };
  }
  return {
    isDark: false,
    bg: '#F4F5F9',
    surface: '#FFFFFF',
    surface2: '#EEF0F6',
    text: '#1E2130',
    muted: '#5D6276',
    border: '#E4E7EF',
    track: '#E4E7EF',
    primary: a.primary,
    primarySoft: a.soft,
    primaryText: a.text,
    onPrimary: '#FFFFFF',
    paper: '#FFFFFF',
    nav: '#FFFFFF',
    code: '#1E2130',
    success: '#1F8A61',
    successSoft: '#E1F4EC',
    successText: '#14603F',
    danger: '#C2413F',
    dangerSoft: '#FCE8E7',
    dangerText: '#A3302E',
    warn: '#B7791F',
    warnSoft: '#FDF1DA',
    warnText: '#6E4708',
    shadow: '#1E2130',
  };
}

// Syntax colours for code blocks (code blocks are dark in both themes).
export const SYNTAX = {
  kw: '#B4B6FF',
  fn: '#FFD58A',
  str: '#8EE6C4',
  num: '#FFB38A',
  plain: '#E6E8F5',
};

// Pastel tiles behind course illustrations.
export type TileKey = 'lav' | 'mint' | 'peach' | 'sky' | 'butter';
type Tile = { bg: string; ink: string; ink2: string };

const TILES: Record<'light' | 'dark', Record<TileKey, Tile>> = {
  light: {
    lav: { bg: '#ECEAFD', ink: '#5B57D1', ink2: '#E58AB0' },
    mint: { bg: '#DDF3EC', ink: '#1F8A6E', ink2: '#F0A84B' },
    peach: { bg: '#FDE8DC', ink: '#D9693D', ink2: '#6C67E0' },
    sky: { bg: '#DDEBFB', ink: '#2F6FC2', ink2: '#F08A5D' },
    butter: { bg: '#FBF1D2', ink: '#B07C12', ink2: '#2F9C80' },
  },
  dark: {
    lav: { bg: '#29284A', ink: '#A9A6FF', ink2: '#F3A6C8' },
    mint: { bg: '#193A33', ink: '#6FD8BC', ink2: '#F2C46B' },
    peach: { bg: '#3E2A23', ink: '#F7A47F', ink2: '#A9A6FF' },
    sky: { bg: '#1C2F46', ink: '#7DB6F5', ink2: '#F7A47F' },
    butter: { bg: '#3A3320', ink: '#EDC46A', ink2: '#6FD8BC' },
  },
};

export function tileColors(dark: boolean, key: TileKey): Tile {
  return TILES[dark ? 'dark' : 'light'][key];
}
