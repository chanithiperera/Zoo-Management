import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { popOrParentGoBack } from '../../utils/popOrParentGoBack';

const { width } = Dimensions.get('window');

const QUIZ_QUESTIONS = [
  {
    question: "How many individual muscles are in an elephant's trunk?",
    options: ["4,000", "14,000", "40,000", "100,000"],
    correctAnswer: 2,
    fact: "An elephant trunk has over 40,000 muscles, making it strong enough to uproot trees yet delicate enough to pick up a berry!"
  },
  {
    question: "How far away can a tiger's roar be heard?",
    options: ["500 meters", "1 mile", "2 miles", "5 miles"],
    correctAnswer: 2,
    fact: "A tiger's roar is so powerful it can be heard from up to two miles (3.2 km) away."
  },
  {
    question: "Which bird incubates its egg on its feet for two months without eating?",
    options: ["Macaw", "Emperor Penguin", "Ostrich", "Albatross"],
    correctAnswer: 1,
    fact: "Male Emperor Penguins endure the Antarctic winter for 60+ days, keeping the egg warm on their feet while the females hunt."
  },
  {
    question: "How much bamboo can a Giant Panda eat in a single day?",
    options: ["5 kg", "12 kg", "25 kg", "38 kg"],
    correctAnswer: 3,
    fact: "Pandas spend up to 14 hours a day eating and can consume up to 38 kg of bamboo to get enough nutrients."
  },
  {
    question: "A Great White Shark can detect a single drop of blood in how much water?",
    options: ["10 Liters", "50 Liters", "100 Liters", "1,000 Liters"],
    correctAnswer: 2,
    fact: "Their sense of smell is so keen they can detect one drop of blood in 100 liters of water from miles away."
  }
];

const QuizScreen = ({ navigation }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleAnswer = (index) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(index);
    const correct = index === QUIZ_QUESTIONS[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore(score + 1);

    setTimeout(() => {
      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 2500);
  };

  if (showResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultCard}>
          <Ionicons 
            name={score >= 3 ? "trophy" : "ribbon"} 
            size={100} 
            color={score >= 3 ? "#FFD700" : "#C0C0C0"} 
          />
          <Text style={styles.resultTitle}>Quiz Completed!</Text>
          <Text style={styles.resultScore}>You scored {score} out of {QUIZ_QUESTIONS.length}</Text>
          <Text style={styles.resultMessage}>
            {score === 5 ? "Perfect! You're a Zoo Master!" : 
             score >= 3 ? "Great job! You know your animals well." : 
             "Keep learning and try again!"}
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => popOrParentGoBack(navigation)}
          >
            <Text style={styles.buttonText}>Return to Zoo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const question = QUIZ_QUESTIONS[currentQuestion];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => popOrParentGoBack(navigation)}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{currentQuestion + 1}/{QUIZ_QUESTIONS.length}</Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
        
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedOption === index && (index === question.correctAnswer ? styles.correctOption : styles.wrongOption),
              selectedOption !== null && index === question.correctAnswer && styles.correctOption
            ]}
            onPress={() => handleAnswer(index)}
            disabled={selectedOption !== null}
          >
            <Text style={[
              styles.optionText,
              selectedOption === index && styles.selectedOptionText
            ]}>{option}</Text>
            {selectedOption === index && (
              <Ionicons 
                name={index === question.correctAnswer ? "checkmark-circle" : "close-circle"} 
                size={24} 
                color="#fff" 
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {selectedOption !== null && (
        <Animated.View style={styles.factContainer}>
          <Text style={styles.factTitle}>Did You Know?</Text>
          <Text style={styles.factText}>{question.fact}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default QuizScreen;
