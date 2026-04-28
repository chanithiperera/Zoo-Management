import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, StatusBar, Platform, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { createEvent, updateEvent } from "../../../api/events.api";

const EVENT_TYPES = ["Wedding", "Birthday", "Corporate", "Anniversary", "Graduation", "Other"];

export default function AdminAddEditEventScreen({ route, navigation }) {
  const existing = route.params?.event;
  const isEdit   = !!existing;

  const [title,          setTitle]          = useState(existing?.title || "");
  const [description,    setDescription]    = useState(existing?.description || "");
  const [eventType,      setEventType]      = useState(existing?.eventType || "Wedding");
  const [venue,          setVenue]          = useState(existing?.venue || "");
  const [capacity,       setCapacity]       = useState(existing?.capacity?.toString() || "");
  const [pricePerPerson, setPricePerPerson] = useState(existing?.pricePerPerson?.toString() || "");
  const [duration,       setDuration]       = useState(existing?.duration || "");
  const [requirements,   setRequirements]   = useState(existing?.requirements || "");
  const [includesText,   setIncludesText]   = useState(existing?.includes?.join(", ") || "");
  const [image,          setImage]          = useState(null);
  const [imageUrl,       setImageUrl]       = useState(existing?.imageUrl || "");
  const [showUrlInput,   setShowUrlInput]   = useState(false);
  const [availableDates, setAvailableDates] = useState(
    existing?.availableDates?.map(d => new Date(d)) || []
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate,       setTempDate]       = useState(new Date());
  const [loading,        setLoading]        = useState(false);
  const [errors,         setErrors]         = useState({});

  // ── Image Picker ──────────────────────────────────────────────────────────────
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Needed",
          "Please allow photo library access in your phone Settings → Apps → Expo Go → Permissions.",
          [{ text: "OK" }]
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setImage(result.assets[0]);
        setShowUrlInput(false);
      }
    } catch (err) {
      Alert.alert("Error", "Could not open photo library. Try using Image URL instead.");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Needed", "Please allow camera access in your phone Settings.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setImage(result.assets[0]);
        setShowUrlInput(false);
      }
    } catch (err) {
      Alert.alert("Error", "Could not open camera. Try using Image URL instead.");
    }
  };

  const showImageOptions = () => {
    Alert.alert("Event Image", "Choose how to add image", [
      { text: "Camera",        onPress: takePhoto },
      { text: "Photo Library", onPress: pickImage },
      { text: "Enter Image URL", onPress: () => setShowUrlInput(true) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // ── Available Dates ───────────────────────────────────────────────────────────
  const handleAddDate = () => {
    setTempDate(new Date());
    setShowDatePicker(true);
  };

  const handleDateChange = (e, date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (e.type === "set" && date) addDateToList(date);
    } else {
      if (date) setTempDate(date);
    }
  };

  const confirmIOSDate = () => {
    addDateToList(tempDate);
    setShowDatePicker(false);
  };

  const addDateToList = (date) => {
    date.setHours(0, 0, 0, 0);
    const exists = availableDates.some(d => d.toDateString() === date.toDateString());
    if (exists) { Alert.alert("Duplicate", "This date is already added."); return; }
    setAvailableDates(prev => [...prev, date].sort((a, b) => a - b));
  };

  const removeDate = (index) => {
    setAvailableDates(prev => prev.filter((_, i) => i !== index));
  };

  // ── Validation ────────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!title.trim())       e.title          = "Title is required";
    if (!description.trim()) e.description    = "Description is required";
    if (!venue.trim())       e.venue          = "Venue is required";
    if (!capacity || isNaN(Number(capacity)))
                             e.capacity       = "Valid capacity is required";
    if (!pricePerPerson || isNaN(Number(pricePerPerson)))
                             e.pricePerPerson = "Valid price is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title",          title.trim());
      formData.append("description",    description.trim());
      formData.append("eventType",      eventType);
      formData.append("venue",          venue.trim());
      formData.append("capacity",       capacity);
      formData.append("pricePerPerson", pricePerPerson);
      formData.append("duration",       duration.trim());
      formData.append("requirements",   requirements.trim());

      const includesArr = includesText.split(",").map(s => s.trim()).filter(Boolean);
      includesArr.forEach(inc => formData.append("includes", inc));
      availableDates.forEach(d => formData.append("availableDates", d.toISOString()));

      // Image from picker
      if (image) {
        const filename = image.uri.split("/").pop();
        const match    = /\.(\w+)$/.exec(filename);
        const type     = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("image", { uri: image.uri, name: filename, type });
      }

      // Image from URL — send as imageUrl field
      if (!image && imageUrl.trim()) {
        formData.append("imageUrl", imageUrl.trim());
      }

      if (isEdit) {
        await updateEvent(existing._id, formData);
        Alert.alert("Success ✅", "Event updated!", [{ text: "OK", onPress: () => navigation.goBack() }]);
      } else {
        await createEvent(formData);
        Alert.alert("Success ✅", "Event created!", [{ text: "OK", onPress: () => navigation.goBack() }]);
      }
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Image preview source ──────────────────────────────────────────────────────
  const imageSource = image
    ? { uri: image.uri }
    : imageUrl.trim()
      ? { uri: imageUrl.startsWith("http") ? imageUrl : `${process.env.EXPO_PUBLIC_API_URL}${imageUrl}` }
      : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F7F4" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1B4332" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? "Edit Event" : "Add New Event"}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Image Upload ── */}
        <Field label="Event Image">
          <TouchableOpacity style={styles.imageBox} onPress={showImageOptions}>
            {imageSource ? (
              <>
                <Image source={imageSource} style={styles.imagePreview} resizeMode="cover" />
                <View style={styles.imageOverlay}>
                  <Ionicons name="camera" size={22} color="#fff" />
                  <Text style={styles.imageOverlayText}>Change Image</Text>
                </View>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color="#2D6A4F" />
                <Text style={styles.imagePlaceholderText}>Tap to add event image</Text>
                <Text style={styles.imagePlaceholderSub}>Camera · Photo Library · URL</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* URL Input — shown when user picks "Enter Image URL" */}
          {showUrlInput && (
            <View style={styles.urlInputRow}>
              <TextInput
                style={styles.urlInput}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor="#bbb"
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
              <TouchableOpacity
                style={styles.urlConfirmBtn}
                onPress={() => setShowUrlInput(false)}
              >
                <Text style={styles.urlConfirmText}>OK</Text>
              </TouchableOpacity>
            </View>
          )}
        </Field>

        {/* Title */}
        <Field label="Event Title *" error={errors.title}>
          <TextInput style={[styles.input, errors.title && styles.inputError]}
            placeholder="e.g. Safari Wedding Package" placeholderTextColor="#bbb"
            value={title} onChangeText={setTitle} />
        </Field>

        {/* Description */}
        <Field label="Description *" error={errors.description}>
          <TextInput style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            placeholder="Describe the event package..." placeholderTextColor="#bbb"
            value={description} onChangeText={setDescription}
            multiline numberOfLines={4} textAlignVertical="top" />
        </Field>

        {/* Event Type */}
        <Field label="Event Type *">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.typeRow}>
              {EVENT_TYPES.map(t => (
                <TouchableOpacity key={t}
                  style={[styles.typeChip, eventType === t && styles.typeChipActive]}
                  onPress={() => setEventType(t)}>
                  <Text style={[styles.typeChipText, eventType === t && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Field>

        {/* Venue */}
        <Field label="Venue *" error={errors.venue}>
          <TextInput style={[styles.input, errors.venue && styles.inputError]}
            placeholder="e.g. Elephant Pavilion, Zoo Colombo" placeholderTextColor="#bbb"
            value={venue} onChangeText={setVenue} />
        </Field>

        {/* Capacity & Price */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Capacity *" error={errors.capacity}>
              <TextInput style={[styles.input, errors.capacity && styles.inputError]}
                placeholder="200" placeholderTextColor="#bbb"
                value={capacity} onChangeText={setCapacity} keyboardType="numeric" />
            </Field>
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Field label="Price/Person (LKR) *" error={errors.pricePerPerson}>
              <TextInput style={[styles.input, errors.pricePerPerson && styles.inputError]}
                placeholder="85000" placeholderTextColor="#bbb"
                value={pricePerPerson} onChangeText={setPricePerPerson} keyboardType="numeric" />
            </Field>
          </View>
        </View>

        {/* Duration */}
        <Field label="Duration">
          <TextInput style={styles.input}
            placeholder="e.g. 6 hours / Full Day" placeholderTextColor="#bbb"
            value={duration} onChangeText={setDuration} />
        </Field>

        {/* Includes */}
        <Field label="What's Included (comma separated)">
          <TextInput style={styles.input}
            placeholder="e.g. Catering, Decoration, Photography" placeholderTextColor="#bbb"
            value={includesText} onChangeText={setIncludesText} />
        </Field>

        {/* Requirements */}
        <Field label="Requirements">
          <TextInput style={[styles.input, styles.textArea]}
            placeholder="Any special requirements..." placeholderTextColor="#bbb"
            value={requirements} onChangeText={setRequirements}
            multiline numberOfLines={3} textAlignVertical="top" />
        </Field>

        {/* ── Available Dates ── */}
        <Field label="Available Dates">
          {availableDates.length > 0 && (
            <View style={styles.datesList}>
              {availableDates.map((d, i) => (
                <View key={i} style={styles.datePill}>
                  <Ionicons name="calendar-outline" size={13} color="#2D6A4F" />
                  <Text style={styles.datePillText}>
                    {d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                  <TouchableOpacity onPress={() => removeDate(i)}>
                    <Ionicons name="close-circle" size={16} color="#E63946" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.addDateBtn} onPress={handleAddDate}>
            <Ionicons name="add-circle-outline" size={18} color="#2D6A4F" />
            <Text style={styles.addDateBtnText}>Add Available Date</Text>
          </TouchableOpacity>
        </Field>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit} disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Ionicons name={isEdit ? "save-outline" : "add-circle-outline"} size={20} color="#fff" />
                <Text style={styles.submitBtnText}>{isEdit ? "Save Changes" : "Create Event"}</Text>
              </>
          }
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Date Picker — outside ScrollView */}
      {showDatePicker && (
        <>
          <DateTimePicker
            value={tempDate}
            mode="date"
            minimumDate={new Date()}
            display={Platform.OS === "ios" ? "spinner" : "calendar"}
            onChange={handleDateChange}
          />
          {Platform.OS === "ios" && (
            <TouchableOpacity style={styles.iosConfirmBtn} onPress={confirmIOSDate}>
              <Text style={styles.iosConfirmText}>Add This Date</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const Field = ({ label, children, error }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>{label}</Text>
    {children}
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F7F4" },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#1B4332" },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "700", color: "#333", marginBottom: 7 },
  input: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    fontSize: 14, color: "#222", borderWidth: 1.5, borderColor: "#E0EDE6",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  inputError: { borderColor: "#E63946" },
  errorText: { color: "#E63946", fontSize: 12, marginTop: 4 },
  row: { flexDirection: "row" },

  // Image
  imageBox: {
    width: "100%", height: 180, borderRadius: 14, overflow: "hidden",
    borderWidth: 1.5, borderColor: "#E0EDE6", borderStyle: "dashed",
    backgroundColor: "#fff",
  },
  imagePreview: { width: "100%", height: "100%" },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center", justifyContent: "center", gap: 6,
  },
  imageOverlayText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  imagePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  imagePlaceholderText: { fontSize: 14, fontWeight: "700", color: "#2D6A4F" },
  imagePlaceholderSub: { fontSize: 12, color: "#888" },

  // URL input
  urlInputRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  urlInput: {
    flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 12,
    fontSize: 13, color: "#222", borderWidth: 1.5, borderColor: "#E0EDE6",
  },
  urlConfirmBtn: {
    backgroundColor: "#2D6A4F", borderRadius: 12,
    paddingHorizontal: 16, justifyContent: "center",
  },
  urlConfirmText: { color: "#fff", fontWeight: "700" },

  // Type chips
  typeRow: { flexDirection: "row", gap: 8, paddingVertical: 2 },
  typeChip: {
    borderWidth: 1.5, borderColor: "#2D6A4F", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#fff",
  },
  typeChipActive: { backgroundColor: "#2D6A4F" },
  typeChipText: { color: "#2D6A4F", fontWeight: "600", fontSize: 13 },
  typeChipTextActive: { color: "#fff" },

  // Dates
  datesList: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  datePill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#D8F3DC", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: "#B7E4C7",
  },
  datePillText: { fontSize: 13, color: "#1B4332", fontWeight: "600" },
  addDateBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1.5, borderColor: "#2D6A4F", borderStyle: "dashed",
    borderRadius: 12, padding: 14, justifyContent: "center", backgroundColor: "#fff",
  },
  addDateBtnText: { color: "#2D6A4F", fontWeight: "700", fontSize: 14 },

  // Submit
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, backgroundColor: "#2D6A4F", borderRadius: 14,
    paddingVertical: 16, marginTop: 8,
  },
  submitBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  iosConfirmBtn: {
    backgroundColor: "#2D6A4F", margin: 16, borderRadius: 12,
    paddingVertical: 14, alignItems: "center",
  },
  iosConfirmText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});