import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import ModuleCard from '../../components/ui/ModuleCard';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../constants/theme';

export default function AdminHomeScreen({ navigation }) {
  const { user } = useAuth();

  const firstName = useMemo(() => {
    const parts = user?.fullName?.trim().split(/\s+/).filter(Boolean);
    return parts?.[0] || 'there';
  }, [user?.fullName]);

  const drawerMenuItems = useMemo(
    () => [
      {
        key: 'user-management',
        label: 'User Management',
        subtitle: 'View and edit visitor and admin accounts',
        accessibilityLabel: 'User management: view and edit accounts',
        titleStyle: {
          fontSize: theme.fontSize.title,
          lineHeight: Math.round(theme.fontSize.title * 1.25),
        },
        onPress: () => navigation.navigate('UserManagement'),
      },
    ],
    [navigation]
  );

  return (
    <AccountDrawerLayout headerTitle="Explore" drawerMenuItems={drawerMenuItems}>
      <View style={styles.adventureHeading}>
        <Text style={styles.adventureLeaf} accessible={false} importantForAccessibility="no">
          🌿
        </Text>
        <Text style={styles.adventureTitle}>{firstName}, manage the zoo workspace</Text>
      </View>

      <View style={styles.singleCard}>
        <ModuleCard
          variant="row"
          title="User Management"
          titleStyle={{
            fontSize: theme.fontSize.title,
            lineHeight: Math.round(theme.fontSize.title * 1.25),
          }}
          description="View and edit visitor and admin accounts"
          onPress={() => navigation.navigate('UserManagement')}
        />
      </View>
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  adventureHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  adventureLeaf: {
    fontSize: 28,
    lineHeight: 32,
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  adventureTitle: {
    flex: 1,
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
    lineHeight: theme.fontSize.title * 1.25,
  },
  singleCard: {
    width: '100%',
  },
});
