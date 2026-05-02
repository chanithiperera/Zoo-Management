import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { validateRegisterForm } from '../../utils/validation';
import { theme } from '../../constants/theme';
import { describeAuthRequestError } from '../../utils/describeAuthRequestError';
import StatusModal from '../../components/ui/StatusModal';


export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState({ visible: false, type: 'error', title: '', message: '' });


  const onSubmit = async () => {
    const v = validateRegisterForm({ fullName, email, phone, password, confirmPassword });
    setErrors(v);
    if (Object.keys(v).length) return;

    setSubmitting(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      // RootNavigator switches to AppStack (dashboard) — user + token saved like login.
    } catch (err) {
      const { title, message } = describeAuthRequestError(err, 'Registration failed');
      const extra = err.response?.data?.errors;
      const detail = Array.isArray(extra) ? extra.map((e) => e.msg).join('\n') : '';
      setModalConfig({
        visible: true,
        type: 'error',
        title: title,
        message: detail ? `${message}\n${detail}` : message
      });

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <Text style={styles.title}>Create an account</Text>
      <Text style={styles.sub}>Join the zoo community with your details below.</Text>

      <TextField
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Jane Doe"
        autoCapitalize="words"
        error={errors.fullName}
      />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        error={errors.email}
      />
      <TextField
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        placeholder="Up to 10 digits"
        keyboardType="phone-pad"
        error={errors.phone}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 6 characters"
        secureTextEntry
        error={errors.password}
      />
      <TextField
        label="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Repeat password"
        secureTextEntry
        error={errors.confirmPassword}
      />

      <PrimaryButton title="Sign up" onPress={onSubmit} loading={submitting} style={styles.btn} />

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkWrap}>
        <Text style={styles.linkMuted}>Already have an account? </Text>
        <Text style={styles.linkBold}>Sign in</Text>
      </TouchableOpacity>

      <StatusModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalConfig({ ...modalConfig, visible: false })}
      />
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
  sub: { marginTop: theme.spacing.sm, marginBottom: theme.spacing.md, color: theme.colors.primaryText, opacity: 0.85 },
  btn: { marginTop: theme.spacing.md },
  linkWrap: { flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.lg, flexWrap: 'wrap' },
  linkMuted: { color: theme.colors.black, fontSize: theme.fontSize.body },
  linkBold: { color: theme.colors.linkGreen, fontWeight: '700', fontSize: theme.fontSize.body },
});
