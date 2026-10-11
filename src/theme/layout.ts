import { useWindowDimensions } from 'react-native';

// Responsive helpers: phones use the full width, tablets and desktops get a centred column.
export const BREAKPOINT = 768;
export const MAX_READING = 760; // lessons, quiz, forms
export const MAX_WIDE = 1120; // dashboards with card grids

export function useLayout() {
  const { width } = useWindowDimensions();
  const isWide = width >= BREAKPOINT;
  return { width, isWide, pad: isWide ? 32 : 20 };
}
