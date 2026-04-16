import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { theme } from '../../constants/theme';

/** Wide zoo entrance banner; file lives at `frontend/assets/images/ticket-zoo-hero.png`. */
const TICKET_HERO = require('../../../assets/images/ticket-zoo-hero.png');

export default function TicketShowPlaceholder() {
  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.inner}>
        <Image
          source={TICKET_HERO}
          style={styles.hero}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel="Zoo entrance illustration"
        />
        <Text style={styles.title}>Entry Tickets and Show Booking</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inner: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  hero: {
    width: '100%',
    height: 176,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  body: {
    fontSize: theme.fontSize.body,
    lineHeight: Math.round(theme.fontSize.body * 1.45),
    color: theme.colors.primaryText,
    opacity: 0.88,
    textAlign: 'center',
  },
});
