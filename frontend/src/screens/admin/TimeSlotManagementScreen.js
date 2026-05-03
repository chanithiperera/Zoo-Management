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
  SafeAreaView,
  Pressable
} from 'react-native';
import apiClient from '../../api/client';
import { theme } from '../../constants/theme';

export default function TimeSlotManagementScreen() {
  const [slots, setSlots] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [animalsFromDb, setAnimalsFromDb] = useState([]); // Dynamic animals
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [type, setType] = useState('Photography'); 
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [photographerId, setPhotographerId] = useState('');
  const [animalName, setAnimalName] = useState('All');
  const [capacity, setCapacity] = useState('5');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsRes, photogRes, animalsRes] = await Promise.all([
        apiClient.get('/time-slots'),
        apiClient.get('/photographers'),
        apiClient.get('/animals') // Fetch real animals
      ]);
      
      if (slotsRes.data.success) setSlots(slotsRes.data.data);
      if (photogRes.data.success) setPhotographers(photogRes.data.data.filter(p => p.isActive));
      
      if (animalsRes.data.success) {
        // Map animal objects to a simple list of names for the selector
        const animalList = animalsRes.data.data.map(a => a.name);
        if (!animalList.includes('All')) animalList.push('All');
        setAnimalsFromDb(animalList);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setSlots(prev => prev.filter(s => s._id !== id));
      await apiClient.post(`/time-slots/${id}`, { _method: 'DELETE' });
    } catch (err) {
      Alert.alert('Error', 'Deletion failed.');
      fetchData();
    }
  };

  const handleSave = async () => {
    const payload = {
      type, date, startTime, endTime, 
      capacity: parseInt(capacity) || 5,
      animalName: type === 'Feeding' ? animalName : 'All',
      photographer: type === 'Photography' ? photographerId : null
    };

    try {
      if (editingId) await apiClient.patch(`/time-slots/${editingId}`, payload);
      else await apiClient.post('/time-slots', payload);
      
      setModalVisible(false);
      resetForm();
      fetchData();
      Alert.alert('Success', 'Time slot saved.');
    } catch (err) {
      Alert.alert('Error', 'Could not save slot.');
    }
  };

  const openEdit = (item) => {
    setEditingId(item._id); 
    setType(item.type); 
    setDate(item.date); 
    setStartTime(item.startTime); 
    setEndTime(item.endTime); 
    setPhotographerId(item.photographer?._id || ''); 
    setAnimalName(item.animalName || 'All'); 
    setCapacity(item.capacity?.toString() || '5'); 
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingId(null); 
    setType('Photography'); 
    setDate(new Date().toISOString().split('T')[0]); 
    setStartTime('09:00'); 
    setEndTime('10:00'); 
    setPhotographerId(''); 
    setAnimalName('All'); 
    setCapacity('5');
  };

  const renderSlot = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <View style={styles.cardHeader}>
          <Text style={styles.slotTime}>{item.startTime} - {item.endTime}</Text>
          <View style={[styles.typeBadge, item.type === 'Feeding' ? styles.typeBadgeFeeding : styles.typeBadgePhoto]}>
            <Text style={[styles.typeText, item.type === 'Feeding' ? styles.typeTextFeeding : styles.typeTextPhoto]}>{item.type}</Text>
          </View>
        </View>
        <Text style={styles.slotDate}>{item.date}</Text>
        <Text style={styles.slotDetail}>
          {item.type === 'Photography'
            ? `Staff: ${item.photographer?.name || 'Assigned'}`
            : `Animal: ${item.animalName || 'All'}`}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
          <Text style={styles.deleteBtnText}>DELETE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Slot Management</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
          <Text style={styles.addBtnText}>+ New Slot</Text>
        </TouchableOpacity>
      </View>

      {loading && slots.length === 0 ? (
        <ActivityIndicator size="large" color={theme.colors.accentGreen} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={slots}
          keyExtractor={item => item._id}
          renderItem={renderSlot}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No slots found.</Text>}
          refreshing={loading}
          onRefresh={fetchData}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Time Slot' : 'Create New Slot'}</Text>
              
              <Text style={styles.label}>Activity Type</Text>
              <View style={styles.row}>
                {['Photography', 'Feeding'].map(t => (
                  <TouchableOpacity key={t} style={[styles.typeOption, type === t && styles.activeTypeOption]} onPress={() => setType(t)}>
                    <Text style={[styles.typeOptionText, type === t && styles.activeTypeOptionText]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={date} onChangeText={setDate} />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}><Text style={styles.label}>Start</Text><TextInput style={styles.input} value={startTime} onChangeText={setStartTime} /></View>
                <View style={{ flex: 1 }}><Text style={styles.label}>End</Text><TextInput style={styles.input} value={endTime} onChangeText={setEndTime} /></View>
              </View>

              <Text style={styles.label}>Capacity</Text>
              <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} keyboardType="numeric" />

              <Text style={styles.label}>Select {type === 'Photography' ? 'Photographer' : 'Animal'}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
                {type === 'Photography' ? (
                  photographers.length > 0 ? (
                    photographers.map(p => (
                      <TouchableOpacity key={p._id} style={[styles.chip, photographerId === p._id && styles.activeChip]} onPress={() => setPhotographerId(p._id)}>
                        <Text style={[styles.chipText, photographerId === p._id && styles.activeChipText]}>{p.name}</Text>
                      </TouchableOpacity>
                    ))
                  ) : <Text style={styles.hintInline}>No active photographers found.</Text>
                ) : (
                  animalsFromDb.length > 0 ? (
                    animalsFromDb.map(a => (
                      <TouchableOpacity key={a} style={[styles.chip, animalName === a && styles.activeChip]} onPress={() => setAnimalName(a)}>
                        <Text style={[styles.chipText, animalName === a && styles.activeChipText]}>{a}</Text>
                      </TouchableOpacity>
                    ))
                  ) : <Text style={styles.hintInline}>No animals added yet. Go to Animal Management.</Text>
                )}
              </View>

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>Save Slot</Text></TouchableOpacity>
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
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    elevation: 2,
  },
  title: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.colors.linkGreen },
  addBtn: {
    backgroundColor: theme.colors.accentGreen,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: theme.radii.sm,
  },
  addBtnText: { color: theme.colors.white, fontWeight: '700' },
  list: { padding: theme.spacing.md },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  slotTime: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.primaryText },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.radii.sm },
  typeBadgeFeeding: {
    backgroundColor: theme.colors.welcomeBackground,
    borderWidth: 1,
    borderColor: theme.colors.yellow,
  },
  typeBadgePhoto: {
    backgroundColor: theme.colors.sageButton,
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  typeText: { fontSize: 10, fontWeight: '700' },
  typeTextFeeding: { color: theme.colors.accentOrange },
  typeTextPhoto: { color: theme.colors.linkGreen },
  slotDate: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.65 },
  slotDetail: { fontSize: theme.fontSize.sm, color: theme.colors.accentGreen, marginTop: 4, fontWeight: '600' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  editBtn: { padding: 10, marginRight: 5 },
  editBtnText: { color: theme.colors.linkGreen, fontWeight: '700' },
  deleteBtn: {
    backgroundColor: theme.colors.white,
    padding: 10,
    borderRadius: theme.radii.sm,
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
  deleteBtnText: { color: theme.colors.error, fontWeight: '700', fontSize: 11 },
  hintInline: { color: theme.colors.primaryText, opacity: 0.5, fontSize: theme.fontSize.sm },
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
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    color: theme.colors.primaryText,
  },
  label: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.primaryText, opacity: 0.7, marginBottom: 8 },
  input: {
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: theme.radii.sm,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: { flexDirection: 'row', marginBottom: 15 },
  typeOption: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: theme.radii.sm,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeTypeOption: { backgroundColor: theme.colors.accentGreen, borderColor: theme.colors.accentGreen },
  typeOptionText: { color: theme.colors.primaryText, opacity: 0.65, fontWeight: '700' },
  activeTypeOptionText: { color: theme.colors.white, opacity: 1 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.welcomeBackground,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeChip: { backgroundColor: theme.colors.sageButton, borderWidth: 1, borderColor: theme.colors.accentGreen },
  chipText: { color: theme.colors.primaryText, opacity: 0.65, fontSize: theme.fontSize.sm },
  activeChipText: { color: theme.colors.linkGreen, fontWeight: '700', opacity: 1 },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  cancelBtn: { flex: 1, padding: 15, alignItems: 'center' },
  cancelBtnText: { color: theme.colors.error, fontWeight: '700' },
  saveBtn: {
    flex: 1,
    backgroundColor: theme.colors.accentGreen,
    padding: 15,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  saveBtnText: { color: theme.colors.white, fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 50, color: theme.colors.primaryText, opacity: 0.5 },
});
