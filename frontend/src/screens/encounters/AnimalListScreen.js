import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  Text, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import AnimalCard from '../../components/AnimalCard';
import apiClient from '../../api/client';
import { getStaticBaseUrl } from '../../api/getApiBaseUrl';

export default function AnimalListScreen({ navigation }) {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/animals');
      if (response.data.success) {
        setAnimals(response.data.data);
      }
    } catch (error) {
      console.error('Fetch animals error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBookFeeding = (animal) => {
    navigation.navigate('Booking', { animal, type: 'Feeding' });
  };

  const handleBookPhotography = (animal) => {
    navigation.navigate('Booking', { animal, type: 'Photography' });
  };

  const handleViewMemories = () => {
    navigation.navigate('PhotoGallery');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Animal Encounters</Text>
            <Text style={styles.subtitle}>Relive the zoo magic</Text>
          </View>
          <TouchableOpacity style={styles.memoryBtn} onPress={handleViewMemories}>
            <Text style={styles.memoryBtnIcon}>📸</Text>
            <Text style={styles.memoryBtnText}>Memories</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={animals}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const staticBase = getStaticBaseUrl();
            const imageUrl = item.imageUrl?.startsWith('http') 
              ? item.imageUrl 
              : `${staticBase}${item.imageUrl}`;
              
            return (
              <AnimalCard
                animal={{
                  ...item,
                  image: imageUrl
                }}
                onBookFeeding={() => handleBookFeeding(item)}
                onBookPhotography={() => handleBookPhotography(item)}
              />
            );
          }}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAnimals(); }} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No encounter animals available right now.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  memoryBtn: {
    backgroundColor: '#E3F2FD',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  memoryBtnIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  memoryBtnText: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 13,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  }
});
