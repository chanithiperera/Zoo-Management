import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Alert,
  ScrollView,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';
import { getStaticBaseUrl } from '../../api/getApiBaseUrl';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function PhotoGalleryScreen({ route }) {
  const { bookingId: filterBookingId } = route.params || {};
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const staticBase = getStaticBaseUrl();

  useEffect(() => {
    fetchMemories();
  }, [filterBookingId]);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/photos');

      if (response.data.success) {
        const rawPhotos = response.data.data;

        const grouped = rawPhotos.reduce((acc, photo) => {
          const bId = photo.booking?._id || photo.booking;
          if (!acc[bId]) {
            acc[bId] = {
              _id: bId,
              caption: photo.caption,
              description: photo.description,
              bestMoment: photo.bestMoment,
              createdAt: photo.createdAt,
              images: [],
            };
          }
          acc[bId].images.push(photo.imageUrl);
          return acc;
        }, {});

        const sortedMemories = Object.values(grouped).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setMemories(sortedMemories);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSaveMemory = (imagePath) => {
    const fullUrl = imagePath.startsWith('http') ? imagePath : `${staticBase}${imagePath}`;

    if (Platform.OS === 'web') {
      window.open(fullUrl, '_blank');
      return;
    }

    Linking.openURL(fullUrl).catch((err) => {
      console.error('Failed to open URL:', err);
      Alert.alert('Error', 'Could not open the image viewer.');
    });
  };

  const renderMemory = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardCaption}>{item.caption || 'Zoo memory'}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        style={styles.imgScroll}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {item.images.map((img, idx) => (
          <View key={idx} style={styles.imgWrapper}>
            <Image
              source={{ uri: img.startsWith('http') ? img : `${staticBase}${img}` }}
              style={styles.mainImg}
            />
            {item.images.length > 1 ? (
              <View style={styles.imgBadge}>
                <Text style={styles.imgBadgeText}>
                  {idx + 1} / {item.images.length}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.miniSaveBtn}
              onPress={() => handleSaveMemory(img)}
              accessibilityLabel="Open or download image"
            >
              <Ionicons name="download-outline" size={22} color={theme.colors.linkGreen} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.cardBody}>
        {item.bestMoment ? (
          <View style={styles.bestMomentBox}>
            <View style={styles.bestLabelRow}>
              <Ionicons name="star" size={14} color={theme.colors.yellow} style={{ marginRight: 6 }} />
              <Text style={styles.bestLabel}>Best moment</Text>
            </View>
            <Text style={styles.bestValue}>{item.bestMoment}</Text>
          </View>
        ) : null}

        <Text style={styles.description}>
          {item.description || 'Moments from your visit, shared by our photography team.'}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          <TouchableOpacity style={styles.downloadBtn} onPress={() => handleSaveMemory(item.images[0])}>
            <Ionicons name="download-outline" size={18} color={theme.colors.linkGreen} style={{ marginRight: 8 }} />
            <Text style={styles.downloadBtnText}>Save main photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My zoo memories</Text>
        <Text style={styles.subtitle}>Photos from your photography sessions</Text>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={theme.colors.accentGreen} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderMemory}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchMemories();
              }}
              colors={[theme.colors.accentGreen]}
              tintColor={theme.colors.accentGreen}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="images-outline" size={56} color={theme.colors.accentGreen} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyTitle}>Memories coming soon</Text>
              <Text style={styles.emptySub}>
                When your session photos are ready, they will appear here. You can open them or save to your device.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundAlt },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomLeftRadius: theme.radii.lg,
    borderBottomRightRadius: theme.radii.lg,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    elevation: 3,
  },
  title: { fontSize: theme.fontSize.hero, fontWeight: '700', color: theme.colors.linkGreen },
  subtitle: { fontSize: theme.fontSize.sm, color: theme.colors.accentGreen, marginTop: 4, opacity: 0.9 },
  list: { padding: 15 },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    marginBottom: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
  },
  cardCaption: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    padding: 15,
    color: theme.colors.primaryText,
  },
  imgScroll: { width: '100%', height: 300 },
  imgWrapper: { width: width - 30, height: 300, position: 'relative' },
  mainImg: { width: '100%', height: '100%', resizeMode: 'cover', backgroundColor: theme.colors.sage },
  imgBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
  },
  imgBadgeText: { color: theme.colors.white, fontSize: 10, fontWeight: '700' },
  cardBody: { padding: 15 },
  bestMomentBox: {
    backgroundColor: theme.colors.yellowAlt + '33',
    padding: 12,
    borderRadius: theme.radii.sm,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.yellow,
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  bestLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  bestLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.linkGreen, textTransform: 'uppercase', letterSpacing: 0.5 },
  bestValue: { fontSize: 15, fontWeight: '600', color: theme.colors.primaryText },
  description: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.8, lineHeight: 22, marginBottom: 15 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 15,
  },
  dateText: { fontSize: 12, color: theme.colors.primaryText, opacity: 0.55 },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.welcomeBackground,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.sage,
  },
  downloadBtnText: { color: theme.colors.linkGreen, fontWeight: '700', fontSize: theme.fontSize.sm },
  miniSaveBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: theme.colors.white,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.sage,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  empty: { alignItems: 'center', marginTop: 80, padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.primaryText, marginBottom: 10 },
  emptySub: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.65,
    textAlign: 'center',
    lineHeight: 20,
  },
});
