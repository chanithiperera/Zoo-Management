import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Dimensions, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { fetchRandomFact } from '../../api/animalsApi';
import { getAllQuizzes } from '../../api/quiz.api';
import { buildVisitorQuizDecks } from './visitorQuizDecks';

const { width } = Dimensions.get('window');

const REGIONS = [
  { id: 'africa', name: 'Africa', icon: '🌍', animals: ['Lion', 'Ostrich', 'Elephant', 'Giraffe', 'Zebra', 'Hippopotamus'], top: '55%', left: '50%' },
  { id: 'asia', name: 'Asia', icon: '🌏', animals: ['Bengal Tiger', 'Cobra', 'Krait', 'Peacock', 'Sri Lankan Leopard', 'Blue Mormon', 'Atlas Moth', 'Black Ruby Barb'], top: '40%', left: '70%' },
  { id: 'americas', name: 'Americas', icon: '🌎', animals: ['Jaguar', 'Python', 'Pit Viper', 'Eagle', 'Macaw', 'Monarch Butterfly', 'Brown Bear', 'Sea Lion'], top: '45%', left: '25%' },
  { id: 'australia', name: 'Australia', icon: '🇦🇺', animals: ['Pelican', 'Lionfish', 'Goldfish', 'Kangaroo', 'Koala', 'Platypus'], top: '75%', left: '85%' },
];

const PREDEFINED_FACTS = [
  { animalName: 'Lion', fact: 'A lion\'s roar can be heard from up to 8 kilometers away.' },
  { animalName: 'Elephant', fact: 'Elephants can recognize themselves in mirrors.' },
  { animalName: 'Giraffe', fact: 'Giraffes have the same number of neck vertebrae as humans: seven.' },
  { animalName: 'Butterfly', fact: 'Butterflies taste with their feet to find the right leaves for eggs.' },
  { animalName: 'Tiger', fact: 'No two tigers have the same stripes; they are as unique as fingerprints.' }
];

const EducationScreen = ({ navigation }) => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [randomFact, setRandomFact] = useState(PREDEFINED_FACTS[Math.floor(Math.random() * PREDEFINED_FACTS.length)]);
  const [factLoading, setFactLoading] = useState(false);
  const [quizDecks, setQuizDecks] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [quizzesError, setQuizzesError] = useState('');

  const loadQuizzes = useCallback(async () => {
    setQuizzesLoading(true);
    setQuizzesError('');
    try {
      const res = await getAllQuizzes();
      const rows = res?.data ?? [];
      setQuizDecks(buildVisitorQuizDecks(rows));
    } catch {
      setQuizzesError('Could not load quizzes.');
      setQuizDecks([]);
    } finally {
      setQuizzesLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadQuizzes();
    }, [loadQuizzes])
  );

  const loadRandomFact = async () => {
    setFactLoading(true);
    try {
      const response = await fetchRandomFact();
      if (response.success && response.data) {
        setRandomFact(response.data);
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.log('Falling back to local facts:', error.message);
      // Fallback to a different random local fact than the current one
      const otherFacts = PREDEFINED_FACTS.filter(f => f.fact !== randomFact?.fact);
      const fallback = otherFacts[Math.floor(Math.random() * otherFacts.length)];
      setRandomFact(fallback);
    } finally {
      // Add a slight delay so the user sees the "loading" state
      setTimeout(() => setFactLoading(false), 500);
    }
  };

  useEffect(() => {
    loadRandomFact();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Zoo Education Hub</Text>
      </View>

      {/* Did You Know Section */}
      <View style={styles.factCard}>
        <View style={styles.factHeader}>
          <Text style={styles.factTitle}>Did You Know?</Text>
          <TouchableOpacity onPress={loadRandomFact} disabled={factLoading}>
            <Ionicons 
              name="refresh-circle" 
              size={28} 
              color={factLoading ? '#ccc' : '#2E7D32'} 
            />
          </TouchableOpacity>
        </View>
        
        <View>
          <Text style={styles.factText}>“{randomFact?.fact}”</Text>
          <Text style={styles.factSource}>— {randomFact?.animalName}</Text>
        </View>
      </View>

      {/* Global Habitats Section */}
      <Text style={styles.sectionTitle}>Global Habitats</Text>
      <Text style={styles.sectionSubTitle}>Tap a region to see who lives there!</Text>
      
      <View style={styles.mapContainer}>
        <ImageBackground 
          source={require('../../../assets/infographics/world-map.jpg')} 
          style={styles.mapImage}
          imageStyle={{ borderRadius: 16 }}
        >
          {REGIONS.map(region => (
            <TouchableOpacity 
              key={region.id}
              style={[styles.regionTag, { top: region.top, left: region.left }]}
              onPress={() => setSelectedRegion(region)}
            >
              <Text style={styles.regionIcon}>{region.icon}</Text>
              <View style={styles.regionPulse} />
            </TouchableOpacity>
          ))}
        </ImageBackground>
      </View>

      {selectedRegion && (
        <View style={styles.regionInfoBox}>
          <Text style={styles.regionName}>{selectedRegion.name} Residents</Text>
          <View style={styles.animalChipContainer}>
            {selectedRegion.animals.map(animal => (
              <View key={animal} style={styles.animalChip}>
                <Text style={styles.animalChipText}>{animal}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedRegion(null)}>
            <Ionicons name="close-circle" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Interactive Quizzes</Text>
      {quizzesLoading ? (
        <View style={styles.quizLoading}>
          <ActivityIndicator size="small" color="#2E7D32" />
          <Text style={styles.quizLoadingText}>Loading quizzes…</Text>
        </View>
      ) : quizzesError ? (
        <Text style={styles.quizErrorText}>{quizzesError}</Text>
      ) : quizDecks.length === 0 ? (
        <Text style={styles.quizEmptyText}>
          No quizzes yet. Admins can add questions under Animal Information and Education for each species.
        </Text>
      ) : (
        <View style={styles.grid}>
          {quizDecks.map((deck) => (
            <TouchableOpacity
              key={deck.animalId}
              style={[styles.card, { width: width - 40 }]}
              onPress={() =>
                navigation.navigate('QuizScreen', {
                  animalId: deck.animalId,
                  quizTitle: deck.title,
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`Start ${deck.title}`}
            >
              <ImageBackground source={{ uri: deck.imageUri }} style={styles.image}>
                <View style={styles.overlay}>
                  <View style={styles.badge}>
                    <Ionicons name="extension-puzzle-outline" size={16} color="#333" />
                  </View>
                  <Text style={styles.cardTitle}>{deck.title}</Text>
                  <Text style={styles.cardSub}>{deck.subtitle}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 20,
    color: '#333',
  },
  sectionSubTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  factCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFECB3',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  factHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  factTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8F00',
    flex: 1,
  },
  factText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    fontStyle: 'italic',
  },
  factSource: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 8,
    textAlign: 'right',
  },
  mapContainer: {
    width: '100%',
    height: 350,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  regionTag: {
    position: 'absolute',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2E7D32',
    zIndex: 10,
  },
  regionIcon: {
    fontSize: 18,
  },
  regionPulse: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(46, 125, 50, 0.2)',
    zIndex: -1,
  },
  regionInfoBox: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
    position: 'relative',
  },
  regionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  animalChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  animalChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  animalChipText: {
    fontSize: 12,
    color: '#444',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quizLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  quizLoadingText: {
    fontSize: 14,
    color: '#666',
  },
  quizErrorText: {
    fontSize: 14,
    color: '#c62828',
    marginTop: 4,
    marginBottom: 8,
  },
  quizEmptyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 8,
  },
  card: {
    height: 180,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  overlay: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardSub: {
    color: '#ddd',
    fontSize: 10,
  },
});

export default EducationScreen;
