import { Platform } from 'react-native';
import { colors } from './colors';

/**
 * Platform default sans-serif (San Francisco / Roboto / system UI stack on web).
 * Use with fontWeight for regular / semibold / bold.
 */
const SYSTEM_SANS = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: undefined,
});

export const theme = {
  colors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radii: {
    sm: 12,
    md: 16,
    lg: 20,
    pill: 25,
  },
  fontSize: {
    sm: 14,
    body: 16,
    lg: 18,
    title: 22,
    hero: 28,
  },
  fonts: {
    /** All faces map to native UI fonts; pair with fontWeight in styles. */
    regular: SYSTEM_SANS,
    semiBold: SYSTEM_SANS,
    bold: SYSTEM_SANS,
    extraBold: SYSTEM_SANS,
    comic: SYSTEM_SANS,
    comicBold: SYSTEM_SANS,
  },
};
