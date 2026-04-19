import React from 'react';
import PlaceholderScreen from '../shared/PlaceholderScreen';

const SHOW_SELECTION_HERO = require('../../../assets/images/ticket-show-selection-hero.png');

/** Show selection and add-on flow — implemented in a later pass. */
export default function TicketShowSelectionScreen() {
  return (
    <PlaceholderScreen
      title="Select shows"
      body="Pick add-on animal shows and seats in a future update."
      imageSource={SHOW_SELECTION_HERO}
      imageAccessibilityLabel="Large outdoor show arena with tiered seating and performance lawn"
    />
  );
}
