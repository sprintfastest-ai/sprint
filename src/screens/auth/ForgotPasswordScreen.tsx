import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import client from '@/api/client';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await client.post('/auth/forgot-password', { email });
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      {sent ? (
        <Text style={styles.success}>
          Check your email for reset instructions.
        </Text>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Sending…' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    padding: 24,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 32 },
  success: { color: '#4CAF50', fontSize: 16, marginBottom: 24 },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    marginBottom: 12,
    fontSize: 16,
  },
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
