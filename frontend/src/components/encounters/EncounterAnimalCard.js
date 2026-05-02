import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

const EncounterAnimalCard = ({ animal, onBookFeeding, onBookPhotography }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: animal.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{animal.name}</Text>
        <Text style={styles.description} numberOfLines={3}>
          {animal.description}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.feedingButton]}
            onPress={() => onBookFeeding(animal)}
          >
            <Ionicons name="nutrition-outline" size={18} color={theme.colors.white} style={styles.btnIcon} />
            <Text style={styles.buttonText}>Book Feeding</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.photographyButton]}
            onPress={() => onBookPhotography(animal)}
          >
            <Ionicons name="camera-outline" size={18} color={theme.colors.black} style={styles.btnIcon} />
            <Text style={[styles.buttonText, styles.photographyButtonText]}>Book Photography</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    backgroundColor: theme.colors.sage,
  },
  infoContainer: {
    padding: theme.spacing.md,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: theme.colors.primaryText,
    opacity: 0.72,
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.radii.sm,
    marginHorizontal: 4,
  },
  btnIcon: {
    marginRight: 6,
  },
  feedingButton: {
    backgroundColor: theme.colors.accentGreen,
  },
  photographyButton: {
    backgroundColor: theme.colors.yellowAlt,
    borderWidth: 1,
    borderColor: theme.colors.yellow,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  photographyButtonText: {
    color: theme.colors.black,
  },
});

export default EncounterAnimalCard;
