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

export default function TimeSlotManagementScreen() {
  const [slots, setSlots] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [type, setType] = useState('Photography'); 
  const [date, setDate] = useState('2026-05-01');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [photographerId, setPhotographerId] = useState('');
  const [animalName, setAnimalName] = useState('All');
  const [capacity, setCapacity] = useState('5');

  const animals = ['Parrots', 'Deer', 'Giraffe', 'Zebra', 'All'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsRes, photogRes] = await Promise.all([
        apiClient.get('/time-slots'),
        apiClient.get('/photographers')
      ]);
      if (slotsRes.data.success) setSlots(slotsRes.data.data);
      if (photogRes.data.success) setPhotographers(photogRes.data.data.filter(p => p.isActive));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Optimistic delete
      setSlots(prev => prev.filter(s => s._id !== id));
      // POST fallback for network stability
      await apiClient.post(`/time-slots/${id}`, { _method: 'DELETE' });
    } catch (err) {
      Alert.alert('Error', 'Deletion failed on server.');
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
    setEditingId(item._id); setType(item.type); setDate(item.date); setStartTime(item.startTime); setEndTime(item.endTime); setPhotographerId(item.photographer?._id || ''); setAnimalName(item.animalName || 'All'); setCapacity(item.capacity?.toString() || '5'); setModalVisible(true);
  };

  const resetForm = () => {
    setEditingId(null); setType('Photography'); setDate('2026-05-01'); setStartTime('09:00'); setEndTime('10:00'); setPhotographerId(''); setAnimalName('All'); setCapacity('5');
  };

  const renderSlot = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <View style={styles.cardHeader}>
          <Text style={styles.slotTime}>{item.startTime} - {item.endTime}</Text>
          <View style={[styles.typeBadge, { backgroundColor: item.type === 'Feeding' ? '#FFF3E0' : '#E3F2FD' }]}>
            <Text style={[styles.typeText, { color: item.type === 'Feeding' ? '#E65100' : '#1565C0' }]}>{item.type}</Text>
          </View>
        </View>
        <Text style={styles.slotDate}>{item.date}</Text>
        <Text style={styles.slotDetail}>
          {item.type === 'Photography' ? `📸 ${item.photographer?.name || 'Assigned'}` : `🦁 ${item.animalName || 'All'}`}
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

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={slots}
          keyExtractor={item => item._id}
          renderItem={renderSlot}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No slots found.</Text>}
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
                  photographers.map(p => (
                    <TouchableOpacity key={p._id} style={[styles.chip, photographerId === p._id && styles.activeChip]} onPress={() => setPhotographerId(p._id)}>
                      <Text style={[styles.chipText, photographerId === p._id && styles.activeChipText]}>{p.name}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  animals.map(a => (
                    <TouchableOpacity key={a} style={[styles.chip, animalName === a && styles.activeChip]} onPress={() => setAnimalName(a)}>
                      <Text style={[styles.chipText, animalName === a && styles.activeChipText]}>{a}</Text>
                    </TouchableOpacity>
                  ))
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
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', elevation: 2 },
  title: { fontSize: 24, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#2196F3', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#FFF', fontWeight: 'bold' },
  list: { padding: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  slotTime: { fontSize: 18, fontWeight: 'bold' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 10, fontWeight: 'bold' },
  slotDate: { fontSize: 13, color: '#666' },
  slotDetail: { fontSize: 13, color: '#2196F3', marginTop: 4, fontWeight: '600' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  editBtn: { padding: 10, marginRight: 5 },
  editBtnText: { color: '#2196F3', fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#FFEBEE', padding: 10, borderRadius: 8 },
  deleteBtnText: { color: '#F44336', fontWeight: 'bold', fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 8 },
  input: { backgroundColor: '#F0F2F5', borderRadius: 8, padding: 12, marginBottom: 15 },
  row: { flexDirection: 'row', marginBottom: 15 },
  typeOption: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#EEE', borderRadius: 8, marginRight: 10 },
  activeTypeOption: { backgroundColor: '#2196F3' },
  typeOptionText: { color: '#666', fontWeight: 'bold' },
  activeTypeOptionText: { color: '#FFF' },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EEE', marginRight: 10, marginBottom: 10 },
  activeChip: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#2196F3' },
  chipText: { color: '#666', fontSize: 13 },
  activeChipText: { color: '#2196F3', fontWeight: 'bold' },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  cancelBtn: { flex: 1, padding: 15, alignItems: 'center' },
  cancelBtnText: { color: '#666', fontWeight: 'bold' },
  saveBtn: { flex: 1, backgroundColor: '#2196F3', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' },
});
