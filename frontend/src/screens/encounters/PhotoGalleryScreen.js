import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator,
  Dimensions,
  Alert,
  ScrollView,
  RefreshControl,
  Linking,
  Platform
} from 'react-native';
import apiClient from '../../api/client';
import { getStaticBaseUrl } from '../../api/getApiBaseUrl';

const { width } = Dimensions.get('window');

export default function PhotoGalleryScreen({ route, navigation }) {
  const { bookingId: filterBookingId } = route.params || {};
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const staticBase = getStaticBaseUrl();

  useEffect(() => {
    fetchMemories();
  }, [filterBookingId]);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/photos');
      
      if (response.data.success) {
        const rawPhotos = response.data.data;
        
        // GROUP PHOTOS BY BOOKING ID TO CREATE "MEMORY CARDS"
        const grouped = rawPhotos.reduce((acc, photo) => {
          const bId = photo.booking?._id || photo.booking;
          if (!acc[bId]) {
            acc[bId] = {
              _id: bId,
              caption: photo.caption,
              description: photo.description,
              bestMoment: photo.bestMoment,
              createdAt: photo.createdAt,
              images: []
            };
          }
          acc[bId].images.push(photo.imageUrl);
          return acc;
        }, {});

        const sortedMemories = Object.values(grouped).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMemories(sortedMemories);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSaveMemory = (imagePath) => {
    const fullUrl = imagePath.startsWith('http') ? imagePath : `${staticBase}${imagePath}`;
    
    if (Platform.OS === 'web') {
      window.open(fullUrl, '_blank');
      return;
    }

    Linking.openURL(fullUrl).catch(err => {
      console.error('Failed to open URL:', err);
      Alert.alert('Error', 'Could not open the image viewer.');
    });
  };

  const renderMemory = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardCaption}>{item.caption || 'Zoo Memory'}</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        pagingEnabled 
        style={styles.imgScroll}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {item.images.map((img, idx) => (
          <View key={idx} style={styles.imgWrapper}>
            <Image 
              source={{ uri: img.startsWith('http') ? img : `${staticBase}${img}` }} 
              style={styles.mainImg} 
            />
            {item.images.length > 1 && (
              <View style={styles.imgBadge}>
                <Text style={styles.imgBadgeText}>{idx + 1} / {item.images.length}</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.miniSaveBtn} 
              onPress={() => handleSaveMemory(img)}
            >
              <Text style={styles.miniSaveText}>📥</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.cardBody}>
        {item.bestMoment ? (
          <View style={styles.bestMomentBox}>
            <Text style={styles.bestLabel}>✨ BEST MOMENT</Text>
            <Text style={styles.bestValue}>{item.bestMoment}</Text>
          </View>
        ) : null}

        <Text style={styles.description}>{item.description || 'Enjoy these captured moments from your special day.'}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          <TouchableOpacity 
            style={styles.downloadBtn} 
            onPress={() => handleSaveMemory(item.images[0])}
          >
            <Text style={styles.downloadBtnText}>📥 Save Main Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Zoo Memories</Text>
        <Text style={styles.subtitle}>Relive the magic of your encounters</Text>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={memories}
          keyExtractor={item => item._id}
          renderItem={renderMemory}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMemories(); }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📸</Text>
              <Text style={styles.emptyTitle}>Memories Coming Soon</Text>
              <Text style={styles.emptySub}>Your beautiful photos are being prepared. They will appear here shortly!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  header: { padding: 25, backgroundColor: '#FFF', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 4 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 15, color: '#666', marginTop: 4 },
  list: { padding: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 20, marginBottom: 25, overflow: 'hidden', elevation: 3 },
  cardCaption: { fontSize: 18, fontWeight: 'bold', padding: 15, color: '#333' },
  imgScroll: { width: '100%', height: 300 },
  imgWrapper: { width: width - 30, height: 300, position: 'relative' },
  mainImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  imgBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  imgBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  cardBody: { padding: 15 },
  bestMomentBox: { backgroundColor: '#FFF9C4', padding: 10, borderRadius: 10, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#FBC02D' },
  bestLabel: { fontSize: 10, fontWeight: 'bold', color: '#F57F17', marginBottom: 2 },
  bestValue: { fontSize: 15, fontWeight: '600', color: '#333' },
  description: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 15 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 15 },
  dateText: { fontSize: 12, color: '#999' },
  downloadBtn: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  downloadBtnText: { color: '#2196F3', fontWeight: 'bold', fontSize: 12 },
  miniSaveBtn: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(255,255,255,0.9)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
  miniSaveText: { fontSize: 18 },
  empty: { alignItems: 'center', marginTop: 80, padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  emptySub: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 10, lineHeight: 20 },
});
