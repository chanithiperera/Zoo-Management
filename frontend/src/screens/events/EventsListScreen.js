import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  Image,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllEvents } from "../../api/events.api";
import { popOrParentGoBack } from "../../utils/popOrParentGoBack";
import { resolveUploadsFileUri } from "../../api/getApiBaseUrl";
import { theme } from "../../constants/theme";

function placeholdHex(c) {
  return String(c || "").replace(/^#/, "");
}

function eventListPlaceholder(w, h) {
  const bg = placeholdHex(theme.colors.linkGreen);
  const fg = placeholdHex(theme.colors.white);
  return `https://placehold.co/${w}x${h}/${bg}/${fg}?text=Zoo+Event`;
}

function resolveEventCardImageUri(item) {
  const rawImageUrl = item?.imageUrl;
  if (!rawImageUrl || typeof rawImageUrl !== "string") {
    return eventListPlaceholder(400, 200);
  }
  const pathFix =
    rawImageUrl.startsWith("/uploads/") && !rawImageUrl.startsWith("/uploads/events/")
      ? rawImageUrl.replace("/uploads/", "/uploads/events/")
      : rawImageUrl;
  const base = rawImageUrl.startsWith("http")
    ? resolveUploadsFileUri(pathFix) || pathFix
    : resolveUploadsFileUri(pathFix);
  const cacheTs =
    item?.updatedAt || item?.createdAt ? new Date(item.updatedAt || item.createdAt).getTime() : Date.now();
  if (!base) return eventListPlaceholder(400, 200);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}t=${cacheTs}`;
}

const EVENT_TYPES = ["All", "Wedding", "Birthday", "Corporate", "Anniversary", "Graduation", "Other"];

const TYPE_ICONS = {
  All: "apps-outline",
  Wedding: "heart-outline",
  Birthday: "gift-outline",
  Corporate: "briefcase-outline",
  Anniversary: "sparkles-outline",
  Graduation: "school-outline",
  Other: "star-outline",
};

export default function EventsListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");

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

  const placeholderColor = `${theme.colors.primaryText}99`;
  const listBottomPad = insets.bottom + theme.spacing.lg;

  const renderTypeChip = ({ item }) => (
    <TouchableOpacity
      style={[styles.chip, selectedType === item && styles.chipActive]}
      onPress={() => setSelectedType(item)}
    >
      <Ionicons
        name={TYPE_ICONS[item] || "star-outline"}
        size={13}
        color={selectedType === item ? theme.colors.white : theme.colors.linkGreen}
      />
      <Text style={[styles.chipText, selectedType === item && styles.chipTextActive]}>{item}</Text>
    </TouchableOpacity>
  );

  const renderEvent = ({ item }) => {
    const resolvedImageUri = resolveEventCardImageUri(item);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.92}
        onPress={() => navigation.navigate("EventDetail", { eventId: item._id })}
      >
        <View style={styles.cardImageWrapper}>
          <Image source={{ uri: resolvedImageUri }} style={styles.cardImage} resizeMode="cover" />
          <View style={styles.typeBadge}>
            <Ionicons name={TYPE_ICONS[item.eventType] || "star-outline"} size={11} color={theme.colors.white} />
            <Text style={styles.typeBadgeText}>{item.eventType}</Text>
          </View>
          <View style={styles.availBadge}>
            <Text style={styles.availBadgeText}>AVAILABLE</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.priceFrom}>
              From <Text style={styles.priceValue}>LKR {item.pricePerPerson?.toLocaleString()}</Text>
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Ionicons name="time-outline" size={11} color={theme.colors.accentGreen} />
                <Text style={styles.metaPillText}>{item.duration || "Full Day"}</Text>
              </View>
              <View style={styles.metaPill}>
                <Ionicons name="people-outline" size={11} color={theme.colors.accentGreen} />
                <Text style={styles.metaPillText}>Max {item.capacity}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
          Book an Event
        </Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={theme.colors.primaryText} style={{ opacity: 0.45 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          placeholderTextColor={placeholderColor}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={theme.colors.primaryText} style={{ opacity: 0.4 }} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={EVENT_TYPES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={renderTypeChip}
        contentContainerStyle={styles.chipList}
        style={styles.chipListWrapper}
      />

      <View style={styles.body}>
        {loading ? (
          <View style={styles.bodyFillCenter}>
            <ActivityIndicator size="large" color={theme.colors.accentGreen} />
          </View>
        ) : events.length === 0 ? (
          <View style={[styles.bodyFillCenter, styles.emptyBody, { paddingBottom: listBottomPad }]}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="calendar-outline" size={48} color={theme.colors.linkGreen} />
            </View>
            <Text style={styles.emptyTitle}>No events yet</Text>
            <Text style={styles.emptyText}>Events will appear here once added by admin.</Text>
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item._id}
            renderItem={renderEvent}
            style={styles.bodyFill}
            contentContainerStyle={[styles.list, { paddingBottom: listBottomPad }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.accentGreen}
                colors={[theme.colors.accentGreen]}
              />
            }
          />
        )}
      </View>
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm + 2,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.md - 2,
    paddingVertical: theme.spacing.sm + 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primaryText,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    fontFamily: theme.fonts.regular,
  },
  chipListWrapper: { flexGrow: 0, flexShrink: 0 },
  /** Fills space under chips so the stack screen below cannot show through (fixes clipped “strip”). */
  body: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.backgroundAlt,
  },
  bodyFill: { flex: 1, minHeight: 0 },
  bodyFillCenter: {
    flex: 1,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  chipList: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm + 2,
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    height: 36,
    borderWidth: 1.5,
    borderColor: theme.colors.sage,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.sm + 4,
    gap: 5,
    backgroundColor: theme.colors.white,
  },
  chipActive: {
    backgroundColor: theme.colors.accentGreen,
    borderColor: theme.colors.linkGreen,
  },
  chipText: {
    fontSize: theme.fontSize.sm - 1,
    color: theme.colors.linkGreen,
    fontWeight: "600",
    fontFamily: theme.fonts.semiBold,
  },
  chipTextActive: { color: theme.colors.white, fontWeight: "700", fontFamily: theme.fonts.bold },
  list: { paddingHorizontal: theme.spacing.md, gap: theme.spacing.md, flexGrow: 1 },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primaryText,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardImageWrapper: {
    position: "relative",
    width: "100%",
    height: 160,
    backgroundColor: theme.colors.welcomeBackground,
  },
  cardImage: { width: "100%", height: "100%" },
  typeBadge: {
    position: "absolute",
    top: theme.spacing.sm + 4,
    left: theme.spacing.sm + 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(13, 45, 29, 0.88)",
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: 5,
  },
  typeBadgeText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm - 2,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
  availBadge: {
    position: "absolute",
    top: theme.spacing.sm + 4,
    right: theme.spacing.sm + 4,
    backgroundColor: theme.colors.accentGreen,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: theme.colors.linkGreen,
  },
  availBadgeText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm - 3,
    fontWeight: "800",
    fontFamily: theme.fonts.extraBold,
    letterSpacing: 0.4,
  },
  cardBody: { padding: theme.spacing.md },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "800",
    fontFamily: theme.fonts.extraBold,
    color: theme.colors.primaryText,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.62,
    lineHeight: Math.round(theme.fontSize.sm * 1.45),
    marginBottom: theme.spacing.sm + 4,
    fontFamily: theme.fonts.regular,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceFrom: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.55,
    fontFamily: theme.fonts.regular,
  },
  priceValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: "800",
    fontFamily: theme.fonts.extraBold,
    color: theme.colors.linkGreen,
  },
  metaRow: { flexDirection: "row", gap: theme.spacing.sm },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.radii.sm - 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  metaPillText: {
    fontSize: theme.fontSize.sm - 2,
    color: theme.colors.accentGreen,
    fontWeight: "600",
    fontFamily: theme.fonts.semiBold,
  },
  emptyBody: { alignItems: "center", paddingHorizontal: theme.spacing.lg },
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
    color: theme.colors.primaryText,
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.primaryText,
    opacity: 0.55,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.sm,
    textAlign: "center",
    fontFamily: theme.fonts.regular,
  },
});
