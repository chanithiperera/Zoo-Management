import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PlaceholderScreen from '../shared/PlaceholderScreen';
import { GUEST_SIGN_IN_BODY } from '../../constants/guestCopy';
import { theme } from '../../constants/theme';

export default function EventsPlaceholder() {
  return (
    <PlaceholderScreen
      leadContent={
        <View style={styles.iconWrap}>
          <Ionicons name="calendar" size={36} color={theme.colors.linkGreen} />
        </View>
      }
      title="Event Booking"
      body={GUEST_SIGN_IN_BODY}
    />
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.welcomeBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
});
