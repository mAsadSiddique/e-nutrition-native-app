import AuthButton from '@/src/components/auth/AuthButton';
import AuthLayout from '@/src/components/auth/AuthLayout';
import { TypographyStyles } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignInEmailScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleContinue = async () => {
    if (!isEmailValid) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!isPasswordValid) {
      Alert.alert('Error', 'Password must meet all requirements');
      return;
    }

    setLoading(true);

    try {
      // TODO: Uncomment when backend is ready
      // const { token } = await requestLogin(email.trim(), password.trim());
      
      // For now, simulate success and go directly to category selection
      setTimeout(() => {
        // Store mock token in AuthContext
        signIn('mock-token-for-testing');
        console.log('Login successful (mock)');
        setLoading(false);
        router.replace('/category-selection'); // Navigate to category selection
      }, 1000);
      
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to sign in'
      );
      setLoading(false);
    }
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
              <Text style={styles.title}>Sign in with email</Text>
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
                 <TouchableOpacity onPress={() => router.push("/auth/forgot-password")}>
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>

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

                {/* ⭐ Add Forget Password Link Here */}
               
              </View>

              <AuthButton
                text="Sign in"
                onPress={handleContinue}
                variant="primary"
                disabled={!isEmailValid || !isPasswordValid}
                loading={loading}
              />

              <Text style={styles.terms}>
                By signing in, you agree to our{' '}
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
  forgotPassword: {
    ...TypographyStyles.bodySmall,
    marginTop: 12,
    textAlign: "right",
    color: "#1a73e8", 
    fontSize: 12,
    textDecorationLine: "underline",
    fontWeight: "500",
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
