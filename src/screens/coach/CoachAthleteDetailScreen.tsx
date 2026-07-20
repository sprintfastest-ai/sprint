import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/hooks/useAuth';
import { coachApi, type CoachNote } from '@/api/coach';
import type { CoachStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<CoachStackParamList, 'AthleteDetail'>;
type RoutePropType = RouteProp<CoachStackParamList, 'AthleteDetail'>;

const COLORS = {
  primary: '#1A6BB5',
  text: '#1A1A1A',
  grey: '#6B7280',
  border: '#E0E0E0',
  surface: '#FFFFFF',
  bg: '#F8F9FA',
};

export default function CoachAthleteDetailScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { athleteId, email } = route.params;
  const { user } = useAuth();

  const [notes, setNotes] = useState<CoachNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [visibleToAthlete, setVisibleToAthlete] = useState(false);
  const [posting, setPosting] = useState(false);

  const load = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    coachApi.getNotes(user.id, athleteId)
      .then(setNotes)
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [user, athleteId]);

  useEffect(() => { load(); }, [load]);

  const handlePost = useCallback(async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      const note = await coachApi.addNote(athleteId, content.trim(), visibleToAthlete);
      setNotes((prev) => [note, ...prev]);
      setContent('');
      setVisibleToAthlete(false);
    } catch {
      // best-effort
    } finally {
      setPosting(false);
    }
  }, [athleteId, content, visibleToAthlete]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{email}</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(n) => n.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.emptyText}>No notes yet — add one below.</Text>}
            renderItem={({ item }) => (
              <View style={styles.noteCard}>
                <Text style={styles.noteContent}>{item.content}</Text>
                <View style={styles.noteFooter}>
                  <Text style={styles.noteDate}>{new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text>
                  {item.isVisibleToAthlete && (
                    <View style={styles.visibleBadge}>
                      <Ionicons name="eye-outline" size={11} color={COLORS.primary} />
                      <Text style={styles.visibleText}>Visible to athlete</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          />
        )}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={content}
            onChangeText={setContent}
            placeholder="Add a note about this athlete..."
            placeholderTextColor={COLORS.grey}
            multiline
          />
          <View style={styles.composerRow}>
            <View style={styles.toggleRow}>
              <Switch value={visibleToAthlete} onValueChange={setVisibleToAthlete} trackColor={{ true: COLORS.primary }} />
              <Text style={styles.toggleLabel}>Visible to athlete</Text>
            </View>
            <TouchableOpacity
              style={[styles.postBtn, (!content.trim() || posting) && styles.btnDisabled]}
              onPress={handlePost}
              disabled={!content.trim() || posting}
            >
              {posting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.postBtnText}>Post</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1, textAlign: 'center' },
  list: { padding: 16, backgroundColor: COLORS.bg, flexGrow: 1 },
  emptyText: { textAlign: 'center', color: COLORS.grey, marginTop: 30, fontSize: 13 },
  noteCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10 },
  noteContent: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  noteFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  noteDate: { fontSize: 11, color: COLORS.grey },
  visibleBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  visibleText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  composer: { borderTopWidth: 1, borderTopColor: COLORS.border, padding: 14, backgroundColor: COLORS.surface },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.text,
    minHeight: 60, textAlignVertical: 'top',
  },
  composerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleLabel: { fontSize: 12, color: COLORS.grey },
  postBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  postBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnDisabled: { opacity: 0.5 },
});
