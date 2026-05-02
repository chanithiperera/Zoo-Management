import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PlaceholderScreen from '../shared/PlaceholderScreen';
import { GUEST_SIGN_IN_BODY } from '../../constants/guestCopy';
import { theme } from '../../constants/theme';

export default function EncountersPlaceholder() {
  return (
    <PlaceholderScreen
      leadContent={
        <View style={{ alignItems: 'center' }}>
          <Ionicons
            name="camera-outline"
            size={48}
            color={theme.colors.linkGreen}
            accessibilityLabel="Encounters and photography"
          />
        </View>
      }
      title="Animal Encounter and Photography"
      body={GUEST_SIGN_IN_BODY}
    />
  );
}
