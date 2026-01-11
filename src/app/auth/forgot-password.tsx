import AuthButton from "@/src/components/auth/AuthButton";
import AuthLayout from "@/src/components/auth/AuthLayout";
import { useForgetPassword } from "@/src/services/authApi";
import { TypographyStyles } from "@/src/theme/theme";
import { toast } from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import * as yup from "yup";

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
const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  newPassword: yup
    .string()
    .required("Password is required")
    .min(8, "Minimum 8 characters")
    .matches(/[A-Z]/, "One uppercase letter")
    .matches(/[a-z]/, "One lowercase letter")
    .matches(/[0-9]/, "One number")
    .matches(/[^A-Za-z0-9]/, "One special character"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: forgotPassword, isPending: loading } = useForgetPassword();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitted, touchedFields },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const newPasswordValue = watch("newPassword");

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      // Store password data in AsyncStorage
      await forgotPasswordStorage.store({
        email: data.email.trim(),
        newPassword: data.newPassword.trim(),
        confirmPassword: data.confirmPassword.trim(),
      });

      // Call the forgot password API to send OTP
      forgotPassword(
        {
          email: data.email.trim(),
        },
        {
          onSuccess: (response: any) => {
            if (response.status === 200) {
              // Show success toast
              toast.success(response.message);
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
    <AuthLayout>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Enter your email and new password to reset your account
              </Text>
            </View>

            <View style={styles.form}>
              {/* EMAIL */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      editable={!loading}
                    />
                  )}
                />
                {(isSubmitted || touchedFields.email) && errors.email && (
                  <Text style={[styles.validationText, styles.invalidText]}>
                    {errors.email.message}
                  </Text>
                )}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <Controller
                    control={control}
                    name="newPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.passwordInput}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="New Password"
                        secureTextEntry={!showNewPassword}
                        autoCapitalize="none"
                        editable={!loading}
                      />
                    )}
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
                {newPasswordValue && (
                  <Text style={styles.passwordHintText}>
                    Must be at least 8 characters, include an uppercase letter, a lowercase letter, a number and a special character.
                  </Text>
                )}
                {(isSubmitted || touchedFields.newPassword) && errors.newPassword && (
                  <Text style={[styles.validationText, styles.invalidText]}>
                    {errors.newPassword.message}
                  </Text>
                )}
              </View>

              {/* CONFIRM PASSWORD */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.passwordInput}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Confirm Password"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        editable={!loading}
                      />
                    )}
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
                {(isSubmitted || touchedFields.confirmPassword) && errors.confirmPassword && (
                  <Text style={[styles.validationText, styles.invalidText]}>
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <AuthButton
                  text="Continue"
                  onPress={handleSubmit(onSubmit)}
                  variant="primary"
                  loading={loading}
                />
              </View>

              {/* Footer - Back to Login Link */}
              <View style={styles.footer}>
                <TouchableOpacity onPress={() => router.push("/auth/sign-in/email")}>
                  <Text style={styles.footerText}>
                    Back to login
                  </Text>
                </TouchableOpacity>
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
    paddingBottom: 32,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  title: {
    ...TypographyStyles.h3,
    textAlign: "center",
    color: "#000",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    ...TypographyStyles.body,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    // paddingHorizontal: 20,
  },
  form: {
    flex: 1,
    // paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    ...TypographyStyles.body,
    color: "#222",
    marginBottom: 8,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  input: {
    ...TypographyStyles.body,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#222",
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
    paddingVertical: 12,
    paddingRight: 48,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#222",
    flex: 1,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 4,
  },
  validationText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
  },
  invalidText: {
    color: "#dc3545",
  },
  passwordHintText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#6c757d",
    marginTop: 8,
    fontStyle: "normal",
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 0,
  },
  footer: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 20,
  },
  footerText: {
    ...TypographyStyles.body,
    fontSize: 14,
    lineHeight: 20,
    color: "#00994C",
    fontWeight: "600",
  },
});
