import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

const CATEGORIES = ['All', 'Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish', 'Insect'];

const CategoryFilter = ({ selectedCategory, onSelectCategory }) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <TouchableOpacity
            key={category}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelectCategory(category)}
            activeOpacity={0.7}
          >
            <Text style={[styles.text, isSelected && styles.textSelected]}>
              {category}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#2E7D32',
  },
  text: {
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Dosis_600SemiBold',
  },
  textSelected: {
    color: '#fff',
  },
});

export default CategoryFilter;
