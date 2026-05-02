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
          <Text style={styles.infoText}>📅 {item.date}</Text>
          <Text style={styles.infoText}>⏰ {displayTime}</Text>
        </View>
        
        <Text style={styles.detail}>🦁 {item.animalName || item.animal?.name || 'Encounter'}</Text>
        {item.category === 'Photography' && (
          <Text style={styles.detail}>📸 Staff: {item.photographer?.name || 'Assigned'}</Text>
        )}
        <Text style={styles.detail}>📞 {item.contactInfo || 'No contact'}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnDone} onPress={() => handleStatus(item, 'completed')}>
            <Text style={styles.btnText}>Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancel} onPress={() => handleStatus(item, 'cancelled')}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking Admin</Text>
        <TouchableOpacity onPress={fetchData}><Text style={styles.refresh}>🔄 Sync</Text></TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {['All', 'Feeding', 'Photography'].map(t => (
          <TouchableOpacity key={t} onPress={() => setFilter(t)} style={[styles.tab, filter === t && styles.activeTab]}>
            <Text style={[styles.tabText, filter === t && styles.activeTabText]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 50 }} /> : (
        <FlatList
          data={bookings.filter(b => filter === 'All' || b.category === filter)}
          keyExtractor={item => item._id}
          renderItem={renderBooking}
          contentContainerStyle={{ padding: 15 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
          ListEmptyComponent={<Text style={styles.empty}>No bookings to display.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  title: { fontSize: 22, fontWeight: 'bold' },
  refresh: { color: '#2196F3', fontWeight: 'bold' },
  tabs: { flexDirection: 'row', backgroundColor: '#FFF', padding: 10, justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  tab: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  activeTab: { backgroundColor: '#2196F3' },
  tabText: { fontWeight: 'bold', color: '#666', fontSize: 13 },
  activeTabText: { color: '#FFF' },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 15, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  badge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, marginTop: 4, alignSelf: 'flex-start' },
  feedBadge: { backgroundColor: '#FFF3E0', color: '#E65100' },
  photoBadge: { backgroundColor: '#E3F2FD', color: '#1565C0' },
  statusBox: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusbooked: { backgroundColor: '#E3F2FD' },
  statuscompleted: { backgroundColor: '#E8F5E9' },
  statuscancelled: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#444' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, backgroundColor: '#F8F9FA', padding: 8, borderRadius: 8 },
  infoText: { fontSize: 13, color: '#555', fontWeight: 'bold' },
  detail: { fontSize: 14, color: '#666', marginBottom: 4 },
  actions: { flexDirection: 'row', marginTop: 15, gap: 10 },
  btnDone: { flex: 1, backgroundColor: '#4CAF50', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnCancel: { flex: 1, backgroundColor: '#F44336', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 },
});
