import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { getAllEvents, deleteEvent } from '../../../api/events.api';
import { resolveUploadsFileUri } from '../../../api/getApiBaseUrl';
import { popOrParentGoBack } from '../../../utils/popOrParentGoBack';
import { theme } from '../../../constants/theme';
import { getAdminModuleHeroByRouteName } from '../../admin/adminNavigation';
import AdminModuleHero from '../../../components/admin/AdminModuleHero';

function useFocusRefresh(navigation, fetchFn) {
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchFn);
    return unsub;
  }, [navigation, fetchFn]);
}

function resolveEventImageUri(item) {
  const raw = item?.imageUrl;
  if (!raw || typeof raw !== 'string') return null;
  const path =
    raw.startsWith('/uploads/') && !raw.startsWith('/uploads/events/')
      ? raw.replace('/uploads/', '/uploads/events/')
      : raw;
  const base =
    raw.startsWith('http') ? resolveUploadsFileUri(path) || path : resolveUploadsFileUri(path);
  if (!base) return null;
  const ts =
    item?.updatedAt || item?.createdAt
      ? new Date(item.updatedAt || item.createdAt).getTime()
      : Date.now();
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}t=${ts}`;
}

export default function AdminEventManagementScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const hero = useMemo(() => getAdminModuleHeroByRouteName(route.name), [route.name]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetchEvents = useCallback(async () => {
    try {
      const res = await getAllEvents();
      setEvents(res.data.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load events.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  useFocusRefresh(navigation, fetchEvents);

  const handleDelete = (id, title) => {
    Alert.alert('Delete Event', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEvent(id);
            fetchEvents();
          } catch (err) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to delete.');
          }
        },
      },
    ]);
  };

  const renderEvent = ({ item }) => {
    const uri = resolveEventImageUri(item);

    return (
      <View style={styles.card}>
        {uri ? (
          <Image source={{ uri }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Ionicons name="calendar-outline" size={40} color={theme.colors.linkGreen} style={styles.placeholderIcon} />
          </View>
        )}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.eventType}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.cardMeta}>
            <Ionicons name="location-outline" size={13} color={theme.colors.linkGreen} style={styles.metaIcon} />
            <Text style={styles.cardMetaText}>{item.venue}</Text>
          </View>
          <View style={styles.cardMeta}>
            <Ionicons name="cash-outline" size={13} color={theme.colors.linkGreen} style={styles.metaIcon} />
            <Text style={styles.cardMetaText}>
              LKR {item.pricePerPerson?.toLocaleString()} /person · Max {item.capacity}
            </Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('AdminEditEvent', { event: item })}
              accessibilityRole="button"
              accessibilityLabel="Edit event"
            >
              <Ionicons name="create-outline" size={16} color={theme.colors.accentGreen} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bookingsBtn}
              onPress={() => navigation.navigate('AdminEventBookings')}
              accessibilityRole="button"
              accessibilityLabel="View bookings for this event hub"
            >
              <Ionicons name="receipt-outline" size={16} color={theme.colors.white} />
              <Text style={styles.bookingsBtnText}>Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item._id, item.title)}
              accessibilityRole="button"
              accessibilityLabel="Delete event"
            >
              <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const openAddEvent = () => navigation.navigate('AdminAddEvent');

  const listHeader = (
    <>
      {hero ? (
        <AdminModuleHero title={hero.title} subtitle={hero.subtitle}>
          <Text style={styles.heroCount}>
            {events.length} event{events.length === 1 ? '' : 's'} total
          </Text>
        </AdminModuleHero>
      ) : null}
      <TouchableOpacity
        style={styles.bookingsBanner}
        onPress={() => navigation.navigate('AdminEventBookings')}
        accessibilityRole="button"
        accessibilityLabel="View and manage all booking requests"
      >
        <View style={styles.bookingsBannerIconWrap}>
          <Ionicons name="receipt-outline" size={20} color={theme.colors.linkGreen} />
        </View>
        <Text style={styles.bookingsBannerText}>View & Manage All Booking Requests</Text>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.linkGreen} />
      </TouchableOpacity>
      <View style={styles.addFabRow}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={openAddEvent}
          accessibilityRole="button"
          accessibilityLabel="Add event"
        >
          <Ionicons name="add" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
    </>
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
          <Ionicons name="arrow-back" size={22} color={theme.colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>
          {hero?.title ?? 'Event Management'}
        </Text>
      </View>

      {loading ? (
        <>
          <View style={styles.listHeaderWrap}>{listHeader}</View>
          <ActivityIndicator size="large" color={theme.colors.accentGreen} style={styles.loader} />
        </>
      ) : events.length === 0 ? (
        <>
          <View style={styles.listHeaderWrap}>{listHeader}</View>
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="calendar-outline" size={52} color={theme.colors.linkGreen} />
            </View>
            <Text style={styles.emptyTitle}>No events yet</Text>
            <Text style={styles.emptySub}>Create an event visitors can browse and book.</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddEvent}>
              <Ionicons name="add-circle-outline" size={20} color={theme.colors.white} />
              <Text style={styles.emptyAddBtnText}>Add first event</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={renderEvent}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchEvents();
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundAlt },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  backBtn: { padding: theme.spacing.xs },
  headerTitle: {
    flex: 1,
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
  },
  addFabRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  listHeaderWrap: {
    paddingHorizontal: theme.spacing.md,
  },
  heroCount: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm - 1,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
    opacity: 0.75,
  },
  addBtn: {
    backgroundColor: theme.colors.accentGreen,
    borderRadius: theme.radii.pill,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.sage,
    shadowColor: theme.colors.primaryText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.welcomeBackground,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radii.md,
    paddingVertical: theme.spacing.md - 2,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    gap: theme.spacing.sm,
    shadowColor: theme.colors.primaryText,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  bookingsBannerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.sageButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  bookingsBannerText: {
    flex: 1,
    color: theme.colors.primaryText,
    fontWeight: '700',
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.bold,
  },
  list: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.lg, gap: theme.spacing.md },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primaryText,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardImage: { width: '100%', height: 150 },
  cardImagePlaceholder: {
    backgroundColor: theme.colors.welcomeBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  typeBadge: {
    position: 'absolute',
    top: theme.spacing.sm + 4,
    left: theme.spacing.sm + 4,
    backgroundColor: 'rgba(13,45,29,0.88)',
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  typeBadgeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '800',
    fontFamily: theme.fonts.extraBold,
  },
  cardBody: { padding: theme.spacing.md - 2 },
  cardTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '800',
    fontFamily: theme.fonts.extraBold,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.sm,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaIcon: { marginRight: theme.spacing.sm - 2, opacity: 0.85 },
  cardMetaText: {
    fontSize: theme.fontSize.sm - 2,
    color: theme.colors.primaryText,
    opacity: 0.72,
    flex: 1,
    fontFamily: theme.fonts.semiBold,
  },
  actionRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md - 4 },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm - 2,
    borderWidth: 1.5,
    borderColor: theme.colors.accentGreen,
    borderRadius: theme.radii.sm - 4,
    paddingVertical: 10,
    backgroundColor: theme.colors.white,
  },
  editBtnText: {
    color: theme.colors.linkGreen,
    fontWeight: '700',
    fontSize: theme.fontSize.sm - 3,
    fontFamily: theme.fonts.bold,
  },
  bookingsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm - 2,
    backgroundColor: theme.colors.accentGreen,
    borderRadius: theme.radii.sm - 4,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.linkGreen,
  },
  bookingsBtnText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: theme.fontSize.sm - 3,
    fontFamily: theme.fonts.bold,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm - 2,
    borderWidth: 1.5,
    borderColor: theme.colors.error,
    borderRadius: theme.radii.sm - 4,
    paddingVertical: 10,
    backgroundColor: theme.colors.white,
  },
  deleteBtnText: {
    color: theme.colors.error,
    fontWeight: '700',
    fontSize: theme.fontSize.sm - 3,
    fontFamily: theme.fonts.bold,
  },
  loader: { marginTop: 60 },
  empty: { alignItems: 'center', marginTop: 72, paddingHorizontal: theme.spacing.lg },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.sageButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.sage,
    marginBottom: theme.spacing.sm,
    opacity: 0.92,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    fontFamily: theme.fonts.extraBold,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.sm - 4,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: theme.spacing.lg - 8,
    lineHeight: theme.fontSize.sm * 1.35,
    fontFamily: theme.fonts.regular,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.accentGreen,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md - 4,
    borderWidth: 1,
    borderColor: theme.colors.linkGreen,
  },
  emptyAddBtnText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.body,
  },
  placeholderIcon: { opacity: 0.42 },
});
