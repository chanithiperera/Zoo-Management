import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getEventById } from "../../api/events.api";
import { popOrParentGoBack } from "../../utils/popOrParentGoBack";
import { resolveUploadsFileUri } from "../../api/getApiBaseUrl";
import { theme } from "../../constants/theme";

function placeholdHex(c) {
  return String(c || "").replace(/^#/, "");
}

function eventDetailPlaceholder() {
  const bg = placeholdHex(theme.colors.accentGreen);
  const fg = placeholdHex(theme.colors.white);
  return `https://placehold.co/400x300/${bg}/${fg}?text=Zoo+Event`;
}

function resolveEventHeroUri(event) {
  const rawImageUrl = event?.imageUrl;
  if (!rawImageUrl || typeof rawImageUrl !== "string") {
    return eventDetailPlaceholder();
  }
  const pathFix =
    rawImageUrl.startsWith("/uploads/") && !rawImageUrl.startsWith("/uploads/events/")
      ? rawImageUrl.replace("/uploads/", "/uploads/events/")
      : rawImageUrl;
  const base = rawImageUrl.startsWith("http")
    ? resolveUploadsFileUri(pathFix) || pathFix
    : resolveUploadsFileUri(pathFix);
  const cacheTs =
    event?.updatedAt || event?.createdAt ? new Date(event.updatedAt || event.createdAt).getTime() : Date.now();
  if (!base) return eventDetailPlaceholder();
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}t=${cacheTs}`;
}

const TYPE_ICONS = {
  All: "apps-outline",
  Wedding: "heart-outline",
  Birthday: "gift-outline",
  Corporate: "briefcase-outline",
  Anniversary: "sparkles-outline",
  Graduation: "school-outline",
  Other: "star-outline",
};

export default function EventDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getEventById(eventId);
        setEvent(res.data.data);
      } catch (err) {
        Alert.alert("Error", "Could not load event details.");
        popOrParentGoBack(navigation);
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId, navigation]);

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.accentGreen} />
      </View>
    );

  if (!event) return null;

  const resolvedImageUri = resolveEventHeroUri(event);
  const backTop = insets.top + theme.spacing.sm;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.backgroundAlt} />

      <TouchableOpacity
        style={[styles.backBtn, { top: backTop }]}
        onPress={() => popOrParentGoBack(navigation)}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color={theme.colors.linkGreen} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: resolvedImageUri }} style={styles.heroImage} resizeMode="cover" />
        </View>

        <View style={styles.typeBadgeRow}>
          <View style={styles.typeBadge}>
            <Ionicons name={TYPE_ICONS[event.eventType] || "star-outline"} size={13} color={theme.colors.linkGreen} />
            <Text style={styles.typeBadgeText}>{event.eventType}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCard}>
            <Ionicons name="time-outline" size={22} color={theme.colors.accentGreen} />
            <Text style={styles.metaValue}>{event.duration || "Full Day"}</Text>
            <Text style={styles.metaLabel}>Duration</Text>
          </View>
          <View style={styles.metaCard}>
            <Ionicons name="people-outline" size={22} color={theme.colors.accentGreen} />
            <Text style={styles.metaValue}>Max {event.capacity}</Text>
            <Text style={styles.metaLabel}>Guests</Text>
          </View>
          <View style={styles.metaCard}>
            <Ionicons name="cash-outline" size={22} color={theme.colors.accentGreen} />
            <Text style={styles.metaValue}>LKR {event.pricePerPerson?.toLocaleString()}</Text>
            <Text style={styles.metaLabel}>Per person</Text>
          </View>
        </View>

        {event.includes?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's included</Text>
            <View style={styles.includeGrid}>
              {event.includes.map((inc, i) => (
                <View key={i} style={styles.includePill}>
                  <Ionicons name="checkmark" size={13} color={theme.colors.linkGreen} />
                  <Text style={styles.includePillText}>{inc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Venue</Text>
          <View style={styles.venueRow}>
            <Ionicons name="location-outline" size={18} color={theme.colors.accentGreen} />
            <Text style={styles.venueText}>{event.venue}</Text>
          </View>
        </View>

        {event.requirements ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <Text style={styles.description}>{event.requirements}</Text>
          </View>
        ) : null}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, theme.spacing.md) + theme.spacing.sm }]}>
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.priceValue}>
            LKR {event.pricePerPerson?.toLocaleString()}
            <Text style={styles.pricePerPerson}> /person</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate("EventBooking", { event })}
          accessibilityRole="button"
          accessibilityLabel="Book this event"
        >
          <Text style={styles.bookBtnText}>Book this event</Text>
          <Ionicons name="arrow-forward" size={18} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.backgroundAlt },
  backBtn: {
    position: "absolute",
    left: theme.spacing.md,
    zIndex: 10,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.pill,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 3,
    shadowColor: theme.colors.primaryText,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  scroll: { paddingBottom: theme.spacing.md },
  imageWrapper: { width: "100%", height: 280, backgroundColor: theme.colors.welcomeBackground },
  heroImage: { width: "100%", height: "100%" },
  typeBadgeRow: {
    alignItems: "center",
    marginTop: -18,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.sageButton,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: theme.colors.sage,
    elevation: 2,
    shadowColor: theme.colors.primaryText,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  typeBadgeText: {
    color: theme.colors.primaryText,
    fontWeight: "700",
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.bold,
  },
  section: { paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.lg },
  title: {
    fontSize: theme.fontSize.hero - 2,
    fontWeight: "800",
    fontFamily: theme.fonts.extraBold,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.68,
    lineHeight: Math.round(theme.fontSize.sm * 1.5),
    fontFamily: theme.fonts.regular,
  },
  sectionTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    color: theme.colors.linkGreen,
    marginBottom: theme.spacing.sm + 2,
  },
  metaRow: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm + 2,
    marginTop: theme.spacing.lg,
  },
  metaCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md - 2,
    padding: theme.spacing.sm + 6,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primaryText,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  metaValue: {
    fontSize: theme.fontSize.sm - 1,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
    textAlign: "center",
  },
  metaLabel: {
    fontSize: theme.fontSize.sm - 3,
    color: theme.colors.primaryText,
    opacity: 0.5,
    fontFamily: theme.fonts.semiBold,
  },
  includeGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  includePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.sm + 4,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  includePillText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    fontWeight: "600",
    fontFamily: theme.fonts.semiBold,
  },
  venueRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  venueText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.85,
    flex: 1,
    fontFamily: theme.fonts.regular,
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm + 6,
    elevation: 12,
    shadowColor: theme.colors.primaryText,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  },
  priceBlock: {},
  priceLabel: {
    fontSize: theme.fontSize.sm - 2,
    color: theme.colors.primaryText,
    opacity: 0.5,
    fontFamily: theme.fonts.semiBold,
  },
  priceValue: {
    fontSize: theme.fontSize.title - 2,
    fontWeight: "800",
    fontFamily: theme.fonts.extraBold,
    color: theme.colors.primaryText,
  },
  pricePerPerson: {
    fontSize: theme.fontSize.sm - 1,
    fontWeight: "400",
    fontFamily: theme.fonts.regular,
    color: theme.colors.primaryText,
    opacity: 0.5,
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.accentGreen,
    borderRadius: theme.radii.md - 2,
    paddingHorizontal: theme.spacing.lg - 2,
    paddingVertical: theme.spacing.sm + 6,
    borderWidth: 1,
    borderColor: theme.colors.linkGreen,
  },
  bookBtnText: {
    color: theme.colors.white,
    fontWeight: "800",
    fontSize: theme.fontSize.sm + 1,
    fontFamily: theme.fonts.extraBold,
  },
});
