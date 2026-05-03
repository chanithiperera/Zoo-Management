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
          placeholder="Search staff name…"
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
              <Text style={styles.emptyHint}>No staff found matching "{searchQuery}"</Text>
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
                  <Text style={styles.linkAddBtnLabel}>ADD</Text>
                </TouchableOpacity>
              </View>

              {portfolioLinks.map((link, idx) => (
                <View key={idx} style={styles.linkItem}>
                  <Text style={styles.linkText} numberOfLines={1}>{link}</Text>
                  <TouchableOpacity onPress={() => removeLink(idx)}>
                    <Text style={styles.removeLink}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.switchRow}>
                <Text style={styles.label}>Account Active</Text>
                <Switch value={isActive} onValueChange={setIsActive} />
              </View>

              <View style={styles.modalBtns}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnLabel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                  <Text style={styles.saveBtnLabel}>Save Photographer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundAlt },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    elevation: 2,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchContainer: { padding: theme.spacing.md, paddingTop: theme.spacing.sm },
  searchBar: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.sm,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    fontSize: theme.fontSize.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.colors.linkGreen },
  addBtn: {
    backgroundColor: theme.colors.accentGreen,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radii.sm,
  },
  addBtnText: { color: theme.colors.white, fontWeight: '700' },
  card: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.sm,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  name: { fontSize: 17, fontWeight: '700', color: theme.colors.primaryText },
  sub: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.65 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  editLink: { color: theme.colors.linkGreen, fontWeight: '700', marginRight: 15 },
  delBtn: {
    backgroundColor: theme.colors.white,
    padding: 8,
    borderRadius: theme.radii.sm,
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
  delBtnText: { color: theme.colors.error, fontWeight: '700', fontSize: 11 },
  emptyHint: { color: theme.colors.primaryText, opacity: 0.5, marginTop: 50 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    padding: theme.spacing.lg,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    color: theme.colors.primaryText,
  },
  label: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.primaryText, opacity: 0.7, marginBottom: 5 },
  input: {
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: theme.radii.sm,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: { flexDirection: 'row' },
  linkInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  linkAddBtn: {
    backgroundColor: theme.colors.accentGreen,
    padding: 12,
    borderRadius: theme.radii.sm,
    marginLeft: 10,
  },
  linkAddBtnLabel: { color: theme.colors.white, fontWeight: '700' },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.welcomeBackground,
    padding: 10,
    borderRadius: theme.radii.sm,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  linkText: { flex: 1, color: theme.colors.linkGreen, fontSize: 12, marginRight: 10 },
  removeLink: { color: theme.colors.error, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { flex: 1, alignItems: 'center', padding: 15 },
  cancelBtnLabel: { color: theme.colors.error, fontWeight: '700' },
  saveBtn: {
    flex: 1,
    backgroundColor: theme.colors.accentGreen,
    alignItems: 'center',
    padding: 15,
    borderRadius: theme.radii.md,
  },
  saveBtnLabel: { color: theme.colors.white, fontWeight: '700' },
});
