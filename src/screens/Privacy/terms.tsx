import { ThemedText } from "@/src/components/themed-text";
import { TypographyStyles } from "@/src/theme/theme";
import React from "react";
import {
    Dimensions,
    Linking,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TermsAndConditions() {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Terms & Conditions</ThemedText>
          <ThemedText style={styles.updated}>
            Last updated: {lastUpdated}
          </ThemedText>
        </View>

        {/* Intro */}
        <View style={styles.card}>
          <ThemedText style={styles.paragraph}>
            By accessing or using this platform, you agree to be bound by these
            Terms & Conditions. This platform provides educational blogs and
            informational content related to food, nutrition, and farming.
            Please review these terms carefully before using our services.
          </ThemedText>
        </View>

        {/* Purpose */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Platform purpose</ThemedText>
          <ThemedText style={styles.paragraph}>
            Our goal is to share reliable articles, insights, and learning
            resources focused on healthy food practices, nutrition awareness,
            and modern farming techniques. Content is intended to inform,
            educate, and inspire users.
          </ThemedText>
        </View>

        {/* Accounts */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>User accounts</ThemedText>
          <ThemedText style={styles.paragraph}>
            Some features may require account registration. You are responsible
            for maintaining accurate information and protecting your login
            credentials. Any activity performed under your account is your
            responsibility.
          </ThemedText>
        </View>

        {/* Content use */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Content usage</ThemedText>
          <ThemedText style={styles.paragraph}>
            All content is provided for personal and educational use only.
            Republishing, redistributing, or using content for commercial
            purposes is not permitted unless explicit permission is granted.
          </ThemedText>
        </View>

        {/* Prohibited */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Prohibited activities
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            Users must not misuse the platform, publish misleading information,
            violate intellectual property rights, or engage in activities that
            are unlawful, harmful, or abusive.
          </ThemedText>
        </View>

        {/* IP */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Intellectual property
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            All platform content, including text and visuals, is protected by
            intellectual property laws. Ownership remains with the platform or
            respective content creators unless stated otherwise.
          </ThemedText>
        </View>

        {/* Disclaimer */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Educational disclaimer
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            Content published on this platform is for general educational
            purposes only. It does not replace professional advice, including
            medical, nutritional, or agricultural consultation.
          </ThemedText>
        </View>

        {/* Termination */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Account termination
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            We reserve the right to suspend or terminate access if these terms
            are violated. Users may also request account closure at any time.
          </ThemedText>
        </View>

        {/* Liability */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Limitation of liability
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            To the maximum extent permitted by applicable law, we are not liable
            for indirect or consequential damages resulting from the use of this
            platform or reliance on its content.
          </ThemedText>
        </View>

        {/* Law */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Governing law</ThemedText>
          <ThemedText style={styles.paragraph}>
            These Terms & Conditions are governed by applicable Canadian laws.
            Any disputes should be handled through appropriate legal channels.
          </ThemedText>
        </View>

        {/* Contact */}
        <View style={styles.sectionBottom}>
          <ThemedText style={styles.sectionTitle}>Contact</ThemedText>
          <ThemedText
            style={styles.email}
            onPress={() => Linking.openURL("mailto:enutrition@myyahoo.com")}
          >
            enutrition@myyahoo.com
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  header: {
    paddingTop: 32,
    paddingBottom: 16,
  },
  title: {
    ...TypographyStyles.h2,
    // fontWeight: '700',
    fontSize: Math.max(26, Math.min(30, SCREEN_WIDTH * 0.075)),
    marginBottom: 6,
  },
  updated: {
    ...TypographyStyles.bodySmall,
    color: "#777",
  },

  card: {
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    padding: 16,
    marginBottom: 22,
  },

  section: {
    marginTop: 22,
  },
  sectionBottom: {
    marginTop: 22,
    marginBottom: 32,
  },

  sectionTitle: {
    // ...TypographyStyles.h3,
    fontWeight: "700",
    fontSize: Math.max(18, Math.min(22, SCREEN_WIDTH * 0.055)),
    marginBottom: 8,
  },

  paragraph: {
    ...TypographyStyles.body,
    color: "#2F2F2F",
    fontSize: Math.max(15, Math.min(17, SCREEN_WIDTH * 0.043)),
    lineHeight: Math.max(22, Math.min(26, SCREEN_WIDTH * 0.065)),
  },

  email: {
    ...TypographyStyles.h3,
    color: "#00994C",
    fontSize: Math.max(18, Math.min(17, SCREEN_WIDTH * 0.043)),
    textDecorationLine: "underline",
  },
});
