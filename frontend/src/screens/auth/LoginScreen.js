import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { validateLoginForm } from '../../utils/validation';
import { theme } from '../../constants/theme';
<<<<<<< HEAD
=======
import { describeAuthRequestError } from '../../utils/describeAuthRequestError';
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
<<<<<<< HEAD
=======
  const [submitError, setSubmitError] = useState('');
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08

  const onSubmit = async () => {
    const v = validateLoginForm({ email, password });
    setErrors(v);
<<<<<<< HEAD
=======
    setSubmitError('');
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08
    if (Object.keys(v).length) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
<<<<<<< HEAD
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
=======
      const { title, message } = describeAuthRequestError(err, 'Login failed');
      setSubmitError(message);
      Alert.alert(title, message);
      if (__DEV__) {
        console.warn('Login error', err);
      }
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08
    } finally {
      setSubmitting(false);
    }
  };

  return (
<<<<<<< HEAD
    <ScreenContainer backgroundColor="#E8F5E9">
      <View style={styles.header}>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.sub}>Welcome back! Please enter your details.</Text>
      </View>

      <TextField
        label="Email address"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
=======
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
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08
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

<<<<<<< HEAD
      <PrimaryButton title="Sign in" onPress={onSubmit} loading={submitting} style={styles.btn} />

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
        <Text style={styles.linkMuted}>Don't have an account? </Text>
=======
      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

      <PrimaryButton title="Sign in" onPress={onSubmit} loading={submitting} style={styles.btn} />

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
        <Text style={styles.linkMuted}>Don&apos;t have an account? </Text>
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08
        <Text style={styles.linkBold}>Register now</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  header: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
=======
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08
  title: {
    fontSize: theme.fontSize.hero,
    fontWeight: '700',
    color: theme.colors.primaryText,
<<<<<<< HEAD
  },
  sub: {
    marginTop: theme.spacing.sm,
    color: theme.colors.primaryText,
    opacity: 0.85,
  },
  btn: {
    marginTop: theme.spacing.md,
  },
  linkWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    flexWrap: 'wrap',
  },
  linkMuted: {
    color: theme.colors.black,
    fontSize: theme.fontSize.body,
  },
  linkBold: {
    color: theme.colors.linkGreen,
    fontWeight: '700',
    fontSize: theme.fontSize.body,
  },
=======
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
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08
});
