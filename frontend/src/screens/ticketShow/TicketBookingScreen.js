import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { theme } from '../../constants/theme';

const TICKET_BOOKING_HERO = require('../../../assets/images/ticket-booking-admit.png');

/** Placeholder route for the future booking form. */
export default function TicketBookingScreen() {
  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.inner}>
        <Image
          source={TICKET_BOOKING_HERO}
          style={styles.hero}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Zentra Zoo admission ticket illustration"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inner: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xs,
  },
  hero: {
    width: '100%',
    height: 200,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    shadowColor: '#0D2D1D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
});
