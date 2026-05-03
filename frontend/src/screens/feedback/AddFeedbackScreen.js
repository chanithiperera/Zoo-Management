import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Modal, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { popOrParentGoBack } from '../../utils/popOrParentGoBack';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { theme } from '../../constants/theme';
import * as feedbackApi from '../../api/feedback.api';
import {
  validateTypeSubjectMessage,
  hasValidationErrors,
  FEEDBACK_SUBJECT_MAX,
  FEEDBACK_MESSAGE_MAX,
  FEEDBACK_TYPES,
} from '../../utils/validation';

export default function AddFeedbackScreen({ navigation, route }) {
  const existingFeedback = route.params?.feedback;
  const isEditing = !!existingFeedback;

  const [type, setType] = useState(existingFeedback?.type || '');
  const [subject, setSubject] = useState(existingFeedback?.subject || '');
  const [message, setMessage] = useState(existingFeedback?.message || '');
  const [loading, setLoading] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
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
    const nextErrors = validateTypeSubjectMessage({
      type,
      subject,
      message,
    });
    setErrors(nextErrors);
    if (hasValidationErrors(nextErrors)) {
      Alert.alert('Check your entries', 'Please fix the fields highlighted below.');
      return;
    }

    const payload = {
      type: type.trim(),
      subject: subject.trim(),
      message: message.trim(),
    };

    setLoading(true);
    try {
      if (isEditing) {
        await feedbackApi.updateFeedback(existingFeedback._id, payload);
        Alert.alert('Feedback updated', 'Your changes were saved.', [
          { text: 'OK', onPress: () => popOrParentGoBack(navigation) },
        ]);
      } else {
        await feedbackApi.createFeedback(payload);
        Alert.alert('Feedback submitted', 'We have received your feedback.', [
          { text: 'OK', onPress: () => popOrParentGoBack(navigation) },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.form}>
        <Text style={styles.label}>Feedback Type</Text>
        <TouchableOpacity
          style={[
            styles.pickerTrigger,
            errors.type ? styles.pickerTriggerError : styles.pickerTriggerSpaced,
          ]}
          onPress={() => {
            clearFieldError('type');
            setShowTypeModal(true);
          }}
        >
          <Text style={[styles.pickerValue, !type && styles.pickerPlaceholder]}>
            {type || 'Select feedback type'}
          </Text>
          <Text style={styles.pickerChevron}>▾</Text>
        </TouchableOpacity>
        {errors.type ? <Text style={styles.fieldError}>{errors.type}</Text> : null}

        <TextField
          label="Subject"
          value={subject}
          onChangeText={(v) => {
            setSubject(v);
            clearFieldError('subject');
          }}
          placeholder="What is this about?"
          error={errors.subject}
          maxLength={FEEDBACK_SUBJECT_MAX}
        />

        <TextField
          label="Message"
          value={message}
          onChangeText={(v) => {
            setMessage(v);
            clearFieldError('message');
          }}
          placeholder="Tell us more..."
          multiline
          numberOfLines={6}
          error={errors.message}
          maxLength={FEEDBACK_MESSAGE_MAX}
        />

        <PrimaryButton
          title={isEditing ? "Update Feedback" : "Submit Feedback"}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />
      </View>

      <Modal
        visible={showTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTypeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Feedback Type</Text>
            {FEEDBACK_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={styles.modalOption}
                onPress={() => {
                  setType(t);
                  clearFieldError('type');
                  setShowTypeModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  },
  pickerTrigger: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pickerTriggerSpaced: {
    marginBottom: theme.spacing.md,
  },
  pickerTriggerError: {
    borderColor: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  fieldError: {
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.md,
  },
  pickerValue: {
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
    fontSize: theme.fontSize.body,
    color: theme.colors.black,
  },
  pickerPlaceholder: {
    color: '#9E9E9E',
  },
  pickerChevron: {
    fontSize: 18,
    color: theme.colors.primaryText,
    opacity: 0.5,
  },
  submitBtn: {
    marginTop: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    width: '100%',
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontFamily: theme.fonts.bold,
    fontWeight: '700',
    fontSize: theme.fontSize.lg,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalOptionText: {
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    textAlign: 'center',
  },
});
