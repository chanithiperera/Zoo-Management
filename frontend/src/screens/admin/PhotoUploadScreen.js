import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../../api/client';
import { getApiBaseUrl, getStaticBaseUrl } from '../../api/getApiBaseUrl';
import { getToken } from '../../services/tokenStorage';

export default function PhotoUploadScreen({ route, navigation }) {
  const [images, setImages] = useState([]);
  const [caption, setCaption] = useState('');
  const [description, setDescription] = useState('');
  const [bestMoment, setBestMoment] = useState('');
  const [uploading, setUploading] = useState(false);

  // Saved photos list
  const [savedPhotos, setSavedPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const staticBase = getStaticBaseUrl();

  useEffect(() => {
    fetchSavedPhotos();
  }, []);

  const fetchSavedPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const response = await apiClient.get('/photos');
      if (response.data.success) setSavedPhotos(response.data.data);
    } catch (error) {
      console.error('Fetch photos error:', error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is needed.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      Alert.alert('Photos Missing', 'Please select at least one photo.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      
      formData.append('caption', caption || 'Zoo Memory');
      formData.append('description', description || '');
      formData.append('bestMoment', bestMoment || '');

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        try {
          const response = await fetch(image.uri);
          const blob = await response.blob();
          formData.append('photos', blob, `photo_${Date.now()}_${i}.jpg`);
        } catch (blobError) {
          formData.append('photos', {
            uri: image.uri,
            name: `photo_${i}.jpg`,
            type: 'image/jpeg'
          });
        }
      }

      const baseUrl = getApiBaseUrl();
      const token = await getToken();

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${baseUrl}/photos`);
      xhr.setRequestHeader('Accept', 'application/json');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.onload = () => {
        setUploading(false);
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status === 201 || xhr.status === 200 || res.success) {
            Alert.alert('Success ✨', 'The memory has been saved!');
            setImages([]);
            setCaption('');
            setDescription('');
            setBestMoment('');
            fetchSavedPhotos();
          } else {
            Alert.alert('Upload Error', res.message || 'The server rejected the photos.');
          }
        } catch (e) {
          Alert.alert('Error', 'Server response was not readable.');
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        Alert.alert('Network Error', 'Could not reach the server. Is it running?');
      };

      xhr.send(formData);

    } catch (error) {
      setUploading(false);
      Alert.alert('Error', 'Something went wrong during the upload process.');
    }
  };

  const handleDelete = (photo) => {
    if (Platform.OS === 'web') {
      const ok = window.confirm(`Delete this memory "${photo.caption || 'Untitled'}"?`);
      if (ok) processDelete(photo._id);
    } else {
      Alert.alert(
        'Delete Memory',
        `Are you sure you want to delete "${photo.caption || 'Untitled'}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => processDelete(photo._id) }
        ]
      );
    }
  };

  const processDelete = async (id) => {
    try {
      setSavedPhotos(prev => prev.filter(p => p._id !== id));
      await apiClient.delete(`/photos/${id}`);
    } catch (error) {
      Alert.alert('Error', 'Could not delete this memory.');
      fetchSavedPhotos();
    }
  };

  const renderSavedPhoto = ({ item }) => {
    const firstImg = item.photos?.[0];
    const imgUrl = firstImg
      ? (firstImg.startsWith('http') ? firstImg : `${staticBase}${firstImg}`)
      : null;

    return (
      <View style={styles.savedCard}>
        {imgUrl && <Image source={{ uri: imgUrl }} style={styles.savedImg} />}
        <View style={styles.savedInfo}>
          <Text style={styles.savedCaption} numberOfLines={1}>{item.caption || 'Zoo Memory'}</Text>
          {item.bestMoment ? <Text style={styles.savedMoment} numberOfLines={1}>⭐ {item.bestMoment}</Text> : null}
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.title}>Upload Memories</Text>
            <Text style={styles.subtitle}>Relive the zoo magic</Text>
          </View>

          {/* Choose Photos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Choose Photos</Text>
            <TouchableOpacity style={styles.pickBtn} onPress={pickImages}>
              <Text style={styles.pickBtnText}>📷 Select Photos</Text>
            </TouchableOpacity>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
              {images.map((img, idx) => (
                <View key={idx} style={styles.previewWrapper}>
                  <Image source={{ uri: img.uri }} style={styles.previewImg} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(idx)}>
                    <Text style={styles.removeBtnText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Memory Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Memory Details</Text>
            <TextInput style={styles.input} value={caption} onChangeText={setCaption} placeholder="Title" />
            <TextInput style={styles.input} value={bestMoment} onChangeText={setBestMoment} placeholder="Highlight" />
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={description} 
              onChangeText={setDescription} 
              placeholder="Tell the story of these moments..."
              multiline
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, (uploading || images.length === 0) && styles.disabledBtn]} 
            onPress={handleUpload}
            disabled={uploading || images.length === 0}
          >
            {uploading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>✨ Save & Share Memories</Text>
            )}
          </TouchableOpacity>

          {/* Saved Memories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Memories</Text>
            {loadingPhotos ? (
              <ActivityIndicator color="#4CAF50" style={{ marginTop: 20 }} />
            ) : savedPhotos.length === 0 ? (
              <Text style={styles.emptyText}>No saved memories yet.</Text>
            ) : (
              savedPhotos.map(item => (
                <View key={item._id}>
                  {renderSavedPhoto({ item })}
                </View>
              ))
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  scroll: { padding: 20 },
  header: { marginBottom: 30 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 15, color: '#666', marginTop: 4 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  pickBtn: { backgroundColor: '#FFF', borderStyle: 'dashed', borderWidth: 2, borderColor: '#4CAF50', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  pickBtnText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 16 },
  previewScroll: { flexDirection: 'row' },
  previewWrapper: { width: 100, height: 100, marginRight: 10, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  previewImg: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(255,0,0,0.8)', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: '#FFF', fontWeight: 'bold' },
  input: { backgroundColor: '#FFF', borderRadius: 10, padding: 15, fontSize: 15, borderWidth: 1, borderColor: '#EEE', marginBottom: 10 },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  submitBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  disabledBtn: { backgroundColor: '#CCC' },
  savedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, marginBottom: 12, overflow: 'hidden', elevation: 2 },
  savedImg: { width: 70, height: 70 },
  savedInfo: { flex: 1, padding: 10 },
  savedCaption: { fontWeight: 'bold', fontSize: 15, color: '#1A1A1A' },
  savedMoment: { fontSize: 12, color: '#666', marginTop: 3 },
  deleteBtn: { padding: 15 },
  deleteBtnText: { fontSize: 20 },
  emptyText: { color: '#999', textAlign: 'center', marginTop: 10 },
});
