import AuthButton from '@/src/components/auth/AuthButton';
import AuthCodeInput from '@/src/components/auth/AuthCodeInput';
import AuthLayout from '@/src/components/auth/AuthLayout';
import { useResetPassword } from '@/src/services/authApi';
import { TypographyStyles } from '@/src/theme/theme';
import { validateConfirmPassword, validatePasswordRules, validatePhoneNumber, validateVerificationCode } from '@/src/utils/validators';
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
  const [submitted, setSubmitted] = useState(false);

  // Error states
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const { mutate: resetPassword, isPending: loading } = useResetPassword();

  const handleResetPassword = async () => {
    setSubmitted(true);

    // Validate all fields
    const phoneErr = validatePhoneNumber(phoneNumber);
    const codeErr = validateVerificationCode(code, 6);
    const passwordValidation = validatePasswordRules(password);
    const passwordErr = passwordValidation.isValid ? null : 'Password must meet all requirements';
    const confirmPasswordErr = validateConfirmPassword(password, confirmPassword);

    // Set error states
    setPhoneNumberError(phoneErr);
    setCodeError(codeErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmPasswordErr);

    // If any validation fails, stop here
    if (phoneErr || codeErr || passwordErr || confirmPasswordErr) {
      return;
    }

    if (!email) {
      toast.error('Email address is missing');
      return;
    }

    // Call the reset password API
    resetPassword({
      email,
      // phoneNumber,
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
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    if (submitted) {
                      setPhoneNumberError(validatePhoneNumber(text));
                    }
                  }}
                  placeholder="Enter your phone number with country code"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
                {submitted && phoneNumberError && (
                  <Text style={[styles.validationText, styles.invalidText]}>
                    ✗ {phoneNumberError}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verification Code</Text>
                <AuthCodeInput
                  length={6}
                  value={code}
                  onChange={(text) => {
                    setCode(text);
                    if (submitted) {
                      setCodeError(validateVerificationCode(text, 6));
                    }
                  }}
                />
                {submitted && codeError && (
                  <Text style={[styles.validationText, styles.invalidText]}>
                    ✗ {codeError}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (submitted) {
                        const validation = validatePasswordRules(text);
                        setPasswordError(validation.isValid ? null : 'Password must meet all requirements');
                        // Re-validate confirm password if it has been entered
                        if (confirmPassword) {
                          setConfirmPasswordError(validateConfirmPassword(text, confirmPassword));
                        }
                      }
                    }}
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
                {submitted && (() => {
                  const passwordValidation = validatePasswordRules(password);
                  const failingRules = [];
                  
                  if (!passwordValidation.rules.minLength) {
                    failingRules.push('Minimum 8 characters');
                  }
                  if (!passwordValidation.rules.hasUppercase) {
                    failingRules.push('At least 1 uppercase');
                  }
                  if (!passwordValidation.rules.hasLowercase) {
                    failingRules.push('At least 1 lowercase');
                  }
                  if (!passwordValidation.rules.hasNumber) {
                    failingRules.push('At least 1 number');
                  }
                  if (!passwordValidation.rules.hasSpecialChar) {
                    failingRules.push('At least 1 special character');
                  }
                  
                  if (failingRules.length === 0) {
                    return null;
                  }
                  
                  return (
                    <View style={styles.validationContainer}>
                      {failingRules.map((rule, index) => (
                        <Text key={index} style={[styles.validationText, styles.invalidText]}>
                          ✗ {rule}
                        </Text>
                      ))}
                    </View>
                  );
                })()}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (submitted) {
                        setConfirmPasswordError(validateConfirmPassword(password, text));
                      }
                    }}
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
                {submitted && confirmPasswordError && (
                  <Text style={[styles.validationText, styles.invalidText]}>
                    ✗ {confirmPasswordError}
                  </Text>
                )}
              </View>

              <AuthButton
                text="Reset Password"
                onPress={handleResetPassword}
                variant="primary"
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
