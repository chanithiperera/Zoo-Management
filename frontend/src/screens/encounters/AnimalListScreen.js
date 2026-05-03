import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EncounterAnimalCard from '../../components/encounters/EncounterAnimalCard';
import apiClient from '../../api/client';
import { resolveUploadsFileUri } from '../../api/getApiBaseUrl';
import { theme } from '../../constants/theme';

export default function AnimalListScreen({ navigation }) {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/encounter-animals');
      if (response.data.success) {
        setAnimals(response.data.data);
      }
    } catch (error) {
      console.error('Fetch animals error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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
          <View style={styles.headerText}>
            <Text style={styles.title}>Animal Encounters</Text>
            <Text style={styles.subtitle}>Book feeding or photography sessions at the zoo</Text>
          </View>
          <TouchableOpacity
            style={styles.memoryBtn}
            onPress={handleViewMemories}
            accessibilityRole="button"
            accessibilityLabel="Open photo memories gallery"
          >
            <Ionicons name="images-outline" size={20} color={theme.colors.linkGreen} style={{ marginRight: 6 }} />
            <Text style={styles.memoryBtnText}>Memories</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={theme.colors.accentGreen} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={animals}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const raw = item.imageUrl && String(item.imageUrl).trim();
            const imageUrl =
              raw &&
              (resolveUploadsFileUri(raw) || (raw.startsWith('http') ? raw : null));

            return (
              <EncounterAnimalCard
                animal={{
                  ...item,
                  image: imageUrl || 'https://via.placeholder.com/600x400/cccccc/666666?text=Photo',
                }}
                onBookFeeding={() => handleBookFeeding(item)}
                onBookPhotography={() => handleBookPhotography(item)}
              />
            );
          }}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchAnimals();
              }}
              colors={[theme.colors.accentGreen]}
              tintColor={theme.colors.accentGreen}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No encounter animals available right now.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundAlt,
  },
  header: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomLeftRadius: theme.radii.lg,
    borderBottomRightRadius: theme.radii.lg,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.hero,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.accentGreen,
    marginTop: 4,
    opacity: 0.9,
  },
  memoryBtn: {
    backgroundColor: theme.colors.welcomeBackground,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  memoryBtnText: {
    color: theme.colors.linkGreen,
    fontWeight: '700',
    fontSize: theme.fontSize.sm,
  },
  listContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: theme.colors.primaryText,
    opacity: 0.55,
    fontSize: theme.fontSize.body,
  },
});
