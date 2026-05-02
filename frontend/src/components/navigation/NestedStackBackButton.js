import React from 'react';
import { Pressable, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { popOrParentGoBack } from '../../utils/popOrParentGoBack';

/**
 * Header back control for nested stacks (Store, etc.): pops inner stack first, then parent app stack.
 */
export default function NestedStackBackButton({ navigation, tintColor = theme.colors.primaryText }) {
  const parent = navigation?.getParent?.();
  const visible =
    navigation &&
    ((typeof navigation.canGoBack === 'function' && navigation.canGoBack()) ||
      (parent && typeof parent.canGoBack === 'function' && parent.canGoBack()));

  if (!visible) return null;

  return (
    <Pressable
      onPress={() => popOrParentGoBack(navigation)}
      style={styles.hit}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Ionicons name="chevron-back" size={26} color={tintColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    marginLeft: Platform.OS === 'ios' ? 4 : 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
  },
});
