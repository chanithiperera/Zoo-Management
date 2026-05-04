import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { buildUserDrawerMenuItems } from '../profile/userDrawerMenu';
import { getMyGroupRequests } from '../../api/groupBookingRequest.api';
import { theme } from '../../constants/theme';

const STATUS_META = {
  pending: {
    label: 'Pending review',
    color: '#8A5A00',
    icon: 'clock-outline',
    borderColor: '#E8C15A',
    backgroundColor: '#FFF4D6',
  },
  approved: {
    label: 'Approved',
    color: theme.colors.accentGreen,
    icon: 'check-circle-outline',
    borderColor: '#8BC28F',
    backgroundColor: '#E8F5E9',
  },
  rejected: {
    label: 'Rejected',
    color: theme.colors.error,
    icon: 'close-circle-outline',
    borderColor: '#E3A9A9',
    backgroundColor: '#FDECEC',
  },
  completed: {
    label: 'Completed',
    color: '#0D47A1',
    icon: 'flag-checkered',
    borderColor: '#90CAF9',
    backgroundColor: '#E3F2FD',
  },
};

const GROUP_TYPE_LABELS = {
  school: 'School',
  tourist: 'Tourist group',
  other: 'Other',
};

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <View style={[styles.pill, { borderColor: meta.borderColor, backgroundColor: meta.backgroundColor }]}>
      <MaterialCommunityIcons name={meta.icon} size={14} color={meta.color} />
      <Text style={[styles.pillText, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

export default function MyGroupRequestsScreen({ navigation }) {
  const drawerMenuItems = useMemo(() => buildUserDrawerMenuItems(navigation), [navigation]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasLoadedOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (!hasLoadedOnce.current) setLoading(true);
      (async () => {
        try {
          const data = await getMyGroupRequests();
          if (cancelled) return;
          setRequests(data?.data?.groupRequests ?? []);
          setError(null);
          hasLoadedOnce.current = true;
        } catch {
          if (!cancelled) setError('Unable to load your group requests. Please try again.');
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  return (
    <AccountDrawerLayout headerTitle="My Group Requests" drawerMenuItems={drawerMenuItems}>
      <Pressable
        onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('TicketShow'))}
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backBtnText}>← Back</Text>
      </Pressable>
      <View style={styles.intro}>
        <Text style={styles.introTitle}>Group booking requests</Text>
        <Text style={styles.introBody}>
          Track the status of your group bookings. Once approved, an officer will contact you to
          confirm payment manually.
        </Text>
      </View>

      {loading && !hasLoadedOnce.current ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.accentGreen} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : requests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No requests yet</Text>
          <Text style={styles.emptyBody}>
            Submit a group booking request for parties of 20 or more and it will appear here.
          </Text>
          <PrimaryButton
            title="New group request"
            onPress={() => navigation.navigate('GroupBookingRequest')}
          />
        </View>
      ) : (
        <View style={styles.list}>
          {requests.map((request) => (
            <Pressable
              key={request._id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              accessibilityRole="button"
              accessibilityLabel={`Group request for ${request.organizationName}, status ${request.status}`}
              onPress={() => {}}
            >
              <View style={styles.cardTop}>
                <Text style={styles.orgName} numberOfLines={2}>
                  {request.organizationName}
                </Text>
                <StatusPill status={request.status} />
              </View>
              <Text style={styles.codeLine}>Reference {request.requestCode}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={16}
                    color={theme.colors.linkGreen}
                  />
                  <Text style={styles.metaText}>{request.visitDate}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={16}
                    color={theme.colors.linkGreen}
                  />
                  <Text style={styles.metaText}>{request.totalPeople} people</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="tag-outline"
                    size={16}
                    color={theme.colors.linkGreen}
                  />
                  <Text style={styles.metaText}>
                    {GROUP_TYPE_LABELS[request.groupType] || request.groupType}
                  </Text>
                </View>
              </View>
              {request.status === 'rejected' && request.reviewNotes ? (
                <Text style={styles.reviewNote}>Officer note: {request.reviewNotes}</Text>
              ) : null}
            </Pressable>
          ))}

          <PrimaryButton
            title="New group request"
            onPress={() => navigation.navigate('GroupBookingRequest')}
            style={styles.newRequestBtn}
          />
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
  intro: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  introTitle: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  introBody: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
    lineHeight: theme.fontSize.sm * 1.4,
  },
  centered: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  error: {
    fontSize: theme.fontSize.body,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  empty: {
    paddingVertical: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.xs,
  },
  emptyBody: {
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    opacity: 0.75,
    marginBottom: theme.spacing.lg,
    lineHeight: theme.fontSize.body * 1.35,
  },
  list: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
    backgroundColor: theme.colors.backgroundAlt,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  orgName: {
    flex: 1,
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  codeLine: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
    marginBottom: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primaryText,
  },
  reviewNote: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    fontStyle: 'italic',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1.5,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  newRequestBtn: {
    marginTop: theme.spacing.md,
  },
});
