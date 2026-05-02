import { Platform } from 'react-native';
import { theme } from '../constants/theme';

export const stackScreenOptions = {
  headerStyle: { backgroundColor: theme.colors.backgroundAlt },
  headerTintColor: theme.colors.primaryText,
  headerTitleStyle: { fontWeight: '700' },
  headerShadowVisible: false,
  /** Prefer native/stack back gesture + header back everywhere headers are visible. */
  gestureEnabled: true,
  fullScreenGestureEnabled: Platform.OS === 'ios',
};
