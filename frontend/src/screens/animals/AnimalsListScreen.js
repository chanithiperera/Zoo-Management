import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, ActivityIndicator, Text } from 'react-native';
import { fetchAnimals } from '../../api/animalsApi';
import AnimalCard from '../../components/animals/AnimalCard';
import CategoryFilter from '../../components/animals/CategoryFilter';

const AnimalsListScreen = ({ navigation }) => {
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

  const renderItem = ({ item }) => (
    <AnimalCard 
      animal={item} 
      onPress={() => navigation.navigate('AnimalDetailScreen', { id: item._id })} 
    />
  );

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
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
});

export default AnimalsListScreen;
