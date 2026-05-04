import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image, TextInput, Modal, Alert } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { theme } from '../../constants/theme';
import * as feedbackApi from '../../api/feedback.api';
import { getApiBaseUrl } from '../../api/getApiBaseUrl';

const TYPES = [
  'All',
  'Entry Tickets and Show Booking',
  'Event Booking',
  'Animal Encounter and Photography',
  'Animal Information and Education',
  'Online Store',
  'General',
];

export default function AdminFeedbackScreen() {
  const [activeTab, setActiveTab] = useState('Feedback');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  const [selectedItem, setSelectedItem] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === 'Feedback') {
        response = await feedbackApi.getAllFeedbacks();
        setData(response.data.feedbacks);
      } else if (activeTab === 'Inquiry') {
        response = await feedbackApi.getAllInquiries();
        setData(response.data.inquiries);
      } else {
        response = await feedbackApi.getAllReviews();
        setData(response.data.reviews);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Filtering and Searching
  useEffect(() => {
    let result = data;

    // Filter by type (only for Feedback and Inquiry)
    if (filterType !== 'All' && activeTab !== 'Review') {
      result = result.filter(item => item.type === filterType);
    }

    // Search by User Name or Subject
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.userId?.fullName?.toLowerCase().includes(query) ||
        item.subject?.toLowerCase().includes(query) ||
        item.message?.toLowerCase().includes(query)
      );
    }

    setFilteredData(result);
  }, [data, searchQuery, filterType, activeTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      if (activeTab === 'Feedback') {
        await feedbackApi.replyToFeedback(selectedItem._id, replyText);
      } else if (activeTab === 'Inquiry') {
        await feedbackApi.replyToInquiry(selectedItem._id, replyText);
      } else {
        await feedbackApi.replyToReview(selectedItem._id, replyText);
      }
      Alert.alert('Success', 'Reply updated successfully');
      setShowReplyModal(false);
      setReplyText('');
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to send reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDeleteReply = (item) => {
    Alert.alert(
      'Delete Response',
      'Are you sure you want to remove this response?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (activeTab === 'Feedback') {
                await feedbackApi.replyToFeedback(item._id, '');
              } else if (activeTab === 'Inquiry') {
                await feedbackApi.replyToInquiry(item._id, '');
              } else {
                await feedbackApi.replyToReview(item._id, '');
              }
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete response');
            }
          },
        },
      ]
    );
  };

  const renderReplySection = (reply) => (
    reply ? (
      <View style={styles.replyBox}>
        <Text style={styles.replyLabel}>Our Response:</Text>
        <Text style={styles.replyText}>{reply}</Text>
      </View>
    ) : null
  );

  const renderActions = (item) => (
    <View style={styles.actionContainer}>
      {item.adminReply ? (
        <>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.editActionBtn]} 
            onPress={() => { setSelectedItem(item); setReplyText(item.adminReply); setShowReplyModal(true); }}
          >
            <Text style={styles.editActionBtnText}>Edit Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteActionBtn]} 
            onPress={() => handleDeleteReply(item)}
          >
            <Text style={styles.deleteActionBtnText}>Delete Reply</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity 
          style={styles.replyBtn} 
          onPress={() => { setSelectedItem(item); setReplyText(''); setShowReplyModal(true); }}
        >
          <Text style={styles.replyBtnText}>Reply</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFeedback = (item) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.userName}>{item.userId?.fullName || 'Unknown User'}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.itemType}>{item.type}</Text>
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.message}>{item.message}</Text>
      {renderReplySection(item.adminReply)}
      {renderActions(item)}
    </View>
  );

  const renderInquiry = (item) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.userName}>{item.userId?.fullName || 'Unknown User'}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.inquiryMeta}>
        <Text style={styles.itemType}>{item.type}</Text>
        <View style={[styles.statusBadge, item.status === 'RESOLVED' ? styles.statusResolved : styles.statusNew]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.message}>{item.message}</Text>
      {item.imageUrl && (
        <Image
          source={{ uri: `${getApiBaseUrl().replace('/api', '')}${item.imageUrl}` }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      {renderReplySection(item.adminReply)}
      {renderActions(item)}
    </View>
  );

  const renderReview = (item) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.userName}>{item.userId?.fullName || 'Unknown User'}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.stars}>{'⭐'.repeat(item.rating)}</Text>
      <Text style={styles.message}>{item.message}</Text>
      {renderReplySection(item.adminReply)}
      {renderActions(item)}
    </View>
  );

  const renderItem = ({ item }) => {
    if (activeTab === 'Feedback') return renderFeedback(item);
    if (activeTab === 'Inquiry') return renderInquiry(item);
    return renderReview(item);
  };

  return (
    <ScreenContainer scroll={false} backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.tabBar}>
        {['Feedback', 'Inquiry', 'Review'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => {
              setActiveTab(tab);
              setFilterType('All'); // Reset filter on tab change
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}s</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or subject..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {activeTab !== 'Review' && (
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={TYPES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterChip, filterType === item && styles.activeFilterChip]}
                onPress={() => setFilterType(item)}
              >
                <Text style={[styles.filterChipText, filterType === item && styles.activeFilterChipText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.filterList}
          />
        </View>
      )}

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.accentGreen]} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          )
        }
      />

      <Modal
        visible={showReplyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReplyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reply to {activeTab}</Text>
            <TextInput
              style={styles.replyInput}
              placeholder="Type your response here..."
              multiline
              numberOfLines={4}
              value={replyText}
              onChangeText={setReplyText}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setShowReplyModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.submitBtn]} 
                onPress={handleReplySubmit}
                disabled={replyLoading}
              >
                <Text style={styles.submitBtnText}>
                  {replyLoading ? 'Sending...' : 'Send Reply'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: 4,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.radii.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.accentGreen,
  },
  tabText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
    opacity: 0.6,
  },
  activeTabText: {
    color: theme.colors.white,
    opacity: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  userName: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.accentGreen,
    fontSize: theme.fontSize.sm,
  },
  date: {
    fontFamily: theme.fonts.regular,
    fontSize: 10,
    color: theme.colors.primaryText,
    opacity: 0.5,
  },
  searchContainer: {
    marginBottom: theme.spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    height: 46,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.body,
    color: theme.colors.black,
  },
  filterContainer: {
    marginBottom: theme.spacing.md,
  },
  filterList: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeFilterChip: {
    backgroundColor: theme.colors.accentGreen,
    borderColor: theme.colors.accentGreen,
  },
  filterChipText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    color: theme.colors.primaryText,
    opacity: 0.7,
  },
  activeFilterChipText: {
    color: theme.colors.white,
    opacity: 1,
  },
  inquiryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  itemType: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    color: theme.colors.primaryText,
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  replyBtn: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.accentGreen,
    paddingVertical: 10,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
  },
  replyBtnText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyBtn: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.accentGreen,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  replyBtnText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  editActionBtn: {
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.accentGreen,
  },
  editActionBtnText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.accentGreen,
    fontSize: 12,
  },
  deleteActionBtn: {
    backgroundColor: '#FFEBEE',
  },
  deleteActionBtnText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.error,
    fontSize: 12,
  },
  replyBox: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: '#F1F8E9',
    borderRadius: theme.radii.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accentGreen,
  },
  replyLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    color: theme.colors.accentGreen,
    marginBottom: 4,
  },
  replyText: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.primaryText,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.lg,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.md,
  },
  replyInput: {
    fontFamily: theme.fonts.regular,
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    height: 120,
    textAlignVertical: 'top',
    fontSize: theme.fontSize.body,
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: theme.colors.backgroundAlt,
  },
  submitBtn: {
    backgroundColor: theme.colors.accentGreen,
  },
  cancelBtnText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
  },
  submitBtnText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.white,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusNew: { backgroundColor: '#E3F2FD' },
  statusResolved: { backgroundColor: '#E8F5E9' },
  statusText: { fontFamily: theme.fonts.bold, fontSize: 9 },
  subject: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    marginBottom: 4,
  },
  message: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.8,
    lineHeight: 18,
  },
  stars: { fontSize: 14, marginBottom: 4 },
  image: {
    width: '100%',
    height: 150,
    borderRadius: theme.radii.sm,
    marginTop: theme.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    opacity: 0.5,
  },
});
