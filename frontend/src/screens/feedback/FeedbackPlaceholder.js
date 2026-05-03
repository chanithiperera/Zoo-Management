import React from 'react';
import PlaceholderScreen from '../shared/PlaceholderScreen';
import { GUEST_SIGN_IN_BODY } from '../../constants/guestCopy';

export default function FeedbackPlaceholder() {
  return (
    <PlaceholderScreen title="Submit Feedbacks, Inquiries or Reviews" body={GUEST_SIGN_IN_BODY} />
  );
}
