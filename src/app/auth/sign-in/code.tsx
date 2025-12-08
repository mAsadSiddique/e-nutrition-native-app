import AuthButton from '@/src/components/auth/AuthButton';
import AuthCodeInput from '@/src/components/auth/AuthCodeInput';
import AuthLayout from '@/src/components/auth/AuthLayout';
import { useAuth } from '@/src/contexts/AuthContext';
import { useResendVerification, useVerification } from '@/src/services/authApi';
import { TypographyStyles } from '@/src/theme/theme';
import { toast } from '@/utils/toast';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SignInCodeScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { signIn } = useAuth();
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const { mutate: verifyCode, isPending: loading } = useVerification();
  const { mutate: resendCode, isPending: resendLoading } = useResendVerification();
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  const startTimer = () => {
    setTimeLeft(300);
    setIsResendDisabled(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setIsResendDisabled(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    if (!email) {
      toast.error('Email address is missing');
      return;
    }
    verifyCode({
      email,
      code
    }, {
      onSuccess: async (data: any) => {
        if (data.success && data.data) {
          toast.success('Welcome! Redirecting to your dashboard...');
          await signIn(data.data.token);
          router.replace('/(tabs)/(home)');
        }
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Invalid verification code. Please try again.');
      }
    });
  };

  const handleResendCode = () => {
    if (!email) {
      toast.error('Email address is missing');
      return;
    }
    if (isResendDisabled) {
      return;
    }
    resendCode({
      email
    }, {
      onSuccess: (data: any) => {
        if (data.success) {
          toast.success('A new verification code has been sent to your email.');
          // Restart timer
          startTimer();
        }
      },
      onError: (error: any) => {
        const errorData = error?.response?.data;
        if (error?.response?.status === 429) {
          // Handle rate limiting
          toast.error(errorData?.message || 'Please wait before requesting another code.');
          // Do NOT restart timer for 429 errors
        } else {
          toast.error(errorData?.message || 'Something went wrong. Please try again.');
        }
      }
    });
  };

  return (
    <AuthLayout>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Check your inbox</Text>
          <Text style={styles.subtitle}>
            Enter the code we sent to {email} to sign in.
          </Text>
        </View>

        <View style={styles.form}>
          <AuthCodeInput
            length={6}
            value={code}
            onChange={setCode}
          />

          <AuthButton
            text="Validate"
            onPress={handleVerifyCode}
            variant="primary"
            disabled={code.length !== 6}
            loading={loading}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Didn't receive the code?{' '}
              {isResendDisabled ? (
                <Text style={styles.timerText}>
                  Resend in {formatTime(timeLeft)}
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
  resendContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    ...TypographyStyles.body,
    color: '#666',
    textAlign: 'center',
  },
  resendLink: {
    color: '#00994C',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendDisabled: {
    color: '#999',
    textDecorationLine: 'none',
  },
  timerText: {
    color: '#00994C',
    fontWeight: '600',
  },
});
