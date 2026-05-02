import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView, ActivityIndicator, Image } from 'react-native';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import TextField from '../../../components/ui/TextField';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../../../api/store.api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getApiBaseUrl } from '../../../api/getApiBaseUrl';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [sizes, setSizes] = useState({ XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prodRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name || !price || !category) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price.toString());
    formData.append('stock', stock.toString() || '0');
    formData.append('category', category);

    if (category === 'Merchandise') {
      formData.append('sizes', JSON.stringify(sizes));
    }

    if (image && !image.startsWith('http') && !image.startsWith('/')) {
      // It's a local URI picked from image picker
      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      formData.append('image', { uri: image, name: filename, type });
    } else if (image) {
      // Keep existing image URL if not changed
      formData.append('images', image);
    }

    try {
      if (isEditing) {
        await updateProduct(selectedProduct._id, formData);
      } else {
        await createProduct(formData);
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Could not save product');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete', onPress: async () => {
          await deleteProduct(id);
          fetchData();
        }
      }
    ]);
  };

  const openModal = (product = null) => {
    if (product) {
      setIsEditing(true);
      setSelectedProduct(product);
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setCategory(product.category);
      setImage(product.images?.[0] || '');
      setSizes(product.sizes || { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
    } else {
      setIsEditing(false);
      setSelectedProduct(null);
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategory(Array.isArray(categories) && categories.length > 0 ? categories[0]._id : '');
      setImage('');
      setSizes({ XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
    }
    setDropdownVisible(false);
    setModalVisible(true);
  };

  const renderProductItem = ({ item }) => (
    <View key={item._id} style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSub}>Price: Rs. {item.price.toFixed(2)} | Stock: {item.category === 'Merchandise' && item.sizes ? Object.values(item.sizes).reduce((a, b) => a + (b || 0), 0) : item.stock}</Text>
        <Text style={styles.cardCat}>{item.category}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openModal(item)}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <PrimaryButton title="Add New Product" onPress={() => openModal()} style={styles.addBtn} textColor="white" />
      </View>
      <Text style={styles.sectionHeading}>Our Products</Text>

      {loading ? <ActivityIndicator size="large" /> : (
        <ScrollView contentContainerStyle={styles.list}>
          {(Array.isArray(categories) ? categories : []).map((cat) => {
            const catProducts = products.filter(p => p.category === cat.name);
            return (
              <View key={cat._id} style={styles.categorySection}>
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                >
                  <Text style={styles.categoryHeaderText}>{cat.name}</Text>
                  <Ionicons name={expandedCategory === cat.name ? "chevron-up" : "chevron-down"} size={20} color="#333" />
                </TouchableOpacity>

                {expandedCategory === cat.name && (
                  <View style={styles.categoryContent}>
                    {catProducts.length === 0 ? (
                      <Text style={styles.noProductsText}>No products in this category.</Text>
                    ) : (
                      catProducts.map(item => renderProductItem({ item }))
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="slide">
        <ScreenContainer>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Product' : 'Add Product'}</Text>
            <TextField label="Product Name" value={name} onChangeText={setName} />
            <TextField label="Description" value={description} onChangeText={setDescription} multiline />
            <TextField label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />

            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            >
              <Text style={styles.dropdownButtonText}>
                {category || 'Select Category'}
              </Text>
              <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color="#666" />
            </TouchableOpacity>

            {dropdownVisible && (
              <ScrollView style={styles.dropdownMenu} nestedScrollEnabled={true}>
                {(Array.isArray(categories) ? categories : []).map(cat => (
                  <TouchableOpacity
                    key={cat._id}
                    style={[styles.dropdownItem, category === cat._id && styles.selectedDropdownItem]}
                    onPress={() => {
                      setCategory(cat._id);
                      setDropdownVisible(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, category === cat._id && styles.selectedDropdownItemText]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {category !== 'Merchandise' && (
              <TextField label="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" />
            )}

            {category === 'Merchandise' && (
              <View style={styles.sizesContainer}>
                <Text style={styles.label}>Sizes Stock</Text>
                <View style={styles.sizesGrid}>
                  {Object.keys(sizes).map((size) => (
                    <View key={size} style={styles.sizeInputContainer}>
                      <Text style={styles.sizeLabel}>{size}</Text>
                      <TextField
                        value={sizes[size].toString()}
                        onChangeText={(val) => setSizes({ ...sizes, [size]: parseInt(val) || 0 })}
                        keyboardType="numeric"
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}

            <Text style={styles.label}>Product Image</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image
                  source={{ uri: image.startsWith('/') ? `${getApiBaseUrl().replace('/api', '')}${image}` : image }}
                  style={styles.previewImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color="#999" />
                  <Text style={styles.imagePlaceholderText}>Tap to select image</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <PrimaryButton title="Cancel" onPress={() => setModalVisible(false)} style={styles.modalBtnCancel} />
              <PrimaryButton title="Save Product" onPress={handleSave} style={styles.modalBtnSave} textColor="white" />
            </View>
          </ScrollView>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16 },
  sectionHeading: { fontSize: 22, fontWeight: '700', color: '#333', marginLeft: 16, marginBottom: 8 },
  list: { padding: 16, paddingBottom: 100 },
  categorySection: { marginBottom: 16, backgroundColor: '#F9F9F9', borderRadius: 12, overflow: 'hidden' },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#E8F5E9' },
  categoryHeaderText: { fontSize: 18, fontWeight: '700', color: '#2E7D32' },
  categoryContent: { padding: 12 },
  noProductsText: { color: '#666', fontWeight: '500', textAlign: 'center', marginVertical: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 8, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', elevation: 2 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 14, color: '#666' },
  cardCat: { fontSize: 12, color: '#4CAF50', marginTop: 4 },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  editBtn: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  editBtnText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  deleteBtnText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '700',
  },
  modalScroll: { padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 8, marginTop: 16, fontWeight: '600' },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dropdownMenu: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    maxHeight: 200,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedDropdownItem: {
    backgroundColor: '#E8F5E9',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#666',
  },
  selectedDropdownItemText: {
    color: '#4CAF50',
    fontWeight: '700',
  },
  imagePicker: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: '#F9F9F9',
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#666',
    fontWeight: '500',
  },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 40 },
  modalBtnCancel: { flex: 1, backgroundColor: '#9E9E9E' },
  modalBtnSave: { flex: 1, backgroundColor: '#2E7D32' },
  addBtn: { backgroundColor: '#2E7D32', marginHorizontal: 0 },
  sizesContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  sizesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sizeInputContainer: {
    width: '30%',
    marginBottom: 10,
  },
  sizeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
});
