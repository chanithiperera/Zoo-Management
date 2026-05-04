import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import { theme } from '../../constants/theme';
import { formatLkr } from '../../constants/entryTickets';
import { getAdminDrawerMenuItems } from './adminNavigation';
import {
  getAdminTicketCatalog,
  updateEntryTicket,
  updateShowTicket,
  createShowTicket,
  deleteTicketCatalogItem,
  uploadShowPosterImage,
} from '../../api/admin.api';
import { resolveUploadsFileUri } from '../../api/getApiBaseUrl';

const DEFAULT_SHOW_IMAGE_PATHS = {
  birds_of_prey: 'assets/images/show-birds-of-prey.png',
  elephant_care_bath: 'assets/images/show-elephant-care-bath.png',
  sea_lion_splash: 'assets/images/show-sea-lion-splash.png',
  reptile_encounter: 'assets/images/show-reptile-encounter.png',
};

const BUNDLE_IMAGE_BY_PATH = {
  'assets/images/show-birds-of-prey.png': require('../../../assets/images/show-birds-of-prey.png'),
  'assets/images/show-elephant-care-bath.png': require('../../../assets/images/show-elephant-care-bath.png'),
  'assets/images/show-sea-lion-splash.png': require('../../../assets/images/show-sea-lion-splash.png'),
  'assets/images/show-reptile-encounter.png': require('../../../assets/images/show-reptile-encounter.png'),
};

function posterPreviewSource(url) {
  const t = String(url || '').trim();
  if (!t) return null;
  if (t.startsWith('file://')) return { uri: t };
  const bundle = BUNDLE_IMAGE_BY_PATH[t];
  if (bundle) return bundle;
  const remote = resolveUploadsFileUri(t);
  return remote ? { uri: remote } : null;
}

function ShowPosterField({ value, onChangeText, onPickFromGallery, uploading, disabled }) {
  const src = posterPreviewSource(value);
  return (
    <View style={styles.posterField}>
      <View style={styles.posterRow}>
        {src ? (
          <Image
            source={src}
            style={styles.posterThumb}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={[styles.posterThumb, styles.posterThumbPlaceholder]}>
            <MaterialCommunityIcons name="image-area" size={28} color="rgba(13, 45, 29, 0.35)" />
          </View>
        )}
        <Pressable
          onPress={onPickFromGallery}
          disabled={disabled || uploading}
          style={[styles.posterPickBtn, (disabled || uploading) && styles.posterPickBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Choose show poster from gallery"
        >
          {uploading ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <Text style={styles.posterPickBtnText}>Choose from gallery</Text>
          )}
        </Pressable>
      </View>
      <TextInput
        style={styles.inputImageUrl}
        value={value}
        onChangeText={onChangeText}
        placeholder="Optional: URL or server path"
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor="rgba(13, 45, 29, 0.45)"
        editable={!disabled}
      />
    </View>
  );
}

function Section({ title, children, headerAction }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {headerAction}
      </View>
      <View style={styles.rowsPanel}>{children}</View>
    </View>
  );
}

function TicketRow({
  ticket,
  isLast,
  isEditing,
  draftName,
  draftPrice,
  onEdit,
  onCancel,
  onChangeName,
  onChangePrice,
  onSave,
  onDelete,
}) {
  return (
    <View style={[styles.ticketRow, !isLast && styles.rowDivider]}>
      {isEditing ? (
        <>
          <TextInput
            style={styles.inputName}
            value={draftName}
            onChangeText={onChangeName}
            placeholder="Ticket name"
            placeholderTextColor="rgba(13, 45, 29, 0.45)"
          />
          <View style={styles.editActionsRow}>
            <TextInput
              style={[styles.inputPrice, styles.inputPriceCompact]}
              value={draftPrice}
              onChangeText={onChangePrice}
              keyboardType="numeric"
              placeholder="Price (LKR)"
              placeholderTextColor="rgba(13, 45, 29, 0.45)"
            />
            <Pressable onPress={onSave} style={styles.actionBtn} accessibilityRole="button">
              <Text style={styles.actionBtnText}>Save</Text>
            </Pressable>
            <Pressable onPress={onCancel} style={styles.actionBtnMuted} accessibilityRole="button">
              <Text style={styles.actionBtnMutedText}>Cancel</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.ticketReadRow}>
          <View style={styles.showMain}>
            <Text style={styles.rowLabel}>{ticket.name}</Text>
          </View>
          <Text style={styles.rowValue}>{formatLkr(ticket.priceLkr)}</Text>
          <View style={styles.rowActions}>
            <Pressable onPress={onEdit} style={styles.editBtn} accessibilityRole="button">
              <Text style={styles.editBtnText}>Edit</Text>
            </Pressable>
            <Pressable onPress={onDelete} style={styles.deleteBtn} accessibilityRole="button">
              <Text style={styles.deleteBtnText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function ShowRow({
  show,
  isLast,
  isEditing,
  draftName,
  draftTime,
  draftPrice,
  draftImageUrl,
  draftDailyCapacity,
  onEdit,
  onCancel,
  onChangeName,
  onChangeTime,
  onChangePrice,
  onChangeImageUrl,
  onChangeDailyCapacity,
  onPickPoster,
  posterUploading,
  saving,
  onSave,
  onDelete,
}) {
  return (
    <View style={[styles.ticketRow, !isLast && styles.rowDivider]}>
      {isEditing ? (
        <>
          <TextInput
            style={styles.inputName}
            value={draftName}
            onChangeText={onChangeName}
            placeholder="Show name"
            placeholderTextColor="rgba(13, 45, 29, 0.45)"
          />
          <View style={styles.editFieldsWrap}>
            <TextInput
              style={styles.inputTime}
              value={draftTime}
              onChangeText={onChangeTime}
              placeholder="Show time (e.g. 10:00 AM)"
              placeholderTextColor="rgba(13, 45, 29, 0.45)"
            />
            <TextInput
              style={styles.inputPrice}
              value={draftPrice}
              onChangeText={onChangePrice}
              keyboardType="numeric"
              placeholder="Price (LKR)"
              placeholderTextColor="rgba(13, 45, 29, 0.45)"
            />
            <ShowPosterField
              value={draftImageUrl}
              onChangeText={onChangeImageUrl}
              onPickFromGallery={onPickPoster}
              uploading={posterUploading}
              disabled={saving}
            />
            <TextInput
              style={[styles.inputPrice, styles.inputNoBottomMargin]}
              value={draftDailyCapacity}
              onChangeText={onChangeDailyCapacity}
              keyboardType="numeric"
              placeholder="Daily seat capacity (e.g. 100)"
              placeholderTextColor="rgba(13, 45, 29, 0.45)"
            />
          </View>
          <View style={styles.editActionsRow}>
            <Pressable onPress={onSave} style={styles.actionBtn} accessibilityRole="button">
              <Text style={styles.actionBtnText}>Save</Text>
            </Pressable>
            <Pressable onPress={onCancel} style={styles.actionBtnMuted} accessibilityRole="button">
              <Text style={styles.actionBtnMutedText}>Cancel</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.showRow}>
          <View style={styles.showMain}>
            <Text style={styles.rowLabel}>{show.name}</Text>
            <Text style={styles.showTime}>{show.meta?.timeLabel || '-'}</Text>
            <Text style={styles.showCapacity}>Daily seats: {show.dailyCapacity ?? 100}</Text>
          </View>
          <Text style={styles.rowValue}>{formatLkr(show.priceLkr)}</Text>
          <View style={styles.rowActions}>
            <Pressable onPress={onEdit} style={styles.editBtn} accessibilityRole="button">
              <Text style={styles.editBtnText}>Edit</Text>
            </Pressable>
            <Pressable onPress={onDelete} style={styles.deleteBtn} accessibilityRole="button">
              <Text style={styles.deleteBtnText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

export default function AdminTicketsShowsListScreen({ navigation }) {
  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);
  const [tickets, setTickets] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [draftTicketName, setDraftTicketName] = useState('');
  const [draftTicketPrice, setDraftTicketPrice] = useState('');
  const [editingShowId, setEditingShowId] = useState(null);
  const [draftShowName, setDraftShowName] = useState('');
  const [draftShowTime, setDraftShowTime] = useState('');
  const [draftShowPrice, setDraftShowPrice] = useState('');
  const [draftShowImageUrl, setDraftShowImageUrl] = useState('');
  const [draftShowDailyCapacity, setDraftShowDailyCapacity] = useState('');
  const [newShowName, setNewShowName] = useState('');
  const [newShowTime, setNewShowTime] = useState('');
  const [newShowPrice, setNewShowPrice] = useState('');
  const [newShowImageUrl, setNewShowImageUrl] = useState('');
  const [newShowDailyCapacity, setNewShowDailyCapacity] = useState('100');
  const [isAddShowOpen, setIsAddShowOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [posterUploading, setPosterUploading] = useState(false);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminTicketCatalog();
      setTickets(data?.data?.entryTickets ?? []);
      setShows(data?.data?.shows ?? []);
    } catch (error) {
      Alert.alert('Ticket catalog', 'Unable to load tickets and shows right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const pickShowPoster = useCallback(async (setImageUrl) => {
    if (posterUploading || saving) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photos', 'Allow photo library access to choose a show poster.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: Platform.OS === 'ios',
      quality: 0.85,
    });
    if (picked.canceled || !picked.assets?.[0]?.uri) return;
    setPosterUploading(true);
    try {
      const data = await uploadShowPosterImage(picked.assets[0]);
      const path = data?.data?.imageUrl;
      if (path) setImageUrl(path);
      else Alert.alert('Upload', 'Could not read image URL from the server response.');
    } catch {
      Alert.alert('Upload', 'Could not upload the image. Try again or enter a URL below.');
    } finally {
      setPosterUploading(false);
    }
  }, [posterUploading, saving]);

  const startTicketEdit = (ticket) => {
    setEditingTicketId(ticket._id);
    setDraftTicketName(ticket.name);
    setDraftTicketPrice(String(ticket.priceLkr));
  };

  const cancelTicketEdit = () => {
    setEditingTicketId(null);
    setDraftTicketName('');
    setDraftTicketPrice('');
  };

  const saveTicketEdit = async (id) => {
    const normalizedName = draftTicketName.trim();
    const numericPrice = Number(draftTicketPrice);
    if (!normalizedName || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      Alert.alert('Entry ticket', 'Enter a valid name and price.');
      return;
    }
    setSaving(true);
    try {
      await updateEntryTicket(id, {
        name: normalizedName,
        priceLkr: Math.round(numericPrice),
      });
      cancelTicketEdit();
      await loadCatalog();
    } catch (error) {
      Alert.alert('Entry ticket', 'Failed to update ticket.');
    } finally {
      setSaving(false);
    }
  };

  const requestDeleteTicket = (id) => {
    setDeleteTarget({ id, type: 'ticket' });
  };

  const startShowEdit = (show) => {
    setEditingShowId(show._id);
    setDraftShowName(show.name);
    setDraftShowTime(show.meta?.timeLabel || '');
    setDraftShowPrice(String(show.priceLkr));
    setDraftShowImageUrl(show.meta?.imageUrl || DEFAULT_SHOW_IMAGE_PATHS[show.code] || '');
    setDraftShowDailyCapacity(String(show.dailyCapacity ?? 100));
  };

  const cancelShowEdit = () => {
    setEditingShowId(null);
    setDraftShowName('');
    setDraftShowTime('');
    setDraftShowPrice('');
    setDraftShowImageUrl('');
    setDraftShowDailyCapacity('');
  };

  const saveShowEdit = async (id) => {
    const normalizedName = draftShowName.trim();
    const normalizedTime = draftShowTime.trim();
    const numericPrice = Number(draftShowPrice);
    const numericDailyCapacity = Number(draftShowDailyCapacity);
    if (
      !normalizedName ||
      !normalizedTime ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0 ||
      !Number.isInteger(numericDailyCapacity) ||
      numericDailyCapacity <= 0
    ) {
      Alert.alert('Show', 'Enter valid name, time, price, and daily seat capacity.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: normalizedName,
        timeLabel: normalizedTime,
        priceLkr: Math.round(numericPrice),
        dailyCapacity: numericDailyCapacity,
      };
      const trimmedImageUrl = draftShowImageUrl.trim();
      if (trimmedImageUrl) {
        payload.imageUrl = trimmedImageUrl;
      }
      await updateShowTicket(id, {
        ...payload,
      });
      cancelShowEdit();
      await loadCatalog();
    } catch (error) {
      Alert.alert('Show', 'Failed to update show.');
    } finally {
      setSaving(false);
    }
  };

  const requestDeleteShow = (id) => {
    setDeleteTarget({ id, type: 'show' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    const { id, type } = deleteTarget;
    setSaving(true);
    try {
      await deleteTicketCatalogItem(id);
      if (type === 'ticket' && editingTicketId === id) {
        cancelTicketEdit();
      }
      if (type === 'show' && editingShowId === id) {
        cancelShowEdit();
      }
      setDeleteTarget(null);
      await loadCatalog();
    } catch (error) {
      const label = type === 'ticket' ? 'Entry ticket' : 'Show';
      const message = error?.response?.data?.message || `Failed to delete ${type}.`;
      Alert.alert(label, message);
    } finally {
      setSaving(false);
    }
  };

  const addNewShow = async () => {
    const normalizedName = newShowName.trim();
    const normalizedTime = newShowTime.trim();
    const numericPrice = Number(newShowPrice);
    const numericDailyCapacity = Number(newShowDailyCapacity);
    if (
      !normalizedName ||
      !normalizedTime ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0 ||
      !Number.isInteger(numericDailyCapacity) ||
      numericDailyCapacity <= 0
    ) {
      Alert.alert('Add show', 'Enter valid name, time, price, and daily seat capacity.');
      return;
    }
    setSaving(true);
    try {
      await createShowTicket({
        name: normalizedName,
        timeLabel: normalizedTime,
        priceLkr: Math.round(numericPrice),
        imageUrl: newShowImageUrl.trim(),
        dailyCapacity: numericDailyCapacity,
      });
      setNewShowName('');
      setNewShowTime('');
      setNewShowPrice('');
      setNewShowImageUrl('');
      setNewShowDailyCapacity('100');
      setIsAddShowOpen(false);
      await loadCatalog();
    } catch (error) {
      Alert.alert('Add show', 'Failed to add show.');
    } finally {
      setSaving(false);
    }
  };

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
        <Text style={styles.title}>Manage Tickets and Shows</Text>
        <Text style={styles.sub}>Available entry tickets and animal shows.</Text>
      </View>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading tickets and shows...</Text>
        </View>
      ) : null}

      <Section title="Available Entry Tickets">
        {tickets.map((item, index) => (
          <TicketRow
            key={item._id}
            ticket={item}
            isLast={index === tickets.length - 1}
            isEditing={editingTicketId === item._id}
            draftName={draftTicketName}
            draftPrice={draftTicketPrice}
            onEdit={() => startTicketEdit(item)}
            onCancel={cancelTicketEdit}
            onChangeName={setDraftTicketName}
            onChangePrice={setDraftTicketPrice}
            onSave={() => saveTicketEdit(item._id)}
            onDelete={() => requestDeleteTicket(item._id)}
          />
        ))}
      </Section>

      <Section
        title="Available Shows"
        headerAction={(
          <Pressable
            onPress={() => setIsAddShowOpen(true)}
            style={styles.plusButton}
            accessibilityRole="button"
            accessibilityLabel="Add new show"
          >
            <MaterialCommunityIcons name="plus" size={16} color={theme.colors.white} />
          </Pressable>
        )}
      >
        {shows.map((item, index) => (
          <ShowRow
            key={item._id}
            show={item}
            isLast={index === shows.length - 1}
            isEditing={editingShowId === item._id}
            draftName={draftShowName}
            draftTime={draftShowTime}
            draftPrice={draftShowPrice}
            draftImageUrl={draftShowImageUrl}
            draftDailyCapacity={draftShowDailyCapacity}
            onEdit={() => startShowEdit(item)}
            onCancel={cancelShowEdit}
            onChangeName={setDraftShowName}
            onChangeTime={setDraftShowTime}
            onChangePrice={setDraftShowPrice}
            onChangeImageUrl={setDraftShowImageUrl}
            onChangeDailyCapacity={setDraftShowDailyCapacity}
            onPickPoster={() => pickShowPoster(setDraftShowImageUrl)}
            posterUploading={posterUploading}
            saving={saving}
            onSave={() => saveShowEdit(item._id)}
            onDelete={() => requestDeleteShow(item._id)}
          />
        ))}
      </Section>

      <Modal
        visible={isAddShowOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddShowOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add New Show</Text>
            <TextInput
              style={styles.inputName}
              value={newShowName}
              onChangeText={setNewShowName}
              placeholder="Show name"
              placeholderTextColor="rgba(13, 45, 29, 0.45)"
            />
            <View style={styles.editFieldsWrap}>
              <TextInput
                style={styles.inputTime}
                value={newShowTime}
                onChangeText={setNewShowTime}
                placeholder="Show time (e.g. 5:00 PM)"
                placeholderTextColor="rgba(13, 45, 29, 0.45)"
              />
              <TextInput
                style={styles.inputPrice}
                value={newShowPrice}
                onChangeText={setNewShowPrice}
                keyboardType="numeric"
                placeholder="Price (LKR)"
                placeholderTextColor="rgba(13, 45, 29, 0.45)"
              />
              <ShowPosterField
                value={newShowImageUrl}
                onChangeText={setNewShowImageUrl}
                onPickFromGallery={() => pickShowPoster(setNewShowImageUrl)}
                uploading={posterUploading}
                disabled={saving}
              />
              <TextInput
                style={[styles.inputPrice, styles.inputNoBottomMargin]}
                value={newShowDailyCapacity}
                onChangeText={setNewShowDailyCapacity}
                keyboardType="numeric"
                placeholder="Daily seat capacity (e.g. 100)"
                placeholderTextColor="rgba(13, 45, 29, 0.45)"
              />
            </View>
            <View style={styles.modalActions}>
              <Pressable onPress={addNewShow} style={styles.actionBtn} accessibilityRole="button" disabled={saving}>
                <Text style={styles.actionBtnText}>Add Show</Text>
              </Pressable>
              <Pressable
                onPress={() => setIsAddShowOpen(false)}
                style={styles.actionBtnMuted}
                accessibilityRole="button"
              >
                <Text style={styles.actionBtnMutedText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={Boolean(deleteTarget)}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {deleteTarget?.type === 'ticket' ? 'Delete ticket?' : 'Delete show?'}
            </Text>
            <Text style={styles.modalText}>
              {deleteTarget?.type === 'ticket'
                ? 'Are you sure you want to delete this ticket?'
                : 'Are you sure you want to delete this show?'}
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                onPress={confirmDelete}
                style={styles.deleteBtnConfirm}
                accessibilityRole="button"
                disabled={saving}
              >
                <Text style={styles.deleteBtnConfirmText}>Delete</Text>
              </Pressable>
              <Pressable
                onPress={() => setDeleteTarget(null)}
                style={styles.actionBtnMuted}
                accessibilityRole="button"
              >
                <Text style={styles.actionBtnMutedText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  plusButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accentGreen,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  rowsPanel: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  ticketRow: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  ticketReadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  showMain: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  rowLabel: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  showTime: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: theme.colors.accentGreen,
  },
  showCapacity: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
  },
  rowValue: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  editBtn: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.welcomeBackground,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.radii.sm,
  },
  editBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  deleteBtn: {
    marginLeft: theme.spacing.xs,
    backgroundColor: '#FEECEE',
    borderWidth: 1,
    borderColor: '#F3C1C6',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.radii.sm,
  },
  deleteBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: '#B42318',
  },
  inputName: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    backgroundColor: theme.colors.white,
  },
  editActionsRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editFieldsWrap: {
    marginTop: theme.spacing.sm,
  },
  inputTime: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  inputPrice: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  inputImageUrl: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.sm,
  },
  posterField: {
    marginBottom: theme.spacing.sm,
  },
  posterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  posterThumb: {
    width: 72,
    height: 72,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.welcomeBackground,
  },
  posterThumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterPickBtn: {
    flex: 1,
    backgroundColor: theme.colors.accentGreen,
    borderRadius: theme.radii.sm,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  posterPickBtnDisabled: {
    opacity: 0.65,
  },
  posterPickBtnText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  inputPriceCompact: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  inputNoBottomMargin: {
    marginBottom: 0,
  },
  actionBtn: {
    backgroundColor: theme.colors.accentGreen,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    marginRight: theme.spacing.xs,
  },
  actionBtnText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  actionBtnMuted: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    backgroundColor: theme.colors.white,
  },
  actionBtnMutedText: {
    color: theme.colors.primaryText,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    marginBottom: theme.spacing.sm,
  },
  modalActions: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  modalText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    lineHeight: Math.round(theme.fontSize.body * 1.4),
  },
  deleteBtnConfirm: {
    backgroundColor: '#B42318',
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    marginRight: theme.spacing.xs,
  },
  deleteBtnConfirmText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
  },
});
