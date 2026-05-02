import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import ModuleCard from '../../components/ui/ModuleCard';
import { FEATURE_MODULES } from '../../constants/modules';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../constants/theme';
import { buildUserDrawerMenuItems } from './userDrawerMenu';

function ProfileExploreBody({ navigation, firstName, moduleRows }) {
  return (
    <>
      <View style={styles.adventureHeading}>
        <Text style={styles.adventureLeaf} accessible={false} importantForAccessibility="no">
          🌿
        </Text>
        <Text style={styles.adventureTitle}>
          {firstName}, Start your adventure here
        </Text>
      </View>

      <>
        {moduleRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.moduleRow}>
            {row.map((m) => (
              <View key={m.route} style={styles.moduleCell}>
                <ModuleCard
                  variant="grid"
                  title={m.title}
                  description={m.description}
                  emoji={m.emoji}
                  image={m.image}
                  onPress={() => navigation.navigate(m.route)}
                />
              </View>
            ))}
          </View>
        ))}
      </>
    </>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();

  const firstName = useMemo(() => {
    const parts = user?.fullName?.trim().split(/\s+/).filter(Boolean);
    return parts?.[0] || 'there';
  }, [user?.fullName]);

  const moduleRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < FEATURE_MODULES.length; i += 2) {
      rows.push(FEATURE_MODULES.slice(i, i + 2));
    }
    return rows;
  }, []);

  const drawerMenuItems = useMemo(() => buildUserDrawerMenuItems(navigation), [navigation]);

  return (
    <AccountDrawerLayout
      headerTitle="Explore"
      drawerMenuItems={drawerMenuItems}
    >
      <ProfileExploreBody navigation={navigation} firstName={firstName} moduleRows={moduleRows} />
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
  moduleRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  moduleCell: {
    flex: 1,
    minWidth: 0,
  },
});
