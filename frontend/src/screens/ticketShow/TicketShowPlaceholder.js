import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { formatLkr } from '../../constants/entryTickets';
import { theme } from '../../constants/theme';
import { getTicketCatalog } from '../../api/ticketBooking.api';

const TICKET_ROTATE = '-38deg';

/** Wide zoo entrance banner; file lives at `frontend/assets/images/ticket-zoo-hero.png`. */
const TICKET_HERO = require('../../../assets/images/ticket-zoo-hero.png');

function InstructionSection({ title, variant, children }) {
  return (
    <View style={styles.section}>
      <View style={[styles.sectionTopBar, variant === 'entry' ? styles.sectionTopBarEntry : styles.sectionTopBarShows]} />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function PriceRow({ label, value, isLast, zebra }) {
  return (
    <View style={[styles.priceRow, zebra && styles.rowZebra, isLast && styles.rowLast]}>
      <Text style={styles.priceLabel}>{label}</Text>
      <View style={styles.priceValueWrap}>
        <Text style={styles.priceValue}>{value}</Text>
      </View>
    </View>
  );
}

function ShowRow({ name, time, price, isLast, zebra }) {
  return (
    <View style={[styles.showRow, zebra && styles.rowZebraShow, isLast && styles.rowLast]}>
      <View style={styles.showRowMain}>
        <Text style={styles.showName}>{name}</Text>
        <View style={styles.timeChip}>
          <Text style={styles.timeChipText}>{time}</Text>
        </View>
      </View>
      <Text style={styles.showPrice}>{price}</Text>
    </View>
  );
}

function BookNowButton({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.bookNowOuter, pressed && styles.bookNowPressed]}
      accessibilityRole="button"
      accessibilityLabel="Book now"
    >
      <View style={styles.bookNowIconWrap}>
        <View style={styles.bookNowIconTilt}>
          <MaterialCommunityIcons name="ticket-confirmation" size={30} color={theme.colors.primaryText} />
        </View>
      </View>
      <View style={styles.bookNowTextCol}>
        <Text style={styles.bookNowLine1}>book</Text>
        <Text style={styles.bookNowLine2}>Now</Text>
      </View>
      <View style={styles.bookNowIconWrap}>
        <View style={styles.bookNowIconTilt}>
          <MaterialCommunityIcons name="ticket-confirmation" size={30} color={theme.colors.primaryText} />
        </View>
      </View>
    </Pressable>
  );
}

function GroupBookingButton({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.groupBookingOuter, pressed && styles.groupBookingPressed]}
      accessibilityRole="button"
      accessibilityLabel="Group booking for 20 or more people"
    >
      <View style={styles.groupBookingIconWrap}>
        <MaterialCommunityIcons name="account-group" size={26} color={theme.colors.linkGreen} />
      </View>
      <View style={styles.groupBookingTextCol}>
        <Text style={styles.groupBookingTitle}>Group booking (20+ people)</Text>
        <Text style={styles.groupBookingSubtitle}>
          Schools, tour groups & companies. Officer will contact you after review.
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={26}
        color={theme.colors.linkGreen}
        style={styles.groupBookingChevron}
      />
    </Pressable>
  );
}

export default function TicketShowPlaceholder() {
  const navigation = useNavigation();
  const [entryRows, setEntryRows] = useState([]);
  const [showRows, setShowRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getTicketCatalog();
        if (!mounted) return;
        const entries = data?.data?.entryTickets ?? [];
        const shows = data?.data?.shows ?? [];
        setEntryRows(
          entries.map((ticket) => ({
            label: ticket.name,
            price: formatLkr(ticket.priceLkr),
          }))
        );
        setShowRows(
          shows.map((show) => ({
            name: show.name,
            time: show.meta?.timeLabel || '-',
            price: formatLkr(show.priceLkr),
          }))
        );
      } catch (error) {
        if (!mounted) return;
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.inner}>
        <Image
          source={TICKET_HERO}
          style={styles.hero}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel="Zoo entrance illustration"
        />
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Entry Tickets and Show Booking</Text>
          <View style={styles.titleUnderline} />
        </View>

        <Text style={styles.intro}>
          Use this guide for day admission and add-on show tickets.
        </Text>

        <InstructionSection title="Entry ticket prices (per person)" variant="entry">
          <View style={styles.rowsPanel}>
            {entryRows.map((row, i) => (
              <PriceRow
                key={row.label}
                label={row.label}
                value={row.price}
                isLast={i === entryRows.length - 1}
                zebra={i % 2 === 1}
              />
            ))}
          </View>
        </InstructionSection>

        <InstructionSection title="Animal shows (per seat)" variant="shows">
          <View style={styles.rowsPanel}>
            {showRows.map((row, i) => (
              <ShowRow
                key={row.name}
                name={row.name}
                time={row.time}
                price={row.price}
                isLast={i === showRows.length - 1}
                zebra={i % 2 === 1}
              />
            ))}
          </View>
        </InstructionSection>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Loading latest ticket catalog...</Text>
          </View>
        ) : null}

        <View style={styles.bookNowSlot}>
          <BookNowButton onPress={() => navigation.navigate('TicketBooking')} />
          <GroupBookingButton onPress={() => navigation.navigate('GroupBookingRequest')} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inner: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xs,
  },
  hero: {
    width: '100%',
    height: 188,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    shadowColor: '#0D2D1D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  titleUnderline: {
    marginTop: theme.spacing.sm,
    width: 56,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.accentGreen,
    opacity: 0.85,
  },
  intro: {
    fontSize: theme.fontSize.body,
    lineHeight: Math.round(theme.fontSize.body * 1.45),
    color: theme.colors.primaryText,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
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
  },
  /** Orange strip — only for the entry ticket prices block */
  sectionTopBarEntry: {
    backgroundColor: theme.colors.accentOrange,
  },
  /** Yellow strip — animal shows (same accent as earlier amber bar) */
  sectionTopBarShows: {
    backgroundColor: theme.colors.yellowAlt,
    opacity: 1,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
    paddingTop: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    lineHeight: Math.round(theme.fontSize.lg * 1.25),
  },
  sectionHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.78,
    marginBottom: theme.spacing.md,
    lineHeight: Math.round(theme.fontSize.sm * 1.45),
    fontStyle: 'italic',
    paddingHorizontal: theme.spacing.xs,
  },
  rowsPanel: {
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  rowZebra: {
    backgroundColor: theme.colors.backgroundAlt,
  },
  rowZebraShow: {
    backgroundColor: 'rgba(236, 243, 236, 0.85)',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  priceLabel: {
    flex: 1,
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
    paddingRight: theme.spacing.sm,
  },
  priceValueWrap: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  priceValue: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    letterSpacing: 0.3,
  },
  showRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  showRowMain: { flex: 1, paddingRight: theme.spacing.sm },
  showName: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
    letterSpacing: 0.15,
  },
  timeChip: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.yellowAlt,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(13, 45, 29, 0.12)',
  },
  timeChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.primaryText,
    letterSpacing: 0.2,
  },
  showPrice: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.accentGreen,
    marginTop: 2,
  },
  bookNowSlot: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  loadingWrap: {
    marginTop: theme.spacing.sm,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
  },
  bookNowOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.yellow,
    borderRadius: 26,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 72,
    shadowColor: '#0D2D1D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  bookNowPressed: {
    opacity: 0.92,
  },
  bookNowIconWrap: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNowIconTilt: {
    transform: [{ rotate: TICKET_ROTATE }],
  },
  bookNowTextCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  bookNowLine1: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primaryText,
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  bookNowLine2: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primaryText,
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  groupBookingOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: theme.colors.sage,
    shadowColor: '#0D2D1D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: theme.spacing.sm,
  },
  groupBookingPressed: {
    opacity: 0.92,
    backgroundColor: theme.colors.backgroundAlt,
  },
  groupBookingIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  groupBookingTextCol: {
    flex: 1,
    minWidth: 0,
  },
  groupBookingTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '800',
    color: theme.colors.linkGreen,
    letterSpacing: 0.2,
  },
  groupBookingSubtitle: {
    marginTop: 2,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.78,
    lineHeight: theme.fontSize.sm * 1.35,
  },
  groupBookingChevron: {
    marginLeft: theme.spacing.xs,
  },
});
