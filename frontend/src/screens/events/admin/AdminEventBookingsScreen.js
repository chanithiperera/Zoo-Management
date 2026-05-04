import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Pressable,
  StyleSheet, ActivityIndicator, Alert, RefreshControl, StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAllBookings, updateBookingStatus } from "../../../api/events.api";

const STATUS_FILTERS = ["All", "Pending", "Confirmed", "Rejected", "Cancelled"];

const STATUS_CONFIG = {
  Pending:   { color: "#F4A261", bg: "#FFF3E8", icon: "time-outline" },
  Confirmed: { color: "#2D6A4F", bg: "#D8F3DC", icon: "checkmark-circle-outline" },
  Rejected:  { color: "#E63946", bg: "#FFE8EA", icon: "close-circle-outline" },
  Cancelled: { color: "#888",    bg: "#F2F2F2", icon: "ban-outline" },
};

export default function AdminEventBookingsScreen({ navigation }) {
  const [bookings,       setBookings]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [updatingId,     setUpdatingId]     = useState(null);

  const pendingCount = bookings.filter(b => b.status === "Pending").length;

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

  useEffect(() => { setLoading(true); fetchBookings(); }, [fetchBookings]);

  // ── Direct async call — no Alert wrapper to avoid Android FlatList issue ──
  const handleStatus = async (bookingId, status) => {
    setUpdatingId(bookingId + status);
    try {
      await updateBookingStatus(bookingId, status);
      await fetchBookings();
      Alert.alert(
        status === "Confirmed" ? "✅ Approved!" : "❌ Rejected",
        `Booking has been ${status.toLowerCase()} successfully.`
      );
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to update booking.");
    } finally {
      setUpdatingId(null);
    }
  };

  const renderBooking = ({ item }) => {
    const cfg   = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;
    const event = item.eventId;
    const user  = item.userId;
    const isApprovingThis = updatingId === item._id + "Confirmed";
    const isRejectingThis = updatingId === item._id + "Rejected";

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.eventIconBox}>
            <Ionicons name="calendar" size={20} color="#2D6A4F" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.eventTitle} numberOfLines={1}>{event?.title || "Event"}</Text>
            <Text style={styles.eventType}>{event?.eventType} · {event?.venue}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={11} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* User Info */}
        <View style={styles.userRow}>
          <Ionicons name="person-outline" size={13} color="#2D6A4F" />
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Details Grid */}
        <View style={styles.detailGrid}>
          <DetailItem icon="calendar-outline" label="Event Date"
            value={new Date(item.eventDate).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric"
            })} />
          <DetailItem icon="people-outline" label="Guests"  value={`${item.guestCount} people`} />
          <DetailItem icon="cash-outline"   label="Total"   value={`LKR ${item.totalPrice?.toLocaleString()}`} />
          <DetailItem icon="call-outline"   label="Phone"   value={item.contactPhone} />
        </View>

        {item.specialRequests ? (
          <View style={styles.requests}>
            <Text style={styles.requestsLabel}>Special Requests:</Text>
            <Text style={styles.requestsText}>{item.specialRequests}</Text>
          </View>
        ) : null}

        <Text style={styles.bookedOn}>
          Booked on {new Date(item.createdAt).toLocaleDateString("en-GB")}
        </Text>

        {/* Approve / Reject — using Pressable to fix Android FlatList issue */}
        {item.status === "Pending" && (
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [styles.approveBtn, pressed && { opacity: 0.8 }]}
              onPress={() => handleStatus(item._id, "Confirmed")}
              disabled={!!updatingId}
            >
              {isApprovingThis
                ? <ActivityIndicator size="small" color="#fff" />
                : <>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </>
              }
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.rejectBtn, pressed && { opacity: 0.8 }]}
              onPress={() => handleStatus(item._id, "Rejected")}
              disabled={!!updatingId}
            >
              {isRejectingThis
                ? <ActivityIndicator size="small" color="#fff" />
                : <>
                    <Ionicons name="close" size={16} color="#fff" />
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </>
              }
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F7F4" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1B4332" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Booking Requests</Text>
          <Text style={styles.headerSub}>Manage event bookings</Text>
        </View>
        {pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount} Pending</Text>
          </View>
        )}
      </View>

      {/* Status Filter */}
      <FlatList
        data={STATUS_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        style={styles.filterWrapper}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, selectedStatus === item && styles.filterChipActive]}
            onPress={() => setSelectedStatus(item)}
          >
            <Text style={[styles.filterChipText, selectedStatus === item && styles.filterChipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#2D6A4F" style={{ marginTop: 60 }} />
      ) : bookings.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No bookings found</Text>
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
              onRefresh={() => { setRefreshing(true); fetchBookings(); }}
              tintColor="#2D6A4F"
            />
          }
        />
      )}
    </View>
  );
}

const DetailItem = ({ icon, label, value }) => (
  <View style={styles.detailItem}>
    <Ionicons name={icon} size={12} color="#2D6A4F" />
    <View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F7F4" },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#1B4332" },
  headerSub: { fontSize: 12, color: "#52796F" },
  pendingBadge: {
    backgroundColor: "#F4A261", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  pendingBadgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  filterWrapper: { flexGrow: 0 },
  filterList: { paddingHorizontal: 16, paddingBottom: 10, gap: 8, alignItems: "center" },
  filterChip: {
    height: 34, borderWidth: 1.5, borderColor: "#2D6A4F", borderRadius: 20,
    paddingHorizontal: 14, justifyContent: "center", backgroundColor: "#fff",
  },
  filterChipActive: { backgroundColor: "#2D6A4F" },
  filterChipText: { fontSize: 12, color: "#2D6A4F", fontWeight: "600" },
  filterChipTextActive: { color: "#fff" },
  list: { paddingHorizontal: 16, paddingBottom: 20, gap: 14 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.06,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  eventIconBox: {
    backgroundColor: "#D8F3DC", borderRadius: 10,
    width: 42, height: 42, alignItems: "center", justifyContent: "center",
  },
  cardInfo: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: "700", color: "#1B4332" },
  eventType: { fontSize: 11, color: "#52796F", marginTop: 2 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#F0F7F4", marginVertical: 10 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  userName: { fontSize: 13, fontWeight: "700", color: "#1B4332" },
  userEmail: { fontSize: 11, color: "#888" },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
  detailItem: { flexDirection: "row", alignItems: "flex-start", gap: 5, width: "47%" },
  detailLabel: { fontSize: 10, color: "#888" },
  detailValue: { fontSize: 12, fontWeight: "600", color: "#222" },
  requests: {
    backgroundColor: "#F0F7F4", borderRadius: 10,
    padding: 10, marginBottom: 8,
  },
  requestsLabel: { fontSize: 11, color: "#888", marginBottom: 3 },
  requestsText: { fontSize: 12, color: "#333" },
  bookedOn: { fontSize: 11, color: "#aaa", marginBottom: 8 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  approveBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, backgroundColor: "#2D6A4F", borderRadius: 10, paddingVertical: 12,
  },
  approveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  rejectBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, backgroundColor: "#E63946", borderRadius: 10, paddingVertical: 12,
  },
  rejectBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  empty: { alignItems: "center", marginTop: 80 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#555", marginTop: 16 },
});