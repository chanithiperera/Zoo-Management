import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import { theme } from '../../constants/theme';
import { ENTRY_TICKET_TYPES, formatLkr } from '../../constants/entryTickets';
import { getTicketShowPlaceholderRows } from '../../constants/ticketShowCatalog';
import { getAdminDrawerMenuItems } from './adminNavigation';

const ENTRY_TICKET_ROWS = ENTRY_TICKET_TYPES.map((ticket) => ({
  id: ticket.id,
  label: ticket.label,
  priceLkr: ticket.priceLkr,
}));

const SHOW_ROWS = getTicketShowPlaceholderRows().map((show, index) => ({
  id: `show-${index}`,
  name: show.name,
  time: show.time,
  priceLkr: Number(String(show.price).replace(/[^\d.-]/g, '')) || 0,
}));

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
            <Text style={styles.rowLabel}>{ticket.label}</Text>
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
  onEdit,
  onCancel,
  onChangeName,
  onChangeTime,
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
            <Text style={styles.showTime}>{show.time}</Text>
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
  const [tickets, setTickets] = useState(ENTRY_TICKET_ROWS);
  const [shows, setShows] = useState(SHOW_ROWS);
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [draftTicketName, setDraftTicketName] = useState('');
  const [draftTicketPrice, setDraftTicketPrice] = useState('');
  const [editingShowId, setEditingShowId] = useState(null);
  const [draftShowName, setDraftShowName] = useState('');
  const [draftShowTime, setDraftShowTime] = useState('');
  const [draftShowPrice, setDraftShowPrice] = useState('');
  const [newShowName, setNewShowName] = useState('');
  const [newShowTime, setNewShowTime] = useState('');
  const [newShowPrice, setNewShowPrice] = useState('');
  const [isAddShowOpen, setIsAddShowOpen] = useState(false);

  const startTicketEdit = (ticket) => {
    setEditingTicketId(ticket.id);
    setDraftTicketName(ticket.label);
    setDraftTicketPrice(String(ticket.priceLkr));
  };

  const cancelTicketEdit = () => {
    setEditingTicketId(null);
    setDraftTicketName('');
    setDraftTicketPrice('');
  };

  const saveTicketEdit = (id) => {
    const normalizedName = draftTicketName.trim();
    const numericPrice = Number(draftTicketPrice);
    if (!normalizedName || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      return;
    }

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              label: normalizedName,
              priceLkr: Math.round(numericPrice),
            }
          : ticket
      )
    );
    cancelTicketEdit();
  };

  const deleteTicket = (id) => {
    setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
    if (editingTicketId === id) {
      cancelTicketEdit();
    }
  };

  const startShowEdit = (show) => {
    setEditingShowId(show.id);
    setDraftShowName(show.name);
    setDraftShowTime(show.time);
    setDraftShowPrice(String(show.priceLkr));
  };

  const cancelShowEdit = () => {
    setEditingShowId(null);
    setDraftShowName('');
    setDraftShowTime('');
    setDraftShowPrice('');
  };

  const saveShowEdit = (id) => {
    const normalizedName = draftShowName.trim();
    const normalizedTime = draftShowTime.trim();
    const numericPrice = Number(draftShowPrice);
    if (!normalizedName || !normalizedTime || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      return;
    }

    setShows((prev) =>
      prev.map((show) =>
        show.id === id
          ? {
              ...show,
              name: normalizedName,
              time: normalizedTime,
              priceLkr: Math.round(numericPrice),
            }
          : show
      )
    );
    cancelShowEdit();
  };

  const deleteShow = (id) => {
    setShows((prev) => prev.filter((show) => show.id !== id));
    if (editingShowId === id) {
      cancelShowEdit();
    }
  };

  const addNewShow = () => {
    const normalizedName = newShowName.trim();
    const normalizedTime = newShowTime.trim();
    const numericPrice = Number(newShowPrice);
    if (!normalizedName || !normalizedTime || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      return;
    }

    setShows((prev) => [
      ...prev,
      {
        id: `show-${Date.now()}`,
        name: normalizedName,
        time: normalizedTime,
        priceLkr: Math.round(numericPrice),
      },
    ]);
    setNewShowName('');
    setNewShowTime('');
    setNewShowPrice('');
    setIsAddShowOpen(false);
  };

  return (
    <AccountDrawerLayout headerTitle="Explore" drawerMenuItems={drawerMenuItems}>
      <View style={styles.heroCard} accessibilityRole="header">
        <Text style={styles.title}>Manage Tickets and Shows</Text>
        <Text style={styles.sub}>Available entry tickets and animal shows.</Text>
      </View>

      <Section title="Available Entry Tickets">
        {tickets.map((item, index) => (
          <TicketRow
            key={item.id}
            ticket={item}
            isLast={index === tickets.length - 1}
            isEditing={editingTicketId === item.id}
            draftName={draftTicketName}
            draftPrice={draftTicketPrice}
            onEdit={() => startTicketEdit(item)}
            onCancel={cancelTicketEdit}
            onChangeName={setDraftTicketName}
            onChangePrice={setDraftTicketPrice}
            onSave={() => saveTicketEdit(item.id)}
            onDelete={() => deleteTicket(item.id)}
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
            key={item.id}
            show={item}
            isLast={index === shows.length - 1}
            isEditing={editingShowId === item.id}
            draftName={draftShowName}
            draftTime={draftShowTime}
            draftPrice={draftShowPrice}
            onEdit={() => startShowEdit(item)}
            onCancel={cancelShowEdit}
            onChangeName={setDraftShowName}
            onChangeTime={setDraftShowTime}
            onChangePrice={setDraftShowPrice}
            onSave={() => saveShowEdit(item.id)}
            onDelete={() => deleteShow(item.id)}
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
            </View>
            <View style={styles.modalActions}>
              <Pressable onPress={addNewShow} style={styles.actionBtn} accessibilityRole="button">
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
  },
  inputPriceCompact: {
    flex: 1,
    marginRight: theme.spacing.sm,
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
});
