import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal } from 'react-native';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../../api/order.api';
import { Ionicons } from '@expo/vector-icons';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [nextStatuses, setNextStatuses] = useState([]);

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

  const renderOrderItem = ({ item }) => (
    <View style={[styles.card, item.orderStatus === 'delivered' && styles.deliveredCard]}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Order #{item._id.substring(item._id.length - 6)}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => handleUpdateStatus(item._id, item.orderStatus)}
            style={[
              styles.statusBadge,
              item.orderStatus === 'delivered' && styles.deliveredBadge,
              item.orderStatus === 'cancelled' && styles.cancelledBadge,
              (item.orderStatus === 'pending' || item.orderStatus === 'processing') && styles.activeBadge
            ]}
          >
            <Text style={[
              styles.statusText,
              item.orderStatus === 'delivered' && styles.deliveredText,
              item.orderStatus === 'cancelled' && styles.cancelledText,
              (item.orderStatus === 'pending' || item.orderStatus === 'processing') && styles.activeText
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

      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={14} color="#666" />
        <Text style={styles.customer}>{item.user?.fullName} ({item.user?.email})</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={14} color="#666" />
        <Text style={styles.dateText}>Ordered on: {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text style={styles.address}>{item.shippingAddress?.address}, {item.shippingAddress?.city}</Text>
      </View>

      <Text style={styles.total}>Total Amount: Rs. {item.totalAmount.toFixed(2)}</Text>

      <View style={styles.itemsContainer}>
        <Text style={styles.itemsHeader}>Ordered Items:</Text>
        {item.items.map((i, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemText}>• {i.product?.name}{i.size ? ` (${i.size})` : ''}</Text>
            <Text style={styles.itemQty}>Qty: {i.quantity}</Text>
          </View>
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
  list: { padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderId: { fontSize: 16, fontFamily: 'Dosis_700Bold' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20 },
  statusText: { fontSize: 11, marginRight: 4, fontFamily: 'Dosis_700Bold' },
  deliveredBadge: { backgroundColor: '#E8F5E9' },
  deliveredText: { color: '#2E7D32' },
  cancelledBadge: { backgroundColor: '#FFEBEE' },
  cancelledText: { color: '#C62828' },
  activeBadge: { backgroundColor: '#F1F8E9' },
  activeText: { color: '#558B2F' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  customer: { fontSize: 14, color: '#333', marginLeft: 8 },
  dateText: { fontSize: 13, color: '#666', marginLeft: 8 },
  total: { fontSize: 16, fontFamily: 'Dosis_700Bold', color: '#333', marginVertical: 8 },
  address: { fontSize: 13, color: '#666', marginLeft: 8 },
  itemsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50'
  },
  itemsHeader: { fontSize: 14, fontFamily: 'Dosis_700Bold', color: '#333', marginBottom: 6 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemText: { fontSize: 13, color: '#444', flex: 1 },
  itemQty: { fontSize: 13, fontFamily: 'Dosis_600SemiBold', color: '#666' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  deleteButton: { marginLeft: 12, padding: 4 },
  deliveredCard: { backgroundColor: '#F1F8E9', borderColor: '#C5E1A5', borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontFamily: 'Dosis_700Bold', color: '#333', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
  modalButton: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 12 },
  modalButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Dosis_700Bold' },
  cancelButton: { paddingVertical: 10, width: '100%', alignItems: 'center' },
  cancelButtonText: { color: '#666', fontSize: 14, fontFamily: 'Dosis_600SemiBold' },
});
