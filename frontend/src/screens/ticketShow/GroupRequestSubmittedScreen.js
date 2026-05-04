import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { theme } from '../../constants/theme';

export default function GroupRequestSubmittedScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const requestCode = route.params?.requestCode || 'Pending';
  const organizationName = route.params?.organizationName || '-';
  const visitDate = route.params?.visitDate || '-';
  const totalPeople = route.params?.totalPeople ?? '-';
  const contactEmail = route.params?.contactEmail || '-';

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="check-circle" size={56} color={theme.colors.accentGreen} />
          </View>
          <Text style={styles.title}>Request submitted</Text>
          <Text style={styles.body}>
            Thank you. Your group booking request has been received and is now pending review by
            our officers.
          </Text>

          <View style={styles.codeBlock}>
            <Text style={styles.codeLabel}>Reference code</Text>
            <Text style={styles.codeValue}>{requestCode}</Text>
          </View>

          <View style={styles.metaBlock}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Organization</Text>
              <Text style={styles.metaValue} numberOfLines={2}>
                {organizationName}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Visit date</Text>
              <Text style={styles.metaValue}>{visitDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Total people</Text>
              <Text style={styles.metaValue}>{totalPeople}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Contact email</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {contactEmail}
              </Text>
            </View>
          </View>

          <View style={styles.noticeCard}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={22}
              color={theme.colors.linkGreen}
              style={styles.noticeIcon}
            />
            <Text style={styles.noticeBody}>
              Once your request is approved, an officer will contact you using the details you
              provided to confirm the visit and arrange payment manually. Payment is not collected
              through the app.
            </Text>
          </View>

          <PrimaryButton
            title="View my requests"
            onPress={() => navigation.replace('MyGroupRequests')}
            style={styles.ctaPrimary}
          />
          <PrimaryButton
            title="Back to tickets"
            variant="secondary"
            onPress={() => navigation.navigate('TicketShow')}
            style={styles.ctaSecondary}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    alignItems: 'stretch',
    shadowColor: '#0D2D1D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    textAlign: 'center',
  },
  body: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    textAlign: 'center',
    lineHeight: theme.fontSize.body * 1.45,
    opacity: 0.9,
  },
  codeBlock: {
    marginTop: theme.spacing.md,
    alignSelf: 'stretch',
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.radii.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.linkGreen,
    letterSpacing: 0.6,
  },
  metaBlock: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.radii.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    gap: theme.spacing.sm,
  },
  metaLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
    flexShrink: 0,
  },
  metaValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EAF4EA',
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  noticeIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  noticeBody: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    lineHeight: theme.fontSize.sm * 1.45,
    opacity: 0.9,
  },
  ctaPrimary: {
    marginTop: theme.spacing.lg,
  },
  ctaSecondary: {
    marginTop: theme.spacing.sm,
  },
});
