import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  ScrollView,
  TextInput,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../ui/ScreenContainer';
import PrimaryButton from '../ui/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../constants/theme';
import { validatePassword, validateProfileFields } from '../../utils/validation';

function avatarLetter(fullName) {
  const c = fullName?.trim()?.[0];
  return c ? c.toUpperCase() : '?';
}

function AccountField({
  label,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
  textContentType,
  autoComplete,
}) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={fieldStyles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        textContentType={textContentType}
        autoComplete={autoComplete}
        placeholderTextColor={`${theme.colors.primaryText}99`}
      />
    </View>
  );
}

/**
 * Shared shell: Explore-style header + scroll body + slide-over account drawer (edit profile, change password, logout).
 *
 * @param {{ key: string; label: string; onPress: () => void; accessibilityLabel?: string; subtitle?: string; emoji?: string; titleStyle?: object }[]} [drawerMenuItems]
 *        Optional entries shown at the top of the drawer (e.g. admin shortcuts), above account actions.
 */
export default function AccountDrawerLayout({ children, headerTitle = 'Explore', drawerMenuItems }) {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const drawerWidth = Math.min(320, windowWidth * 0.85);
  const closedX = -drawerWidth;

  const slideX = useRef(new Animated.Value(closedX)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountEditing, setAccountEditing] = useState(false);
  const [draftFullName, setDraftFullName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [draftPhone, setDraftPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [passwordEditing, setPasswordEditing] = useState(false);
  const [draftCurrentPassword, setDraftCurrentPassword] = useState('');
  const [draftNewPassword, setDraftNewPassword] = useState('');
  const [draftConfirmPassword, setDraftConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const drawerWidthRef = useRef(drawerWidth);

  useEffect(() => {
    if (drawerWidthRef.current !== drawerWidth && !drawerOpen) {
      slideX.setValue(-drawerWidth);
    }
    drawerWidthRef.current = drawerWidth;
  }, [drawerWidth, drawerOpen, slideX]);

  const animateTo = useCallback(
    (open, onEnd) => {
      const done = onEnd;
      Animated.parallel([
        Animated.timing(slideX, {
          toValue: open ? 0 : -drawerWidth,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: open ? 1 : 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && done) done();
      });
    },
    [backdropOpacity, drawerWidth, slideX]
  );

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    animateTo(true);
  }, [animateTo]);

  const closeDrawer = useCallback(() => {
    animateTo(false, () => setDrawerOpen(false));
  }, [animateTo]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closeDrawer();
      return true;
    });
    return () => sub.remove();
  }, [drawerOpen, closeDrawer]);

  useEffect(() => {
    if (!drawerOpen) {
      setAccountEditing(false);
      setPasswordEditing(false);
      setSaveError(null);
      setPasswordError(null);
      setDraftCurrentPassword('');
      setDraftNewPassword('');
      setDraftConfirmPassword('');
    }
  }, [drawerOpen]);

  const openAccountEdit = useCallback(() => {
    setPasswordEditing(false);
    setPasswordError(null);
    setDraftFullName(user?.fullName ?? '');
    setDraftEmail(user?.email ?? '');
    setDraftPhone(user?.phone ?? '');
    setSaveError(null);
    setAccountEditing(true);
  }, [user]);

  const openPasswordChange = useCallback(() => {
    setAccountEditing(false);
    setSaveError(null);
    setPasswordError(null);
    setDraftCurrentPassword('');
    setDraftNewPassword('');
    setDraftConfirmPassword('');
    setPasswordEditing(true);
  }, []);

  const handleSavePassword = useCallback(async () => {
    setPasswordError(null);
    const pwErr = validatePassword(draftNewPassword);
    if (pwErr) {
      setPasswordError(pwErr.replace(/^Password/, 'New password'));
      return;
    }
    if (draftNewPassword !== draftConfirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: draftCurrentPassword,
        newPassword: draftNewPassword,
      });
      setPasswordEditing(false);
      setDraftCurrentPassword('');
      setDraftNewPassword('');
      setDraftConfirmPassword('');
    } catch (e) {
      const data = e?.response?.data;
      const msg =
        data?.message ||
        (Array.isArray(data?.errors) && data.errors.map((err) => err.msg).filter(Boolean).join(', ')) ||
        e?.message ||
        'Could not update password';
      setPasswordError(msg);
    } finally {
      setSavingPassword(false);
    }
  }, [changePassword, draftConfirmPassword, draftCurrentPassword, draftNewPassword]);

  const handleSaveProfile = useCallback(async () => {
    setSaveError(null);
    const fieldErrors = validateProfileFields({
      fullName: draftFullName,
      email: draftEmail,
      phone: draftPhone,
    });
    const msgs = Object.values(fieldErrors).filter(Boolean);
    if (msgs.length > 0) {
      setSaveError(msgs.join(' '));
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({
        fullName: draftFullName.trim(),
        email: draftEmail.trim(),
        phone: draftPhone.trim(),
      });
      setAccountEditing(false);
    } catch (e) {
      const data = e?.response?.data;
      const msg =
        data?.message ||
        (Array.isArray(data?.errors) && data.errors.map((err) => err.msg).filter(Boolean).join(', ')) ||
        e?.message ||
        'Could not save changes';
      setSaveError(msg);
    } finally {
      setSavingProfile(false);
    }
  }, [draftEmail, draftFullName, draftPhone, updateProfile]);

  const handleLogout = async () => {
    await logout();
  };

  const handleDrawerMenuItemPress = useCallback(
    (fn) => {
      closeDrawer();
      fn();
    },
    [closeDrawer]
  );

  const horizontalPad = theme.spacing.md;

  return (
    <ScreenContainer scroll={false} backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.root}>
        <View style={[styles.header, { paddingHorizontal: horizontalPad }]}>
          <Pressable
            onPress={openDrawer}
            style={styles.menuBtn}
            accessibilityRole="button"
            accessibilityLabel="Open account menu"
          >
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
            <View style={styles.menuBar} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerTitle}
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPad }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        <View
          style={[styles.overlay, { left: -horizontalPad, right: -horizontalPad }]}
          pointerEvents={drawerOpen ? 'box-none' : 'none'}
        >
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.45],
                }),
              },
            ]}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={closeDrawer}
              accessibilityRole="button"
              accessibilityLabel="Close account menu"
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.drawer,
              {
                width: drawerWidth,
                paddingTop: insets.top + theme.spacing.md,
                paddingBottom: insets.bottom + theme.spacing.md,
                transform: [{ translateX: slideX }],
              },
            ]}
            accessibilityViewIsModal
          >
            <ScrollView
              style={styles.drawerScroll}
              contentContainerStyle={styles.drawerScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.drawerIdentity}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{avatarLetter(user?.fullName)}</Text>
                </View>
                <View style={styles.drawerIdentityText}>
                  <Text style={styles.heroGreet}>Signed in as</Text>
                  <Text style={styles.heroName} numberOfLines={1}>
                    {user?.fullName || 'Visitor'}
                  </Text>
                  {user?.email ? (
                    <Text style={styles.heroEmail} numberOfLines={2}>
                      {user.email}
                    </Text>
                  ) : null}
                </View>
              </View>

              {drawerMenuItems?.length ? (
                <View style={styles.drawerMenuBlock}>
                  {drawerMenuItems.map((item) => (
                    <Pressable
                      key={item.key}
                      onPress={() => handleDrawerMenuItemPress(item.onPress)}
                      style={({ pressed }) => [styles.drawerNavCard, pressed && styles.drawerNavCardPressed]}
                      accessibilityRole="button"
                      accessibilityLabel={item.accessibilityLabel ?? item.label}
                    >
                      {item.emoji ? (
                        <View style={styles.drawerNavEmojiWrap}>
                          <Text style={styles.drawerNavEmoji} accessible={false}>
                            {item.emoji}
                          </Text>
                        </View>
                      ) : null}
                      <View style={[styles.drawerNavTextCol, !item.emoji && styles.drawerNavTextColFill]}>
                        <Text style={[styles.drawerNavTitle, item.titleStyle]}>{item.label}</Text>
                        {item.subtitle ? (
                          <Text style={styles.drawerNavSubtitle} numberOfLines={2}>
                            {item.subtitle}
                          </Text>
                        ) : null}
                      </View>
                      <Text style={styles.drawerNavChevron} accessible={false}>
                        ›
                      </Text>
                    </Pressable>
                  ))}
                  <View style={styles.drawerMenuDivider} />
                </View>
              ) : null}

              {!accountEditing && !passwordEditing ? (
                <>
                  <Pressable
                    onPress={openAccountEdit}
                    style={styles.editAccountBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Edit account details"
                  >
                    <Text style={styles.editAccountText}>Edit account</Text>
                  </Pressable>
                  <Pressable
                    onPress={openPasswordChange}
                    style={styles.editAccountBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Change password"
                  >
                    <Text style={styles.editAccountText}>Change password</Text>
                  </Pressable>
                </>
              ) : null}
              {accountEditing ? (
                <>
                  <Text style={styles.sectionTitle}>Account</Text>
                  <View style={styles.card}>
                  <AccountField
                    label="Name"
                    value={draftFullName}
                    onChangeText={setDraftFullName}
                    autoCapitalize="words"
                  />
                  <AccountField
                    label="Email"
                    value={draftEmail}
                    onChangeText={setDraftEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <AccountField
                    label="Phone"
                    value={draftPhone}
                    onChangeText={setDraftPhone}
                    keyboardType="phone-pad"
                  />
                  {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
                  <PrimaryButton
                    title="Save changes"
                    onPress={handleSaveProfile}
                    loading={savingProfile}
                    style={styles.saveBtn}
                  />
                  <PrimaryButton
                    title="Cancel"
                    variant="secondary"
                    onPress={() => setAccountEditing(false)}
                    disabled={savingProfile}
                  />
                </View>
                </>
              ) : null}
              {passwordEditing ? (
                <>
                  <Text style={styles.sectionTitle}>Change password</Text>
                  <View style={styles.card}>
                  <AccountField
                    label="Current password"
                    value={draftCurrentPassword}
                    onChangeText={setDraftCurrentPassword}
                    secureTextEntry
                    textContentType="password"
                    autoComplete="current-password"
                  />
                  <AccountField
                    label="New password"
                    value={draftNewPassword}
                    onChangeText={setDraftNewPassword}
                    secureTextEntry
                    textContentType="newPassword"
                    autoComplete="new-password"
                  />
                  <AccountField
                    label="Confirm new password"
                    value={draftConfirmPassword}
                    onChangeText={setDraftConfirmPassword}
                    secureTextEntry
                    textContentType="newPassword"
                    autoComplete="new-password"
                  />
                  {passwordError ? <Text style={styles.saveError}>{passwordError}</Text> : null}
                  <PrimaryButton
                    title="Update password"
                    onPress={handleSavePassword}
                    loading={savingPassword}
                    style={styles.saveBtn}
                  />
                  <PrimaryButton
                    title="Cancel"
                    variant="secondary"
                    onPress={() => setPasswordEditing(false)}
                    disabled={savingPassword}
                  />
                </View>
                </>
              ) : null}

              <PrimaryButton title="Log out" variant="secondary" onPress={handleLogout} style={styles.btn} />
            </ScrollView>
          </Animated.View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: theme.spacing.md },
  label: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.primaryText },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 10,
    fontSize: theme.fontSize.body,
    color: theme.colors.black,
    backgroundColor: theme.colors.white,
  },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  menuBtn: {
    paddingVertical: theme.spacing.sm,
    paddingRight: theme.spacing.md,
    justifyContent: 'center',
    gap: 5,
  },
  menuBar: {
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.primaryText,
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
    flexGrow: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  drawerScroll: { flex: 1 },
  drawerScrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.md,
  },
  drawerMenuBlock: {
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  drawerNavCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  drawerNavCardPressed: {
    opacity: 0.92,
    backgroundColor: theme.colors.sageButton,
  },
  drawerNavEmojiWrap: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  drawerNavEmoji: {
    fontSize: 26,
  },
  drawerNavTextCol: {
    flex: 1,
    minWidth: 0,
  },
  drawerNavTextColFill: {
    marginRight: theme.spacing.sm,
  },
  drawerNavTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  drawerNavSubtitle: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.72,
    lineHeight: theme.fontSize.sm * 1.35,
  },
  drawerNavChevron: {
    fontSize: 28,
    lineHeight: 28,
    fontWeight: '300',
    color: theme.colors.accentGreen,
    marginLeft: theme.spacing.sm,
  },
  drawerMenuDivider: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  editAccountBtn: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  editAccountText: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    textDecorationLine: 'underline',
  },
  saveError: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
  },
  saveBtn: { marginBottom: theme.spacing.sm },
  drawerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  drawerIdentityText: {
    flex: 1,
    marginLeft: theme.spacing.md,
    minWidth: 0,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 22,
    fontWeight: '700',
  },
  heroGreet: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
  },
  heroName: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginTop: 2,
  },
  heroEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.6,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  btn: { marginTop: theme.spacing.sm },
});
