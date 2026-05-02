import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import PrimaryButton from '../../components/ui/PrimaryButton';
import TextField from '../../components/ui/TextField';
import { theme } from '../../constants/theme';
import { fetchAnimals, createAnimal, updateAnimal, deleteAnimal } from '../../api/animalsApi';
import { fetchEducationByAnimal, createEducation, updateEducation, deleteEducation } from '../../api/education.api';
import { getQuizzesByAnimal, createQuiz, updateQuiz, deleteQuiz } from '../../api/quiz.api';
import { getDidYouKnowByAnimal, createDidYouKnow, updateDidYouKnow, deleteDidYouKnow } from '../../api/didyouknow.api';
import { getAdminDrawerMenuItems, getAdminModuleHeroByRouteName } from './adminNavigation';

const CATEGORIES = ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish', 'Insect'];
const CONSERVATION_STATUSES = [
  'Least Concern',
  'Near Threatened',
  'Vulnerable',
  'Endangered',
  'Critically Endangered',
  'Extinct in the Wild',
  'Extinct',
  'Data Deficient',
];
const EDU_TYPES = ['article', 'video', 'activity', 'game', 'quiz'];

const BLANK_ANIMAL = {
  name: '',
  species: '',
  category: 'Mammal',
  description: '',
  habitat: '',
  diet: '',
  lifespan: '',
  weight: '',
  conservationStatus: 'Least Concern',
  funFacts: '',
};

const BLANK_EDU = { title: '', type: 'article', content: '', imageUrl: '' };

const BLANK_QUIZ = {
  question: '',
  options: ['', ''],
  correctAnswerIndex: 0,
  explanation: '',
};

const BLANK_DID_YOU_KNOW = { fact: '', source: '' };

function ChipRow({ options, selected, onSelect, small }) {
  return (
    <View style={styles.chipRow}>
      {options.map((o) => (
        <Pressable
          key={o}
          onPress={() => onSelect(o)}
          style={[styles.chip, selected === o && styles.chipActive, small && styles.chipSmall]}
        >
          <Text style={[styles.chipText, selected === o && styles.chipTextActive, small && styles.chipTextSmall]}>
            {o}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function FieldLabel({ label }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

export default function AdminAnimalInformationEducationScreen({ navigation }) {
  const route = useRoute();
  const hero = getAdminModuleHeroByRouteName(route.name);
  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);

  // ── Animals list ─────────────────────────────────────────────────────────
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Animal form ───────────────────────────────────────────────────────────
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [animalDraft, setAnimalDraft] = useState(BLANK_ANIMAL);
  const [savingAnimal, setSavingAnimal] = useState(false);
  const [formError, setFormError] = useState('');

  // ── Education CRUD ────────────────────────────────────────────────────────
  const [showEduModal, setShowEduModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [eduList, setEduList] = useState([]);
  const [loadingEdu, setLoadingEdu] = useState(false);
  const [editingEdu, setEditingEdu] = useState(null);
  const [eduDraft, setEduDraft] = useState(BLANK_EDU);
  const [savingEdu, setSavingEdu] = useState(false);
  const [eduError, setEduError] = useState('');

  // ── Quiz CRUD ─────────────────────────────────────────────────────────────
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizList, setQuizList] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizDraft, setQuizDraft] = useState(BLANK_QUIZ);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [quizError, setQuizError] = useState('');

  // ── Did You Know CRUD ─────────────────────────────────────────────────────
  const [showDidYouKnowModal, setShowDidYouKnowModal] = useState(false);
  const [didYouKnowList, setDidYouKnowList] = useState([]);
  const [loadingDidYouKnow, setLoadingDidYouKnow] = useState(false);
  const [editingDidYouKnow, setEditingDidYouKnow] = useState(null);
  const [didYouKnowDraft, setDidYouKnowDraft] = useState(BLANK_DID_YOU_KNOW);
  const [savingDidYouKnow, setSavingDidYouKnow] = useState(false);
  const [didYouKnowError, setDidYouKnowError] = useState('');

  // ── Load animals ──────────────────────────────────────────────────────────
  const loadAnimals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAnimals();
      setAnimals(res.data || []);
    } catch {
      setError('Failed to load animals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAnimals(); }, [loadAnimals]);

  const filteredAnimals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return animals;
    return animals.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.species.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [animals, searchQuery]);

  // ── Animal CRUD ───────────────────────────────────────────────────────────
  const openNewAnimal = () => {
    setEditingAnimal(null);
    setAnimalDraft(BLANK_ANIMAL);
    setFormError('');
    setShowAnimalModal(true);
  };

  const openEditAnimal = (a) => {
    setEditingAnimal(a);
    setAnimalDraft({
      name: a.name || '',
      species: a.species || '',
      category: a.category || 'Mammal',
      description: a.description || '',
      habitat: a.habitat || '',
      diet: a.diet || '',
      lifespan: a.lifespan || '',
      weight: a.weight || '',
      conservationStatus: a.conservationStatus || 'Least Concern',
      funFacts: Array.isArray(a.funFacts) ? a.funFacts.join('\n') : (a.funFacts || ''),
    });
    setFormError('');
    setShowAnimalModal(true);
  };

  const setField = (key, val) => setAnimalDraft((d) => ({ ...d, [key]: val }));

  const handleSaveAnimal = async () => {
    const { name, species, description, habitat, diet, lifespan, weight } = animalDraft;
    if (!name.trim() || !species.trim() || !description.trim() || !habitat.trim() || !diet.trim()) {
      setFormError('Name, species, description, habitat and diet are required.');
      return;
    }
    setSavingAnimal(true);
    setFormError('');
    const payload = {
      ...animalDraft,
      name: animalDraft.name.trim(),
      species: animalDraft.species.trim(),
      lifespan: lifespan.trim() || 'Unknown',
      weight: weight.trim() || 'Unknown',
      funFacts: animalDraft.funFacts
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
    };
    try {
      if (editingAnimal) {
        await updateAnimal(editingAnimal._id, payload);
      } else {
        await createAnimal(payload);
      }
      setShowAnimalModal(false);
      loadAnimals();
    } catch (e) {
      setFormError(e?.response?.data?.message || 'Failed to save animal.');
    } finally {
      setSavingAnimal(false);
    }
  };

  const handleDeleteAnimal = (a) => {
    Alert.alert(
      'Delete Animal',
      `Delete "${a.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAnimal(a._id);
              setAnimals((prev) => prev.filter((x) => x._id !== a._id));
            } catch {
              setError('Failed to delete animal.');
            }
          },
        },
      ]
    );
  };

  // ── Education CRUD ────────────────────────────────────────────────────────
  const openEduModal = async (a) => {
    setSelectedAnimal(a);
    setEduDraft(BLANK_EDU);
    setEditingEdu(null);
    setEduError('');
    setShowEduModal(true);
    setLoadingEdu(true);
    try {
      const res = await fetchEducationByAnimal(a._id);
      setEduList(res.data || []);
    } catch {
      setEduError('Failed to load education content.');
    } finally {
      setLoadingEdu(false);
    }
  };

  const openEditEdu = (e) => {
    setEditingEdu(e);
    setEduDraft({ title: e.title || '', type: e.type || 'article', content: e.content || '', imageUrl: e.imageUrl || '' });
    setEduError('');
  };

  const resetEduForm = () => {
    setEduDraft(BLANK_EDU);
    setEditingEdu(null);
    setEduError('');
  };

  const handleSaveEdu = async () => {
    if (!eduDraft.title.trim() || !eduDraft.content.trim()) {
      setEduError('Title and content are required.');
      return;
    }
    setSavingEdu(true);
    setEduError('');
    const payload = {
      title: eduDraft.title.trim(),
      type: eduDraft.type,
      content: eduDraft.content.trim(),
      imageUrl: eduDraft.imageUrl.trim() || 'https://via.placeholder.com/400',
      animal: selectedAnimal._id,
    };
    try {
      if (editingEdu) {
        await updateEducation(editingEdu._id, payload);
      } else {
        await createEducation(payload);
      }
      resetEduForm();
      const res = await fetchEducationByAnimal(selectedAnimal._id);
      setEduList(res.data || []);
    } catch (e) {
      setEduError(e?.response?.data?.message || 'Failed to save education fact.');
    } finally {
      setSavingEdu(false);
    }
  };

  const handleDeleteEdu = (e) => {
    Alert.alert('Delete Fact', `Delete "${e.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEducation(e._id);
            setEduList((prev) => prev.filter((x) => x._id !== e._id));
          } catch {
            setEduError('Failed to delete education fact.');
          }
        },
      },
    ]);
  };

  // ── Quiz CRUD ─────────────────────────────────────────────────────────────
  const openQuizModal = async (a) => {
    setSelectedAnimal(a);
    setQuizDraft(BLANK_QUIZ);
    setEditingQuiz(null);
    setQuizError('');
    setShowQuizModal(true);
    setLoadingQuiz(true);
    try {
      const res = await getQuizzesByAnimal(a._id);
      setQuizList(res.data || []);
    } catch {
      setQuizError('Failed to load quiz questions.');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const openEditQuiz = (q) => {
    setEditingQuiz(q);
    setQuizDraft({
      question: q.question || '',
      options: q.options?.map((opt) => opt.text) || [],
      correctAnswerIndex: q.correctAnswerIndex || 0,
      explanation: q.explanation || '',
    });
    setQuizError('');
  };

  const resetQuizForm = () => {
    setQuizDraft(BLANK_QUIZ);
    setEditingQuiz(null);
    setQuizError('');
  };

  const addQuizOption = () => {
    setQuizDraft((d) => ({ ...d, options: [...d.options, ''] }));
  };

  const removeQuizOption = (index) => {
    if (quizDraft.options.length > 2) {
      setQuizDraft((d) => ({
        ...d,
        options: d.options.filter((_, i) => i !== index),
        correctAnswerIndex: Math.min(d.correctAnswerIndex, d.options.length - 2),
      }));
    } else {
      Alert.alert('Minimum Options', 'A quiz question must have at least 2 options.');
    }
  };

  const updateQuizOption = (index, text) => {
    setQuizDraft((d) => ({
      ...d,
      options: d.options.map((opt, i) => (i === index ? text : opt)),
    }));
  };

  const handleSaveQuiz = async () => {
    const { question, options, correctAnswerIndex } = quizDraft;
    if (!question.trim()) {
      setQuizError('Question is required.');
      return;
    }
    if (options.some((o) => !o.trim())) {
      setQuizError('All options must be filled.');
      return;
    }
    setSavingQuiz(true);
    setQuizError('');
    const payload = {
      animal: selectedAnimal._id,
      question: question.trim(),
      options: options.map((text) => ({ text: text.trim() })),
      correctAnswerIndex,
      explanation: quizDraft.explanation.trim(),
    };
    try {
      if (editingQuiz) {
        await updateQuiz(editingQuiz._id, payload);
      } else {
        await createQuiz(payload);
      }
      resetQuizForm();
      const res = await getQuizzesByAnimal(selectedAnimal._id);
      setQuizList(res.data || []);
    } catch (e) {
      setQuizError(e?.response?.data?.message || 'Failed to save quiz question.');
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleDeleteQuiz = (q) => {
    Alert.alert('Delete Quiz', `Delete this question?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteQuiz(q._id);
            setQuizList((prev) => prev.filter((x) => x._id !== q._id));
          } catch {
            setQuizError('Failed to delete quiz question.');
          }
        },
      },
    ]);
  };

  // ── Did You Know CRUD ─────────────────────────────────────────────────────
  const openDidYouKnowModal = async (a) => {
    setSelectedAnimal(a);
    setDidYouKnowDraft(BLANK_DID_YOU_KNOW);
    setEditingDidYouKnow(null);
    setDidYouKnowError('');
    setShowDidYouKnowModal(true);
    setLoadingDidYouKnow(true);
    try {
      const res = await getDidYouKnowByAnimal(a._id);
      setDidYouKnowList(res.data || []);
    } catch {
      setDidYouKnowError('Failed to load did you know facts.');
    } finally {
      setLoadingDidYouKnow(false);
    }
  };

  const openEditDidYouKnow = (d) => {
    setEditingDidYouKnow(d);
    setDidYouKnowDraft({ fact: d.fact || '', source: d.source || '' });
    setDidYouKnowError('');
  };

  const resetDidYouKnowForm = () => {
    setDidYouKnowDraft(BLANK_DID_YOU_KNOW);
    setEditingDidYouKnow(null);
    setDidYouKnowError('');
  };

  const handleSaveDidYouKnow = async () => {
    if (!didYouKnowDraft.fact.trim()) {
      setDidYouKnowError('Fact is required.');
      return;
    }
    setSavingDidYouKnow(true);
    setDidYouKnowError('');
    const payload = {
      animal: selectedAnimal._id,
      fact: didYouKnowDraft.fact.trim(),
      source: didYouKnowDraft.source.trim(),
    };
    try {
      if (editingDidYouKnow) {
        await updateDidYouKnow(editingDidYouKnow._id, payload);
      } else {
        await createDidYouKnow(payload);
      }
      resetDidYouKnowForm();
      const res = await getDidYouKnowByAnimal(selectedAnimal._id);
      setDidYouKnowList(res.data || []);
    } catch (e) {
      setDidYouKnowError(e?.response?.data?.message || 'Failed to save did you know fact.');
    } finally {
      setSavingDidYouKnow(false);
    }
  };

  const handleDeleteDidYouKnow = (d) => {
    Alert.alert('Delete Fact', `Delete this fact?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDidYouKnow(d._id);
            setDidYouKnowList((prev) => prev.filter((x) => x._id !== d._id));
          } catch {
            setDidYouKnowError('Failed to delete did you know fact.');
          }
        },
      },
    ]);
  };

  return (
    <AccountDrawerLayout headerTitle="Admin" drawerMenuItems={drawerMenuItems}>
      <StatusBar style="dark" />

      {/* Hero */}
      {hero && (
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{hero.title}</Text>
          <Text style={styles.heroSub}>{hero.subtitle}</Text>
        </View>
      )}

      {/* Add button + search */}
      <PrimaryButton title="＋ Add New Animal" onPress={openNewAnimal} style={styles.addBtn} />
      <TextField
        label="Search animals"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Name, species or category…"
        autoCorrect={false}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {loading ? <Text style={styles.hint}>Loading animals…</Text> : null}

      {/* Animals list */}
      {filteredAnimals.map((a) => (
        <View key={a._id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{a.name}</Text>
              <Text style={styles.cardSpecies}>{a.species}</Text>
            </View>
            <View style={[styles.categoryBadge]}>
              <Text style={styles.categoryBadgeText}>{a.category}</Text>
            </View>
          </View>
          <Text style={styles.cardDesc} numberOfLines={2}>{a.description}</Text>
          <View style={styles.cardMeta}>
            {a.conservationStatus ? (
              <Text style={styles.cardMetaItem}>🔖 {a.conservationStatus}</Text>
            ) : null}
            {a.habitat ? <Text style={styles.cardMetaItem}>🌍 {a.habitat}</Text> : null}
          </View>
          <View style={styles.cardActions}>
            <Pressable onPress={() => openEditAnimal(a)} style={styles.actionBtn}>
              <Text style={styles.actionEdit}>✏ Edit</Text>
            </Pressable>
            <Pressable onPress={() => openEduModal(a)} style={styles.actionBtn}>
              <Text style={styles.actionEdu}>📚 Education</Text>
            </Pressable>
            <Pressable onPress={() => openQuizModal(a)} style={styles.actionBtn}>
              <Text style={styles.actionQuiz}>❓ Quiz</Text>
            </Pressable>
            <Pressable onPress={() => openDidYouKnowModal(a)} style={styles.actionBtn}>
              <Text style={styles.actionDidYouKnow}>💡 Facts</Text>
            </Pressable>
            <Pressable onPress={() => handleDeleteAnimal(a)} style={styles.actionBtn}>
              <Text style={styles.actionDelete}>🗑 Delete</Text>
            </Pressable>
          </View>
        </View>
      ))}

      {!loading && filteredAnimals.length === 0 && searchQuery ? (
        <Text style={styles.hint}>No animals match "{searchQuery}".</Text>
      ) : null}

      {/* ── Animal Form Modal ────────────────────────────────────────────── */}
      <Modal visible={showAnimalModal} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>{editingAnimal ? 'Edit Animal' : 'Add Animal'}</Text>

          {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

          <TextField label="Name *" value={animalDraft.name} onChangeText={(v) => setField('name', v)} />
          <TextField label="Species *" value={animalDraft.species} onChangeText={(v) => setField('species', v)} />
          <TextField label="Description *" value={animalDraft.description} onChangeText={(v) => setField('description', v)} multiline />
          <TextField label="Habitat *" value={animalDraft.habitat} onChangeText={(v) => setField('habitat', v)} />
          <TextField label="Diet *" value={animalDraft.diet} onChangeText={(v) => setField('diet', v)} />
          <TextField label="Lifespan (e.g. 15 years)" value={animalDraft.lifespan} onChangeText={(v) => setField('lifespan', v)} />
          <TextField label="Weight (e.g. 200 kg)" value={animalDraft.weight} onChangeText={(v) => setField('weight', v)} />

          <FieldLabel label="Category *" />
          <ChipRow options={CATEGORIES} selected={animalDraft.category} onSelect={(v) => setField('category', v)} small />

          <FieldLabel label="Conservation Status *" />
          <ChipRow options={CONSERVATION_STATUSES} selected={animalDraft.conservationStatus} onSelect={(v) => setField('conservationStatus', v)} small />

          <FieldLabel label="Fun Facts (one per line)" />
          <TextInput
            style={styles.funFactsInput}
            value={animalDraft.funFacts}
            onChangeText={(v) => setField('funFacts', v)}
            multiline
            numberOfLines={4}
            placeholder="Enter each fun fact on a new line…"
            placeholderTextColor={theme.colors.accentGreen + '99'}
          />

          <PrimaryButton
            title={savingAnimal ? 'Saving…' : editingAnimal ? 'Update Animal' : 'Create Animal'}
            onPress={handleSaveAnimal}
            loading={savingAnimal}
            style={styles.saveBtn}
          />
          <PrimaryButton title="Cancel" variant="secondary" onPress={() => setShowAnimalModal(false)} />
        </ScrollView>
      </Modal>

      {/* ── Education Modal ──────────────────────────────────────────────── */}
      <Modal visible={showEduModal} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>📚 Education</Text>
          <Text style={styles.modalSubTitle}>{selectedAnimal?.name}</Text>

          {/* Education form */}
          <View style={styles.eduFormCard}>
            <Text style={styles.sectionHeading}>{editingEdu ? 'Edit Fact' : 'Add New Fact'}</Text>
            {eduError ? <Text style={styles.errorText}>{eduError}</Text> : null}

            <TextField label="Title *" value={eduDraft.title} onChangeText={(v) => setEduDraft((d) => ({ ...d, title: v }))} />

            <FieldLabel label="Type" />
            <ChipRow
              options={EDU_TYPES}
              selected={eduDraft.type}
              onSelect={(v) => setEduDraft((d) => ({ ...d, type: v }))}
              small
            />

            <TextField
              label="Content *"
              value={eduDraft.content}
              onChangeText={(v) => setEduDraft((d) => ({ ...d, content: v }))}
              multiline
            />
            <TextField
              label="Image URL (optional)"
              value={eduDraft.imageUrl}
              onChangeText={(v) => setEduDraft((d) => ({ ...d, imageUrl: v }))}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <PrimaryButton
              title={savingEdu ? 'Saving…' : editingEdu ? 'Update Fact' : 'Add Fact'}
              onPress={handleSaveEdu}
              loading={savingEdu}
              style={styles.saveBtn}
            />
            {editingEdu ? (
              <PrimaryButton title="Cancel Edit" variant="secondary" onPress={resetEduForm} />
            ) : null}
          </View>

          {/* Existing facts */}
          <Text style={styles.sectionHeading}>
            Existing Facts ({eduList.length})
          </Text>
          {loadingEdu ? (
            <Text style={styles.hint}>Loading…</Text>
          ) : eduList.length === 0 ? (
            <Text style={styles.hint}>No education facts yet. Add one above!</Text>
          ) : (
            eduList.map((e) => (
              <View key={e._id} style={styles.eduCard}>
                <View style={styles.eduCardHeader}>
                  <View style={styles.eduTypeBadge}>
                    <Text style={styles.eduTypeBadgeText}>{e.type}</Text>
                  </View>
                  <Text style={styles.eduCardTitle} numberOfLines={1}>{e.title}</Text>
                </View>
                <Text style={styles.eduCardContent} numberOfLines={3}>{e.content}</Text>
                <View style={styles.eduCardActions}>
                  <Pressable onPress={() => openEditEdu(e)} style={styles.actionBtn}>
                    <Text style={styles.actionEdit}>✏ Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDeleteEdu(e)} style={styles.actionBtn}>
                    <Text style={styles.actionDelete}>🗑 Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}

          <PrimaryButton title="Close" variant="secondary" onPress={() => setShowEduModal(false)} style={{ marginTop: 16 }} />
        </ScrollView>
      </Modal>

      {/* ── Quiz Modal ───────────────────────────────────────────────────── */}
      <Modal visible={showQuizModal} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>❓ Quiz Questions</Text>
          <Text style={styles.modalSubTitle}>{selectedAnimal?.name}</Text>

          {/* Quiz form */}
          <View style={styles.eduFormCard}>
            <Text style={styles.sectionHeading}>{editingQuiz ? 'Edit Question' : 'Add New Question'}</Text>
            {quizError ? <Text style={styles.errorText}>{quizError}</Text> : null}

            <TextField
              label="Question *"
              value={quizDraft.question}
              onChangeText={(v) => setQuizDraft((d) => ({ ...d, question: v }))}
              multiline
            />

            <Text style={styles.fieldLabel}>Options ({quizDraft.options.length})</Text>
            {quizDraft.options.map((opt, idx) => (
              <View key={idx} style={styles.optionInputRow}>
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>{String.fromCharCode(65 + idx)}</Text>
                </View>
                <TextInput
                  style={styles.optionInput}
                  value={opt}
                  onChangeText={(v) => updateQuizOption(idx, v)}
                  placeholder={`Option ${idx + 1}`}
                  placeholderTextColor={theme.colors.accentGreen + '99'}
                />
                <Pressable onPress={() => removeQuizOption(idx)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </Pressable>
              </View>
            ))}
            <PrimaryButton
              title="＋ Add Option"
              onPress={addQuizOption}
              variant={quizDraft.options.length >= 6 ? 'disabled' : 'primary'}
              style={styles.addOptionBtn}
            />

            <FieldLabel label="Correct Answer" />
            <ChipRow
              options={quizDraft.options.map((_, i) => String.fromCharCode(65 + i))}
              selected={String.fromCharCode(65 + quizDraft.correctAnswerIndex)}
              onSelect={(v) => setQuizDraft((d) => ({ ...d, correctAnswerIndex: v.charCodeAt(0) - 65 }))}
              small
            />

            <TextField
              label="Explanation (optional)"
              value={quizDraft.explanation}
              onChangeText={(v) => setQuizDraft((d) => ({ ...d, explanation: v }))}
              multiline
            />
            <PrimaryButton
              title={savingQuiz ? 'Saving…' : editingQuiz ? 'Update Question' : 'Add Question'}
              onPress={handleSaveQuiz}
              loading={savingQuiz}
              style={styles.saveBtn}
            />
            {editingQuiz ? (
              <PrimaryButton title="Cancel Edit" variant="secondary" onPress={resetQuizForm} />
            ) : null}
          </View>

          {/* Existing questions */}
          <Text style={styles.sectionHeading}>
            Questions ({quizList.length})
          </Text>
          {loadingQuiz ? (
            <Text style={styles.hint}>Loading…</Text>
          ) : quizList.length === 0 ? (
            <Text style={styles.hint}>No quiz questions yet. Add one above!</Text>
          ) : (
            quizList.map((q, idx) => (
              <View key={q._id} style={styles.quizCard}>
                <View style={styles.quizCardHeader}>
                  <Text style={styles.quizNumber}>Q{idx + 1}</Text>
                  <Text style={styles.quizCardTitle} numberOfLines={2}>{q.question}</Text>
                </View>
                <View style={styles.optionsList}>
                  {q.options.map((opt, optIdx) => (
                    <Text
                      key={optIdx}
                      style={[
                        styles.optionText,
                        optIdx === q.correctAnswerIndex && styles.optionTextCorrect,
                      ]}
                    >
                      {String.fromCharCode(65 + optIdx)}) {opt.text} {optIdx === q.correctAnswerIndex && '✓'}
                    </Text>
                  ))}
                </View>
                {q.explanation ? (
                  <Text style={styles.explanationText}>
                    <Text style={styles.explanationLabel}>Explanation: </Text>
                    {q.explanation}
                  </Text>
                ) : null}
                <View style={styles.quizCardActions}>
                  <Pressable onPress={() => openEditQuiz(q)} style={styles.actionBtn}>
                    <Text style={styles.actionEdit}>✏ Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDeleteQuiz(q)} style={styles.actionBtn}>
                    <Text style={styles.actionDelete}>🗑 Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}

          <PrimaryButton title="Close" variant="secondary" onPress={() => setShowQuizModal(false)} style={{ marginTop: 16 }} />
        </ScrollView>
      </Modal>

      {/* ── Did You Know Modal ───────────────────────────────────────────── */}
      <Modal visible={showDidYouKnowModal} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>💡 Did You Know?</Text>
          <Text style={styles.modalSubTitle}>{selectedAnimal?.name}</Text>

          {/* Did You Know form */}
          <View style={styles.eduFormCard}>
            <Text style={styles.sectionHeading}>{editingDidYouKnow ? 'Edit Fact' : 'Add New Fact'}</Text>
            {didYouKnowError ? <Text style={styles.errorText}>{didYouKnowError}</Text> : null}

            <TextField
              label="Fact *"
              value={didYouKnowDraft.fact}
              onChangeText={(v) => setDidYouKnowDraft((d) => ({ ...d, fact: v }))}
              multiline
              placeholder="Enter an interesting fact about the animal…"
            />

            <TextField
              label="Source (optional)"
              value={didYouKnowDraft.source}
              onChangeText={(v) => setDidYouKnowDraft((d) => ({ ...d, source: v }))}
              placeholder="e.g., National Geographic, Wikipedia…"
            />

            <PrimaryButton
              title={savingDidYouKnow ? 'Saving…' : editingDidYouKnow ? 'Update Fact' : 'Add Fact'}
              onPress={handleSaveDidYouKnow}
              loading={savingDidYouKnow}
              style={styles.saveBtn}
            />
            {editingDidYouKnow ? (
              <PrimaryButton title="Cancel Edit" variant="secondary" onPress={resetDidYouKnowForm} />
            ) : null}
          </View>

          {/* Existing facts */}
          <Text style={styles.sectionHeading}>
            Facts ({didYouKnowList.length})
          </Text>
          {loadingDidYouKnow ? (
            <Text style={styles.hint}>Loading…</Text>
          ) : didYouKnowList.length === 0 ? (
            <Text style={styles.hint}>No facts yet. Add one above!</Text>
          ) : (
            didYouKnowList.map((d) => (
              <View key={d._id} style={styles.factCard}>
                <Text style={styles.factText}>{d.fact}</Text>
                {d.source ? (
                  <Text style={styles.sourceText}>Source: {d.source}</Text>
                ) : null}
                <View style={styles.factCardActions}>
                  <Pressable onPress={() => openEditDidYouKnow(d)} style={styles.actionBtn}>
                    <Text style={styles.actionEdit}>✏ Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDeleteDidYouKnow(d)} style={styles.actionBtn}>
                    <Text style={styles.actionDelete}>🗑 Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}

          <PrimaryButton title="Close" variant="secondary" onPress={() => setShowDidYouKnowModal(false)} style={{ marginTop: 16 }} />
        </ScrollView>
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
    marginBottom: theme.spacing.md,
  },
  heroTitle: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.colors.linkGreen },
  heroSub: { marginTop: 4, fontSize: theme.fontSize.sm, color: theme.colors.accentGreen },
  addBtn: { marginBottom: theme.spacing.sm },
  errorText: { color: theme.colors.error || '#d9534f', marginVertical: 8, fontSize: theme.fontSize.sm },
  hint: { color: theme.colors.primaryText, opacity: 0.6, marginVertical: 8, fontSize: theme.fontSize.sm, fontStyle: 'italic' },

  // Animal cards
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accentGreen,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1, marginRight: 8 },
  cardName: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.primaryText },
  cardSpecies: { fontSize: theme.fontSize.sm, fontStyle: 'italic', color: theme.colors.primaryText, opacity: 0.7, marginTop: 2 },
  categoryBadge: {
    backgroundColor: theme.colors.sageButton || '#e8f5e9',
    borderRadius: theme.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  categoryBadgeText: { fontSize: 11, fontWeight: '700', color: theme.colors.linkGreen },
  cardDesc: { marginTop: 6, fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.8, lineHeight: 20 },
  cardMeta: { flexDirection: 'row', gap: 12, marginTop: 6, flexWrap: 'wrap' },
  cardMetaItem: { fontSize: 12, color: theme.colors.primaryText, opacity: 0.65 },
  cardActions: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border },
  actionBtn: { paddingVertical: 4 },
  actionEdit: { color: theme.colors.linkGreen, fontWeight: '700', fontSize: theme.fontSize.sm },
  actionEdu: { color: '#6366f1', fontWeight: '700', fontSize: theme.fontSize.sm },
  actionDelete: { color: theme.colors.error || '#d9534f', fontWeight: '700', fontSize: theme.fontSize.sm },

  // Modals
  modalContent: { padding: theme.spacing.lg, paddingBottom: 60 },
  modalTitle: { fontSize: theme.fontSize.hero, fontWeight: '800', color: theme.colors.primaryText, marginBottom: 4 },
  modalSubTitle: { fontSize: theme.fontSize.lg, fontWeight: '600', color: theme.colors.accentGreen, marginBottom: theme.spacing.lg },
  sectionHeading: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.colors.primaryText, marginBottom: theme.spacing.sm, marginTop: theme.spacing.sm },
  fieldLabel: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.primaryText, marginBottom: 6, marginTop: theme.spacing.sm },
  saveBtn: { marginBottom: theme.spacing.sm },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: theme.spacing.sm },
  chip: { borderRadius: theme.radii.pill, borderWidth: 1, borderColor: theme.colors.border, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: theme.colors.white },
  chipActive: { backgroundColor: theme.colors.sageButton || '#e8f5e9', borderColor: theme.colors.accentGreen },
  chipSmall: { paddingVertical: 5, paddingHorizontal: 10 },
  chipText: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.primaryText },
  chipTextActive: { color: theme.colors.linkGreen },
  chipTextSmall: { fontSize: 12 },

  // Fun facts input
  funFactsInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm,
    minHeight: 90,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },

  // Education form card
  eduFormCard: {
    backgroundColor: theme.colors.welcomeBackground || '#f0faf0',
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.sage || '#a5d6a7',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },

  // Education list cards
  eduCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  eduCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  eduTypeBadge: {
    backgroundColor: '#ede9fe',
    borderRadius: theme.radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  eduTypeBadgeText: { fontSize: 11, fontWeight: '700', color: '#6366f1', textTransform: 'uppercase' },
  eduCardTitle: { flex: 1, fontSize: theme.fontSize.body, fontWeight: '700', color: theme.colors.primaryText },
  eduCardContent: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.75, lineHeight: 20 },
  eduCardActions: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border },

  // Action buttons
  actionQuiz: { color: '#f59e0b', fontWeight: '700', fontSize: theme.fontSize.sm },
  actionDidYouKnow: { color: '#a855f7', fontWeight: '700', fontSize: theme.fontSize.sm },

  // Quiz styles
  optionInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  optionLetter: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.sageButton || '#e8f5e9', justifyContent: 'center', alignItems: 'center' },
  optionLetterText: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.linkGreen },
  optionInput: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.sm, paddingHorizontal: 10, paddingVertical: 8, fontSize: theme.fontSize.sm, color: theme.colors.primaryText },
  removeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.error || '#d9534f', justifyContent: 'center', alignItems: 'center', opacity: 0.7 },
  removeBtnText: { fontSize: 18, color: theme.colors.white, fontWeight: '700' },
  addOptionBtn: { marginBottom: theme.spacing.md },

  quizCard: { backgroundColor: theme.colors.white, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  quizCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  quizNumber: { backgroundColor: '#f59e0b', borderRadius: theme.radii.pill, paddingHorizontal: 8, paddingVertical: 4, fontSize: 11, fontWeight: '700', color: theme.colors.white },
  quizCardTitle: { flex: 1, fontSize: theme.fontSize.body, fontWeight: '700', color: theme.colors.primaryText },
  optionsList: { marginVertical: 8 },
  optionText: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, lineHeight: 20, marginVertical: 2 },
  optionTextCorrect: { color: theme.colors.linkGreen, fontWeight: '700' },
  explanationText: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, backgroundColor: '#fffbeb', padding: 8, borderRadius: theme.radii.sm, marginTop: 8, lineHeight: 18 },
  explanationLabel: { fontWeight: '700', color: '#92400e' },
  quizCardActions: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border },

  // Did You Know styles
  factCard: { backgroundColor: theme.colors.white, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, marginBottom: theme.spacing.sm, borderLeftWidth: 4, borderLeftColor: '#a855f7' },
  factText: { fontSize: theme.fontSize.body, color: theme.colors.primaryText, lineHeight: 22 },
  sourceText: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.6, marginTop: 8, fontStyle: 'italic' },
  factCardActions: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border },
});
