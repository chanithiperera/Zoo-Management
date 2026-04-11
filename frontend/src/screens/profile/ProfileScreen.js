import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import ModuleCard from '../../components/ui/ModuleCard';
import { FEATURE_MODULES } from '../../constants/modules';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../constants/theme';

function avatarLetter(fullName) {
  const c = fullName?.trim()?.[0];
  return c ? c.toUpperCase() : '?';
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const firstName = useMemo(() => {
    const parts = user?.fullName?.trim().split(/\s+/).filter(Boolean);
    return parts?.[0] || 'there';
  }, [user?.fullName]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter(user?.fullName)}</Text>
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroGreet}>Signed in as</Text>
            <Text style={styles.heroName} numberOfLines={1}>
              {user?.fullName || 'Visitor'}
            </Text>
            {user?.email ? (
              <Text style={styles.heroEmail} numberOfLines={1}>
                {user.email}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.card}>
        <Row label="Name" value={user?.fullName} />
        <Row label="Email" value={user?.email} />
        <Row label="Phone" value={user?.phone} />
        <Row label="Role" value={user?.role} />
      </View>

      <Text style={styles.sectionTitle}>{firstName}, choose a module</Text>
      <Text style={styles.sectionSub}>
        Pick where you want to work next. Full workflows will roll out in later phases.
      </Text>

      <View>
        {FEATURE_MODULES.map((m) => (
          <View key={m.route} style={styles.moduleRow}>
            <ModuleCard
              title={m.title}
              description={m.description}
              emoji={m.emoji}
              onPress={() => navigation.navigate(m.route)}
            />
          </View>
        ))}
      </View>

      <PrimaryButton title="Log out" variant="secondary" onPress={handleLogout} style={styles.btn} />
    </ScreenContainer>
  );
}

function Row({ label, value }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value ?? '—'}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { marginBottom: theme.spacing.md },
  label: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.primaryText },
  value: { marginTop: 4, fontSize: theme.fontSize.body, color: theme.colors.black },
});

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 22,
    fontWeight: '700',
  },
  heroText: {
    flex: 1,
    marginLeft: theme.spacing.md,
    minWidth: 0,
  },
  heroGreet: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
  },
  heroName: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginTop: 2,
  },
  heroEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.6,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.xs,
  },
  sectionSub: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
    marginBottom: theme.spacing.md,
  },
  moduleRow: {
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  btn: { marginTop: theme.spacing.md, marginBottom: theme.spacing.sm },
});
