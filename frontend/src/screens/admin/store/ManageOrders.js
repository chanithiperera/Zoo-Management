import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../../api/order.api';
import { Ionicons } from '@expo/vector-icons';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [nextStatuses, setNextStatuses] = useState([]);
  const [filter, setFilter] = useState('all');

  const statusCategories = ['all', 'pending', 'processing', 'delivered', 'cancelled'];

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

  const handleDeleteOrder = (orderId) => {
    Alert.alert(
      'Delete Order',
      'Are you sure you want to delete this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOrder(orderId);
              fetchOrders();
            } catch (error) {
              Alert.alert('Error', 'Could not delete order');
            }
          }
        }
      ]
    );
  };

  const handleUpdateStatus = (orderId, currentStatus) => {
    if (currentStatus === 'cancelled' || currentStatus === 'delivered') {
      return;
    }

    let statuses = [];
    if (currentStatus === 'pending') {
      statuses = ['processing'];
    } else if (currentStatus === 'processing') {
      statuses = ['delivered'];
    }

    if (statuses.length === 0) {
      Alert.alert('No Updates', 'No further status updates are available for this order.');
      return;
    }

    setSelectedOrder(orderId);
    setNextStatuses(statuses);
    setModalVisible(true);
  };

  const confirmStatusUpdate = async (status) => {
    setModalVisible(false);
    try {
      await updateOrderStatus(selectedOrder, status);
      fetchOrders();
    } catch (error) {
      const msg = error.response?.data?.message || 'Could not update status';
      Alert.alert('Error', msg);
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.orderStatus === filter);



  const renderFilterTabs = () => (
    <View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.filterContainer}
      >
        {statusCategories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setFilter(cat)}
            style={[
              styles.filterTab,
              filter === cat && styles.activeFilterTab
            ]}
          >
            <Text style={[
              styles.filterTabText,
              filter === cat && styles.activeFilterTabText
            ]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderOrderItem = ({ item }) => (
    <View style={[styles.card, item.orderStatus === 'delivered' && styles.deliveredCard]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item._id.substring(item._id.length - 6)}</Text>
          <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => handleUpdateStatus(item._id, item.orderStatus)}
            style={[
              styles.statusBadge,
              item.orderStatus === 'delivered' && styles.deliveredBadge,
              item.orderStatus === 'cancelled' && styles.cancelledBadge,
              item.orderStatus === 'pending' && styles.pendingBadge,
              item.orderStatus === 'processing' && styles.processingBadge,
            ]}
          >
            <Text style={[
              styles.statusText,
              item.orderStatus === 'delivered' && styles.deliveredText,
              item.orderStatus === 'cancelled' && styles.cancelledText,
              item.orderStatus === 'pending' && styles.pendingText,
              item.orderStatus === 'processing' && styles.processingText,
            ]}>{item.orderStatus.toUpperCase()}</Text>
            {item.orderStatus !== 'cancelled' && item.orderStatus !== 'delivered' && (
              <Ionicons name="caret-down" size={12} color="#4CAF50" />
            )}
          </TouchableOpacity>
          {(item.orderStatus === 'delivered' || item.orderStatus === 'cancelled') && (
            <TouchableOpacity
              onPress={() => handleDeleteOrder(item._id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color="#FF5252" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={16} color="#666" />
        <Text style={styles.customer}>{item.user?.fullName} ({item.user?.email})</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.address}>{item.shippingAddress?.address}, {item.shippingAddress?.city}</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.totalLabel}>Total Amount:</Text>
        <Text style={styles.totalValue}>Rs. {item.totalAmount.toFixed(2)}</Text>
      </View>

      <View style={styles.itemsContainer}>
        <Text style={styles.itemsHeader}>Ordered Items:</Text>
        {item.items.map((i, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemText}>• {i.product?.name}{i.size ? ` (${i.size})` : ''}</Text>
            <Text style={styles.itemQty}>x {i.quantity}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Order Requests</Text>
          <Text style={styles.headerSubtitle}>Manage store orders</Text>
        </View>
      </View>

      {renderFilterTabs()}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1B5E20" />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No orders found for {filter} status.</Text>
            </View>
          }
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Status</Text>
            <Text style={styles.modalSubtitle}>Select the next state for this order:</Text>
            {nextStatuses.map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.modalButton}
                onPress={() => confirmStatusUpdate(status)}
              >
                <Text style={styles.modalButtonText}>{status.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingTop: 16,
    marginBottom: 8
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#0D2D1D' },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: -2 },
  
  filterContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 16, 
    marginBottom: 16,
  },
  filterTab: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#1B5E20', 
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#FFF'
  },
  activeFilterTab: { backgroundColor: '#1B5E20' },
  filterTabText: { color: '#1B5E20', fontSize: 13, fontWeight: '600' },
  activeFilterTabText: { color: '#FFF' },

  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 18, fontWeight: '700', color: '#0D2D1D' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 12 },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  statusText: { fontSize: 12, marginRight: 4, fontWeight: '700' },
  deliveredBadge: { backgroundColor: '#E8F5E9' },
  deliveredText: { color: '#2E7D32' },
  cancelledBadge: { backgroundColor: '#FFEBEE' },
  cancelledText: { color: '#C62828' },
  pendingBadge: { backgroundColor: '#FFF3E0' },
  pendingText: { color: '#E65100' },
  processingBadge: { backgroundColor: '#E3F2FD' },
  processingText: { color: '#1565C0' },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  customer: { fontSize: 14, color: '#333', marginLeft: 10, fontWeight: '500' },
  dateText: { fontSize: 12, color: '#666' },
  address: { fontSize: 14, color: '#666', marginLeft: 10, flex: 1 },
  
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  totalLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#1B5E20' },

  itemsContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F7F9F7',
    borderRadius: 12,
  },
  itemsHeader: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemText: { fontSize: 14, color: '#444', flex: 1, fontWeight: '500' },
  itemQty: { fontSize: 14, fontWeight: '600', color: '#666' },
  
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  deleteButton: { marginLeft: 10, backgroundColor: '#FFF0F0', padding: 8, borderRadius: 10 },
  deliveredCard: { backgroundColor: '#F1F8E9', borderColor: '#C5E1A5', borderWidth: 1 },
  
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#999', fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, width: '85%', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#0D2D1D', marginBottom: 8 },
  modalSubtitle: { fontSize: 15, color: '#666', marginBottom: 24, textAlign: 'center' },
  modalButton: { backgroundColor: '#1B5E20', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 16, width: '100%', alignItems: 'center', marginBottom: 12 },
  modalButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  cancelButton: { paddingVertical: 12, width: '100%', alignItems: 'center' },
  cancelButtonText: { color: '#999', fontSize: 15, fontWeight: '600' },
});
