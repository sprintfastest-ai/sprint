import React, { useState } from 'react';
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
import { diagnosisApi } from '@/api/diagnosis';
import { useAuthStore } from '@/store/authStore';
import type { AthleteStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<AthleteStackParamList, 'DiagnosisQuiz'>;

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

const START_FEEL_OPTIONS = ['Explosive', 'Solid', 'Sluggish'] as const;
const FADE_OPTIONS = ['Rarely', 'Sometimes', 'Often'] as const;

type Step = 0 | 1 | 2 | 3 | 4;

export default function DiagnosisQuizScreen() {
  const navigation = useNavigation<NavProp>();
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState<Step>(0);
  const [t20, setT20] = useState('');
  const [t60, setT60] = useState('');
  const [t200, setT200] = useState('');
  const [startFeel, setStartFeel] = useState<typeof START_FEEL_OPTIONS[number] | null>(null);
  const [fade, setFade] = useState<typeof FADE_OPTIONS[number] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 5;

  const canAdvance = (): boolean => {
    if (step === 1) return parseFloat(t20) > 0;
    if (step === 2) return parseFloat(t60) > 0;
    if (step === 3) return parseFloat(t200) > 0;
    if (step === 4) return !!startFeel && !!fade;
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step < 4) {
      setStep((s) => (s + 1) as Step);
      return;
    }
    void handleSubmit();
  };

  const handleSubmit = async () => {
    const athleteId = user?.athleteId ?? user?.id;
    if (!athleteId) return;
    setSubmitting(true);
    setError(null);
    try {
      const diagnosis = await diagnosisApi.runDiagnosis({
        athleteId,
        timeTrial20m: parseFloat(t20),
        timeTrial60m: parseFloat(t60),
        timeTrial200m: parseFloat(t200),
        answers: { startFeel, fade },
      });
      navigation.replace('DiagnosisResults', { diagnosis });
    } catch (err) {
      const anyErr = err as { response?: { data?: { error?: string } }; message?: string };
      setError(anyErr?.response?.data?.error ?? anyErr?.message ?? 'Could not run diagnosis. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (step === 0 ? navigation.goBack() : setStep((s) => (s - 1) as Step))} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={step === 0 ? 'close' : 'chevron-back'} size={26} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((step + 1) / totalSteps) * 100}%` }]} />
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <View style={styles.stepBlock}>
              <Ionicons name="medical" size={40} color={COLORS.orange} style={{ marginBottom: 16 }} />
              <Text style={styles.title}>Weakness Diagnosis</Text>
              <Text style={styles.body}>
                Run three quick time trials — 20m, 60m, and 200m — and answer two quick questions.
                Your AI coach will pinpoint whether acceleration, top speed, or speed endurance is holding you back,
                then prescribe drills to fix it.
              </Text>
            </View>
          )}

          {step === 1 && (
            <TimeStep
              label="20m Time Trial"
              hint="Sprint 20 metres flat out from a standing start. Enter your time in seconds."
              value={t20}
              onChange={setT20}
            />
          )}
          {step === 2 && (
            <TimeStep
              label="60m Time Trial"
              hint="Sprint 60 metres flat out. Enter your time in seconds."
              value={t60}
              onChange={setT60}
            />
          )}
          {step === 3 && (
            <TimeStep
              label="200m Time Trial"
              hint="Sprint 200 metres flat out. Enter your time in seconds."
              value={t200}
              onChange={setT200}
            />
          )}

          {step === 4 && (
            <View style={styles.stepBlock}>
              <Text style={styles.title}>Almost done</Text>
              <Text style={styles.questionLabel}>How does your start feel?</Text>
              <View style={styles.pillRow}>
                {START_FEEL_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.pill, startFeel === opt && styles.pillActive]}
                    onPress={() => setStartFeel(opt)}
                  >
                    <Text style={[styles.pillText, startFeel === opt && styles.pillTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.questionLabel, { marginTop: 20 }]}>Do you fade in the second half of a race?</Text>
              <View style={styles.pillRow}>
                {FADE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.pill, fade === opt && styles.pillActive]}
                    onPress={() => setFade(opt)}
                  >
                    <Text style={[styles.pillText, fade === opt && styles.pillTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, (!canAdvance() || submitting) && styles.btnDisabled]}
            onPress={handleNext}
            disabled={!canAdvance() || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextBtnText}>{step === 4 ? 'Get My Diagnosis' : step === 0 ? "Let's Go" : 'Next'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TimeStep({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.stepBlock}>
      <Text style={styles.title}>{label}</Text>
      <Text style={styles.body}>{hint}</Text>
      <View style={styles.timeInputRow}>
        <TextInput
          style={styles.timeInput}
          value={value}
          onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, ''))}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={COLORS.grey}
          autoFocus
        />
        <Text style={styles.timeUnit}>seconds</Text>
      </View>
    </View>
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
  stepBlock: { alignItems: 'center', paddingTop: 20 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 12 },
  body: { fontSize: 14, color: COLORS.grey, textAlign: 'center', lineHeight: 20 },
  timeInputRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 28, gap: 8 },
  timeInput: {
    fontSize: 48, fontWeight: '700', color: COLORS.primary,
    borderBottomWidth: 2, borderBottomColor: COLORS.primary,
    minWidth: 140, textAlign: 'center',
  },
  timeUnit: { fontSize: 15, color: COLORS.grey },
  questionLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 10 },
  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  pill: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  pillTextActive: { color: '#fff' },
  errorText: { color: COLORS.error, fontSize: 13, textAlign: 'center', marginTop: 16 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  nextBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', minHeight: 52, justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
