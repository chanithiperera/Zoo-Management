import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { theme } from '../../constants/theme';

const SECTIONS = [
  {
    key: 'feedback',
    title: 'Feedbacks',
    description: 'Share your thoughts and suggestions with us.',
    screen: 'FeedbackList',
    a11y: 'Feedbacks: share your thoughts and suggestions',
  },
  {
    key: 'inquiry',
    title: 'Inquiries',
    description: 'Have a question? Ask our team directly.',
    screen: 'InquiryList',
    a11y: 'Inquiries: ask our team directly',
  },
  {
    key: 'review',
    title: 'Reviews',
    description: 'Rate your experience and leave a review.',
    screen: 'ReviewList',
    a11y: 'Reviews: rate your experience',
  },
];

export default function FeedbackModuleScreen({ navigation }) {
  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.header}>
        <Text style={styles.title}>How can we help you?</Text>
        <Text style={styles.subtitle}>Select a section to submit your feedback, inquiries, or reviews.</Text>
      </View>

      <View style={styles.list}>
        {SECTIONS.map((item) => (
          <Pressable
            key={item.key}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate(item.screen)}
            accessibilityRole="button"
            accessibilityLabel={item.a11y}
          >
            <View style={styles.cardInner}>
              <View style={styles.textCol}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.description}</Text>
              </View>
              <Text style={styles.chevron} accessible={false}>
                ›
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontWeight: '700',
    fontSize: theme.fontSize.hero,
    color: theme.colors.linkGreen,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    opacity: 0.72,
    marginTop: theme.spacing.xs,
    lineHeight: Math.round(theme.fontSize.body * 1.45),
  },
  list: {
    gap: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accentGreen,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  textCol: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  cardTitle: {
    fontFamily: theme.fonts.bold,
    fontWeight: '700',
    fontSize: theme.fontSize.body,
    color: theme.colors.linkGreen,
  },
  cardDesc: {
    marginTop: 4,
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
    fontSize: theme.fontSize.sm,
    color: theme.colors.accentGreen,
    lineHeight: Math.round(theme.fontSize.sm * 1.4),
  },
  chevron: {
    fontSize: 22,
    color: theme.colors.linkGreen,
    fontWeight: '600',
  },
});
