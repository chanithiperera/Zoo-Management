import { StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

export const commonStyles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.hero,
    fontWeight: '700',
    color: theme.colors.primaryText,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    textAlign: 'center',
    opacity: 0.85,
    marginTop: theme.spacing.sm,
  },
});
