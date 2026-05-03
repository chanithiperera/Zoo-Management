import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { theme } from '../../constants/theme';

export default function PlaceholderScreen({
  title,
  emoji,
  /** Optional icon/markup shown above title (preferred over emoji for consistency). */
  leadContent,
  body,
  imageSource,
  imageAccessibilityLabel,
  children,
}) {
  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.inner}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.hero}
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel={imageAccessibilityLabel || title}
          />
        ) : null}
        {leadContent ? <View style={styles.leadWrap}>{leadContent}</View> : null}
        {emoji && !leadContent ? <Text style={styles.emoji}>{emoji}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {body ? <Text style={styles.body}>{body}</Text> : null}
        {children}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inner: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm,
  },
  hero: {
    width: '100%',
    height: 200,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    shadowColor: '#0D2D1D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: theme.spacing.md,
  },
  leadWrap: { alignItems: 'center', marginBottom: theme.spacing.sm },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: theme.spacing.sm },
  title: {
    fontFamily: theme.fonts.bold,
    fontWeight: '700',
    fontSize: theme.fontSize.title,
    color: theme.colors.primaryText,
    textAlign: 'center',
  },
  body: {
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
    fontSize: theme.fontSize.body,
    lineHeight: Math.round(theme.fontSize.body * 1.45),
    color: theme.colors.primaryText,
    opacity: 0.85,
    textAlign: 'center',
  },
});
