import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAllEvents } from "../../api/events.api";
import { getApiBaseUrl } from "../../api/getApiBaseUrl";

const EVENT_TYPES = ["All", "Wedding", "Birthday", "Corporate", "Anniversary", "Graduation", "Other"];

const TYPE_ICONS = {
  All:         "apps-outline",
  Wedding:     "heart-outline",
  Birthday:    "gift-outline",
  Corporate:   "briefcase-outline",
  Anniversary: "sparkles-outline",
  Graduation:  "school-outline",
  Other:       "star-outline",
};

export default function EventsListScreen({ navigation }) {
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]       = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [activeTab, setActiveTab] = useState("events"); // "events" | "bookings"
  // API base includes `/api`, but uploaded files are served from `/uploads` (outside `/api`).
  const uploadsBaseUrl = getApiBaseUrl().replace(/\/api\/?$/i, "");

  const fetchEvents = useCallback(async () => {
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedType !== "All") params.eventType = selectedType;
      const res = await getAllEvents(params);
      setEvents(res.data.data);
    } catch (err) {
      console.error("Failed to load events:", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedType]);

  useEffect(() => {
    setLoading(true);
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    if (tab === "bookings") navigation.navigate("MyBookings");
  };

  const renderTypeChip = ({ item }) => (
    <TouchableOpacity
      style={[styles.chip, selectedType === item && styles.chipActive]}
      onPress={() => setSelectedType(item)}
    >
      <Ionicons
        name={TYPE_ICONS[item] || "star-outline"}
        size={13}
        color={selectedType === item ? "#fff" : "#2D6A4F"}
      />
      <Text style={[styles.chipText, selectedType === item && styles.chipTextActive]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderEvent = ({ item }) => (
    (() => {
      const rawImageUrl = item?.imageUrl;
      const cacheBuster =
        item?.updatedAt || item?.createdAt ? new Date(item.updatedAt || item.createdAt).getTime() : Date.now();
      const resolvedImageUri = rawImageUrl
        ? (typeof rawImageUrl === "string" && rawImageUrl.startsWith("http")
          ? rawImageUrl
          : `${uploadsBaseUrl}${rawImageUrl.startsWith("/uploads/") && !rawImageUrl.startsWith("/uploads/events/")
              ? rawImageUrl.replace("/uploads/", "/uploads/events/")
              : rawImageUrl}`) + `?t=${cacheBuster}`
        : "https://placehold.co/400x200/1B4332/white?text=Zoo+Event";

      return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={() => navigation.navigate("EventDetail", { eventId: item._id })}
    >
      {/* Card image area */}
      <View style={styles.cardImageWrapper}>
        <Image
          source={{ uri: resolvedImageUri }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        {/* Type badge top-left */}
        <View style={styles.typeBadge}>
          <Ionicons name={TYPE_ICONS[item.eventType] || "star-outline"} size={11} color="#fff" />
          <Text style={styles.typeBadgeText}>{item.eventType}</Text>
        </View>
        {/* Availability top-right */}
        <View style={styles.availBadge}>
          <Text style={styles.availBadgeText}>AVAILABLE</Text>
        </View>
      </View>

      {/* Card body */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

        {/* Footer row */}
        <View style={styles.cardFooter}>
          <Text style={styles.priceFrom}>
            From <Text style={styles.priceValue}>LKR {item.pricePerPerson?.toLocaleString()}</Text>
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Ionicons name="time-outline" size={11} color="#52796F" />
              <Text style={styles.metaPillText}>{item.duration || "Full Day"}</Text>
            </View>
            <View style={styles.metaPill}>
              <Ionicons name="people-outline" size={11} color="#52796F" />
              <Text style={styles.metaPillText}>Max {item.capacity}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
      );
    })()
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F7F4" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1B4332" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>ZentraZoo</Text>
          <Text style={styles.headerTitle}>Book an Event</Text>
        </View>
        <TouchableOpacity
          style={styles.bookingsIconBtn}
          onPress={() => navigation.navigate("MyBookings")}
        >
          <Ionicons name="receipt-outline" size={22} color="#2D6A4F" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      {/* Type Filter Chips */}
      <FlatList
        data={EVENT_TYPES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={renderTypeChip}
        contentContainerStyle={styles.chipList}
        style={styles.chipListWrapper}
      />

      {/* Events List */}
      {loading ? (
        <ActivityIndicator size="large" color="#2D6A4F" style={{ marginTop: 60 }} />
      ) : events.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No events yet</Text>
          <Text style={styles.emptyText}>Events will appear here once added by admin</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={renderEvent}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D6A4F" />
          }
        />
      )}

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress("events")}
        >
          <Ionicons
            name={activeTab === "events" ? "calendar" : "calendar-outline"}
            size={22}
            color={activeTab === "events" ? "#2D6A4F" : "#999"}
          />
          <Text style={[styles.tabLabel, activeTab === "events" && styles.tabLabelActive]}>
            Events
          </Text>
          {activeTab === "events" && <View style={styles.tabDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress("bookings")}
        >
          <Ionicons
            name={activeTab === "bookings" ? "receipt" : "receipt-outline"}
            size={22}
            color={activeTab === "bookings" ? "#2D6A4F" : "#999"}
          />
          <Text style={[styles.tabLabel, activeTab === "bookings" && styles.tabLabelActive]}>
            My Bookings
          </Text>
          {activeTab === "bookings" && <View style={styles.tabDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F7F4" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 12,
  },
  headerSub: { fontSize: 20, fontWeight: "700", color: "#52796F", letterSpacing: 1, marginBottom: 2 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#1B4332" },
  backBtn: {
    backgroundColor: "#D8F3DC",
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  bookingsIconBtn: {
    backgroundColor: "#D8F3DC",
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: "#222" },

  // Chips
  chipListWrapper: { flexGrow: 0 },
  chipList: { paddingHorizontal: 16, paddingBottom: 10, gap: 8, alignItems: "center" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    height: 34,
    borderWidth: 1.5,
    borderColor: "#2D6A4F",
    borderRadius: 20,
    paddingHorizontal: 12,
    gap: 5,
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: "#2D6A4F" },
  chipText: { fontSize: 12, color: "#2D6A4F", fontWeight: "600" },
  chipTextActive: { color: "#fff" },

  // List
  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 16 },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardImageWrapper: { position: "relative", width: "100%", height: 160, backgroundColor: "#E8F0EB" },
  cardImage: { width: "100%", height: "100%" },
  typeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(27,67,50,0.85)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typeBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  availBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#52B788",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  availBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },

  cardBody: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#1B4332", marginBottom: 6 },
  cardDesc: { fontSize: 13, color: "#666", lineHeight: 19, marginBottom: 12 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceFrom: { fontSize: 13, color: "#888" },
  priceValue: { fontSize: 18, fontWeight: "800", color: "#2D6A4F" },
  metaRow: { flexDirection: "row", gap: 8 },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0F7F4",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaPillText: { fontSize: 11, color: "#52796F", fontWeight: "600" },

  // Empty
  empty: { alignItems: "center", marginTop: 80, paddingHorizontal: 40 },
  emptyTitle: { color: "#555", fontSize: 17, fontWeight: "700", marginTop: 16 },
  emptyText: { color: "#aaa", fontSize: 13, marginTop: 6, textAlign: "center" },

  // Bottom Tab Bar
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingBottom: 24,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E8F0EB",
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  tabLabel: { fontSize: 11, color: "#999", fontWeight: "600" },
  tabLabelActive: { color: "#2D6A4F" },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2D6A4F",
    marginTop: 2,
  },
});