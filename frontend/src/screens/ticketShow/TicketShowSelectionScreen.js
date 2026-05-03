import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import PlaceholderScreen from '../shared/PlaceholderScreen';
import { theme } from '../../constants/theme';
import { formatLkr } from '../../constants/entryTickets';
import { TICKET_SHOW_MAX_PER_SHOW } from '../../constants/ticketShowCatalog';
import { getTicketCatalog } from '../../api/ticketBooking.api';
import { resolveUploadsFileUri } from '../../api/getApiBaseUrl';

const SHOW_SELECTION_HERO = require('../../../assets/images/ticket-show-selection-hero.png');
const FALLBACK_SHOW_IMAGE = require('../../../assets/images/show-reptile-encounter.png');
const SHOW_IMAGE_PATH_MAP = {
  'assets/images/show-birds-of-prey.png': require('../../../assets/images/show-birds-of-prey.png'),
  'assets/images/show-elephant-care-bath.png': require('../../../assets/images/show-elephant-care-bath.png'),
  'assets/images/show-sea-lion-splash.png': require('../../../assets/images/showsealionsplash.png'),
  'assets/images/show-reptile-encounter.png': require('../../../assets/images/show-reptile-encounter.png'),
};
const SHOW_IMAGES = {
  birds_of_prey: {
    image: require('../../../assets/images/show-birds-of-prey.png'),
    imageAccessibilityLabel: 'Zoo presenter with a large red and blue macaw',
  },
  elephant_care_bath: {
    image: require('../../../assets/images/show-elephant-care-bath.png'),
    imageAccessibilityLabel: 'Ceremonial elephant bath with people in traditional dress holding silver bowls',
  },
  sea_lion_splash: {
    image: require('../../../assets/images/showsealionsplash.png'),
    imageAccessibilityLabel: 'Sea lion balancing a volleyball on its nose above blue water',
  },
  reptile_encounter: {
    image: require('../../../assets/images/show-reptile-encounter.png'),
    imageAccessibilityLabel: 'Zookeeper presenting a large patterned snake outdoors',
  },
};

function resolveShowImageSource(imagePath, showCode) {
  const rawPath = String(imagePath || '').trim();
  if (!rawPath) {
    return SHOW_IMAGES[showCode]?.image || null;
  }

  // Built-in bundled assets (must be pre-declared in this static map).
  if (SHOW_IMAGE_PATH_MAP[rawPath]) {
    return SHOW_IMAGE_PATH_MAP[rawPath];
  }

  // Absolute URL from DB.
  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    return { uri: rawPath };
  }

  // Relative/static server paths from DB, e.g. /uploads/ticket-show/x.jpg.
  const uri = resolveUploadsFileUri(rawPath);
  return uri ? { uri } : null;
}

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
  const {
    code,
    name,
    priceLkr,
    image = FALLBACK_SHOW_IMAGE,
    imageAccessibilityLabel = 'Animal show image',
  } = show;
  const timeLabel = show.meta?.timeLabel || '-';

  const setQty = (next) => {
    const clamped = Math.max(0, Math.min(TICKET_SHOW_MAX_PER_SHOW, next));
    onChangeQuantity(code, clamped);
  };

  return (
    <View style={styles.tile}>
      <View style={styles.tileRow}>
        {image ? (
          <Image
            source={image}
            style={styles.thumb}
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel={imageAccessibilityLabel}
          />
        ) : (
          <View style={styles.thumbPlaceholder} accessibilityRole="image" accessibilityLabel="No show photo available">
            <Text style={styles.thumbPlaceholderText}>No photo</Text>
          </View>
        )}
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
  const route = useRoute();
  const [showCatalog, setShowCatalog] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [catalogLoading, setCatalogLoading] = useState(true);
  const entryBooking = route.params?.entryBooking;

  useEffect(() => {
    let mounted = true;
    (async () => {
      setCatalogLoading(true);
      try {
        const data = await getTicketCatalog();
        const shows = (data?.data?.shows ?? []).map((show) => ({
          ...show,
          image: resolveShowImageSource(show.meta?.imageUrl, show.code),
          imageAccessibilityLabel:
            SHOW_IMAGES[show.code]?.imageAccessibilityLabel || `${show.name} image`,
        }));
        if (!mounted) return;
        setShowCatalog(shows);
        setQuantities(Object.fromEntries(shows.map((item) => [item.code, 0])));
      } catch (error) {
        if (!mounted) return;
        Alert.alert('Shows', 'Unable to load show catalog. Please try again.');
      } finally {
        if (mounted) setCatalogLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const setShowQty = useCallback((id, value) => {
    setQuantities((q) => ({ ...q, [id]: value }));
  }, []);

  const showsSubtotalLkr = useMemo(() => {
    return showCatalog.reduce((sum, s) => sum + (quantities[s.code] || 0) * s.priceLkr, 0);
  }, [showCatalog, quantities]);

  const showItems = useMemo(
    () =>
      showCatalog
        .map((show) => ({ itemCode: show.code, quantity: quantities[show.code] || 0 }))
        .filter((item) => item.quantity > 0),
    [showCatalog, quantities]
  );

  const entrySubtotalLkr = entryBooking?.subtotalLkr ?? 0;
  const totalLkr = entrySubtotalLkr + showsSubtotalLkr;

  return (
    <PlaceholderScreen
      title="Select shows"
      imageSource={SHOW_SELECTION_HERO}
      imageAccessibilityLabel="Large outdoor show arena with tiered seating and performance lawn"
    >
      {catalogLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading shows...</Text>
        </View>
      ) : (
        <View style={styles.showList}>
          {showCatalog.map((show) => (
            <ShowSelectionRow
              key={show.code}
              show={show}
              quantity={quantities[show.code] ?? 0}
              onChangeQuantity={setShowQty}
            />
          ))}
        </View>
      )}

      <View style={styles.subtotalBlock}>
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Add-on shows subtotal</Text>
          <Text style={styles.subtotalValue}>{formatLkr(showsSubtotalLkr)}</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Proceed to checkout"
        onPress={() =>
          navigation.navigate('Payment', {
            visitDate: entryBooking?.visitDate,
            entryItems: entryBooking?.entryItems ?? [],
            showItems,
            entrySubtotalLkr,
            showsSubtotalLkr,
            totalLkr,
          })
        }
      >
        <Text style={styles.ctaButtonText}>Proceed to checkout</Text>
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
  loadingWrap: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
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
  thumbPlaceholder: {
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbPlaceholderText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.65,
    fontWeight: '600',
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
