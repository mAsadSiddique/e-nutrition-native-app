import AuthButton from "@/src/components/auth/AuthButton";
import AuthLayout from "@/src/components/auth/AuthLayout";
import { TypographyStyles } from "@/src/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SignUpEntry() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSkip = () => {
    router.replace("/category-selection");
  };

  return (
    <AuthLayout>
      <View style={styles.container}>
        {/* Close Button */}
        <TouchableOpacity
          style={[
            styles.closeButton,
            { top: Platform.OS === "ios" ? insets.top + 10 : 50 },
          ]}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <View style={styles.closeButtonContainer}>
            <Ionicons name="close" size={22} color="#333" />
          </View>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>Nutrition</Text>
          <Text style={styles.title}>
            Human{"\n"}stories and{"\n"}ideas.
          </Text>
          <Text style={styles.subtitle}>
            Discover perspectives that deepen understanding.
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          <AuthButton
            text="Sign up with Google"
            onPress={() => {
              // TODO: Implement Google sign up
              console.log("Google sign up pressed");
            }}
            variant="outline"
            leftIcon={
              <Image
                source={require("@/src/assets/images/google.png")}
                style={{
                  width: 20,
                  height: undefined,
                  aspectRatio: 1,
                  resizeMode: "contain",
                }}
              />
            }
          />
          <AuthButton
            text="Sign up with Email"
            onPress={() => router.push("/auth/sign-up/email")}
            variant="outline"
            leftIcon={
              <Image
                source={require("@/src/assets/images/icon2.png")}
                style={{
                  width: 20,
                  height: undefined,
                  aspectRatio: 1,
                  resizeMode: "contain",
                }}
              />
            }
          />
        </View>
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
    </AuthLayout>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 50,
    right: 0,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeButtonContainer: {
    marginBottom: 70,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },

  logo: {
    ...TypographyStyles.h2,
    fontSize: 28,
    marginBottom: 12,
    color: "#000",
    letterSpacing: -0.3,
    lineHeight: 32,
  },

  title: {
    ...TypographyStyles.h3,
    textAlign: "center",
    fontSize: screenWidth > 375 ? 48 : 54,
    lineHeight: 56,
    marginBottom: 14, 
    color: "#000",
    letterSpacing: -1,
  },

  subtitle: {
    ...TypographyStyles.body,
    fontSize: 18,
    lineHeight: 20,
    textAlign: "center",
    color: "#000",
    width: "100%",
    letterSpacing: -0.4,
    marginBottom: 10,
  },

  buttonsContainer: {
    paddingHorizontal: 26,
    marginTop: 10, // reduced gap above buttons
    marginBottom: 14, // smoother bottom space
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
