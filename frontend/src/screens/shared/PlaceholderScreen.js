import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { theme } from '../../constants/theme';

export default function PlaceholderScreen({ title, emoji }) {
  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.inner}>
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inner: { paddingTop: theme.spacing.md },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: theme.spacing.sm },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.title,
    color: theme.colors.primaryText,
    textAlign: 'center',
  },
});
