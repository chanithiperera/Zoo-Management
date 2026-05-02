import React from 'react';
import PlaceholderScreen from '../shared/PlaceholderScreen';
import { GUEST_SIGN_IN_BODY } from '../../constants/guestCopy';

export default function AnimalsPlaceholder() {
  return (
    <PlaceholderScreen
      emoji="🐾"
      title="Animal Information and Education"
      body={GUEST_SIGN_IN_BODY}
    />
  );
}
