import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import { Ionicons } from '@expo/vector-icons';

export default function AdminStoreDashboard({ navigation }) {
  const menuItems = [
    { title: 'Manage Products', icon: 'cube', screen: 'ManageProducts', color: '#4CAF50' },
    { title: 'Manage Orders', icon: 'receipt', screen: 'ManageOrders', color: '#4CAF50' },
  ];

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Store Management</Text>
        <Text style={styles.subtitle}>Admin Control Panel</Text>

        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={32} color="#FFF" />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Dosis_700Bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    fontFamily: 'Dosis_600SemiBold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Dosis_700Bold',
    color: '#333',
    textAlign: 'center',
  },
});
