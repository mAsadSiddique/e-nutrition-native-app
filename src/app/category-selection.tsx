import { SimpleCategory, useGetCategories } from "@/src/services/categoryApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthButton from "../components/auth/AuthButton";
import { TypographyStyles } from "../theme/theme";
const MIN_SELECTION = 3;
const PADDING_HORIZONTAL = 20;
const GAP = 12;

export default function CategorySelectionScreen() {
  const router = useRouter();
  // store selected category IDs
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const exists = prev.includes(id);
      if (exists) return prev.filter((n) => n !== id);
      return [...prev, id];
    });
  };

  // disable automatic fetch; we'll trigger it once with a guard
  const { data: categoriesApiData, isLoading: categoriesLoading, error: categoriesError, refetch: fetchCategories } = useGetCategories({ enabled: false });
  const [categoriesState, setCategoriesState] = useState<SimpleCategory[]>([]);

  const didFetchRef = useRef(false);
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchCategories().catch((err: any) => console.error('Categories fetch error:', err?.response || err));
  }, [fetchCategories]);

  useEffect(() => {
    // Only use top-level categories (ignore any nested children)
    if (Array.isArray(categoriesApiData)) {
      const parentCategories = categoriesApiData.map((cat: any) => ({ id: cat.id, name: cat.name }));
      setCategoriesState(parentCategories);
    }
  }, [categoriesApiData]);

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
          {categoriesState.map((item) => (
            <TouchableOpacity
              key={keyExtractor(item)}
              onPress={() => toggle(item.id)}
              style={[styles.pill, selected.includes(item.id) && styles.pillActive]}
            >
              <Text style={[styles.pillText, selected.includes(item.id) && styles.pillTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <AuthButton
        text="Continue"
        onPress={async () => {
          try {
            await AsyncStorage.setItem('selected_categories', JSON.stringify(selected));
            router.replace('/');
          } catch (err) {
            console.error('Failed to save selected categories:', err);
          }
        }}
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
  //  ...TypographyStyles.h3,
    textAlign: "center",
    color: "#000",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    ...TypographyStyles.body,
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 8,
    lineHeight: 18,
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
    backgroundColor: "#1A8917",
    borderColor: "#1A8917",
  },
  pillText: {
    ...TypographyStyles.body,
    color: "#222",
    fontSize: 14,
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
