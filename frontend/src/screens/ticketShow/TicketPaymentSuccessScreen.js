import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { theme } from '../../constants/theme';
import { formatLkr } from '../../constants/entryTickets';

export default function TicketPaymentSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const totalLkr = route.params?.totalLkr ?? 0;
  const confirmationCode = route.params?.confirmationCode ?? 'Pending';
  const bookingId = route.params?.bookingId ?? 'N/A';
  const visitDate = route.params?.visitDate ?? 'N/A';

  const qrPayload = useMemo(
    () => JSON.stringify({ bookingId, confirmationCode, visitDate }),
    [bookingId, confirmationCode, visitDate]
  );

  return (
    <ScreenContainer backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.icon}>✓</Text>
          <Text style={styles.title}>Payment successful</Text>
          <Text style={styles.body}>
            Your payment of {formatLkr(totalLkr)} has been received. Your booking is now confirmed.
          </Text>
          <View style={styles.metaBlock}>
            <Text style={styles.metaText}>Confirmation: {confirmationCode}</Text>
            <Text style={styles.metaText}>Visit date: {visitDate}</Text>
            <Text style={styles.metaText}>Booking ID: {bookingId}</Text>
          </View>
          <View style={styles.qrWrap}>
            <QRCode value={qrPayload} size={170} />
            <Text style={styles.qrHint}>Show this QR at the gate</Text>
          </View>
          <PrimaryButton
            title="Back to tickets"
            onPress={() => navigation.navigate('TicketShow')}
            style={styles.button}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    color: theme.colors.accentGreen,
    marginBottom: theme.spacing.sm,
    fontWeight: '700',
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    textAlign: 'center',
  },
  body: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.85,
  },
  metaBlock: {
    marginTop: theme.spacing.md,
    width: '100%',
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  metaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    fontWeight: '600',
  },
  qrWrap: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  qrHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
});
