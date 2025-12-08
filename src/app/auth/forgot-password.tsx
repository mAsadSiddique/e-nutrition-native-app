import AuthButton from '@/src/components/auth/AuthButton';
import AuthLayout from '@/src/components/auth/AuthLayout';
import { TypographyStyles } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      hasAtSymbol: email.includes('@'),
      isValidFormat: emailRegex.test(email)
    };
  };

  const emailValidation = validateEmail(email);
  const isEmailValid = emailValidation.hasAtSymbol && emailValidation.isValidFormat;

  const handleResetPassword = async () => {
    if (!isEmailValid) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // TODO: Uncomment when backend is ready
      // await requestPasswordReset(email.trim());
      
      // For now, simulate success
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          'Success', 
          'Password reset instructions have been sent to your email.',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      }, 1000);
      
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send reset email'
      );
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
            {email.length > 0 && !isEmailValid && (
              <Text style={[styles.validationText, styles.invalidText]}>
                ✗ Please enter a valid email address
              </Text>
            )}
          </View>

          <AuthButton
            text="Send reset instructions"
            onPress={handleResetPassword}
            variant="primary"
            disabled={!isEmailValid}
            loading={loading}
          />
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    ...TypographyStyles.h2,
    textAlign: 'center',
    marginBottom: 16,
    color: '#222',
  },
  subtitle: {
    ...TypographyStyles.body,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    ...TypographyStyles.body,
    color: '#222',
    marginBottom: 8,
    fontSize: 16,
    lineHeight: 24,
  },
  input: {
    ...TypographyStyles.body,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    fontSize: 14,
    color: '#222',
  },
  validationText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  invalidText: {
    color: '#dc3545',
  },
});
