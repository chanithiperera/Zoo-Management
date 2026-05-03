import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import { buildUserDrawerMenuItems } from '../profile/userDrawerMenu';
import { getAllQuizzes } from '../../api/quiz.api';
import { buildVisitorQuizDecks } from './visitorQuizDecks';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function MyQuizzesScreen({ navigation }) {
  const drawerMenuItems = useMemo(() => buildUserDrawerMenuItems(navigation), [navigation]);
  const [quizDecks, setQuizDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllQuizzes();
      setQuizDecks(buildVisitorQuizDecks(res?.data ?? []));
    } catch {
      setError('Could not load quizzes. Please try again.');
      setQuizDecks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadQuizzes();
    }, [loadQuizzes])
  );

  return (
    <AccountDrawerLayout headerTitle="My Quizzes" drawerMenuItems={drawerMenuItems}>
      <View style={styles.intro}>
        <Text style={styles.introTitle}>Play a quiz</Text>
        <Text style={styles.introBody}>
          Each card is a short quiz for one species. Your score is shown at the end.
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerRow}>
          <ActivityIndicator size="small" color={theme.colors.accentGreen} />
          <Text style={styles.muted}>Loading quizzes…</Text>
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : quizDecks.length === 0 ? (
        <Text style={styles.muted}>
          No quizzes are available yet. Check back after the zoo team publishes questions in Animal Information and
          Education.
        </Text>
      ) : (
        <View style={styles.grid}>
          {quizDecks.map((deck) => (
            <TouchableOpacity
              key={deck.animalId}
              style={[styles.card, { width: width - theme.spacing.md * 2 }]}
              onPress={() =>
                navigation.navigate('QuizScreen', {
                  animalId: deck.animalId,
                  quizTitle: deck.title,
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`Start ${deck.title}`}
            >
              <ImageBackground source={{ uri: deck.imageUri }} style={styles.image}>
                <View style={styles.overlay}>
                  <View style={styles.badge}>
                    <Ionicons name="extension-puzzle-outline" size={16} color="#333" />
                  </View>
                  <Text style={styles.cardTitle}>{deck.title}</Text>
                  <Text style={styles.cardSub}>{deck.subtitle}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: theme.spacing.md,
  },
  introTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.xs,
  },
  introBody: {
    fontSize: theme.fontSize.sm,
    lineHeight: Math.round(theme.fontSize.sm * 1.45),
    color: theme.colors.primaryText,
    opacity: 0.72,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  muted: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.7,
    lineHeight: Math.round(theme.fontSize.sm * 1.45),
  },
  error: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    height: 180,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  overlay: {
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  cardTitle: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: theme.fontSize.body,
  },
  cardSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: theme.fontSize.sm - 2,
  },
});
