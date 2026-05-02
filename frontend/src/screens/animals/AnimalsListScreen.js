import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, TextInput, ActivityIndicator, Text, TouchableOpacity, Linking, ImageBackground, Dimensions, RefreshControl, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24;
import { fetchAnimals } from '../../api/animalsApi';
import AnimalCard from '../../components/animals/AnimalCard';
import CategoryFilter from '../../components/animals/CategoryFilter';
import { Ionicons } from '@expo/vector-icons';

import { useFocusEffect } from '@react-navigation/native';

const QUIZZES = [
  {
    id: 'daily-challenge',
    title: 'Daily Zoo Master',
    subtitle: '5 Questions • Fun Facts',
    image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=800&auto=format&fit=crop',
    icon: 'trophy',
    color: '#FFD700'
  },
  {
    id: 'mammal-expert',
    title: 'Mammal Expert',
    subtitle: '8 Questions • Anatomy',
    image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=800&auto=format&fit=crop',
    icon: 'paw',
    color: '#4CAF50'
  },
  {
    id: 'bird-watcher',
    title: 'Bird Watcher',
    subtitle: '6 Questions • Habitats',
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30fc3e?q=80&w=800&auto=format&fit=crop',
    icon: 'airplane',
    color: '#2196F3'
  },
  {
    id: 'reptile-king',
    title: 'Reptile King',
    subtitle: '5 Questions • Survival',
    image: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?q=80&w=800&auto=format&fit=crop',
    icon: 'flame',
    color: '#FF5722'
  }
];

const INFOGRAPHICS = [
  {
    title: "Butterfly Life Cycle",
    type: "Life Cycle",
    imageUrl: "https://images.unsplash.com/photo-1545191143-698f219154a4?q=80&w=800&auto=format&fit=crop",
    description: "The incredible transformation from a tiny egg to a beautiful Monarch butterfly.",
    points: ["Egg: Laid on milkweed leaves.", "Larva: The caterpillar eats non-stop.", "Pupa: Inside the chrysalis, the body melts and reforms.", "Adult: Emerges to begin the cycle again."]
  },
  {
    title: "Elephant Anatomy",
    type: "Anatomy",
    imageUrl: "https://images.unsplash.com/photo-1581852017103-68ac65514cf7?q=80&w=800&auto=format&fit=crop",
    description: "The African Elephant is a masterpiece of natural engineering.",
    points: ["Trunk: 40,000 muscles for precision.", "Ears: Large surface area for cooling.", "Tusks: Elongated incisor teeth for digging.", "Skin: 2.5cm thick for protection."]
  },
  {
    title: "Tiger: Built for Power",
    type: "Anatomy",
    imageUrl: "https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?q=80&w=800&auto=format&fit=crop",
    description: "Every part of the Bengal Tiger is designed for the perfect hunt.",
    points: ["Eyes: 6x better night vision than humans.", "Claws: Fully retractable for silent walking.", "Teeth: 3-inch canines for powerful grip.", "Tail: Helps with balance during fast turns."]
  }
];

const AnimalsListScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('information'); // 'information' or 'education'
  
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const loadAnimals = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const response = await fetchAnimals(search, category);
      setAnimals(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sync Data: Refresh every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadAnimals();
    }, [search, category])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAnimals(true);
  };

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

  const handleCategorySelect = (cat) => {
    if (cat === 'Education') {
      navigation.navigate('Education');
    } else {
      setCategory(cat);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search animals..."
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <View style={styles.educationHighlightContainer}>
        <TouchableOpacity 
          style={styles.educationHighlightButton}
          onPress={() => navigation.navigate('Education')}
        >
          <View style={styles.educationHighlightContent}>
            <View style={styles.educationIconCircle}>
              <Ionicons name="school" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.educationHighlightTitle}>Zoo Education Hub</Text>
              <Text style={styles.educationHighlightSubtitle}>Quizzes, Life Cycles & Habitat Maps</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 60 }}>
        <CategoryFilter selectedCategory={category} onSelectCategory={handleCategorySelect} />
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  educationHighlightContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  educationHighlightButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  educationHighlightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  educationIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  educationHighlightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  educationHighlightSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
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
    
  },
  listContainer: {
    padding: 16,
  },
  educationTabWrapper: {
    flex: 1,
    minHeight: 500,
    backgroundColor: '#FAFAFA',
  },
  educationScrollView: {
    flex: 1,
  },
  educationContent: {
    padding: 16,
    paddingBottom: 60,
  },
  eduHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  eduHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    
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
    
  },
  sectionHeader: {
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    
  },
  infographicList: {
    paddingBottom: 24,
  },
  infoCard: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  infoCardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f5f5f5',
  },
  infoCardContent: {
    padding: 12,
  },
  infoCardType: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    
  },
  quizGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quizSmallCard: {
    width: cardWidth,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 4,
  },
  quizSmallImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  quizSmallOverlay: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  quizSmallBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quizSmallTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    
  },
  quizSmallSub: {
    fontSize: 10,
    color: '#ddd',
    
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
    
    marginBottom: 2,
  },
  educationCardSubtitle: {
    fontSize: 12,
    color: '#ddd',
    fontStyle: 'italic',
  },
});

export default AnimalsListScreen;
