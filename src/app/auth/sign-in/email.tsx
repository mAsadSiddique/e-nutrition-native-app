import AuthButton from "@/src/components/auth/AuthButton";
import AuthLayout from "@/src/components/auth/AuthLayout";
import { useAuth } from "@/src/contexts/AuthContext";
import { useLoginProfile } from "@/src/services/authApi";
import { TypographyStyles } from "@/src/theme/theme";
import storage from "@/src/utils/storage";
import { toast } from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
const signInEmailSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .trim(),
});

type SignInEmailFormData = yup.InferType<typeof signInEmailSchema>;

export default function SignInEmailScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { email: prefilledEmail } = useLocalSearchParams<{ email?: string }>();
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending: loading } = useLoginProfile();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitted, touchedFields },
  } = useForm<SignInEmailFormData>({
    resolver: yupResolver(signInEmailSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (prefilledEmail) {
      setValue("email", prefilledEmail);
    }
  }, [prefilledEmail, setValue]);

  const onSubmit = (data: SignInEmailFormData) => {
    login(
      {
        email: data.email.trim(),
        password: data.password.trim(),
      },
      {
        onSuccess: async (response: any) => {
          if (response.status === 200 && response.data?.jwt) {
            await storage.setToken(response.data.jwt);
            await signIn(response.data.jwt);
            toast.success(response.message);
            router.replace("/category-selection");
          }
        },
        onError: (error: any) => {
          const apiMessage = error?.response?.data?.message;

          if (apiMessage) {
            toast.error(apiMessage);
          } else {
            toast.error("Login failed, please try again");
          }
        },
      }
    );
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google sign in
    console.log("Google sign in pressed");
    // Google sign in implementation will be added here
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
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue to your account
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
                      placeholder="email"
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
                        placeholder="password"
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
                {(isSubmitted || touchedFields.password) && errors.password && (
                  <Text style={[styles.validationText, styles.invalidText]}>
                    {errors.password.message}
                  </Text>
                )}
                <TouchableOpacity
                  onPress={() => router.push("/auth/forgot-password")}
                  style={styles.forgotPasswordContainer}
                >
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonContainer}>
                <AuthButton
                  text="Sign in"
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

              {/* Google Sign In Button */}
              <View style={styles.socialButtonContainer}>
                <AuthButton
                  text="Sign in with Google"
                  onPress={handleGoogleSignIn}
                  variant="outline"
                  leftIcon={
                    <Image
                      source={require("@/src/assets/images/google.png")}
                      style={styles.googleIcon}
                    />
                  }
                />
              </View>

              {/* Footer - Sign Up Link */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Don't have an account?{" "}
                  <Text
                    style={styles.footerLink}
                    onPress={() => router.push("/auth/sign-up")}
                  >
                    Sign up
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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: 10,
  },
  forgotPassword: {
    ...TypographyStyles.bodySmall,
    fontSize: 14,
    color: "#00994C",
    fontWeight: "600",
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
  validationText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
  },
  invalidText: {
    color: "#dc3545",
  },
});
