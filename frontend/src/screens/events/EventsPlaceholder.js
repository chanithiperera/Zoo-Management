import React from 'react';
import PlaceholderScreen from '../shared/PlaceholderScreen';
import { GUEST_SIGN_IN_BODY } from '../../constants/guestCopy';

export default function EventsPlaceholder() {
  return (
    <PlaceholderScreen
      emoji="📅"
      title="Event Booking"
      body={GUEST_SIGN_IN_BODY}
    />
  );
}
