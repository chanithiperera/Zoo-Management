import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { getProductById } from '../../api/store.api';
import { useCart } from '../../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

import { getApiBaseUrl } from '../../api/getApiBaseUrl';

export default function ProductDetailsScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeGuideVisible, setSizeGuideVisible] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await getProductById(productId);
      setProduct(response.data.data);
    } catch (error) {
      console.error('Error fetching product', error);
      Alert.alert('Error', 'Could not load product details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    let availableStock = product.stock;
    if (product.category === 'Merchandise') {
      if (!selectedSize) {
        Alert.alert('Select Size', 'Please select a size first.');
        return;
      }
      availableStock = product.sizes ? product.sizes[selectedSize] : 0;
    }

    if (availableStock < quantity) {
      Alert.alert('Out of Stock', 'Sorry, we don\'t have enough stock for this selection.');
      return;
    }

    // Pass size to cart if needed, assuming addToCart accepts a size parameter or we can bundle it
    // For now, I will append size to the product name or add a size property
    const productToAdd = { ...product, selectedSize };

    addToCart(productToAdd, quantity);
    Alert.alert(
      'Added to Cart',
      `${product.name} has been added to your cart.`,
      [
        { text: 'Continue Shopping' },
        { text: 'Go to Cart', onPress: () => navigation.navigate('Cart') }
      ]
    );
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/300';
    if (url.startsWith('/')) return `${getApiBaseUrl().replace('/api', '')}${url}`;
    return url;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!product) return null;

  return (
    <ScreenContainer>
      <ScrollView>
        <Image
          source={{ uri: getImageUrl(product.images?.[0]) }}
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.price}>Rs. {product.price.toFixed(2)}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {product.category === 'Merchandise' && (
            <View style={styles.section}>
              <View style={styles.sizeHeader}>
                <Text style={styles.sectionTitle}>Select Size</Text>
                <TouchableOpacity onPress={() => setSizeGuideVisible(true)}>
                  <Text style={styles.sizeGuideText}>Size Guide</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sizesContainer}>
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                  const stock = product.sizes ? product.sizes[size] : 0;
                  const isOutOfStock = stock <= 0;
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeBtn,
                        selectedSize === size && styles.sizeBtnSelected,
                        isOutOfStock && styles.sizeBtnDisabled
                      ]}
                      onPress={() => !isOutOfStock && setSelectedSize(size)}
                      disabled={isOutOfStock}
                    >
                      <Text style={[
                        styles.sizeText,
                        selectedSize === size && styles.sizeTextSelected,
                        isOutOfStock && styles.sizeTextDisabled
                      ]}>{size}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <PrimaryButton
            title="Add to Cart"
            onPress={handleAddToCart}
            disabled={(product.category !== 'Merchandise' && product.stock <= 0) || (product.category === 'Merchandise' && (!selectedSize || (product.sizes && product.sizes[selectedSize] <= 0)))}
            style={styles.addBtn}
          />
        </View>
      </ScrollView>

      <Modal visible={sizeGuideVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Size Guide</Text>
            <Image
              source={{ uri: 'https://www.skinnydiplondon.com/cdn/shop/files/NEW_Hoodies-Size-Guide.jpg?v=1741000377&width=1350' }}
              style={styles.sizeGuideImage}
              resizeMode="contain"
            />
            <PrimaryButton title="Close" onPress={() => setSizeGuideVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  name: {
    fontSize: 28,
    fontFamily: 'Dosis_700Bold',
    color: '#333',
  },
  category: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 10,
    fontFamily: 'Dosis_600SemiBold',
  },
  price: {
    fontSize: 24,
    fontFamily: 'Dosis_700Bold',
    color: 'green',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Dosis_700Bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    alignSelf: 'flex-start',
    borderRadius: 8,
    padding: 4,
  },
  qtyBtn: {
    padding: 8,
  },
  qtyText: {
    fontSize: 18,
    fontFamily: 'Dosis_700Bold',
    marginHorizontal: 20,
  },
  addBtn: {
    marginTop: 10,
    marginBottom: 40,
  },
  sizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sizeGuideText: {
    color: '#2196F3',
    fontFamily: 'Dosis_600SemiBold',
    textDecorationLine: 'underline',
  },
  sizesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sizeBtn: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
  },
  sizeBtnSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  sizeBtnDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#EEE',
  },
  sizeText: {
    fontFamily: 'Dosis_600SemiBold',
    color: '#333',
  },
  sizeTextSelected: {
    color: '#FFF',
  },
  sizeTextDisabled: {
    color: '#AAA',
    textDecorationLine: 'line-through',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Dosis_700Bold',
    marginBottom: 15,
  },
  sizeGuideImage: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
});
