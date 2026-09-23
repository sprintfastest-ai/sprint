import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { AthleteStackParamList } from '@/navigation/types';

type NavProp   = NativeStackNavigationProp<AthleteStackParamList, 'WebView'>;
type RouteProp = NativeStackScreenProps<AthleteStackParamList, 'WebView'>['route'];

const COLORS = {
  primary: '#1A6BB5',
  text: '#1A1A1A',
  grey: '#6B7280',
  border: '#E0E0E0',
  surface: '#FFFFFF',
};

/**
 * Generic in-app browser for external links (Privacy Policy, Terms, etc.)
 * so tapping one doesn't kick the athlete out of the app into their
 * device's browser.
 */
export default function WebViewScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProp>();
  const { url, title } = route.params;
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  // Bumping this remounts the WebView (a fresh load attempt) — there was
  // previously no way to retry a transient failure (weak signal, a
  // momentary 5xx) without leaving the screen and reopening it.
  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = () => {
    setFailed(false);
    setLoading(true);
    setRetryKey((k) => k + 1);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Close"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>

      {failed ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={40} color={COLORS.grey} />
          <Text style={styles.failedText}>Couldn't load this page. Check your connection and try again.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} accessibilityLabel="Try again" accessibilityRole="button">
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          key={retryKey}
          source={{ uri: url }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => { setLoading(false); setFailed(true); }}
          onHttpError={() => { setLoading(false); setFailed(true); }}
          startInLoadingState
        />
      )}

      {loading && !failed ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: COLORS.text },
  webview: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  failedText: { fontSize: 14, color: COLORS.grey, textAlign: 'center', lineHeight: 20 },
  retryBtn: { marginTop: 4, backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24 },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  loadingOverlay: {
    position: 'absolute',
    top: 52, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
});
