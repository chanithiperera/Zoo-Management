import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import VisitDateCalendar from '../../components/booking/VisitDateCalendar';
import { getAdminDrawerMenuItems } from './adminNavigation';
import { getAdminBookingsByDate } from '../../api/admin.api';
import { formatLkr } from '../../constants/entryTickets';
import { theme } from '../../constants/theme';
import { monthStartTs, startOfDay, toLocalDateKey } from '../../utils/visitCalendar';

function parseLocalDateKey(dateKey) {
  const [yearStr, monthStr, dayStr] = String(dateKey || '').split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!year || !month || !day) return startOfDay(new Date());
  return startOfDay(new Date(year, month - 1, day));
}

export default function AdminManageBookingsScreen({ navigation }) {
  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);
  const [selectedDate, setSelectedDate] = useState(toLocalDateKey(new Date()));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const selectedDateObj = useMemo(() => parseLocalDateKey(selectedDate), [selectedDate]);
  const [visibleYear, setVisibleYear] = useState(selectedDateObj.getFullYear());
  const [visibleMonthIndex, setVisibleMonthIndex] = useState(selectedDateObj.getMonth());
  const { min, max } = useMemo(() => {
    const now = startOfDay(new Date());
    const minDate = new Date(now);
    const maxDate = new Date(now);
    minDate.setFullYear(minDate.getFullYear() - 5);
    maxDate.setFullYear(maxDate.getFullYear() + 5);
    return { min: minDate, max: maxDate };
  }, []);

  const loadBookings = useCallback(async (visitDate) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminBookingsByDate(visitDate);
      setBookings(res?.data?.bookings ?? []);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Unable to load bookings right now.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookings(selectedDate);
    }, [loadBookings, selectedDate])
  );

  const canGoPrevMonth = monthStartTs(visibleYear, visibleMonthIndex) > monthStartTs(min.getFullYear(), min.getMonth());
  const canGoNextMonth = monthStartTs(visibleYear, visibleMonthIndex) < monthStartTs(max.getFullYear(), max.getMonth());

  const onPrevMonth = useCallback(() => {
    if (!canGoPrevMonth) return;
    const d = new Date(visibleYear, visibleMonthIndex, 1);
    d.setMonth(d.getMonth() - 1);
    setVisibleYear(d.getFullYear());
    setVisibleMonthIndex(d.getMonth());
  }, [visibleYear, visibleMonthIndex, canGoPrevMonth]);

  const onNextMonth = useCallback(() => {
    if (!canGoNextMonth) return;
    const d = new Date(visibleYear, visibleMonthIndex, 1);
    d.setMonth(d.getMonth() + 1);
    setVisibleYear(d.getFullYear());
    setVisibleMonthIndex(d.getMonth());
  }, [visibleYear, visibleMonthIndex, canGoNextMonth]);

  const openCalendar = useCallback(() => {
    const baseDate = selectedDateObj;
    setVisibleYear(baseDate.getFullYear());
    setVisibleMonthIndex(baseDate.getMonth());
    setIsCalendarOpen(true);
  }, [selectedDateObj]);

  const onSelectCalendarDate = useCallback(
    (date) => {
      const nextDate = toLocalDateKey(date);
      setSelectedDate(nextDate);
      setIsCalendarOpen(false);
      loadBookings(nextDate);
    },
    [loadBookings]
  );

  const setToday = useCallback(() => {
    const today = toLocalDateKey(new Date());
    setSelectedDate(today);
    loadBookings(today);
  }, [loadBookings]);

  const alreadyCameCount = useMemo(
    () => bookings.filter((booking) => booking.entryStatus === 'used').length,
    [bookings]
  );
  const notYetCount = useMemo(() => bookings.length - alreadyCameCount, [bookings.length, alreadyCameCount]);

  return (
    <AccountDrawerLayout headerTitle="Explore" drawerMenuItems={drawerMenuItems}>
      <Pressable
        onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('AdminEntryTicketsShowBooking'))}
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backBtnText}>← Back</Text>
      </Pressable>
      <View style={styles.heroCard} accessibilityRole="header">
        <Text style={styles.title}>Manage Regular Bookings</Text>
        <Text style={styles.sub}>View bookings by date and track who already entered the zoo.</Text>
      </View>

      <View style={styles.filterCard}>
        <Text style={styles.dateLabel}>Visit date</Text>
        <Pressable onPress={openCalendar} style={styles.datePickerBtn} accessibilityRole="button">
          <Text style={styles.datePickerText}>{selectedDate}</Text>
          <Text style={styles.datePickerIcon}>▼</Text>
        </Pressable>
        <View style={styles.filterActions}>
          <Pressable onPress={openCalendar} style={styles.actionBtn} accessibilityRole="button">
            <Text style={styles.actionBtnText}>Choose date</Text>
          </Pressable>
          <Pressable onPress={setToday} style={styles.actionBtnMuted} accessibilityRole="button">
            <Text style={styles.actionBtnMutedText}>Today</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Not Yet Came</Text>
          <Text style={styles.summaryValue}>{notYetCount}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Already Came</Text>
          <Text style={styles.summaryValue}>{alreadyCameCount}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={theme.colors.accentGreen} />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No bookings for {selectedDate}</Text>
          <Text style={styles.emptySub}>Try another date or tap Today.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {bookings.map((booking) => {
            const user = booking.userId || {};
            const isUsed = booking.entryStatus === 'used';
            return (
              <View key={booking._id} style={styles.bookingCard}>
                <View style={styles.cardTop}>
                  <Text style={styles.bookingName}>{user.fullName || 'Unknown user'}</Text>
                  <View style={[styles.statusBadge, isUsed ? styles.statusUsed : styles.statusPending]}>
                    <Text style={[styles.statusBadgeText, isUsed ? styles.statusUsedText : styles.statusPendingText]}>
                      {isUsed ? 'Already Came' : 'Not Yet Came'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.metaText}>Visit date: {booking.visitDate}</Text>
                <Text style={styles.metaText}>Email: {user.email || '-'}</Text>
                <Text style={styles.metaText}>Phone: {user.phone || '-'}</Text>
                <Text style={styles.metaText}>Confirmation: {booking.confirmationCode}</Text>
                <Text style={styles.totalText}>{formatLkr(booking.totalLkr || 0)}</Text>
              </View>
            );
          })}
        </View>
      )}

      <Modal visible={isCalendarOpen} transparent animationType="fade" onRequestClose={() => setIsCalendarOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarModalCard}>
            <VisitDateCalendar
              visibleYear={visibleYear}
              visibleMonthIndex={visibleMonthIndex}
              onPrevMonth={onPrevMonth}
              onNextMonth={onNextMonth}
              canGoPrevMonth={canGoPrevMonth}
              canGoNextMonth={canGoNextMonth}
              selectedDate={selectedDateObj}
              onSelectDate={onSelectCalendarDate}
              onClose={() => setIsCalendarOpen(false)}
              minDate={min}
              maxDate={max}
              showIntro={false}
            />
          </View>
        </View>
      </Modal>
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  backBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  heroCard: {
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accentGreen,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  sub: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.accentGreen,
    lineHeight: Math.round(theme.fontSize.sm * 1.45),
  },
  filterCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  dateLabel: {
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
  },
  datePickerBtn: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
  },
  datePickerIcon: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.accentGreen,
    fontWeight: '700',
  },
  filterActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    backgroundColor: theme.colors.accentGreen,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    marginRight: theme.spacing.xs,
  },
  actionBtnText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  actionBtnMuted: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    backgroundColor: theme.colors.white,
  },
  actionBtnMutedText: {
    color: theme.colors.primaryText,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  summaryLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.8,
  },
  summaryValue: {
    marginTop: 4,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  centered: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.8,
  },
  error: {
    fontSize: theme.fontSize.body,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  emptyCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  emptySub: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
  },
  list: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  bookingCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  bookingName: {
    flex: 1,
    paddingRight: theme.spacing.sm,
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  statusBadge: {
    borderRadius: theme.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusPending: {
    backgroundColor: theme.colors.sageButton,
    borderColor: theme.colors.border,
  },
  statusUsed: {
    backgroundColor: theme.colors.backgroundAlt,
    borderColor: theme.colors.border,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusPendingText: {
    color: theme.colors.linkGreen,
  },
  statusUsedText: {
    color: theme.colors.primaryText,
    opacity: 0.8,
  },
  metaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.9,
    marginTop: 2,
  },
  totalText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  calendarModalCard: {
    borderRadius: theme.radii.md,
    overflow: 'hidden',
  },
});
