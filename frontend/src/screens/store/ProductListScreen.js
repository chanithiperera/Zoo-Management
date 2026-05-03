import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { getProducts } from '../../api/store.api';
import { Ionicons } from '@expo/vector-icons';

import { resolveProductImageUri } from '../../api/getApiBaseUrl';
import { STORE_PRODUCT_PLACEHOLDER } from '../../constants/storeAssets';

/** If DB has a stale/broken URL, fall back after load error instead of a grey box. */
function ProductGridImage({ uri, style }) {
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => {
    setLoadFailed(false);
  }, [uri]);
  const useRemote = Boolean(uri && !loadFailed);
  return (
    <Image
      source={useRemote ? { uri } : STORE_PRODUCT_PLACEHOLDER}
      style={style}
      resizeMode="cover"
      onError={() => setLoadFailed(true)}
    />
  );
}

export default function ProductListScreen({ route, navigation }) {
  const { categoryId, categoryName } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  const fetchProducts = async () => {
    try {
      const response = await getProducts({ category: categoryId });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalStock = (item) => {
    if (item.category === 'Merchandise' && item.sizes) {
      return Object.values(item.sizes).reduce((acc, val) => acc + (val || 0), 0);
    }
    return item.stock || 0;
  };

  const renderProductItem = ({ item }) => {
    const totalStock = getTotalStock(item);
    const imageUri = resolveProductImageUri(item.images);
    return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { productId: item._id })}
    >
      <ProductGridImage uri={imageUri} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>Rs. {item.price.toFixed(2)}</Text>
        <View style={styles.stockBadge}>
          <Text style={styles.stockText}>{totalStock > 0 ? 'In Stock' : 'Out of Stock'}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No products found in this category.</Text>
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
    padding: 8,
  },
  productCard: {
    flex: 1,
    maxWidth: '46%',
    backgroundColor: '#FFF',
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#ECEFF1',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 8,
  },
  stockBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  stockText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
