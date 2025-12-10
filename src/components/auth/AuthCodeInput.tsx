import React from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

interface AuthCodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export default function AuthCodeInput({ 
  length = 6, 
  value, 
  onChange,
  error = false,
}: AuthCodeInputProps) {
  const ref = useBlurOnFulfill({ value, cellCount: length });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue: onChange,
  });

  return (
    <CodeField
      ref={ref}
      {...props}
      value={value}
      onChangeText={onChange}
      cellCount={length}
      rootStyle={styles.rootStyle}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      renderCell={({ index, symbol, isFocused }: { index: number; symbol: string; isFocused: boolean }) => (
        <Text
          key={index}
          style={[
            styles.cell,
            isFocused && !error && styles.cellFocused,
            symbol && !error && styles.cellFilled,
            error && styles.cellError,
          ]}
          onLayout={getCellOnLayoutHandler(index)}>
          {symbol || (isFocused ? <Cursor /> : null)}
        </Text>
      )}
    />
  );
}

const styles = StyleSheet.create({
  rootStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  cell: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 24,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    lineHeight: 54,
    overflow: 'hidden',
  },
  cellFocused: {
    borderColor: '#00994C',
    borderWidth: 2,
  },
  cellFilled: {
    backgroundColor: '#f8f8f8',
    borderColor: '#00994C',
  },
  cellError: {
    borderColor: '#dc3545',
    borderWidth: 2,
    backgroundColor: '#fff5f5',
  },
});
