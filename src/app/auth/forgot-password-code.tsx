import AuthButton from '@/src/components/auth/AuthButton';
import AuthCodeInput from '@/src/components/auth/AuthCodeInput';
import AuthLayout from '@/src/components/auth/AuthLayout';
import { useResendVerification, useResetPassword } from '@/src/services/authApi';
import { TypographyStyles } from '@/src/theme/theme';
import { toast } from '@/src/utils/toast';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as yup from 'yup';

// Type definition for stored forgot password data
interface ForgotPasswordData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

// Storage utility for forgot password data
const FORGOT_PASSWORD_STORAGE_KEY = '@forgot_password_data';

const forgotPasswordStorage = {
  store: async (data: ForgotPasswordData) => {
    try {
      await AsyncStorage.setItem(FORGOT_PASSWORD_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing forgot password data:', error);
      throw error;
    }
  },
  retrieve: async (): Promise<ForgotPasswordData | null> => {
    try {
      const data = await AsyncStorage.getItem(FORGOT_PASSWORD_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving forgot password data:', error);
      return null;
    }
  },
  clear: async () => {
    try {
      await AsyncStorage.removeItem(FORGOT_PASSWORD_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing forgot password data:', error);
    }
  },
};

// Validation schema
const forgotPasswordCodeSchema = yup.object().shape({
  code: yup
    .string()
    .required('Please enter the verification code')
    .length(6, 'The verification code must be exactly 6 digits')
    .matches(/^\d+$/, 'The verification code must contain only numbers'),
});

type ForgotPasswordCodeFormData = yup.InferType<typeof forgotPasswordCodeSchema>;

export default function ForgotPasswordCodeScreen() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(300); // 5 minutes = 300 seconds
  const [canResend, setCanResend] = useState(false);
  const [storedData, setStoredData] = useState<ForgotPasswordData | null>(null);
  const [codeError, setCodeError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { mutate: resendCode, isPending: resendLoading } = useResendVerification();
  const { mutate: resetPassword, isPending: resetLoading } = useResetPassword();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<ForgotPasswordCodeFormData>({
    resolver: yupResolver(forgotPasswordCodeSchema),
    defaultValues: {
      code: '',
    },
    mode: 'onChange',
  });

  const codeValue = watch('code');

  // Clear error when user starts typing
  React.useEffect(() => {
    if (codeValue && codeError) {
      setCodeError(false);
      setErrorMessage('');
    }
  }, [codeValue, codeError]);

  // Auto-submit when all digits are entered
  React.useEffect(() => {
    if (codeValue && codeValue.length === 6 && !resetLoading && !codeError && storedData) {
      // Small delay to ensure the last digit is properly set
      const timer = setTimeout(() => {
        handleSubmit(onSubmit)();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [codeValue, resetLoading, codeError, storedData]);

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

  const onSubmit = async (data: ForgotPasswordCodeFormData) => {
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
      code: data.code,
    };

    // Call reset password API
    resetPassword(payload, {
      onSuccess: async (response: any) => {
        if (response.status === 200) {
          // Clear stored data
          await forgotPasswordStorage.clear();

          // Show success toast
          toast.success(response.message || 'Password reset successfully!');

          // Redirect to login screen
          router.replace('/auth/sign-in/email');
        }
      },
      onError: (error: any) => {
        // Set error state to show red borders
        setCodeError(true);
        setErrorMessage('The verification code you entered is incorrect. Please check and try again.');
        // Clear the code input
        setValue('code', '');
      },
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
          setCountdown(300);
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit verification code to {storedData?.email || 'your email address'}. Please enter the code below to reset your password.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.codeInputContainer}>
                <Controller
                  control={control}
                  name="code"
                  render={({ field: { onChange, value } }) => (
                    <AuthCodeInput
                      value={value}
                      onChange={onChange}
                      length={6}
                      error={codeError}
                    />
                  )}
                />
                {(isSubmitted && errors.code) && (
                  <Text style={styles.errorText}>
                    {errors.code.message}
                  </Text>
                )}
                {codeError && errorMessage && (
                  <Text style={styles.errorText}>
                    {errorMessage}
                  </Text>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <AuthButton
                  text="Verify Code"
                  onPress={handleSubmit(onSubmit)}
                  variant="primary"
                  disabled={!storedData}
                  loading={resetLoading}
                />
              </View>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>
                  Didn't receive the code?{' '}
                  {!canResend ? (
                    <Text style={styles.timerText}>
                      Resend in {formatTime(countdown)}
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={resendLoading ? undefined : handleResendCode}
                      disabled={resendLoading}
                    >
                      <Text style={[styles.resendLink, resendLoading && styles.resendDisabled]}>
                        {resendLoading ? 'Sending...' : 'Resend code'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </AuthLayout>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
    // paddingHorizontal: 20,
  },
  title: {
    ...TypographyStyles.h3,
    textAlign: 'center',
    color: '#000',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    ...TypographyStyles.body,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    flex: 1,
    // paddingHorizontal: 20,
  },
  codeInputContainer: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    marginBottom: 32,
  },
  buttonContainer: {
    marginTop: 0,
    marginBottom: 0,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  resendText: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  timerText: {
    fontSize: 14,
    color: '#00994C',
    fontWeight: '600',
  },
  resendLink: {
    fontSize: 14,
    color: '#00994C',
    fontWeight: '600',
  },
  resendDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 16,
    textAlign: 'center',
  },
});
