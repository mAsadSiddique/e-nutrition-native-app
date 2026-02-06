import AuthButton from "@/src/components/auth/AuthButton";
import AuthLayout from "@/src/components/auth/AuthLayout";
import { useSetPassword } from "@/src/services/authApi";
import { TypographyStyles } from "@/src/theme/theme";
import { toast } from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocalSearchParams, useRouter } from "expo-router";
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

// Validation schema
const setPasswordSchema = yup.object().shape({
  password: yup
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
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

type SetPasswordFormData = yup.InferType<typeof setPasswordSchema>;

export default function SetPasswordScreen() {
  const router = useRouter();
  const { email, code } = useLocalSearchParams<{
    email: string;
    code: string;
  }>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: setNewPassword, isPending: loading } = useSetPassword();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitted, touchedFields },
  } = useForm<SetPasswordFormData>({
    resolver: yupResolver(setPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const passwordValue = watch("password");

  const onSubmit = (data: SetPasswordFormData) => {
    // Call the set password API
    setNewPassword(
      {
        password: data.password,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: (response: any) => {
          if (response.status === 200) {
            toast.success("Password reset successful!");
            // Navigate to sign-in with email pre-filled
            router.replace({
              pathname: "/auth/sign-in/email",
              params: { email },
            });
          }
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Password reset failed";
          toast.error(errorMessage);
        },
      },
    );
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
              <Text style={styles.title}>Set Password</Text>
              <Text style={styles.subtitle}>
                Create a strong password to secure your account
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.passwordInput}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="New password"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoComplete="off"
                        textContentType="none"
                        importantForAutofill="no"
                        editable={!loading}
                      />
                    )}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <Ionicons
                      name={showPassword ? "eye" : "eye-off"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {passwordValue && (
                  <Text style={styles.passwordHintText}>
                    Must be at least 8 characters, include an uppercase letter,
                    a lowercase letter, a number and a special character.
                  </Text>
                )}
                {(isSubmitted || touchedFields.password) && errors.password && (
                  <Text style={[styles.validationText, styles.invalidText]}>
                    {errors.password.message}
                  </Text>
                )}
              </View>

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
                        placeholder="Confirm new password"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoComplete="off"
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
                {(isSubmitted || touchedFields.confirmPassword) &&
                  errors.confirmPassword && (
                    <Text style={[styles.validationText, styles.invalidText]}>
                      {errors.confirmPassword.message}
                    </Text>
                  )}
              </View>

              <View style={styles.buttonContainer}>
                <AuthButton
                  text="Set Password"
                  onPress={handleSubmit(onSubmit)}
                  variant="primary"
                  loading={loading}
                />
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
    // paddingHorizontal: 20,
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
    paddingHorizontal: 20,
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
});
