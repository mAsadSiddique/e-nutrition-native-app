import { useGetCategories } from "@/src/services/categoryApi";
import { useWishlistToggle } from "@/src/services/wishlistToggle";
import store from "@/src/store/store";
import { AppRoutes } from "@/src/utils/enums";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthButton from "../components/auth/AuthButton";
import { SkeletonCategoryPill } from "../components/ui/SkeletonLoader";
import { useAuth } from "../store/auth/hook";
import { useCategories } from "../store/categories/hook";
import { useCategoriesSelector } from "../store/categories/selector";
import { useWishlistHandler } from "../store/wishlist/hook";
import { useWishlistSelector } from "../store/wishlist/selector";
import { TypographyStyles } from "../theme/theme";
const MIN_SELECTION = 3;
const PADDING_HORIZONTAL = 20;
const GAP = 12;

export default function CategorySelectionScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { selectedCategories } = useCategoriesSelector();
  const { blogsWishlist } = useWishlistSelector();
  const { onToggleCategory, onSetSelectedCategories } = useCategories();
  const { data: categoriesApiData, isLoading: categoriesLoading } =
    useGetCategories();
  const { mutate: toggleWishlist, isPending: wishlistLoading } =
    useWishlistToggle();

  // Wishlist store updater
  const { setCategoriesWishlist, setWishlist } = useWishlistHandler();

  const toggle = (id: number) => {
    onToggleCategory(id);
  };

  const canContinue = selectedCategories.length >= MIN_SELECTION;

  // Check AsyncStorage on mount to see if there are previously saved categories
  useEffect(() => {
    const checkAsyncStorage = async () => {
      try {
        const saved = await AsyncStorage.getItem("selected_categories");
        if (saved) {
          const parsed = JSON.parse(saved);
          onSetSelectedCategories(parsed);
        }
      } catch (err) {
        console.error("[CategorySelection] Error reading AsyncStorage:", err);
      }
    };
    checkAsyncStorage();
  }, [onSetSelectedCategories]);

  // Keep wishlist store in sync in real time when user selects/deselects categories
  useEffect(() => {
    try {
      // store null when no selection, otherwise store a shallow copy of the array of IDs
      const payload =
        selectedCategories.length > 0 ? [...selectedCategories] : null;
      console.debug(
        "[CategorySelection] Syncing wishlist store with selectedCategories:",
        payload,
      );
      setCategoriesWishlist(payload);
    } catch (err) {
      console.error(
        "[CategorySelection] Failed to sync wishlist store on selection change:",
        err,
      );
    }
  }, [selectedCategories, setCategoriesWishlist]);

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
          {categoriesLoading
            ? // Show skeleton pills while loading
              Array.from({ length: 12 }).map((_, index) => (
                <SkeletonCategoryPill key={`skeleton-${index}`} />
              ))
            : categoriesApiData?.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => toggle(item.id)}
                  style={[
                    styles.pill,
                    selectedCategories.includes(item.id) && styles.pillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      selectedCategories.includes(item.id) &&
                        styles.pillTextActive,
                    ]}
                  >
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
            // Build a sanitized payload: dedupe, coerce to numbers, validate IDs if categories list available
            const ids = selectedCategories.map((n: number) => Number(n));
            const deduped = Array.from(new Set(ids)) as number[];
            const payloadCopy = deduped.filter((id: number) => {
              if (!Number.isInteger(id)) return false;
              if (
                Array.isArray(categoriesApiData) &&
                categoriesApiData.length
              ) {
                return categoriesApiData.some((c: any) => c.id === id);
              }
              return true;
            });

            // Always save to Redux store (categories)
            onSetSelectedCategories(payloadCopy);

            // Always save to AsyncStorage
            const jsonString = JSON.stringify(payloadCopy);
            await AsyncStorage.setItem("selected_categories", jsonString);

            // Update wishlist store with selected categories
            setCategoriesWishlist(payloadCopy);

            // If user is authenticated, sync with API
            if (isAuthenticated && payloadCopy.length > 0) {
              console.log(
                "[CategorySelection] User authenticated - Adding categories to wishlist via API:",
                payloadCopy,
              );
              toggleWishlist(
                { ids: payloadCopy },
                {
                  onSuccess: (data) => {
                    // Use server response if it contains the saved categories, otherwise fallback to local selection
                    try {
                      const serverCategories =
                        (data as any)?.data?.userWishlist?.categoriesWishlist ??
                        (data as any)?.userWishlist?.categoriesWishlist ??
                        (data as any)?.categoriesWishlist;
                      if (Array.isArray(serverCategories)) {
                        const copy = [...serverCategories];

                        // Persist the authoritative server-provided selection as the app's selected categories
                        try {
                          onSetSelectedCategories(copy);
                          AsyncStorage.setItem(
                            "selected_categories",
                            JSON.stringify(copy),
                          )
                            .then(() =>
                              console.debug(
                                "[CategorySelection] Persisted server categories to AsyncStorage:",
                                copy,
                              ),
                            )
                            .catch((e) =>
                              console.error(
                                "[CategorySelection] Failed to persist server categories to AsyncStorage:",
                                e,
                              ),
                            );
                        } catch (err) {
                          console.error(
                            "[CategorySelection] Failed to update selected categories from server response:",
                            err,
                          );
                        }

                        // Update the whole wishlist from server to avoid mismatches
                        try {
                          const serverBlogs =
                            (data as any)?.data?.userWishlist?.blogsWishlist ??
                            (data as any)?.userWishlist?.blogsWishlist ??
                            (data as any)?.blogsWishlist ??
                            blogsWishlist ??
                            [];
                          console.debug(
                            "[CategorySelection] Pre-set wishlist state:",
                            store.getState().wishlist,
                          );
                          setWishlist({
                            blogsWishlist: serverBlogs || [],
                            categoriesWishlist: copy,
                          });

                          // Redux Persist will automatically persist the changes
                        } catch (err) {
                          // Fallback to setting categories only
                          setCategoriesWishlist(copy);
                        }
                      } else {
                        // Fallback to local selection if server doesn't return categories
                        const copy = [...payloadCopy];
                        onSetSelectedCategories(copy);
                        setCategoriesWishlist(copy);
                        console.log(
                          "[CategorySelection] ✅ Wishlist store updated from local selection:",
                          copy,
                        );
                      }
                    } catch (err) {
                      console.error(
                        "[CategorySelection] Failed to update wishlist store from response:",
                        err,
                      );
                    }

                    // Navigate after successful API call
                    router.replace(AppRoutes.TABS);
                  },
                  onError: (error: any) => {
                    console.error(
                      "[CategorySelection] ❌ Failed to add categories to wishlist:",
                      error,
                    );
                    // Still navigate even if API call fails
                    router.replace(AppRoutes.TABS);
                  },
                },
              );
            } else {
              // User is not authenticated - just save locally and navigate
              console.log(
                "[CategorySelection] User not authenticated - Saving categories locally and navigating to main app",
              );

              // Redux Persist will automatically persist the changes
              // No need to manually flush as it happens automatically
              console.log(
                "[CategorySelection] ✅ Categories saved to store (will be persisted automatically)",
              );

              // Navigate to main application
              router.replace(AppRoutes.TABS);
            }
          } catch (err) {
            console.error(
              "[CategorySelection] ❌ Failed to save selected categories:",
              err,
            );
          }
        }}
        variant="primary"
        disabled={!canContinue || wishlistLoading}
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
  pillNested: {
    marginLeft: 16,
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
