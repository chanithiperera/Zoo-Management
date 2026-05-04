import React, { useMemo } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { theme } from '../../constants/theme';

const THUMB = 72;

/** Matches ProfileScreen scroll padding + row gap + card padding so every grid tile uses the same image square. */
function useGridImageSizePx() {
  const { width: winW } = useWindowDimensions();
  return useMemo(() => {
    const scrollPad = theme.spacing.md * 2;
    const rowGap = theme.spacing.sm;
    const cardPad = theme.spacing.sm * 2;
    const cellInner = (winW - scrollPad - rowGap) / 2;
    return Math.max(96, Math.floor(cellInner - cardPad));
  }, [winW]);
}

export default function ModuleCard({
  title,
  description,
  emoji,
  image,
  onPress,
  variant = 'row',
  tileWidth,
  titleStyle,
}) {
  const a11yLabel = description ? `${title}. ${description}` : title;
  const gridImageSize = useGridImageSizePx();

  if (variant === 'grid') {
    const square = { width: gridImageSize, height: gridImageSize, borderRadius: theme.radii.sm };
    return (
      <TouchableOpacity
        style={[styles.cardGrid, tileWidth ? { width: tileWidth } : styles.cardGridFill]}
        onPress={onPress}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
      >
        <View style={styles.gridImageSlot}>
          {image ? (
            <Image
              source={image}
              style={[styles.gridImage, square]}
              resizeMode="cover"
              accessible={false}
              importantForAccessibility="no"
            />
          ) : emoji ? (
            <View style={[styles.gridEmojiWrap, square]}>
              <Text style={styles.gridEmoji}>{emoji}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.gridTitle, titleStyle]} numberOfLines={4}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.row}>
        {image ? (
          <Image
            source={image}
            style={styles.thumb}
            resizeMode="cover"
            accessible={false}
            importantForAccessibility="no"
          />
        ) : emoji ? (
          <Text style={styles.emoji}>{emoji}</Text>
        ) : null}
        <View style={styles.textCol}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {description ? <Text style={styles.desc}>{description}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: theme.radii.sm,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  emoji: { fontSize: 28, marginRight: theme.spacing.sm },
  textCol: { flex: 1 },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
  },
  desc: {
    marginTop: 4,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
  },
  cardGridFill: {
    width: '100%',
    alignSelf: 'stretch',
  },
  cardGrid: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    padding: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  gridImageSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridImage: {
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  gridEmojiWrap: {
    backgroundColor: theme.colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridEmoji: {
    fontSize: 48,
  },
  gridTitle: {
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.fontSize.sm * 1.35,
    color: theme.colors.primaryText,
  },
});
