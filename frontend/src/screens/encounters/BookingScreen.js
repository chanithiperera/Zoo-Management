import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';
import { theme } from '../../constants/theme';
import { resolveUploadsFileUri } from '../../api/getApiBaseUrl';
import { popOrParentGoBack } from '../../utils/popOrParentGoBack';
import VisitDateCalendar from '../../components/booking/VisitDateCalendar';
import {
  getBookingDateBounds,
  monthStartTs,
  startOfDay,
  toLocalDateKey,
} from '../../utils/visitCalendar';

export default function BookingScreen({ route, navigation }) {
  const { animal, type: initialType } = route.params || {};

  const [bookingType, setBookingType] = useState(initialType || 'Feeding');
  const [visitorName, setVisitorName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const { min, max } = useMemo(() => getBookingDateBounds(), []);
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [visibleYear, setVisibleYear] = useState(() => new Date().getFullYear());
  const [visibleMonthIndex, setVisibleMonthIndex] = useState(() => new Date().getMonth());

  const dateKey = useMemo(() => toLocalDateKey(selectedDate), [selectedDate]);

  const [allSlots, setAllSlots] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [selectedPhotographer, setSelectedPhotographer] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [loading, setLoading] = useState(false);

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [bookingReceipt, setBookingReceipt] = useState(null);

  useEffect(() => {
    fetchData();
  }, [bookingType]);

  const canGoPrevMonth =
    monthStartTs(visibleYear, visibleMonthIndex) > monthStartTs(min.getFullYear(), min.getMonth());
  const canGoNextMonth =
    monthStartTs(visibleYear, visibleMonthIndex) < monthStartTs(max.getFullYear(), max.getMonth());

  const onPrevMonth = useCallback(() => {
    if (!canGoPrevMonth) return;
    const d = new Date(visibleYear, visibleMonthIndex, 1);
    d.setMonth(d.getMonth() - 1);
    setVisibleYear(d.getFullYear());
    setVisibleMonthIndex(d.getMonth());
  }, [visibleYear, visibleMonthIndex, canGoPrevMonth]);

  const onNextMonth = useCallback(() => {
    if (!canGoNextMonth) return;
    const d = new Date(visibleYear, visibleMonthIndex, 1);
    d.setMonth(d.getMonth() + 1);
    setVisibleYear(d.getFullYear());
    setVisibleMonthIndex(d.getMonth());
  }, [visibleYear, visibleMonthIndex, canGoNextMonth]);

  const openCalendar = useCallback(() => {
    setVisibleYear(selectedDate.getFullYear());
    setVisibleMonthIndex(selectedDate.getMonth());
    setIsCalendarOpen(true);
  }, [selectedDate]);

  const onSelectCalendarDate = useCallback((d) => {
    setSelectedDate(startOfDay(d));
    setSelectedSlotId('');
    setIsCalendarOpen(false);
  }, []);

  const dateDisplayLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    [selectedDate]
  );

  const heroUri =
    animal?.imageUrl &&
    (animal.imageUrl.startsWith('http')
      ? animal.imageUrl
      : resolveUploadsFileUri(animal.imageUrl));

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsRes, photogRes] = await Promise.all([
        apiClient.get('/time-slots'),
        apiClient.get('/photographers'),
      ]);
      if (slotsRes.data.success) setAllSlots(slotsRes.data.data);
      if (photogRes.data.success) setPhotographers(photogRes.data.data.filter((p) => p.isActive));
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableSlots = allSlots.filter((slot) => {
    if ((slot.type || '').toLowerCase() !== bookingType.toLowerCase()) return false;

    let slotDateStr = slot.date;
    if (typeof slotDateStr !== 'string') slotDateStr = new Date(slotDateStr).toISOString().split('T')[0];

    if (slotDateStr !== dateKey) return false;
    if (slot.isBooked) return false;

    if (bookingType === 'Photography') {
      if (selectedPhotographer && slot.photographer?._id !== selectedPhotographer._id) return false;
      return true;
    }
    const targetAnimal = (animal?.name || '').toLowerCase();
    const slotAnimal = (slot.animalName || '').toLowerCase();
    return slotAnimal === targetAnimal || slotAnimal === 'all';
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
      const selectedSlot = allSlots.find((s) => s._id === selectedSlotId);
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
          numberOfParticipants: 1,
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
          duration: 60,
        };
      }

      const response = await apiClient.post(endpoint, payload);

      if (response.data.success) {
        await apiClient.patch(`/time-slots/${selectedSlot._id}`, { isBooked: true });

        setBookingReceipt({
          type: bookingType,
          animal: animal?.name,
          date: selectedSlot.date,
          time:
            bookingType === 'Feeding'
              ? `${selectedSlot.startTime} - ${selectedSlot.endTime}`
              : selectedSlot.startTime,
          rate:
            bookingType === 'Photography'
              ? `Rs.${selectedSlot.photographer?.hourlyRate || selectedPhotographer?.hourlyRate || 0}/hr`
              : null,
          photographer: selectedSlot.photographer?.name || selectedPhotographer?.name,
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
      const msg =
        data?.message ||
        (Array.isArray(data?.errors) ? data.errors.map((e) => e.msg).join(', ') : null) ||
        error.message ||
        'Check your connection and try again.';
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
      <Text style={[styles.chipText, selectedPhotographer?._id === item._id && styles.activeChipText]}>
        {item.name}
      </Text>
      <Text style={[styles.chipRate, selectedPhotographer?._id === item._id && styles.activeChipText]}>
        Rs.{item.hourlyRate}/hr
      </Text>
    </TouchableOpacity>
  );

  const errBorder = phoneError ? { borderColor: theme.colors.error, borderWidth: 1 } : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {heroUri ? <Image source={{ uri: heroUri }} style={styles.heroImage} /> : null}

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{animal?.name}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{bookingType}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={visitorName} onChangeText={setVisitorName} placeholder="Your name" />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, errBorder]}
              value={contactInfo}
              onChangeText={(val) => {
                setContactInfo(val);
                setPhoneError('');
              }}
              placeholder="10-digit phone number"
              keyboardType="default"
              maxLength={10}
            />
            {phoneError ? <Text style={styles.phoneError}>{phoneError}</Text> : null}

            <Text style={styles.label}>Select Date</Text>
            <TouchableOpacity
              style={styles.datePickerBtn}
              onPress={openCalendar}
              accessibilityRole="button"
              accessibilityLabel="Open calendar to choose session date"
              activeOpacity={0.7}
            >
              <Text style={styles.datePickerText}>{dateDisplayLabel}</Text>
              <Ionicons name="calendar-outline" size={22} color={theme.colors.linkGreen} />
            </TouchableOpacity>
          </View>

          {bookingType === 'Photography' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Choose photographer (hourly rate)</Text>
              <FlatList
                horizontal
                data={photographers}
                keyExtractor={(item) => item._id}
                renderItem={renderPhotographer}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 5 }}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{bookingType === 'Photography' ? '2. ' : ''}Available slots</Text>
            <View style={styles.slotsGrid}>
              {availableSlots.length > 0 ? (
                availableSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot._id}
                    style={[styles.slotItem, selectedSlotId === slot._id && styles.activeSlot]}
                    onPress={() => setSelectedSlotId(slot._id)}
                  >
                    <Text style={[styles.slotTime, selectedSlotId === slot._id && styles.activeText]}>
                      {slot.startTime}
                    </Text>
                    {bookingType === 'Photography' ? (
                      <Text style={[styles.slotSub, selectedSlotId === slot._id && styles.activeText]}>
                        {slot.photographer?.name}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>No available slots for this selection.</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.confirmBtn, (!selectedSlotId || loading) && styles.disabledBtn]}
            onPress={handleConfirmBooking}
            disabled={!selectedSlotId || loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.confirmBtnText}>Confirm {bookingType} booking</Text>
            )}
          </TouchableOpacity>
          <View style={{ height: 60 }} />
        </View>
      </ScrollView>

      <Modal visible={successModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark-circle" size={56} color={theme.colors.accentGreen} />
            </View>
            <Text style={styles.successTitle}>Successfully booked</Text>
            <Text style={styles.successSub}>Your session is reserved. Details:</Text>

            <View style={styles.receipt}>
              <View style={styles.receiptLine}>
                <Text style={styles.receiptLabel}>Animal</Text>
                <Text style={styles.receiptVal}>{bookingReceipt?.animal}</Text>
              </View>
              <View style={styles.receiptLine}>
                <Text style={styles.receiptLabel}>Activity</Text>
                <Text style={styles.receiptVal}>{bookingReceipt?.type}</Text>
              </View>
              <View style={styles.receiptLine}>
                <Text style={styles.receiptLabel}>Date</Text>
                <Text style={styles.receiptVal}>{bookingReceipt?.date}</Text>
              </View>
              <View style={styles.receiptLine}>
                <Text style={styles.receiptLabel}>Time</Text>
                <Text style={styles.receiptVal}>{bookingReceipt?.time}</Text>
              </View>
              {bookingReceipt?.rate ? (
                <View style={styles.receiptLine}>
                  <Text style={styles.receiptLabel}>Rate</Text>
                  <Text style={styles.receiptVal}>{bookingReceipt.rate}</Text>
                </View>
              ) : null}
              {bookingReceipt?.photographer ? (
                <View style={styles.receiptLine}>
                  <Text style={styles.receiptLabel}>With</Text>
                  <Text style={styles.receiptVal}>{bookingReceipt?.photographer}</Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                setSuccessModalVisible(false);
                popOrParentGoBack(navigation);
              }}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isCalendarOpen} transparent animationType="fade" onRequestClose={() => setIsCalendarOpen(false)}>
        <View style={styles.calendarModalBackdrop}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.calendarModalDismissLayer}
            onPress={() => setIsCalendarOpen(false)}
            accessibilityLabel="Dismiss calendar"
          />
          <View style={styles.calendarModalCard}>
            <VisitDateCalendar
              showIntro={false}
              visibleYear={visibleYear}
              visibleMonthIndex={visibleMonthIndex}
              onPrevMonth={onPrevMonth}
              onNextMonth={onNextMonth}
              canGoPrevMonth={canGoPrevMonth}
              canGoNextMonth={canGoNextMonth}
              selectedDate={selectedDate}
              onSelectDate={onSelectCalendarDate}
              onClose={() => setIsCalendarOpen(false)}
              minDate={min}
              maxDate={max}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundAlt },
  heroImage: { width: '100%', height: 220, backgroundColor: theme.colors.sage },
  content: { padding: theme.spacing.lg },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: '700', color: theme.colors.primaryText },
  typeBadge: {
    backgroundColor: theme.colors.sageButton,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  typeText: { color: theme.colors.linkGreen, fontWeight: '700', fontSize: 12 },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.primaryText,
    opacity: 0.7,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: theme.radii.sm,
    padding: 15,
    fontSize: theme.fontSize.body,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: theme.radii.sm,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  datePickerText: {
    fontSize: theme.fontSize.body,
    fontWeight: '600',
    color: theme.colors.primaryText,
    flex: 1,
  },
  calendarModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  calendarModalDismissLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  calendarModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  phoneError: { color: theme.colors.error, fontSize: 12, marginTop: -10, marginBottom: 10, marginLeft: 5 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.linkGreen, marginBottom: 15 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.welcomeBackground,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeChip: { backgroundColor: theme.colors.accentGreen, borderColor: theme.colors.accentGreen },
  chipText: { color: theme.colors.primaryText, fontWeight: '700' },
  chipRate: { color: theme.colors.primaryText, opacity: 0.65, fontSize: 11, marginTop: 2 },
  activeChipText: { color: theme.colors.white, opacity: 1 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  slotItem: {
    width: '31%',
    backgroundColor: theme.colors.welcomeBackground,
    padding: 12,
    borderRadius: theme.radii.sm,
    margin: '1%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeSlot: { backgroundColor: theme.colors.accentGreen, borderColor: theme.colors.accentGreen },
  slotTime: { fontSize: 15, fontWeight: '700', color: theme.colors.primaryText },
  slotSub: { fontSize: 10, color: theme.colors.primaryText, opacity: 0.55, marginTop: 4 },
  activeText: { color: theme.colors.white, opacity: 1 },
  confirmBtn: {
    backgroundColor: theme.colors.accentGreen,
    padding: 18,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmBtnText: { color: theme.colors.white, fontSize: theme.fontSize.lg, fontWeight: '700' },
  disabledBtn: { backgroundColor: theme.colors.sage, opacity: 0.7 },
  emptyText: { color: theme.colors.primaryText, opacity: 0.55, fontStyle: 'italic' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  successCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  successIconWrap: { marginBottom: theme.spacing.sm },
  successTitle: { fontSize: 22, fontWeight: '700', color: theme.colors.linkGreen, marginBottom: 8 },
  successSub: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.72, textAlign: 'center', marginBottom: 20 },
  receipt: {
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: theme.radii.md,
    padding: 15,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  receiptLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  receiptLabel: { color: theme.colors.primaryText, opacity: 0.65, fontSize: theme.fontSize.sm },
  receiptVal: { fontWeight: '700', color: theme.colors.primaryText, fontSize: theme.fontSize.sm, maxWidth: '58%', textAlign: 'right' },
  doneBtn: {
    backgroundColor: theme.colors.accentGreen,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: theme.radii.sm,
  },
  doneBtnText: { color: theme.colors.white, fontWeight: '700' },
});
