import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { theme } from '../../constants/theme';
import * as feedbackApi from '../../api/feedback.api';

export default function AddReviewScreen({ navigation, route }) {
  const existingReview = route.params?.review;
  const isEditing = !!existingReview;

  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [message, setMessage] = useState(existingReview?.message || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Selection Required', 'Please select a star rating before submitting.');
      return;
    }
    if (!message) {
      Alert.alert('Missing Field', 'Please enter a message for your review.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await feedbackApi.updateReview(existingReview._id, { rating, message });
        Alert.alert('Success', 'Your review has been updated.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await feedbackApi.createReview({ rating, message });
        Alert.alert('Success', 'Thank you for your review!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = () => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => setRating(star)}
          activeOpacity={0.7}
          style={styles.starTouch}
        >
          <Text style={[styles.starIcon, rating >= star ? styles.starSelected : styles.starUnselected]}>
            ⭐
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.form}>
        <Text style={styles.label}>Your Rating</Text>
        <StarRating />
        
        <Text style={styles.ratingText}>
          {rating > 0 ? `${rating} out of 5 stars` : 'Tap a star to rate'}
        </Text>

        <TextField
          label="Your Review"
          value={message}
          onChangeText={setMessage}
          placeholder="Share your experience at the zoo..."
          multiline
          numberOfLines={6}
        />

        <PrimaryButton
          title={isEditing ? "Update Review" : "Submit Review"}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: theme.spacing.md,
  },
  label: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    gap: 8,
  },
  starTouch: {
    padding: 4,
  },
  starIcon: {
    fontSize: 36,
  },
  starUnselected: {
    opacity: 0.3,
    filter: 'grayscale(100%)', // Note: grayscale filter doesn't work in RN like this, but opacity does.
  },
  starSelected: {
    opacity: 1,
  },
  ratingText: {
    fontFamily: theme.fonts.regular,
    textAlign: 'center',
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.6,
    marginBottom: theme.spacing.xl,
  },
  submitBtn: {
    marginTop: theme.spacing.md,
  },
});
