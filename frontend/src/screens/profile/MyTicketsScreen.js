import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { buildUserDrawerMenuItems } from './userDrawerMenu';
import { getMyBookings } from '../../api/ticketBooking.api';
import { formatLkr } from '../../constants/entryTickets';
import { theme } from '../../constants/theme';

export default function MyTicketsScreen({ navigation }) {
  const drawerMenuItems = useMemo(() => buildUserDrawerMenuItems(navigation), [navigation]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasLoadedOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (!hasLoadedOnce.current) setLoading(true);
      (async () => {
        try {
          const data = await getMyBookings();
          if (cancelled) return;
          setBookings(data?.data?.bookings ?? []);
          setError(null);
          hasLoadedOnce.current = true;
        } catch {
          if (!cancelled) setError('Unable to load your tickets. Please try again.');
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const openPass = useCallback(
    (booking) => {
      navigation.navigate('PaymentSuccess', {
        totalLkr: booking.totalLkr,
        confirmationCode: booking.confirmationCode,
        bookingId: String(booking._id),
        visitDate: booking.visitDate,
      });
    },
    [navigation]
  );

  return (
    <AccountDrawerLayout headerTitle="My Tickets" drawerMenuItems={drawerMenuItems}>
      <View style={styles.intro}>
        <Text style={styles.introTitle}>Your bookings</Text>
        <Text style={styles.introBody}>Tap a booking to open your gate pass and QR code.</Text>
      </View>

      {loading && !hasLoadedOnce.current ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.accentGreen} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : bookings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No tickets yet</Text>
          <Text style={styles.emptyBody}>Book entry and show tickets to see them listed here.</Text>
          <PrimaryButton title="Book tickets" onPress={() => navigation.navigate('TicketShow')} />
        </View>
      ) : (
        <View style={styles.list}>
          {bookings.map((booking) => (
            <Pressable
              key={booking._id}
              onPress={() => openPass(booking)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              accessibilityRole="button"
              accessibilityLabel={`Booking for ${booking.visitDate}, ${formatLkr(booking.totalLkr)}. View pass.`}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardDate}>{booking.visitDate}</Text>
                {booking.entryStatus === 'used' ? (
                  <View style={styles.usedPill}>
                    <Text style={styles.usedPillText}>Used</Text>
                  </View>
                ) : (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>Valid</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardCode}>Confirmation {booking.confirmationCode}</Text>
              <Text style={styles.cardTotal}>{formatLkr(booking.totalLkr)}</Text>
              <Text style={styles.cardHint}>View pass ›</Text>
            </Pressable>
          ))}
        </View>
      )}
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  introTitle: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  introBody: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
    lineHeight: theme.fontSize.sm * 1.4,
  },
  centered: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  error: {
    fontSize: theme.fontSize.body,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  empty: {
    alignItems: 'stretch',
    paddingVertical: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.xs,
  },
  emptyBody: {
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    opacity: 0.75,
    marginBottom: theme.spacing.lg,
    lineHeight: theme.fontSize.body * 1.35,
  },
  list: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
    backgroundColor: theme.colors.backgroundAlt,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  cardDate: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
    flex: 1,
  },
  usedPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  usedPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primaryText,
    opacity: 0.7,
  },
  activePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.sageButton,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.linkGreen,
  },
  cardCode: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.85,
    marginBottom: 4,
  },
  cardTotal: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  cardHint: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.accentGreen,
  },
});
