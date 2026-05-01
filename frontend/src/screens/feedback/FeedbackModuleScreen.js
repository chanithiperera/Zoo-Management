import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ModuleCard from '../../components/ui/ModuleCard';
import { theme } from '../../constants/theme';

const FEEDBACK_IMG = require('../../../assets/module-images/feedback-item.png');
const REVIEWS_IMG = require('../../../assets/module-images/reviews-item.png');

export default function FeedbackModuleScreen({ navigation }) {
  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.header}>
        <Text style={styles.title}>How can we help you?</Text>
        <Text style={styles.subtitle}>Select a section to submit your feedback or reviews.</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.row}>
          <View style={styles.cell}>
            <ModuleCard
              variant="grid"
              title="Feedbacks"
              description="Share your thoughts"
              image={FEEDBACK_IMG}
              onPress={() => navigation.navigate('FeedbackList')}
            />
          </View>
          <View style={styles.cell}>
            <ModuleCard
              variant="grid"
              title="Reviews"
              description="Rate your experience"
              image={REVIEWS_IMG}
              onPress={() => navigation.navigate('ReviewList')}
            />
          </View>
        </View>
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
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  subtitle: {
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    opacity: 0.7,
    marginTop: theme.spacing.xs,
  },
  grid: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  cell: {
    flex: 1,
  },
});
