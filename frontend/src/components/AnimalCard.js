import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const AnimalCard = ({ animal, onBookFeeding, onBookPhotography }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: animal.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{animal.name}</Text>
        <Text style={styles.description}>{animal.description}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.feedingButton]} 
            onPress={() => onBookFeeding(animal)}
          >
            <Text style={styles.buttonText}>Book Feeding</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.photographyButton]} 
            onPress={() => onBookPhotography(animal)}
          >
            <Text style={styles.buttonText}>Book Photography</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedingButton: {
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  photographyButton: {
    backgroundColor: '#2196F3',
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default AnimalCard;
