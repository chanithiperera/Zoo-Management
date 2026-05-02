import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import PrimaryButton from '../../components/ui/PrimaryButton';
import TextField from '../../components/ui/TextField';
import { theme } from '../../constants/theme';
import { createUser, deleteUser, getUsers, updateUser } from '../../api/admin.api';
import { useAuth } from '../../hooks/useAuth';
import { validatePassword, validateProfileFields, validateRequired } from '../../utils/validation';
import { getAdminDrawerMenuItems, getAdminModuleHeroByRouteName } from './adminNavigation';

export default function UserManagementScreen({ navigation }) {
  const route = useRoute();
  const { user: me, logout } = useAuth();
  const hero = getAdminModuleHeroByRouteName(route.name);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [draftFullName, setDraftFullName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [draftPhone, setDraftPhone] = useState('');
  const [draftRole, setDraftRole] = useState('visitor');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('visitor');
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);

  const selectedUser = useMemo(
    () => users.find((u) => String(u._id) === String(selectedId)) ?? null,
    [users, selectedId]
  );

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const matches = (s) => (s ?? '').toString().toLowerCase().includes(q);
      return (
        matches(u.fullName) ||
        matches(u.email) ||
        matches(u.phone) ||
        matches(u.role) ||
        matches(String(u._id))
      );
    });
  }, [users, searchQuery]);

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

  const resetAddUserForm = () => {
    setNewFullName('');
    setNewEmail('');
    setNewPhone('');
    setNewPassword('');
    setNewRole('visitor');
  };

  const handleCreateUser = async () => {
    const profileErrs = validateProfileFields({ fullName: newFullName, email: newEmail, phone: newPhone });
    const pwErr = validatePassword(newPassword);
    const roleErr = validateRequired(newRole, 'Role');
    const msg = [...Object.values(profileErrs).filter(Boolean), pwErr, roleErr].filter(Boolean).join(' ');
    if (msg) {
      setError(msg);
      return;
    }
    setCreating(true);
    setError('');
    try {
      const data = await createUser({
        fullName: newFullName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
        password: newPassword,
        role: newRole,
      });
      const createdUser = data?.data?.user;
      if (createdUser) {
        setUsers((prev) => [createdUser, ...prev]);
      } else {
        await loadUsers();
      }
      resetAddUserForm();
      setShowAddUserForm(false);
    } catch (e) {
      const details = e?.response?.data?.errors;
      const valMsg = Array.isArray(details) ? details.map((x) => x.msg).join(' ') : '';
      setError(valMsg || e?.response?.data?.message || e?.message || 'Create user failed');
    } finally {
      setCreating(false);
    }
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

  const handleDelete = async (u) => {
    if (!u?._id || deletingId) return;
    setDeletingId(String(u._id));
    setError('');
    try {
      await deleteUser(u._id);
      if (String(me?._id) === String(u._id)) {
        await logout();
        return;
      }
      setUsers((prev) => prev.filter((x) => String(x._id) !== String(u._id)));
      if (String(selectedId) === String(u._id)) setSelectedId(null);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Could not delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const requestDelete = (u) => {
    if (!u?._id || deletingId) return;
    setPendingDeleteUser(u);
  };

  const cancelDelete = () => {
    if (deletingId) return;
    setPendingDeleteUser(null);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteUser) return;
    const target = pendingDeleteUser;
    setPendingDeleteUser(null);
    await handleDelete(target);
  };

  return (
    <>
      <StatusBar style="dark" />
      <AccountDrawerLayout headerTitle="Explore" drawerMenuItems={drawerMenuItems}>
      {hero ? (
        <View style={styles.heroCard} accessibilityRole="header">
          <Text style={styles.title}>{hero.title}</Text>
          <Text style={styles.sub}>{hero.subtitle}</Text>
        </View>
      ) : null}

      <View style={styles.addUserCard}>
        <View style={styles.addUserHeader}>
          <Text style={styles.addUserTitle}>Add New User</Text>
          <Pressable
            onPress={() => {
              if (showAddUserForm) resetAddUserForm();
              setShowAddUserForm((prev) => !prev);
              setError('');
            }}
            style={styles.addUserToggleBtn}
          >
            <Text style={styles.addUserToggleText}>{showAddUserForm ? 'Close' : 'Open'}</Text>
          </Pressable>
        </View>
        {showAddUserForm ? (
          <View style={styles.addUserFormWrap}>
            <TextField label="Full name" value={newFullName} onChangeText={setNewFullName} autoCapitalize="words" />
            <TextField label="Email" value={newEmail} onChangeText={setNewEmail} keyboardType="email-address" />
            <TextField label="Phone" value={newPhone} onChangeText={setNewPhone} keyboardType="phone-pad" maxLength={10} />
            <TextField
              label="Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <Text style={styles.roleLabel}>Role</Text>
            <View style={styles.roleRow}>
              {['visitor', 'admin'].map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setNewRole(r)}
                  style={[styles.roleChip, newRole === r ? styles.roleChipActive : null]}
                >
                  <Text style={[styles.roleChipText, newRole === r ? styles.roleChipTextActive : null]}>{r}</Text>
                </Pressable>
              ))}
            </View>
            <PrimaryButton title="Create user" onPress={handleCreateUser} loading={creating} style={styles.saveBtn} />
          </View>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <Text style={styles.loading}>Loading users...</Text> : null}

      <Text style={styles.sectionTitle}>Users</Text>
      {!loading ? (
        <TextField
          label="Search users"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Name, email, phone, or role"
          autoCapitalize="none"
          autoCorrect={false}
        />
      ) : null}

      {!loading && users.length > 0 && filteredUsers.length === 0 ? (
        <Text style={styles.emptySearch}>No users match your search.</Text>
      ) : null}

      {filteredUsers.map((u) => (
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
              onPress={() => requestDelete(u)}
              style={styles.linkBtn}
              disabled={Boolean(deletingId)}
            >
              <Text style={[styles.linkText, styles.deleteText]}>
                {String(deletingId) === String(u._id) ? 'Deleting...' : 'DELETE'}
              </Text>
            </Pressable>
          </View>
          {String(selectedId) === String(u._id) ? (
            <View style={styles.inlineEditWrap}>
              <Text style={styles.inlineEditTitle}>Edit User</Text>
              <TextField
                label="Full name"
                value={draftFullName}
                onChangeText={setDraftFullName}
                autoCapitalize="words"
              />
              <TextField
                label="Email"
                value={draftEmail}
                onChangeText={setDraftEmail}
                keyboardType="email-address"
              />
              <TextField
                label="Phone"
                value={draftPhone}
                onChangeText={setDraftPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
              <Text style={styles.roleLabel}>Role</Text>
              <View style={styles.roleRow}>
                {['visitor', 'admin'].map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setDraftRole(r)}
                    style={[styles.roleChip, draftRole === r ? styles.roleChipActive : null]}
                  >
                    <Text style={[styles.roleChipText, draftRole === r ? styles.roleChipTextActive : null]}>
                      {r}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <PrimaryButton title="Save user" onPress={saveEdit} loading={saving} style={styles.saveBtn} />
              <PrimaryButton title="Cancel" variant="secondary" onPress={cancelEdit} disabled={saving} />
            </View>
          ) : null}
        </View>
      ))}
      <Modal
        visible={Boolean(pendingDeleteUser)}
        animationType="fade"
        transparent
        onRequestClose={cancelDelete}
      >
        <View style={styles.confirmModalRoot}>
          <Pressable style={styles.confirmModalBackdrop} onPress={cancelDelete} />
          <View style={styles.confirmModalCard}>
            <Text style={styles.confirmTitle}>Delete user?</Text>
            <Text style={styles.confirmText}>
              {`Are you sure you want to delete ${pendingDeleteUser?.fullName || 'this user'}?`}
            </Text>
            <View style={styles.confirmActions}>
              <PrimaryButton title="Cancel" variant="secondary" onPress={cancelDelete} />
              <PrimaryButton title="Delete" onPress={confirmDelete} />
            </View>
          </View>
        </View>
      </Modal>
    </AccountDrawerLayout>
    </>
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
    shadowColor: theme.colors.accentGreen,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    letterSpacing: -0.2,
  },
  sub: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    lineHeight: Math.round(theme.fontSize.sm * 1.45),
    color: theme.colors.accentGreen,
    opacity: 0.92,
  },
  addUserCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  addUserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addUserTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  addUserToggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addUserToggleText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.linkGreen,
    fontWeight: '700',
  },
  addUserFormWrap: {
    marginTop: theme.spacing.sm,
  },
  error: { color: theme.colors.error, marginTop: theme.spacing.sm, marginBottom: theme.spacing.sm },
  loading: { marginTop: theme.spacing.md, color: theme.colors.primaryText, opacity: 0.8 },
  sectionTitle: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  emptySearch: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  inlineEditWrap: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  inlineEditTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.xs,
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
  confirmModalRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  confirmModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  confirmModalCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  confirmTitle: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  confirmText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    opacity: 0.9,
  },
  confirmActions: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
});
