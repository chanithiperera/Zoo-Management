import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { getMyOrders } from '../../api/order.api';
import { Ionicons } from '@expo/vector-icons';

export default function MyOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getMyOrders();
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#4CAF50';
      case 'shipped': return '#2196F3';
      case 'processing': return '#FF9800';
      case 'pending': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      default: return '#333';
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item._id.substring(item._id.length - 8)}</Text>
        <Text style={[styles.orderStatus, { color: getStatusColor(item.orderStatus) }]}>
          {item.orderStatus.toUpperCase()}
        </Text>
      </View>
      <View style={styles.orderBody}>
        <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.orderTotal}>Total: ${item.totalAmount.toFixed(2)}</Text>
      </View>
      <View style={styles.itemsList}>
        {item.items.map((orderItem, index) => (
          <Text key={index} style={styles.itemText}>
            • {orderItem.product?.name} x {orderItem.quantity}
          </Text>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={80} color="#EEE" />
            <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontFamily: 'Dosis_700Bold',
    color: '#333',
  },
  orderStatus: {
    fontSize: 14,
    fontFamily: 'Dosis_700Bold',
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 16,
    fontFamily: 'Dosis_700Bold',
    color: '#333',
  },
  itemsList: {
    marginTop: 5,
  },
  itemText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 20,
    fontFamily: 'Dosis_600SemiBold',
  },
});
