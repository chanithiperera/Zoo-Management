import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ScreenContainer from '../../components/ui/ScreenContainer';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { theme } from '../../constants/theme';
import * as feedbackApi from '../../api/feedback.api';
import { getApiBaseUrl } from '../../api/getApiBaseUrl';

const INQUIRY_TYPES = [
  'Entry Tickets and Show Booking',
  'Event Booking',
  'Animal Encounter and Photography',
  'Animal Information and Education',
  'Online Store',
  'General',
];

export default function AddInquiryScreen({ navigation, route }) {
  const existingInquiry = route.params?.inquiry;
  const isEditing = !!existingInquiry;

  const [type, setType] = useState(existingInquiry?.type || '');
  const [subject, setSubject] = useState(existingInquiry?.subject || '');
  const [message, setMessage] = useState(existingInquiry?.message || '');
  const [image, setImage] = useState(existingInquiry?.imageUrl ? { uri: `${getApiBaseUrl().replace('/api', '')}${existingInquiry.imageUrl}` } : null);
  const [loading, setLoading] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!type || !subject || !message) {
      Alert.alert('Missing Fields', 'Please fill in all fields before submitting.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('subject', subject);
      formData.append('message', message);
      
      if (image && !image.uri.startsWith('http')) { // Only append if it's a new local file
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('image', {
          uri: image.uri,
          name: `inquiry-${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      if (isEditing) {
        await feedbackApi.updateInquiry(existingInquiry._id, formData);
        Alert.alert('Success', 'Your inquiry has been updated.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await feedbackApi.createInquiry(formData);
        Alert.alert('Success', 'Your inquiry has been submitted. We will get back to you soon!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit inquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.form}>
        <Text style={styles.label}>Inquiry Type</Text>
        <TouchableOpacity
          style={styles.pickerTrigger}
          onPress={() => setShowTypeModal(true)}
        >
          <Text style={[styles.pickerValue, !type && styles.pickerPlaceholder]}>
            {type || 'Select inquiry type'}
          </Text>
          <Text style={styles.pickerChevron}>▾</Text>
        </TouchableOpacity>

        <TextField
          label="Subject"
          value={subject}
          onChangeText={setSubject}
          placeholder="What is your question about?"
        />

        <TextField
          label="Message"
          value={message}
          onChangeText={setMessage}
          placeholder="Explain your inquiry in detail..."
          multiline
          numberOfLines={6}
        />

        <Text style={styles.label}>Attachment (Optional)</Text>
        <View style={styles.imageSection}>
          {image ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: image.uri }} style={styles.previewImage} />
              <View style={styles.imageActions}>
                <TouchableOpacity style={styles.changeBtn} onPress={pickImage}>
                  <Text style={styles.changeBtnText}>Change Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeBtn} onPress={() => setImage(null)}>
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.addBtn} onPress={pickImage}>
              <Text style={styles.addBtnEmoji}>📷</Text>
              <Text style={styles.addBtnText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <PrimaryButton
          title={isEditing ? "Update Inquiry" : "Submit Inquiry"}
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
            <Text style={styles.modalTitle}>Select Inquiry Type</Text>
            {INQUIRY_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={styles.modalOption}
                onPress={() => {
                  setType(t);
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
    marginBottom: theme.spacing.md,
  },
  pickerValue: {
    fontFamily: theme.fonts.regular,
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
  imageSection: {
    marginBottom: theme.spacing.lg,
  },
  addBtn: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    height: 100,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  addBtnEmoji: { fontSize: 24 },
  addBtnText: {
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.primaryText,
    fontSize: theme.fontSize.body,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.sm,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: theme.radii.sm,
  },
  imageActions: {
    flex: 1,
    marginLeft: theme.spacing.md,
    gap: 8,
  },
  changeBtn: {
    backgroundColor: theme.colors.accentGreen,
    paddingVertical: 8,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
  },
  changeBtnText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.white,
    fontSize: 12,
  },
  removeBtn: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  removeBtnText: {
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.error,
    fontSize: 12,
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
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    textAlign: 'center',
  },
});
