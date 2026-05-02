<<<<<<< HEAD
=======
<<<<<<< HEAD
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
}) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9E9E9E"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        maxLength={maxLength}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: theme.spacing.md },
  label: {
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.body,
    color: theme.colors.black,
  },
  inputError: { borderWidth: 1, borderColor: theme.colors.error },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
});
=======
>>>>>>> 0f8639197f93fefd9284caf0561929e9c2425035
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
<<<<<<< HEAD
  ...props
=======
>>>>>>> 0f8639197f93fefd9284caf0561929e9c2425035
}) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
<<<<<<< HEAD
        style={[
          styles.input,
          error ? styles.inputError : null,
          props.multiline ? styles.inputMultiline : null,
        ]}
=======
        style={[styles.input, error ? styles.inputError : null]}
>>>>>>> 0f8639197f93fefd9284caf0561929e9c2425035
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9E9E9E"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
<<<<<<< HEAD
        {...props}
=======
>>>>>>> 0f8639197f93fefd9284caf0561929e9c2425035
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: theme.spacing.md },
  label: {
<<<<<<< HEAD
    fontFamily: theme.fonts.bold,
=======
    fontWeight: '700',
>>>>>>> 0f8639197f93fefd9284caf0561929e9c2425035
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
  },
  input: {
<<<<<<< HEAD
    fontFamily: theme.fonts.regular,
=======
>>>>>>> 0f8639197f93fefd9284caf0561929e9c2425035
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.body,
    color: theme.colors.black,
  },
  inputError: { borderWidth: 1, borderColor: theme.colors.error },
<<<<<<< HEAD
  inputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  errorText: {
    fontFamily: theme.fonts.regular,
=======
  errorText: {
>>>>>>> 0f8639197f93fefd9284caf0561929e9c2425035
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
});
<<<<<<< HEAD
=======
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08
>>>>>>> 0f8639197f93fefd9284caf0561929e9c2425035
