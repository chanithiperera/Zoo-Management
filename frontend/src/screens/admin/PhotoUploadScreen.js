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
import { getApiBaseUrl } from '../../api/getApiBaseUrl';
import { getToken } from '../../services/tokenStorage';

export default function PhotoUploadScreen({ route, navigation }) {
  const [bookingId, setBookingId] = useState(route.params?.bookingId || '');
  const [visitorName, setVisitorName] = useState(route.params?.visitorName || '');
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  const [images, setImages] = useState([]);
  const [caption, setCaption] = useState('');
  const [description, setDescription] = useState('');
  const [bestMoment, setBestMoment] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!bookingId) fetchBookings();
  }, [bookingId]);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await apiClient.get('/photography-bookings');
      if (response.data.success) setBookings(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingBookings(false);
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
    if (!bookingId) {
      Alert.alert('Selection Missing', 'Please select a visitor first.');
      return;
    }
    if (images.length === 0) {
      Alert.alert('Photos Missing', 'Please select at least one photo.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      
      // 1. Add metadata
      formData.append('booking', bookingId);
      formData.append('caption', caption || 'Zoo Memory');
      formData.append('description', description || '');
      formData.append('bestMoment', bestMoment || '');

      // 2. CONVERT URIs TO BLOBS (The most reliable way for multipart)
      console.log('Converting images to blobs...');
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        try {
          const response = await fetch(image.uri);
          const blob = await response.blob();
          
          // Append as a file with a name and type
          formData.append('photos', blob, `photo_${Date.now()}_${i}.jpg`);
        } catch (blobError) {
          console.error('Blob conversion failed for image', i, blobError);
          // Fallback to standard URI method if blob fails
          formData.append('photos', {
            uri: image.uri,
            name: `photo_${i}.jpg`,
            type: 'image/jpeg'
          });
        }
      }

      const baseUrl = getApiBaseUrl();
      const token = await getToken();

      console.log('Sending multipart request to:', `${baseUrl}/photos`);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${baseUrl}/photos`);
      
      xhr.setRequestHeader('Accept', 'application/json');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.onload = () => {
        setUploading(false);
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status === 201 || xhr.status === 200 || res.success) {
            Alert.alert('Success ✨', 'The memory has been shared!');
            navigation.goBack();
          } else {
            // Show the detailed debug message from the server
            Alert.alert('Upload Error', res.message || 'The server rejected the photos.');
            console.log('Server Error:', res);
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
      console.error('Upload Error:', error);
      Alert.alert('Error', 'Something went wrong during the upload process.');
    }
  };

  const renderBooking = ({ item }) => (
    <TouchableOpacity 
      style={[styles.bookingCard, bookingId === item._id && styles.activeBooking]}
      onPress={() => { setBookingId(item._id); setVisitorName(item.visitorName); }}
    >
      <Text style={[styles.bookingName, bookingId === item._id && styles.activeText]}>{item.visitorName}</Text>
      <Text style={[styles.bookingDate, bookingId === item._id && styles.activeText]}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.title}>Upload Memories</Text>
            <Text style={styles.subtitle}>Relive the zoo magic</Text>
          </View>

          {!route.params?.bookingId && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Select Visitor</Text>
              {loadingBookings ? (
                <ActivityIndicator color="#2196F3" />
              ) : (
                <FlatList
                  horizontal
                  data={bookings}
                  keyExtractor={item => item._id}
                  renderItem={renderBooking}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 10 }}
                />
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Choose Photos</Text>
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Memory Details</Text>
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
            style={[styles.submitBtn, (uploading || !bookingId || images.length === 0) && styles.disabledBtn]} 
            onPress={handleUpload}
            disabled={uploading || !bookingId || images.length === 0}
          >
            {uploading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>✨ Save & Share Memories</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scroll: { padding: 20 },
  header: { marginBottom: 30 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 15, color: '#666', marginTop: 4 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  bookingCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginRight: 12, borderWidth: 1, borderColor: '#EEE', width: 140 },
  activeBooking: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  bookingName: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  bookingDate: { fontSize: 11, color: '#666', marginTop: 4 },
  activeText: { color: '#FFF' },
  pickBtn: { backgroundColor: '#FFF', borderStyle: 'dashed', borderWidth: 2, borderColor: '#2196F3', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  pickBtnText: { color: '#2196F3', fontWeight: 'bold', fontSize: 16 },
  previewScroll: { flexDirection: 'row' },
  previewWrapper: { width: 100, height: 100, marginRight: 10, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  previewImg: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(255,0,0,0.8)', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: '#FFF', fontWeight: 'bold' },
  input: { backgroundColor: '#FFF', borderRadius: 10, padding: 15, fontSize: 15, borderWidth: 1, borderColor: '#EEE', marginBottom: 10 },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  disabledBtn: { backgroundColor: '#CCC' },
});
