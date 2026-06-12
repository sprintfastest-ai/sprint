import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextInputProps,
} from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  /** Shows a show/hide toggle when true */
  secureText?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Labeled text input with inline error message and optional secure-text toggle.
 */
export default function Input({
  label,
  error,
  secureText = false,
  containerStyle,
  ...textInputProps
}: InputProps) {
  const [hidden, setHidden] = useState(secureText);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        <TextInput
          {...textInputProps}
          secureTextEntry={hidden}
          style={styles.input}
          placeholderTextColor="#555"
          selectionColor="#ff6b35"
        />
        {secureText ? (
          <TouchableOpacity
            onPress={() => setHidden((h) => !h)}
            style={styles.eyeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.eyeText}>{hidden ? 'Show' : 'Hide'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  inputRowError: {
    borderColor: '#ff4444',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 14,
  },
  eyeText: {
    color: '#ff6b35',
    fontSize: 13,
    fontWeight: '600',
  },
  error: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },
});
