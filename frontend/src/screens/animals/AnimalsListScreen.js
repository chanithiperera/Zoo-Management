import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, TextInput, ActivityIndicator, Text, TouchableOpacity, Linking, ImageBackground, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24;
import { fetchAnimals } from '../../api/animalsApi';
import AnimalCard from '../../components/animals/AnimalCard';
import CategoryFilter from '../../components/animals/CategoryFilter';
import { Ionicons } from '@expo/vector-icons';

const AnimalsListScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('information'); // 'information' or 'education'
  
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const loadAnimals = async () => {
    setLoading(true);
    try {
      const response = await fetchAnimals(search, category);
      setAnimals(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAnimals();
    }, 500); // debounce search
    return () => clearTimeout(timer);
  }, [search, category]);

  const educationItems = useMemo(() => {
    const items = [];
    animals.forEach(animal => {
      if (animal.educationContent) {
        animal.educationContent.forEach(content => {
          if (content.type === 'quiz' || content.type === 'game') {
            items.push({ ...content, animalName: animal.name });
          }
        });
      }
    });
    return items;
  }, [animals]);

  const openUrl = (url) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  const renderAnimalItem = ({ item }) => (
    <AnimalCard 
      animal={item} 
      onPress={() => navigation.navigate('AnimalDetailScreen', { id: item._id })} 
    />
  );

  const getIconForType = (type) => {
    switch(type) {
      case 'video': return 'play-circle';
      case 'game': return 'game-controller';
      case 'quiz': return 'help-circle';
      case 'activity': return 'color-palette';
      case 'article':
      default: return 'document-text';
    }
  };

  const renderEducationItem = ({ item }) => {
    const fallbackImage = 'https://via.placeholder.com/300';
    const cardImage = item.imageUrl || fallbackImage;
    return (
      <TouchableOpacity style={styles.squareCard} onPress={() => openUrl(item.url)} activeOpacity={0.8}>
        <ImageBackground source={{ uri: cardImage }} style={styles.cardImageBackground} resizeMode="cover">
          <View style={styles.cardOverlay}>
            <View style={styles.educationTypeRow}>
              <Ionicons name={getIconForType(item.type)} size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.educationTypeBadge}>{item.type.toUpperCase()}</Text>
            </View>
            <Text style={styles.educationCardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.educationCardSubtitle} numberOfLines={1}>{item.animalName}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'information' && styles.activeTabButton]} 
          onPress={() => setActiveTab('information')}
        >
          <Text style={[styles.tabText, activeTab === 'information' && styles.activeTabText]}>Information</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'education' && styles.activeTabButton]} 
          onPress={() => setActiveTab('education')}
        >
          <Text style={[styles.tabText, activeTab === 'education' && styles.activeTabText]}>Education</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'information' ? (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search animals..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <View style={{ height: 60 }}>
            <CategoryFilter selectedCategory={category} onSelectCategory={setCategory} />
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#2E7D32" />
            </View>
          ) : animals.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No animals found.</Text>
            </View>
          ) : (
            <FlatList
              data={animals}
              keyExtractor={(item) => item._id}
              renderItem={renderAnimalItem}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      ) : (
        // Education Tab
        <View style={styles.educationContainer}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#2E7D32" />
            </View>
          ) : educationItems.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No educational content available.</Text>
            </View>
          ) : (
            <FlatList
              data={educationItems}
              keyExtractor={(item, index) => `${item.animalName}-${index}`}
              renderItem={renderEducationItem}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  activeTabButton: {
    backgroundColor: '#2E7D32',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    fontFamily: 'Dosis_600SemiBold',
  },
  activeTabText: {
    color: '#fff',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Dosis_400Regular',
  },
  listContainer: {
    padding: 16,
  },
  educationContainer: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Dosis_500Medium',
  },
  squareCard: {
    width: cardWidth,
    height: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  cardOverlay: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  educationTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  educationTypeBadge: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  educationCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Dosis_700Bold',
    marginBottom: 2,
  },
  educationCardSubtitle: {
    fontSize: 12,
    color: '#ddd',
    fontStyle: 'italic',
  },
});

export default AnimalsListScreen;
