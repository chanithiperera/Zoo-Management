import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../../api/client';
import { theme } from '../../constants/theme';
import { getApiBaseUrl, getStaticBaseUrl } from '../../api/getApiBaseUrl';
import { getToken } from '../../services/tokenStorage';

const { width } = Dimensions.get('window');

export default function AnimalManagementScreen() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  
  // Form State
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [deletingAnimal, setDeletingAnimal] = useState(null);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [age, setAge] = useState('1');
  const [feedingSchedule, setFeedingSchedule] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const staticBase = getStaticBaseUrl();

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/animals');
      if (response.data.success) setAnimals(response.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimals = animals.filter(animal => 
    animal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleSave = async () => {
    if (!name.trim() || !species.trim() || !description.trim()) {
      Alert.alert('Required', 'Please fill in Name, Species and Description');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('species', species.trim());
      formData.append('age', age || "1");
      formData.append('feedingSchedule', feedingSchedule.trim() || "Regular");
      formData.append('description', description.trim());
      formData.append('healthStatus', 'healthy');

      if (image) {
        const response = await fetch(image.uri);
        const blob = await response.blob();
        formData.append('image', blob, `animal_${Date.now()}.jpg`);
      }

      const baseUrl = getApiBaseUrl();
      const token = await getToken();

      const xhr = new XMLHttpRequest();
      const method = editingAnimal ? 'PATCH' : 'POST';
      const url = editingAnimal ? `${baseUrl}/animals/${editingAnimal._id}` : `${baseUrl}/animals`;

      xhr.open(method, url);
      xhr.setRequestHeader('Accept', 'application/json');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.onload = () => {
        setSaving(false);
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.success) {
            setFormModalVisible(false);
            resetForm();
            fetchAnimals();
          } else {
            Alert.alert('Error', res.message || 'Save failed');
          }
        } catch (e) {
          Alert.alert('Error', 'Server response error');
        }
      };
      xhr.onerror = () => { setSaving(false); Alert.alert('Network Error', 'Check connection'); };
      xhr.send(formData);

    } catch (error) {
      setSaving(false);
      Alert.alert('Error', 'An error occurred.');
    }
  };

  const confirmDelete = async () => {
    if (!deletingAnimal) return;
    try {
      setLoading(true);
      const id = deletingAnimal._id;
      
      // Standard Delete
      let response = await apiClient.delete(`/animals/${id}`);
      
      // Fallback
      if (!response.data.success) {
        response = await apiClient.post(`/animals/${id}`);
      }

      if (response.data.success) {
        setDeleteModalVisible(false);
        setDeletingAnimal(null);
        fetchAnimals();
      } else {
        Alert.alert('Issue', response.data.message);
      }
    } catch (error) {
      // Last resort fallback
      try {
        const id = deletingAnimal._id;
        const fallback = await apiClient.post(`/animals/${id}`);
        if (fallback.data.success) {
          setDeleteModalVisible(false);
          setDeletingAnimal(null);
          fetchAnimals();
          return;
        }
      } catch (e) {}
      Alert.alert('Error', 'Could not delete from server.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (animal) => {
    setEditingAnimal(animal);
    setName(animal.name);
    setSpecies(animal.species);
    setAge(animal.age?.toString() || '1');
    setFeedingSchedule(animal.feedingSchedule);
    setDescription(animal.description);
    setImage(null);
    setFormModalVisible(true);
  };

  const resetForm = () => {
    setEditingAnimal(null);
    setName('');
    setSpecies('');
    setAge('1');
    setFeedingSchedule('');
    setDescription('');
    setImage(null);
  };

  const renderAnimalItem = ({ item }) => {
    const imageUrl = item.imageUrl?.startsWith('http') 
      ? item.imageUrl 
      : `${staticBase}${item.imageUrl}`;

    return (
      <View style={styles.animalCard}>
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        <View style={styles.cardOverlay}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardSpecies}>{item.species}</Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteCircle} 
              onPress={() => { setDeletingAnimal(item); setDeleteModalVisible(true); }}
            >
              <Text style={{ fontSize: 16 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.editPill} onPress={() => openEditModal(item)}>
              <Text style={styles.editPillText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Zoo Manager</Text>
          <Text style={styles.stats}>{animals.length} Active Profiles</Text>
        </View>
        <TouchableOpacity 
          style={styles.mainAddBtn} 
          onPress={() => { resetForm(); setFormModalVisible(true); }}
        >
          <Text style={styles.mainAddBtnText}>+ Register Animal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchBar} 
          placeholder="🔍 Search by name..." 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading && animals.length === 0 ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>
      ) : (
        <FlatList
          data={filteredAnimals}
          keyExtractor={item => item._id}
          renderItem={renderAnimalItem}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchAnimals}
          numColumns={1}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: '#999', marginTop: 50 }}>No animals found matching "{searchQuery}"</Text>
            </View>
          }
        />
      )}

      {/* REGISTRATION MODAL */}
      <Modal visible={formModalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalBg}>
          <ScrollView contentContainerStyle={styles.formScroll}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingAnimal ? 'Update' : 'New'} Animal</Text>
              <TouchableOpacity onPress={() => setFormModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.imagePickerLarge} onPress={pickImage}>
              {(image || editingAnimal?.imageUrl) ? (
                <Image 
                  source={{ uri: image ? image.uri : (editingAnimal.imageUrl.startsWith('http') ? editingAnimal.imageUrl : `${staticBase}${editingAnimal.imageUrl}`) }} 
                  style={styles.pickerImage} 
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={{ fontSize: 40 }}>📸</Text>
                  <Text style={styles.imagePlaceholderText}>Upload Profile Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput style={styles.inputField} placeholder="Enter name" value={name} onChangeText={setName} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Species</Text>
              <TextInput style={styles.inputField} placeholder="Enter species" value={species} onChangeText={setSpecies} />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 15 }]}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput style={styles.inputField} placeholder="Age" keyboardType="numeric" value={age} onChangeText={setAge} />
              </View>
              <View style={[styles.formGroup, { flex: 2 }]}>
                <Text style={styles.inputLabel}>Feeding Schedule</Text>
                <TextInput style={styles.inputField} placeholder="e.g. 10:00 AM" value={feedingSchedule} onChangeText={setFeedingSchedule} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>About / History</Text>
              <TextInput 
                style={[styles.inputField, styles.textArea]} 
                placeholder="Share the animal's story..." 
                value={description} 
                onChangeText={setDescription} 
                multiline 
              />
            </View>

            <TouchableOpacity style={[styles.submitBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Save Animal Profile</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* DELETE CONFIRMATION MODAL (CUSTOM ALERT) */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.deleteOverlay}>
          <View style={styles.deleteAlert}>
            <Text style={styles.deleteTitle}>Delete Animal?</Text>
            <Text style={styles.deleteText}>
              Are you sure you want to remove <Text style={{fontWeight: 'bold'}}>{deletingAnimal?.name}</Text>? 
              This action cannot be undone.
            </Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity style={styles.deleteCancel} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteConfirm} onPress={confirmDelete}>
                <Text style={styles.deleteConfirmText}>Delete Forever</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  mainHeader: { padding: 25, backgroundColor: '#FFF', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  searchContainer: { padding: 20, marginTop: -15, zIndex: 5 },
  searchBar: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, fontSize: 16, borderWidth: 1, borderColor: '#EEE' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  stats: { fontSize: 13, color: '#4CAF50', fontWeight: '600' },
  mainAddBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 15 },
  mainAddBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  list: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  animalCard: { backgroundColor: '#FFF', borderRadius: 20, marginBottom: 20, height: 220, overflow: 'hidden', elevation: 4 },
  cardImage: { width: '100%', height: '100%', position: 'absolute' },
  cardOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', padding: 20, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardName: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  cardSpecies: { fontSize: 14, color: '#E0E0E0' },
  deleteCircle: { backgroundColor: 'rgba(255,255,255,0.9)', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cardFooter: { flexDirection: 'row' },
  editPill: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  editPillText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 13 },
  modalBg: { flex: 1, backgroundColor: '#FFF' },
  formScroll: { padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
  closeBtn: { backgroundColor: '#F0F2F5', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { fontSize: 18, color: '#666' },
  imagePickerLarge: { height: 200, backgroundColor: '#F0F2F5', borderRadius: 25, marginBottom: 25, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#DDD' },
  pickerImage: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderText: { color: '#999', marginTop: 10, fontWeight: '600' },
  formGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8, marginLeft: 5 },
  inputField: { backgroundColor: '#F0F2F5', borderRadius: 15, padding: 18, fontSize: 16, color: '#333' },
  formRow: { flexDirection: 'row' },
  textArea: { height: 120, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#4CAF50', padding: 20, borderRadius: 18, alignItems: 'center', marginTop: 10, elevation: 3 },
  submitBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  deleteOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  deleteAlert: { backgroundColor: '#FFF', borderRadius: 25, padding: 25, width: '100%', alignItems: 'center' },
  deleteTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15 },
  deleteText: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 25 },
  deleteActions: { flexDirection: 'row', width: '100%' },
  deleteCancel: { flex: 1, padding: 15, alignItems: 'center', marginRight: 10, borderRadius: 15, backgroundColor: '#F0F2F5' },
  deleteCancelText: { fontWeight: 'bold', color: '#666' },
  deleteConfirm: { flex: 1, padding: 15, alignItems: 'center', borderRadius: 15, backgroundColor: '#FF5252' },
  deleteConfirmText: { color: '#FFF', fontWeight: 'bold' },
});
