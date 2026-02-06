import AuthButton from "@/src/components/auth/AuthButton";
import AuthLayout from "@/src/components/auth/AuthLayout";
import { useSignup } from "@/src/services/authApi";
import { TypographyStyles } from "@/src/theme/theme";
import { AppRoutes } from "@/src/utils/enums";
import { toast } from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Image,
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
const signUpEmailSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
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

type SignUpEmailFormData = yup.InferType<typeof signUpEmailSchema>;

export default function SignUpScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: signup, isPending: loading } = useSignup();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitted, touchedFields },
  } = useForm<SignUpEmailFormData>({
    resolver: yupResolver(signUpEmailSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const passwordValue = watch("password");

  const handleGoogleSignUp = () => {
    // TODO: Implement Google sign up
    // Google sign up implementation will be added here
  };

  const onSubmit = (data: SignUpEmailFormData) => {
    // Call the signup API
    signup(
      {
        email: data.email.trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: (response: any) => {
          if (response.status === 200) {
            // Show success toast
            toast.success(response.message);
            // Navigate to verification screen with email
            router.push({
              pathname: "/auth/sign-up/code",
              params: { email: data.email },
            });
          }
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message || error?.message || "Signup failed";
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
              <Text style={styles.title}>Sign Up</Text>
              <Text style={styles.subtitle}>
                Sign up to get started with your account
              </Text>
            </View>

            <View style={styles.form}>
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
                <Text style={styles.label}>Password</Text>
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
                        placeholder="Password"
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
                <Text style={styles.label}>Confirm password</Text>
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
                  text="Create account"
                  onPress={handleSubmit(onSubmit)}
                  variant="primary"
                  loading={loading}
                />
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign Up Button */}
              <View style={styles.socialButtonContainer}>
                <AuthButton
                  text="Sign up with Google"
                  onPress={handleGoogleSignUp}
                  variant="outline"
                  leftIcon={
                    <Image
                      source={require("@/src/assets/images/google.png")}
                      style={styles.googleIcon}
                    />
                  }
                />
              </View>

              {/* Footer - Sign In Link */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Already have an account?{" "}
                  <Text
                    style={styles.footerLink}
                    onPress={() => router.push(AppRoutes.AUTH_SIGN_IN_EMAIL)}
                  >
                    Sign in
                  </Text>
                </Text>
              </View>
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{" "}
                  <Text
                    style={styles.termsLink}
                    onPress={() => router.push(AppRoutes.LEGAL_TERMS)}
                  >
                    Terms & Services
                  </Text>{" "}
                  and acknowledge that our{" "}
                  <Text
                    style={styles.termsLink}
                    onPress={() => router.push(AppRoutes.LEGAL_PRIVACY)}
                  >
                    Privacy Policy
                  </Text>{" "}
                  applies to you.
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 16,
    fontWeight: "500",
  },
  socialButtonContainer: {
    marginTop: 0,
    marginBottom: 24,
  },
  googleIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  footer: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 20,
  },
  footerText: {
    ...TypographyStyles.body,
    fontSize: 14,
    lineHeight: 20,
    color: "#000",
    textAlign: "center",
  },
  footerLink: {
    color: "#00994C",
    fontWeight: "600",
  },
  termsContainer: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  termsText: {
    ...TypographyStyles.body,
    fontSize: 12,
    lineHeight: 18,
    color: "#666",
    textAlign: "center",
  },
  termsLink: {
    color: "#00994C",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
