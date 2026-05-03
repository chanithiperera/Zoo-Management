import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { popOrParentGoBack } from '../../utils/popOrParentGoBack';
import { getQuizzesByAnimal } from '../../api/quiz.api';

function normalizeQuestions(docs) {
  const sorted = [...(docs || [])].sort(
    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  );
  return sorted
    .map((q) => {
      const options = (q.options || [])
        .map((o) => (typeof o === 'string' ? o : o?.text))
        .filter((t) => t != null && String(t).trim() !== '');
      const correct = Number(q.correctAnswerIndex);
      if (options.length < 2 || Number.isNaN(correct) || correct < 0 || correct >= options.length) {
        return null;
      }
      return {
        question: q.question,
        options,
        correctAnswer: correct,
        fact:
          q.explanation && String(q.explanation).trim()
            ? String(q.explanation).trim()
            : 'Nice work — keep exploring the zoo!',
      };
    })
    .filter(Boolean);
}

const QuizScreen = ({ navigation }) => {
  const route = useRoute();
  const animalId = route.params?.animalId;
  const quizTitle = route.params?.quizTitle;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [questions, setQuestions] = useState([]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!animalId) {
        setLoadError('This quiz is not available.');
        setQuestions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError('');
      try {
        const res = await getQuizzesByAnimal(animalId);
        const list = normalizeQuestions(res?.data || []);
        if (cancelled) return;
        if (!list.length) {
          setLoadError('No questions have been published for this quiz yet.');
          setQuestions([]);
        } else {
          setQuestions(list);
        }
      } catch {
        if (!cancelled) {
          setLoadError('Could not load this quiz. Try again later.');
          setQuestions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [animalId]);

  const total = questions.length;
  const passThreshold = total > 0 ? Math.ceil(total * 0.6) : 0;

  const handleAnswer = (index) => {
    if (selectedOption !== null || !questions.length) return;

    setSelectedOption(index);
    const q = questions[currentQuestion];
    const correct = index === q.correctAnswer;
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      if (currentQuestion < total - 1) {
        setCurrentQuestion((c) => c + 1);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
    }, 2500);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading quiz…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!animalId || loadError || total === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => popOrParentGoBack(navigation)} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={56} color="#888" />
          <Text style={styles.errorText}>{loadError || 'This quiz is not available.'}</Text>
          <TouchableOpacity style={styles.button} onPress={() => popOrParentGoBack(navigation)}>
            <Text style={styles.buttonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showResult) {
    const isPerfect = score === total;
    const didWell = score >= passThreshold;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultCard}>
          <Ionicons name={isPerfect ? 'trophy' : didWell ? 'ribbon' : 'school-outline'} size={100} color={isPerfect ? '#FFD700' : didWell ? '#C0C0C0' : '#90A4AE'} />
          <Text style={styles.resultTitle}>Quiz completed</Text>
          <Text style={styles.resultScore}>
            You scored {score} out of {total}
          </Text>
          <Text style={styles.resultMessage}>
            {isPerfect
              ? "Perfect! You're a zoo star."
              : didWell
                ? 'Great job! You know this animal well.'
                : 'Keep learning and try again!'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => popOrParentGoBack(navigation)}>
            <Text style={styles.buttonText}>Return</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const question = questions[currentQuestion];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => popOrParentGoBack(navigation)} accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${((currentQuestion + 1) / total) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestion + 1}/{total}
        </Text>
      </View>

      {quizTitle ? (
        <Text style={styles.quizTitle} numberOfLines={2}>
          {quizTitle}
        </Text>
      ) : null}

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>

        {question.options.map((option, index) => (
          <TouchableOpacity
            key={`${currentQuestion}-${index}`}
            style={[
              styles.optionButton,
              selectedOption === index && (index === question.correctAnswer ? styles.correctOption : styles.wrongOption),
              selectedOption !== null && index === question.correctAnswer && styles.correctOption,
            ]}
            onPress={() => handleAnswer(index)}
            disabled={selectedOption !== null}
          >
            <Text style={[styles.optionText, selectedOption === index && styles.selectedOptionText]}>{option}</Text>
            {selectedOption === index ? (
              <Ionicons name={index === question.correctAnswer ? 'checkmark-circle' : 'close-circle'} size={24} color="#fff" />
            ) : null}
          </TouchableOpacity>
        ))}
      </View>

      {selectedOption !== null ? (
        <Animated.View style={styles.factContainer}>
          <Text style={styles.factTitle}>Did you know?</Text>
          <Text style={styles.factText}>{question.fact}</Text>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  quizTitle: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 15,
  },
  progressContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2E7D32',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  questionContainer: {
    padding: 20,
    flex: 1,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 30,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    flex: 1,
    paddingRight: 8,
  },
  selectedOptionText: {
    color: '#fff',
  },
  correctOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  wrongOption: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  factContainer: {
    padding: 25,
    backgroundColor: '#E8F5E9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  factTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 8,
  },
  factText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#444',
    lineHeight: 22,
  },
  resultCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
  },
  resultScore: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginVertical: 10,
  },
  resultMessage: {
    fontSize: 16,
    fontWeight: '400',
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default QuizScreen;
