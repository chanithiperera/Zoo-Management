import React from 'react';
import PlaceholderScreen from '../shared/PlaceholderScreen';
import { GUEST_SIGN_IN_BODY } from '../../constants/guestCopy';

export default function EncountersPlaceholder() {
  return (
    <PlaceholderScreen
      emoji="📸"
      title="Animal Encounter and Photography"
      body={GUEST_SIGN_IN_BODY}
    />
  );
}
