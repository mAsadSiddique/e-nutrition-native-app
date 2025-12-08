import AuthButton from "@/src/components/auth/AuthButton";
import AuthLayout from "@/src/components/auth/AuthLayout";
import { useForgetPassword } from "@/src/services/authApi";
import { TypographyStyles } from "@/src/theme/theme";
import { forgotPasswordStorage } from "@/src/utils/forgotPasswordStorage";
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

  const { mutate: forgotPassword, isPending: loading } = useForgetPassword();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      hasAtSymbol: email.includes("@"),
      isValidFormat: emailRegex.test(email),
    };
  };

  // Password validation
  const validatePassword = (password: string) => {
    return {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(newPassword);

  const isEmailValid =
    emailValidation.hasAtSymbol && emailValidation.isValidFormat;
  const isPasswordValid =
    passwordValidation.hasMinLength &&
    passwordValidation.hasUpperCase &&
    passwordValidation.hasLowerCase &&
    passwordValidation.hasNumber &&
    passwordValidation.hasSpecialChar;
  const doPasswordsMatch =
    newPassword === confirmPassword && newPassword.length > 0;

  const isFormValid = isEmailValid && isPasswordValid && doPasswordsMatch;

  const handleResetPassword = async () => {
    if (!isEmailValid) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!isPasswordValid) {
      toast.error(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
      );
      return;
    }

    if (!doPasswordsMatch) {
      toast.error("Passwords do not match");
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
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you instructions to
                reset your password.
              </Text>
            </View>

            <View style={styles.form}>
              {/* EMAIL */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
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
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
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

                {newPassword.length > 0 && !isPasswordValid && (
                  <Text style={[styles.validationText, styles.invalidText]}>
                    ✗ Password must be at least 8 characters with uppercase,
                    lowercase, number, and special character
                  </Text>
                )}
              </View>

              {/* CONFIRM PASSWORD */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
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

                {confirmPassword.length > 0 && !doPasswordsMatch && (
                  <Text style={[styles.validationText, styles.invalidText]}>
                    ✗ Passwords do not match
                  </Text>
                )}
              </View>

              <AuthButton
                text="Continue"
                onPress={handleResetPassword}
                variant="primary"
                disabled={!isFormValid}
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
    ...TypographyStyles.h2,
    textAlign: "center",
    marginBottom: 16,
    color: "#222",
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
  validationText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  invalidText: {
    color: "#dc3545",
  },
});
