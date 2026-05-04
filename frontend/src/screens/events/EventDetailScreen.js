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
import { getEventById } from "../../api/events.api";
import { getApiBaseUrl } from "../../api/getApiBaseUrl";

const TYPE_ICONS = {
  All:         "apps-outline",
  Wedding:     "heart-outline",
  Birthday:    "gift-outline",
  Corporate:   "briefcase-outline",
  Anniversary: "sparkles-outline",
  Graduation:  "school-outline",
  Other:       "star-outline",
};

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  // API base includes `/api`, but uploaded files are served from `/uploads` (outside `/api`).
  const uploadsBaseUrl = getApiBaseUrl().replace(/\/api\/?$/i, "");

  useEffect(() => {
    (async () => {
      try {
        const res = await getEventById(eventId);
        setEvent(res.data.data);
      } catch (err) {
        Alert.alert("Error", "Could not load event details.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );

  if (!event) return null;

  const rawImageUrl = event?.imageUrl;
  const cacheBuster =
    event?.updatedAt || event?.createdAt ? new Date(event.updatedAt || event.createdAt).getTime() : Date.now();
  const resolvedImageUri = rawImageUrl
    ? (typeof rawImageUrl === "string" && rawImageUrl.startsWith("http")
      ? rawImageUrl
      : `${uploadsBaseUrl}${rawImageUrl.startsWith("/uploads/") && !rawImageUrl.startsWith("/uploads/events/")
          ? rawImageUrl.replace("/uploads/", "/uploads/events/")
          : rawImageUrl}`) + `?t=${cacheBuster}`
    : "https://placehold.co/400x300/2D6A4F/white?text=Zoo+Event";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F7F4" />

      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color="#1B4332" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Event Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: resolvedImageUri }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Type Badge */}
        <View style={styles.typeBadgeRow}>
          <View style={styles.typeBadge}>
            <Ionicons
              name={TYPE_ICONS[event.eventType] || "star-outline"}
              size={13}
              color="#2D6A4F"
            />
            <Text style={styles.typeBadgeText}>{event.eventType}</Text>
          </View>
        </View>

        {/* Title & Description */}
        <View style={styles.section}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* Meta Cards Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaCard}>
            <Ionicons name="time-outline" size={22} color="#2D6A4F" />
            <Text style={styles.metaValue}>{event.duration || "Full Day"}</Text>
            <Text style={styles.metaLabel}>Duration</Text>
          </View>
          <View style={styles.metaCard}>
            <Ionicons name="people-outline" size={22} color="#2D6A4F" />
            <Text style={styles.metaValue}>Max {event.capacity}</Text>
            <Text style={styles.metaLabel}>Guests</Text>
          </View>
          <View style={styles.metaCard}>
            <Ionicons name="cash-outline" size={22} color="#2D6A4F" />
            <Text style={styles.metaValue}>LKR {event.pricePerPerson?.toLocaleString()}</Text>
            <Text style={styles.metaLabel}>Per Person</Text>
          </View>
        </View>

        {/* What's Included */}
        {event.includes?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            <View style={styles.includeGrid}>
              {event.includes.map((item, i) => (
                <View key={i} style={styles.includePill}>
                  <Ionicons name="checkmark" size={13} color="#2D6A4F" />
                  <Text style={styles.includePillText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Venue */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Venue</Text>
          <View style={styles.venueRow}>
            <Ionicons name="location-outline" size={18} color="#2D6A4F" />
            <Text style={styles.venueText}>{event.venue}</Text>
          </View>
        </View>

        {/* Requirements */}
        {event.requirements ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <Text style={styles.description}>{event.requirements}</Text>
          </View>
        ) : null}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Book Button */}
      <View style={styles.stickyFooter}>
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
        >
          <Text style={styles.bookBtnText}>Book This Event</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F7F4" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  backBtn: {
    position: "absolute",
    top: 48,
    left: 16,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  scroll: { paddingBottom: 20 },

  imageWrapper: { width: "100%", height: 280 },
  heroImage: { width: "100%", height: "100%" },

  typeBadgeRow: {
    alignItems: "center",
    marginTop: -18,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#D8F3DC",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: "#2D6A4F",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  typeBadgeText: { color: "#1B4332", fontWeight: "700", fontSize: 13 },

  section: { paddingHorizontal: 20, marginTop: 20 },
  title: { fontSize: 24, fontWeight: "800", color: "#1B4332", marginBottom: 8 },
  description: { fontSize: 14, color: "#555", lineHeight: 22 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1B4332", marginBottom: 12 },

  // Meta cards
  metaRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 20,
  },
  metaCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  metaValue: { fontSize: 12, fontWeight: "700", color: "#1B4332", textAlign: "center" },
  metaLabel: { fontSize: 10, color: "#888" },

  // Includes
  includeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  includePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#D8F3DC",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  includePillText: { fontSize: 13, color: "#1B4332", fontWeight: "600" },

  // Venue
  venueRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  venueText: { fontSize: 14, color: "#444", flex: 1 },

  // Sticky footer
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  priceBlock: {},
  priceLabel: { fontSize: 11, color: "#888" },
  priceValue: { fontSize: 20, fontWeight: "800", color: "#1B4332" },
  pricePerPerson: { fontSize: 12, fontWeight: "400", color: "#888" },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2D6A4F",
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  bookBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});