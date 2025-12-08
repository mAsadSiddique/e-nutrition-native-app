import AuthButton from '@/src/components/auth/AuthButton';
import AuthCodeInput from '@/src/components/auth/AuthCodeInput';
import AuthLayout from '@/src/components/auth/AuthLayout';
import { useResendVerification, useResetPassword } from '@/src/services/authApi';
import { TypographyStyles } from '@/src/theme/theme';
import { ForgotPasswordData, forgotPasswordStorage } from '@/src/utils/forgotPasswordStorage';
import { toast } from '@/utils/toast';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
export default function ForgotPasswordCodeScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(240); // 4 minutes = 240 seconds
  const [canResend, setCanResend] = useState(false);
  const [storedData, setStoredData] = useState<ForgotPasswordData | null>(null);

  const { mutate: resendCode, isPending: resendLoading } = useResendVerification();
  const { mutate: resetPassword, isPending: resetLoading } = useResetPassword();

  // Load stored data on component mount
  useEffect(() => {
    const loadStoredData = async () => {
      const data = await forgotPasswordStorage.retrieve();
      if (!data) {
        toast.error('Session expired. Please start over.');
        router.replace('/auth/forgot-password');
        return;
      }
      setStoredData(data);
    };
    loadStoredData();
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Format countdown time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    if (!storedData) {
      toast.error('Session expired. Please start over.');
      router.replace('/auth/forgot-password');
      return;
    }

    // Prepare final payload as specified
    const payload = {
      email: storedData.email,
      password: storedData.newPassword,
      confirmPassword: storedData.confirmPassword,
      code: code
    };

    // Call reset password API
    resetPassword(payload, {
      onSuccess: async (data: any) => {
        if (data.status === 200) {
          // Clear stored data
          await forgotPasswordStorage.clear();
          
          // Show success toast
          toast.success(data.message || 'Password reset successfully!');
          
          // Redirect to login screen
          router.replace('/auth/sign-in/email');
        }
      },
      onError: (error: any) => {
        // Show backend error message
        const errorMessage = error?.response?.data?.message || 'Failed to reset password';
        toast.error(errorMessage);
      }
    });
  };

  const handleResendCode = () => {
    if (!storedData) {
      toast.error('Session expired. Please start over.');
      router.replace('/auth/forgot-password');
      return;
    }

    resendCode({
      email: storedData.email
    }, {
      onSuccess: (data: any) => {
        if (data.status === 200) {
          toast.success(data.message);
          // Restart countdown
          setCountdown(240);
          setCanResend(false);
        }
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to resend verification code';
        toast.error(errorMessage);
      }
    });
  };

  return (
    <>
     <Stack.Screen options={{ headerShown: false }} />
    <AuthLayout>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Check your inbox</Text>
          <Text style={styles.subtitle}>
            Enter the code we sent to {storedData?.email || 'your email'} to reset your password.
          </Text>
        </View>

        <View style={styles.form}>
          <AuthCodeInput
            value={code}
            onChange={setCode}
            length={6}
          />

          <AuthButton
            text="Continue"
            onPress={handleVerifyCode}
            variant="primary"
            disabled={code.length !== 6 || !storedData}
            loading={resetLoading}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Didn’t receive the code?{' '}
              {!canResend ? (
                <Text style={styles.timerText}>
                  Resend in {formatTime(countdown)}
                </Text>
              ) : (
                <Text
                  style={[styles.resendLink, resendLoading && styles.resendDisabled]}
                  onPress={resendLoading ? undefined : handleResendCode}
                >
                  {resendLoading ? 'Sending...' : 'Resend code'}
                </Text>
              )}
            </Text>
          </View>

        </View>
      </View>
    </AuthLayout>
    </>

  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    ...TypographyStyles.h3,
    textAlign: 'center',
    color: '#000',
    fontSize: 28,
    marginBottom: 16,
  },
  subtitle: {
    ...TypographyStyles.body,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  countdownText: {
    ...TypographyStyles.bodySmall,

    color: '#666',
    fontSize: 14,
  },
  resendButton: {
    padding: 8,
  },
  timerText: {
    fontSize: 14,
    color: '#00994C',
    fontWeight: '800',
  },
  resendText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  resendLink: {
    fontSize: 14,
    color: '#1A8F46',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  resendDisabled: {
    opacity: 0.5,
  }
});
