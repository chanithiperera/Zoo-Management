import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import { getAllOrders, updateOrderStatus } from '../../../api/order.api';
import { Ionicons } from '@expo/vector-icons';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getAllOrders();
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (orderId, currentStatus) => {
    if (currentStatus === 'cancelled') {
      Alert.alert('Cannot Update', 'This order has been cancelled by the user and cannot be modified.');
      return;
    }
    
    if (currentStatus === 'delivered') {
      Alert.alert('Cannot Update', 'This order has already been delivered.');
      return;
    }

    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    Alert.alert(
      'Update Status',
      'Select new status',
      statuses.map(status => ({
        text: status.toUpperCase(),
        onPress: async () => {
          try {
            await updateOrderStatus(orderId, status);
            fetchOrders();
          } catch (error) {
            const msg = error.response?.data?.message || 'Could not update status';
            Alert.alert('Error', msg);
          }
        }
      })),
      { cancelable: true }
    );
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Order #{item._id.substring(item._id.length - 6)}</Text>
        <TouchableOpacity 
          onPress={() => handleUpdateStatus(item._id, item.orderStatus)} 
          style={[styles.statusBadge, item.orderStatus === 'cancelled' && styles.disabledBadge]}
        >
          <Text style={styles.statusText}>{item.orderStatus.toUpperCase()}</Text>
          {item.orderStatus !== 'cancelled' && item.orderStatus !== 'delivered' && (
            <Ionicons name="caret-down" size={12} color="#666" />
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.customer}>{item.user?.fullName} ({item.user?.email})</Text>
      <Text style={styles.total}>Amount: Rs. {item.totalAmount.toFixed(2)}</Text>
      <Text style={styles.address}>{item.shippingAddress?.address}, {item.shippingAddress?.city}</Text>
      <View style={styles.items}>
        {item.items.map((i, idx) => (
          <Text key={idx} style={styles.itemText}>• {i.product?.name}{i.size ? ` - ${i.size}` : ''} ({i.quantity})</Text>
        ))}
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      {loading ? <ActivityIndicator size="large" /> : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderId: { fontSize: 16, fontFamily: 'Dosis_700Bold' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', padding: 6, borderRadius: 8 },
  statusText: { fontSize: 12, marginRight: 4, fontFamily: 'Dosis_600SemiBold' },
  customer: { fontSize: 14, color: '#333', marginBottom: 4 },
  total: { fontSize: 14, fontFamily: 'Dosis_700Bold', color: '#4CAF50', marginBottom: 4 },
  address: { fontSize: 12, color: '#666', marginBottom: 8 },
  items: { borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 8 },
  itemText: { fontSize: 12, color: '#444' },
  disabledBadge: { backgroundColor: '#FFEBEE', opacity: 0.8 },
});
