import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { getMyOrders, cancelOrder } from '../../api/order.api';
import { Ionicons } from '@expo/vector-icons';
import StatusModal from '../../components/ui/StatusModal';


export default function MyOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState({ visible: false, type: 'success', title: '', message: '' });



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

  const handleCancelOrder = (orderId) => {
    setModalConfig({
      visible: true,
      type: 'warning',
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order?',
      confirmText: 'Yes, Cancel',
      onConfirm: async () => {
        try {
          await cancelOrder(orderId);
          setModalConfig({
            visible: true,
            type: 'success',
            title: 'Order Cancelled',
            message: 'Your order has been cancelled successfully.'
          });
          fetchOrders();
        } catch (error) {
          const msg = error.response?.data?.message || 'Could not cancel order.';
          setModalConfig({
            visible: true,
            type: 'error',
            title: 'Cancellation Failed',
            message: msg
          });
        }
      },
      cancelText: 'No',
      onCancel: () => {}
    });
  };





  const getStatusStyles = (status) => {
    switch (status) {
      case 'delivered': return { color: '#2E7D32', bg: '#E8F5E9' };
      case 'processing': return { color: '#1565C0', bg: '#E3F2FD' };
      case 'pending': return { color: '#E65100', bg: '#FFF3E0' };
      case 'cancelled': return { color: '#C62828', bg: '#FFEBEE' };
      default: return { color: '#333', bg: '#F0F0F0' };
    }
  };



  const renderOrderItem = ({ item }) => {
    const { color, bg } = getStatusStyles(item.orderStatus);
    
    return (
      <View style={[styles.orderCard, item.orderStatus === 'delivered' && styles.deliveredCard]}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Order #{item._id.substring(item._id.length - 8)}</Text>
            <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: bg }]}>
            <Text style={[styles.orderStatus, { color }]}>
              {item.orderStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.itemsList}>
          {item.items.map((orderItem, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemText}>
                • {orderItem.product?.name}{orderItem.size ? ` (${orderItem.size})` : ''}
              </Text>
              <Text style={styles.itemQty}>x{orderItem.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total Paid:</Text>
          <Text style={styles.orderTotal}>Rs. {item.totalAmount.toFixed(2)}</Text>
        </View>

        {item.orderStatus === 'pending' && (
          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={() => handleCancelOrder(item._id)}
          >
            <Ionicons name="close-circle-outline" size={16} color="#C62828" />
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>Track your store purchases</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={80} color="#DDD" />
            <Text style={styles.emptyText}>No orders found.</Text>
          </View>
        }
      />

      <StatusModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        cancelText={modalConfig.cancelText}
        onCancel={modalConfig.onCancel}
        onClose={() => setModalConfig({ ...modalConfig, visible: false, onConfirm: null, onCancel: null })}
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
  listContainer: { paddingHorizontal: 16, paddingBottom: 32 },
  header: { paddingHorizontal: 16, paddingTop: 16, marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#0D2D1D' },
  headerSubtitle: { fontSize: 15, color: '#666', marginTop: -2 },



  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  deliveredCard: { backgroundColor: '#F1F8E9', borderColor: '#C5E1A5', borderWidth: 1 },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: { fontSize: 16, fontWeight: '700', color: '#0D2D1D' },
  orderDate: { fontSize: 12, color: '#999', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  orderStatus: { fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  
  itemsList: { marginBottom: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemText: { fontSize: 14, color: '#555', flex: 1, fontWeight: '500' },
  itemQty: { fontSize: 14, color: '#999', fontWeight: '600' },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  totalLabel: { fontSize: 14, color: '#666' },
  orderTotal: { fontSize: 18, fontWeight: '700', color: '#2E7D32' },

  cancelBtn: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEBEE',
    backgroundColor: '#FFF8F8',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  cancelBtnText: { color: '#C62828', fontWeight: '700', fontSize: 14 },
  
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 20, fontWeight: '500' },
});
