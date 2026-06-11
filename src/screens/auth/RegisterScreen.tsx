import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import type { AuthStackParamList } from '@/navigation/types';
import type { User } from '@/types';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const ROLES: User['role'][] = ['athlete', 'parent', 'coach'];

export default function RegisterScreen() {
  const navigation = useNavigation<NavProp>();
  const { register, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<User['role']>('athlete');

  const handleRegister = async () => {
    try {
      await register(email, password, role);
    } catch {}
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text style={styles.label}>I am a…</Text>
      <View style={styles.roleRow}>
        {ROLES.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.roleButton, role === r && styles.roleButtonActive]}
            onPress={() => setRole(r)}
          >
            <Text
              style={[styles.roleText, role === r && styles.roleTextActive]}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Creating account…' : 'Create Account'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 32,
  },
  error: { color: '#ff4444', marginBottom: 16 },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    marginBottom: 12,
    fontSize: 16,
  },
  label: { color: '#888', marginBottom: 12, fontSize: 14 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#ff6b35',
    backgroundColor: '#ff6b3520',
  },
  roleText: { color: '#888', fontWeight: '600' },
  roleTextActive: { color: '#ff6b35' },
  button: {
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: {
    color: '#ff6b35',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});
