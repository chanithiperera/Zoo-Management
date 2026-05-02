import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { APP_NAME } from '../../constants/branding';
import { theme } from '../../constants/theme';

export default function SplashScreen() {
  return (
    <View style={styles.wrap} accessibilityLabel={`${APP_NAME} loading`}>
      <Text style={styles.title}>
        <Text style={styles.titleZentra}>Zentra</Text>
        <Text style={styles.titleZoo}>Zoo</Text>
      </Text>
      <Text style={styles.sub}>Visitor management</Text>
      <ActivityIndicator size="large" color={theme.colors.accentGreen} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.hero,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  titleZentra: {
    color: theme.colors.primaryText,
  },
  titleZoo: {
    color: theme.colors.accentGreen,
  },
  sub: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.lg,
    color: theme.colors.primaryText,
    opacity: 0.85,
  },
  spinner: { marginTop: theme.spacing.xl },
});
