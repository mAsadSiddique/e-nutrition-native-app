import AuthButton from "@/src/components/auth/AuthButton";
import AuthLayout from "@/src/components/auth/AuthLayout";
import { useForgetPassword } from "@/src/services/authApi";
import { TypographyStyles } from "@/src/theme/theme";
import { forgotPasswordStorage } from "@/src/utils/forgotPasswordStorage";
import { validateConfirmPassword, validateEmail, validatePasswordRules } from "@/src/utils/validators";
import { toast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const { mutate: forgotPassword, isPending: loading } = useForgetPassword();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async () => {
    setSubmitted(true);

    // Validate all fields
    const emailErr = validateEmail(email);
    const passwordValidation = validatePasswordRules(newPassword);
    const passwordErr = passwordValidation.isValid ? null : 'Password must meet all requirements';
    const confirmPasswordErr = validateConfirmPassword(newPassword, confirmPassword);

    // Set error states
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmPasswordErr);

    // If any validation fails, stop here
    if (emailErr || passwordErr || confirmPasswordErr) {
      return;
    }

    try {
      // Store password data in AsyncStorage
      await forgotPasswordStorage.store({
        email: email.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });

      // Call the forgot password API to send OTP
      forgotPassword(
        {
          email: email.trim(),
        },
        {
          onSuccess: (data: any) => {
            if (data.status === 200) {
              // Show success toast
              toast.success(data.message);
              // Navigate to code screen for OTP verification
              router.push("/auth/forgot-password-code");
            }
          },
          onError: (error: any) => {
            const errorMessage =
              error?.response?.data?.message ||
              error?.message ||
              "Failed to send reset code";
            toast.error(errorMessage);
          },
        }
      );
    } catch (error) {
      toast.error("Failed to store password data");
    }
  };

  return (
    <>
    <AuthLayout>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Reset your password</Text>
            </View>

            <View style={styles.form}>
              {/* EMAIL */}
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
                  placeholder="Enter your email"
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
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
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
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />

                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons
                      name={showNewPassword ? "eye" : "eye-off"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                {submitted && (() => {
                  const passwordValidation = validatePasswordRules(newPassword);
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

              {/* CONFIRM PASSWORD */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (submitted) {
                        setConfirmPasswordError(validateConfirmPassword(newPassword, text));
                      }
                    }}
                    placeholder="Confirm password"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />

                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye" : "eye-off"}
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
                text="Continue"
                onPress={handleResetPassword}
                variant="primary"
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthLayout>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  passwordContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },

  passwordInput: {
    ...TypographyStyles.body,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingRight: 40,
    backgroundColor: "#fff",
    fontSize: 14,
    color: "#222",
    flex: 1,
  },

  eyeButton: {
    position: "absolute",
    right: 12,
    padding: 4,
  },

  title: {
    ...TypographyStyles.h3,
    textAlign: 'center',
    color: '#000',
    fontSize: 28
  },
  subtitle: {
    ...TypographyStyles.body,
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 18,
    paddingHorizontal: 12,
    maxWidth: 300,
    alignSelf: "center",
  },

  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    ...TypographyStyles.body,
    color: "#222",
    marginBottom: 8,
    fontSize: 16,
    lineHeight: 24,
  },
  input: {
    ...TypographyStyles.body,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    fontSize: 14,
    color: "#222",
  },
  validationContainer: {
    marginTop: 8,
  },
  validationText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 2,
  },
  validText: {
    color: "#00994C",
  },
  invalidText: {
    color: "#dc3545",
  },
});
