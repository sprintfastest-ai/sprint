import React, { useState } from 'react';
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
import { chatApi } from '@/api/chat';
import { useAuth } from '@/hooks/useAuth';
import type { ChatMessage } from '@/types';

export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    const content = input.trim();
    setInput('');
    setIsLoading(true);
    try {
      const reply = await chatApi.sendMessage(user.id, content);
      setMessages((prev) => [...prev, reply]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>AI Coach</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={styles.bubbleText}>{item.content}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask your coach…"
          placeholderTextColor="#666"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={sendMessage}
          disabled={isLoading}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    padding: 24,
    paddingTop: 60,
  },
  list: { padding: 16, gap: 8 },
  bubble: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  userBubble: { backgroundColor: '#ff6b35', alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: '#1a1a1a', alignSelf: 'flex-start' },
  bubbleText: { color: '#fff', fontSize: 15 },
  inputRow: { flexDirection: 'row', padding: 16, gap: 8 },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontWeight: '700' },
});
