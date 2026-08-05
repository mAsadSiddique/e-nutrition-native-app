import OilFatImage from "@/src/assets/oil-fat.jpg";
import {
  COLORS,
  getCategoryBackgroundColor,
  getCategoryIcon,
} from "@/src/constant/app-constants";
import {
  useGetCategories,
  useGetCategoriesWithChildren,
} from "@/src/services/categoryApi";
import { handleCategoryPress } from "@/src/utils/navigation-helpers";
import { sortCategoriesByDisplayOrder } from "@/src/utils/category-helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWishlistHandler } from "../store/wishlist/hook";
import { TypographyStyles } from "../theme/theme";

const SKELETON_COUNT = 9;

export default function BrowseCategoriesScreen() {
  const router = useRouter();
  const {
    data: categoriesData,
    isLoading,
    refetch: refetchCategories,
  } = useGetCategories();
  const { data: categoriesWithChildren } = useGetCategoriesWithChildren();
  const { setCategoriesWishlist } = useWishlistHandler();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchCategories();
    } finally {
      setRefreshing(false);
    }
  }, [refetchCategories]);

  const filteredCategories = useMemo(() => {
    if (!categoriesData) return [];
    const ordered = sortCategoriesByDisplayOrder(categoriesData);
    if (!searchQuery.trim()) return ordered;
    const query = searchQuery.toLowerCase().trim();
    return ordered.filter((category) =>
      category.name.toLowerCase().includes(query),
    );
  }, [categoriesData, searchQuery]);

  const displayCategories = useMemo(() => {
    if (!filteredCategories || filteredCategories.length === 0) return [];
    return filteredCategories.map((category, index) => ({
      id: category.id,
      name: category.name,
      icon: category.icon || getCategoryIcon(category.name),
      image: category.iconUrl || category.image || null,
      backgroundColor:
        category.backgroundColor || getCategoryBackgroundColor(index),
    }));
  }, [filteredCategories]);

  const onCategoryPress = useCallback(
    (categoryId: number) => {
      setCategoriesWishlist([categoryId]);
      handleCategoryPress(router, categoryId, categoriesWithChildren);
    },
    [setCategoriesWishlist, router, categoriesWithChildren],
  );

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.title}>Categories</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color={COLORS.PRIMARY_GREEN}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search categories"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </View>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {isLoading ? (
            <View style={styles.categoriesGrid}>
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <View key={`skeleton-${index}`} style={styles.categoryItem}>
                  <View
                    style={[styles.categoryCard, styles.skeletonCategoryCard]}
                  >
                    <View style={styles.skeletonCategoryIcon} />
                  </View>
                  <View style={styles.skeletonCategoryLine} />
                </View>
              ))}
            </View>
          ) : displayCategories.length > 0 ? (
            <View style={styles.categoriesGrid}>
              {displayCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryItem}
                  onPress={() => onCategoryPress(category.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.categoryCard,
                      { backgroundColor: category.backgroundColor },
                    ]}
                  >
                    <Image
                      source={
                        category.image ? { uri: category.image } : OilFatImage
                      }
                      style={styles.categoryImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text
                    style={styles.categoryName}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : searchQuery.trim() ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No categories found for "{searchQuery}"
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_WHITE,
  },
  content: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: COLORS.BACKGROUND_WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    marginLeft: 18,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  searchBarContainer: {
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.SEARCH_BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    ...TypographyStyles.bodySans,
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 0,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryItem: {
    width: "30.5%",
    alignItems: "center",
  },
  categoryCard: {
    width: "100%",
    aspectRatio: 1.1,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryImage: {
    width: 56,
    height: 56,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 2,
  },
  skeletonCategoryCard: {
    backgroundColor: COLORS.SEARCH_BG,
  },
  skeletonCategoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E0E0E0",
  },
  skeletonCategoryLine: {
    width: "70%",
    height: 10,
    borderRadius: 8,
    backgroundColor: COLORS.SEARCH_BG,
    marginTop: 4,
  },
  emptyState: {
    width: "100%",
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyStateText: {
    ...TypographyStyles.body,
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
    textAlign: "center",
  },
});
