import AuthButton from '@/src/components/auth/AuthButton';
import AuthCodeInput from '@/src/components/auth/AuthCodeInput';
import AuthLayout from '@/src/components/auth/AuthLayout';
import { useResetPassword } from '@/src/services/authApi';
import { TypographyStyles } from '@/src/theme/theme';
import { toast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: resetPassword, isPending: loading } = useResetPassword();

  // Password validation
  const validatePassword = (pwd: string) => {
    return {
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };
  };

  const passwordValidation = validatePassword(password);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleResetPassword = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    if (!isPasswordValid) {
      toast.error('Password must meet all requirements');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!email) {
      toast.error('Email address is missing');
      return;
    }

    // Call the reset password API
    resetPassword({
      email,
      phoneNumber,
      code,
      password,
      confirmPassword
    }, {
      onSuccess: (data: any) => {
        if (data.success) {
          toast.success('Password reset successfully!');
          router.replace('/auth/sign-in/email');
        }
      },
      onError: (error: any) => {
        const errorData = error?.response?.data;
        if (errorData?.message) {
          if (Array.isArray(errorData.message)) {
            // Show the first validation error
            toast.error(errorData.message[0]);
          } else {
            toast.error(errorData.message);
          }
        } else {
          toast.error('Failed to reset password. Please try again.');
        }
      }
    });
  };

  return (
    <AuthLayout>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Reset your password</Text>
              <Text style={styles.subtitle}>
                Enter your phone number, the code we sent to {email}, and your new password.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter your phone number with country code"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verification Code</Text>
                <AuthCodeInput
                  length={6}
                  value={code}
                  onChange={setCode}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your new password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="off"
                    textContentType="none"
                    importantForAutofill="no"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <Ionicons
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {password.length > 0 && (
                  <View style={styles.validationContainer}>
                    <Text style={[styles.validationText, passwordValidation.minLength ? styles.validText : styles.invalidText]}>
                      {passwordValidation.minLength ? '✓' : '✗'} Minimum 8 characters
                    </Text>
                    <Text style={[styles.validationText, passwordValidation.hasUppercase ? styles.validText : styles.invalidText]}>
                      {passwordValidation.hasUppercase ? '✓' : '✗'} At least 1 uppercase
                    </Text>
                    <Text style={[styles.validationText, passwordValidation.hasLowercase ? styles.validText : styles.invalidText]}>
                      {passwordValidation.hasLowercase ? '✓' : '✗'} At least 1 lowercase
                    </Text>
                    <Text style={[styles.validationText, passwordValidation.hasNumber ? styles.validText : styles.invalidText]}>
                      {passwordValidation.hasNumber ? '✓' : '✗'} At least 1 number
                    </Text>
                    <Text style={[styles.validationText, passwordValidation.hasSpecialChar ? styles.validText : styles.invalidText]}>
                      {passwordValidation.hasSpecialChar ? '✓' : '✗'} At least 1 special character
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your new password"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="off"
                    textContentType="none"
                    importantForAutofill="no"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <Text style={[styles.validationText, styles.invalidText]}>
                    ✗ Passwords do not match
                  </Text>
                )}
              </View>

              <AuthButton
                text="Reset Password"
                onPress={handleResetPassword}
                variant="primary"
                disabled={!phoneNumber.trim() || code.length !== 6 || !isPasswordValid || password !== confirmPassword}
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
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
  inputGroup: {
    marginBottom: 15,
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
    paddingVertical: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#000',
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    ...TypographyStyles.body,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingRight: 40,
    backgroundColor: '#fff',
    fontSize: 14,
    color: '#222',
    flex: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  validationContainer: {
    marginTop: 8,
  },
  validationText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  validText: {
    color: '#00994C',
  },
  invalidText: {
    color: '#dc3545',
  },
});
