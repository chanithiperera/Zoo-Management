import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

/**
 * Standard intro card under {@link AccountDrawerLayout} (matches User Management).
 * Title in link green; subtitle in muted body grey.
 */
export default function AdminModuleHero({ title, subtitle, children, style }) {
  if (!title) return null;
  return (
    <View style={[styles.card, style]} accessibilityRole="header">
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accentGreen,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.accentGreen,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
    color: theme.colors.linkGreen,
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    lineHeight: Math.round(theme.fontSize.sm * 1.45),
    color: theme.colors.primaryText,
    opacity: 0.66,
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
  },
});
