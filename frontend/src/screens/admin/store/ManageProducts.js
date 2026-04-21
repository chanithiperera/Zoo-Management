import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView, ActivityIndicator } from 'react-native';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import TextField from '../../../components/ui/TextField';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../../../api/store.api';
import { Ionicons } from '@expo/vector-icons';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');

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

  const handleSave = async () => {
    if (!name || !price || !category) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    const productData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      category,
      images: image ? [image] : []
    };

    try {
      if (isEditing) {
        await updateProduct(selectedProduct._id, productData);
      } else {
        await createProduct(productData);
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
      { text: 'Delete', onPress: async () => {
        await deleteProduct(id);
        fetchData();
      }}
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
    } else {
      setIsEditing(false);
      setSelectedProduct(null);
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategory(Array.isArray(categories) && categories.length > 0 ? categories[0]._id : '');
      setImage('');
    }
    setDropdownVisible(false);
    setModalVisible(true);
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSub}>Price: ${item.price.toFixed(2)} | Stock: {item.stock}</Text>
        <Text style={styles.cardCat}>{item.category}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => openModal(item)}><Ionicons name="pencil" size={20} color="#2196F3" /></TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)} style={{marginLeft: 15}}><Ionicons name="trash" size={20} color="#F44336" /></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <PrimaryButton title="Add New Product" onPress={() => openModal()} />
      </View>

      {loading ? <ActivityIndicator size="large" /> : (
        <FlatList data={products} renderItem={renderProductItem} keyExtractor={item => item._id} contentContainerStyle={styles.list} />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <ScreenContainer>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Product' : 'Add Product'}</Text>
            <TextField label="Product Name" value={name} onChangeText={setName} />
            <TextField label="Description" value={description} onChangeText={setDescription} multiline />
            <TextField label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
            <TextField label="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" />
            
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

            <TextField label="Image URL" value={image} onChangeText={setImage} />
            
            <View style={styles.modalButtons}>
              <PrimaryButton title="Cancel" onPress={() => setModalVisible(false)} style={styles.modalBtnCancel} />
              <PrimaryButton title="Save Product" onPress={handleSave} style={styles.modalBtnSave} />
            </View>
          </ScrollView>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16 },
  list: { padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', elevation: 2 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontFamily: 'Dosis_700Bold' },
  cardSub: { fontSize: 14, color: '#666' },
  cardCat: { fontSize: 12, color: '#4CAF50', marginTop: 4 },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  modalScroll: { padding: 20 },
  modalTitle: { fontSize: 24, fontFamily: 'Dosis_700Bold', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 8, marginTop: 16, fontFamily: 'Dosis_600SemiBold' },
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
    fontFamily: 'Dosis_500Medium',
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
    fontFamily: 'Dosis_700Bold',
  },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 40 },
  modalBtnCancel: { flex: 1, backgroundColor: '#9E9E9E' },
  modalBtnSave: { flex: 1 },
});
