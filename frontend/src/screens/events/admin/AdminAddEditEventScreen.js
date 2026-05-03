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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system/legacy';
import { getApiBaseUrl, resolveUploadsFileUri } from "../../../api/getApiBaseUrl";
import { getToken } from "../../../services/tokenStorage";
import { popOrParentGoBack } from "../../../utils/popOrParentGoBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../../constants/theme";

/** Muted placeholder / secondary text on mint surfaces */
const PLACEHOLDER = `${theme.colors.primaryText}66`;

const EVENT_TYPES = ["Wedding", "Birthday", "Corporate", "Anniversary", "Graduation", "Other"];

/** RN FormData file part for Multer field name "image" */
function buildImageFormPart(asset) {
  const uri = asset.uri;
  let name =
    typeof asset.fileName === "string" && asset.fileName.trim()
      ? asset.fileName.trim()
      : uri.split("/").pop()?.split("?")[0] || "";
  if (!name || !/[.][a-z0-9]{2,5}$/i.test(name)) {
    const extFromMime =
      typeof asset.mimeType === "string" && asset.mimeType.includes("png") ? "png" : "jpg";
    name = `event-${Date.now()}.${extFromMime}`;
  }
  const ext = /\.(\w+)$/.exec(name)?.[1]?.toLowerCase();
  const typeFromExt =
    ext === "png"
      ? "image/png"
      : ext === "webp"
        ? "image/webp"
        : ext === "heic"
          ? "image/heic"
          : "image/jpeg";
  let type = typeof asset.mimeType === "string" && asset.mimeType.trim() ? asset.mimeType.trim() : typeFromExt;
  if (type === "image/jpg") type = "image/jpeg";
  return { uri, name, type };
}

/** RN `<Image>` often won't render Android `content://` / iOS `ph://`; use data URI when we have base64 from the picker. */
function pickerPreviewSource(asset) {
  if (!asset?.uri) return null;
  const { uri, base64, mimeType } = asset;
  if (typeof base64 === "string" && base64.length > 0) {
    const needsDataUri =
      uri.startsWith("content") ||
      uri.startsWith("ph://") ||
      uri.startsWith("assets-library");
    if (needsDataUri) {
      let mime = "image/jpeg";
      if (typeof mimeType === "string" && mimeType.startsWith("image/")) {
        mime = mimeType.split(";")[0].trim();
      }
      return { uri: `data:${mime};base64,${base64}` };
    }
  }
  return { uri };
}

/**
 * Prefer picker `base64` → cache file (Expo reads the asset for us; avoids broken `content://` + FormData).
 * Fallback: copy/read native URI into cache.
 */
async function preparePickerAssetForUpload(asset) {
  if (!asset) return null;
  if (Platform.OS === "web") return asset.uri || null;

  if (typeof asset.base64 === "string" && asset.base64.length > 0) {
    if (!FileSystem.cacheDirectory) {
      throw new Error("App storage is unavailable. Restart the app and try again.");
    }
    const ext = asset.mimeType?.includes("png") ? "png" : "jpg";
    const dest = `${FileSystem.cacheDirectory}event-upload-${Date.now()}.${ext}`;
    await FileSystem.writeAsStringAsync(dest, asset.base64, { encoding: "base64" });
    return dest;
  }

  return ensureUploadableFileUri(asset);
}

/**
 * Android `content://` (and some iOS library URIs) do not always stream reliably into multipart
 * unless copied to a cache `file://` path.
 */
async function ensureUploadableFileUri(asset) {
  const uri = asset?.uri;
  if (!uri) return null;

  if (Platform.OS === "web") return uri;

  if (Platform.OS === "android" && uri.startsWith("content")) {
    const ext = asset.mimeType?.includes("png") ? "png" : "jpg";
    const dest = `${FileSystem.cacheDirectory}event-upload-${Date.now()}.${ext}`;
    try {
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    } catch (copyErr) {
      console.warn("[ensureUploadableFileUri] copyAsync failed, trying read as base64", copyErr);
      try {
        const b64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" });
        await FileSystem.writeAsStringAsync(dest, b64, { encoding: "base64" });
        return dest;
      } catch (readErr) {
        console.error("[ensureUploadableFileUri] read/write failed", readErr);
        throw new Error(
          "Could not read this photo from storage. Try another image, use the camera, or enter an image URL."
        );
      }
    }
  }

  if (
    Platform.OS === "ios" &&
    (uri.startsWith("ph://") || uri.startsWith("assets-library://"))
  ) {
    const ext = asset.mimeType?.includes("png") ? "png" : "jpg";
    const dest = `${FileSystem.cacheDirectory}event-upload-${Date.now()}.${ext}`;
    try {
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    } catch (e) {
      console.warn("[ensureUploadableFileUri] iOS library copy failed, using original URI", e);
      return uri;
    }
  }

  if (Platform.OS === "android" && !uri.startsWith("file://") && uri.startsWith("/")) {
    return `file://${uri}`;
  }

  return uri;
}

export default function AdminAddEditEventScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
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
  const [availableDates, setAvailableDates] = useState(
    existing?.availableDates?.map((d) => new Date(d)) || []
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /** Same shape as AnimalManagementScreen (known-good on Expo Go + Android). */
  const libraryPickerOptions = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: Platform.OS === "ios",
    ...(Platform.OS === "ios" ? { aspect: [16, 9] } : {}),
    quality: 0.75,
    /** Write upload file from bytes; gallery `content://` is unreliable for FormData alone. */
    base64: true,
  };

  /** After process death, Android may return no `assets`; native module may still hold the pick here. */
  async function mergeAndroidPendingPickerResult(initial) {
    if (Platform.OS !== "android" || !initial) return initial;
    if (initial.assets?.length) return initial;
    try {
      const pending = await ImagePicker.getPendingResultAsync();
      if (pending?.canceled === false && pending.assets?.length) return pending;
    } catch (e) {
      console.warn("[mergeAndroidPendingPickerResult]", e);
    }
    return initial;
  }

  const pickImage = async () => {
    try {
      let perm = await ImagePicker.getMediaLibraryPermissionsAsync();
      let ok =
        perm.granted ||
        perm.accessPrivileges === "all" ||
        perm.accessPrivileges === "limited";
      if (!ok) {
        perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        ok =
          perm.granted ||
          perm.accessPrivileges === "all" ||
          perm.accessPrivileges === "limited";
      }
      if (!ok) {
        Alert.alert(
          "Permission needed",
          "Allow photo access in Settings → Apps → Expo Go → Permissions, then try again.",
          [{ text: "OK" }]
        );
        return;
      }

      /** Must follow the permission await immediately — do not wrap in setTimeout (breaks Android user-gesture). */
      let result = await ImagePicker.launchImageLibraryAsync(libraryPickerOptions);
      result = await mergeAndroidPendingPickerResult(result);

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (asset) {
        setImage(asset);
        setImageUrl("");
      } else {
        Alert.alert("No image", "No file was returned from the photo library. Try again.");
      }
    } catch (err) {
      const msg =
        err?.message ||
        err?.toString?.() ||
        "Could not open the photo library.";
      Alert.alert("Error", `${msg}\n\nRestart the app or check photo permissions in Settings.`);
    }
  };

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

      if (imageUrl.trim() && !image) {
        formData.append("imageUrl", imageUrl.trim());
      }

      /** Append binary last — works best with RN FormData + Multer across iOS/Android. */
      if (image) {
        if (Platform.OS === "web") {
          const blobResp = await fetch(image.uri);
          const blob = await blobResp.blob();
          const fn =
            image.fileName ||
            (image.mimeType?.includes("png") ? `event-${Date.now()}.png` : `event-${Date.now()}.jpg`);
          formData.append("image", blob, fn);
        } else {
          const uploadUri = await preparePickerAssetForUpload(image);
          if (!uploadUri) {
            throw new Error("Selected image is missing a valid URI.");
          }
          const part = buildImageFormPart({ ...image, uri: uploadUri });
          formData.append("image", part);
        }
      }

      // Native multipart + axios is unreliable on many Android builds; mirror AnimalManagementScreen (fetch, no Content-Type).
      const apiBase = getApiBaseUrl().replace(/\/+$/, "");
      const url = isEdit ? `${apiBase}/events/${existing._id}` : `${apiBase}/events`;
      const token = await getToken();
      const headers = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const fetchRes = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers,
        body: formData,
      });

      const text = await fetchRes.text();
      let json = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (!fetchRes.ok) {
        const validation =
          Array.isArray(json?.errors) && json.errors.length
            ? json.errors.map((e) => e.msg || e.message).filter(Boolean).join(" ")
            : "";
        throw new Error(validation || json?.message || text || `Request failed (${fetchRes.status})`);
      }
      if (json?.success === false) {
        throw new Error(json?.message || "Save failed");
      }

      const saved = json?.data;
      if (saved?.imageUrl) setImageUrl(saved.imageUrl);
      Alert.alert("Success", isEdit ? "Event updated." : "Event created.", [
        { text: "OK", onPress: () => popOrParentGoBack(navigation) },
      ]);
    } catch (err) {
      const data = err?.response?.data;
      const validation =
        Array.isArray(data?.errors) && data.errors.length ? data.errors.map((e) => e.msg || e.message).join(" ") : null;
      const msg =
        validation ||
        data?.message ||
        err?.message ||
        "Could not save the event. Check your connection and try again.";
      console.error("[AdminAddEditEventScreen] save failed", data || err?.message);
      Alert.alert("Could not save event", String(msg));
    } finally {
      setLoading(false);
    }
  };

  const imageSource = image
    ? pickerPreviewSource(image)
    : imageUrl.trim()
      ? (() => {
          const raw = imageUrl.trim();
          const pathFix =
            raw.startsWith("/uploads/") && !raw.startsWith("/uploads/events/")
              ? raw.replace("/uploads/", "/uploads/events/")
              : raw;
          const resolved = raw.startsWith("http") ? resolveUploadsFileUri(pathFix) || pathFix : resolveUploadsFileUri(pathFix);
          return resolved ? { uri: resolved } : null;
        })()
      : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.backgroundAlt} />

      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
        <TouchableOpacity
          onPress={() => popOrParentGoBack(navigation)}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? "Edit Event" : "Add New Event"}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Field label="Event Image">
          <TouchableOpacity style={styles.imageBox} onPress={() => void pickImage()} accessibilityRole="button" accessibilityLabel="Choose photo from gallery">
            {imageSource ? (
              <>
                <Image source={imageSource} style={styles.imagePreview} resizeMode="cover" />
                <View style={styles.imageOverlay}>
                  <Ionicons name="images-outline" size={22} color={theme.colors.white} />
                  <Text style={styles.imageOverlayText}>Change photo</Text>
                </View>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color={theme.colors.linkGreen} />
                <Text style={styles.imagePlaceholderText}>Tap to add event image</Text>
                <Text style={styles.imagePlaceholderSub}>Opens your photo gallery</Text>
              </View>
            )}
          </TouchableOpacity>
        </Field>

        <Field label="Event Title *" error={errors.title}>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="e.g. Safari Wedding Package"
            placeholderTextColor={PLACEHOLDER}
            value={title}
            onChangeText={setTitle}
          />
        </Field>

        <Field label="Description *" error={errors.description}>
          <TextInput
            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            placeholder="Describe the event package..."
            placeholderTextColor={PLACEHOLDER}
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
            placeholderTextColor={PLACEHOLDER}
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
                placeholderTextColor={PLACEHOLDER}
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
                placeholderTextColor={PLACEHOLDER}
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
            placeholderTextColor={PLACEHOLDER}
            value={duration}
            onChangeText={setDuration}
          />
        </Field>

        <Field label="What's Included (comma separated)">
          <TextInput
            style={styles.input}
            placeholder="e.g. Catering, Decoration, Photography"
            placeholderTextColor={PLACEHOLDER}
            value={includesText}
            onChangeText={setIncludesText}
          />
        </Field>

        <Field label="Requirements">
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special requirements..."
            placeholderTextColor={PLACEHOLDER}
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
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <>
              <Ionicons
                name={isEdit ? "save-outline" : "add-circle-outline"}
                size={20}
                color={theme.colors.white}
              />
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
  container: { flex: 1, backgroundColor: theme.colors.backgroundAlt },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  backBtn: { padding: theme.spacing.xs },
  headerTitle: {
    fontSize: theme.fontSize.title - 2,
    fontWeight: "800",
    fontFamily: theme.fonts.extraBold,
    color: theme.colors.primaryText,
    flex: 1,
  },
  scroll: { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm },
  fieldGroup: { marginBottom: theme.spacing.md },
  label: {
    fontSize: theme.fontSize.sm - 1,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.sm - 1,
    opacity: 0.92,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.md - 2,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  inputError: { borderColor: theme.colors.error, borderWidth: 1.5 },
  errorText: { color: theme.colors.error, fontSize: theme.fontSize.sm - 2, marginTop: 4, fontFamily: theme.fonts.semiBold },
  row: { flexDirection: "row" },

  imageBox: {
    width: "100%",
    height: 180,
    borderRadius: theme.radii.sm + 2,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: theme.colors.sage,
    borderStyle: "dashed",
    backgroundColor: theme.colors.white,
  },
  imagePreview: { width: "100%", height: "100%" },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13,45,29,0.42)",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  imageOverlayText: {
    color: theme.colors.white,
    fontWeight: "700",
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.bold,
  },
  imagePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: theme.spacing.sm },
  imagePlaceholderText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    color: theme.colors.linkGreen,
  },
  imagePlaceholderSub: {
    fontSize: theme.fontSize.sm - 2,
    color: theme.colors.primaryText,
    opacity: 0.52,
    fontFamily: theme.fonts.semiBold,
  },

  typeRow: { flexDirection: "row", gap: theme.spacing.sm, paddingVertical: 2 },
  typeChip: {
    borderWidth: 1.5,
    borderColor: theme.colors.accentGreen,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md - 2,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  typeChipActive: { backgroundColor: theme.colors.accentGreen, borderColor: theme.colors.linkGreen },
  typeChipText: {
    color: theme.colors.linkGreen,
    fontWeight: "600",
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm - 1,
  },
  typeChipTextActive: { color: theme.colors.white },

  datesList: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm, marginBottom: theme.spacing.sm + 2 },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.sm + 4,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  datePillText: {
    fontSize: theme.fontSize.sm - 1,
    color: theme.colors.primaryText,
    fontWeight: "600",
    fontFamily: theme.fonts.semiBold,
  },
  addDateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.accentGreen,
    borderStyle: "dashed",
    borderRadius: theme.radii.sm,
    padding: theme.spacing.md - 2,
    justifyContent: "center",
    backgroundColor: theme.colors.white,
  },
  addDateBtnText: {
    color: theme.colors.linkGreen,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.sm,
  },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: theme.colors.accentGreen,
    borderRadius: theme.radii.md - 2,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.linkGreen,
    shadowColor: theme.colors.primaryText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  submitBtnText: {
    color: theme.colors.white,
    fontWeight: "800",
    fontFamily: theme.fonts.extraBold,
    fontSize: theme.fontSize.lg - 2,
  },
  iosConfirmBtn: {
    backgroundColor: theme.colors.accentGreen,
    margin: theme.spacing.md,
    borderRadius: theme.radii.sm,
    paddingVertical: theme.spacing.md - 2,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.linkGreen,
  },
  iosConfirmText: {
    color: theme.colors.white,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.body,
  },
});
