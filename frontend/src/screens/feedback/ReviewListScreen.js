import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { theme } from '../../constants/theme';
import * as feedbackApi from '../../api/feedback.api';
import { useAuth } from '../../hooks/useAuth';

export default function ReviewListScreen({ navigation }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await feedbackApi.getMyReviews();
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await feedbackApi.getMyReviews();
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error refreshing reviews:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [fetchReviews])
  );
  const handleDelete = (id) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await feedbackApi.deleteReview(id);
              fetchReviews();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete review');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.starsRow} accessibilityLabel={`Rating ${item.rating} out of 5`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Ionicons
              key={i}
              name={i <= item.rating ? 'star' : 'star-outline'}
              size={18}
              color={i <= item.rating ? theme.colors.ratingStar : theme.colors.ratingStarMuted}
            />
          ))}
        </View>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.message}>{item.message}</Text>
      
      {item.adminReply && (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Administration Responses:</Text>
          <Text style={styles.replyText}>{item.adminReply}</Text>
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => navigation.navigate('AddReview', { review: item })}
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer scroll={false} backgroundColor={theme.colors.backgroundAlt}>
      <FlatList
        data={reviews}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.accentGreen]} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>My Reviews</Text>
            <PrimaryButton
              title="Add New Review"
              onPress={() => navigation.navigate('AddReview')}
              style={styles.addButton}
            />
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyMark} accessibilityElementsHidden />
              <Text style={styles.emptyText}>No reviews submitted yet</Text>
            </View>
          )
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontWeight: '700',
    fontSize: theme.fontSize.title,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.md,
  },
  addButton: {
    marginBottom: theme.spacing.sm,
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
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
    fontSize: 12,
    color: theme.colors.primaryText,
    opacity: 0.5,
  },
  message: {
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    opacity: 0.8,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  editBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: theme.colors.backgroundAlt,
  },
  editBtnText: {
    fontFamily: theme.fonts.bold,
    fontWeight: '700',
    fontSize: 12,
    color: theme.colors.accentGreen,
  },
  deleteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#FFEBEE',
  },
  deleteBtnText: {
    fontFamily: theme.fonts.bold,
    fontWeight: '700',
    fontSize: 12,
    color: theme.colors.error,
  },
  replyBox: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: '#F1F8E9',
    borderRadius: theme.radii.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accentGreen,
    marginBottom: theme.spacing.sm,
  },
  replyLabel: {
    fontFamily: theme.fonts.bold,
    fontWeight: '700',
    fontSize: 10,
    color: theme.colors.accentGreen,
    marginBottom: 4,
  },
  replyText: {
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
    fontSize: 12,
    color: theme.colors.primaryText,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyMark: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.accentGreen,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontFamily: theme.fonts.regular,
    fontWeight: '400',
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    opacity: 0.5,
  },
});
