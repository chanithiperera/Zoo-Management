import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  buildMonthGrid,
  formatMonthYear,
  getBookingDateBounds,
  isDateInBookingWindow,
  isSameDay,
  startOfDay,
} from '../../utils/visitCalendar';
import { theme } from '../../constants/theme';

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

/** Selected day fill — seafoam / teal aligned with reference */
const SELECTED_FILL = '#26A69A';

export default function VisitDateCalendar({
  visibleYear,
  visibleMonthIndex,
  onPrevMonth,
  onNextMonth,
  canGoPrevMonth,
  canGoNextMonth,
  selectedDate,
  onSelectDate,
  onClose,
  minDate,
  maxDate,
  showIntro = true,
}) {
  const grid = useMemo(
    () => buildMonthGrid(visibleYear, visibleMonthIndex),
    [visibleYear, visibleMonthIndex],
  );

  const bookingBounds = getBookingDateBounds();
  const min = minDate ? startOfDay(minDate) : bookingBounds.min;
  const max = maxDate ? startOfDay(maxDate) : bookingBounds.max;

  const cellEnabled = (date) => {
    const t = startOfDay(date);
    if (minDate || maxDate) {
      return t.getTime() >= min.getTime() && t.getTime() <= max.getTime();
    }
    return t.getTime() >= min.getTime() && t.getTime() <= max.getTime() && isDateInBookingWindow(date);
  };

  return (
    <View style={styles.wrap}>
      {showIntro ? (
        <View style={styles.topRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.titleLine1}>Let the fun begin!</Text>
            <Text style={styles.titleLine2}>When are you coming?</Text>
          </View>
          {onClose ? (
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
            >
              <MaterialCommunityIcons name="close" size={26} color={theme.colors.primaryText} />
            </Pressable>
          ) : (
            <View style={styles.closePlaceholder} />
          )}
        </View>
      ) : onClose ? (
        <View style={styles.headerCompact}>
          <View />
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={12}
          >
            <MaterialCommunityIcons name="close" size={26} color={theme.colors.primaryText} />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.monthNav}>
        <Pressable
          onPress={onPrevMonth}
          disabled={!canGoPrevMonth}
          style={({ pressed }) => [
            styles.monthArrow,
            !canGoPrevMonth && styles.monthArrowDisabled,
            pressed && canGoPrevMonth && styles.monthArrowPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <Text style={[styles.monthArrowText, !canGoPrevMonth && styles.monthArrowTextDisabled]}>{'<'}</Text>
        </Pressable>
        <Text style={styles.monthTitle}>{formatMonthYear(visibleYear, visibleMonthIndex)}</Text>
        <Pressable
          onPress={onNextMonth}
          disabled={!canGoNextMonth}
          style={({ pressed }) => [
            styles.monthArrow,
            !canGoNextMonth && styles.monthArrowDisabled,
            pressed && canGoNextMonth && styles.monthArrowPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <Text style={[styles.monthArrowText, !canGoNextMonth && styles.monthArrowTextDisabled]}>{'>'}</Text>
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((wd) => (
          <Text key={wd} style={styles.weekday}>
            {wd}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map((cell, idx) => {
          if (cell.type === 'pad') {
            return <View key={`pad-${idx}`} style={styles.cell} />;
          }
          const { date } = cell;
          const enabled = cellEnabled(date);
          const selected = selectedDate && isSameDay(date, selectedDate);
          const dayNum = date.getDate();

          return (
            <Pressable
              key={date.getTime()}
              disabled={!enabled}
              onPress={() => onSelectDate(date)}
              style={styles.cell}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: !enabled }}
              accessibilityLabel={`${dayNum} ${formatMonthYear(date.getFullYear(), date.getMonth())}`}
            >
              <View style={[styles.dayCircle, selected && styles.dayCircleSelected]}>
                <Text style={[styles.dayNum, !enabled && styles.dayNumDisabled, selected && styles.dayNumSelected]}>
                  {dayNum}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  headerCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  titleBlock: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  titleLine1: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 0.2,
  },
  titleLine2: {
    marginTop: 4,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 0.2,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  closeBtnPressed: {
    opacity: 0.65,
  },
  closePlaceholder: {
    width: 40,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  monthTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 0.5,
  },
  monthArrow: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    minWidth: 44,
    alignItems: 'center',
  },
  monthArrowDisabled: {
    opacity: 0.35,
  },
  monthArrowPressed: {
    opacity: 0.7,
  },
  monthArrowText: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.primaryText,
  },
  monthArrowTextDisabled: {
    color: theme.colors.border,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primaryText,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.2857%',
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: SELECTED_FILL,
  },
  dayNum: {
    fontSize: theme.fontSize.body,
    fontWeight: '600',
    color: theme.colors.black,
  },
  dayNumDisabled: {
    color: '#BDBDBD',
  },
  dayNumSelected: {
    color: theme.colors.white,
  },
});
