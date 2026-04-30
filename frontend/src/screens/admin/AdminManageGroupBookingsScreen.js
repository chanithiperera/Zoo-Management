import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Alert, Platform } from 'react-native';
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

export default function AdminManageGroupBookingsScreen({ navigation }) {
  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);
  const [statusFilter, setStatusFilter] = useState('');
  const [groupBookings, setGroupBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

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
    try {
      const { blob, contentDisposition } = await downloadAdminGroupBookingDocument(groupRequestId);

      // In web, force browser file download.
      if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
        const objectUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = parseFileName(contentDisposition, fallbackFileName);
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(objectUrl);
        return;
      }

      Alert.alert(
        'Document',
        'Download is supported on web. On mobile, this build currently opens documents externally.'
      );
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to download the submitted document.';
      if (typeof message === 'string' && message.trim()) {
        Alert.alert('Document', message);
        return;
      }
      Alert.alert('Document', 'Unable to download the submitted document.');
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

  return (
    <AccountDrawerLayout headerTitle="Explore" drawerMenuItems={drawerMenuItems}>
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
                <Text style={styles.metaText}>Reference: {request.requestCode || '-'}</Text>
                <Text style={styles.metaText}>Visit date: {request.visitDate || '-'}</Text>
                <Text style={styles.metaText}>People: {request.totalPeople || 0}</Text>
                <Text style={styles.metaText}>Adults: {request.adultsCount ?? 0}</Text>
                <Text style={styles.metaText}>Children: {request.childrenCount ?? 0}</Text>
                <Text style={styles.metaText}>Group type: {request.groupType || '-'}</Text>
                <Text style={styles.metaText}>Contact person: {request.contactName || '-'}</Text>
                <Text style={styles.metaText}>Contact email: {request.contactEmail || user.email || '-'}</Text>
                <Text style={styles.metaText}>Contact phone: {request.contactPhone || user.phone || '-'}</Text>
                <Text style={styles.metaText}>Submitted at: {String(request.createdAt || '-').slice(0, 10)}</Text>
                <Text style={styles.metaText}>Notes: {request.notes ? request.notes : '-'}</Text>
                <Text style={styles.metaText}>Review notes: {request.reviewNotes ? request.reviewNotes : '-'}</Text>
                {request.supportingDocument?.storedPath ? (
                  <Pressable
                    onPress={() => downloadDocument(request._id, request.supportingDocument?.fileName)}
                    style={styles.documentBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Download submitted document"
                  >
                    <Text style={styles.documentBtnText}>
                      Download submitted document ({request.supportingDocument.fileName || 'file'})
                    </Text>
                  </Pressable>
                ) : (
                  <Text style={styles.metaText}>Submitted document: Not attached</Text>
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
