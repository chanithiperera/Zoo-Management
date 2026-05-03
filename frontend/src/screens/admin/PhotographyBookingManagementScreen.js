import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import apiClient from '../../api/client';
import { theme } from '../../constants/theme';

export default function PhotographyBookingManagementScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [photoRes, feedRes] = await Promise.all([
        apiClient.get('/photography-bookings').catch(() => ({ data: { success: false } })),
        apiClient.get('/feeding-bookings').catch(() => ({ data: { success: false } }))
      ]);

      let combined = [];
      if (photoRes.data?.success) {
        combined = [...combined, ...photoRes.data.data.map(b => ({ ...b, category: 'Photography' }))];
      }
      if (feedRes.data?.success) {
        combined = [...combined, ...feedRes.data.data.map(b => ({ ...b, category: 'Feeding' }))];
      }

      combined.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });

      setBookings(combined);
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatus = async (item, status) => {
    try {
      const endpoint = item.category === 'Feeding' ? `/feeding-bookings/${item._id}` : `/photography-bookings/${item._id}`;
      await apiClient.patch(endpoint, { status: status.toLowerCase() });
      Alert.alert('Success', `Status changed to ${status}`);
      fetchData();
    } catch (err) {
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  const renderBooking = ({ item }) => {
    const statusKey = `status${(item.status || 'booked').toLowerCase()}`;
    
    // SAFE TIME EXTRACTION (Prevents "Object as React child" error)
    let displayTime = 'TBD';
    if (typeof item.timeSlot === 'object' && item.timeSlot !== null) {
      displayTime = `${item.timeSlot.startTime || ''} - ${item.timeSlot.endTime || ''}`;
    } else if (typeof item.timeSlot === 'string') {
      displayTime = item.timeSlot;
    } else if (item.time) {
      displayTime = item.time;
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.name}>{item.visitorName || 'Guest'}</Text>
            <Text style={[styles.badge, item.category === 'Feeding' ? styles.feedBadge : styles.photoBadge]}>{item.category}</Text>
          </View>
          <View style={[styles.statusBox, styles[statusKey] || styles.statusbooked]}>
            <Text style={styles.statusText}>{(item.status || 'Booked').toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>Date: {item.date}</Text>
          <Text style={styles.infoText}>Time: {displayTime}</Text>
        </View>

        <Text style={styles.detail}>Animal: {item.animalName || item.animal?.name || 'Encounter'}</Text>
        {item.category === 'Photography' && (
          <Text style={styles.detail}>Staff: {item.photographer?.name || 'Assigned'}</Text>
        )}
        <Text style={styles.detail}>Contact: {item.contactInfo || 'No contact'}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnDone} onPress={() => handleStatus(item, 'completed')}>
            <Text style={styles.btnText}>Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancel} onPress={() => handleStatus(item, 'cancelled')}>
            <Text style={styles.btnTextOutlined}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking Admin</Text>
        <TouchableOpacity onPress={fetchData}>
          <Text style={styles.refresh}>Sync</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {['All', 'Feeding', 'Photography'].map(t => (
          <TouchableOpacity key={t} onPress={() => setFilter(t)} style={[styles.tab, filter === t && styles.activeTab]}>
            <Text style={[styles.tabText, filter === t && styles.activeTabText]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={theme.colors.accentGreen} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={bookings.filter(b => filter === 'All' || b.category === filter)}
          keyExtractor={item => item._id}
          renderItem={renderBooking}
          contentContainerStyle={{ padding: 15 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData();
              }}
              colors={[theme.colors.accentGreen]}
              tintColor={theme.colors.accentGreen}
            />
          }
          ListEmptyComponent={<Text style={styles.empty}>No bookings to display.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundAlt },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.colors.linkGreen },
  refresh: { color: theme.colors.accentGreen, fontWeight: '700', fontSize: theme.fontSize.sm },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.sm,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: theme.radii.pill },
  activeTab: { backgroundColor: theme.colors.accentGreen },
  tabText: { fontWeight: '600', color: theme.colors.primaryText, opacity: 0.55, fontSize: theme.fontSize.sm },
  activeTabText: { color: theme.colors.white, opacity: 1 },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  name: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.primaryText },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radii.sm,
    marginTop: 4,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  feedBadge: {
    backgroundColor: theme.colors.welcomeBackground,
    color: theme.colors.linkGreen,
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  photoBadge: {
    backgroundColor: theme.colors.sageButton,
    color: theme.colors.linkGreen,
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  statusBox: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radii.sm },
  statusbooked: { backgroundColor: theme.colors.welcomeBackground, borderWidth: 1, borderColor: theme.colors.sage },
  statuscompleted: { backgroundColor: theme.colors.sageButton, borderWidth: 1, borderColor: theme.colors.accentGreen },
  statuscancelled: { backgroundColor: theme.colors.yellowAlt + '33', borderWidth: 1, borderColor: theme.colors.yellow },
  statusText: { fontSize: 10, fontWeight: '700', color: theme.colors.primaryText },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.welcomeBackground,
    padding: theme.spacing.sm,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoText: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, fontWeight: '600' },
  detail: { fontSize: theme.fontSize.body, color: theme.colors.accentGreen, marginBottom: 4 },
  actions: { flexDirection: 'row', marginTop: theme.spacing.md, gap: 10 },
  btnDone: {
    flex: 1,
    backgroundColor: theme.colors.accentGreen,
    padding: 12,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  btnCancel: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
  btnText: { color: theme.colors.white, fontWeight: '700' },
  btnTextOutlined: { color: theme.colors.error, fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 50, color: theme.colors.primaryText, opacity: 0.5, fontSize: theme.fontSize.body },
});
