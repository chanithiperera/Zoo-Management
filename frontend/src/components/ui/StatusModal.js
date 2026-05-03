import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

const StatusModal = ({ 
  visible, 
  onClose, 
  title, 
  message, 
  type = 'success', 
  confirmText = 'Continue', 
  onConfirm,
  cancelText = 'Cancel',
  onCancel
}) => {

  const [scaleValue] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible]);

  const getStatusConfig = () => {
    switch (type) {
      case 'error':
        /** On-brand “issue” state: green typography + mint halo + mustard CTA (matches Register / PrimaryButton). */
        return {
          icon: 'alert-circle',
          iconTint: colors.linkGreen,
          haloColor: colors.welcomeBackground,
          titleColor: colors.linkGreen,
          confirmBg: colors.yellowAlt,
          confirmTextColor: colors.black,
          accentForBorder: colors.linkGreen,
          defaultTitle: 'Error',
        };
      case 'warning':
        return {
          icon: 'warning',
          iconTint: colors.primaryText,
          haloColor: '#FFF8E1',
          titleColor: colors.primaryText,
          confirmBg: colors.yellowAlt,
          confirmTextColor: colors.black,
          accentForBorder: colors.yellowAlt,
          defaultTitle: 'Warning',
        };
      case 'info':
        return {
          icon: 'information-circle',
          iconTint: '#1565C0',
          haloColor: '#E3F2FD',
          titleColor: '#1565C0',
          confirmBg: '#1565C0',
          confirmTextColor: colors.white,
          accentForBorder: '#1565C0',
          defaultTitle: 'Information',
        };
      case 'success':
      default:
        return {
          icon: 'checkmark-circle',
          iconTint: colors.accentGreen,
          haloColor: '#E8F5E9',
          titleColor: colors.linkGreen,
          confirmBg: colors.accentGreen,
          confirmTextColor: colors.white,
          accentForBorder: colors.accentGreen,
          defaultTitle: 'Success',
        };
    }
  };

  const config = getStatusConfig();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleValue }] }]}>
          <View style={[styles.iconContainer, { backgroundColor: config.haloColor }]}>
            <Ionicons name={config.icon} size={70} color={config.iconTint} />
          </View>

          <Text style={[styles.title, { color: config.titleColor }]}>{title || config.defaultTitle}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={[styles.buttonContainer, !onCancel && { justifyContent: 'center' }]}>
            {onCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: config.accentForBorder }]}
                onPress={() => {
                  onCancel();
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, { color: config.accentForBorder }]}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: config.confirmBg },
                !onCancel && { flex: 0, paddingHorizontal: 40, minWidth: 150 },
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, { color: config.confirmTextColor }]}>{confirmText}</Text>
            </TouchableOpacity>
          </View>


        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: colors.white,
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 15,
    flex: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});


export default StatusModal;
