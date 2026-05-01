import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../constants/theme';

export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  /** Override label color (e.g. dark green on yellow CTA) */
  textColor,
  /** Merged after default label styles (e.g. fontFamily on one screen) */
  textStyle,
}) {
  const isPrimary = variant === 'primary';
  const labelColor = textColor ?? (isPrimary ? theme.colors.black : theme.colors.primaryText);
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        isPrimary ? styles.primary : styles.secondary,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <Text style={[styles.text, textStyle, { color: labelColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: theme.radii.pill,
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primary: {
    backgroundColor: theme.colors.yellowAlt,
  },
  secondary: {
    backgroundColor: theme.colors.sageButton,
  },
  disabled: { opacity: 0.65 },
  text: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
});
