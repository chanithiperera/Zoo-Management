import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllBookings, updateBookingStatus } from "../../../api/events.api";
import { popOrParentGoBack } from "../../../utils/popOrParentGoBack";
import { theme } from "../../../constants/theme";

const STATUS_FILTERS = ["All", "Pending", "Confirmed", "Rejected", "Cancelled"];

const STATUS_CONFIG = {
  Pending: {
    color: theme.colors.accentOrange,
    bg: theme.colors.welcomeBackground,
    border: theme.colors.accentOrangeLight,
  },
  Confirmed: {
    color: theme.colors.linkGreen,
    bg: theme.colors.welcomeBackground,
    border: theme.colors.sage,
  },
  Rejected: {
    color: theme.colors.error,
    bg: "rgba(198, 40, 40, 0.08)",
    border: theme.colors.error,
  },
  Cancelled: {
    color: theme.colors.primaryText,
    bg: theme.colors.welcomeBackground,
    border: theme.colors.border,
    muted: true,
  },
};

export default function AdminEventBookingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      const params = selectedStatus !== "All" ? { status: selectedStatus } : {};
      const res = await getAllBookings(params);
      setBookings(res.data.data);
    } catch (err) {
      Alert.alert("Error", "Failed to load bookings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    setLoading(true);
    fetchBookings();
  }, [fetchBookings]);

  const handleStatus = async (bookingId, status) => {
    setUpdatingId(bookingId + status);
    try {
      await updateBookingStatus(bookingId, status);
      await fetchBookings();
      Alert.alert(
        status === "Confirmed" ? "Approved" : "Rejected",
        `The booking has been ${status.toLowerCase()} successfully.`
      );
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to update booking.");
    } finally {
      setUpdatingId(null);
    }
  };

  const renderBooking = ({ item }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;
    const event = item.eventId;
    const user = item.userId;
    const isApprovingThis = updatingId === item._id + "Confirmed";
    const isRejectingThis = updatingId === item._id + "Rejected";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {event?.title || "Event"}
            </Text>
            <Text style={styles.eventType} numberOfLines={2}>
              {event?.eventType} · {event?.venue}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
            <Text style={[styles.statusText, { color: cfg.color }, cfg.muted && styles.statusTextMuted]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.userBlock}>
          <Text style={styles.userLabel}>Guest</Text>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userEmail} numberOfLines={2}>
            {user?.email}
          </Text>
        </View>

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

        <Text style={styles.bookedOn}>
          Booked on {new Date(item.createdAt).toLocaleDateString("en-GB")}
        </Text>

        {item.status === "Pending" && (
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [styles.approveBtn, pressed && { opacity: 0.88 }]}
              onPress={() => handleStatus(item._id, "Confirmed")}
              disabled={!!updatingId}
            >
              {isApprovingThis ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <Text style={styles.approveBtnText}>Approve</Text>
              )}
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.rejectBtn,
                pressed && { backgroundColor: theme.colors.welcomeBackground },
              ]}
              onPress={() => handleStatus(item._id, "Rejected")}
              disabled={!!updatingId}
            >
              {isRejectingThis ? (
                <ActivityIndicator size="small" color={theme.colors.error} />
              ) : (
                <Text style={styles.rejectBtnText}>Reject</Text>
              )}
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const filterChips = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterScroll}
      contentContainerStyle={styles.filterList}
    >
      {STATUS_FILTERS.map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.filterChip, selectedStatus === item && styles.filterChipActive]}
          onPress={() => setSelectedStatus(item)}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedStatus === item }}
        >
          <Text style={[styles.filterChipText, selectedStatus === item && styles.filterChipTextActive]}>{item}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const listHeader = (
    <View style={styles.listHeaderInner}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Booking requests</Text>
        <Text style={styles.heroSub}>Review dates, guest counts, and approve or reject each request.</Text>
      </View>
      {filterChips}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.backgroundAlt} />

      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
        <TouchableOpacity
          onPress={() => popOrParentGoBack(navigation)}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Booking Requests</Text>
          <Text style={styles.headerSub}>Manage event bookings</Text>
        </View>
      </View>

      {listHeader}

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.accentGreen} style={styles.loader} />
      ) : bookings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No bookings found</Text>
          <Text style={styles.emptySub}>Try another filter or check back later.</Text>
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
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  backBtn: { paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.xs },
  backText: {
    fontSize: theme.fontSize.body,
    fontWeight: "600",
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.linkGreen,
  },
  headerTextCol: { flex: 1 },
  headerTitle: {
    fontSize: theme.fontSize.title - 2,
    fontWeight: "800",
    fontFamily: theme.fonts.extraBold,
    color: theme.colors.primaryText,
  },
  headerSub: {
    marginTop: 2,
    fontSize: theme.fontSize.sm - 1,
    color: theme.colors.primaryText,
    opacity: 0.62,
    fontFamily: theme.fonts.semiBold,
  },
  listHeaderInner: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
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
    marginBottom: theme.spacing.md,
  },
  heroTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
  },
  heroSub: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.72,
    lineHeight: Math.round(theme.fontSize.sm * 1.45),
    fontFamily: theme.fonts.regular,
  },
  filterScroll: { flexGrow: 0 },
  filterList: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    alignItems: "center",
    paddingBottom: theme.spacing.xs,
    paddingRight: theme.spacing.md,
  },
  filterChip: {
    height: 36,
    borderWidth: 1.5,
    borderColor: theme.colors.sage,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md - 2,
    justifyContent: "center",
    backgroundColor: theme.colors.white,
  },
  filterChipActive: {
    backgroundColor: theme.colors.accentGreen,
    borderColor: theme.colors.linkGreen,
  },
  filterChipText: {
    fontSize: theme.fontSize.sm - 1,
    color: theme.colors.linkGreen,
    fontWeight: "600",
    fontFamily: theme.fonts.semiBold,
  },
  filterChipTextActive: {
    color: theme.colors.white,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
  list: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.lg, gap: theme.spacing.md },
  loader: { marginTop: theme.spacing.xl },
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  cardInfo: { flex: 1, minWidth: 0, paddingRight: theme.spacing.xs },
  eventTitle: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
  },
  eventType: {
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
  statusTextMuted: { opacity: 0.72 },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm + 2,
  },
  userBlock: {
    marginBottom: theme.spacing.sm + 2,
  },
  userLabel: {
    fontSize: theme.fontSize.sm - 3,
    color: theme.colors.primaryText,
    opacity: 0.5,
    fontFamily: theme.fonts.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.35,
    marginBottom: 4,
  },
  userName: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
  },
  userEmail: {
    fontSize: theme.fontSize.sm - 1,
    color: theme.colors.primaryText,
    opacity: 0.58,
    marginTop: 4,
    fontFamily: theme.fonts.regular,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm + 2,
    marginBottom: theme.spacing.sm,
  },
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
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  requestsLabel: {
    fontSize: theme.fontSize.sm - 2,
    color: theme.colors.primaryText,
    opacity: 0.72,
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
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  actionRow: { flexDirection: "row", gap: theme.spacing.sm + 2, marginTop: 2 },
  approveBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accentGreen,
    borderRadius: theme.radii.sm,
    paddingVertical: theme.spacing.sm + 4,
    borderWidth: 1,
    borderColor: theme.colors.linkGreen,
    minHeight: 44,
  },
  approveBtnText: {
    color: theme.colors.white,
    fontWeight: "700",
    fontSize: theme.fontSize.body,
    fontFamily: theme.fonts.bold,
  },
  rejectBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.sm,
    paddingVertical: theme.spacing.sm + 4,
    borderWidth: 1.5,
    borderColor: theme.colors.sage,
    minHeight: 44,
  },
  rejectBtnText: {
    color: theme.colors.error,
    fontWeight: "700",
    fontSize: theme.fontSize.body,
    fontFamily: theme.fonts.bold,
    opacity: 0.92,
  },
  empty: { alignItems: "center", marginTop: theme.spacing.xl, paddingHorizontal: theme.spacing.lg },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
  },
  emptySub: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.55,
    marginTop: theme.spacing.sm,
    textAlign: "center",
    fontFamily: theme.fonts.regular,
  },
});
