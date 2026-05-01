import React from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  Text, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity 
} from 'react-native';
import AnimalCard from '../../components/AnimalCard';

const animals = [
  {
    id: '1',
    name: 'Parrots',
    description: 'Get up close and personal with our colorful and intelligent parrots. Experience the joy of feeding them directly from your hands.',
    image: 'https://images.unsplash.com/photo-1522814041793-1df25026210f?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '2',
    name: 'Deer',
    description: 'Enjoy a peaceful encounter with our gentle deer herd. A perfect opportunity for families to connect with nature.',
    image: 'https://images.unsplash.com/photo-1484406561678-5a49c63b4fec?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '3',
    name: 'Giraffe',
    description: 'Stand eye-to-eye with these gentle giants! Book an exclusive feeding session and capture the perfect towering selfie.',
    image: 'https://images.unsplash.com/photo-1547474261-24874da80b0c?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '4',
    name: 'Zebra',
    description: 'Witness the striking patterns of our zebras in a guided photography session. Capture stunning wildlife moments.',
    image: 'https://images.unsplash.com/photo-1526437340632-47525287f3bd?auto=format&fit=crop&q=80&w=600',
  },
];

export default function AnimalListScreen({ navigation }) {
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

      <FlatList
        data={animals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnimalCard
            animal={item}
            onBookFeeding={handleBookFeeding}
            onBookPhotography={handleBookPhotography}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
});
