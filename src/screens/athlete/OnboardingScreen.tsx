import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { profileApi, trainingApi } from '@/api/training';
import { useAuthStore } from '@/store/authStore';
import type { RootStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const COLORS = {
  primary: '#1A6BB5',
  orange: '#F05A1A',
  text: '#1A1A1A',
  grey: '#6B7280',
  border: '#E0E0E0',
  surface: '#FFFFFF',
  bg: '#F8F9FA',
  error: '#C0392B',
};

const AGE_GROUPS = ['U11', 'U13', 'U15', 'U17', 'U20'];
const EVENTS = ['60m', '100m', '200m', '400m', '4×100m relay'];
const TRAINING_DAYS = [2, 3, 4, 5, 6];
const PB_DISTANCES: { label: string; value: number }[] = [
  { label: '20m', value: 20 },
  { label: '60m', value: 60 },
  { label: '100m', value: 100 },
  { label: '200m', value: 200 },
];

type Step = 0 | 1 | 2 | 3 | 4 | 5;

export default function OnboardingScreen() {
  const navigation = useNavigation<NavProp>();
  const updateUser = useAuthStore((s) => s.updateUser);

  const [step, setStep] = useState<Step>(0);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [trainingDays, setTrainingDays] = useState<number | null>(null);
  const [raceDate, setRaceDate] = useState('');
  const [pbInputs, setPbInputs] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefillLoaded, setPrefillLoaded] = useState(false);

  // Registration already collects age group / event / training days for most
  // athletes — prefill them here and skip straight to the race date step
  // instead of asking the same three questions again.
  useEffect(() => {
    profileApi.getMyProfile()
      .then((profile) => {
        if (profile.ageGroup) setAgeGroup(profile.ageGroup);
        if (profile.primaryEvent) setEvents(profile.primaryEvent.split(',').filter(Boolean));
        if (profile.trainingDaysPerWeek) setTrainingDays(profile.trainingDaysPerWeek);
        if (profile.ageGroup && profile.primaryEvent && profile.trainingDaysPerWeek) {
          setStep(3);
        }
      })
      .catch(() => undefined)
      .finally(() => setPrefillLoaded(true));
  }, []);

  const totalSteps = 6;

  const toggleEvent = (evt: string) => {
    setEvents((prev) => (prev.includes(evt) ? prev.filter((e) => e !== evt) : [...prev, evt]));
  };

  const canAdvance = (): boolean => {
    if (step === 0) return !!ageGroup;
    if (step === 1) return events.length > 0;
    if (step === 2) return !!trainingDays;
    if (step === 3) return raceDate === '' || /^\d{4}-\d{2}-\d{2}$/.test(raceDate);
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step < 4) {
      setStep((s) => (s + 1) as Step);
      return;
    }
    if (step === 4) {
      setStep(5);
      return;
    }
    void handleFinish();
  };

  const handleFinish = async () => {
    setSaving(true);
    setError(null);
    try {
      await profileApi.updateMyProfile({
        ageGroup: ageGroup as string,
        events,
        trainingDaysPerWeek: trainingDays as number,
        nextRaceDate: raceDate || null,
        onboardingCompleted: true,
      });

      const athleteId = useAuthStore.getState().user?.athleteId ?? useAuthStore.getState().user?.id;
      if (athleteId) {
        const pbEntries = Object.entries(pbInputs).filter(([, v]) => parseFloat(v) > 0);
        await Promise.allSettled(
          pbEntries.map(([distance, time]) => trainingApi.logPersonalBest(athleteId, Number(distance), parseFloat(time))),
        );
      }

      updateUser({ onboardingCompleted: true });
      navigation.reset({ index: 0, routes: [{ name: 'AthleteTabs' }] });
    } catch (err) {
      const anyErr = err as { response?: { data?: { error?: string } }; message?: string };
      setError(anyErr?.response?.data?.error ?? anyErr?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!prefillLoaded) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        {step > 0 ? (
          <TouchableOpacity onPress={() => setStep((s) => (s - 1) as Step)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={26} color={COLORS.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 26 }} />
        )}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((step + 1) / totalSteps) * 100}%` }]} />
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <View style={styles.stepBlock}>
              <Text style={styles.title}>Welcome to SprintFastest!</Text>
              <Text style={styles.body}>What's your age group?</Text>
              <View style={styles.pillGrid}>
                {AGE_GROUPS.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.pill, ageGroup === g && styles.pillActive]}
                    onPress={() => setAgeGroup(g)}
                  >
                    <Text style={[styles.pillText, ageGroup === g && styles.pillTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 1 && (
            <View style={styles.stepBlock}>
              <Text style={styles.title}>Your Events</Text>
              <Text style={styles.body}>Pick all the events you train for.</Text>
              <View style={styles.pillGrid}>
                {EVENTS.map((e) => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.pill, events.includes(e) && styles.pillActive]}
                    onPress={() => toggleEvent(e)}
                  >
                    <Text style={[styles.pillText, events.includes(e) && styles.pillTextActive]}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepBlock}>
              <Text style={styles.title}>Training Frequency</Text>
              <Text style={styles.body}>How many days a week can you train?</Text>
              <View style={styles.pillGrid}>
                {TRAINING_DAYS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.pill, trainingDays === d && styles.pillActive]}
                    onPress={() => setTrainingDays(d)}
                  >
                    <Text style={[styles.pillText, trainingDays === d && styles.pillTextActive]}>{d} days</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepBlock}>
              <Text style={styles.title}>Upcoming Race</Text>
              <Text style={styles.body}>
                Got a race on the calendar? We'll automatically taper your training the week before it.
                Leave blank if not.
              </Text>
              <TextInput
                style={styles.dateInput}
                value={raceDate}
                onChangeText={setRaceDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.grey}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          )}

          {step === 4 && (
            <View style={styles.stepBlock}>
              <Text style={styles.title}>Starting Times</Text>
              <Text style={styles.body}>Add any personal bests you already have — optional, you can log these later too.</Text>
              {PB_DISTANCES.map((d) => (
                <View key={d.value} style={styles.pbRow}>
                  <Text style={styles.pbLabel}>{d.label}</Text>
                  <TextInput
                    style={styles.pbInput}
                    value={pbInputs[d.value] ?? ''}
                    onChangeText={(t) => setPbInputs((prev) => ({ ...prev, [d.value]: t.replace(/[^0-9.]/g, '') }))}
                    keyboardType="decimal-pad"
                    placeholder="0.00s"
                    placeholderTextColor={COLORS.grey}
                  />
                </View>
              ))}
            </View>
          )}

          {step === 5 && (
            <View style={styles.stepBlock}>
              <Ionicons name="checkmark-circle" size={48} color={COLORS.primary} style={{ marginBottom: 12 }} />
              <Text style={styles.title}>You're all set!</Text>
              <Text style={styles.body}>
                We'll generate your first personalised training plan based on what you told us.
                Ready to get started?
              </Text>
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, (!canAdvance() || saving) && styles.btnDisabled]}
            onPress={handleNext}
            disabled={!canAdvance() || saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextBtnText}>{step === 5 ? 'Start Training' : 'Continue'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  progressTrack: { flex: 1, height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },
  scroll: { flexGrow: 1, padding: 24 },
  stepBlock: { alignItems: 'center', paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 10 },
  body: { fontSize: 14, color: COLORS.grey, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  pill: {
    paddingHorizontal: 18, paddingVertical: 11, borderRadius: 100,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  pillTextActive: { color: '#fff' },
  dateInput: {
    width: '100%', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: COLORS.text,
    textAlign: 'center',
  },
  pbRow: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  pbLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  pbInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, color: COLORS.text,
    width: 100, textAlign: 'center',
  },
  errorText: { color: COLORS.error, fontSize: 13, textAlign: 'center', marginTop: 16 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  nextBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', minHeight: 52, justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
