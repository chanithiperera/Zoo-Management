import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import AdminModuleHero from '../../components/admin/AdminModuleHero';
import { theme } from '../../constants/theme';
import { getAdminDrawerMenuItems, getAdminModuleHeroByRouteName } from './adminNavigation';

export default function EncounterPhotographyDashboard({ navigation }) {
  const route = useRoute();
  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);
  const hero = useMemo(() => getAdminModuleHeroByRouteName(route.name), [route.name]);

  const menuItems = [
    {
      title: 'Photographer Management',
      subtitle: 'Add, edit or remove photographers',
      screen: 'PhotographerManagement',
      a11y: 'Photographer management: add, edit or remove photographers',
    },
    {
      title: 'Time Slot Management',
      subtitle: 'Create and assign slots for sessions',
      screen: 'TimeSlotManagement',
      a11y: 'Time slot management: create and assign session slots',
    },
    {
      title: 'Booking Management',
      subtitle: 'View, approve or reject bookings',
      screen: 'PhotographyBookingManagement',
      a11y: 'Booking management: view, approve or reject bookings',
    },
    {
      title: 'Photo Uploads',
      subtitle: 'Upload photos for completed sessions',
      screen: 'PhotoUpload',
      a11y: 'Photo uploads for completed sessions',
    },
    {
      title: 'Animal Management',
      subtitle: 'Manage animals and their photos',
      screen: 'AnimalManagement',
      a11y: 'Animal management: manage animals and their photos',
    },
  ];

  return (
    <AccountDrawerLayout
      headerTitle={hero?.title ?? 'Encounter & photography'}
      headerTitleNumberOfLines={2}
      drawerMenuItems={drawerMenuItems}
    >
      {hero ? <AdminModuleHero title={hero.title} subtitle={hero.subtitle} /> : null}
      <View style={styles.list}>
        {menuItems.map((item) => (
          <Pressable
            key={item.screen}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => navigation.navigate(item.screen)}
            accessibilityRole="button"
            accessibilityLabel={item.a11y}
          >
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowSub}>{item.subtitle}</Text>
            </View>
            <Text style={styles.chevron} accessible={false}>
              ›
            </Text>
          </Pressable>
        ))}
      </View>
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: theme.spacing.sm,
  },
  row: {
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
  rowPressed: {
    opacity: 0.92,
  },
  rowText: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  rowTitle: {
    fontFamily: theme.fonts.bold,
    fontWeight: '700',
    fontSize: theme.fontSize.body,
    color: theme.colors.linkGreen,
  },
  rowSub: {
    marginTop: 4,
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
    fontSize: theme.fontSize.sm,
    color: theme.colors.accentGreen,
    lineHeight: Math.round(theme.fontSize.sm * 1.4),
  },
  chevron: {
    fontSize: 22,
    color: theme.colors.linkGreen,
    fontWeight: '600',
  },
});
