import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PlaceholderScreen from '../shared/PlaceholderScreen';
import { theme } from '../../constants/theme';
import { formatLkr } from '../../constants/entryTickets';
import {
  TICKET_SHOW_CATALOG,
  TICKET_SHOW_MAX_PER_SHOW,
  initialTicketShowQuantities,
} from '../../constants/ticketShowCatalog';

const SHOW_SELECTION_HERO = require('../../../assets/images/ticket-show-selection-hero.png');

function ShowQuantityStepper({ quantity, onDecrement, onIncrement, label }) {
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={onDecrement}
        style={({ pressed }) => [styles.stepBtn, pressed && styles.stepBtnPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label} quantity`}
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
        accessibilityLabel={`Increase ${label} quantity`}
      >
        <Text style={styles.stepBtnText}>+</Text>
      </Pressable>
    </View>
  );
}

function ShowSelectionRow({ show, quantity, onChangeQuantity }) {
  const { id, name, timeLabel, priceLkr, image, imageAccessibilityLabel } = show;

  const setQty = (next) => {
    const clamped = Math.max(0, Math.min(TICKET_SHOW_MAX_PER_SHOW, next));
    onChangeQuantity(id, clamped);
  };

  return (
    <View style={styles.tile}>
      <View style={styles.tileRow}>
        <Image
          source={image}
          style={styles.thumb}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={imageAccessibilityLabel}
        />
        <View style={styles.tileBody}>
          <Text style={styles.tileTitle}>{name}</Text>
          <View style={styles.tileTimesWrap} accessible={false}>
            <Text style={styles.tileTimes}>{timeLabel}</Text>
          </View>
          <Text style={styles.tilePrice}>{formatLkr(priceLkr)} each</Text>
          <View style={styles.qtyRow}>
            <Text style={styles.qtyHint}>Tickets</Text>
            <ShowQuantityStepper
              label={name}
              quantity={quantity}
              onDecrement={() => setQty(quantity - 1)}
              onIncrement={() => setQty(quantity + 1)}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

/** Add-on show ticket quantities before checkout. */
export default function TicketShowSelectionScreen() {
  const navigation = useNavigation();
  const [quantities, setQuantities] = useState(() => initialTicketShowQuantities());

  const setShowQty = useCallback((id, value) => {
    setQuantities((q) => ({ ...q, [id]: value }));
  }, []);

  const showsSubtotalLkr = useMemo(() => {
    return TICKET_SHOW_CATALOG.reduce((sum, s) => sum + (quantities[s.id] || 0) * s.priceLkr, 0);
  }, [quantities]);

  return (
    <PlaceholderScreen
      title="Select shows"
      imageSource={SHOW_SELECTION_HERO}
      imageAccessibilityLabel="Large outdoor show arena with tiered seating and performance lawn"
    >
      <View style={styles.showList}>
        {TICKET_SHOW_CATALOG.map((show) => (
          <ShowSelectionRow
            key={show.id}
            show={show}
            quantity={quantities[show.id] ?? 0}
            onChangeQuantity={setShowQty}
          />
        ))}
      </View>

      <View style={styles.subtotalBlock}>
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Add-on shows subtotal</Text>
          <Text style={styles.subtotalValue}>{formatLkr(showsSubtotalLkr)}</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Proceed to payment"
        onPress={() => navigation.navigate('Payment')}
      >
        <Text style={styles.ctaButtonText}>Proceed to payment</Text>
      </Pressable>
    </PlaceholderScreen>
  );
}

const THUMB_W = 144;
const THUMB_H = 108;

const styles = StyleSheet.create({
  showList: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  tile: {
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    overflow: 'hidden',
    shadowColor: '#0D2D1D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    padding: theme.spacing.sm,
  },
  tileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  thumb: {
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tileBody: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    minWidth: 0,
  },
  tileTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    marginBottom: 2,
  },
  tileTimesWrap: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.yellow,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.yellowAlt,
  },
  tileTimes: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
    lineHeight: Math.round(theme.fontSize.body * 1.35),
  },
  tilePrice: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.primaryText,
    letterSpacing: 0.2,
    marginBottom: theme.spacing.xs,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  qtyHint: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primaryText,
    opacity: 0.75,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBtn: {
    minWidth: 32,
    minHeight: 32,
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
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primaryText,
    lineHeight: 20,
  },
  qtyValue: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  subtotalBlock: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.sage,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtotalLabel: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  subtotalValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.accentGreen,
  },
  ctaButton: {
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.yellow,
    borderWidth: 1,
    borderColor: theme.colors.yellowAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonPressed: {
    opacity: 0.92,
  },
  ctaButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.primaryText,
    letterSpacing: 0.3,
  },
});
