import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { theme } from '../../constants/theme';

const JUNGLE_BG = require('../../../assets/home-jungle-portrait-bg.png');

// Keep a fixed source aspect ratio to avoid web runtime issues with resolveAssetSource.
const NATURAL_W = 1080;
const NATURAL_H = 1920;

const legibleShadow = {
  textShadowColor: 'rgba(0, 0, 0, 0.65)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 10,
};

/** Heavier silhouette so single-weight display font reads bolder (custom TTF has no separate bold file). */
const displayBoldShadow = {
  textShadowColor: 'rgba(0, 0, 0, 0.72)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 8,
};

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [pane, setPane] = useState({ w: 0, h: 0 });

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, [])
  );

  const bgImageLayout = useMemo(() => {
    if (pane.w <= 0 || pane.h <= 0) return null;
    const scale = pane.w / NATURAL_W;
    const displayH = NATURAL_H * scale;
    return {
      position: 'absolute',
      left: 0,
      top: Math.round((pane.h - displayH) / 2),
      width: pane.w,
      height: Math.round(displayH),
    };
  }, [pane.w, pane.h]);

  return (
    <ScreenContainer
      scroll={false}
      backgroundColor="#0A1612"
      contentStyle={styles.screenFill}
    >
      <View style={styles.outer}>
        <View
          style={styles.imagePane}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setPane({ w: width, h: height });
          }}
        >
          {bgImageLayout != null && (
            <Image
              source={JUNGLE_BG}
              style={bgImageLayout}
              resizeMode="cover"
              accessibilityRole="image"
              accessibilityLabel="Jungle wildlife background"
              {...(Platform.OS === 'android' ? { resizeMethod: 'scale' } : {})}
            />
          )}

          <View style={styles.imagePaneContent} pointerEvents="box-none">
            <View style={styles.top}>
              <View style={styles.topPadded}>
                <View style={styles.brandBlock}>
                  <Text style={styles.brandTag}>Welcome to</Text>
                  <Text style={styles.brand} accessibilityRole="header">
                    <Text style={styles.brandZentra}>Zentra</Text>
                    <Text style={styles.brandZoo}>Zoo</Text>
                  </Text>
                  <View style={styles.brandRule} />
                </View>
              </View>

              <View style={styles.topPadded}>
                <View style={styles.taglineBlock}>
                  <Text style={styles.headline}>
                    <Text style={styles.headlineStrong}>Your zoo journey</Text>
                    {'\n'}
                    <Text style={styles.headlineSoft}>starts here</Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomGlass}>
          <BlurView intensity={38} tint="dark" style={StyleSheet.absoluteFillObject} />
          <View style={styles.bottomGlassScrim} />
          <View
            style={[
              styles.bottomGlassInner,
              {
                paddingBottom: Math.max(insets.bottom, theme.spacing.lg),
              },
            ]}
          >
            <PrimaryButton
              title="Get started"
              onPress={() => navigation.navigate('Register')}
              style={styles.ctaGlass}
              textColor="#FFFFFF"
              textStyle={styles.ctaLabel}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.signInRow}>
              <Text style={styles.signInMuted}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} hitSlop={12}>
                <Text style={styles.signInBold}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  ctaLabel: {
    fontWeight: '700',
  },
  screenFill: {
    flex: 1,
    paddingHorizontal: 0,
  },
  outer: {
    flex: 1,
    justifyContent: 'flex-end',
    minHeight: 0,
    backgroundColor: '#0A1612',
  },
  imagePane: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#0A1612',
  },
  imagePaneContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing.md,
    minHeight: 0,
  },
  topPadded: {
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  brandBlock: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  brandTag: {
    fontFamily: theme.fonts.bold,
    fontWeight: '700',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.88)',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
    ...legibleShadow,
  },
  brand: {
    fontFamily: theme.fonts.bold,
    fontWeight: '700',
    fontSize: 44,
    letterSpacing: 0.5,
    lineHeight: 52,
  },
  brandZentra: {
    color: '#FFFFFF',
    ...displayBoldShadow,
  },
  brandZoo: {
    color: '#C8F7D0',
    ...displayBoldShadow,
  },
  brandRule: {
    marginTop: theme.spacing.md,
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.yellow,
  },
  taglineBlock: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    paddingVertical: theme.spacing.sm,
  },
  headline: {
    textAlign: 'center',
  },
  headlineStrong: {
    fontFamily: theme.fonts.bold,
    fontWeight: '700',
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 36,
    letterSpacing: 0.35,
    ...displayBoldShadow,
  },
  headlineSoft: {
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
    fontSize: 28,
    color: '#B2F2C8',
    lineHeight: 36,
    marginTop: 6,
    letterSpacing: 0.35,
    ...displayBoldShadow,
  },
  bottomGlass: {
    flexShrink: 0,
    overflow: 'hidden',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        }
      : { elevation: 8 }),
  },
  bottomGlassScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  bottomGlassInner: {
    position: 'relative',
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  /** Outlined “Get started” over the blurred jungle. */
  ctaGlass: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.yellow,
    borderRadius: theme.radii.pill,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  dividerText: {
    fontFamily: theme.fonts.bold,
    fontWeight: '700',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  signInRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInMuted: {
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
    fontSize: theme.fontSize.body,
    color: 'rgba(255, 255, 255, 0.88)',
  },
  signInBold: {
    fontFamily: theme.fonts.bold,
    fontWeight: '700',
    fontSize: theme.fontSize.body,
    color: theme.colors.yellow,
  },
});
