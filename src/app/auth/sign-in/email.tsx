import AuthButton from "@/src/components/auth/AuthButton";
import AuthLayout from "@/src/components/auth/AuthLayout";
import { useAuth } from "@/src/contexts/AuthContext";
import { useLoginProfile } from "@/src/services/authApi";
import { TypographyStyles } from "@/src/theme/theme";
import { validateEmail } from "@/src/utils/validators";
import storage from "@/utils/storage";
import { toast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

export default function SignInEmailScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { email: prefilledEmail } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { mutate: login, isPending: loading } = useLoginProfile();

  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail]);

  const handleContinue = async () => {
    setSubmitted(true);

    // Validate all fields
    const emailErr = validateEmail(email);
    const passwordErr = !password || !password.trim() ? 'Please enter your password' : null;

    // Set error states
    setEmailError(emailErr);
    setPasswordError(passwordErr);

    // If any validation fails, stop here
    if (emailErr || passwordErr) {
      return;
    }
    login(
      {
        email: email.trim(),
        password: password.trim(),
      },
      {
        onSuccess: async (data: any) => {
          if (data.status === 200 && data.data?.jwt) {
            await storage.setToken(data.data.jwt);
            await signIn(data.data.jwt);
            toast.success(data.message);
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
            <View style={styles.header}>
              {/* <Text style={styles.logo}>Nutrition</Text> */}
              <Text style={styles.title}>Sign in with email</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}> Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (submitted) {
                      setEmailError(validateEmail(text));
                    }
                  }}
                  placeholder="email"
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
                <Text style={styles.label}> Password</Text>

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (submitted) {
                        setPasswordError(!text || !text.trim() ? 'Please enter your password' : null);
                      }
                    }}
                    placeholder=" password"
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
                      name={showPassword ? "eye" : "eye-off"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {submitted && passwordError && (
                  <Text style={[styles.validationText, styles.invalidText]}>
                    ✗ {passwordError}
                  </Text>
                )}
                <TouchableOpacity
                  onPress={() => router.push("/auth/forgot-password")}
                >
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <AuthButton
                text="Sign in"
                onPress={handleContinue}
                variant="primary"
                loading={loading}
              />

              {/* <Text style={styles.terms}>
                By signing in, you agree to our{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and
                acknowledge that our{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text> applies to
                you.
              </Text> */}
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
    alignItems: "center",
    marginBottom: 36,
  },

  logo: {
    ...TypographyStyles.h2,
    marginBottom: 16,
    color: "#222",
    // fontSize: 26,
    lineHeight: 30,
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
    color: "#222",
    marginBottom: 5,
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
  forgotPassword: {
    ...TypographyStyles.bodySmall,
    marginTop: 12,
    textAlign: "right",
    color: "#1A6F5C",
    fontSize: 12,
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  terms: {
    ...TypographyStyles.bodySmall,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    fontSize: 13,

    marginTop: 16,
  },
  termsLink: {
    color: "#00994C",
    textDecorationLine: "underline",
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
  eyeIcon: {
    fontSize: 18,
    color: "#666",
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
    color: "#00994C",
  },
  invalidText: {
    color: "#dc3545",
  },
});
