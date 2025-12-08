import AuthButton from '@/src/components/auth/AuthButton';
import AuthCodeInput from '@/src/components/auth/AuthCodeInput';
import AuthLayout from '@/src/components/auth/AuthLayout';
import { TypographyStyles } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function SignUpCodeScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { signIn } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email address is missing');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Uncomment when backend is ready
      // const { token } = await verifySignUpCode(email, code);
      
      // For now, simulate success
      setTimeout(() => {
        signIn('mock-token-for-testing');
        setLoading(false);
        router.replace('/category-selection'); // Navigate to category selection
      }, 1000);
      
    } catch (error) {
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Invalid verification code'
      );
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
  };

  return (
    <AuthLayout>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Check your inbox</Text>
          <Text style={styles.subtitle}>
            Enter the code we sent to {email} to complete your account setup.
          </Text>
        </View>

        <View style={styles.form}>
          <AuthCodeInput
            length={6}
            value={code}
            onChange={setCode}
          />

          <AuthButton
            text="Verify Code"
            onPress={handleVerifyCode}
            variant="primary"
            disabled={code.length !== 6}
            loading={loading}
          />

          <Text style={styles.resendText}>
            Didn't receive the code?{' '}
            <Text 
              style={styles.resendLink}
              onPress={handleResendCode}
            >
              Resend code
            </Text>
          </Text>
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
    marginBottom: 32,
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
  resendText: {
    ...TypographyStyles.body,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
  },
  resendLink: {
    color: '#00994C',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
