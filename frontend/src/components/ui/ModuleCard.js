import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import { theme } from '../../constants/theme';

const THUMB = 72;

export default function ModuleCard({ title, description, emoji, image, onPress }) {
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
          <Text style={styles.title}>{title}</Text>
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
    fontWeight: '700',
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
  },
  desc: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
  },
});
