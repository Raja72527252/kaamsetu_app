import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
}

export function OtpInput({ value, onChange, length = 4 }: OtpInputProps) {
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const chars = value.split('');
    chars[index] = digit;
    const newVal = chars.join('').slice(0, length);
    onChange(newVal);

    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(ref) => {
            inputs.current[i] = ref;
          }}
          style={[styles.box, Boolean(value[i]) && styles.boxFilled]}
          value={value[i] || ''}
          onChangeText={(text) => handleChange(text, i)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
          selectTextOnFocus
          accessibilityLabel={`OTP Digit ${i + 1}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginVertical: 14,
  },
  box: {
    width: 58,
    height: 64,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
    textAlign: 'center',
  },
  boxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '0A',
  },
});
