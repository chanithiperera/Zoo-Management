import { theme } from '../../constants/theme';

const drawerTitleStyle = {
  fontSize: theme.fontSize.lg,
  lineHeight: Math.round(theme.fontSize.lg * 1.35),
};

/** @typedef {{ key: string; title: string; screen: string; heroSubtitle: string; a11yCard: string; a11yDrawer: string }} AdminNavModule */

/** @type {AdminNavModule[]} */
const ADMIN_MODULES = [
  {
    key: 'user-management',
    title: 'User Management',
    screen: 'UserManagement',
    heroSubtitle: 'Manage visitor and admin accounts.',
    a11yCard: 'User management',
    a11yDrawer: 'User management: view and edit accounts',
  },
  {
    key: 'entry-tickets-show-booking-management',
    title: 'Entry Tickets & Show Booking Management',
    screen: 'AdminEntryTicketsShowBooking',
    heroSubtitle: 'Configure entry tickets, shows, and visitor bookings.',
    a11yCard: 'Entry tickets and show booking management',
    a11yDrawer: 'Entry tickets and show booking management',
  },
  {
    key: 'event-management',
    title: 'Event Management',
    screen: 'AdminEventManagement',
    heroSubtitle: 'Plan zoo events, schedules, and announcements.',
    a11yCard: 'Event management',
    a11yDrawer: 'Event management',
  },
  {
    key: 'animal-encounter-photography-management',
    title: 'Animal Encounter & Photography Management',
    screen: 'AdminAnimalEncounterPhotography',
    heroSubtitle: 'Coordinate encounters, sessions, and photography bookings.',
    a11yCard: 'Animal encounter and photography management',
    a11yDrawer: 'Animal encounter and photography management',
  },
  {
    key: 'animal-information-education-management',
    title: 'Animal Information & Education Management',
    screen: 'AdminAnimalInformationEducation',
    heroSubtitle: 'Curate species profiles and educational content.',
    a11yCard: 'Animal information and education management',
    a11yDrawer: 'Animal information and education management',
  },
  {
    key: 'online-store-management',
    title: 'Online Store Management',
    screen: 'AdminOnlineStore',
    heroSubtitle: 'Manage catalog items, orders, and store settings.',
    a11yCard: 'Online store management',
    a11yDrawer: 'Online store management',
  },
  {
    key: 'feedback-inquiery-review-management',
    title: 'Feedback, Inquiery & Review Management',
    screen: 'AdminFeedbackInquiryReview',
    heroSubtitle: 'Review visitor feedback, inquiries, and ratings.',
    a11yCard: 'Feedback inquiery and review management',
    a11yDrawer: 'Feedback inquiery and review management',
  },
];

/**
 * Title + subtitle for the module hero card (matches User Management styling).
 * @param {string} routeName — e.g. `UserManagement`, `AdminEventManagement`
 * @returns {{ title: string; subtitle: string } | null}
 */
export function getAdminModuleHeroByRouteName(routeName) {
  const m = ADMIN_MODULES.find((x) => x.screen === routeName);
  if (!m) return null;
  return { title: m.title, subtitle: m.heroSubtitle };
}

/**
 * Cards shown on the admin home workspace (module shortcuts).
 * @param {import('@react-navigation/native').NavigationProp<any>} navigation
 */
export function getAdminModuleCards(navigation) {
  return ADMIN_MODULES.map((m) => ({
    key: m.key,
    title: m.title,
    onPress: () => navigation.navigate(m.screen),
    accessibilityLabel: m.a11yCard,
  }));
}

/**
 * Shared drawer entries for admin screens using {@link AccountDrawerLayout}.
 * @param {import('@react-navigation/native').NavigationProp<any>} navigation
 */
export function getAdminDrawerMenuItems(navigation) {
  return [
    {
      key: 'my-profile',
      label: 'My Profile',
      accessibilityLabel: 'My profile: workspace home',
      titleStyle: drawerTitleStyle,
      onPress: () => navigation.navigate('AdminHome'),
    },
    ...ADMIN_MODULES.map((m) => ({
      key: m.key,
      label: m.title,
      accessibilityLabel: m.a11yDrawer,
      titleStyle: drawerTitleStyle,
      onPress: () => navigation.navigate(m.screen),
    })),
  ];
}
