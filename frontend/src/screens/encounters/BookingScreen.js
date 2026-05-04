import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  Linking,
  Modal
} from 'react-native';
import apiClient from '../../api/client';
import { theme } from '../../constants/theme';

export default function BookingScreen({ route, navigation }) {
  const { animal, type: initialType } = route.params || {};

  const [bookingType, setBookingType] = useState(initialType || 'Feeding');
  const [visitorName, setVisitorName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 
  
  const [allSlots, setAllSlots] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [selectedPhotographer, setSelectedPhotographer] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [loading, setLoading] = useState(false);

  // Success Modal State
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [bookingReceipt, setBookingReceipt] = useState(null);

  useEffect(() => {
    fetchData();
  }, [bookingType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsRes, photogRes] = await Promise.all([
        apiClient.get('/time-slots'),
        apiClient.get('/photographers')
      ]);
      if (slotsRes.data.success) setAllSlots(slotsRes.data.data);
      if (photogRes.data.success) setPhotographers(photogRes.data.data.filter(p => p.isActive));
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableSlots = allSlots.filter(slot => {
    if ((slot.type || '').toLowerCase() !== bookingType.toLowerCase()) return false;
    
    let slotDateStr = slot.date;
    if (typeof slotDateStr !== 'string') slotDateStr = new Date(slotDateStr).toISOString().split('T')[0];
    
    if (slotDateStr !== date) return false;
    if (slot.isBooked) return false;
    
    if (bookingType === 'Photography') {
      if (selectedPhotographer && slot.photographer?._id !== selectedPhotographer._id) return false;
      return true;
    } else {
      const targetAnimal = (animal?.name || '').toLowerCase();
      const slotAnimal = (slot.animalName || '').toLowerCase();
      return slotAnimal === targetAnimal || slotAnimal === 'all';
    }
  });

  const handleConfirmBooking = async () => {
    setPhoneError('');
    if (!visitorName.trim() || visitorName.trim().length < 2) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    const digits = contactInfo.replace(/\D/g, '');
    if (digits.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits.');
      return;
    }
    if (!selectedSlotId) {
      Alert.alert('Selection Required', 'Please choose a time slot.');
      return;
    }

    try {
      setLoading(true);
      const selectedSlot = allSlots.find(s => s._id === selectedSlotId);
      if (!selectedSlot) {
        Alert.alert('Error', 'Slot not found. Please refresh.');
        return;
      }

      const endpoint = bookingType === 'Feeding' ? '/feeding-bookings' : '/photography-bookings';
      
      let payload;
      if (bookingType === 'Feeding') {
        payload = {
          visitorName: visitorName.trim(),
          contactInfo: contactInfo.trim(),
          animalName: animal?.name || 'Zoo Animal',
          date: selectedSlot.date,
          timeSlot: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
          timeSlotId: selectedSlot._id,
          numberOfParticipants: 1
        };
      } else {
        const pId = selectedSlot.photographer?._id || selectedPhotographer?._id;
        if (!pId) {
          Alert.alert('Photographer Missing', 'No photographer is assigned to this slot.');
          setLoading(false);
          return;
        }

        payload = {
          visitorName: visitorName.trim(),
          contactInfo: contactInfo.trim(),
          animal: animal?._id,
          photographer: pId,
          timeSlot: selectedSlot._id,
          date: selectedSlot.date,
          time: selectedSlot.startTime, 
          duration: 60, // Fixed 1 hour duration
        };
      }

      Alert.alert('Debug', `Sending ${bookingType} request...`);

      const response = await apiClient.post(endpoint, payload);
      
      Alert.alert('Debug', `Server Response Status: ${response.status}`);

      if (response.data.success) {
        await apiClient.patch(`/time-slots/${selectedSlot._id}`, { isBooked: true });
        
        setBookingReceipt({
          type: bookingType,
          animal: animal?.name,
          date: selectedSlot.date,
          time: bookingType === 'Feeding' ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : selectedSlot.startTime,
          rate: bookingType === 'Photography' ? `Rs.${selectedSlot.photographer?.hourlyRate || selectedPhotographer?.hourlyRate || 0}/hr` : null,
          photographer: selectedSlot.photographer?.name || selectedPhotographer?.name
        });
        
        setSuccessModalVisible(true);
        setVisitorName('');
        setContactInfo('');
        setSelectedSlotId('');
      } else {
        Alert.alert('Booking Error', response.data.message || 'The server could not create the booking.');
      }
    } catch (error) {
      console.error('Full Booking Error:', error.response?.data || error.message);
      const data = error.response?.data;
      const msg = data?.message || (Array.isArray(data?.errors) ? data.errors.map(e => e.msg).join(', ') : null) || error.message || 'Check your connection and try again.';
      Alert.alert('Booking Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const renderPhotographer = ({ item }) => (
    <TouchableOpacity 
      style={[styles.chip, selectedPhotographer?._id === item._id && styles.activeChip]}
      onPress={() => {
        setSelectedPhotographer(selectedPhotographer?._id === item._id ? null : item);
        setSelectedSlotId('');
      }}
    >
      <Text style={[styles.chipText, selectedPhotographer?._id === item._id && styles.activeChipText]}>{item.name}</Text>
      <Text style={[styles.chipRate, selectedPhotographer?._id === item._id && styles.activeChipText]}>Rs.{item.hourlyRate}/hr</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {animal?.imageUrl && (
          <Image 
            source={{ uri: animal.imageUrl.startsWith('http') ? animal.imageUrl : `${apiClient.defaults.baseURL.replace('/api','')}${animal.imageUrl}` }} 
            style={styles.heroImage} 
          />
        )}
        
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{animal?.name}</Text>
            <View style={styles.typeBadge}><Text style={styles.typeText}>{bookingType}</Text></View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={visitorName} onChangeText={setVisitorName} placeholder="Your name" />
            
            <Text style={styles.label}>Phone Number</Text>
            <TextInput 
              style={[styles.input, phoneError ? { borderColor: '#F44336', borderWidth: 1 } : null]} 
              value={contactInfo} 
              onChangeText={(val) => { setContactInfo(val); setPhoneError(''); }} 
              placeholder="10-digit phone number"
              keyboardType="default"
              maxLength={10}
            />
            {phoneError ? <Text style={{ color: '#F44336', fontSize: 12, marginTop: -10, marginBottom: 10, marginLeft: 5 }}>{phoneError}</Text> : null}

            <Text style={styles.label}>Select Date</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} />
          </View>

          {bookingType === 'Photography' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Choose Photographer (Hourly Rate)</Text>
              <FlatList
                horizontal
                data={photographers}
                keyExtractor={item => item._id}
                renderItem={renderPhotographer}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 5 }}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{bookingType === 'Photography' ? '2.' : ''} Available Slots</Text>
            <View style={styles.slotsGrid}>
              {availableSlots.length > 0 ? availableSlots.map(slot => (
                <TouchableOpacity 
                  key={slot._id} 
                  style={[styles.slotItem, selectedSlotId === slot._id && styles.activeSlot]} 
                  onPress={() => setSelectedSlotId(slot._id)}
                >
                  <Text style={[styles.slotTime, selectedSlotId === slot._id && styles.activeText]}>{slot.startTime}</Text>
                  {bookingType === 'Photography' && (
                    <Text style={[styles.slotSub, selectedSlotId === slot._id && styles.activeText]}>{slot.photographer?.name}</Text>
                  )}
                </TouchableOpacity>
              )) : (
                <Text style={styles.emptyText}>No available slots for this selection.</Text>
              )}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.confirmBtn, (!selectedSlotId || loading) && styles.disabledBtn]} 
            onPress={handleConfirmBooking}
            disabled={!selectedSlotId || loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmBtnText}>Confirm {bookingType} Booking</Text>}
          </TouchableOpacity>
          <View style={{ height: 60 }} />
        </View>
      </ScrollView>

      {/* SUCCESS MODAL */}
      <Modal visible={successModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✨</Text>
            <Text style={styles.successTitle}>Successfully Booked!</Text>
            <Text style={styles.successSub}>Your session is reserved. Here are the details:</Text>
            
            <View style={styles.receipt}>
              <View style={styles.receiptLine}><Text style={styles.receiptLabel}>Animal:</Text><Text style={styles.receiptVal}>{bookingReceipt?.animal}</Text></View>
              <View style={styles.receiptLine}><Text style={styles.receiptLabel}>Activity:</Text><Text style={styles.receiptVal}>{bookingReceipt?.type}</Text></View>
              <View style={styles.receiptLine}><Text style={styles.receiptLabel}>Date:</Text><Text style={styles.receiptVal}>{bookingReceipt?.date}</Text></View>
              <View style={styles.receiptLine}><Text style={styles.receiptLabel}>Time:</Text><Text style={styles.receiptVal}>{bookingReceipt?.time}</Text></View>
              {bookingReceipt?.rate && <View style={styles.receiptLine}><Text style={styles.receiptLabel}>Rate:</Text><Text style={styles.receiptVal}>{bookingReceipt.rate}</Text></View>}
              {bookingReceipt?.photographer && <View style={styles.receiptLine}><Text style={styles.receiptLabel}>With:</Text><Text style={styles.receiptVal}>{bookingReceipt?.photographer}</Text></View>}
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={() => { setSuccessModalVisible(false); navigation.goBack(); }}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  heroImage: { width: '100%', height: 220 },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
  typeBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  typeText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 12 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#666', marginBottom: 8 },
  input: { backgroundColor: '#F9F9F9', borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#EEE' },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, backgroundColor: '#F0F0F0', marginRight: 10, alignItems: 'center', minWidth: 120 },
  activeChip: { backgroundColor: theme.colors.accentGreen || '#4CAF50' },
  chipText: { color: '#333', fontWeight: 'bold' },
  chipRate: { color: '#666', fontSize: 11, marginTop: 2 },
  activeChipText: { color: '#FFF' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  slotItem: { width: '31%', backgroundColor: '#F9F9F9', padding: 12, borderRadius: 12, margin: '1%', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  activeSlot: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  slotTime: { fontSize: 15, fontWeight: 'bold' },
  slotSub: { fontSize: 10, color: '#999', marginTop: 4 },
  activeText: { color: '#FFF' },
  confirmBtn: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  confirmBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  disabledBtn: { backgroundColor: '#CCC' },
  emptyText: { color: '#999', fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 25 },
  successCard: { backgroundColor: '#FFF', borderRadius: 25, padding: 25, width: '100%', alignItems: 'center' },
  successIcon: { fontSize: 50, marginBottom: 15 },
  successTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  successSub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  receipt: { backgroundColor: '#F8F9FA', borderRadius: 15, padding: 15, width: '100%', marginBottom: 20 },
  receiptLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  receiptLabel: { color: '#777', fontSize: 14 },
  receiptVal: { fontWeight: 'bold', color: '#333' },
  doneBtn: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12 },
  doneBtnText: { color: '#FFF', fontWeight: 'bold' },
});
