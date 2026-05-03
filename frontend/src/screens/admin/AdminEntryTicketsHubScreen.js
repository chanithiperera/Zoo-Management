import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import AdminModuleHero from '../../components/admin/AdminModuleHero';
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

export default function AdminEntryTicketsHubScreen({ navigation }) {
  const route = useRoute();
  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);
  const hero = getAdminModuleHeroByRouteName(route.name);

  return (
    <AccountDrawerLayout
      headerTitle={hero?.title ?? 'Admin'}
      headerTitleNumberOfLines={2}
      drawerMenuItems={drawerMenuItems}
    >
      {hero ? <AdminModuleHero title={hero.title} subtitle={hero.subtitle} /> : null}
      <View style={styles.optionsWrap}>
        {TICKET_SHOW_ADMIN_OPTIONS.map((item) => (
          <Pressable
            key={item.key}
            style={styles.optionCard}
            onPress={() => navigation.navigate(item.screen)}
            accessibilityRole="button"
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
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  optionsWrap: {
    gap: theme.spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
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
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.72,
    lineHeight: Math.round(theme.fontSize.sm * 1.4),
  },
  optionChevron: {
    fontSize: 22,
    color: theme.colors.linkGreen,
    fontWeight: '600',
  },
});
