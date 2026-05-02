import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import { theme } from '../../constants/theme';
import { getAdminDrawerMenuItems, getAdminModuleHeroByRouteName } from './adminNavigation';

const TICKET_SHOW_ADMIN_OPTIONS = [
  {
    key: 'manage-tickets-and-shows',
    title: 'Manage Tickets and Shows',
    subtitle: 'View available entry tickets and show details.',
    accessibilityLabel: 'Manage tickets and shows',
    screen: 'AdminManageTicketsAndShows',
  },
  {
    key: 'manage-bookings',
    title: 'Manage Regular Bookings',
    subtitle: 'Review visitor reservations and regular booking records.',
    accessibilityLabel: 'Manage regular bookings',
    screen: 'AdminManageBookings',
  },
  {
    key: 'manage-group-bookings',
    title: 'Manage Group Bookings',
    subtitle: 'Review large-group booking requests and related records.',
    accessibilityLabel: 'Manage group bookings',
    screen: 'AdminManageGroupBookings',
  },
  {
    key: 'scan-and-check-in',
    title: 'Scan & Check-in Tickets',
    subtitle: 'Verify visitor QR codes or confirmation codes at the gate.',
    accessibilityLabel: 'Scan and check in tickets',
    screen: 'AdminScanTicket',
  },
];

export default function AdminModulePlaceholderScreen({ navigation }) {
  const route = useRoute();
  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);
  const hero = getAdminModuleHeroByRouteName(route.name);
  const showTicketShowOptions = route.name === 'AdminEntryTicketsShowBooking';

  return (
    <AccountDrawerLayout headerTitle="Explore" drawerMenuItems={drawerMenuItems}>
      <Pressable
        onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('AdminHome'))}
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backBtnText}>← Back</Text>
      </Pressable>
      {hero ? (
        <View style={styles.heroCard} accessibilityRole="header">
          <Text style={styles.title}>{hero.title}</Text>
          <Text style={styles.sub}>{hero.subtitle}</Text>
        </View>
      ) : null}
      {showTicketShowOptions ? (
        <View style={styles.optionsWrap}>
          {TICKET_SHOW_ADMIN_OPTIONS.map((item) => (
            <Pressable
              key={item.key}
              style={styles.optionCard}
              onPress={item.screen ? () => navigation.navigate(item.screen) : undefined}
              disabled={!item.screen}
              accessibilityRole={item.screen ? 'button' : undefined}
              accessibilityLabel={item.accessibilityLabel}
            >
              <View style={styles.optionTextCol}>
                <Text style={styles.optionTitle}>{item.title}</Text>
                <Text style={styles.optionSub}>{item.subtitle}</Text>
              </View>
              <Text style={styles.optionChevron} accessible={false}>
                ›
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.empty} />
      )}
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  backBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
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
  optionsWrap: {
    gap: theme.spacing.sm,
  },
  optionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  optionTextCol: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  optionTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  optionSub: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    lineHeight: Math.round(theme.fontSize.sm * 1.4),
    color: theme.colors.accentGreen,
    opacity: 0.92,
  },
  optionChevron: {
    fontSize: 22,
    color: theme.colors.accentGreen,
    fontWeight: '300',
  },
  empty: {
    flex: 1,
  },
});
