import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getMyBookings, cancelBooking } from "../../api/events.api";

const STATUS_CONFIG = {
  Pending:   { color: "#F4A261", bg: "#FFF3E8", icon: "time-outline",             label: "Pending" },
  Confirmed: { color: "#2D6A4F", bg: "#D8F3DC", icon: "checkmark-circle",         label: "Confirmed ✓" },
  Rejected:  { color: "#E63946", bg: "#FFE8EA", icon: "close-circle",             label: "Rejected" },
  Cancelled: { color: "#888",    bg: "#F2F2F2", icon: "ban-outline",              label: "Cancelled" },
};

export default function MyBookingsScreen({ navigation }) {
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

  // Refresh every time screen comes into focus
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

    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
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
      ]
    );
  };

  const renderBooking = ({ item }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;
    const event = item.eventId;

    return (
      <View style={styles.card}>
        {/* Event Info */}
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="calendar" size={22} color="#2D6A4F" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.eventTitle} numberOfLines={1}>
              {event?.title || "Event"}
            </Text>
            <Text style={styles.eventVenue}>
              {event?.venue} · {event?.eventType}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={12} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label || item.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Details */}
        <View style={styles.detailGrid}>
          <DetailItem
            icon="calendar-outline"
            label="Event Date"
            value={new Date(item.eventDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          />
          <DetailItem
            icon="people-outline"
            label="Guests"
            value={`${item.guestCount} people`}
          />
          <DetailItem
            icon="cash-outline"
            label="Total"
            value={`LKR ${item.totalPrice?.toLocaleString()}`}
          />
          <DetailItem
            icon="call-outline"
            label="Phone"
            value={item.contactPhone}
          />
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

        {/* Cancel Button */}
        {item.status === "Pending" && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => handleCancel(item._id)}
          >
            <Ionicons name="close-circle-outline" size={16} color="#E63946" />
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F7F4" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1B4332" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2D6A4F" style={{ marginTop: 60 }} />
      ) : bookings.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyText}>Browse events and book your perfect occasion</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate("EventsList")}
          >
            <Text style={styles.browseBtnText}>Browse Events</Text>
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
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} tintColor="#2D6A4F" />
          }
        />
      )}
    </View>
  );
}

const DetailItem = ({ icon, label, value }) => (
  <View style={styles.detailItem}>
    <Ionicons name={icon} size={13} color="#2D6A4F" />
    <View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F7F4" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#1B4332" },
  list: { padding: 16, gap: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIcon: {
    backgroundColor: "#D8F3DC",
    borderRadius: 10,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1 },
  eventTitle: { fontSize: 15, fontWeight: "700", color: "#1B4332" },
  eventVenue: { fontSize: 12, color: "#52796F", marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#F0F7F4", marginVertical: 12 },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  detailItem: { flexDirection: "row", alignItems: "flex-start", gap: 6, width: "47%" },
  detailLabel: { fontSize: 10, color: "#888" },
  detailValue: { fontSize: 13, fontWeight: "600", color: "#222" },
  requests: {
    backgroundColor: "#F0F7F4",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  requestsLabel: { fontSize: 11, color: "#888", marginBottom: 3 },
  requestsText: { fontSize: 13, color: "#333" },
  bookedOn: { fontSize: 11, color: "#aaa", marginTop: 10 },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F7F4",
  },
  cancelBtnText: { color: "#E63946", fontWeight: "600", fontSize: 13 },
  empty: { alignItems: "center", marginTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#444", marginTop: 16 },
  emptyText: { fontSize: 13, color: "#888", textAlign: "center", marginTop: 6 },
  browseBtn: {
    backgroundColor: "#2D6A4F",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 20,
  },
  browseBtnText: { color: "#fff", fontWeight: "700" },
});