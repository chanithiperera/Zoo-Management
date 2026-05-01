import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import VisitDateCalendar from '../../components/booking/VisitDateCalendar';
import { theme } from '../../constants/theme';
import {
  getBookingDateBounds,
  isDateInBookingWindow,
  monthStartTs,
  startOfDay,
  toLocalDateKey,
} from '../../utils/visitCalendar';
import { submitGroupRequest } from '../../api/groupBookingRequest.api';

const GROUP_TYPE_OPTIONS = [
  { value: 'school', label: 'School', icon: 'school-outline' },
  { value: 'tourist', label: 'Tourist group', icon: 'bus-multiple' },
  { value: 'other', label: 'Other', icon: 'account-group-outline' },
];

const MIN_GROUP_SIZE = 20;
const MIN_GROUP_BOOKING_DAYS_AHEAD = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function FieldLabel({ children, required }) {
  return (
    <Text style={styles.fieldLabel}>
      {children}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
  );
}

function GroupTypeChip({ option, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.typeChip,
        selected && styles.typeChipSelected,
        pressed && styles.typeChipPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Group type ${option.label}`}
    >
      <MaterialCommunityIcons
        name={option.icon}
        size={20}
        color={selected ? theme.colors.white : theme.colors.linkGreen}
      />
      <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>
        {option.label}
      </Text>
    </Pressable>
  );
}

export default function GroupBookingRequestScreen() {
  const navigation = useNavigation();
  const { max } = getBookingDateBounds();
  const minGroupVisitDate = useMemo(() => {
    const d = startOfDay(new Date());
    d.setDate(d.getDate() + MIN_GROUP_BOOKING_DAYS_AHEAD);
    return d;
  }, []);

  const [groupType, setGroupType] = useState('school');
  const [organizationName, setOrganizationName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const [selectedDate, setSelectedDate] = useState(() => minGroupVisitDate);
  const [visibleYear, setVisibleYear] = useState(() => new Date().getFullYear());
  const [visibleMonthIndex, setVisibleMonthIndex] = useState(() => new Date().getMonth());

  const [adultsText, setAdultsText] = useState('');
  const [childrenText, setChildrenText] = useState('');
  const [notes, setNotes] = useState('');
  const [document, setDocument] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const adultsCount = Number.parseInt(adultsText, 10);
  const childrenCount = Number.parseInt(childrenText, 10);
  const totalPeople = useMemo(() => {
    const a = Number.isFinite(adultsCount) ? adultsCount : 0;
    const c = Number.isFinite(childrenCount) ? childrenCount : 0;
    return a + c;
  }, [adultsCount, childrenCount]);

  const canGoPrevMonth =
    monthStartTs(visibleYear, visibleMonthIndex) > monthStartTs(minGroupVisitDate.getFullYear(), minGroupVisitDate.getMonth());
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

  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) return;

      const mimeType = asset.mimeType || 'application/octet-stream';
      if (typeof asset.size === 'number' && asset.size > MAX_FILE_BYTES) {
        Alert.alert('File too large', 'Supporting document must be 5 MB or smaller.');
        return;
      }

      setDocument({
        uri: asset.uri,
        name: asset.name || 'supporting-document',
        mimeType,
        size: asset.size ?? 0,
        file: asset.file ?? null,
      });
      if (errors.document) {
        setErrors((prev) => ({ ...prev, document: undefined }));
      }
    } catch (error) {
      Alert.alert('File picker', 'Could not open the file picker. Please try again.');
    }
  }, []);

  const removeDocument = useCallback(() => setDocument(null), []);

  const validateForm = useCallback(() => {
    const nextErrors = {};
    const phoneTrimmed = contactPhone.trim();
    const emailTrimmed = contactEmail.trim();

    if (!organizationName.trim()) nextErrors.organizationName = 'Organization / group name is required.';
    if (!contactName.trim()) nextErrors.contactName = 'Contact person name is required.';
    if (!phoneTrimmed || !/^[+\d][\d\s\-()]{6,19}$/.test(phoneTrimmed)) {
      nextErrors.contactPhone = 'Enter a valid phone number.';
    }
    if (!emailTrimmed || !/^\S+@\S+\.\S+$/.test(emailTrimmed)) {
      nextErrors.contactEmail = 'Enter a valid email address.';
    }
    const selectedTs = selectedDate ? startOfDay(selectedDate).getTime() : null;
    const minTs = minGroupVisitDate.getTime();
    const maxTs = startOfDay(max).getTime();
    if (!selectedDate || !isDateInBookingWindow(selectedDate) || selectedTs < minTs || selectedTs > maxTs) {
      nextErrors.visitDate = `Visit date must be at least ${MIN_GROUP_BOOKING_DAYS_AHEAD} days from today.`;
    }
    if (!Number.isInteger(adultsCount) || adultsCount < 0) {
      nextErrors.adultsCount = 'Adults count must be 0 or more.';
    }
    if (!Number.isInteger(childrenCount) || childrenCount < 0) {
      nextErrors.childrenCount = 'Children count must be 0 or more.';
    }
    if (totalPeople < MIN_GROUP_SIZE) {
      nextErrors.totalPeople = `Minimum group size is ${MIN_GROUP_SIZE}.`;
    }
    return nextErrors;
  }, [
    organizationName,
    contactName,
    contactPhone,
    contactEmail,
    selectedDate,
    minGroupVisitDate,
    max,
    adultsCount,
    childrenCount,
    totalPeople,
    document,
  ]);

  const validateAndSubmit = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const phoneTrimmed = contactPhone.trim();
    const emailTrimmed = contactEmail.trim();

    setSubmitting(true);
    try {
      const response = await submitGroupRequest({
        fields: {
          groupType,
          organizationName: organizationName.trim(),
          contactName: contactName.trim(),
          contactPhone: phoneTrimmed,
          contactEmail: emailTrimmed,
          visitDate: toLocalDateKey(selectedDate),
          totalPeople,
          adultsCount,
          childrenCount,
          notes: notes.trim(),
        },
        document: document
          ? {
            uri: document.uri,
            name: document.name,
            mimeType: document.mimeType,
            file: document.file ?? null,
          }
          : null,
      });

      const groupRequest = response?.data?.groupRequest;
      navigation.replace('GroupRequestSubmitted', {
        requestCode: groupRequest?.requestCode,
        organizationName: groupRequest?.organizationName,
        visitDate: groupRequest?.visitDate,
        totalPeople: groupRequest?.totalPeople,
        contactEmail: groupRequest?.contactEmail,
      });
    } catch (error) {
      const validationMessages = Array.isArray(error?.response?.data?.errors)
        ? error.response.data.errors.map((item) => item?.msg).filter(Boolean)
        : [];
      const message =
        validationMessages.length
          ? validationMessages.join('\n')
          : error?.response?.data?.message ||
        error?.message ||
        'Could not submit the request. Please try again.';
      Alert.alert('Submission failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>Group booking request</Text>
            <Text style={styles.subtitle}>
              For schools, tour groups and other parties of {MIN_GROUP_SIZE} or more.
            </Text>
          </View>

          <View style={styles.noticeCard}>
            <MaterialCommunityIcons
              name="information-outline"
              size={22}
              color={theme.colors.linkGreen}
              style={styles.noticeIcon}
            />
            <View style={styles.noticeTextWrap}>
              <Text style={styles.noticeTitle}>How this works</Text>
              <Text style={styles.noticeBody}>
                Submissions are reviewed by our officers. Once your request is approved, an officer
                will contact you to confirm the visit and arrange payment manually. Payment is not
                collected through the app.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={[styles.sectionTopBar, styles.sectionTopBarOrange]} />
            <Text style={styles.sectionTitle}>Group type</Text>
            <View style={styles.chipRow}>
              {GROUP_TYPE_OPTIONS.map((option) => (
                <GroupTypeChip
                  key={option.value}
                  option={option}
                  selected={groupType === option.value}
                  onPress={() => setGroupType(option.value)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={[styles.sectionTopBar, styles.sectionTopBarYellow]} />
            <Text style={styles.sectionTitle}>Organization & contact</Text>

            <FieldLabel required>Organization / group name</FieldLabel>
            <TextInput
              value={organizationName}
              onChangeText={(value) => {
                setOrganizationName(value);
                if (errors.organizationName) setErrors((prev) => ({ ...prev, organizationName: undefined }));
              }}
              placeholder="e.g. Royal College, Colombo"
              placeholderTextColor="#7A8E80"
              style={[styles.input, errors.organizationName && styles.inputError]}
              maxLength={200}
            />
            {errors.organizationName ? <Text style={styles.errorText}>{errors.organizationName}</Text> : null}

            <FieldLabel required>Contact person name</FieldLabel>
            <TextInput
              value={contactName}
              onChangeText={(value) => {
                setContactName(value);
                if (errors.contactName) setErrors((prev) => ({ ...prev, contactName: undefined }));
              }}
              placeholder="Full name"
              placeholderTextColor="#7A8E80"
              style={[styles.input, errors.contactName && styles.inputError]}
              maxLength={120}
            />
            {errors.contactName ? <Text style={styles.errorText}>{errors.contactName}</Text> : null}

            <View style={styles.row2}>
              <View style={styles.col}>
                <FieldLabel required>Contact phone</FieldLabel>
                <TextInput
                  value={contactPhone}
                  onChangeText={(value) => {
                    setContactPhone(value);
                    if (errors.contactPhone) setErrors((prev) => ({ ...prev, contactPhone: undefined }));
                  }}
                  placeholder="0712345678"
                  placeholderTextColor="#7A8E80"
                  style={[styles.input, errors.contactPhone && styles.inputError]}
                  keyboardType="phone-pad"
                  maxLength={20}
                />
                {errors.contactPhone ? <Text style={styles.errorText}>{errors.contactPhone}</Text> : null}
              </View>
              <View style={styles.col}>
                <FieldLabel required>Contact email</FieldLabel>
                <TextInput
                  value={contactEmail}
                  onChangeText={(value) => {
                    setContactEmail(value);
                    if (errors.contactEmail) setErrors((prev) => ({ ...prev, contactEmail: undefined }));
                  }}
                  placeholder="name@example.com"
                  placeholderTextColor="#7A8E80"
                  style={[styles.input, errors.contactEmail && styles.inputError]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.contactEmail ? <Text style={styles.errorText}>{errors.contactEmail}</Text> : null}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={[styles.sectionTopBar, styles.sectionTopBarOrange]} />
            <Text style={styles.sectionTitle}>Visit date</Text>
            <Text style={styles.sectionHint}>
              Pick the day your group plans to visit (at least {MIN_GROUP_BOOKING_DAYS_AHEAD} days in advance).
            </Text>
            <View style={styles.calendarBlock}>
              <VisitDateCalendar
                visibleYear={visibleYear}
                visibleMonthIndex={visibleMonthIndex}
                onPrevMonth={onPrevMonth}
                onNextMonth={onNextMonth}
                canGoPrevMonth={canGoPrevMonth}
                canGoNextMonth={canGoNextMonth}
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  if (errors.visitDate) setErrors((prev) => ({ ...prev, visitDate: undefined }));
                }}
                minDate={minGroupVisitDate}
                maxDate={max}
                showIntro={false}
              />
            </View>
            {errors.visitDate ? <Text style={styles.errorText}>{errors.visitDate}</Text> : null}
          </View>

          <View style={styles.section}>
            <View style={[styles.sectionTopBar, styles.sectionTopBarYellow]} />
            <Text style={styles.sectionTitle}>Group size</Text>
            <Text style={styles.sectionHint}>
              Minimum {MIN_GROUP_SIZE} people. Adults and children together must equal the total.
            </Text>

            <View style={styles.row2}>
              <View style={styles.col}>
                <FieldLabel required>Adults</FieldLabel>
                <TextInput
                  value={adultsText}
                  onChangeText={(t) => {
                    setAdultsText(t.replace(/[^0-9]/g, ''));
                    if (errors.adultsCount) setErrors((prev) => ({ ...prev, adultsCount: undefined }));
                  }}
                  placeholder="0"
                  placeholderTextColor="#7A8E80"
                  style={[styles.input, errors.adultsCount && styles.inputError]}
                  keyboardType="number-pad"
                  maxLength={4}
                />
                {errors.adultsCount ? <Text style={styles.errorText}>{errors.adultsCount}</Text> : null}
              </View>
              <View style={styles.col}>
                <FieldLabel required>Children</FieldLabel>
                <TextInput
                  value={childrenText}
                  onChangeText={(t) => {
                    setChildrenText(t.replace(/[^0-9]/g, ''));
                    if (errors.childrenCount) setErrors((prev) => ({ ...prev, childrenCount: undefined }));
                  }}
                  placeholder="0"
                  placeholderTextColor="#7A8E80"
                  style={[styles.input, errors.childrenCount && styles.inputError]}
                  keyboardType="number-pad"
                  maxLength={4}
                />
                {errors.childrenCount ? <Text style={styles.errorText}>{errors.childrenCount}</Text> : null}
              </View>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total people</Text>
              <Text
                style={[
                  styles.totalValue,
                  totalPeople >= MIN_GROUP_SIZE ? styles.totalValueOk : styles.totalValueWarn,
                ]}
              >
                {totalPeople}
              </Text>
            </View>
            {errors.totalPeople ? (
              <Text style={styles.warnText}>{errors.totalPeople}</Text>
            ) : totalPeople > 0 && totalPeople < MIN_GROUP_SIZE ? (
              <Text style={styles.warnText}>
                Group bookings need at least {MIN_GROUP_SIZE} people.
              </Text>
            ) : null}
          </View>

          <View style={styles.section}>
            <View style={[styles.sectionTopBar, styles.sectionTopBarOrange]} />
            <Text style={styles.sectionTitle}>Supporting document</Text>
            <Text style={styles.sectionHint}>
              Upload an official letter from your school, agency or organization (PDF, JPG, or PNG;
              up to 5 MB).
            </Text>

            {document ? (
              <View style={styles.fileCard}>
                <MaterialCommunityIcons
                  name={document.mimeType === 'application/pdf' ? 'file-pdf-box' : 'file-image'}
                  size={28}
                  color={theme.colors.linkGreen}
                />
                <View style={styles.fileMeta}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {document.name}
                  </Text>
                  <Text style={styles.fileSize}>
                    {document.mimeType} · {formatBytes(document.size)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    removeDocument();
                    setErrors((prev) => ({ ...prev, document: undefined }));
                  }}
                  hitSlop={10}
                  style={({ pressed }) => [styles.fileRemoveBtn, pressed && styles.fileRemoveBtnPressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Remove document"
                >
                  <MaterialCommunityIcons name="close" size={18} color={theme.colors.error} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={pickDocument}
                style={({ pressed }) => [styles.uploadTile, pressed && styles.uploadTilePressed]}
                accessibilityRole="button"
                accessibilityLabel="Attach supporting document"
              >
                <MaterialCommunityIcons
                  name="cloud-upload-outline"
                  size={32}
                  color={theme.colors.linkGreen}
                />
                <Text style={styles.uploadTileTitle}>Attach official letter</Text>
                <Text style={styles.uploadTileHint}>Tap to choose a PDF or image (max 5 MB)</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.section}>
            <View style={[styles.sectionTopBar, styles.sectionTopBarYellow]} />
            <Text style={styles.sectionTitle}>Additional notes (optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything we should know? Special timings, accessibility needs, etc."
              placeholderTextColor="#7A8E80"
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              maxLength={2000}
              textAlignVertical="top"
            />
          </View>

          <PrimaryButton
            title={submitting ? 'Submitting...' : 'Submit request'}
            onPress={validateAndSubmit}
            disabled={submitting}
            loading={submitting}
            style={styles.cta}
          />

          {submitting ? (
            <View style={styles.submitOverlay} pointerEvents="none">
              <ActivityIndicator color={theme.colors.linkGreen} />
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  inner: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xs,
  },
  header: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EAF4EA',
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  noticeIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  noticeTextWrap: { flex: 1 },
  noticeTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    marginBottom: 4,
  },
  noticeBody: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    lineHeight: theme.fontSize.sm * 1.45,
    opacity: 0.9,
  },
  section: {
    position: 'relative',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    paddingTop: theme.spacing.md + 4,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    shadowColor: '#0D2D1D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  sectionTopBarOrange: { backgroundColor: theme.colors.accentOrange },
  sectionTopBarYellow: { backgroundColor: theme.colors.yellowAlt },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    marginBottom: theme.spacing.xs,
  },
  sectionHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.78,
    marginBottom: theme.spacing.sm,
    lineHeight: theme.fontSize.sm * 1.4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  typeChipSelected: {
    backgroundColor: theme.colors.linkGreen,
    borderColor: theme.colors.linkGreen,
  },
  typeChipPressed: { opacity: 0.85 },
  typeChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    letterSpacing: 0.2,
  },
  typeChipTextSelected: { color: theme.colors.white },
  fieldLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginTop: theme.spacing.sm,
    marginBottom: 6,
  },
  required: { color: theme.colors.error },
  input: {
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 10,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.error,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 96,
    paddingTop: 10,
  },
  row2: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  col: { flex: 1 },
  calendarBlock: { marginTop: theme.spacing.xs },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  totalLabel: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  totalValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
  },
  totalValueOk: { color: theme.colors.accentGreen },
  totalValueWarn: { color: theme.colors.error },
  warnText: {
    marginTop: 6,
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    fontWeight: '600',
  },
  uploadTile: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.sage,
    backgroundColor: theme.colors.backgroundAlt,
    gap: 6,
  },
  uploadTilePressed: { opacity: 0.85 },
  uploadTileTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  uploadTileHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    backgroundColor: theme.colors.backgroundAlt,
  },
  fileMeta: { flex: 1, minWidth: 0 },
  fileName: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  fileSize: {
    marginTop: 2,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.7,
  },
  fileRemoveBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fileRemoveBtnPressed: { opacity: 0.7 },
  cta: {
    marginTop: theme.spacing.sm,
  },
  submitOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});
