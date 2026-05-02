import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch,
  SafeAreaView
} from 'react-native';
import apiClient from '../../api/client';

import { theme } from '../../constants/theme';

export default function PhotographerManagementScreen() {
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hourlyRate, setHourlyRate] = useState('0');
  const [isActive, setIsActive] = useState(true);
  
  // NEW: Multi-portfolio management
  const [portfolioLinks, setPortfolioLinks] = useState([]);
  const [newLink, setNewLink] = useState('');

  useEffect(() => {
    fetchPhotographers();
  }, []);

  const fetchPhotographers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/photographers');
      if (response.data.success) setPhotographers(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load photographers.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    if (!newLink.trim()) return;
    if (!newLink.startsWith('http')) {
      Alert.alert('Invalid Link', 'Please enter a full URL (starting with http:// or https://)');
      return;
    }
    setPortfolioLinks([...portfolioLinks, newLink.trim()]);
    setNewLink('');
  };

  const removeLink = (index) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }

    const payload = {
      name,
      contactInfo: contact,
      specialty,
      hourlyRate: parseFloat(hourlyRate) || 0,
      isActive,
      portfolio: portfolioLinks
    };

    try {
      if (editingId) await apiClient.patch(`/photographers/${editingId}`, payload);
      else await apiClient.post('/photographers', payload);
      setModalVisible(false); resetForm(); fetchPhotographers();
      Alert.alert('Success', 'Photographer saved.');
    } catch (error) { Alert.alert('Error', 'Failed to save.'); }
  };

  const handleDelete = async (id) => {
    try {
      setPhotographers(prev => prev.filter(p => p._id !== id));
      await apiClient.post(`/photographers/${id}`, { _method: 'DELETE' });
    } catch (error) {
      Alert.alert('Error', 'Failed to delete.');
      fetchPhotographers();
    }
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    setName(item.name);
    setContact(item.contactInfo || '');
    setSpecialty(item.specialty || '');
    setHourlyRate(item.hourlyRate?.toString() || '0');
    setIsActive(item.isActive ?? true);
    setPortfolioLinks(item.portfolio || []);
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingId(null); setName(''); setContact(''); setSpecialty(''); setHourlyRate('0'); setIsActive(true); setPortfolioLinks([]); setNewLink('');
  };

  const filteredPhotographers = photographers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Staff Profiles</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
          <Text style={styles.addBtnText}>+ New Staff</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchBar} 
          placeholder="🔍 Search staff name..." 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? <ActivityIndicator size="large" color={theme.colors.accentGreen} style={{ marginTop: 50 }} /> : (
        <FlatList
          data={filteredPhotographers}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>{item.specialty} • Rs.{item.hourlyRate}/hr</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEdit(item)}><Text style={styles.editLink}>Edit</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.delBtn}><Text style={styles.delBtnText}>DELETE</Text></TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Text style={{ color: '#999' }}>No staff found matching "{searchQuery}"</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Profile' : 'New Staff Member'}</Text>
              
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}><Text style={styles.label}>Specialty</Text><TextInput style={styles.input} value={specialty} onChangeText={setSpecialty} /></View>
                <View style={{ width: 100 }}><Text style={styles.label}>Rate (Rs)</Text><TextInput style={styles.input} value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" /></View>
              </View>

              <Text style={styles.label}>Portfolio Links (Add Multiple)</Text>
              <View style={styles.linkInputRow}>
                <TextInput 
                  style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                  value={newLink} 
                  onChangeText={setNewLink} 
                  placeholder="https://instagram.com/..." 
                />
                <TouchableOpacity style={styles.linkAddBtn} onPress={handleAddLink}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>ADD</Text>
                </TouchableOpacity>
              </View>

              {portfolioLinks.map((link, idx) => (
                <View key={idx} style={styles.linkItem}>
                  <Text style={styles.linkText} numberOfLines={1}>{link}</Text>
                  <TouchableOpacity onPress={() => removeLink(idx)}>
                    <Text style={{ color: '#F44336', fontWeight: 'bold' }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.switchRow}>
                <Text style={styles.label}>Account Active</Text>
                <Switch value={isActive} onValueChange={setIsActive} />
              </View>

              <View style={styles.modalBtns}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}><Text style={{ color: '#666' }}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.saveBtn}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Save Photographer</Text></TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', elevation: 2, alignItems: 'center' },
  searchContainer: { padding: 15, paddingTop: 10 },
  searchBar: { backgroundColor: '#FFF', borderRadius: 10, padding: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, fontSize: 14, borderWidth: 1, borderColor: '#EEE' },
  title: { fontSize: 22, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#2196F3', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#FFF', fontWeight: 'bold' },
  card: { padding: 15, backgroundColor: '#FFF', borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  name: { fontSize: 17, fontWeight: 'bold' },
  sub: { fontSize: 13, color: '#666' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  editLink: { color: '#2196F3', fontWeight: 'bold', marginRight: 15 },
  delBtn: { backgroundColor: '#FFEBEE', padding: 8, borderRadius: 8 },
  delBtnText: { color: '#F44336', fontWeight: 'bold', fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 5 },
  input: { backgroundColor: '#F0F2F5', borderRadius: 8, padding: 12, marginBottom: 15 },
  row: { flexDirection: 'row' },
  linkInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  linkAddBtn: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, marginLeft: 10 },
  linkItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8F9FA', padding: 10, borderRadius: 8, marginBottom: 5, borderWidth: 1, borderColor: '#EEE' },
  linkText: { flex: 1, color: '#2196F3', fontSize: 12, marginRight: 10 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { flex: 1, alignItems: 'center', padding: 15 },
  saveBtn: { flex: 1, backgroundColor: '#2196F3', alignItems: 'center', padding: 15, borderRadius: 10 },
});
