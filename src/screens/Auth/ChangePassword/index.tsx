import AuthButton from "@/src/components/auth/AuthButton";
import { useChangePassword } from "@/src/services/authApi";
import { TypographyStyles } from "@/src/theme/theme";
import { toast } from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
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
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

// Validation schema
const changePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required("Please enter your current password")
    .trim(),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(8, "Minimum 8 characters")
    .matches(/[A-Z]/, "One uppercase letter")
    .matches(/[a-z]/, "One lowercase letter")
    .matches(/[0-9]/, "One number")
    .matches(/[^A-Za-z0-9]/, "One special character")
    .test(
      "different-from-current",
      "New password must be different from current password",
      function (value) {
        return value !== this.parent.currentPassword;
      }
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your new password")
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});

type ChangePasswordFormData = yup.InferType<typeof changePasswordSchema>;

export default function ChangePassword() {
  const router = useRouter();
  const { mutate: changePassword, isPending: loading } = useChangePassword();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitted, touchedFields },
  } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const newPasswordValue = watch("newPassword");
  const currentPasswordValue = watch("currentPassword");

  // Helper function to check password rules
  const getPasswordValidationRules = (password: string) => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
      isDifferent: password !== currentPasswordValue,
    };
  };

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword(
      {
        oldPassword: data.currentPassword,
        password: data.newPassword,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: (response: any) => {
          if (response.status === 200 || response.success) {
            toast.success("Password changed successfully!");
            router.back();
          }
        },
        onError: (error: any) => {
          const errorData = error?.response?.data;
          if (errorData?.message) {
            if (Array.isArray(errorData.message)) {
              toast.error(errorData.message[0]);
            } else {
              toast.error(errorData.message);
            }
          } else {
            toast.error("Failed to change password. Please try again.");
          }
        },
      }
    );
  };

  const passwordRules = getPasswordValidationRules(newPasswordValue || "");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header Section */}
        <View style={styles.headerSection}>

          {/* <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={32} color="#00994C" />
          </View> */}
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>
            Update your password to keep your account secure
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordContainer}>
              <Controller
                control={control}
                name="currentPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.passwordInput}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Current password"
                    secureTextEntry={!showCurrentPassword}
                    autoCapitalize="none"
                    textContentType="none"
                    importantForAutofill="no"
                    editable={!loading}
                  />
                )}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={loading}
              >
                <Ionicons
                  name={showCurrentPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {(isSubmitted || touchedFields.currentPassword) && errors.currentPassword && (
              <Text style={[styles.validationText, styles.invalidText]}>
                 {errors.currentPassword.message}
              </Text>
            )}
          </View>

          {/* New Password */}
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
                    placeholder="New password"
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    textContentType="none"
                    importantForAutofill="no"
                    editable={!loading}
                  />
                )}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
                disabled={loading}
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
                {newPasswordValue && !passwordRules.isDifferent && " Must be different from current password."}
              </Text>
            )}
            {(isSubmitted || touchedFields.newPassword) && errors.newPassword && (
              <Text style={[styles.validationText, styles.invalidText]}>
                 {errors.newPassword.message}
              </Text>
            )}
          </View>

          {/* Confirm New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
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
                    placeholder="Confirm new password"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    textContentType="none"
                    importantForAutofill="no"
                    editable={!loading}
                  />
                )}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
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
              text="Change Password"
              onPress={handleSubmit(onSubmit)}
              variant="primary"
              loading={loading}
            />
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f0f9f4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    ...TypographyStyles.h2,
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    ...TypographyStyles.body,
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    ...TypographyStyles.body,
    color: "#222",
    marginBottom: 5,
    fontSize: 16,
    lineHeight: 24,
  },
  passwordContainer: {
    position: "relative",
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
    marginBottom: 2,
  },
  invalidText: {
    marginTop: 3,
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
    marginTop: 12,
    paddingBottom: 8,
  },
});
