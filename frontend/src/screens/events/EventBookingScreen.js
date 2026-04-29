import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet,
  ScrollView, Alert, ActivityIndicator, StatusBar, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { bookEvent } from "../../api/events.api";

export default function EventBookingScreen({ route, navigation }) {
  const { event } = route.params;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const [eventDate,      setEventDate]      = useState(tomorrow);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guestCount,     setGuestCount]     = useState("1");
  const [contactPhone,   setContactPhone]   = useState("");
  const [specialRequests,setSpecialRequests]= useState("");
  const [loading,        setLoading]        = useState(false);
  const [errors,         setErrors]         = useState({});

  const totalPrice = (parseInt(guestCount) || 0) * event.pricePerPerson;

  const validate = () => {
    const e = {};
    const guests = parseInt(guestCount);
    const today = new Date(); today.setHours(0,0,0,0);
    const selected = new Date(eventDate); selected.setHours(0,0,0,0);

    if (selected < today)
      e.eventDate = "Please select today or a future date";
    if (!contactPhone.trim())
      e.contactPhone = "Contact phone is required";
    else if (!/^[0-9]{10}$/.test(contactPhone.trim()))
      e.contactPhone = "Enter a valid 10-digit phone number";
    if (!guestCount || isNaN(guests) || guests < 1)
      e.guestCount = "At least 1 guest is required";
    else if (guests > event.capacity)
      e.guestCount = `Maximum capacity is ${event.capacity} guests`;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await bookEvent(event._id, {
        eventDate:       eventDate.toISOString(),
        guestCount:      parseInt(guestCount),
        contactPhone:    contactPhone.trim(),
        specialRequests: specialRequests.trim(),
      });
      Alert.alert(
        "Booking Submitted! 🎉",
        "Your booking request has been received. We will confirm shortly.",
        [
          { text: "View My Bookings", onPress: () => navigation.navigate("MyBookings") },
          { text: "OK", onPress: () => navigation.navigate("EventsList") },
        ]
      );
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit booking.";
      // Show specific message if date already booked
      if (err?.response?.status === 409) {
        Alert.alert(
          "Date Already Booked 📅",
          "This date is already booked by someone else. Please choose a different date.",
          [{ text: "Choose Another Date", onPress: () => setShowDatePicker(true) }]
        );
      } else {
        Alert.alert("Booking Failed", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F7F4" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1B4332" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Event</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Event Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Ionicons name="calendar" size={22} color="#2D6A4F" />
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryEventTitle}>{event.title}</Text>
              <Text style={styles.summaryVenue}>{event.venue} · {event.eventType}</Text>
            </View>
          </View>
        </View>

        <View style={styles.form}>

          {/* Event Date Picker */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Event Date *</Text>
            <Pressable
              style={({ pressed }) => [
                styles.datePicker,
                errors.eventDate && styles.inputError,
                pressed && { opacity: 0.7 }
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color="#2D6A4F" />
              <Text style={styles.dateText}>
                {eventDate.toLocaleDateString("en-GB", {
                  weekday: "long", day: "numeric",
                  month: "long", year: "numeric",
                })}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#888" />
            </Pressable>
            {errors.eventDate && <Text style={styles.errorText}>{errors.eventDate}</Text>}
          </View>

          {/* Guest Count */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Number of Guests *</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setGuestCount(p => String(Math.max(1, parseInt(p||1) - 1)))}
              >
                <Ionicons name="remove" size={20} color="#1B4332" />
              </TouchableOpacity>
              <TextInput
                style={[styles.counterInput, errors.guestCount && styles.inputError]}
                value={guestCount}
                onChangeText={v => setGuestCount(v.replace(/[^0-9]/g, ""))}
                keyboardType="numeric" textAlign="center"
              />
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setGuestCount(p => String(Math.min(event.capacity, parseInt(p||1) + 1)))}
              >
                <Ionicons name="add" size={20} color="#1B4332" />
              </TouchableOpacity>
            </View>
            {errors.guestCount && <Text style={styles.errorText}>{errors.guestCount}</Text>}
            <Text style={styles.hint}>Maximum: {event.capacity} guests</Text>
          </View>

          {/* Contact Phone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contact Phone *</Text>
            <View style={[styles.inputWrapper, errors.contactPhone && styles.inputError]}>
              <Ionicons name="call-outline" size={18} color="#2D6A4F" />
              <TextInput
                style={styles.textInput}
                placeholder="07X XXX XXXX" placeholderTextColor="#bbb"
                value={contactPhone} onChangeText={setContactPhone}
                keyboardType="phone-pad" maxLength={10}
              />
            </View>
            {errors.contactPhone && <Text style={styles.errorText}>{errors.contactPhone}</Text>}
          </View>

          {/* Special Requests */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Special Requests (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="E.g. dietary requirements, decorations, accessibility needs..."
              placeholderTextColor="#bbb"
              value={specialRequests} onChangeText={setSpecialRequests}
              multiline numberOfLines={4} maxLength={500}
            />
            <Text style={styles.charCount}>{specialRequests.length}/500</Text>
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.priceSummary}>
          <Text style={styles.priceSummaryTitle}>Price Summary</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              LKR {event.pricePerPerson?.toLocaleString()} × {guestCount || 0} guests
            </Text>
            <Text style={styles.priceValue}>LKR {totalPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Event Date</Text>
            <Text style={styles.priceValue}>
              {eventDate.toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric"
              })}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceTotalLabel}>Total</Text>
            <Text style={styles.priceTotalValue}>LKR {totalPrice.toLocaleString()}</Text>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit} disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Text style={styles.submitBtnText}>Confirm Booking Request</Text>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              </>
          }
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          * Your booking is subject to confirmation by our team. You will be notified once confirmed.
        </Text>
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Date Picker — outside ScrollView for Android */}
      {showDatePicker && (
        <DateTimePicker
          value={eventDate}
          mode="date"
          minimumDate={(() => { const d = new Date(); d.setHours(0,0,0,0); return d; })()}
          display={Platform.OS === "ios" ? "spinner" : "calendar"}
          onChange={(e, date) => {
            if (Platform.OS === "android") {
              setShowDatePicker(false);
              if (e.type === "set" && date) {
                setEventDate(date);
                setErrors(prev => ({ ...prev, eventDate: undefined }));
              }
            } else {
              if (date) setEventDate(date);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F7F4" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#1B4332" },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },

  summaryCard: {
    backgroundColor: "#D8F3DC", borderRadius: 14,
    padding: 16, marginBottom: 20,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  summaryInfo: { flex: 1 },
  summaryEventTitle: { fontSize: 15, fontWeight: "700", color: "#1B4332" },
  summaryVenue: { fontSize: 12, color: "#52796F", marginTop: 3 },

  form: { gap: 4 },
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: "700", color: "#333", marginBottom: 8 },

  // Date picker button
  datePicker: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#fff", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1.5, borderColor: "#E0EDE6",
  },
  dateText: { flex: 1, fontSize: 14, color: "#222" },

  input: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    fontSize: 14, color: "#222", borderWidth: 1.5, borderColor: "#E0EDE6",
  },
  inputWrapper: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1.5, borderColor: "#E0EDE6", gap: 10,
  },
  textInput: { flex: 1, fontSize: 14, color: "#222" },
  inputError: { borderColor: "#E63946" },
  textArea: { height: 100, textAlignVertical: "top" },

  counterRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  counterBtn: {
    backgroundColor: "#D8F3DC", borderRadius: 10,
    width: 44, height: 44, alignItems: "center", justifyContent: "center",
  },
  counterInput: {
    flex: 1, backgroundColor: "#fff", borderRadius: 12, height: 44,
    fontSize: 18, fontWeight: "700", color: "#1B4332",
    borderWidth: 1.5, borderColor: "#E0EDE6",
  },
  errorText: { color: "#E63946", fontSize: 12, marginTop: 4 },
  hint: { fontSize: 11, color: "#888", marginTop: 4 },
  charCount: { fontSize: 11, color: "#aaa", textAlign: "right", marginTop: 4 },

  priceSummary: {
    backgroundColor: "#fff", borderRadius: 16, padding: 18,
    marginVertical: 20, elevation: 2,
    shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  priceSummaryTitle: { fontSize: 15, fontWeight: "700", color: "#1B4332", marginBottom: 12 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  priceLabel: { fontSize: 13, color: "#555" },
  priceValue: { fontSize: 13, fontWeight: "600", color: "#333" },
  divider: { height: 1, backgroundColor: "#E0EDE6", marginVertical: 10 },
  priceTotalLabel: { fontSize: 15, fontWeight: "800", color: "#1B4332" },
  priceTotalValue: { fontSize: 18, fontWeight: "800", color: "#2D6A4F" },

  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, backgroundColor: "#2D6A4F", borderRadius: 14, paddingVertical: 16,
  },
  submitBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  disclaimer: {
    fontSize: 11, color: "#888", textAlign: "center",
    marginTop: 12, lineHeight: 16,
  },
});