import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import VisitDateCalendar from '../../components/booking/VisitDateCalendar';
import {
  ENTRY_TICKET_TYPES,
  ENTRY_TICKET_MAX_PER_TYPE,
  formatLkr,
  initialEntryQuantities,
} from '../../constants/entryTickets';
import { theme } from '../../constants/theme';
import {
  getBookingDateBounds,
  isDateInBookingWindow,
  monthStartTs,
  startOfDay,
  toLocalDateKey,
} from '../../utils/visitCalendar';

const TICKET_BOOKING_HERO = require('../../../assets/images/ticket-booking-admit.png');

function QuantityRow({ label, unitPriceLabel, quantity, onDecrement, onIncrement, isLast }) {
  return (
    <View style={[styles.ticketRow, isLast && styles.rowLast]}>
      <View style={styles.ticketRowMain}>
        <Text style={styles.ticketLabel}>{label}</Text>
        <Text style={styles.unitPrice}>{unitPriceLabel}</Text>
      </View>
      <View style={styles.stepper}>
        <Pressable
          onPress={onDecrement}
          style={({ pressed }) => [styles.stepBtn, pressed && styles.stepBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={styles.qtyValue} accessibilityLabel={`${label} quantity ${quantity}`}>
          {quantity}
        </Text>
        <Pressable
          onPress={onIncrement}
          style={({ pressed }) => [styles.stepBtn, pressed && styles.stepBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function TicketBookingScreen() {
  const navigation = useNavigation();
  const { min, max } = getBookingDateBounds();

  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [visibleYear, setVisibleYear] = useState(() => new Date().getFullYear());
  const [visibleMonthIndex, setVisibleMonthIndex] = useState(() => new Date().getMonth());

  const [quantities, setQuantities] = useState(() => initialEntryQuantities());

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

  const subtotalLkr = useMemo(() => {
    return ENTRY_TICKET_TYPES.reduce((sum, t) => sum + (quantities[t.id] || 0) * t.priceLkr, 0);
  }, [quantities]);

  const setQty = (id, next) => {
    const clamped = Math.max(0, Math.min(ENTRY_TICKET_MAX_PER_TYPE, next));
    setQuantities((q) => ({ ...q, [id]: clamped }));
  };

  const onContinueToShows = () => {
    const any = ENTRY_TICKET_TYPES.some((t) => (quantities[t.id] || 0) > 0);
    if (!any) {
      Alert.alert('Entry tickets', 'Choose at least one entry ticket.');
      return;
    }
    if (!selectedDate || !isDateInBookingWindow(selectedDate)) {
      Alert.alert('Visit date', 'Choose a visit date from the calendar.');
      return;
    }
    navigation.navigate('TicketShowSelection', {
      entryBooking: {
        quantities,
        subtotalLkr,
        visitDate: toLocalDateKey(selectedDate),
      },
    });
  };

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.inner}>
        <View style={styles.calendarBlock}>
          <VisitDateCalendar
            visibleYear={visibleYear}
            visibleMonthIndex={visibleMonthIndex}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
            canGoPrevMonth={canGoPrevMonth}
            canGoNextMonth={canGoNextMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onClose={() => navigation.goBack()}
          />
        </View>

        <Image
          source={TICKET_BOOKING_HERO}
          style={styles.hero}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Zentra Zoo admission ticket illustration"
        />

        <View style={styles.section}>
          <View style={styles.sectionTopBar} />
          <Text style={styles.sectionTitle}>Entry tickets</Text>
          <Text style={styles.sectionHint}>Choose how many of each admission type you need.</Text>

          <View style={styles.rowsPanel}>
            {ENTRY_TICKET_TYPES.map((t, i) => (
              <QuantityRow
                key={t.id}
                label={t.label}
                unitPriceLabel={formatLkr(t.priceLkr)}
                quantity={quantities[t.id] ?? 0}
                onDecrement={() => setQty(t.id, (quantities[t.id] ?? 0) - 1)}
                onIncrement={() => setQty(t.id, (quantities[t.id] ?? 0) + 1)}
                isLast={i === ENTRY_TICKET_TYPES.length - 1}
              />
            ))}
          </View>

          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Subtotal</Text>
            <Text style={styles.subtotalValue}>{formatLkr(subtotalLkr)}</Text>
          </View>
        </View>

        <PrimaryButton title="Select shows" onPress={onContinueToShows} style={styles.cta} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inner: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm,
  },
  calendarBlock: {
    marginBottom: theme.spacing.md,
  },
  hero: {
    width: '100%',
    height: 200,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    shadowColor: '#0D2D1D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: theme.spacing.md,
  },
  section: {
    position: 'relative',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    shadowColor: '#0D2D1D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.colors.accentOrange,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    lineHeight: Math.round(theme.fontSize.lg * 1.25),
    marginBottom: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
  },
  sectionHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.78,
    marginBottom: theme.spacing.md,
    lineHeight: Math.round(theme.fontSize.sm * 1.45),
  },
  rowsPanel: {
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  ticketRowMain: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  ticketLabel: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  unitPrice: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.linkGreen,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBtn: {
    minWidth: 36,
    minHeight: 36,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnPressed: {
    opacity: 0.85,
  },
  stepBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primaryText,
    lineHeight: 22,
  },
  qtyValue: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  subtotalLabel: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  subtotalValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.accentGreen,
  },
  cta: {
    marginBottom: theme.spacing.md,
  },
});
