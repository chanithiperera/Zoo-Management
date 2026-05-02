import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { validateLoginForm } from '../../utils/validation';
import { theme } from '../../constants/theme';
import { describeAuthRequestError } from '../../utils/describeAuthRequestError';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const onSubmit = async () => {
    const v = validateLoginForm({ email, password });
    setErrors(v);
    setSubmitError('');
    if (Object.keys(v).length) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const { title, message } = describeAuthRequestError(err, 'Login failed');
      setSubmitError(message);
      Alert.alert(title, message);
      if (__DEV__) {
        console.warn('Login error', err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.sub}>Sign in with your email and password.</Text>

      <TextField
        label="Email"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setSubmitError('');
        }}
        placeholder="you@example.com"
        keyboardType="email-address"
        error={errors.email}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        error={errors.password}
      />

      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

      <PrimaryButton title="Sign in" onPress={onSubmit} loading={submitting} style={styles.btn} />

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
        <Text style={styles.linkMuted}>Don&apos;t have an account? </Text>
        <Text style={styles.linkBold}>Register now</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.fontSize.hero,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginTop: theme.spacing.sm,
  },
  sub: { marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg, color: theme.colors.primaryText, opacity: 0.85 },
  submitError: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    lineHeight: 20,
  },
  btn: { marginTop: theme.spacing.md },
  linkWrap: { flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.lg, flexWrap: 'wrap' },
  linkMuted: { color: theme.colors.black, fontSize: theme.fontSize.body },
  linkBold: { color: theme.colors.linkGreen, fontWeight: '700', fontSize: theme.fontSize.body },
});
