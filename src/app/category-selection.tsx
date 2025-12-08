import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { categories } from "../../utils/data";
import AuthButton from "../components/auth/AuthButton";
import { TypographyStyles } from "../constants/theme";
const MIN_SELECTION = 3;
const PADDING_HORIZONTAL = 20;
const GAP = 12;

export default function CategorySelectionScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (name: string) => {
    setSelected((prev) => {
      const exists = prev.includes(name);
      if (exists) return prev.filter((n) => n !== name);
      return [...prev, name];
    });
  };

  const canContinue = selected.length >= MIN_SELECTION;

  const keyExtractor = (item: { id: number }) => String(item.id);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          What are you interested in?
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          Choose three or more.
        </Text>

        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.pillsContainer}
          showsVerticalScrollIndicator={false}
        >
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggle(item.name)}
              style={[styles.pill, selected.includes(item.name) && styles.pillActive]}
            >
              <Text style={[styles.pillText, selected.includes(item.name) && styles.pillTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <AuthButton
        text="Continue"
        onPress={() =>
          router.push({
            pathname: "/(tabs)/(home)",
            params: { selected: JSON.stringify(selected) },
          })
        }
        variant="primary"
        disabled={!canContinue}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: PADDING_HORIZONTAL,
  },
  content: {
    flex: 1,
    paddingTop: 32,
  },
  title: {
    ...TypographyStyles.h3,
    fontSize:24,
    marginBottom: 6,
    textAlign: "center",
    color:"#000",
  },
  subtitle: {
    ...TypographyStyles.body,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
    fontSize: 14,
  },
  error: {
    ...TypographyStyles.bodySmall,
    color: "#cc0000",
    marginBottom: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    paddingBottom: 16,
    gap: GAP,
  },
  pill: {
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 3,
    paddingHorizontal: 16,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  pillActive: {
    backgroundColor: "#00994C",
    borderColor: "#00994C",
  },
  pillText: {
    ...TypographyStyles.body,
    color: "#222",
    fontSize:14,
    textAlign: "center",
    
  },
  pillTextActive: {
    ...TypographyStyles.body,
    color: "#fff",
    fontSize: 14,
  },
  cta: {
    backgroundColor: "#00994C",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 24,
    minHeight: 52,
  },
  ctaDisabled: {
    backgroundColor: "#80cc9f",
  },
  ctaText: {
    ...TypographyStyles.body,
    color: "#fff",
  },
  testButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  authTestButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  authTestButtonText: {
    ...TypographyStyles.bodySmall,
    color: "#fff",
  },
  fontTestButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  fontTestButtonText: {
    ...TypographyStyles.bodySmall,
    color: "#fff",
  },
});
