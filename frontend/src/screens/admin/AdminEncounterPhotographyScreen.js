import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import AdminModuleHero from '../../components/admin/AdminModuleHero';
import PrimaryButton from '../../components/ui/PrimaryButton';
import TextField from '../../components/ui/TextField';
import { theme } from '../../constants/theme';
import { getEncounters, createEncounter, updateEncounter, deleteEncounter } from '../../api/encounters.api';
import { fetchEncounterAnimals } from '../../api/encounterAnimals.api';
import { getAdminDrawerMenuItems, getAdminModuleHeroByRouteName } from './adminNavigation';

const BLANK = { title: '', animalName: '', animal: '', description: '', duration: '', maxParticipants: '', price: '', photographyIncluded: false, isActive: true };

function ChipRow({ options, selected, onSelect }) {
  return (
    <View style={styles.chipRow}>
      {options.map((o) => (
        <Pressable key={String(o)} onPress={() => onSelect(o)} style={[styles.chip, selected === o && styles.chipActive]}>
          <Text style={[styles.chipText, selected === o && styles.chipTextActive]}>{String(o)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function AdminEncounterPhotographyScreen({ navigation }) {
  const route = useRoute();
  const hero = getAdminModuleHeroByRouteName(route.name);
  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);

  const [items, setItems] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [enc, ani] = await Promise.all([getEncounters(), fetchEncounterAnimals()]);
      setItems(enc.data || []);
      setAnimals(ani.data || []);
    } catch { setError('Failed to load encounters.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter(i => i.title.toLowerCase().includes(q)) : items;
  }, [items, search]);

  const setF = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const openNew = () => { setEditing(null); setDraft(BLANK); setFormError(''); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setDraft({
      title: item.title || '', animalName: item.animalName || item.animal?.name || '',
      animal: item.animal?._id || item.animal || '',
      description: item.description || '', duration: String(item.duration ?? ''),
      maxParticipants: String(item.maxParticipants ?? ''), price: String(item.price ?? ''),
      photographyIncluded: item.photographyIncluded ?? false, isActive: item.isActive ?? true,
    });
    setFormError(''); setShowModal(true);
  };

  const handleSave = async () => {
    if (!draft.title.trim() || !draft.description.trim() || !draft.duration || !draft.maxParticipants || !draft.price) {
      setFormError('Title, description, duration, max participants and price are required.'); return;
    }
    setSaving(true); setFormError('');
    const payload = {
      ...draft,
      duration: parseInt(draft.duration),
      maxParticipants: parseInt(draft.maxParticipants),
      price: parseFloat(draft.price),
      animal: draft.animal || undefined,
    };
    try {
      if (editing) { await updateEncounter(editing._id, payload); }
      else { await createEncounter(payload); }
      setShowModal(false); load();
    } catch (e) { setFormError(e?.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Encounter', `Delete "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteEncounter(item._id); setItems(p => p.filter(x => x._id !== item._id)); }
        catch { setError('Failed to delete.'); }
      }},
    ]);
  };

  return (
    <AccountDrawerLayout
      headerTitle={hero?.title ?? 'Admin'}
      headerTitleNumberOfLines={2}
      drawerMenuItems={drawerMenuItems}
    >
      <StatusBar style="dark" />
      {hero ? <AdminModuleHero title={hero.title} subtitle={hero.subtitle} /> : null}
      <PrimaryButton title="+ Add Encounter" onPress={openNew} style={styles.addBtn} />
      <TextField label="Search" value={search} onChangeText={setSearch} placeholder="Title…" />
      {error ? <Text style={styles.err}>{error}</Text> : null}
      {loading ? <Text style={styles.hint}>Loading…</Text> : null}
      {filtered.map((item) => (
        <View key={item._id} style={styles.card}>
          <View style={styles.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.title}</Text>
              {(item.animalName || item.animal?.name) && (
                <Text style={styles.cardMeta}>Animal: {item.animalName || item.animal?.name}</Text>
              )}
              <Text style={styles.cardMeta}>
                {item.duration} min · Max {item.maxParticipants} · LKR {item.price}
              </Text>
              {item.photographyIncluded ? <Text style={styles.cardMeta}>Photography included</Text> : null}
            </View>
            <View style={[styles.statusBadge, !item.isActive && styles.statusBadgeOff]}>
              <Text style={[styles.statusText, !item.isActive && styles.statusTextOff]}>{item.isActive ? 'Active' : 'Off'}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={() => openEdit(item)} style={styles.actBtn}>
              <Text style={styles.actEdit}>Edit</Text>
            </Pressable>
            <Pressable onPress={() => handleDelete(item)} style={styles.actBtn}>
              <Text style={styles.actDel}>Delete</Text>
            </Pressable>
          </View>
        </View>
      ))}
      {!loading && filtered.length === 0 && <Text style={styles.hint}>No encounters found.</Text>}

      <Modal visible={showModal} animationType="slide">
        <ScrollView contentContainerStyle={styles.modal} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>{editing ? 'Edit Encounter' : 'Add Encounter'}</Text>
          {formError ? <Text style={styles.err}>{formError}</Text> : null}
          <TextField label="Title *" value={draft.title} onChangeText={(v) => setF('title', v)} />
          <TextField label="Description *" value={draft.description} onChangeText={(v) => setF('description', v)} multiline />

          <Text style={styles.fieldLabel}>Linked Animal (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={styles.chipRow}>
              <Pressable onPress={() => { setF('animal', ''); setF('animalName', ''); }} style={[styles.chip, !draft.animal && styles.chipActive]}>
                <Text style={[styles.chipText, !draft.animal && styles.chipTextActive]}>None</Text>
              </Pressable>
              {animals.map((a) => (
                <Pressable key={a._id} onPress={() => { setF('animal', a._id); setF('animalName', a.name); }}
                  style={[styles.chip, draft.animal === a._id && styles.chipActive]}>
                  <Text style={[styles.chipText, draft.animal === a._id && styles.chipTextActive]}>{a.name}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <TextField label="Duration (minutes) *" value={draft.duration} onChangeText={(v) => setF('duration', v)} keyboardType="numeric" />
          <TextField label="Max Participants *" value={draft.maxParticipants} onChangeText={(v) => setF('maxParticipants', v)} keyboardType="numeric" />
          <TextField label="Price (LKR) *" value={draft.price} onChangeText={(v) => setF('price', v)} keyboardType="numeric" />
          <Text style={styles.fieldLabel}>Photography Included</Text>
          <ChipRow options={['yes', 'no']} selected={draft.photographyIncluded ? 'yes' : 'no'} onSelect={(v) => setF('photographyIncluded', v === 'yes')} />
          <Text style={styles.fieldLabel}>Status</Text>
          <ChipRow options={['active', 'inactive']} selected={draft.isActive ? 'active' : 'inactive'} onSelect={(v) => setF('isActive', v === 'active')} />
          <PrimaryButton title={saving ? 'Saving…' : editing ? 'Update' : 'Create'} onPress={handleSave} loading={saving} style={styles.saveBtn} />
          <PrimaryButton
            title="Cancel"
            variant="secondary"
            textColor={theme.colors.error}
            onPress={() => setShowModal(false)}
            style={styles.modalCancelBtn}
          />
        </ScrollView>
      </Modal>
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  addBtn: { marginBottom: theme.spacing.sm },
  err: { color: theme.colors.error || '#d9534f', marginVertical: 8, fontSize: theme.fontSize.sm },
  hint: { color: theme.colors.primaryText, opacity: 0.6, marginVertical: 8, fontSize: theme.fontSize.sm, fontStyle: 'italic' },
  card: { backgroundColor: theme.colors.white, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border, borderLeftWidth: 4, borderLeftColor: theme.colors.accentGreen, padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  cardName: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.colors.primaryText },
  cardMeta: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.7, marginTop: 2 },
  statusBadge: { backgroundColor: theme.colors.sageButton, borderRadius: theme.radii.pill, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 8, borderWidth: 1, borderColor: theme.colors.sage },
  statusBadgeOff: { backgroundColor: theme.colors.yellowAlt + '33', borderColor: theme.colors.yellow },
  statusText: { fontSize: 11, fontWeight: '700', color: theme.colors.linkGreen },
  statusTextOff: { color: theme.colors.primaryText, opacity: 0.65 },
  actions: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border },
  actBtn: { paddingVertical: 4 },
  actEdit: { color: theme.colors.linkGreen, fontWeight: '700', fontSize: theme.fontSize.sm },
  actDel: { color: theme.colors.error, fontWeight: '700', fontSize: theme.fontSize.sm },
  modal: { padding: theme.spacing.lg, paddingBottom: 60 },
  modalTitle: { fontSize: theme.fontSize.hero, fontWeight: '800', color: theme.colors.primaryText, marginBottom: theme.spacing.md },
  fieldLabel: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.primaryText, marginBottom: 6, marginTop: theme.spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: theme.spacing.sm },
  chip: { borderRadius: theme.radii.pill, borderWidth: 1, borderColor: theme.colors.border, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: theme.colors.white },
  chipActive: { backgroundColor: theme.colors.sageButton || '#e8f5e9', borderColor: theme.colors.accentGreen },
  chipText: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.primaryText },
  chipTextActive: { color: theme.colors.linkGreen },
  saveBtn: { marginBottom: theme.spacing.sm },
  modalCancelBtn: {
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
});
