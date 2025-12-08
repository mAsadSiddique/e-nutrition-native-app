import { TypographyStyles } from '@/src/constants/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AuthButtonProps {
  text: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  leftIcon?: React.ReactElement;
  disabled?: boolean;
  loading?: boolean;
}

export default function AuthButton({
  text,
  onPress,
  variant = 'outline',
  leftIcon,
  disabled = false,
  loading = false
}: AuthButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isPrimary ? styles.buttonPrimary : styles.buttonOutline,
        (disabled || loading) && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? '#fff' : '#00994C'}
          size="small"
        />
      ) : (
        <>
          {leftIcon && (
            <View style={styles.iconContainer}>
              {leftIcon}
            </View>
          )}
          <Text style={[
            styles.buttonText,
            isPrimary ? styles.buttonTextPrimary : styles.buttonTextOutline,
          ]}>
            {text}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    width: '100%',
    minHeight: 48,
    borderRadius: 999,
    marginBottom: 16,
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#1A8917',
  },
  buttonOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...TypographyStyles.body,
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: -0.2,
    left: 16,

  },
  buttonTextPrimary: {
    color: '#fff',
  },
  buttonTextOutline: {
    color: '#1F1F1F',
  },
  iconContainer: {
    position: 'absolute',
    left: 20,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
