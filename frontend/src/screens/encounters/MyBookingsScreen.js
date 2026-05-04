import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Alert,
  Platform
} from 'react-native';
import apiClient from '../../api/client';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import { theme } from '../../constants/theme';

export default function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState(null);

  const drawerMenuItems = [
    { key: 'explore-home', label: 'Explore', onPress: () => navigation.navigate('Profile') },
    { key: 'my-profile', label: 'My Profile', onPress: () => navigation.navigate('UserProfileDetails') },
    { key: 'my-bookings', label: 'My Bookings', onPress: () => navigation.navigate('MyBookings') }
  ];

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
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

      combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(combined);
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancelAction = (booking) => {
    if (Platform.OS === 'web') {
      const ok = window.confirm('Are you sure you want to remove this booking?');
      if (ok) processCancellation(booking);
      return;
    }

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to remove this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Confirm Cancel',
          style: 'destructive',
          onPress: () => processCancellation(booking)
        }
      ]
    );
  };

  const processCancellation = async (booking) => {
    try {
      setActionId(booking._id);

      const endpoint = booking.category === 'Feeding'
        ? `/feeding-bookings/${booking._id}`
        : `/photography-bookings/${booking._id}`;

      // 1. Direct Delete
      const response = await apiClient.delete(endpoint);

      if (response.data.success) {
        // 2. Remove from local state
        setBookings(prev => prev.filter(b => b._id !== booking._id));
        const msg = 'Your booking has been removed.';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Success', msg);
      } else {
        throw new Error(response.data.message || 'Deletion failed on server');
      }
    } catch (error) {
      console.error('Cancellation failed:', error);
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.message || 'Network error';

      // Fallback: POST override
      try {
        const endpoint = booking.category === 'Feeding' ? `/feeding-bookings/${booking._id}` : `/photography-bookings/${booking._id}`;
        await apiClient.post(endpoint, { _method: 'DELETE' });
        setBookings(prev => prev.filter(b => b._id !== booking._id));
        const successMsg = 'Booking removed (via fallback).';
        if (Platform.OS === 'web') window.alert(successMsg);
        else Alert.alert('Success', successMsg);
      } catch (err2) {
        const errMsg = `Error (Status ${status}): ${msg}`;
        if (Platform.OS === 'web') window.alert(errMsg);
        else Alert.alert('Error', errMsg);
      }
    } finally {
      setActionId(null);
    }
  };

  const renderBooking = ({ item }) => {
    const isProcessing = actionId === item._id;

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
            <Text style={styles.categoryBadge}>{item.category}</Text>
            <Text style={styles.animalName}>{item.animalName || item.animal?.name || 'Zoo Encounter'}</Text>
          </View>
          <View style={[styles.statusBadge, styles[`status${(item.status || 'booked').toLowerCase()}`]]}>
            <Text style={styles.statusText}>{(item.status || 'Booked').toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>DATE</Text>
            <Text style={styles.infoValue}>{item.date ? new Date(item.date).toDateString() : 'N/A'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>TIME</Text>
            <Text style={styles.infoValue}>{displayTime}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.cancelBtn, isProcessing && styles.disabledBtn]}
          onPress={() => handleCancelAction(item)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#F44336" />
          ) : (
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <AccountDrawerLayout headerTitle="My Bookings" drawerMenuItems={drawerMenuItems} scroll={false}>
      <View style={styles.content}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={theme.colors.accentGreen} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={item => item._id}
            renderItem={renderBooking}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMyBookings(); }} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🎫</Text>
                <Text style={styles.emptyTitle}>No Active Bookings</Text>
                <TouchableOpacity style={styles.bookNowBtn} onPress={() => navigation.navigate('Encounters')}>
                  <Text style={styles.bookNowText}>Explore Encounters</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingTop: 10, backgroundColor: '#E8F5E9' },
  list: { paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 15, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, borderWidth: 1, borderColor: '#F0F0F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  categoryBadge: { fontSize: 10, fontWeight: 'bold', color: theme.colors.linkGreen, backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden', marginBottom: 6, alignSelf: 'flex-start' },
  animalName: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusbooked: { backgroundColor: '#E3F2FD' },
  statuscompleted: { backgroundColor: '#E8F5E9' },
  statuscancelled: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#555' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 10, color: '#999', fontWeight: 'bold', marginBottom: 4 },
  infoValue: { fontSize: 14, color: '#333', fontWeight: '600' },
  cancelBtn: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 15, alignItems: 'center' },
  cancelBtnText: { color: '#F44336', fontWeight: 'bold', fontSize: 14 },
  disabledBtn: { opacity: 0.5 },
  emptyState: { alignItems: 'center', marginTop: 80, padding: 20 },
  emptyEmoji: { fontSize: 60, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  bookNowBtn: { backgroundColor: theme.colors.accentGreen, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
  bookNowText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
