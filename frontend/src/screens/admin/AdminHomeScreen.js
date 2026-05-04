import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import AccountDrawerLayout, { useAccountDrawerActions } from '../../components/profile/AccountDrawerLayout';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../constants/theme';
import { getAdminDrawerMenuItems, getAdminModuleCards } from './adminNavigation';

function avatarLetter(fullName) {
  const c = fullName?.trim()?.[0];
  return c ? c.toUpperCase() : '?';
}

function AdminHomeBody({ navigation, user, displayName, roleLabel }) {
  const actions = useAccountDrawerActions();
  const moduleCards = useMemo(() => getAdminModuleCards(navigation), [navigation]);

  return (
    <View style={styles.profileBlock}>
      <View style={styles.avatarRing}>
        <View style={styles.avatarFill}>
          <Text style={styles.avatarLetter}>{avatarLetter(user?.fullName)}</Text>
        </View>
      </View>

      <Text style={styles.helloLine}>Hello, {displayName}</Text>
      <Text style={styles.emailLine}>{user?.email?.trim() || '—'}</Text>

      {actions ? (
        <View style={styles.accountLinks}>
          <Pressable
            onPress={actions.openEditInDrawer}
            style={styles.accountLinkBtn}
            accessibilityRole="button"
            accessibilityLabel="Edit account details"
          >
            <Text style={styles.accountLinkText}>Edit account</Text>
          </Pressable>
          <Pressable
            onPress={actions.openPasswordInDrawer}
            style={styles.accountLinkBtn}
            accessibilityRole="button"
            accessibilityLabel="Change password"
          >
            <Text style={styles.accountLinkText}>Change password</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.badge}>
        <Text style={styles.badgeIcon} accessible={false}>
          🛡
        </Text>
        <Text style={styles.badgeText}>{roleLabel}</Text>
      </View>

      <View style={styles.manageCardsWrap}>
        {moduleCards.map((card) => (
          <View key={card.key} style={styles.manageCardBlock}>
            <Pressable
              style={styles.manageCard}
              onPress={card.onPress}
              accessibilityRole="button"
              accessibilityLabel={card.accessibilityLabel}
            >
              <Text style={styles.manageTitle}>{card.title}</Text>
              <Text style={styles.manageChevron} accessible={false}>
                ›
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function AdminHomeScreen({ navigation }) {
  const { user } = useAuth();

  const displayName = useMemo(() => user?.fullName?.trim() || 'Admin', [user?.fullName]);

  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);

  const roleLabel = user?.role === 'admin' ? 'ADMINISTRATOR' : (user?.role || 'USER').toUpperCase();

  return (
    <AccountDrawerLayout
      headerTitle="Explore"
      drawerMenuItems={drawerMenuItems}
      accountActionsPlacement="main"
      accountActionsInline
    >
      <AdminHomeBody navigation={navigation} user={user} displayName={displayName} roleLabel={roleLabel} />
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  profileBlock: {
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    padding: 3,
    borderWidth: 2,
    borderColor: theme.colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFill: {
    flex: 1,
    width: '100%',
    borderRadius: 52,
    backgroundColor: theme.colors.sageButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarLetter: {
    fontFamily: theme.fonts.bold,
    fontSize: 40,
    color: theme.colors.primaryText,
  },
  helloLine: {
    fontFamily: theme.fonts.bold,
    marginTop: theme.spacing.lg,
    fontSize: theme.fontSize.title,
    color: theme.colors.primaryText,
    textAlign: 'center',
  },
  emailLine: {
    fontFamily: theme.fonts.regular,
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.68,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  accountLinks: {
    alignSelf: 'stretch',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  accountLinkBtn: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accentGreen,
    borderRadius: theme.radii.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  accountLinkText: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.body,
    color: theme.colors.linkGreen,
    letterSpacing: 0.2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radii.pill,
    borderWidth: 1.5,
    borderColor: theme.colors.yellowAlt,
    backgroundColor: theme.colors.white,
    gap: 8,
  },
  badgeIcon: {
    fontSize: 16,
    color: theme.colors.linkGreen,
  },
  badgeText: {
    fontFamily: theme.fonts.extraBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: theme.colors.linkGreen,
  },
  manageCard: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  manageCardsWrap: {
    alignSelf: 'stretch',
    marginTop: theme.spacing.xl,
  },
  manageCardBlock: {
    marginBottom: 6,
  },
  manageTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
  },
  manageChevron: {
    fontSize: 22,
    color: theme.colors.accentGreen,
    fontWeight: '300',
  },
});
