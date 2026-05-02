import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24; // 2 columns with padding

const AnimalCard = ({ animal, onPress }) => {
  const isAtlasMoth = animal.name === 'Atlas Moth';
  const localImage = isAtlasMoth ? require('../../../assets/animals/atlas-moth.jpg') : null;
  const imageUrl = animal.images && animal.images.length > 0 ? animal.images[0] : 'https://via.placeholder.com/300';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <ImageBackground 
        source={isAtlasMoth ? localImage : { uri: imageUrl }} 
        style={styles.imageBackground} 
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.name} numberOfLines={1}>{animal.name}</Text>
          <Text style={styles.species} numberOfLines={1}>{animal.species}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{animal.category}</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    height: cardWidth, // Make it a perfect square
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
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end', // Align the overlay to the bottom
  },
  overlay: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
    fontFamily: 'Dosis_700Bold',
  },
  species: {
    fontSize: 12,
    color: '#ddd',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
});

export default AnimalCard;

