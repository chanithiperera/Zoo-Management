import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { theme } from '../../constants/theme';
import { formatLkr } from '../../constants/entryTickets';
import { createBooking } from '../../api/ticketBooking.api';

function isValidExpiry(expiry) {
  const trimmed = expiry.trim();
  if (!/^\d{2}\/\d{2}$/.test(trimmed)) return false;

  const [mm, yy] = trimmed.split('/').map((v) => Number(v));
  if (mm < 1 || mm > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (yy < currentYear) return false;
  if (yy === currentYear && mm < currentMonth) return false;
  return true;
}

export default function TicketPaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const entrySubtotalLkr = route.params?.entrySubtotalLkr ?? 0;
  const showsSubtotalLkr = route.params?.showsSubtotalLkr ?? 0;
  const totalLkr = useMemo(
    () => route.params?.totalLkr ?? entrySubtotalLkr + showsSubtotalLkr,
    [route.params?.totalLkr, entrySubtotalLkr, showsSubtotalLkr]
  );
  const entryItems = route.params?.entryItems ?? [];
  const showItems = route.params?.showItems ?? [];
  const visitDate = route.params?.visitDate;

  const onPayNow = async () => {
    const nextErrors = {
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    };

    const cardholderNameTrimmed = cardholderName.trim();
    const cardDigits = cardNumber.replace(/\s/g, '');
    const cvvDigits = cvv.trim();

    if (!cardholderNameTrimmed) {
      nextErrors.cardholderName = 'Cardholder name is required.';
    }
    if (!/^\d{16}$/.test(cardDigits)) {
      nextErrors.cardNumber = 'Card number must be 16 digits.';
    }
    if (!isValidExpiry(expiryDate)) {
      nextErrors.expiryDate = 'Use MM/YY and enter a valid future date.';
    }
    if (!/^\d{3,4}$/.test(cvvDigits)) {
      nextErrors.cvv = 'CVV must be 3 or 4 digits.';
    }

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      Alert.alert('Payment details', 'Please correct the highlighted fields.');
      return;
    }

    if (!visitDate) {
      Alert.alert('Booking', 'Visit date is missing. Please restart the booking flow.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await createBooking({
        visitDate,
        entryItems,
        showItems,
        payment: {
          cardholderName: cardholderNameTrimmed,
          cardNumber: cardDigits,
          expiryDate: expiryDate.trim(),
          cvv: cvvDigits,
        },
      });
      const booking = response?.data?.booking;
      navigation.navigate('PaymentSuccess', {
        totalLkr: booking?.totalLkr ?? totalLkr,
        confirmationCode: booking?.confirmationCode,
        bookingId: booking?._id,
        visitDate: booking?.visitDate ?? visitDate,
      });
    } catch (error) {
      const message = error?.response?.data?.message || 'Payment failed. Please try again.';
      const isCapacityError = /no seats left/i.test(String(message));
      Alert.alert(isCapacityError ? 'Show availability' : 'Payment', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.container}>
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Booking summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Entry tickets subtotal</Text>
            <Text style={styles.summaryValue}>{formatLkr(entrySubtotalLkr)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Show tickets subtotal</Text>
            <Text style={styles.summaryValue}>{formatLkr(showsSubtotalLkr)}</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total to pay</Text>
            <Text style={styles.totalValue}>{formatLkr(totalLkr)}</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Payment details</Text>
          <TextField
            label="Cardholder name"
            value={cardholderName}
            onChangeText={(value) => {
              setCardholderName(value);
              if (errors.cardholderName) setErrors((prev) => ({ ...prev, cardholderName: '' }));
            }}
            placeholder="Name on card"
            autoCapitalize="words"
            error={errors.cardholderName}
          />
          <TextField
            label="Card number"
            value={cardNumber}
            onChangeText={(value) => {
              setCardNumber(value);
              if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: '' }));
            }}
            placeholder="1234 5678 9012 3456"
            keyboardType="number-pad"
            autoCapitalize="none"
            error={errors.cardNumber}
          />
          <View style={styles.inlineInputs}>
            <View style={styles.halfInput}>
              <TextField
                label="Expiry date"
                value={expiryDate}
                onChangeText={(value) => {
                  setExpiryDate(value);
                  if (errors.expiryDate) setErrors((prev) => ({ ...prev, expiryDate: '' }));
                }}
                placeholder="MM/YY"
                autoCapitalize="none"
                error={errors.expiryDate}
              />
            </View>
            <View style={styles.halfInput}>
              <TextField
                label="CVV"
                value={cvv}
                onChangeText={(value) => {
                  setCvv(value);
                  if (errors.cvv) setErrors((prev) => ({ ...prev, cvv: '' }));
                }}
                placeholder="123"
                keyboardType="number-pad"
                autoCapitalize="none"
                error={errors.cvv}
              />
            </View>
          </View>

          <PrimaryButton title="Pay now" onPress={onPayNow} style={styles.payButton} loading={submitting} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  summaryCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  formCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    opacity: 0.85,
  },
  summaryValue: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  totalRow: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.sage,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  totalValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.accentGreen,
  },
  inlineInputs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  payButton: {
    marginTop: theme.spacing.sm,
  },
});
