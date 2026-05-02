import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { createEvent, updateEvent } from "../../../api/events.api";
import { getApiBaseUrl } from "../../../api/getApiBaseUrl";
import { getToken } from "../../../services/tokenStorage";

const EVENT_TYPES = ["Wedding", "Birthday", "Corporate", "Anniversary", "Graduation", "Other"];

/** RN FormData file part for Multer field name "image" */
function buildImageFormPart(asset) {
  const uri = asset.uri;
  const name =
    asset.fileName ||
    uri.split("/").pop()?.split("?")[0] ||
    `event-${Date.now()}.jpg`;
  const ext = /\.(\w+)$/.exec(name)?.[1]?.toLowerCase();
  const typeFromExt =
    ext === "png"
      ? "image/png"
      : ext === "webp"
        ? "image/webp"
        : ext === "heic"
          ? "image/heic"
          : "image/jpeg";
  const type = asset.mimeType || typeFromExt;
  return { uri, name, type };
}

async function ensureUploadableFileUri(asset) {
  const uri = asset?.uri;
  if (!uri) return null;

  // Most Android gallery selections can be `content://...` which often fails with axios+FormData.
  // Copy to cache to get a `file://...` URI that Multer will accept reliably.
  if (Platform.OS === "android" && uri.startsWith("content://")) {
    const originalName = asset.fileName || uri.split("/").pop()?.split("?")[0] || `event-${Date.now()}.jpg`;
    const safeName = originalName.replace(/[^\w.\-]/g, "_");
    const dest = `${FileSystem.cacheDirectory}${safeName}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest; // file://...
  }

  if (Platform.OS === "android" && !uri.startsWith("file://") && uri.startsWith("/")) {
    return `file://${uri}`;
  }

  return uri;
}

export default function AdminAddEditEventScreen({ route, navigation }) {
  const existing = route.params?.event;
  const isEdit = !!existing;

  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [eventType, setEventType] = useState(existing?.eventType || "Wedding");
  const [venue, setVenue] = useState(existing?.venue || "");
  const [capacity, setCapacity] = useState(existing?.capacity?.toString() || "");
  const [pricePerPerson, setPricePerPerson] = useState(existing?.pricePerPerson?.toString() || "");
  const [duration, setDuration] = useState(existing?.duration || "");
  const [requirements, setRequirements] = useState(existing?.requirements || "");
  const [includesText, setIncludesText] = useState(existing?.includes?.join(", ") || "");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl || "");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageOptionsVisible, setImageOptionsVisible] = useState(false);
  const [availableDates, setAvailableDates] = useState(
    existing?.availableDates?.map((d) => new Date(d)) || []
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // API base includes `/api`, but uploaded files are served from `/uploads` (outside `/api`).
  const uploadsBaseUrl = getApiBaseUrl().replace(/\/api\/?$/i, "");

  const libraryPickerOptions = {
    // expo-image-picker v17: use string[] (MediaType is TS-only; MediaType.Images does not exist at runtime)
    mediaTypes: ["images"],
    allowsEditing: Platform.OS === "ios",
    ...(Platform.OS === "ios" ? { aspect: [16, 9] } : {}),
    quality: 0.8,
  };

  const cameraPickerOptions = {
    allowsEditing: Platform.OS === "ios",
    ...(Platform.OS === "ios" ? { aspect: [16, 9] } : {}),
    quality: 0.8,
  };

  const afterCloseModal = (fn) => {
    setImageOptionsVisible(false);
    requestAnimationFrame(() => {
      setTimeout(fn, 120);
    });
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const ok =
        perm.granted ||
        perm.accessPrivileges === "all" ||
        perm.accessPrivileges === "limited";
      if (!ok) {
        Alert.alert(
          "Permission needed",
          "Allow photo access in Settings → Apps → Expo Go → Permissions, then try again. You can also use “Enter Image URL”.",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync(libraryPickerOptions);

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (asset) {
        setImage(asset);
        setShowUrlInput(false);
      }
    } catch (err) {
      const msg =
        err?.message ||
        err?.toString?.() ||
        "Could not open the photo library.";
      Alert.alert("Error", `${msg}\n\nTry “Enter Image URL” or restart Expo Go.`);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow camera access in Settings, then try again.", [
          { text: "OK" },
        ]);
        return;
      }
      const result = await ImagePicker.launchCameraAsync(cameraPickerOptions);
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (asset) {
        setImage(asset);
        setShowUrlInput(false);
      }
    } catch (err) {
      const msg = err?.message || err?.toString?.() || "Could not open the camera.";
      Alert.alert("Error", msg);
    }
  };

  const showImageOptions = () => setImageOptionsVisible(true);

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
    const exists = availableDates.some((d) => d.toDateString() === date.toDateString());
    if (exists) {
      Alert.alert("Duplicate", "This date is already added.");
      return;
    }
    setAvailableDates((prev) => [...prev, date].sort((a, b) => a - b));
  };

  const removeDate = (index) => {
    setAvailableDates((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required";
    if (!description.trim()) e.description = "Description is required";
    if (!venue.trim()) e.venue = "Venue is required";
    if (!capacity || isNaN(Number(capacity))) e.capacity = "Valid capacity is required";
    if (!pricePerPerson || isNaN(Number(pricePerPerson)))
      e.pricePerPerson = "Valid price is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("eventType", eventType);
      formData.append("venue", venue.trim());
      formData.append("capacity", capacity);
      formData.append("pricePerPerson", pricePerPerson);
      formData.append("duration", duration.trim());
      formData.append("requirements", requirements.trim());

      const includesArr = includesText.split(",").map((s) => s.trim()).filter(Boolean);
      includesArr.forEach((inc) => formData.append("includes", inc));
      availableDates.forEach((d) => formData.append("availableDates", d.toISOString()));

      if (image) {
        const uploadUri = await ensureUploadableFileUri(image);
        if (!uploadUri) {
          throw new Error("Selected image is missing a valid URI.");
        }
        const part = buildImageFormPart({ ...image, uri: uploadUri });
        formData.append("image", part);
      } else if (imageUrl.trim()) {
        formData.append("imageUrl", imageUrl.trim());
      }

      if (isEdit) {
        // Axios multipart PUT can throw "Network Error" on some Android devices even when the server responds.
        // Use fetch for this upload path for maximum Expo Go compatibility.
        const token = await getToken();
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/events/${existing._id}`, {
          method: "PUT",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            Accept: "application/json",
          },
          body: formData,
        });

        const text = await res.text();
        let json = null;
        try {
          json = text ? JSON.parse(text) : null;
        } catch {
          json = null;
        }
        if (!res.ok) {
          const msg = json?.message || text || `Request failed (${res.status})`;
          throw new Error(msg);
        }
        const updated = json?.data;
        if (updated?.imageUrl) setImageUrl(updated.imageUrl);
        Alert.alert("Success ✅", "Event updated!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        const token = await getToken();
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/events`, {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            Accept: "application/json",
          },
          body: formData,
        });

        const text = await res.text();
        let json = null;
        try {
          json = text ? JSON.parse(text) : null;
        } catch {
          json = null;
        }
        if (!res.ok) {
          const msg = json?.message || text || `Request failed (${res.status})`;
          throw new Error(msg);
        }
        const created = json?.data;
        if (created?.imageUrl) setImageUrl(created.imageUrl);
        Alert.alert("Success ✅", "Event created!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      // Detailed logging for debugging Android multipart failures
      const status = err?.response?.status;
      const data = err?.response?.data;
      const dataText =
        typeof data === "string"
          ? data
          : data
            ? JSON.stringify(data)
            : null;
      const fallback = String(err || "") || "Something went wrong.";
      console.error("[AdminAddEditEventScreen] update/create failed", {
        message: err?.message,
        status,
        data,
        url: err?.config?.url,
        method: err?.config?.method,
      });

      Alert.alert(
        "Upload Error (debug)",
        [
          status ? `HTTP ${status}` : null,
          err?.config?.method ? `method: ${String(err.config.method).toUpperCase()}` : null,
          err?.config?.url ? `url: ${err.config.url}` : null,
          err?.response?.data?.message ? `message: ${err.response.data.message}` : null,
          dataText ? `response: ${dataText}` : null,
          err?.message ? `error: ${err.message}` : null,
          fallback ? `raw: ${fallback}` : null,
        ]
          .filter(Boolean)
          .join("\n\n")
      );
    } finally {
      setLoading(false);
    }
  };

  const imageSource = image
    ? { uri: image.uri }
    : imageUrl.trim()
      ? {
          uri: imageUrl.startsWith("http")
            ? imageUrl
            : `${uploadsBaseUrl}${imageUrl.startsWith("/uploads/") && !imageUrl.startsWith("/uploads/events/") ? imageUrl.replace("/uploads/", "/uploads/events/") : imageUrl}`,
        }
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
              <TouchableOpacity style={styles.urlConfirmBtn} onPress={() => setShowUrlInput(false)}>
                <Text style={styles.urlConfirmText}>OK</Text>
              </TouchableOpacity>
            </View>
          )}
        </Field>

        <Field label="Event Title *" error={errors.title}>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="e.g. Safari Wedding Package"
            placeholderTextColor="#bbb"
            value={title}
            onChangeText={setTitle}
          />
        </Field>

        <Field label="Description *" error={errors.description}>
          <TextInput
            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            placeholder="Describe the event package..."
            placeholderTextColor="#bbb"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Field>

        <Field label="Event Type *">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.typeRow}>
              {EVENT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, eventType === t && styles.typeChipActive]}
                  onPress={() => setEventType(t)}
                >
                  <Text style={[styles.typeChipText, eventType === t && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Field>

        <Field label="Venue *" error={errors.venue}>
          <TextInput
            style={[styles.input, errors.venue && styles.inputError]}
            placeholder="e.g. Elephant Pavilion, Zoo Colombo"
            placeholderTextColor="#bbb"
            value={venue}
            onChangeText={setVenue}
          />
        </Field>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Capacity *" error={errors.capacity}>
              <TextInput
                style={[styles.input, errors.capacity && styles.inputError]}
                placeholder="200"
                placeholderTextColor="#bbb"
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="numeric"
              />
            </Field>
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Field label="Price/Person (LKR) *" error={errors.pricePerPerson}>
              <TextInput
                style={[styles.input, errors.pricePerPerson && styles.inputError]}
                placeholder="85000"
                placeholderTextColor="#bbb"
                value={pricePerPerson}
                onChangeText={setPricePerPerson}
                keyboardType="numeric"
              />
            </Field>
          </View>
        </View>

        <Field label="Duration">
          <TextInput
            style={styles.input}
            placeholder="e.g. 6 hours / Full Day"
            placeholderTextColor="#bbb"
            value={duration}
            onChangeText={setDuration}
          />
        </Field>

        <Field label="What's Included (comma separated)">
          <TextInput
            style={styles.input}
            placeholder="e.g. Catering, Decoration, Photography"
            placeholderTextColor="#bbb"
            value={includesText}
            onChangeText={setIncludesText}
          />
        </Field>

        <Field label="Requirements">
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special requirements..."
            placeholderTextColor="#bbb"
            value={requirements}
            onChangeText={setRequirements}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Field>

        

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name={isEdit ? "save-outline" : "add-circle-outline"} size={20} color="#fff" />
              <Text style={styles.submitBtnText}>{isEdit ? "Save Changes" : "Create Event"}</Text>
            </>
          )}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

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

      <Modal
        visible={imageOptionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageOptionsVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setImageOptionsVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Event Image</Text>
            <Text style={styles.modalSubtitle}>Choose how to add image</Text>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => afterCloseModal(() => takePhoto())}
            >
              <Text style={styles.modalBtnTextPrimary}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => afterCloseModal(() => pickImage())}
            >
              <Text style={styles.modalBtnTextPrimary}>Photo library</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setImageOptionsVisible(false);
                setShowUrlInput(true);
              }}
            >
              <Text style={styles.modalBtnTextPrimary}>Enter image URL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setImageOptionsVisible(false)}>
              <Text style={styles.modalBtnTextCancel}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#1B4332" },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "700", color: "#333", marginBottom: 7 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#222",
    borderWidth: 1.5,
    borderColor: "#E0EDE6",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  inputError: { borderColor: "#E63946" },
  errorText: { color: "#E63946", fontSize: 12, marginTop: 4 },
  row: { flexDirection: "row" },

  imageBox: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#E0EDE6",
    borderStyle: "dashed",
    backgroundColor: "#fff",
  },
  imagePreview: { width: "100%", height: "100%" },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  imageOverlayText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  imagePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  imagePlaceholderText: { fontSize: 14, fontWeight: "700", color: "#2D6A4F" },
  imagePlaceholderSub: { fontSize: 12, color: "#888" },

  urlInputRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  urlInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: "#222",
    borderWidth: 1.5,
    borderColor: "#E0EDE6",
  },
  urlConfirmBtn: {
    backgroundColor: "#2D6A4F",
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  urlConfirmText: { color: "#fff", fontWeight: "700" },

  typeRow: { flexDirection: "row", gap: 8, paddingVertical: 2 },
  typeChip: {
    borderWidth: 1.5,
    borderColor: "#2D6A4F",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  typeChipActive: { backgroundColor: "#2D6A4F" },
  typeChipText: { color: "#2D6A4F", fontWeight: "600", fontSize: 13 },
  typeChipTextActive: { color: "#fff" },

  datesList: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#D8F3DC",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#B7E4C7",
  },
  datePillText: { fontSize: 13, color: "#1B4332", fontWeight: "600" },
  addDateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#2D6A4F",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 14,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  addDateBtnText: { color: "#2D6A4F", fontWeight: "700", fontSize: 14 },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#2D6A4F",
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  submitBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  iosConfirmBtn: {
    backgroundColor: "#2D6A4F",
    margin: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  iosConfirmText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1B4332", textAlign: "center" },
  modalSubtitle: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 6, marginBottom: 16 },
  modalBtn: { paddingVertical: 14, alignItems: "center" },
  modalBtnTextPrimary: { fontSize: 16, fontWeight: "700", color: "#007AFF", textTransform: "capitalize" },
  modalBtnCancel: { paddingVertical: 12, alignItems: "center", marginTop: 4 },
  modalBtnTextCancel: { fontSize: 16, color: "#888", fontWeight: "600" },
});
