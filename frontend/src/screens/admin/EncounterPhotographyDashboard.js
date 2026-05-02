import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';

export default function EncounterPhotographyDashboard({ navigation }) {
  const menuItems = [
    {
      title: 'Photographer Management',
      subtitle: 'Add, edit or remove photographers',
      icon: '🪪',
      screen: 'PhotographerManagement',
    },
    {
      title: 'Time Slot Management',
      subtitle: 'Create and assign slots for sessions',
      icon: '🕓',
      screen: 'TimeSlotManagement',
    },
    {
      title: 'Booking Management',
      subtitle: 'View, approve or reject bookings',
      icon: '📅',
      screen: 'PhotographyBookingManagement',
    },
    {
      title: 'Photo Uploads',
      subtitle: 'Upload photos for completed sessions',
      icon: '📸',
      screen: 'PhotoUpload',
    },
    {
      title: 'Animal Management',
      subtitle: 'Manage animals and their photos',
      icon: '🐧',
      screen: 'AnimalManagement',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Encounter & Photography</Text>
        <Text style={styles.subtitle}>Management Dashboard</Text>
      </View>

      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFF',
    width: '48%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  icon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#777',
    lineHeight: 16,
  },
});
