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
export default function SignUpCodeScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { signIn } = useAuth();
  const [code, setCode] = useState('');
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { mutate: verifyCode, isPending: verifyLoading } = useVerification();
  const { mutate: resendCode, isPending: resendLoading } = useResendVerification();

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Start countdown timer
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

  // Initialize timer on component mount
  useEffect(() => {
    startTimer();
    
    // Cleanup on unmount
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

    // Call the verification API
    verifyCode({
      email,
      code
    }, {
      onSuccess: async (data: any) => {
        if (data.status === 200) {
          toast.success(data.message || 'Your account has been successfully verified!');
          if (data.data && data.data.token) {
            await signIn(data.data.token);
          }
          router.replace('/auth/sign-in/email');
        }
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || error?.message || 'Verification failed';
        toast.error(errorMessage);
      }
    });
  };

  const handleResendCode = () => {
    if (!email) {
      toast.error('Email address is missing');
      return;
    }

    if (isResendDisabled) {
      return; // Button should be disabled, but just in case
    }

    // Call resend API
    resendCode({
      email
    }, {
      onSuccess: (data: any) => {
        if (data.status === 200) {
          toast.success(data.message || 'A new verification code has been sent to your email.');
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
          const errorMessage = errorData?.message || error?.message || 'Failed to resend verification code';
          toast.error(errorMessage);
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
            loading={verifyLoading}
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
    marginTop: 26,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',

  },
  resendLink: {
    color: '#00994C',
    fontWeight: '700',
    fontSize: 14,
  },
  resendDisabled: {
    color: '#999',
    textDecorationLine: 'none',
  },
  timerText: {
    color: '#00994C',
    fontWeight: '700',
  },
});
