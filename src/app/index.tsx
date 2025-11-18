import { TypographyStyles } from "@/src/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { categories } from "../../utils/data";
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

  const renderPill = ({ item }: any) => {
    const active = selected.includes(item.name);
    return (
      <TouchableOpacity
        onPress={() => toggle(item.name)}
        style={[styles.pill, active && styles.pillActive]}
      >
        <Text style={[styles.pillText, active && styles.pillTextActive]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

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

        <View style={styles.pillsContainer}>
          {categories.map((item) => renderPill({ item }))}
        </View>
      </View>

      <TouchableOpacity
        disabled={!canContinue}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/(home)",
            params: { selected: JSON.stringify(selected) },
          })
        }
        style={[styles.cta, !canContinue && styles.ctaDisabled]}
      >
        <Text style={styles.ctaText}>Continue</Text>
      </TouchableOpacity>
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
    ...TypographyStyles.h2,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    ...TypographyStyles.body,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  error: {
    ...TypographyStyles.bodySmall,
    color: "#cc0000",
    marginBottom: 8,
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
    borderColor: "#e0e0e0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    minHeight: 44,
  },
  pillActive: {
    backgroundColor: "#00994C",
    borderColor: "#00994C",
  },
  pillText: {
    ...TypographyStyles.body,
    color: "#222",
    textAlign: "center",
  },
  pillTextActive: {
    ...TypographyStyles.body,
    color: "#fff",
    fontWeight: "600",
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
    fontWeight: "600",
  },
});
