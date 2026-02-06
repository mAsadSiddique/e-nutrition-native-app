import AuthButton from "@/src/components/auth/AuthButton";
import AuthCodeInput from "@/src/components/auth/AuthCodeInput";
import AuthLayout from "@/src/components/auth/AuthLayout";
import { useResendVerification, useVerification } from "@/src/services/authApi";
import { useAuth } from "@/src/store/auth/hook";
import { TypographyStyles } from "@/src/theme/theme";
import { AppRoutes } from "@/src/utils/enums";
import { toast } from "@/src/utils/toast";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import * as yup from "yup";

// Validation schema
const signInCodeSchema = yup.object().shape({
  code: yup
    .string()
    .required("Please enter the verification code")
    .length(6, "The verification code must be exactly 6 digits")
    .matches(/^\d+$/, "The verification code must contain only numbers"),
});

type SignInCodeFormData = yup.InferType<typeof signInCodeSchema>;

export default function VerifyCode() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { signIn } = useAuth();
  const [timeLeft, setTimeLeft] = useState(300);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [codeError, setCodeError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { mutate: verifyCode, isPending: loading } = useVerification();
  const { mutate: resendCode, isPending: resendLoading } =
    useResendVerification();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<SignInCodeFormData>({
    resolver: yupResolver(signInCodeSchema),
    defaultValues: {
      code: "",
    },
    mode: "onChange",
  });

  const codeValue = watch("code");

  // Clear error when user starts typing
  React.useEffect(() => {
    if (codeValue && codeError) {
      setCodeError(false);
      setErrorMessage("");
    }
  }, [codeValue, codeError]);

  // Auto-submit when all digits are entered
  useEffect(() => {
    if (codeValue && codeValue.length === 6 && !loading && !codeError) {
      // Small delay to ensure the last digit is properly set
      const timer = setTimeout(() => {
        handleSubmit(onSubmit)();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [codeValue, loading, codeError]);
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  const startTimer = () => {
    setTimeLeft(300);
    setIsResendDisabled(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setIsResendDisabled(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const onSubmit = (data: SignInCodeFormData) => {
    if (!email) {
      toast.error("Email address is missing");
      return;
    }
    verifyCode(
      {
        email,
        code: data.code,
      },
      {
        onSuccess: async (response: any) => {
          if (response.success && response.data) {
            toast.success("Welcome! Redirecting to your dashboard...");
            await signIn(response.data.token);
            router.replace(AppRoutes.TABS_HOME);
          }
        },
        onError: (error: any) => {
          setCodeError(true);
          setErrorMessage(
            "The verification code you entered is incorrect. Please check and try again.",
          );
          setValue("code", "");
        },
      },
    );
  };

  const handleResendCode = () => {
    if (!email) {
      toast.error("Email address is missing");
      return;
    }
    if (isResendDisabled) {
      return;
    }
    resendCode(
      {
        email,
      },
      {
        onSuccess: (data: any) => {
          if (data.success) {
            toast.success(
              "A new verification code has been sent to your email.",
            );
            // Restart timer
            startTimer();
          }
        },
        onError: (error: any) => {
          const errorData = error?.response?.data;
          if (error?.response?.status === 429) {
            // Handle rate limiting
            toast.error(
              errorData?.message ||
                "Please wait before requesting another code.",
            );
            // Do NOT restart timer for 429 errors
          } else {
            toast.error(
              errorData?.message || "Something went wrong. Please try again.",
            );
          }
        },
      },
    );
  };

  return (
    <AuthLayout>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit verification code to{" "}
              {email || "your email address"}. Please enter the code below to
              sign in to your account.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.codeInputContainer}>
              <Controller
                control={control}
                name="code"
                render={({ field: { onChange, value } }) => (
                  <AuthCodeInput
                    length={6}
                    value={value}
                    onChange={onChange}
                    error={codeError}
                  />
                )}
              />
              {isSubmitted && errors.code && (
                <Text style={styles.errorText}>{errors.code.message}</Text>
              )}
              {codeError && errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <AuthButton
                text="Verify Code"
                onPress={handleSubmit(onSubmit)}
                variant="primary"
                loading={loading}
              />
            </View>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the code?{" "}
                {isResendDisabled ? (
                  <Text style={styles.timerText}>
                    Resend in {formatTime(timeLeft)}
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={resendLoading ? undefined : handleResendCode}
                    disabled={resendLoading}
                  >
                    <Text
                      style={[
                        styles.resendLink,
                        resendLoading && styles.resendDisabled,
                      ]}
                    >
                      {resendLoading ? "Sending..." : "Resend code"}
                    </Text>
                  </TouchableOpacity>
                )}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
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
    paddingBottom: 40,
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
  codeInputContainer: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 16,
    marginBottom: 32,
  },
  buttonContainer: {
    marginTop: 0,
    marginBottom: 0,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 24,
    paddingHorizontal: 20,
  },
  resendText: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  timerText: {
    fontSize: 14,
    color: "#00994C",
    fontWeight: "600",
  },
  resendLink: {
    fontSize: 14,
    color: "#00994C",
    fontWeight: "600",
  },
  resendDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: 12,
    color: "#dc3545",
    marginTop: 12,
    textAlign: "center",
  },
});
