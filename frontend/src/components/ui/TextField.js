import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  error,
  editable = true,
  maxLength,
  ...props
}) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          props.multiline ? styles.inputMultiline : null,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9E9E9E"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        maxLength={maxLength}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: theme.spacing.md },
  label: {
    fontFamily: theme.fonts.bold,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
  },
  input: {
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.body,
    color: theme.colors.black,
  },
  inputError: { borderWidth: 1, borderColor: theme.colors.error },
  inputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  errorText: {
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
});
