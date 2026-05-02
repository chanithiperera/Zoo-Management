import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import PrimaryButton from '../../components/ui/PrimaryButton';
import TextField from '../../components/ui/TextField';
import { theme } from '../../constants/theme';
import { fetchAnimals, createAnimal, updateAnimal, deleteAnimal } from '../../api/animalsApi';
import { fetchEducationByAnimal, createEducation, updateEducation, deleteEducation } from '../../api/education.api';
import { getAdminDrawerMenuItems, getAdminModuleHeroByRouteName } from './adminNavigation';

export default function AdminAnimalInformationEducationScreen({ navigation }) {
  const route = useRoute();
  const hero = getAdminModuleHeroByRouteName(route.name);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Animal Form State
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [animalName, setAnimalName] = useState('');
  const [species, setSpecies] = useState('');
  const [category, setCategory] = useState('Mammal');
  const [description, setDescription] = useState('');
  const [habitat, setHabitat] = useState('');
  const [diet, setDiet] = useState('');
  const [savingAnimal, setSavingAnimal] = useState(false);

  // Education State
  const [educationContent, setEducationContent] = useState([]);
  const [loadingEdu, setLoadingEdu] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);
  const [eduTitle, setEduTitle] = useState('');
  const [eduType, setEduType] = useState('article');
  const [eduContent, setEduContent] = useState('');
  const [eduImageUrl, setEduImageUrl] = useState('');
  const [selectedEduItem, setSelectedEduItem] = useState(null);
  const [savingEdu, setSavingEdu] = useState(false);

  const loadAnimals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAnimals();
      setAnimals(res.data || []);
    } catch (e) {
      setError('Failed to load animals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAnimals(); }, [loadAnimals]);

  const filteredAnimals = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return animals.filter(a => a.name.toLowerCase().includes(q) || a.species.toLowerCase().includes(q));
  }, [animals, searchQuery]);

  const handleSaveAnimal = async () => {
    if (!animalName || !species || !description) return setError('Please fill required fields');
    setSavingAnimal(true);
    const data = { name: animalName, species, category, description, habitat, diet };
    try {
      if (selectedAnimal) {
        await updateAnimal(selectedAnimal._id, data);
      } else {
        await createAnimal(data);
      }
      setShowAnimalForm(false);
      loadAnimals();
    } catch (e) {
      setError('Failed to save animal');
    } finally {
      setSavingAnimal(false);
    }
  };

  const openAnimalForm = (a = null) => {
    setSelectedAnimal(a);
    setAnimalName(a?.name || '');
    setSpecies(a?.species || '');
    setCategory(a?.category || 'Mammal');
    setDescription(a?.description || '');
    setHabitat(a?.habitat || '');
    setDiet(a?.diet || '');
    setShowAnimalForm(true);
  };

  const manageEducation = async (a) => {
    setSelectedAnimal(a);
    setLoadingEdu(true);
    try {
      const res = await fetchEducationByAnimal(a._id);
      setEducationContent(res.data || []);
      setShowEduForm(true);
    } catch (e) {
      setError('Failed to load education');
    } finally {
      setLoadingEdu(false);
    }
  };

  const handleSaveEdu = async () => {
    if (!eduTitle || !eduContent) return;
    setSavingEdu(true);
    const data = { title: eduTitle, type: eduType, content: eduContent, imageUrl: eduImageUrl || 'https://via.placeholder.com/400', animal: selectedAnimal._id };
    try {
      if (selectedEduItem) {
        await updateEducation(selectedEduItem._id, data);
      } else {
        await createEducation(data);
      }
      manageEducation(selectedAnimal);
      resetEduForm();
    } catch (e) {
      setError('Failed to save education');
    } finally {
      setSavingEdu(false);
    }
  };

  const resetEduForm = () => {
    setEduTitle('');
    setEduContent('');
    setEduImageUrl('');
    setSelectedEduItem(null);
  };

  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);

  return (
    <AccountDrawerLayout headerTitle="Admin" drawerMenuItems={drawerMenuItems}>
      <StatusBar style="dark" />
      {hero && (
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{hero.title}</Text>
          <Text style={styles.heroSub}>{hero.subtitle}</Text>
        </View>
      )}

      <PrimaryButton title="Add New Animal" onPress={() => openAnimalForm()} style={styles.addBtn} />

      <TextField label="Search Animals" value={searchQuery} onChangeText={setSearchQuery} placeholder="Filter by name or species..." />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView style={styles.list}>
        {filteredAnimals.map(a => (
          <View key={a._id} style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{a.name}</Text>
              <Text style={styles.cardSpecies}>{a.species}</Text>
            </View>
            <View style={styles.cardActions}>
              <Pressable onPress={() => openAnimalForm(a)} style={styles.actionBtn}>
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => manageEducation(a)} style={styles.actionBtn}>
                <Text style={styles.actionText}>Education</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Animal Form Modal */}
      <Modal visible={showAnimalForm} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>{selectedAnimal ? 'Edit Animal' : 'Add Animal'}</Text>
          <TextField label="Name" value={animalName} onChangeText={setAnimalName} />
          <TextField label="Species" value={species} onChangeText={setSpecies} />
          <TextField label="Description" value={description} onChangeText={setDescription} multiline />
          <TextField label="Habitat" value={habitat} onChangeText={setHabitat} />
          <TextField label="Diet" value={diet} onChangeText={setDiet} />
          <PrimaryButton title={savingAnimal ? 'Saving...' : 'Save Animal'} onPress={handleSaveAnimal} loading={savingAnimal} />
          <PrimaryButton title="Cancel" variant="secondary" onPress={() => setShowAnimalForm(false)} />
        </ScrollView>
      </Modal>

      {/* Education Management Modal */}
      <Modal visible={showEduForm} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Education: {selectedAnimal?.name}</Text>
          
          <View style={styles.eduForm}>
            <TextField label="Fact Title" value={eduTitle} onChangeText={setEduTitle} />
            <TextField label="Content" value={eduContent} onChangeText={setEduContent} multiline />
            <TextField label="Image URL" value={eduImageUrl} onChangeText={setEduImageUrl} />
            <PrimaryButton title={selectedEduItem ? "Update Fact" : "Add Fact"} onPress={handleSaveEdu} loading={savingEdu} />
            {selectedEduItem && <PrimaryButton title="Cancel Edit" variant="secondary" onPress={resetEduForm} />}
          </View>

          <Text style={styles.eduListTitle}>Existing Content</Text>
          {loadingEdu ? <Text>Loading...</Text> : educationContent.map(e => (
            <View key={e._id} style={styles.eduCard}>
              <Text style={styles.eduCardTitle}>{e.title}</Text>
              <View style={styles.eduActions}>
                <Pressable onPress={() => {
                  setSelectedEduItem(e);
                  setEduTitle(e.title);
                  setEduContent(e.content);
                  setEduImageUrl(e.imageUrl);
                }}><Text style={styles.actionText}>Edit</Text></Pressable>
                <Pressable onPress={async () => {
                  await deleteEducation(e._id);
                  manageEducation(selectedAnimal);
                }}><Text style={[styles.actionText, {color: 'red'}]}>Delete</Text></Pressable>
              </View>
            </View>
          ))}
          <PrimaryButton title="Close" variant="secondary" onPress={() => setShowEduForm(false)} />
        </ScrollView>
      </Modal>
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: theme.colors.welcomeBackground, padding: theme.spacing.md, borderRadius: theme.radii.md, marginBottom: theme.spacing.md },
  heroTitle: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.colors.linkGreen },
  heroSub: { fontSize: theme.fontSize.sm, color: theme.colors.accentGreen },
  addBtn: { marginBottom: theme.spacing.md },
  list: { flex: 1 },
  card: { backgroundColor: 'white', padding: theme.spacing.md, borderRadius: theme.radii.md, marginBottom: theme.spacing.sm, borderLeftWidth: 4, borderLeftColor: theme.colors.accentGreen },
  cardName: { fontSize: theme.fontSize.lg, fontWeight: '700' },
  cardSpecies: { fontSize: theme.fontSize.sm, fontStyle: 'italic', opacity: 0.7 },
  cardActions: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm },
  actionText: { color: theme.colors.linkGreen, fontWeight: '700' },
  modalContent: { padding: theme.spacing.lg },
  modalTitle: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  error: { color: 'red', marginBottom: 10 },
  eduForm: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 20 },
  eduListTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  eduCard: { backgroundColor: 'white', padding: 10, borderRadius: 5, marginBottom: 5, flexDirection: 'row', justifyContent: 'space-between' },
  eduCardTitle: { fontWeight: '600' },
  eduActions: { flexDirection: 'row', gap: 10 }
});
