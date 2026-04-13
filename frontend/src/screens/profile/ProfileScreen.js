import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  ScrollView,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import ModuleCard from '../../components/ui/ModuleCard';
import { FEATURE_MODULES } from '../../constants/modules';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../constants/theme';

function avatarLetter(fullName) {
  const c = fullName?.trim()?.[0];
  return c ? c.toUpperCase() : '?';
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const drawerWidth = Math.min(320, windowWidth * 0.85);
  const closedX = -drawerWidth;

  const slideX = useRef(new Animated.Value(closedX)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const firstName = useMemo(() => {
    const parts = user?.fullName?.trim().split(/\s+/).filter(Boolean);
    return parts?.[0] || 'there';
  }, [user?.fullName]);

  const handleLogout = async () => {
    await logout();
  };

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
            Explore
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: horizontalPad },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.adventureHeading}>
            <Text style={styles.adventureLeaf} accessible={false} importantForAccessibility="no">
              🌿
            </Text>
            <Text style={styles.adventureTitle}>
              {firstName}, Start your adventure here
            </Text>
          </View>

          <View>
            {FEATURE_MODULES.map((m) => (
              <View key={m.route} style={styles.moduleRow}>
                <ModuleCard
                  title={m.title}
                  description={m.description}
                  emoji={m.emoji}
                  image={m.image}
                  onPress={() => navigation.navigate(m.route)}
                />
              </View>
            ))}
          </View>
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

            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <Row label="Name" value={user?.fullName} />
              <Row label="Email" value={user?.email} />
              <Row label="Phone" value={user?.phone} />
            </View>

            <PrimaryButton title="Log out" variant="secondary" onPress={handleLogout} style={styles.btn} />
          </Animated.View>
        </View>
      </View>
    </ScreenContainer>
  );
}

function Row({ label, value }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value ?? '—'}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { marginBottom: theme.spacing.md },
  label: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.primaryText },
  value: { marginTop: 4, fontSize: theme.fontSize.body, color: theme.colors.black },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
  scroll: {
    flex: 1,
  },
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
  adventureHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  adventureLeaf: {
    fontSize: 28,
    lineHeight: 32,
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  adventureTitle: {
    flex: 1,
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
    lineHeight: theme.fontSize.title * 1.25,
  },
  moduleRow: {
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  btn: { marginTop: theme.spacing.sm },
});
