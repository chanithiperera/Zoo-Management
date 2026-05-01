import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useCart } from '../../context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import StatusModal from '../../components/ui/StatusModal';

import { getApiBaseUrl } from '../../api/getApiBaseUrl';

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, updateQuantity, totalAmount } = useCart();
  const [modalConfig, setModalConfig] = useState({ visible: false, type: 'success', title: '', message: '' });

  const handleIncrement = (item) => {
    const { product, quantity } = item;
    let availableStock = product.stock;

    if (product.category === 'Merchandise' && product.selectedSize) {
      availableStock = product.sizes ? product.sizes[product.selectedSize] : 0;
    }

    if (quantity >= availableStock) {
      setModalConfig({
        visible: true,
        type: 'error',
        title: 'Limit Reached',
        message: `Sorry, we only have ${availableStock} units of this item in stock.`
      });
    } else {
      updateQuantity(product._id, quantity + 1, product.selectedSize);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/100';
    if (url.startsWith('/')) return `${getApiBaseUrl().replace('/api', '')}${url}`;
    return url;
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: getImageUrl(item.product.images?.[0]) }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.product.name}</Text>
        {item.product.selectedSize && (
          <Text style={styles.itemSize}>Size: {item.product.selectedSize}</Text>
        )}
        <Text style={styles.itemPrice}>Rs. {item.product.price.toFixed(2)}</Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            onPress={() => updateQuantity(item.product._id, item.quantity - 1, item.product.selectedSize)}
            style={styles.qtyBtn}
          >
            <Ionicons name="remove-circle-outline" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => handleIncrement(item)}
            style={styles.qtyBtn}
          >
            <Ionicons name="add-circle-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => removeFromCart(item.product._id, item.product.selectedSize)}
        style={styles.removeBtn}
      >
        <Ionicons name="trash-outline" size={24} color="#FF5252" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer>
      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item) => `${item.product._id}-${item.product.selectedSize || 'no-size'}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={100} color="#EEE" />
            <Text style={styles.emptyText}>Your cart is empty.</Text>
            <PrimaryButton
              title="Start Shopping"
              onPress={() => navigation.navigate('CategoryList')}
              style={styles.shopBtn}
            />
          </View>
        }
      />

      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Items Subtotal</Text>
            <Text style={styles.totalValue}>Rs. {totalAmount.toFixed(2)}</Text>
          </View>
          <PrimaryButton
            title="Proceed to Checkout"
            onPress={() => navigation.navigate('Checkout')}
          />
        </View>
      )}
      <StatusModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={() => setModalConfig({ ...modalConfig, visible: false })}
        onClose={() => setModalConfig({ ...modalConfig, visible: false })}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemSize: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '700',
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyText: {
    fontSize: 16,
    marginHorizontal: 12,
    fontWeight: '700',
  },
  removeBtn: {
    padding: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 20,
    fontWeight: '600',
  },
  shopBtn: {
    marginTop: 30,
    width: '60%',
  },
});
