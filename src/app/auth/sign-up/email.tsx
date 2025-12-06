import AuthButton from '@/src/components/auth/AuthButton';
import AuthLayout from '@/src/components/auth/AuthLayout';
import { useSignup } from '@/src/services/authApi';
import { TypographyStyles } from '@/src/theme/theme';
import { toast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpEmailScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: signup, isPending: loading } = useSignup();

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

  const handleCreateAccount = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (!isEmailValid) {
      toast.error('Please enter a valid email address');
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

    // Call the signup API
    signup({
      username: username.trim(),
      email: email.trim(),
      password,
      confirmPassword
    }, {
      onSuccess: (data: any) => {
        if (data.status === 200) {
          // Show success toast
          toast.success(data.message);
          // Navigate to verification screen with email
          router.push({
            pathname: '/auth/sign-up/code',
            params: { email }
          });
        }
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || error?.message || 'Signup failed';
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
              <Text style={styles.logo}>Nutrition</Text>
              <Text style={styles.title}>Create your account</Text>
            </View>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username"
                  autoCapitalize="none"
                  autoComplete="username"
                  editable={!loading}
                />
                {username.length > 0 && username.length < 3 && (
                  <Text style={[styles.validationText, styles.invalidText]}>
                    ✗ Username must be at least 3 characters
                  </Text>
                )}
              </View>

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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
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
                <Text style={styles.label}>Confirm password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
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
                text="Create account"
                onPress={handleCreateAccount}
                variant="primary"
                disabled={!username.trim() || username.length < 3 || !isEmailValid || !isPasswordValid || password !== confirmPassword}
                loading={loading}
              />

              <Text style={styles.terms}>
                By signing up, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and acknowledge that our{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
                {' '}applies to you.
              </Text>
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
    marginBottom: 48,
  },
  logo: {
    ...TypographyStyles.h2,
    marginBottom: 32,
    color: '#222',
  },
  title: {
    ...TypographyStyles.h3,
    textAlign: 'center',
    color: '#000',
    fontSize: 28,
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
    paddingVertical: 8,
    backgroundColor: '#fff',
    fontSize: 14,
    color: '#222',
  },
  terms: {
    ...TypographyStyles.bodySmall,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 13,
    marginTop: 16,
  },
  termsLink: {
    color: '#00994C',
    textDecorationLine: 'underline',
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
  eyeIcon: {
    fontSize: 18,
    color: '#666',
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
