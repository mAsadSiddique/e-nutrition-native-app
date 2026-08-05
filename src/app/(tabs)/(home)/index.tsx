import OilFatImage from "@/src/assets/oil-fat.jpg";
import {
  COLORS,
  getCategoryBackgroundColor,
  getCategoryIcon,
  RECOMMENDED_BLOGS_LIMIT,
} from "@/src/constant/app-constants";
import { useWishlistToggle } from "@/src/hooks/useWishlistToggle";
import { useBlogsListing } from "@/src/services/blogApi";
import {
  useGetCategories,
  useGetCategoriesWithChildren,
} from "@/src/services/categoryApi";
import { transformBlogs } from "@/src/utils/blog-helpers";
import { getCategoryNameById, sortCategoriesByDisplayOrder } from "@/src/utils/category-helpers";
import { AppRoutes } from "@/src/utils/enums";
import {
  handleBlogPress,
  handleCategoryPress,
} from "@/src/utils/navigation-helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeIndex() {
  const router = useRouter();
  const { handleToggleWishlist, wishlistLoading, blogsWishlist } =
    useWishlistToggle();

  // Fetch recommended blogs
  const {
    data: blogsListing,
    isLoading: blogsLoading,
    refetch: refetchBlogs,
  } = useBlogsListing({});
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useGetCategories();
  const { data: categoriesWithChildren } = useGetCategoriesWithChildren();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchBlogs(), refetchCategories()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchBlogs, refetchCategories]);

  // Helper to get category name by ID
  const getCategoryNameByIdCallback = useCallback(
    (categoryId: number): string => {
      if (!categoriesData) return "";
      return getCategoryNameById(categoriesData, categoryId);
    },
    [categoriesData],
  );

  // Transform blogs for recommended section
  const recommendedBlogs = useMemo(() => {
    if (!blogsListing || !Array.isArray(blogsListing)) return [];
    const blogs = blogsListing.slice(0, RECOMMENDED_BLOGS_LIMIT);
    return transformBlogs(blogs, {
      includeCategoryName: true,
      getCategoryName: getCategoryNameByIdCallback,
    });
  }, [blogsListing, getCategoryNameByIdCallback]);

  // Transform API categories for display
  const displayCategories = useMemo(() => {
    if (
      !categoriesData ||
      !Array.isArray(categoriesData) ||
      categoriesData.length === 0
    ) {
      return [];
    }

    return sortCategoriesByDisplayOrder(categoriesData).map(
      (category, index) => ({
        id: category.id,
        name: category.name,
        icon: category.icon || getCategoryIcon(category.name),
        image: category.iconUrl || category.image || null,
        backgroundColor:
          category.backgroundColor || getCategoryBackgroundColor(index),
      }),
    );
  }, [categoriesData]);

  const onBlogPress = useCallback(
    (item: any) => {
      handleBlogPress(router, item);
    },
    [router],
  );

  const onCategoryPress = useCallback(
    (categoryId: number) => {
      handleCategoryPress(router, categoryId, categoriesWithChildren);
    },
    [router, categoriesWithChildren],
  );

  const handleSearchPress = useCallback(() => {
    router.push("/blog-search" as any);
  }, [router]);

  const handleSeeAllPress = useCallback(() => {
    router.push(AppRoutes.BLOGS as any);
  }, [router]);

  const handleSeeAllCategoriesPress = useCallback(() => {
    router.push("/browse-categories" as any);
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Food Data Central header + search */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTextBlock}>
              <View style={styles.heroTitleRow}>
                <Text style={styles.heroTitle}>Food Data Central</Text>
                <Text style={styles.heroUrl}>www.enutrition.me</Text>
              </View>
              <Text style={styles.heroSubtitle}>
                Your comprehensive information source of food nutrition and
                phytonutrition
              </Text>
            </View>
            <View style={styles.heroLogoWrap}>
              <Image
                source={require("@/src/assets/logo-mark.png")}
                style={styles.heroLogo}
                resizeMode="cover"
                accessibilityLabel="Energy Healing logo"
              />
            </View>
          </View>

          <Pressable
            onPress={handleSearchPress}
            style={({ pressed }) => [
              styles.searchBar,
              pressed && styles.searchBarPressed,
            ]}
            accessibilityRole="search"
            accessibilityLabel="Search your food"
            accessibilityHint="Opens search to find articles, recipes, and blogs"
          >
            <View style={styles.searchIconButton}>
              <Ionicons name="search" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.searchInputArea}>
              <Text style={styles.searchPlaceholder} numberOfLines={1}>
                Search Your Food
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Recommended for You Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <TouchableOpacity onPress={handleSeeAllPress}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendedScroll}
          >
            {blogsLoading ? (
              <>
                {[1, 2].map((skeletonId) => (
                  <View key={skeletonId} style={styles.skeletonCard}>
                    <View style={styles.skeletonImage} />
                    <View style={styles.skeletonLineShort} />
                    <View style={styles.skeletonLine} />
                  </View>
                ))}
              </>
            ) : recommendedBlogs.length > 0 ? (
              recommendedBlogs.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.recommendedCard}
                  onPress={() => onBlogPress(item)}
                >
                  <View style={styles.recommendedImageContainer}>
                    <Image
                      source={item.image}
                      style={styles.recommendedImage}
                      resizeMode="cover"
                    />
                    <View style={styles.tagContainer}>
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>{item.tag}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.recommendedTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {item.categoryName ? (
                    <View style={styles.recommendedMetaRow}>
                      <Text
                        style={styles.recommendedMetaText}
                        numberOfLines={1}
                      >
                        {item.categoryName}
                      </Text>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => handleToggleWishlist(item.id)}
                        accessibilityLabel="Save article"
                        disabled={wishlistLoading}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={
                            blogsWishlist.includes(item.id)
                              ? "bookmark"
                              : "bookmark-outline"
                          }
                          size={20}
                          color={
                            blogsWishlist.includes(item.id)
                              ? COLORS.PRIMARY_GREEN
                              : COLORS.TEXT_SECONDARY
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.recommendedMetaRow}>
                      <View style={{ flex: 1 }} />
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => handleToggleWishlist(item.id)}
                        accessibilityLabel="Save article"
                        disabled={wishlistLoading}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={
                            blogsWishlist.includes(item.id)
                              ? "bookmark"
                              : "bookmark-outline"
                          }
                          size={20}
                          color={
                            blogsWishlist.includes(item.id)
                              ? COLORS.PRIMARY_GREEN
                              : COLORS.TEXT_SECONDARY
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </Pressable>
              ))
            ) : (
              <Text style={styles.emptyText}>No recommendations available</Text>
            )}
          </ScrollView>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={handleSeeAllCategoriesPress}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          {categoriesLoading ? (
            <View style={styles.categoriesGrid}>
              {[1, 2, 3, 4, 5, 6].map((skeletonId) => (
                <View key={skeletonId} style={styles.categoryItem}>
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
                        category.image
                          ? { uri: category.image }
                          : OilFatImage
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
          ) : (
            <Text style={styles.emptyText}>No categories available</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_WHITE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    backgroundColor: "#000000",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  heroTextBlock: {
    flex: 1,
    paddingRight: 10,
  },
  heroTitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    marginBottom: 8,
    gap: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  heroUrl: {
    fontSize: 13,
    fontWeight: "500",
    color: "#E5D964",
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    color: "#FFFFFF",
  },
  heroLogoWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroLogo: {
    width: 58,
    height: 58,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "stretch",
    height: 48,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  searchBarPressed: {
    opacity: 0.92,
  },
  searchIconButton: {
    width: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C6E84C",
  },
  searchInputArea: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  searchPlaceholder: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.PRIMARY_GREEN,
  },
  recommendedScroll: {
    paddingRight: 20,
  },
  recommendedCard: {
    width: 280,
    marginRight: 16,
  },
  recommendedImageContainer: {
    position: "relative",
    width: "100%",
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  recommendedImage: {
    width: "100%",
    height: "100%",
  },
  tagContainer: {
    position: "absolute",
    bottom: 12,
    left: 12,
  },
  tag: {
    backgroundColor: COLORS.TAG_BG,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.TAG_TEXT,
    textTransform: "uppercase",
  },
  saveButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    lineHeight: 20,
  },
  recommendedMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recommendedMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recommendedMetaText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
    marginRight: 8,
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
  categoryIcon: {},
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
  skeletonCard: {
    width: 280,
    marginRight: 16,
  },
  skeletonImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#EDEDED",
    marginBottom: 12,
  },
  skeletonLineShort: {
    width: "45%",
    height: 10,
    borderRadius: 8,
    backgroundColor: "#EDEDED",
    marginBottom: 8,
  },
  skeletonLine: {
    width: "80%",
    height: 10,
    borderRadius: 8,
    backgroundColor: "#EDEDED",
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    padding: 20,
  },
  skeletonCategoryCard: {
    backgroundColor: "#F2F2F2",
  },
  skeletonCategoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E0E0",
    marginBottom: 10,
  },
  skeletonCategoryLine: {
    width: "70%",
    height: 10,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
});
