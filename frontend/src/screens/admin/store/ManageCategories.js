import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import TextField from '../../../components/ui/TextField';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../../api/store.api';
import { Ionicons } from '@expo/vector-icons';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!categoryName) {
      Alert.alert('Error', 'Category name is required');
      return;
    }

    try {
      if (isEditing) {
        await updateCategory(selectedCategory._id, { name: categoryName, description: categoryDesc });
      } else {
        await createCategory({ name: categoryName, description: categoryDesc });
      }
      setModalVisible(false);
      fetchCategories();
    } catch (error) {
      Alert.alert('Error', 'Could not save category');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await deleteCategory(id);
              fetchCategories();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Could not delete category');
            }
          }
        }
      ]
    );
  };

  const openModal = (category = null) => {
    if (category) {
      setIsEditing(true);
      setSelectedCategory(category);
      setCategoryName(category.name);
      setCategoryDesc(category.description || '');
    } else {
      setIsEditing(false);
      setSelectedCategory(null);
      setCategoryName('');
      setCategoryDesc('');
    }
    setModalVisible(true);
  };

  const renderCategoryItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openModal(item)}>
          <Ionicons name="pencil-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id)}>
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <PrimaryButton
          title="Add New Category"
          onPress={() => openModal()}
          style={styles.addBtn}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Category' : 'Add Category'}</Text>
            <TextField
              label="Name"
              placeholder="e.g. Souvenirs"
              value={categoryName}
              onChangeText={setCategoryName}
            />
            <TextField
              label="Description"
              placeholder="Enter description"
              value={categoryDesc}
              onChangeText={setCategoryDesc}
              multiline={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
  },
  addBtn: {
    height: 45,
    color: '#4CAF50',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    padding: 8,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
  },
  cancelBtnText: {
    color: '#333',
    fontWeight: '600',
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
