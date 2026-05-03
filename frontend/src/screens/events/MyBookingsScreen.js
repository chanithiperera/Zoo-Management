import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getMyBookings, cancelBooking } from "../../api/events.api";
import { popOrParentGoBack } from "../../utils/popOrParentGoBack";
import { theme } from "../../constants/theme";

const STATUS_CONFIG = {
  Pending: {
    color: theme.colors.accentOrange,
    bg: theme.colors.welcomeBackground,
    border: theme.colors.accentOrangeLight,
    label: "Pending",
  },
  Confirmed: {
    color: theme.colors.linkGreen,
    bg: theme.colors.welcomeBackground,
    border: theme.colors.sage,
    label: "Confirmed",
  },
  Rejected: {
    color: theme.colors.error,
    bg: "rgba(198, 40, 40, 0.08)",
    border: theme.colors.error,
    label: "Rejected",
  },
  Cancelled: {
    color: theme.colors.primaryText,
    bg: theme.colors.backgroundAlt,
    border: theme.colors.border,
    label: "Cancelled",
    muted: true,
  },
};

export default function MyBookingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await getMyBookings();
      setBookings(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchBookings);
    return unsubscribe;
  }, [navigation, fetchBookings]);

  const handleCancel = (bookingId) => {
    const booking = bookings.find((b) => b._id === bookingId);
    if (booking?.status !== "Pending") {
      Alert.alert("Not allowed", "You can only cancel bookings that are still pending.");
      return;
    }

    Alert.alert("Cancel booking", "Are you sure you want to cancel this booking?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, cancel",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelBooking(bookingId);
            fetchBookings();
            Alert.alert("Cancelled", "Your booking has been cancelled.");
          } catch (err) {
            Alert.alert("Error", err?.response?.data?.message || "Failed to cancel booking.");
          }
        },
      },
    ]);
  };

  const renderBooking = ({ item }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;
    const event = item.eventId;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="calendar" size={22} color={theme.colors.linkGreen} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.eventTitle} numberOfLines={1}>
              {event?.title || "Event"}
            </Text>
            <Text style={styles.eventVenue} numberOfLines={2}>
              {event?.venue} · {event?.eventType}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: cfg.bg, borderColor: cfg.border },
            ]}
          >
            <Text style={[styles.statusText, { color: cfg.color }, cfg.muted && { opacity: 0.75 }]}>
              {cfg.label || item.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailGrid}>
          <DetailItem
            label="Event date"
            value={new Date(item.eventDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          />
          <DetailItem label="Guests" value={`${item.guestCount} people`} />
          <DetailItem label="Total" value={`LKR ${item.totalPrice?.toLocaleString()}`} />
          <DetailItem label="Phone" value={item.contactPhone} />
        </View>

        {item.specialRequests ? (
          <View style={styles.requests}>
            <Text style={styles.requestsLabel}>Special requests</Text>
            <Text style={styles.requestsText}>{item.specialRequests}</Text>
          </View>
        ) : null}

        <Text style={styles.bookedOn}>Booked on {new Date(item.createdAt).toLocaleDateString("en-GB")}</Text>

        {item.status === "Pending" && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item._id)}>
            <Text style={styles.cancelBtnText}>Cancel booking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.backgroundAlt} />

      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <Pressable
          onPress={() => popOrParentGoBack(navigation)}
          style={styles.headerBackHit}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={theme.colors.primaryText} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          My bookings
        </Text>
        <View style={styles.headerRightSpacer} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.accentGreen} style={styles.loader} />
      ) : bookings.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.linkGreen} />
          </View>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyText}>Browse events and book your next visit.</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate("EventsList")}>
            <Text style={styles.browseBtnText}>Browse events</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchBookings();
              }}
              tintColor={theme.colors.accentGreen}
              colors={[theme.colors.accentGreen]}
            />
          }
        />
      )}
    </View>
  );
}

function DetailItem({ label, value }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundAlt },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.backgroundAlt,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  headerBackHit: {
    paddingVertical: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
    marginRight: theme.spacing.xs,
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.fontSize.title,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
  },
  headerRightSpacer: { width: 26, marginLeft: theme.spacing.sm },
  loader: { marginTop: theme.spacing.xl },
  list: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primaryText,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.sm + 4 },
  cardIcon: {
    backgroundColor: theme.colors.sageButton,
    borderRadius: theme.radii.sm,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  cardInfo: { flex: 1, minWidth: 0 },
  eventTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
  },
  eventVenue: {
    fontSize: theme.fontSize.sm - 1,
    color: theme.colors.primaryText,
    opacity: 0.62,
    marginTop: 4,
    fontFamily: theme.fonts.regular,
  },
  statusBadge: {
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: 6,
    borderWidth: 1,
    flexShrink: 0,
  },
  statusText: { fontSize: theme.fontSize.sm - 2, fontWeight: "700", fontFamily: theme.fonts.bold },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm + 4,
  },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm + 4 },
  detailItem: { width: "47%" },
  detailLabel: {
    fontSize: theme.fontSize.sm - 3,
    color: theme.colors.primaryText,
    opacity: 0.5,
    fontFamily: theme.fonts.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.primaryText,
    marginTop: 4,
  },
  requests: {
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm + 4,
    marginTop: theme.spacing.sm + 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  requestsLabel: {
    fontSize: theme.fontSize.sm - 2,
    color: theme.colors.linkGreen,
    marginBottom: 6,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
  requestsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    lineHeight: Math.round(theme.fontSize.sm * 1.45),
    fontFamily: theme.fonts.regular,
  },
  bookedOn: {
    fontSize: theme.fontSize.sm - 2,
    color: theme.colors.primaryText,
    opacity: 0.42,
    marginTop: theme.spacing.sm + 2,
    fontFamily: theme.fonts.regular,
  },
  cancelBtn: {
    marginTop: theme.spacing.sm + 4,
    paddingTop: theme.spacing.sm + 4,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: "center",
  },
  cancelBtnText: {
    color: theme.colors.error,
    fontWeight: "700",
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.bold,
    opacity: 0.92,
  },
  empty: { alignItems: "center", marginTop: theme.spacing.xl, paddingHorizontal: theme.spacing.lg },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.welcomeBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.55,
    textAlign: "center",
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  browseBtn: {
    backgroundColor: theme.colors.accentGreen,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 4,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.linkGreen,
  },
  browseBtnText: {
    color: theme.colors.white,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.sm,
  },
});
