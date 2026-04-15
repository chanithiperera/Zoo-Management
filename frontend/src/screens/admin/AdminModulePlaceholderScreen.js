import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import { theme } from '../../constants/theme';
import { getAdminDrawerMenuItems, getAdminModuleHeroByRouteName } from './adminNavigation';

export default function AdminModulePlaceholderScreen({ navigation }) {
  const route = useRoute();
  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);
  const hero = getAdminModuleHeroByRouteName(route.name);

  return (
    <AccountDrawerLayout headerTitle="Explore" drawerMenuItems={drawerMenuItems}>
      {hero ? (
        <View style={styles.heroCard} accessibilityRole="header">
          <Text style={styles.title}>{hero.title}</Text>
          <Text style={styles.sub}>{hero.subtitle}</Text>
        </View>
      ) : null}
      <View style={styles.empty} />
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  heroCard: {
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
    color: theme.colors.linkGreen,
    letterSpacing: -0.2,
  },
  sub: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    lineHeight: Math.round(theme.fontSize.sm * 1.45),
    color: theme.colors.accentGreen,
    opacity: 0.92,
  },
  empty: {
    flex: 1,
  },
});
