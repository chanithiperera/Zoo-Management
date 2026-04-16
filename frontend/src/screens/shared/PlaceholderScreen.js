import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { theme } from '../../constants/theme';

export default function PlaceholderScreen({ title, emoji, body }) {
  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.inner}>
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {body ? <Text style={styles.body}>{body}</Text> : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inner: { paddingTop: theme.spacing.md },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: theme.spacing.sm },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
    textAlign: 'center',
  },
  body: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.body,
    lineHeight: Math.round(theme.fontSize.body * 1.45),
    color: theme.colors.primaryText,
    opacity: 0.85,
    textAlign: 'center',
  },
});
