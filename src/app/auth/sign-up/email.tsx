import AuthButton from '@/src/components/auth/AuthButton';
import AuthLayout from '@/src/components/auth/AuthLayout';
import { useSignup } from '@/src/services/authApi';
import { TypographyStyles } from '@/src/theme/theme';
import { validateConfirmPassword, validateEmail, validatePasswordRules, validateUsername } from '@/src/utils/validators';
import { toast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SignUpEmailScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Error states
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const { mutate: signup, isPending: loading } = useSignup();

  const handleCreateAccount = async () => {
    setSubmitted(true);

    // Validate all fields
    const usernameErr = validateUsername(username);
    const emailErr = validateEmail(email);
    const passwordValidation = validatePasswordRules(password);
    const passwordErr = passwordValidation.isValid ? null : 'Password must meet all requirements';
    const confirmPasswordErr = validateConfirmPassword(password, confirmPassword);

    // Set error states
    setUsernameError(usernameErr);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmPasswordErr);

    // If any validation fails, stop here
    if (usernameErr || emailErr || passwordErr || confirmPasswordErr) {
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
              {/* <Text style={styles.logo}>Nutrition</Text> */}
              <Text style={styles.title}>Create your account</Text>
            </View>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (submitted) {
                      setUsernameError(validateUsername(text));
                    }
                  }}
                  placeholder=" username"
                  autoCapitalize="none"
                  autoComplete="username"
                  editable={!loading}
                />
                {submitted && usernameError && (
                  <Text style={[styles.validationText, styles.invalidText]}>
                    ✗ {usernameError}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (submitted) {
                      setEmailError(validateEmail(text));
                    }
                  }}
                  placeholder="email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                />
                {submitted && emailError && (
                  <Text style={[styles.validationText, styles.invalidText]}>
                    ✗ {emailError}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (submitted) {
                        const validation = validatePasswordRules(text);
                        setPasswordError(validation.isValid ? null : 'Password must meet all requirements');
                      }
                    }}
                    placeholder="password"
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
                <Text style={styles.label}>Confirm password</Text>
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
                {submitted && confirmPasswordError && (
                  <Text style={[styles.validationText, styles.invalidText]}>
                    ✗ {confirmPasswordError}
                  </Text>
                )}
              </View>

              <AuthButton
                text="Create account"
                onPress={handleCreateAccount}
                variant="primary"
                loading={loading}
              />

              <View style={styles.footer}>
                       <Text style={styles.footerText}>
                         Already have an account?{" "}
                         <Text
                           style={styles.footerLink}
                           onPress={() => router.push("/auth/sign-in")}
                         >
                           Sign in
                         </Text>
                       </Text>
                     </View>
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
    paddingBottom: 60,
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
    fontSize: 28
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
    marginBottom: 5,
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
  footer: {
    alignItems: "center",
    paddingBottom: screenHeight * 0.04, // reduce bottom emptiness
    paddingHorizontal: 31,
  },

  footerText: {
    ...TypographyStyles.body,
    fontSize: 14,
    lineHeight: 20,
    color: "#000",
    textAlign: "center",
    marginTop: 6,
  },

  footerLink: {
    color: "#1A8917",
    fontWeight: "600",
  },
});
