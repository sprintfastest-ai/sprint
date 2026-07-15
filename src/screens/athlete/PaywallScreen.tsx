import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { subscriptionApi } from '@/api/subscription';
import { purchasePremium, restorePurchases, isPurchasesConfigured, getCurrentOffering } from '@/services/purchases';
import { useAuthStore } from '@/store/authStore';
import type { AthleteStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<AthleteStackParamList, 'Paywall'>;

const COLORS = {
  primary: '#1A6BB5',
  orange: '#F05A1A',
  green: '#6DC400',
  text: '#1A1A1A',
  grey: '#6B7280',
  border: '#E0E0E0',
  surface: '#FFFFFF',
  bg: '#F8F9FA',
};

const PREMIUM_FEATURES: { icon: string; title: string; body: string }[] = [
  { icon: 'infinite',           title: 'Unlimited training plans',  body: 'A new AI-generated plan every week, not just your first.' },
  { icon: 'chatbubbles',        title: 'Unlimited AI Coach chat',    body: 'Ask your coach as many questions as you want, any time.' },
  { icon: 'medical',            title: 'Unlimited re-diagnosis',     body: 'Retake your weakness assessment as your training evolves.' },
  { icon: 'trending-up',        title: 'Race-taper plans',           body: 'Automatic taper weeks before every race on your calendar.' },
  { icon: 'podium',             title: 'Leaderboards',               body: 'See how you stack up against other athletes in your age group.' },
  { icon: 'people',             title: 'Parent & coach dashboards',  body: 'Share progress with the people supporting your training.' },
];

export default function PaywallScreen() {
  const navigation = useNavigation<NavProp>();
  const updateUser = useAuthStore((s) => s.updateUser);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [priceLabel, setPriceLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!isPurchasesConfigured()) return;
    getCurrentOffering()
      .then((offering) => {
        const pkg = offering?.availablePackages[0];
        if (pkg) setPriceLabel(pkg.product.priceString);
      })
      .catch(() => undefined);
  }, []);

  const refreshAndClose = useCallback(async () => {
    try {
      const status = await subscriptionApi.getStatus();
      updateUser({ subscriptionPlan: status.isPremium ? 'premium' : 'free' });
    } catch {
      // Non-fatal — the badge will just catch up next time /me is called
    }
    navigation.goBack();
  }, [navigation, updateUser]);

  const handleUpgrade = async () => {
    setPurchasing(true);
    const result = await purchasePremium();
    setPurchasing(false);
    if (result.success) {
      Alert.alert('Welcome to Premium!', 'Your subscription is now active.', [
        { text: 'Continue', onPress: refreshAndClose },
      ]);
    } else if (result.error) {
      Alert.alert('Purchase unavailable', result.error);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const result = await restorePurchases();
    setRestoring(false);
    if (result.success) {
      Alert.alert('Restored', 'Your purchases have been restored.', [
        { text: 'Continue', onPress: refreshAndClose },
      ]);
    } else if (result.error) {
      Alert.alert('Restore unavailable', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Close" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={26} color={COLORS.grey} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeCircle}>
          <Ionicons name="flash" size={32} color="#fff" />
        </View>
        <Text style={styles.title}>Unlock SprintFastest Premium</Text>
        <Text style={styles.subtitle}>Train smarter, race faster.</Text>

        <View style={styles.card}>
          {PREMIUM_FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <Ionicons name={f.icon as never} size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureBody}>{f.body}</Text>
              </View>
            </View>
          ))}
        </View>

        {!isPurchasesConfigured() && (
          <View style={styles.noticeBanner}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.grey} />
            <Text style={styles.noticeText}>Premium purchases are coming soon.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.upgradeBtn, (purchasing || !isPurchasesConfigured()) && styles.btnDisabled]}
          onPress={handleUpgrade}
          disabled={purchasing || !isPurchasesConfigured()}
        >
          {purchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.upgradeBtnText}>
              {priceLabel ? `Upgrade — ${priceLabel}/mo` : 'Upgrade to Premium'}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRestore} disabled={restoring} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>{restoring ? 'Restoring…' : 'Restore Purchases'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, alignItems: 'flex-end' },
  scroll: { paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center' },
  badgeCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.orange,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 8, marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.grey, marginTop: 4, marginBottom: 24 },
  card: {
    width: '100%', backgroundColor: COLORS.bg, borderRadius: 16,
    padding: 16, gap: 16,
  },
  featureRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  featureIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#EBF5FB', alignItems: 'center', justifyContent: 'center',
  },
  featureTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  featureBody: { fontSize: 12, color: COLORS.grey, marginTop: 2, lineHeight: 17 },
  noticeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 20, paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: COLORS.bg, borderRadius: 8,
  },
  noticeText: { fontSize: 12, color: COLORS.grey },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 10 },
  upgradeBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', minHeight: 52, justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  upgradeBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  restoreBtn: { alignItems: 'center', paddingVertical: 6 },
  restoreText: { fontSize: 13, color: COLORS.grey },
});
