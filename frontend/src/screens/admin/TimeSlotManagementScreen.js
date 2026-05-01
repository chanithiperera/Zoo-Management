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
  ScrollView
} from 'react-native';
import apiClient from '../../api/client';

export default function TimeSlotManagementScreen() {
  const [slots, setSlots] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
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
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (type === 'Photography' && (!photographerId || photographerId.trim() === '')) {
      Alert.alert('Selection Required', 'Please select a photographer.');
      return;
    }

    try {
      // 1. Build the payload carefully
      const payload = {
        type: type,
        date: date,
        startTime: startTime,
        endTime: endTime,
        capacity: parseInt(capacity) || 5,
        animalName: type === 'Feeding' ? animalName : 'All'
      };
      
      // 2. Only add photographer if it's a Photography slot
      if (type === 'Photography') {
        payload.photographer = photographerId;
      }

      console.log('Final Payload for create:', payload);

      const response = await apiClient.post('/time-slots', payload);
      
      if (response.data.success) {
        Alert.alert('Success', `${type} slot created.`);
        setModalVisible(false);
        fetchData();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      Alert.alert('Creation Failed', errorMsg);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Slot', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/time-slots/${id}`);
          fetchData();
        } catch (error) {
          Alert.alert('Error', 'Failed to delete slot.');
        }
      }}
    ]);
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
        <Text style={styles.slotDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.slotDetail}>
          {item.type === 'Photography' ? `📸 ${item.photographer?.name || 'Assigned'}` : `🦁 Animal: ${item.animalName || 'All'}`}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteIcon}>
        <Text style={{ color: '#F44336', fontWeight: 'bold', fontSize: 18 }}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Slot Management</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setModalVisible(true); setPhotographerId(''); }}>
          <Text style={styles.addBtnText}>+ New Slot</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
      ) : (
        <FlatList
          data={slots}
          keyExtractor={(item) => item._id}
          renderItem={renderSlot}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No slots created yet.</Text>}
        />
      )}

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Create New Slot</Text>
              
              <Text style={styles.label}>Slot Type</Text>
              <View style={styles.row}>
                {['Photography', 'Feeding'].map(t => (
                  <TouchableOpacity 
                    key={t}
                    style={[styles.typeOption, type === t && styles.activeTypeOption]}
                    onPress={() => setType(t)}
                  >
                    <Text style={[styles.typeOptionText, type === t && styles.activeTypeOptionText]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={date} onChangeText={setDate} />
              
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.label}>Start (HH:mm)</Text>
                  <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>End (HH:mm)</Text>
                  <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} />
                </View>
              </View>

              <Text style={styles.label}>Capacity</Text>
              <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} keyboardType="numeric" />

              {type === 'Photography' ? (
                <>
                  <Text style={styles.label}>Select Photographer</Text>
                  <ScrollView horizontal style={styles.chipList} showsHorizontalScrollIndicator={false}>
                    {photographers.map(p => (
                      <TouchableOpacity 
                        key={p._id} 
                        style={[styles.chip, photographerId === p._id && styles.activeChip]}
                        onPress={() => setPhotographerId(p._id)}
                      >
                        <Text style={[styles.chipText, photographerId === p._id && styles.activeChipText]}>{p.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              ) : (
                <>
                  <Text style={styles.label}>Select Animal</Text>
                  <ScrollView horizontal style={styles.chipList} showsHorizontalScrollIndicator={false}>
                    {animals.map(a => (
                      <TouchableOpacity 
                        key={a} 
                        style={[styles.chip, animalName === a && styles.activeChip]}
                        onPress={() => setAnimalName(a)}
                      >
                        <Text style={[styles.chipText, animalName === a && styles.activeChipText]}>{a}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                  <Text style={styles.saveBtnText}>Create Slot</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 24, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#2196F3', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#FFF', fontWeight: 'bold' },
  list: { padding: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  slotTime: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 10, fontWeight: 'bold' },
  slotDate: { fontSize: 13, color: '#666' },
  slotDetail: { fontSize: 13, color: '#2196F3', marginTop: 4, fontWeight: '500' },
  deleteIcon: { padding: 10 },
  loader: { marginTop: 50 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999', fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8, marginTop: 5 },
  input: { backgroundColor: '#F0F2F5', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  row: { flexDirection: 'row', marginBottom: 15 },
  typeOption: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#EEE', borderRadius: 8, marginRight: 10 },
  activeTypeOption: { backgroundColor: '#2196F3' },
  typeOptionText: { color: '#666', fontWeight: 'bold' },
  activeTypeOptionText: { color: '#FFF' },
  chipList: { flexDirection: 'row', marginBottom: 20 },
  chip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, backgroundColor: '#EEE', marginRight: 10, borderWidth: 1, borderColor: 'transparent' },
  activeChip: { backgroundColor: '#E3F2FD', borderColor: '#2196F3' },
  chipText: { color: '#666', fontSize: 13 },
  activeChipText: { color: '#2196F3', fontWeight: 'bold' },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  cancelBtn: { flex: 1, padding: 15, alignItems: 'center' },
  cancelBtnText: { color: '#666', fontWeight: 'bold' },
  saveBtn: { flex: 1, backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold' },
});
