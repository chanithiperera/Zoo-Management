import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ModuleCard from '../../components/ui/ModuleCard';
import { theme } from '../../constants/theme';

export default function FeedbackModuleScreen({ navigation }) {
  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.header}>
        <Text style={styles.title}>How can we help you?</Text>
        <Text style={styles.subtitle}>Select a section to submit your feedback, inquiries, or reviews.</Text>
      </View>

      <View style={styles.grid}>
        <ModuleCard
          title="Feedbacks"
          description="Share your thoughts and suggestions with us."
          emoji="💬"
          onPress={() => navigation.navigate('FeedbackList')}
        />
        <ModuleCard
          title="Inquiries"
          description="Have a question? Ask our team directly."
          emoji="❓"
          onPress={() => navigation.navigate('InquiryList')}
        />
        <ModuleCard
          title="Reviews"
          description="Rate your experience and leave a review."
          emoji="⭐"
          onPress={() => navigation.navigate('ReviewList')}
        />
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
    fontSize: theme.fontSize.hero,
    color: theme.colors.primaryText,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    opacity: 0.7,
    marginTop: theme.spacing.xs,
  },
  grid: {
    gap: theme.spacing.md,
  },
});
