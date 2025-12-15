import { ThemedText } from "@/src/components/themed-text";
import { TypographyStyles } from "@/src/theme/theme";
import React from "react";
import { Dimensions, Linking, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PrivacyPolicy() {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Privacy Policy</ThemedText>
          <ThemedText style={styles.updated}>
            Last updated: {lastUpdated}
          </ThemedText>
        </View>

        {/* Intro Card */}
        <View style={styles.card}>
          <ThemedText style={styles.paragraph}>
            Your privacy matters to us. This Privacy Policy explains how we
            collect, use, and protect information when you access our platform,
            which provides educational blogs and insights related to food,
            nutrition, and farming practices.
          </ThemedText>
        </View>

        {/* Info Collection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Information we collect
          </ThemedText>

          <ThemedText style={styles.label}>Account information</ThemedText>
          <ThemedText style={styles.paragraph}>
            When you register, we collect basic details such as your name and
            email address to create and manage your account.
          </ThemedText>

          <ThemedText style={styles.label}>
            Device & usage information
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            We may collect technical data such as device type, app version, and
            interaction patterns to understand usage and improve reliability.
          </ThemedText>

          <ThemedText style={styles.label}>Analytics & cookies</ThemedText>
          <ThemedText style={styles.paragraph}>
            Analytics tools may be used to measure engagement with our food,
            nutrition, and farming content. Data is aggregated and not used to
            personally identify you.
          </ThemedText>
        </View>

        {/* Consent */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Consent</ThemedText>
          <ThemedText style={styles.paragraph}>
            By using this platform, you consent to the collection and use of
            information as outlined in this policy. You may withdraw consent at
            any time, subject to legal or operational requirements.
          </ThemedText>
        </View>

        {/* Usage */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            How we use your information
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            We use collected information to operate your account, personalize
            blog recommendations related to food, nutrition, and farming, and
            continuously improve app performance and features.
          </ThemedText>
        </View>

        {/* Sharing */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Data sharing</ThemedText>
          <ThemedText style={styles.paragraph}>
            We do not sell personal information. Limited data may be shared with
            trusted service providers strictly for analytics, hosting, or
            technical operations, under confidentiality agreements.
          </ThemedText>
        </View>

        {/* Retention */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Data retention</ThemedText>
          <ThemedText style={styles.paragraph}>
            Personal information is retained only as long as necessary to
            fulfill the purposes described in this policy or as required by
            applicable Canadian laws.
          </ThemedText>
        </View>

        {/* Rights */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Your rights</ThemedText>
          <ThemedText style={styles.paragraph}>
            You may request access to, correction of, or deletion of your
            personal information. Requests will be handled within a reasonable
            timeframe in accordance with Canadian privacy standards.
          </ThemedText>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Security safeguards
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            We apply industry-standard safeguards, including access controls and
            secure connections, to protect your data. However, no system can be
            guaranteed to be completely secure.
          </ThemedText>
        </View>

        {/* Contact */}
        <View style={styles.sectionBottom}>
          <ThemedText style={styles.sectionTitle}>Contact us</ThemedText>
          <ThemedText style={styles.paragraph}>
            For privacy-related questions or requests, contact us at{" "}
            <ThemedText
              style={styles.email}
              onPress={() => Linking.openURL("mailto:enutrition@myyahoo.com")}
            >
              enutrition@myyahoo.com
            </ThemedText>
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
    fontSize: Math.max(26, Math.min(30, SCREEN_WIDTH * 0.075)),
    marginBottom: 6,
  },
  updated: {
    ...TypographyStyles.bodySmall,
    color: "#777",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E8ECEB",
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

  label: {
    ...TypographyStyles.body,
    fontWeight: "600",
    color: "#1F1F1F",
    marginTop: 10,
    marginBottom: 4,
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
