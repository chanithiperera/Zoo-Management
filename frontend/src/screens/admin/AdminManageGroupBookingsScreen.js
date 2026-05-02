import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Alert, Platform, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useFocusEffect } from '@react-navigation/native';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import { getAdminDrawerMenuItems } from './adminNavigation';
import {
  downloadAdminGroupBookingDocument,
  getAdminGroupBookings,
  updateAdminGroupBookingStatus,
} from '../../api/admin.api';
import { theme } from '../../constants/theme';

const STATUS_OPTIONS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'completed', label: 'Completed' },
];

const STATUS_META = {
  pending: {
    label: 'Pending',
    textColor: '#8A5A00',
    borderColor: '#E8C15A',
    backgroundColor: '#FFF4D6',
  },
  approved: {
    label: 'Approved',
    textColor: theme.colors.accentGreen,
    borderColor: '#8BC28F',
    backgroundColor: '#E8F5E9',
  },
  rejected: {
    label: 'Rejected',
    textColor: theme.colors.error,
    borderColor: '#E3A9A9',
    backgroundColor: '#FDECEC',
  },
  completed: {
    label: 'Completed',
    textColor: '#0D47A1',
    borderColor: '#90CAF9',
    backgroundColor: '#E3F2FD',
  },
};

function statusLabel(status) {
  return String(status || '').trim() || 'pending';
}

function parseFileName(contentDisposition, fallbackName) {
  const source = String(contentDisposition || '');
  const utf8 = source.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8?.[1]) return decodeURIComponent(utf8[1]);
  const plain = source.match(/filename="?([^"]+)"?/i);
  if (plain?.[1]) return plain[1];
  return fallbackName || 'group-booking-document';
}

function decodeDisplayFileName(name) {
  const s = String(name || 'file').trim();
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function sanitizeFileName(name) {
  return String(name || 'document')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180) || 'document';
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const end = Math.min(i + chunkSize, bytes.length);
    const chunk = bytes.subarray(i, end);
    binary += String.fromCharCode.apply(null, chunk);
  }
  if (typeof btoa === 'undefined') {
    throw new Error('Base64 encoding is not available');
  }
  return btoa(binary);
}

function MetaRow({ label, value, onPress }) {
  const normalized = value ?? '-';
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaText}>
        <Text style={styles.metaKey}>{label}: </Text>
        {onPress ? (
          <Text style={styles.metaLink} onPress={onPress}>
            {normalized}
          </Text>
        ) : (
          <Text style={styles.metaValue}>{normalized}</Text>
        )}
      </Text>
    </View>
  );
}

export default function AdminManageGroupBookingsScreen({ navigation }) {
  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);
  const [statusFilter, setStatusFilter] = useState('');
  const [groupBookings, setGroupBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [downloadingDocId, setDownloadingDocId] = useState('');

  const loadGroupBookings = useCallback(async (status) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminGroupBookings(status);
      setGroupBookings(res?.data?.groupBookings ?? []);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Unable to load group bookings right now.');
      setGroupBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroupBookings(statusFilter);
    }, [loadGroupBookings, statusFilter])
  );

  const onPressFilter = useCallback(
    (nextStatus) => {
      setStatusFilter(nextStatus);
      loadGroupBookings(nextStatus);
    },
    [loadGroupBookings]
  );

  const downloadDocument = useCallback(async (groupRequestId, fallbackFileName) => {
    if (!groupRequestId) return;
    setDownloadingDocId(groupRequestId);
    try {
      const { arrayBuffer: rawBuffer, blob, contentDisposition, contentType } =
        await downloadAdminGroupBookingDocument(groupRequestId);
      let arrayBuffer = rawBuffer;
      if (arrayBuffer && ArrayBuffer.isView(arrayBuffer)) {
        const view = arrayBuffer;
        arrayBuffer = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
      }
      const parsedName = parseFileName(contentDisposition, fallbackFileName);
      const fileName = sanitizeFileName(parsedName);

      if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
        const b =
          blob ||
          new Blob([arrayBuffer], { type: contentType || 'application/octet-stream' });
        const objectUrl = window.URL.createObjectURL(b);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(objectUrl);
        return;
      }

      if (!arrayBuffer || !(arrayBuffer instanceof ArrayBuffer) || arrayBuffer.byteLength === 0) {
        Alert.alert('Document', 'The server returned an empty file.');
        return;
      }

      const baseDir = FileSystem.cacheDirectory;
      if (!baseDir) {
        Alert.alert('Document', 'File storage is not available on this device.');
        return;
      }

      const uniqueName = `${Date.now()}-${fileName}`;
      const dest = `${baseDir}${uniqueName}`;
      const base64 = arrayBufferToBase64(arrayBuffer);
      await FileSystem.writeAsStringAsync(dest, base64, { encoding: FileSystem.EncodingType.Base64 });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert(
          'Document',
          'Sharing is not available on this device. The file was prepared but could not be opened in another app.'
        );
        return;
      }

      const mimeType = String(contentType || 'application/octet-stream').split(';')[0].trim();
      await Sharing.shareAsync(dest, { mimeType, dialogTitle: decodeDisplayFileName(fileName) });
    } catch (error) {
      const message =
        (typeof error?.message === 'string' && error.message.trim()) ||
        (typeof error?.response?.data?.message === 'string' && error.response.data.message.trim()) ||
        'Unable to download the submitted document.';
      Alert.alert('Document', message);
    } finally {
      setDownloadingDocId('');
    }
  }, []);

  const updateStatus = useCallback(
    async (groupRequestId, nextStatus) => {
      setUpdatingId(groupRequestId);
      try {
        await updateAdminGroupBookingStatus(groupRequestId, { status: nextStatus });
        setGroupBookings((prev) =>
          prev.map((item) => (item._id === groupRequestId ? { ...item, status: nextStatus } : item))
        );
      } catch (updateError) {
        const message =
          updateError?.response?.data?.message || 'Unable to update booking status right now.';
        Alert.alert('Status update', message);
      } finally {
        setUpdatingId('');
      }
    },
    []
  );

  const openExternal = useCallback(async (url) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Contact', 'Unable to open this contact link right now.');
    }
  }, []);

  return (
    <AccountDrawerLayout headerTitle="Explore" drawerMenuItems={drawerMenuItems}>
      <Pressable
        onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('AdminEntryTicketsShowBooking'))}
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backBtnText}>← Back</Text>
      </Pressable>
      <View style={styles.heroCard} accessibilityRole="header">
        <Text style={styles.title}>Manage Group Bookings</Text>
        <Text style={styles.sub}>View user-submitted group booking requests and their statuses.</Text>
      </View>

      <View style={styles.filterRow}>
        {STATUS_OPTIONS.map((option) => {
          const selected = statusFilter === option.key;
          return (
            <Pressable
              key={option.label}
              onPress={() => onPressFilter(option.key)}
              style={[styles.filterChip, selected && styles.filterChipSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Filter ${option.label}`}
            >
              <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={theme.colors.accentGreen} />
          <Text style={styles.loadingText}>Loading group bookings...</Text>
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : groupBookings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No group bookings found</Text>
          <Text style={styles.emptySub}>Try a different status filter.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {groupBookings.map((request) => {
            const user = request.userId || {};
            const statusKey = statusLabel(request.status);
            const statusMeta = STATUS_META[statusKey] || STATUS_META.pending;
            return (
              <View key={request._id} style={styles.requestCard}>
                <View style={styles.cardTop}>
                  <Text style={styles.requestOrg}>{request.organizationName || '-'}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        borderColor: statusMeta.borderColor,
                        backgroundColor: statusMeta.backgroundColor,
                      },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: statusMeta.textColor }]}>
                      {statusMeta.label}
                    </Text>
                  </View>
                </View>
                <MetaRow label="Reference" value={request.requestCode || '-'} />
                <MetaRow label="Visit date" value={request.visitDate || '-'} />
                <MetaRow label="People" value={request.totalPeople || 0} />
                <MetaRow label="Adults" value={request.adultsCount ?? 0} />
                <MetaRow label="Children" value={request.childrenCount ?? 0} />
                <MetaRow label="Group type" value={request.groupType || '-'} />
                <MetaRow label="Contact person" value={request.contactName || '-'} />
                <MetaRow
                  label="Contact email"
                  value={request.contactEmail || user.email || '-'}
                  onPress={
                    request.contactEmail || user.email
                      ? () => openExternal(`mailto:${request.contactEmail || user.email}`)
                      : undefined
                  }
                />
                <MetaRow
                  label="Contact phone"
                  value={request.contactPhone || user.phone || '-'}
                  onPress={
                    request.contactPhone || user.phone
                      ? () => openExternal(`tel:${request.contactPhone || user.phone}`)
                      : undefined
                  }
                />
                <MetaRow label="Submitted at" value={String(request.createdAt || '-').slice(0, 10)} />
                <MetaRow label="Notes" value={request.notes ? request.notes : '-'} />
                <MetaRow label="Review notes" value={request.reviewNotes ? request.reviewNotes : '-'} />
                {request.supportingDocument?.storedPath ? (
                  <Pressable
                    onPress={() => downloadDocument(request._id, request.supportingDocument?.fileName)}
                    style={[styles.documentBtn, downloadingDocId === request._id && styles.documentBtnDisabled]}
                    accessibilityRole="button"
                    accessibilityLabel="Download submitted document"
                    disabled={downloadingDocId === request._id}
                  >
                    {downloadingDocId === request._id ? (
                      <ActivityIndicator size="small" color={theme.colors.linkGreen} />
                    ) : (
                      <Text style={styles.documentBtnText}>
                        Download submitted document (
                        {decodeDisplayFileName(request.supportingDocument.fileName) || 'file'})
                      </Text>
                    )}
                  </Pressable>
                ) : (
                  <MetaRow label="Submitted document" value="Not attached" />
                )}
                <View style={styles.statusActionsRow}>
                  <Pressable
                    onPress={() => updateStatus(request._id, 'approved')}
                    style={[
                      styles.statusActionBtn,
                      request.status === 'approved' && styles.statusActionBtnSelected,
                    ]}
                    disabled={updatingId === request._id}
                    accessibilityRole="button"
                    accessibilityLabel="Mark as approved"
                  >
                    <Text style={styles.statusActionText}>Approve</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => updateStatus(request._id, 'rejected')}
                    style={[
                      styles.statusActionBtn,
                      request.status === 'rejected' && styles.statusActionBtnSelected,
                    ]}
                    disabled={updatingId === request._id}
                    accessibilityRole="button"
                    accessibilityLabel="Mark as rejected"
                  >
                    <Text style={styles.statusActionText}>Reject</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => updateStatus(request._id, 'completed')}
                    style={[
                      styles.statusActionBtn,
                      request.status === 'completed' && styles.statusActionBtnSelected,
                    ]}
                    disabled={updatingId === request._id}
                    accessibilityRole="button"
                    accessibilityLabel="Mark as completed"
                  >
                    <Text style={styles.statusActionText}>Complete</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  backBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  heroCard: {
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accentGreen,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  sub: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.accentGreen,
    lineHeight: Math.round(theme.fontSize.sm * 1.45),
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.white,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.linkGreen,
    borderColor: theme.colors.linkGreen,
  },
  filterChipText: {
    color: theme.colors.primaryText,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  filterChipTextSelected: {
    color: theme.colors.white,
  },
  centered: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.8,
  },
  error: {
    fontSize: theme.fontSize.body,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  emptyCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  emptySub: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
  },
  list: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  requestCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  requestOrg: {
    flex: 1,
    paddingRight: theme.spacing.sm,
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  statusBadge: {
    borderRadius: theme.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.sageButton,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.linkGreen,
    textTransform: 'capitalize',
  },
  metaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.9,
    marginTop: 2,
  },
  metaRow: {
    marginTop: 2,
  },
  metaKey: {
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  metaValue: {
    fontWeight: '400',
    color: theme.colors.primaryText,
  },
  metaLink: {
    fontWeight: '600',
    color: theme.colors.linkGreen,
    textDecorationLine: 'underline',
  },
  documentBtn: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.accentGreen,
    backgroundColor: theme.colors.backgroundAlt,
  },
  documentBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  documentBtnDisabled: {
    opacity: 0.65,
  },
  statusActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  statusActionBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.white,
  },
  statusActionBtnSelected: {
    borderColor: theme.colors.accentGreen,
    backgroundColor: theme.colors.backgroundAlt,
  },
  statusActionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
});
