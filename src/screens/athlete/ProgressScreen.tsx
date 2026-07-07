import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { trainingApi } from '@/api/training';
import type { PersonalBest } from '@/types';

const COLORS = {
  primary: '#1A6BB5',
  orange: '#F05A1A',
  green: '#6DC400',
  text: '#1A1A1A',
  grey: '#6B7280',
  border: '#E0E0E0',
  surface: '#FFFFFF',
  bg: '#F8F9FA',
  blueLight: '#EBF5FB',
};

const DISTANCES = ['20m', '30m', '60m', '100m', '200m'];
const DISTANCE_VALUES = [20, 30, 60, 100, 200];
const SUB_TABS = ['PBs', 'Log Time', 'History'];

export default function ProgressScreen() {
  const user = useAuthStore((s) => s.user);
  const [subTab, setSubTab] = useState(0);
  const [distIdx, setDistIdx] = useState(3);
  const [sec, setSec] = useState('');
  const [tenths, setTenths] = useState('');
  const [hundredths, setHundredths] = useState('');
  const [focusField, setFocusField] = useState<string | null>(null);
  const [logResult, setLogResult] = useState<'pb' | 'nopb' | null>(null);
  const [loggedTime, setLoggedTime] = useState<number | null>(null);
  const [pbs, setPbs] = useState<PersonalBest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPbs = useCallback(() => {
    if (!user) return;
    const athleteId = user.athleteId ?? user.id;
    setIsLoading(true);
    trainingApi
      .getPersonalBests(athleteId)
      .then(setPbs)
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, [user]);

  useEffect(() => { fetchPbs(); }, [fetchPbs]);

  const handleLog = useCallback(async () => {
    const s = sec.trim() || '0';
    const t = tenths.trim() || '0';
    const h = hundredths.trim() || '0';
    const timeSeconds = parseFloat(`${s}.${t.padStart(1,'0')}${h.padStart(2,'0')}`);
    if (isNaN(timeSeconds) || timeSeconds <= 0) return;

    const currentPb = pbs.find((p) => p.distance === DISTANCE_VALUES[distIdx]);
    const isPb = !currentPb || timeSeconds < currentPb.timeSeconds;

    if (!user) return;
    const athleteId = user.athleteId ?? user.id;
    setIsSaving(true);
    try {
      const updated = await trainingApi.logPersonalBest(athleteId, DISTANCE_VALUES[distIdx], timeSeconds);
      setPbs(updated);
      setLoggedTime(timeSeconds);
      setLogResult(isPb ? 'pb' : 'nopb');
    } catch {
      setLogResult(isPb ? 'pb' : 'nopb');
    } finally {
      setIsSaving(false);
    }
  }, [sec, tenths, hundredths, distIdx, pbs, user]);

  const pb100 = pbs.find((p) => p.distance === 100);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
        <View style={styles.subTabRow}>
          {SUB_TABS.map((t, i) => (
            <TouchableOpacity
              key={t}
              onPress={() => {
                setSubTab(i);
                setLogResult(null);
              }}
              style={[styles.subTab, subTab === i && styles.subTabActive]}
            >
              <Text style={[styles.subTabText, subTab === i && styles.subTabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.separator} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {subTab === 0 && <PBsTab pbs={pbs} pb100={pb100} isLoading={isLoading} />}
        {subTab === 1 && (
          <LogTimeTab
            distIdx={distIdx}
            setDistIdx={(i) => { setDistIdx(i); setLogResult(null); setLoggedTime(null); }}
            sec={sec}
            setSec={setSec}
            tenths={tenths}
            setTenths={setTenths}
            hundredths={hundredths}
            setHundredths={setHundredths}
            focusField={focusField}
            setFocusField={setFocusField}
            logResult={logResult}
            loggedTime={loggedTime}
            onLog={handleLog}
            isSaving={isSaving}
            pbs={pbs}
          />
        )}
        {subTab === 2 && <HistoryTab pbs={pbs} />}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── PBs Tab ───────────────────────────────────────────────────────

function PBsTab({
  pbs,
  pb100,
  isLoading,
}: {
  pbs: PersonalBest[];
  pb100?: PersonalBest;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />;
  }

  const getPb = (dist: number) => pbs.find((p) => p.distance === dist);

  return (
    <>
      <View style={styles.pbGrid}>
        <PBCard dist="20m" pb={getPb(20)} />
        <PBCard dist="30m" pb={getPb(30)} />
        <PBCard dist="60m" pb={getPb(60)} />

        {/* 100m hero */}
        <View style={styles.pbHero}>
          <View style={styles.pbHeroHeader}>
            <Text style={styles.pbDistLabel}>100m</Text>
            <Text style={{ fontSize: 18 }}>{'🏆'}</Text>
          </View>
          <View style={styles.pbHeroTimeRow}>
            <Text style={styles.pbHeroTime}>
              {pb100 ? `${pb100.timeSeconds}s` : '—'}
            </Text>
          </View>
          <Text style={styles.pbDate}>
            {pb100
              ? `Set ${new Date(pb100.recordedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
              : 'No time logged yet'}
          </Text>
          {pb100 && <Sparkline data={[pb100.timeSeconds]} />}
        </View>

        <PBCard dist="200m" pb={getPb(200)} />
        <View />
      </View>

      {/* 400m empty state */}
      <View style={styles.emptyCard}>
        <View>
          <Text style={styles.pbDistLabel}>400m</Text>
          <Text style={styles.emptyTime}>{'--'}</Text>
          <Text style={styles.emptyPrompt}>Tap to log your first time</Text>
        </View>
        <View style={styles.addBtn}>
          <Text style={styles.addBtnIcon}>{'+'}</Text>
        </View>
      </View>
    </>
  );
}

function PBCard({ dist, pb }: { dist: string; pb?: PersonalBest }) {
  return (
    <View style={styles.pbCard}>
      <View style={styles.pbCardHeader}>
        <Text style={styles.pbDistLabel}>{dist}</Text>
        <Text style={{ fontSize: 12, color: COLORS.grey }}>{'⏱'}</Text>
      </View>
      <Text style={styles.pbCardTime}>{pb ? `${pb.timeSeconds}s` : '—'}</Text>
      <Text style={styles.pbDate}>
        {pb
          ? `Set ${new Date(pb.recordedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
          : 'No time yet'}
      </Text>
    </View>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const H = 40;
  const PAD = 4;

  const points = data.map((v, i) => ({
    x: PAD + (i / (data.length - 1)) * (100 - PAD * 2),
    y: PAD + ((v - min) / range) * (H - PAD * 2),
  }));
  const lastPt = points[points.length - 1];

  return (
    <View style={{ height: H, marginTop: 8, overflow: 'hidden' }}>
      {points.slice(0, -1).map((pt, i) => {
        const next = points[i + 1];
        const dx = next.x - pt.x;
        const dy = next.y - pt.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: `${pt.x}%`,
              top: pt.y,
              width: `${len}%`,
              height: 2,
              backgroundColor: COLORS.green,
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })}
      <View
        style={{
          position: 'absolute',
          left: `${lastPt.x}%`,
          top: lastPt.y - 3.5,
          width: 7,
          height: 7,
          borderRadius: 3.5,
          backgroundColor: COLORS.green,
        }}
      />
    </View>
  );
}

// ── Log Time Tab ──────────────────────────────────────────────────

interface LogTimeProps {
  distIdx: number;
  setDistIdx: (i: number) => void;
  sec: string;
  setSec: (v: string) => void;
  tenths: string;
  setTenths: (v: string) => void;
  hundredths: string;
  setHundredths: (v: string) => void;
  focusField: string | null;
  setFocusField: (v: string | null) => void;
  logResult: 'pb' | 'nopb' | null;
  loggedTime: number | null;
  onLog: () => void;
  isSaving: boolean;
  pbs: PersonalBest[];
}

function LogTimeTab(props: LogTimeProps) {
  const {
    distIdx,
    setDistIdx,
    sec,
    setSec,
    tenths,
    setTenths,
    hundredths,
    setHundredths,
    focusField,
    setFocusField,
    logResult,
    loggedTime,
    onLog,
    isSaving,
    pbs,
  } = props;

  const currentPb = pbs.find((p) => p.distance === DISTANCE_VALUES[distIdx]);
  const currentPbText = currentPb ? `${currentPb.timeSeconds}s` : '—';

  return (
    <>
      <View style={styles.distRow}>
        {DISTANCES.map((d, i) => (
          <TouchableOpacity
            key={d}
            onPress={() => setDistIdx(i)}
            style={[styles.distPill, distIdx === i && styles.distPillActive]}
          >
            <Text style={[styles.distPillText, distIdx === i && styles.distPillTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.pbCaption}>
        {DISTANCES[distIdx]} PB: {currentPbText}
      </Text>

      <View style={styles.timeRow}>
        <TimeField
          value={sec}
          onChange={setSec}
          label="sec"
          focused={focusField === 'sec'}
          onFocus={() => setFocusField('sec')}
          onBlur={() => setFocusField(null)}
        />
        <Text style={styles.timeSep}>{':'}</Text>
        <TimeField
          value={tenths}
          onChange={setTenths}
          label=""
          focused={focusField === 'tenths'}
          onFocus={() => setFocusField('tenths')}
          onBlur={() => setFocusField(null)}
        />
        <Text style={styles.timeSep}>{'.'}</Text>
        <TimeField
          value={hundredths}
          onChange={setHundredths}
          label="ms"
          focused={focusField === 'hundredths'}
          onFocus={() => setFocusField('hundredths')}
          onBlur={() => setFocusField(null)}
        />
      </View>
      <Text style={styles.timeCaption}>seconds : tenths . hundredths</Text>

      <TouchableOpacity style={styles.logBtn} onPress={onLog} disabled={isSaving}>
        {isSaving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.logBtnIcon}>{'⏱'}</Text>
            <Text style={styles.logBtnText}>Log This Time</Text>
          </>
        )}
      </TouchableOpacity>

      {logResult === 'pb' && loggedTime !== null && (
        <View style={styles.pbBanner}>
          <Text style={{ fontSize: 20 }}>{'🏆'}</Text>
          <Text style={styles.pbBannerText}>
            New PB! {loggedTime.toFixed(2)}s logged for {DISTANCES[distIdx]}!
          </Text>
        </View>
      )}
      {logResult === 'nopb' && loggedTime !== null && (
        <View style={styles.noPbBanner}>
          <Text style={styles.noPbBannerText}>
            Logged {loggedTime.toFixed(2)}s — your PB is still {currentPbText}. Keep training!
          </Text>
        </View>
      )}
    </>
  );
}

function TimeField({
  value,
  onChange,
  label,
  focused,
  onFocus,
  onBlur,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  return (
    <View style={{ alignItems: 'center' }}>
      <TextInput
        value={value}
        onChangeText={(v) => onChange(v.replace(/\D/g, ''))}
        keyboardType="number-pad"
        maxLength={2}
        style={[styles.timeInput, focused && styles.timeInputFocused]}
        onFocus={onFocus}
        onBlur={onBlur}
        selectTextOnFocus
      />
      <Text style={styles.timeInputLabel}>{label !== '' ? label : ' '}</Text>
    </View>
  );
}

// ── History Tab ───────────────────────────────────────────────────

function HistoryTab({ pbs }: { pbs: PersonalBest[] }) {
  const sorted = [...pbs].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>
          {'No times logged yet.\nHead to Log Time to get started!'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.historyCard}>
      {sorted.map((pb, i) => (
        <View
          key={`${pb.distance}-${pb.recordedAt}`}
          style={[styles.historyRow, i < sorted.length - 1 && styles.historyRowBorder]}
        >
          <View style={styles.historyDist}>
            <Text style={styles.historyDistText}>{pb.distance}m</Text>
          </View>
          <Text style={styles.historyTime}>{pb.timeSeconds}s</Text>
          <Text style={styles.historyDate}>
            {new Date(pb.recordedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </Text>
          <View style={styles.trendDot}>
            <Text style={{ fontSize: 12, color: COLORS.green }}>{'↑'}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 32, gap: 12 },

  header: { backgroundColor: COLORS.surface, paddingTop: 14, paddingHorizontal: 20, paddingBottom: 0 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 14, letterSpacing: -0.2 },
  subTabRow: { flexDirection: 'row' },
  subTab: { flex: 1, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: 'transparent', alignItems: 'center' },
  subTabActive: { borderBottomColor: COLORS.primary },
  subTabText: { fontSize: 13, fontWeight: '400', color: COLORS.grey },
  subTabTextActive: { fontWeight: '600', color: COLORS.primary },
  separator: { height: 1, backgroundColor: COLORS.border, marginHorizontal: -20 },

  pbGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pbCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    minHeight: 90,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pbCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  pbDistLabel: { fontSize: 13, color: COLORS.grey, fontWeight: '500' },
  pbCardTime: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5, lineHeight: 32, marginBottom: 6 },
  pbDate: { fontSize: 12, color: COLORS.grey },

  pbHero: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.green,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pbHeroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  pbHeroTimeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 2 },
  pbHeroTime: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5, lineHeight: 32 },
  pbTrend: { fontSize: 12, fontWeight: '600', color: COLORS.green },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  emptyTime: { fontSize: 28, fontWeight: '800', color: COLORS.border, letterSpacing: -0.5, lineHeight: 32, marginBottom: 6, marginTop: 4 },
  emptyPrompt: { fontSize: 13, color: COLORS.orange, fontWeight: '600' },
  addBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  addBtnIcon: { fontSize: 20, color: COLORS.primary, lineHeight: 24 },

  distRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  distPill: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distPillActive: {
    backgroundColor: COLORS.primary,
    borderWidth: 0,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  distPillText: { fontSize: 13, fontWeight: '400', color: COLORS.grey },
  distPillTextActive: { fontWeight: '700', color: '#FFFFFF' },
  pbCaption: { fontSize: 13, color: COLORS.grey, textAlign: 'center', marginBottom: 24 },

  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  timeInput: {
    width: 80,
    height: 72,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  timeInputFocused: { borderColor: COLORS.primary },
  timeInputLabel: { fontSize: 11, color: COLORS.grey, marginTop: 5 },
  timeSep: { fontSize: 28, fontWeight: '700', color: COLORS.grey, marginHorizontal: 4, paddingBottom: 18 },
  timeCaption: { fontSize: 12, color: COLORS.grey, textAlign: 'center', marginBottom: 24 },

  logBtn: {
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
    shadowColor: COLORS.orange,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  logBtnIcon: { fontSize: 18 },
  logBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  pbBanner: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    shadowColor: COLORS.green,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pbBannerText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#FFFFFF', lineHeight: 20 },
  noPbBanner: {
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noPbBannerText: { fontSize: 13, color: COLORS.text, lineHeight: 20 },

  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: 'hidden',
  },
  historyRow: { flexDirection: 'row', alignItems: 'center', padding: 13, paddingHorizontal: 14, gap: 12 },
  historyRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  historyDist: { backgroundColor: COLORS.blueLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  historyDistText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  historyTime: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.text },
  historyDate: { fontSize: 12, color: COLORS.grey },
  trendDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: `${COLORS.green}18`, alignItems: 'center', justifyContent: 'center' },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyStateText: { fontSize: 14, color: COLORS.grey, textAlign: 'center', lineHeight: 22 },
});
