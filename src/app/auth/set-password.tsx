import AuthButton from '@/src/components/auth/AuthButton';
import AuthLayout from '@/src/components/auth/AuthLayout';
import { useSetPassword } from '@/src/services/authApi';
import { TypographyStyles } from '@/src/theme/theme';
import { toast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SetPasswordScreen() {
  const router = useRouter();
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: setNewPassword, isPending: loading } = useSetPassword();

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

  const handleSetPassword = async () => {
    if (!isPasswordValid) {
      toast.error('Password must meet all requirements');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Call the set password API
    setNewPassword({
      password,
      confirmPassword
    }, {
      onSuccess: (data: any) => {
        if (data.status === 200) {
          toast.success('Password reset successful!');
          // Navigate to sign-in with email pre-filled
          router.replace({
            pathname: '/auth/sign-in/email',
            params: { email }
          });
        }
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || error?.message || 'Password reset failed';
        toast.error(errorMessage);
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
              <Text style={styles.title}>Set new password</Text>
              <Text style={styles.subtitle}>
                Create a strong password for your account
              </Text>
            </View>

            <View style={styles.form}>
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
                <Text style={styles.label}>Confirm Password</Text>
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
                onPress={handleSetPassword}
                variant="primary"
                disabled={!isPasswordValid || password !== confirmPassword}
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
    paddingHorizontal: 24,
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
