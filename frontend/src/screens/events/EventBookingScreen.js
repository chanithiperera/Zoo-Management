import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { bookEvent } from "../../api/events.api";
import { popOrParentGoBack } from "../../utils/popOrParentGoBack";
import { theme } from "../../constants/theme";

const PLACEHOLDER = `${theme.colors.primaryText}66`;

export default function EventBookingScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { event } = route.params;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const [eventDate, setEventDate] = useState(tomorrow);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guestCount, setGuestCount] = useState("1");
  const [contactPhone, setContactPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const totalPrice = (parseInt(guestCount, 10) || 0) * event.pricePerPerson;

  const validate = () => {
    const e = {};
    const guests = parseInt(guestCount, 10);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(eventDate);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) e.eventDate = "Please select today or a future date";
    if (!contactPhone.trim()) e.contactPhone = "Contact phone is required";
    else if (!/^[0-9]{10}$/.test(contactPhone.trim()))
      e.contactPhone = "Enter a valid 10-digit phone number";
    if (!guestCount || Number.isNaN(guests) || guests < 1) e.guestCount = "At least 1 guest is required";
    else if (guests > event.capacity) e.guestCount = `Maximum capacity is ${event.capacity} guests`;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await bookEvent(event._id, {
        eventDate: eventDate.toISOString(),
        guestCount: parseInt(guestCount, 10),
        contactPhone: contactPhone.trim(),
        specialRequests: specialRequests.trim(),
      });
      Alert.alert("Booking submitted", "Your booking request has been received. We will confirm shortly.", [
        { text: "View my bookings", onPress: () => navigation.navigate("MyBookings") },
        { text: "OK", onPress: () => navigation.navigate("EventsList") },
      ]);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit booking.";
      if (err?.response?.status === 409) {
        Alert.alert("Date already booked", "This date is already booked. Please choose a different date.", [
          { text: "Choose another date", onPress: () => setShowDatePicker(true) },
        ]);
      } else {
        Alert.alert("Booking failed", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.backgroundAlt} />

      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <Pressable
          onPress={() => popOrParentGoBack(navigation)}
          style={styles.headerBackHit}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={theme.colors.primaryText} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Book event
        </Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Ionicons name="calendar" size={22} color={theme.colors.accentGreen} />
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryEventTitle}>{event.title}</Text>
              <Text style={styles.summaryVenue}>
                {event.venue} · {event.eventType}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Event date *</Text>
            <Pressable
              style={({ pressed }) => [
                styles.datePicker,
                errors.eventDate && styles.inputError,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color={theme.colors.accentGreen} />
              <Text style={styles.dateText}>
                {eventDate.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <Ionicons name="chevron-down" size={16} color={theme.colors.primaryText} style={{ opacity: 0.4 }} />
            </Pressable>
            {errors.eventDate ? <Text style={styles.errorText}>{errors.eventDate}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Number of guests *</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setGuestCount((p) => String(Math.max(1, parseInt(p || "1", 10) - 1)))}
              >
                <Ionicons name="remove" size={20} color={theme.colors.primaryText} />
              </TouchableOpacity>
              <TextInput
                style={[styles.counterInput, errors.guestCount && styles.inputError]}
                value={guestCount}
                onChangeText={(v) => setGuestCount(v.replace(/[^0-9]/g, ""))}
                keyboardType="numeric"
                textAlign="center"
              />
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() =>
                  setGuestCount((p) => String(Math.min(event.capacity, parseInt(p || "1", 10) + 1)))
                }
              >
                <Ionicons name="add" size={20} color={theme.colors.primaryText} />
              </TouchableOpacity>
            </View>
            {errors.guestCount ? <Text style={styles.errorText}>{errors.guestCount}</Text> : null}
            <Text style={styles.hint}>Maximum: {event.capacity} guests</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contact phone *</Text>
            <View style={[styles.inputWrapper, errors.contactPhone && styles.inputError]}>
              <Ionicons name="call-outline" size={18} color={theme.colors.accentGreen} />
              <TextInput
                style={styles.textInput}
                placeholder="07X XXX XXXX"
                placeholderTextColor={PLACEHOLDER}
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            {errors.contactPhone ? <Text style={styles.errorText}>{errors.contactPhone}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Special requests (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Dietary needs, decorations, accessibility, etc."
              placeholderTextColor={PLACEHOLDER}
              value={specialRequests}
              onChangeText={setSpecialRequests}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>{specialRequests.length}/500</Text>
          </View>
        </View>

        <View style={styles.priceSummary}>
          <Text style={styles.priceSummaryTitle}>Price summary</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              LKR {event.pricePerPerson?.toLocaleString()} × {guestCount || 0} guests
            </Text>
            <Text style={styles.priceValue}>LKR {totalPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Event date</Text>
            <Text style={styles.priceValue}>
              {eventDate.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceTotalLabel}>Total</Text>
            <Text style={styles.priceTotalValue}>LKR {totalPrice.toLocaleString()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.72 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Confirm booking request</Text>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Your booking is subject to confirmation by our team. You will be notified once confirmed.
        </Text>
        <View style={{ height: theme.spacing.lg }} />
      </ScrollView>

      {showDatePicker ? (
        <DateTimePicker
          value={eventDate}
          mode="date"
          minimumDate={(() => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            return d;
          })()}
          display={Platform.OS === "ios" ? "spinner" : "calendar"}
          onChange={(e, date) => {
            if (Platform.OS === "android") {
              setShowDatePicker(false);
              if (e.type === "set" && date) {
                setEventDate(date);
                setErrors((prev) => ({ ...prev, eventDate: undefined }));
              }
            } else if (date) {
              setEventDate(date);
            }
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundAlt },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.backgroundAlt,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  headerBackHit: {
    paddingVertical: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
    marginRight: theme.spacing.xs,
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.fontSize.title,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
  },
  headerRightSpacer: { width: 26, marginLeft: theme.spacing.sm },
  scroll: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.lg },
  summaryCard: {
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm + 4 },
  summaryInfo: { flex: 1 },
  summaryEventTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
  },
  summaryVenue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.65,
    marginTop: 4,
    fontFamily: theme.fonts.regular,
  },
  form: { gap: 4 },
  fieldGroup: { marginBottom: theme.spacing.md + 2 },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.sm,
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm + 2,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.md - 2,
    paddingVertical: theme.spacing.sm + 6,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  dateText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    fontFamily: theme.fonts.regular,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm + 6,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    fontFamily: theme.fonts.regular,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.md - 2,
    paddingVertical: theme.spacing.sm + 4,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm + 2,
  },
  textInput: { flex: 1, fontSize: theme.fontSize.sm, color: theme.colors.primaryText, fontFamily: theme.fonts.regular },
  inputError: { borderColor: theme.colors.error },
  textArea: { height: 100, textAlignVertical: "top" },
  counterRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm + 4 },
  counterBtn: {
    backgroundColor: theme.colors.sageButton,
    borderRadius: theme.radii.sm - 4,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  counterInput: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.sm,
    height: 44,
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  errorText: { color: theme.colors.error, fontSize: theme.fontSize.sm - 2, marginTop: 4, fontFamily: theme.fonts.semiBold },
  hint: {
    fontSize: theme.fontSize.sm - 2,
    color: theme.colors.primaryText,
    opacity: 0.5,
    marginTop: 4,
    fontFamily: theme.fonts.regular,
  },
  charCount: {
    fontSize: theme.fontSize.sm - 2,
    color: theme.colors.primaryText,
    opacity: 0.45,
    textAlign: "right",
    marginTop: 4,
    fontFamily: theme.fonts.regular,
  },
  priceSummary: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg - 2,
    marginVertical: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primaryText,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  priceSummaryTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    color: theme.colors.linkGreen,
    marginBottom: theme.spacing.sm + 4,
  },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: theme.spacing.sm },
  priceLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.65,
    fontFamily: theme.fonts.regular,
  },
  priceValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.primaryText,
  },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.sm + 2 },
  priceTotalLabel: {
    fontSize: theme.fontSize.body,
    fontWeight: "800",
    fontFamily: theme.fonts.extraBold,
    color: theme.colors.primaryText,
  },
  priceTotalValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: "800",
    fontFamily: theme.fonts.extraBold,
    color: theme.colors.linkGreen,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm + 2,
    backgroundColor: theme.colors.accentGreen,
    borderRadius: theme.radii.md - 2,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linkGreen,
  },
  submitBtnText: {
    color: theme.colors.white,
    fontWeight: "800",
    fontSize: theme.fontSize.body,
    fontFamily: theme.fonts.extraBold,
  },
  disclaimer: {
    fontSize: theme.fontSize.sm - 2,
    color: theme.colors.primaryText,
    opacity: 0.52,
    textAlign: "center",
    marginTop: theme.spacing.sm + 4,
    lineHeight: Math.round((theme.fontSize.sm - 2) * 1.45),
    fontFamily: theme.fonts.regular,
  },
});
