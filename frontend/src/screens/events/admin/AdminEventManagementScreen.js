import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, Alert, RefreshControl, StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAllEvents, deleteEvent } from "../../../api/events.api";
import { getApiBaseUrl } from "../../../api/getApiBaseUrl";

function useFocusRefresh(navigation, fetchFn) {
  useEffect(() => {
    const unsub = navigation.addListener("focus", fetchFn);
    return unsub;
  }, [navigation, fetchFn]);
}

export default function AdminEventManagementScreen({ navigation }) {
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const uploadsBaseUrl = getApiBaseUrl().replace(/\/api\/?$/i, "");

  const fetchEvents = useCallback(async () => {
    try {
      const res = await getAllEvents();
      setEvents(res.data.data);
    } catch (err) {
      Alert.alert("Error", "Failed to load events.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useFocusRefresh(navigation, fetchEvents);

  const handleDelete = (id, title) => {
    Alert.alert("Delete Event", `Are you sure you want to delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await deleteEvent(id);
            fetchEvents();
          } catch (err) {
            Alert.alert("Error", err?.response?.data?.message || "Failed to delete.");
          }
        },
      },
    ]);
  };

  const renderEvent = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={
          item.imageUrl
            ? { uri: item.imageUrl.startsWith("http")
                ? item.imageUrl
                : `${uploadsBaseUrl}${item.imageUrl.startsWith("/uploads/") && !item.imageUrl.startsWith("/uploads/events/") ? item.imageUrl.replace("/uploads/", "/uploads/events/") : item.imageUrl}` }
            : { uri: "https://placehold.co/400x200/2D6A4F/white?text=Event" }
        }
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.typeBadge}>
        <Text style={styles.typeBadgeText}>{item.eventType}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardMeta}>
          <Ionicons name="location-outline" size={12} color="#52796F" />
          <Text style={styles.cardMetaText}>{item.venue}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Ionicons name="cash-outline" size={12} color="#52796F" />
          <Text style={styles.cardMetaText}>LKR {item.pricePerPerson?.toLocaleString()} /person · Max {item.capacity}</Text>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate("AdminEditEvent", { event: item })}
          >
            <Ionicons name="create-outline" size={15} color="#2D6A4F" />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookingsBtn}
            onPress={() => navigation.navigate("AdminEventBookings")}
          >
            <Ionicons name="receipt-outline" size={15} color="#fff" />
            <Text style={styles.bookingsBtnText}>Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item._id, item.title)}
          >
            <Ionicons name="trash-outline" size={15} color="#E63946" />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F7F4" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1B4332" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Event Management</Text>
          <Text style={styles.headerSub}>{events.length} events total</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate("AdminAddEvent")}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.bookingsBanner} onPress={() => navigation.navigate("AdminEventBookings")}>
        <Ionicons name="receipt-outline" size={18} color="#2D6A4F" />
        <Text style={styles.bookingsBannerText}>View & Manage All Booking Requests</Text>
        <Ionicons name="chevron-forward" size={16} color="#2D6A4F" />
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#2D6A4F" style={{ marginTop: 60 }} />
      ) : events.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No events yet</Text>
          <TouchableOpacity style={styles.emptyAddBtn} onPress={() => navigation.navigate("AdminAddEvent")}>
            <Text style={styles.emptyAddBtnText}>+ Add First Event</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={renderEvent}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEvents(); }} tintColor="#2D6A4F" />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F7F4" },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#1B4332" },
  headerSub: { fontSize: 12, color: "#52796F", marginTop: 1 },
  addBtn: {
    backgroundColor: "#2D6A4F", borderRadius: 22,
    width: 44, height: 44, alignItems: "center", justifyContent: "center",
  },
  bookingsBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#D8F3DC", marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#B7E4C7",
  },
  bookingsBannerText: { flex: 1, color: "#1B4332", fontWeight: "600", fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 20, gap: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, overflow: "hidden",
    elevation: 3, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  cardImage: { width: "100%", height: 150 },
  typeBadge: {
    position: "absolute", top: 12, left: 12,
    backgroundColor: "rgba(27,67,50,0.85)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  typeBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  cardBody: { padding: 14 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#1B4332", marginBottom: 8 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  cardMetaText: { fontSize: 12, color: "#52796F" },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  editBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, borderWidth: 1.5, borderColor: "#2D6A4F", borderRadius: 10, paddingVertical: 9,
  },
  editBtnText: { color: "#2D6A4F", fontWeight: "700", fontSize: 12 },
  bookingsBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, backgroundColor: "#2D6A4F", borderRadius: 10, paddingVertical: 9,
  },
  bookingsBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  deleteBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, borderWidth: 1.5, borderColor: "#E63946", borderRadius: 10, paddingVertical: 9,
  },
  deleteBtnText: { color: "#E63946", fontWeight: "700", fontSize: 12 },
  empty: { alignItems: "center", marginTop: 80 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#555", marginTop: 16 },
  emptyAddBtn: { backgroundColor: "#2D6A4F", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 16 },
  emptyAddBtnText: { color: "#fff", fontWeight: "700" },
});