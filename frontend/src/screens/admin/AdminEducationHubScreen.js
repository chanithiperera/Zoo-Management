import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../../constants/theme';
import PrimaryButton from '../../components/ui/PrimaryButton';
import TextField from '../../components/ui/TextField';
import { fetchEducationByAnimal, createEducation, updateEducation, deleteEducation } from '../../api/education.api';
import { getQuizzesByAnimal, createQuiz, updateQuiz, deleteQuiz } from '../../api/quiz.api';
import { getLifeCyclesByAnimal, createLifeCycle, updateLifeCycle, deleteLifeCycle } from '../../api/lifecycle.api';
import { getDidYouKnowByAnimal, createDidYouKnow, updateDidYouKnow, deleteDidYouKnow } from '../../api/didyouknow.api';
import { popOrParentGoBack } from '../../utils/popOrParentGoBack';

const TABS = ['Facts', 'Quiz', 'Life Cycle', 'Did You Know'];
const EDU_TYPES = ['article', 'video', 'activity', 'game', 'quiz'];

function TabBar({ active, onChange }) {
  return (
    <View style={s.tabBar}>
      {TABS.map(t => (
        <Pressable key={t} onPress={() => onChange(t)} style={[s.tab, active === t && s.tabActive]}>
          <Text style={[s.tabText, active === t && s.tabTextActive]}>{t}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ChipRow({ options, selected, onSelect }) {
  return (
    <View style={s.chipRow}>
      {options.map(o => (
        <Pressable key={String(o)} onPress={() => onSelect(o)} style={[s.chip, selected === o && s.chipActive]}>
          <Text style={[s.chipText, selected === o && s.chipTextActive]}>{String(o)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── FACTS TAB ───────────────────────────────────────────────────────────────
function FactsTab({ animalId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('article');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetchEducationByAnimal(animalId); setList(r.data || []); }
    catch { setErr('Failed to load facts.'); }
    finally { setLoading(false); }
  }, [animalId]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setTitle(''); setType('article'); setContent(''); setImageUrl(''); setErr(''); setShowModal(true); };
  const openEdit = (e) => { setEditing(e); setTitle(e.title); setType(e.type); setContent(e.content); setImageUrl(e.imageUrl || ''); setErr(''); setShowModal(true); };

  const save = async () => {
    if (!title.trim() || !content.trim()) { setErr('Title and content required.'); return; }
    setSaving(true); setErr('');
    const payload = { title: title.trim(), type, content: content.trim(), imageUrl: imageUrl.trim() || 'https://via.placeholder.com/400', animal: animalId };
    try {
      if (editing) await updateEducation(editing._id, payload);
      else await createEducation(payload);
      setShowModal(false); load();
    } catch (e) { setErr(e?.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const del = (e) => Alert.alert('Delete', `Delete "${e.title}"?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await deleteEducation(e._id); load(); } },
  ]);

  return (
    <View>
      <PrimaryButton title="＋ Add Fact" onPress={openNew} style={{ marginBottom: 12 }} />
      {loading ? <Text style={s.hint}>Loading…</Text> : null}
      {list.map(e => (
        <View key={e._id} style={s.card}>
          <View style={s.row}><View style={s.typePill}><Text style={s.typePillText}>{e.type}</Text></View><Text style={s.cardTitle} numberOfLines={1}>{e.title}</Text></View>
          <Text style={s.cardBody} numberOfLines={3}>{e.content}</Text>
          <View style={s.actions}><Pressable onPress={() => openEdit(e)}><Text style={s.actEdit}>✏ Edit</Text></Pressable><Pressable onPress={() => del(e)}><Text style={s.actDel}>🗑 Delete</Text></Pressable></View>
        </View>
      ))}
      {!loading && list.length === 0 && <Text style={s.hint}>No facts yet.</Text>}
      <Modal visible={showModal} animationType="slide">
        <ScrollView contentContainerStyle={s.modal} keyboardShouldPersistTaps="handled">
          <Text style={s.modalTitle}>{editing ? 'Edit Fact' : 'Add Fact'}</Text>
          {err ? <Text style={s.errText}>{err}</Text> : null}
          <TextField label="Title *" value={title} onChangeText={setTitle} />
          <Text style={s.label}>Type</Text><ChipRow options={EDU_TYPES} selected={type} onSelect={setType} />
          <TextField label="Content *" value={content} onChangeText={setContent} multiline />
          <TextField label="Image URL" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" />
          <PrimaryButton title={saving ? 'Saving…' : editing ? 'Update' : 'Add'} onPress={save} loading={saving} style={{ marginBottom: 8 }} />
          <PrimaryButton title="Cancel" variant="secondary" onPress={() => setShowModal(false)} />
        </ScrollView>
      </Modal>
    </View>
  );
}

// ─── QUIZ TAB ────────────────────────────────────────────────────────────────
const BLANK_QUIZ = { question: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' };

function QuizTab({ animalId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(BLANK_QUIZ);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await getQuizzesByAnimal(animalId); setList(r.data || []); }
    catch { setErr('Failed to load quizzes.'); }
    finally { setLoading(false); }
  }, [animalId]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setDraft(BLANK_QUIZ); setErr(''); setShowModal(true); };
  const openEdit = (q) => {
    setEditing(q);
    setDraft({ question: q.question, options: q.options.map(o => o.text || o), correctAnswerIndex: q.correctAnswerIndex, explanation: q.explanation || '' });
    setErr(''); setShowModal(true);
  };

  const setOpt = (i, v) => setDraft(d => { const opts = [...d.options]; opts[i] = v; return { ...d, options: opts }; });

  const save = async () => {
    const filledOpts = draft.options.filter(o => (o || '').trim());
    if (!draft.question.trim() || filledOpts.length < 2) { setErr('Question and at least 2 options required.'); return; }
    setSaving(true); setErr('');
    const payload = {
      animal: animalId,
      question: draft.question.trim(),
      options: draft.options.filter(o => (o || '').trim()).map(o => ({ text: o.trim() })),
      correctAnswerIndex: draft.correctAnswerIndex,
      explanation: draft.explanation.trim(),
    };
    try {
      if (editing) await updateQuiz(editing._id, payload);
      else await createQuiz(payload);
      setShowModal(false); load();
    } catch (e) { setErr(e?.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const del = (q) => Alert.alert('Delete', `Delete this question?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await deleteQuiz(q._id); load(); } },
  ]);

  return (
    <View>
      <PrimaryButton title="＋ Add Quiz Question" onPress={openNew} style={{ marginBottom: 12 }} />
      {loading ? <Text style={s.hint}>Loading…</Text> : null}
      {list.map((q, qi) => (
        <View key={q._id} style={s.card}>
          <Text style={s.cardTitle}>Q{qi + 1}: {q.question}</Text>
          {q.options.map((o, i) => (
            <Text key={i} style={[s.cardBody, i === q.correctAnswerIndex && { color: '#16a34a', fontWeight: '700' }]}>
              {i === q.correctAnswerIndex ? '✓ ' : '  '}{o.text || o}
            </Text>
          ))}
          {q.explanation ? <Text style={s.cardBody}>💡 {q.explanation}</Text> : null}
          <View style={s.actions}><Pressable onPress={() => openEdit(q)}><Text style={s.actEdit}>✏ Edit</Text></Pressable><Pressable onPress={() => del(q)}><Text style={s.actDel}>🗑 Delete</Text></Pressable></View>
        </View>
      ))}
      {!loading && list.length === 0 && <Text style={s.hint}>No quiz questions yet.</Text>}

      <Modal visible={showModal} animationType="slide">
        <ScrollView contentContainerStyle={s.modal} keyboardShouldPersistTaps="handled">
          <Text style={s.modalTitle}>{editing ? 'Edit Question' : 'Add Question'}</Text>
          {err ? <Text style={s.errText}>{err}</Text> : null}
          <TextField label="Question *" value={draft.question} onChangeText={v => setDraft(d => ({ ...d, question: v }))} multiline />
          <Text style={s.label}>Options (tap to mark correct answer)</Text>
          {draft.options.map((o, i) => (
            <View key={i} style={[s.optRow, draft.correctAnswerIndex === i && s.optRowCorrect]}>
              <Pressable onPress={() => setDraft(d => ({ ...d, correctAnswerIndex: i }))} style={s.optCheck}>
                <Text style={s.optCheckText}>{draft.correctAnswerIndex === i ? '✓' : '○'}</Text>
              </Pressable>
              <TextInput style={s.optInput} value={o} onChangeText={v => setOpt(i, v)} placeholder={`Option ${i + 1}${i < 2 ? ' *' : ''}`} placeholderTextColor="#aaa" />
            </View>
          ))}
          <TextField label="Explanation (optional)" value={draft.explanation} onChangeText={v => setDraft(d => ({ ...d, explanation: v }))} multiline />
          <PrimaryButton title={saving ? 'Saving…' : editing ? 'Update' : 'Add'} onPress={save} loading={saving} style={{ marginBottom: 8 }} />
          <PrimaryButton title="Cancel" variant="secondary" onPress={() => setShowModal(false)} />
        </ScrollView>
      </Modal>
    </View>
  );
}

// ─── LIFE CYCLE TAB ──────────────────────────────────────────────────────────
function LifeCycleTab({ animalId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [lcTitle, setLcTitle] = useState('Life Cycle');
  const [stages, setStages] = useState([{ stageName: '', description: '', imageUrl: '', order: 0 }]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await getLifeCyclesByAnimal(animalId); setList(r.data || []); }
    catch { setErr('Failed to load life cycles.'); }
    finally { setLoading(false); }
  }, [animalId]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setLcTitle('Life Cycle'); setStages([{ stageName: '', description: '', imageUrl: '', order: 0 }]); setErr(''); setShowModal(true); };
  const openEdit = (lc) => { setEditing(lc); setLcTitle(lc.title || 'Life Cycle'); setStages(lc.stages.length ? lc.stages : [{ stageName: '', description: '', imageUrl: '', order: 0 }]); setErr(''); setShowModal(true); };

  const setStage = (i, k, v) => setStages(ss => ss.map((st, idx) => idx === i ? { ...st, [k]: v } : st));
  const addStage = () => setStages(ss => [...ss, { stageName: '', description: '', imageUrl: '', order: ss.length }]);
  const removeStage = (i) => setStages(ss => ss.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!lcTitle.trim() || stages.some(st => !st.stageName.trim() || !st.description.trim())) {
      setErr('Title and all stage names/descriptions required.'); return;
    }
    setSaving(true); setErr('');
    const payload = { animal: animalId, title: lcTitle.trim(), stages: stages.map((st, i) => ({ ...st, order: i })) };
    try {
      if (editing) await updateLifeCycle(editing._id, payload);
      else await createLifeCycle(payload);
      setShowModal(false); load();
    } catch (e) { setErr(e?.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const del = (lc) => Alert.alert('Delete', `Delete "${lc.title}"?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await deleteLifeCycle(lc._id); load(); } },
  ]);

  return (
    <View>
      <PrimaryButton title="＋ Add Life Cycle" onPress={openNew} style={{ marginBottom: 12 }} />
      {loading ? <Text style={s.hint}>Loading…</Text> : null}
      {list.map(lc => (
        <View key={lc._id} style={s.card}>
          <Text style={s.cardTitle}>🔄 {lc.title}</Text>
          {lc.stages.map((st, i) => (
            <Text key={i} style={s.cardBody}>Stage {i + 1}: <Text style={{ fontWeight: '700' }}>{st.stageName}</Text> — {st.description}</Text>
          ))}
          <View style={s.actions}><Pressable onPress={() => openEdit(lc)}><Text style={s.actEdit}>✏ Edit</Text></Pressable><Pressable onPress={() => del(lc)}><Text style={s.actDel}>🗑 Delete</Text></Pressable></View>
        </View>
      ))}
      {!loading && list.length === 0 && <Text style={s.hint}>No life cycles yet.</Text>}

      <Modal visible={showModal} animationType="slide">
        <ScrollView contentContainerStyle={s.modal} keyboardShouldPersistTaps="handled">
          <Text style={s.modalTitle}>{editing ? 'Edit Life Cycle' : 'Add Life Cycle'}</Text>
          {err ? <Text style={s.errText}>{err}</Text> : null}
          <TextField label="Title" value={lcTitle} onChangeText={setLcTitle} />
          <Text style={s.label}>Stages</Text>
          {stages.map((st, i) => (
            <View key={i} style={s.stageCard}>
              <Text style={s.stageNum}>Stage {i + 1}</Text>
              <TextField label="Stage Name *" value={st.stageName} onChangeText={v => setStage(i, 'stageName', v)} />
              <TextField label="Description *" value={st.description} onChangeText={v => setStage(i, 'description', v)} multiline />
              <TextField label="Image URL" value={st.imageUrl} onChangeText={v => setStage(i, 'imageUrl', v)} autoCapitalize="none" />
              {stages.length > 1 && <Pressable onPress={() => removeStage(i)}><Text style={s.actDel}>Remove Stage</Text></Pressable>}
            </View>
          ))}
          <Pressable onPress={addStage} style={s.addStageBtn}><Text style={s.addStageText}>＋ Add Stage</Text></Pressable>
          <PrimaryButton title={saving ? 'Saving…' : editing ? 'Update' : 'Create'} onPress={save} loading={saving} style={{ marginBottom: 8 }} />
          <PrimaryButton title="Cancel" variant="secondary" onPress={() => setShowModal(false)} />
        </ScrollView>
      </Modal>
    </View>
  );
}

// ─── DID YOU KNOW TAB ────────────────────────────────────────────────────────
function DidYouKnowTab({ animalId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fact, setFact] = useState('');
  const [source, setSource] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await getDidYouKnowByAnimal(animalId); setList(r.data || []); }
    catch { setErr('Failed to load facts.'); }
    finally { setLoading(false); }
  }, [animalId]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setFact(''); setSource(''); setErr(''); setShowModal(true); };
  const openEdit = (f) => { setEditing(f); setFact(f.fact); setSource(f.source || ''); setErr(''); setShowModal(true); };

  const save = async () => {
    if (!fact.trim()) { setErr('Fact is required.'); return; }
    setSaving(true); setErr('');
    const payload = { animal: animalId, fact: fact.trim(), source: source.trim() };
    try {
      if (editing) await updateDidYouKnow(editing._id, payload);
      else await createDidYouKnow(payload);
      setShowModal(false); load();
    } catch (e) { setErr(e?.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const del = (f) => Alert.alert('Delete', 'Delete this fact?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await deleteDidYouKnow(f._id); load(); } },
  ]);

  return (
    <View>
      <PrimaryButton title="＋ Add Did You Know" onPress={openNew} style={{ marginBottom: 12 }} />
      {loading ? <Text style={s.hint}>Loading…</Text> : null}
      {list.map(f => (
        <View key={f._id} style={s.card}>
          <Text style={s.cardTitle}>💡 {f.fact}</Text>
          {f.source ? <Text style={s.cardBody}>Source: {f.source}</Text> : null}
          <View style={s.actions}><Pressable onPress={() => openEdit(f)}><Text style={s.actEdit}>✏ Edit</Text></Pressable><Pressable onPress={() => del(f)}><Text style={s.actDel}>🗑 Delete</Text></Pressable></View>
        </View>
      ))}
      {!loading && list.length === 0 && <Text style={s.hint}>No "Did You Know" facts yet.</Text>}

      <Modal visible={showModal} animationType="slide">
        <ScrollView contentContainerStyle={s.modal} keyboardShouldPersistTaps="handled">
          <Text style={s.modalTitle}>{editing ? 'Edit Fact' : 'Add Fact'}</Text>
          {err ? <Text style={s.errText}>{err}</Text> : null}
          <TextField label="Fact *" value={fact} onChangeText={setFact} multiline />
          <TextField label="Source (optional)" value={source} onChangeText={setSource} />
          <PrimaryButton title={saving ? 'Saving…' : editing ? 'Update' : 'Add'} onPress={save} loading={saving} style={{ marginBottom: 8 }} />
          <PrimaryButton title="Cancel" variant="secondary" onPress={() => setShowModal(false)} />
        </ScrollView>
      </Modal>
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function AdminEducationHubScreen({ navigation }) {
  const route = useRoute();
  const animal = route.params?.animal;
  const [activeTab, setActiveTab] = useState('Facts');

  return (
    <View style={s.root}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => popOrParentGoBack(navigation)} style={s.backBtn}>
          <Text style={s.backText}>‹ Back</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>📚 Education Hub</Text>
          <Text style={s.headerSub}>{animal?.name}</Text>
        </View>
      </View>

      <TabBar active={activeTab} onChange={setActiveTab} />

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        {activeTab === 'Facts' && <FactsTab animalId={animal?._id} />}
        {activeTab === 'Quiz' && <QuizTab animalId={animal?._id} />}
        {activeTab === 'Life Cycle' && <LifeCycleTab animalId={animal?._id} />}
        {activeTab === 'Did You Know' && <DidYouKnowTab animalId={animal?._id} />}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8faf8' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backBtn: { paddingRight: 12, paddingVertical: 4 },
  backText: { fontSize: 18, color: theme.colors.linkGreen, fontWeight: '700' },
  headerTitle: { fontSize: theme.fontSize.body, fontWeight: '800', color: theme.colors.primaryText },
  headerSub: { fontSize: theme.fontSize.sm, color: theme.colors.accentGreen, fontWeight: '600' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: theme.colors.accentGreen },
  tabText: { fontSize: 12, fontWeight: '600', color: theme.colors.primaryText, opacity: 0.6 },
  tabTextActive: { color: theme.colors.linkGreen, opacity: 1 },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border, borderLeftWidth: 4, borderLeftColor: theme.colors.accentGreen, padding: 14, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  typePill: { backgroundColor: '#ede9fe', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  typePillText: { fontSize: 11, fontWeight: '700', color: '#6366f1', textTransform: 'uppercase' },
  cardTitle: { flex: 1, fontSize: theme.fontSize.body, fontWeight: '700', color: theme.colors.primaryText },
  cardBody: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.75, marginTop: 4, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.border },
  actEdit: { color: theme.colors.linkGreen, fontWeight: '700', fontSize: theme.fontSize.sm },
  actDel: { color: '#d9534f', fontWeight: '700', fontSize: theme.fontSize.sm },
  hint: { color: theme.colors.primaryText, opacity: 0.55, fontStyle: 'italic', fontSize: theme.fontSize.sm, marginVertical: 8 },
  errText: { color: '#d9534f', fontSize: theme.fontSize.sm, marginBottom: 8 },
  modal: { padding: 20, paddingBottom: 60 },
  modalTitle: { fontSize: theme.fontSize.hero, fontWeight: '800', color: theme.colors.primaryText, marginBottom: 16 },
  label: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.primaryText, marginBottom: 6, marginTop: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  chip: { borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#e8f5e9', borderColor: theme.colors.accentGreen },
  chipText: { fontSize: 13, fontWeight: '600', color: theme.colors.primaryText },
  chipTextActive: { color: theme.colors.linkGreen },
  // Quiz option row
  optRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, marginBottom: 8, overflow: 'hidden', backgroundColor: '#fff' },
  optRowCorrect: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  optCheck: { width: 44, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRightWidth: 1, borderRightColor: theme.colors.border },
  optCheckText: { fontSize: 16, fontWeight: '800', color: theme.colors.linkGreen },
  optInput: { flex: 1, paddingHorizontal: 12, fontSize: theme.fontSize.sm, color: theme.colors.primaryText },
  // Life cycle stage
  stageCard: { backgroundColor: '#f0fdf4', borderRadius: 10, borderWidth: 1, borderColor: '#bbf7d0', padding: 12, marginBottom: 10 },
  stageNum: { fontWeight: '800', color: theme.colors.linkGreen, marginBottom: 6 },
  addStageBtn: { alignItems: 'center', padding: 10, borderWidth: 1, borderColor: theme.colors.accentGreen, borderRadius: 10, borderStyle: 'dashed', marginBottom: 16 },
  addStageText: { color: theme.colors.linkGreen, fontWeight: '700' },
});
