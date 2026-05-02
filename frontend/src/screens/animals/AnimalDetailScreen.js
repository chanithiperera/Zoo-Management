import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Dimensions, Linking, TouchableOpacity } from 'react-native';
import { fetchAnimalById } from '../../api/animalsApi';
import { Ionicons } from '@expo/vector-icons'; // Assuming Expo vector icons are available

const { width } = Dimensions.get('window');

const AnimalDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchAnimalById(id);
        setAnimal(response.data);
        navigation.setOptions({ title: response.data.name });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const openUrl = (url) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!animal) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Animal not found</Text>
      </View>
    );
  }

  const isAtlasMoth = animal.name === 'Atlas Moth';
  const localImage = isAtlasMoth ? require('../../../assets/animals/atlas-moth.jpg') : null;
  const imageUrl = animal.images && animal.images.length > 0 ? animal.images[0] : 'https://via.placeholder.com/400';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Image 
        source={isAtlasMoth ? localImage : { uri: imageUrl }} 
        style={styles.headerImage} 
      />
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{animal.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{animal.conservationStatus}</Text>
          </View>
        </View>
        
        <Text style={styles.species}>{animal.species}</Text>
        
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{animal.description}</Text>
        
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Ionicons name="leaf-outline" size={20} color="#2E7D32" />
            <Text style={styles.infoLabel}>Diet:</Text>
            <Text style={styles.infoValue}>{animal.diet}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="earth-outline" size={20} color="#2E7D32" />
            <Text style={styles.infoLabel}>Habitat:</Text>
            <Text style={styles.infoValue}>{animal.habitat}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#2E7D32" />
            <Text style={styles.infoLabel}>Lifespan:</Text>
            <Text style={styles.infoValue}>{animal.lifespan || 'Unknown'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="barbell-outline" size={20} color="#2E7D32" />
            <Text style={styles.infoLabel}>Weight:</Text>
            <Text style={styles.infoValue}>{animal.weight || 'Unknown'}</Text>
          </View>
        </View>

        {animal.funFacts && animal.funFacts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fun Facts</Text>
            {animal.funFacts.map((fact, index) => (
              <View key={index} style={styles.factRow}>
                <View style={styles.bulletPoint} />
                <Text style={styles.factText}>{fact}</Text>
              </View>
            ))}
          </View>
        )}

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#D32F2F',
    fontFamily: 'Dosis_600SemiBold',
  },
  headerImage: {
    width: width,
    height: 250,
  },
  content: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#fff',
    marginTop: -24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    fontFamily: 'Dosis_700Bold',
  },
  badge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#E65100',
    fontSize: 12,
    fontWeight: 'bold',
  },
  species: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 16,
    marginBottom: 12,
    fontFamily: 'Dosis_700Bold',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#444',
    marginBottom: 16,
    fontFamily: 'Dosis_400Regular',
  },
  infoBox: {
    backgroundColor: '#F1F8E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    marginRight: 4,
    width: 60,
  },
  infoValue: {
    flex: 1,
    color: '#444',
  },
  section: {
    marginTop: 16,
    marginBottom: 40,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingRight: 16,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
    marginTop: 8,
    marginRight: 12,
  },
  factText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    flex: 1,
  },
});

export default AnimalDetailScreen;
