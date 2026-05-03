import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { popOrParentGoBack } from '../../utils/popOrParentGoBack';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { theme } from '../../constants/theme';
import * as feedbackApi from '../../api/feedback.api';
import {
  validateReviewFields,
  hasValidationErrors,
  FEEDBACK_MESSAGE_MAX,
} from '../../utils/validation';

export default function AddReviewScreen({ navigation, route }) {
  const existingReview = route.params?.review;
  const isEditing = !!existingReview;

  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [message, setMessage] = useState(existingReview?.message || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const clearFieldError = useCallback((key) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleSubmit = async () => {
    const nextErrors = validateReviewFields({ rating, message });
    setErrors(nextErrors);
    if (hasValidationErrors(nextErrors)) {
      Alert.alert('Check your entries', 'Please fix the fields highlighted below.');
      return;
    }

    const payload = { rating: Number(rating), message: message.trim() };

    setLoading(true);
    try {
      if (isEditing) {
        await feedbackApi.updateReview(existingReview._id, payload);
        Alert.alert('Review updated', 'Your changes were saved.', [
          { text: 'OK', onPress: () => popOrParentGoBack(navigation) },
        ]);
      } else {
        await feedbackApi.createReview(payload);
        Alert.alert('Review submitted', 'We have received your review.', [
          { text: 'OK', onPress: () => popOrParentGoBack(navigation) },
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
          onPress={() => {
            setRating(star);
            clearFieldError('rating');
          }}
          activeOpacity={0.7}
          style={styles.starTouch}
          accessibilityRole="button"
          accessibilityLabel={`Rate ${star} out of 5`}
          accessibilityState={{ selected: rating >= star }}
        >
          <Ionicons
            name={rating >= star ? 'star' : 'star-outline'}
            size={34}
            color={rating >= star ? theme.colors.ratingStar : theme.colors.ratingStarMuted}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.form}>
        <Text style={styles.label}>Your Rating</Text>
        <View style={errors.rating ? styles.starBlockCompact : styles.starBlock}>
          <StarRating />
        </View>
        {errors.rating ? <Text style={styles.ratingError}>{errors.rating}</Text> : null}

        <TextField
          label="Your Review"
          value={message}
          onChangeText={(v) => {
            setMessage(v);
            clearFieldError('message');
          }}
          placeholder="Share your experience at the zoo..."
          multiline
          numberOfLines={6}
          error={errors.message}
          maxLength={FEEDBACK_MESSAGE_MAX}
        />

        <PrimaryButton
          title={isEditing ? 'Update Review' : 'Submit Review'}
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
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  starBlock: {
    marginBottom: theme.spacing.xl,
  },
  starBlockCompact: {
    marginBottom: theme.spacing.sm,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ratingError: {
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  starTouch: {
    padding: 4,
  },
  submitBtn: {
    marginTop: theme.spacing.md,
  },
});
