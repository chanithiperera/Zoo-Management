import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../constants/theme';

function avatarLetter(fullName) {
  const c = fullName?.trim()?.[0];
  return c ? c.toUpperCase() : '?';
}

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();

  const firstName = useMemo(() => {
    const parts = user?.fullName?.trim().split(/\s+/).filter(Boolean);
    return parts?.[0] || 'there';
  }, [user?.fullName]);

  const handleLogout = () => {
    Alert.alert('Log out', 'You will need to sign in again to use your account.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter(user?.fullName)}</Text>
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroGreet}>Hello,</Text>
            <Text style={styles.heroName} numberOfLines={1}>
              {user?.fullName || 'Visitor'}
            </Text>
            {user?.email ? (
              <Text style={styles.heroEmail} numberOfLines={1}>
                {user.email}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} hitSlop={12}>
            <Text style={styles.logoutLabel}>Log out</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.accountRow} activeOpacity={0.7}>
          <Text style={styles.accountLink}>Workspace & modules</Text>
          <Text style={styles.accountChevron}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Hi {firstName}</Text>
      <Text style={styles.sectionSub}>
        Your signed-in home is the profile workspace. Open it to pick a management module.
      </Text>
      <PrimaryButton title="Go to workspace" onPress={() => navigation.navigate('Profile')} />
      <View style={{ height: 12 }} />
      <PrimaryButton 
        title="My Photo Gallery" 
        onPress={() => navigation.navigate('PhotoGallery')} 
        backgroundColor="#2196F3" 
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 22,
    fontWeight: '700',
  },
  heroText: {
    flex: 1,
    marginLeft: theme.spacing.md,
    minWidth: 0,
  },
  heroGreet: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
  },
  heroName: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginTop: 2,
  },
  heroEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.6,
    marginTop: 4,
  },
  logoutBtn: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  logoutLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.error,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  accountLink: {
    fontSize: theme.fontSize.body,
    fontWeight: '600',
    color: theme.colors.linkGreen,
  },
  accountChevron: {
    fontSize: 22,
    color: theme.colors.linkGreen,
    fontWeight: '300',
  },
  sectionTitle: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.xs,
  },
  sectionSub: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
    marginBottom: theme.spacing.md,
  },
});
