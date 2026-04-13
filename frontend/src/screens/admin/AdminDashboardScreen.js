import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import TextField from '../../components/ui/TextField';
import { theme } from '../../constants/theme';
import { deleteUser, getUsers, updateUser } from '../../api/admin.api';
import { useAuth } from '../../hooks/useAuth';
import { validateProfileFields } from '../../utils/validation';

export default function AdminDashboardScreen() {
  const { user: me, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [draftFullName, setDraftFullName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [draftPhone, setDraftPhone] = useState('');
  const [draftRole, setDraftRole] = useState('visitor');
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers();
      setUsers(data?.data?.users ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const selectedUser = useMemo(
    () => users.find((u) => String(u._id) === String(selectedId)) ?? null,
    [users, selectedId]
  );

  const startEdit = (u) => {
    setSelectedId(u._id);
    setDraftFullName(u.fullName ?? '');
    setDraftEmail(u.email ?? '');
    setDraftPhone(u.phone ?? '');
    setDraftRole(u.role ?? 'visitor');
    setError('');
  };

  const cancelEdit = () => {
    setSelectedId(null);
    setError('');
  };

  const saveEdit = async () => {
    if (!selectedUser) return;
    const errs = validateProfileFields({ fullName: draftFullName, email: draftEmail, phone: draftPhone });
    const msg = Object.values(errs).filter(Boolean).join(' ');
    if (msg) {
      setError(msg);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = await updateUser(selectedUser._id, {
        fullName: draftFullName.trim(),
        email: draftEmail.trim(),
        phone: draftPhone.trim(),
        role: draftRole,
      });
      const updated = data?.data?.user;
      setUsers((prev) => prev.map((u) => (u._id === updated?._id ? updated : u)));
      setSelectedId(null);
    } catch (e) {
      const details = e?.response?.data?.errors;
      const valMsg = Array.isArray(details) ? details.map((x) => x.msg).join(' ') : '';
      setError(valMsg || e?.response?.data?.message || e?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (u) => {
    Alert.alert('Delete user', `Delete ${u.fullName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUser(u._id);
            setUsers((prev) => prev.filter((x) => x._id !== u._id));
            if (selectedId === u._id) setSelectedId(null);
          } catch (e) {
            Alert.alert('Delete failed', e?.response?.data?.message || e?.message || 'Could not delete user');
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.sub}>Manage visitor and admin accounts.</Text>

      <View style={styles.meCard}>
        <Text style={styles.meTitle}>Signed in as</Text>
        <Text style={styles.meName}>{me?.fullName || 'Admin'}</Text>
        <Text style={styles.meEmail}>{me?.email}</Text>
      </View>

      <PrimaryButton title="Refresh users" onPress={loadUsers} style={styles.refreshBtn} />
      <PrimaryButton title="Log out" variant="secondary" onPress={logout} />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <Text style={styles.loading}>Loading users...</Text> : null}

      {!loading && selectedUser ? (
        <View style={styles.editCard}>
          <Text style={styles.sectionTitle}>Edit User</Text>
          <TextField label="Full name" value={draftFullName} onChangeText={setDraftFullName} autoCapitalize="words" />
          <TextField label="Email" value={draftEmail} onChangeText={setDraftEmail} keyboardType="email-address" />
          <TextField label="Phone" value={draftPhone} onChangeText={setDraftPhone} keyboardType="phone-pad" />
          <Text style={styles.roleLabel}>Role</Text>
          <View style={styles.roleRow}>
            {['visitor', 'admin'].map((r) => (
              <Pressable
                key={r}
                onPress={() => setDraftRole(r)}
                style={[styles.roleChip, draftRole === r ? styles.roleChipActive : null]}
              >
                <Text style={[styles.roleChipText, draftRole === r ? styles.roleChipTextActive : null]}>{r}</Text>
              </Pressable>
            ))}
          </View>
          <PrimaryButton title="Save user" onPress={saveEdit} loading={saving} style={styles.saveBtn} />
          <PrimaryButton title="Cancel" variant="secondary" onPress={cancelEdit} disabled={saving} />
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Users</Text>
      {users.map((u) => (
        <View key={u._id} style={styles.userCard}>
          <View style={styles.userTop}>
            <Text style={styles.userName}>{u.fullName}</Text>
            <Text style={styles.userRole}>{u.role}</Text>
          </View>
          <Text style={styles.userMeta}>{u.email}</Text>
          <Text style={styles.userMeta}>{u.phone}</Text>
          <View style={styles.actions}>
            <Pressable onPress={() => startEdit(u)} style={styles.linkBtn}>
              <Text style={styles.linkText}>Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => confirmDelete(u)}
              style={styles.linkBtn}
              disabled={String(u._id) === String(me?._id)}
            >
              <Text
                style={[styles.linkText, styles.deleteText, String(u._id) === String(me?._id) ? styles.disabled : null]}
              >
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: theme.fontSize.hero, fontWeight: '700', color: theme.colors.primaryText, marginTop: theme.spacing.sm },
  sub: { color: theme.colors.primaryText, opacity: 0.8, marginTop: theme.spacing.sm, marginBottom: theme.spacing.md },
  meCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  meTitle: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.8 },
  meName: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.colors.primaryText, marginTop: 4 },
  meEmail: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, marginTop: 4, opacity: 0.8 },
  refreshBtn: { marginBottom: theme.spacing.sm },
  error: { color: theme.colors.error, marginTop: theme.spacing.sm, marginBottom: theme.spacing.sm },
  loading: { marginTop: theme.spacing.md, color: theme.colors.primaryText, opacity: 0.8 },
  sectionTitle: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  editCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
  },
  roleLabel: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.primaryText, marginBottom: 8 },
  roleRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  roleChip: {
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.white,
  },
  roleChipActive: { backgroundColor: theme.colors.sageButton, borderColor: theme.colors.accentGreen },
  roleChipText: { color: theme.colors.primaryText, fontWeight: '700' },
  roleChipTextActive: { color: theme.colors.primaryText },
  saveBtn: { marginBottom: theme.spacing.sm },
  userCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  userTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.colors.primaryText, flex: 1, marginRight: 8 },
  userRole: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.8, textTransform: 'capitalize' },
  userMeta: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.8, marginTop: 4 },
  actions: { flexDirection: 'row', gap: theme.spacing.lg, marginTop: theme.spacing.sm },
  linkBtn: { paddingVertical: 4 },
  linkText: { fontSize: theme.fontSize.body, color: theme.colors.linkGreen, fontWeight: '700' },
  deleteText: { color: theme.colors.error },
  disabled: { opacity: 0.5 },
});
