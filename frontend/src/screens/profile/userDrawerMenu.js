import { theme } from '../../constants/theme';

const drawerTitleStyle = {
  fontSize: theme.fontSize.lg,
  lineHeight: Math.round(theme.fontSize.lg * 1.35),
};

/** Drawer entries for signed-in visitor screens using {@link AccountDrawerLayout}. */
export function buildUserDrawerMenuItems(navigation) {
  return [
    {
      key: 'explore-home',
      label: 'Explore',
      accessibilityLabel: 'Explore home',
      titleStyle: drawerTitleStyle,
      onPress: () => navigation.navigate('Profile'),
    },
    {
      key: 'my-profile',
      label: 'My Profile',
      accessibilityLabel: 'My profile',
      titleStyle: drawerTitleStyle,
      onPress: () => navigation.navigate('UserProfileDetails'),
    },
    {
      key: 'my-tickets',
      label: 'My Tickets',
      accessibilityLabel: 'My tickets',
      titleStyle: drawerTitleStyle,
      onPress: () => navigation.navigate('MyTickets'),
    },
    {
      key: 'my-event-bookings',
      label: 'My Event Bookings',
      accessibilityLabel: 'My event bookings',
      titleStyle: drawerTitleStyle,
      onPress: () => navigation.navigate('Events', { screen: 'MyBookings' }),
    },
    {
      key: 'my-orders',
      label: 'My Orders',
      accessibilityLabel: 'My orders',
      titleStyle: drawerTitleStyle,
      onPress: () => navigation.navigate('Store', { screen: 'MyOrders' }),
    },
    {
      key: 'my-group-requests',
      label: 'My Group Requests',
      accessibilityLabel: 'My group booking requests',
      titleStyle: drawerTitleStyle,
      onPress: () => navigation.navigate('MyGroupRequests'),
    },
  ];
}
