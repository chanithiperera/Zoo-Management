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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';
import { theme } from '../../constants/theme';
import { getApiBaseUrl, getStaticBaseUrl, resolveUploadsFileUri } from '../../api/getApiBaseUrl';
import { getToken } from '../../services/tokenStorage';

const ANIMAL_CATEGORIES = ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish', 'Insect'];

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
  const [category, setCategory] = useState('Mammal');
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const staticBase = getStaticBaseUrl();

  useEffect(() => {
    fetchAnimals();
  }, []);

  /** Android often returns `content://` URIs — copy to cache so multipart upload is reliable for Express/Multer. */
  async function resolveLocalImageForUpload(asset) {
    if (!asset?.uri) return null;
    const { uri } = asset;
    if (Platform.OS === 'web') return uri;
    if (Platform.OS === 'android' && uri.startsWith('content:')) {
      const ext = asset.mimeType?.includes('png') ? 'png' : 'jpg';
      const dest = `${FileSystem.cacheDirectory}animal-upload-${Date.now()}.${ext}`;
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    }
    return uri;
  }

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
      formData.append('age', age || '1');
      formData.append('feedingSchedule', feedingSchedule.trim() || 'Regular');
      formData.append('description', description.trim());
      formData.append('healthStatus', 'healthy');
      formData.append('category', category);

      if (image?.uri) {
        if (Platform.OS === 'web') {
          const blobResp = await fetch(image.uri);
          const blob = await blobResp.blob();
          formData.append('image', blob, image.fileName || `animal_${Date.now()}.jpg`);
        } else {
          const uploadUri = await resolveLocalImageForUpload(image);
          if (!uploadUri) {
            Alert.alert('Photo', 'Could not read the selected image. Try another photo.');
            return;
          }
          const mime = image.mimeType || 'image/jpeg';
          const fileName =
            image.fileName ||
            (mime.includes('png') ? `animal_${Date.now()}.png` : `animal_${Date.now()}.jpg`);
          formData.append('image', {
            uri: uploadUri,
            name: fileName,
            type: mime,
          });
        }
      }

      const apiBase = getApiBaseUrl().replace(/\/+$/, '');
      const endpoint = editingAnimal
        ? `${apiBase}/animals/${editingAnimal._id}`
        : `${apiBase}/animals`;
      const method = editingAnimal ? 'PATCH' : 'POST';

      const headers = { Accept: 'application/json' };
      const token = await getToken();
      if (token) headers.Authorization = `Bearer ${token}`;

      const fetchRes = await fetch(endpoint, { method, headers, body: formData });

      const rawText = await fetchRes.text();
      let payload;
      try {
        payload = rawText ? JSON.parse(rawText) : {};
      } catch {
        Alert.alert('Save failed', (rawText && rawText.slice(0, 240)) || 'Bad response from server');
        return;
      }

      if (!fetchRes.ok) {
        const errMsg =
          payload?.message || payload?.error || `HTTP ${fetchRes.status}: ${fetchRes.statusText}`;
        Alert.alert('Save failed', String(errMsg));
        return;
      }

      if (payload.success) {
        setFormModalVisible(false);
        resetForm();
        fetchAnimals();
      } else {
        Alert.alert('Error', payload.message || 'Save failed');
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'An error occurred.';
      Alert.alert('Error', String(msg));
    } finally {
      setSaving(false);
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
    setCategory(animal.category && ANIMAL_CATEGORIES.includes(animal.category) ? animal.category : 'Mammal');
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
    setCategory('Mammal');
    setImage(null);
  };

  const renderAnimalItem = ({ item }) => {
    const rawPath = item.imageUrl && String(item.imageUrl).trim();
    const displayUri =
      (rawPath && resolveUploadsFileUri(rawPath)) ||
      (rawPath && (rawPath.startsWith('http') ? rawPath : null));

    return (
      <View style={styles.animalCard}>
        {displayUri ? (
          <Image source={{ uri: displayUri }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImage, styles.cardImageFallback]} />
        )}
        <View style={styles.cardOverlay}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardSpecies}>{item.species}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteCircle}
              onPress={() => {
                setDeletingAnimal(item);
                setDeleteModalVisible(true);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${item.name}`}
            >
              <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
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
          placeholder="Search by name…"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading && animals.length === 0 ? (
        <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.accentGreen} /></View>
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
              <Text style={styles.listEmptyHint}>No animals found matching "{searchQuery}"</Text>
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
              <TouchableOpacity
                onPress={() => setFormModalVisible(false)}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={22} color={theme.colors.primaryText} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {ANIMAL_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[styles.categoryChip, category === c && styles.categoryChipActive]}
                >
                  <Text style={[styles.categoryChipText, category === c && styles.categoryChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.imagePickerLarge} onPress={pickImage}>
              {(() => {
                const existingRaw = editingAnimal?.imageUrl?.trim();
                const existingUri =
                  existingRaw &&
                  (resolveUploadsFileUri(existingRaw) ||
                    (existingRaw.startsWith('http') ? existingRaw : `${staticBase}${existingRaw}`));
                const pickerUri = image?.uri || existingUri;
                return pickerUri ? (
                  <Image source={{ uri: pickerUri }} style={styles.pickerImage} resizeMode="cover" />
                ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color={theme.colors.linkGreen} />
                  <Text style={styles.imagePlaceholderText}>Upload profile photo</Text>
                </View>
                );
              })()}
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
              {saving ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.submitBtnText}>Save Animal Profile</Text>}
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
  container: { flex: 1, backgroundColor: theme.colors.backgroundAlt },
  mainHeader: {
    padding: 25,
    backgroundColor: theme.colors.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchContainer: { padding: 20, marginTop: -15, zIndex: 5 },
  searchBar: {
    backgroundColor: theme.colors.white,
    borderRadius: 15,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    fontSize: theme.fontSize.body,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  greeting: { fontSize: 24, fontWeight: '700', color: theme.colors.primaryText },
  stats: { fontSize: 13, color: theme.colors.accentGreen, fontWeight: '600' },
  mainAddBtn: {
    backgroundColor: theme.colors.accentGreen,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
  },
  mainAddBtnText: { color: theme.colors.white, fontWeight: '700', fontSize: 13 },
  list: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listEmptyHint: { color: theme.colors.primaryText, opacity: 0.5, marginTop: 50 },
  animalCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    marginBottom: 20,
    height: 220,
    overflow: 'hidden',
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardImage: { width: '100%', height: '100%', position: 'absolute' },
  cardImageFallback: { backgroundColor: theme.colors.sage },
  cardOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', padding: 20, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardName: { fontSize: 22, fontWeight: '700', color: theme.colors.white },
  cardSpecies: { fontSize: 14, color: theme.colors.white, opacity: 0.85 },
  deleteCircle: { backgroundColor: 'rgba(255,255,255,0.9)', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cardFooter: { flexDirection: 'row' },
  editPill: { backgroundColor: theme.colors.white, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  editPillText: { color: theme.colors.linkGreen, fontWeight: '700', fontSize: 13 },
  modalBg: { flex: 1, backgroundColor: theme.colors.white },
  formScroll: { padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 26, fontWeight: '700', color: theme.colors.primaryText },
  closeBtn: {
    backgroundColor: theme.colors.welcomeBackground,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imagePickerLarge: {
    height: 200,
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: 25,
    marginBottom: 25,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: theme.colors.sage,
  },
  pickerImage: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderText: { color: theme.colors.primaryText, opacity: 0.5, marginTop: 10, fontWeight: '600' },
  categoryScroll: { marginBottom: 18, flexGrow: 0, maxHeight: 44 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  categoryChipActive: {
    borderColor: theme.colors.accentGreen,
    backgroundColor: theme.colors.sageButton,
  },
  categoryChipText: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.primaryText },
  categoryChipTextActive: { color: theme.colors.linkGreen },
  formGroup: { marginBottom: 20 },
  inputLabel: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.primaryText, opacity: 0.8, marginBottom: 8, marginLeft: 5 },
  inputField: {
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: 15,
    padding: 18,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  formRow: { flexDirection: 'row' },
  textArea: { height: 120, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: theme.colors.accentGreen,
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  submitBtnText: { color: theme.colors.white, fontSize: theme.fontSize.lg, fontWeight: '700' },
  deleteOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  deleteAlert: {
    backgroundColor: theme.colors.white,
    borderRadius: 25,
    padding: 25,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deleteTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.primaryText, marginBottom: 15 },
  deleteText: { fontSize: 15, color: theme.colors.primaryText, opacity: 0.7, textAlign: 'center', lineHeight: 22, marginBottom: 25 },
  deleteActions: { flexDirection: 'row', width: '100%' },
  deleteCancel: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 15,
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
  deleteCancelText: { fontWeight: '700', color: theme.colors.error },
  deleteConfirm: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: theme.colors.error,
  },
  deleteConfirmText: { color: theme.colors.white, fontWeight: '700' },
});
