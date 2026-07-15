import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Markdown from 'react-native-markdown-display';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/authStore';
import { chatApi } from '@/api/chat';
import type { ChatMessage } from '@/types';
import type { AthleteStackParamList } from '@/navigation/types';

type StackNavProp = NativeStackNavigationProp<AthleteStackParamList>;

const COLORS = {
  primary: '#1A6BB5',
  orange: '#F05A1A',
  text: '#1A1A1A',
  grey: '#6B7280',
  border: '#E0E0E0',
  surface: '#FFFFFF',
  bg: '#F8F9FA',
};

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    userId: 'user',
    role: 'user',
    content: 'What drills should I do to improve my acceleration?',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'ai',
    role: 'assistant',
    content: 'Great question! For acceleration focus on:\n\n1. Wall Drives — 3×10 each leg. Drive through 45°.\n2. A-Skips — 4×20m. Knee height and arm drive.\n3. Block Starts into 30m — 5 runs, full recovery.\n\nHow does your start feel currently?',
    timestamp: new Date().toISOString(),
  },
];

export default function ChatScreen() {
  const navigation = useNavigation<StackNavProp>();
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => {
    chatApi.getHistory().then((history) => {
      setMessages(history.length > 0 ? history : SEED_MESSAGES);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 150);
    }).catch(() => {
      setMessages(SEED_MESSAGES);
    });
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !user) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      userId: user.id,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    scrollToEnd();

    try {
      let reply: ChatMessage;
      try {
        reply = await chatApi.sendMessage(text);
      } catch (err) {
        // Don't retry a limit/paywall error — retrying can't succeed
        const anyErr = err as { response?: { data?: { code?: string } } };
        if (anyErr?.response?.data?.code === 'PREMIUM_REQUIRED') throw err;
        await new Promise((r) => setTimeout(r, 1500));
        reply = await chatApi.sendMessage(text);
      }
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      const anyErr = err as { response?: { data?: { error?: string; code?: string } } };
      const isPaywall = anyErr?.response?.data?.code === 'PREMIUM_REQUIRED';
      const fallback: ChatMessage = {
        id: String(Date.now() + 1),
        userId: 'ai',
        role: 'assistant',
        content: isPaywall
          ? (anyErr.response?.data?.error ?? 'Upgrade to Premium for unlimited AI coaching.')
          : "⚠️ Couldn't reach the coach right now. Tap your message to resend.",
        timestamp: new Date().toISOString(),
        isPaywallPrompt: isPaywall,
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setIsTyping(false);
      scrollToEnd();
    }
  }, [input, user, scrollToEnd]);

  const renderItem = useCallback(({ item }: { item: ChatMessage }) => {
    if (item.role === 'user') {
      return <UserBubble text={item.content} />;
    }
    if (item.isPaywallPrompt) {
      return <PaywallBubble text={item.content} onUpgrade={() => navigation.navigate('Paywall', undefined)} />;
    }
    return <AIBubble text={item.content} />;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityLabel="Go back">
          <Text style={styles.backChevron}>{'‹'}</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter} pointerEvents="none">
          <Text style={styles.headerTitle}>AI Coach</Text>
          <Text style={styles.robotEmoji}>🤖</Text>
        </View>

        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>PREMIUM</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={scrollToEnd}
          ListHeaderComponent={<DateDivider label="Today" />}
          ListFooterComponent={isTyping ? <TypingRow /> : null}
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.micBtn} disabled accessibilityLabel="Voice input (coming soon)">
            <Text style={{ fontSize: 20, opacity: 0.4 }}>🎤</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask your coach..."
            placeholderTextColor={COLORS.grey}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />

          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim()}
            accessibilityLabel="Send message"
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DateDivider({ label }: { label: string }) {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerLabel}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <View style={styles.userRow}>
      <View style={styles.userBubble}>
        <Text style={styles.userBubbleText}>{text}</Text>
      </View>
    </View>
  );
}

function AIBubble({ text }: { text: string }) {
  return (
    <View style={styles.aiRow}>
      <View style={styles.aiAvatar}>
        <Text style={styles.aiAvatarText}>AI</Text>
      </View>
      <View style={styles.aiBubble}>
        <Markdown style={markdownStyles}>{text}</Markdown>
      </View>
    </View>
  );
}

function PaywallBubble({ text, onUpgrade }: { text: string; onUpgrade: () => void }) {
  return (
    <View style={styles.aiRow}>
      <View style={styles.aiAvatar}>
        <Ionicons name="flash" size={16} color="#fff" />
      </View>
      <View style={[styles.aiBubble, styles.paywallBubble]}>
        <Text style={styles.paywallText}>{text}</Text>
        <TouchableOpacity style={styles.paywallBtn} onPress={onUpgrade}>
          <Text style={styles.paywallBtnText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TypingRow() {
  return (
    <View style={[styles.aiRow, { marginTop: 14 }]}>
      <View style={styles.aiAvatar}>
        <Text style={styles.aiAvatarText}>AI</Text>
      </View>
      <View style={[styles.aiBubble, { borderColor: COLORS.primary, borderWidth: 1.5 }]}>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.primary, opacity: 0.6 }} />
          ))}
        </View>
      </View>
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body:        { fontSize: 14, color: COLORS.text, lineHeight: 22 },
  paragraph:   { marginTop: 0, marginBottom: 8 },
  strong:      { fontWeight: '700', color: COLORS.text },
  em:          { fontStyle: 'italic' },
  bullet_list: { marginTop: 2, marginBottom: 2 },
  ordered_list:{ marginTop: 2, marginBottom: 2 },
  list_item:   { marginBottom: 4, flexDirection: 'row' },
  heading1:    { fontSize: 18, fontWeight: '700', marginTop: 4, marginBottom: 6, color: COLORS.text },
  heading2:    { fontSize: 16, fontWeight: '700', marginTop: 4, marginBottom: 6, color: COLORS.text },
  heading3:    { fontSize: 15, fontWeight: '700', marginTop: 4, marginBottom: 4, color: COLORS.text },
  code_inline: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, backgroundColor: '#F0F4F8', paddingHorizontal: 4, borderRadius: 3 },
  fence:       { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, backgroundColor: '#F0F4F8', padding: 8, borderRadius: 6, marginVertical: 4 },
  link:        { color: COLORS.primary, textDecorationLine: 'underline' },
  blockquote:  { backgroundColor: '#F0F4F8', borderLeftWidth: 3, borderLeftColor: COLORS.primary, paddingLeft: 10, paddingVertical: 4, marginVertical: 4 },
  hr:          { backgroundColor: '#E0E0E0', height: 1, marginVertical: 8 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, paddingRight: 8 },
  backChevron: { fontSize: 32, color: COLORS.primary, lineHeight: 36 },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  robotEmoji: { fontSize: 18 },
  premiumBadge: {
    marginLeft: 'auto',
    backgroundColor: COLORS.orange,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  premiumText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.6 },

  chatContent: { padding: 14, paddingBottom: 8, gap: 14 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerLabel: { fontSize: 11, color: COLORS.grey, fontWeight: '500' },

  userRow: { alignItems: 'flex-end' },
  userBubble: {
    maxWidth: '78%',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 11,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  userBubbleText: { fontSize: 14, color: '#FFFFFF', lineHeight: 21 },

  aiRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 18,
  },
  aiAvatarText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  aiBubble: {
    maxWidth: '78%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  aiBubbleText: { fontSize: 14, color: COLORS.text, lineHeight: 22 },
  paywallBubble: { backgroundColor: '#FEF3EC', borderColor: '#F05A1A' },
  paywallText: { fontSize: 14, color: COLORS.text, lineHeight: 20, marginBottom: 10 },
  paywallBtn: {
    backgroundColor: '#F05A1A', borderRadius: 10,
    paddingVertical: 9, paddingHorizontal: 14, alignSelf: 'flex-start',
  },
  paywallBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  micBtn: { padding: 6 },
  textInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.border },
  sendIcon: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' },
});
