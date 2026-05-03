import React from 'react';
import PlaceholderScreen from '../shared/PlaceholderScreen';
import { GUEST_SIGN_IN_BODY } from '../../constants/guestCopy';

export default function StorePlaceholder() {
  return (
    <PlaceholderScreen
      emoji="🛍️"
      title="Online Store"
      body={GUEST_SIGN_IN_BODY}
    />
  );
}
