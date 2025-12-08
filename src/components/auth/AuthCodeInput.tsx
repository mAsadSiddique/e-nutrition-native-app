import { TypographyStyles } from '@/src/constants/theme';
import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface AuthCodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

export default function AuthCodeInput({ 
  length = 6, 
  value, 
  onChange 
}: AuthCodeInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChangeText = (text: string, index: number) => {
    const newValue = value.split('');
    newValue[index] = text;
    
    const updatedValue = newValue.join('').slice(0, length);
    onChange(updatedValue);

    // Auto-focus next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }, (_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={[
            styles.input,
            focusedIndex === index && styles.inputFocused,
            value[index] && styles.inputFilled,
          ]}
          value={value[index] || ''}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
          onFocus={() => handleFocus(index)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          textAlign="center"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 32,
  },
  input: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    ...TypographyStyles.h3,
    textAlign: 'center',
    color: '#222',
  },
  inputFocused: {
    borderColor: '#00994C',
    borderWidth: 2,
  },
  inputFilled: {
    backgroundColor: '#f8f8f8',
    borderColor: '#00994C',
  },
});
