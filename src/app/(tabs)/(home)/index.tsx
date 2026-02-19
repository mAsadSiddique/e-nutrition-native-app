import {
  CATEGORIES_GRID_LIMIT,
  COLORS,
  DEFAULT_IMAGE_URL,
  DESCRIPTION_PREVIEW_LENGTH,
  RECOMMENDED_BLOGS_LIMIT,
  getCategoryBackgroundColor,
  getCategoryIcon,
} from "@/src/constant/app-constants";
import { useCurrentProfile } from "@/src/hooks";
import { useBlogsListing } from "@/src/services/blogApi";
import { useGetCategories } from "@/src/services/categoryApi";
import { stripHtml } from "@/src/utils/blogs-helper";
import { AppRoutes, buildRoute } from "@/src/utils/enums";
import type { TBlogsListing } from "@/src/utils/types/blogs";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeIndex() {
  const router = useRouter();
  const { userName } = useCurrentProfile();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategories();

  // Fetch recommended blogs
  const { data: blogsListing, isLoading: blogsLoading } = useBlogsListing({});

  // Helper function to extract image URL from media object
  const getImageUrlFromMedia = useCallback((media: TBlogsListing["media"]): string => {
    if (!media?.images || typeof media.images !== "object") {
      return DEFAULT_IMAGE_URL;
    }
    const imageKeys = Object.keys(media.images);
    if (imageKeys.length === 0) {
      return DEFAULT_IMAGE_URL;
    }
    return media.images[imageKeys[0]] || DEFAULT_IMAGE_URL;
  }, []);

  // Helper to get category name by ID
  const getCategoryNameById = useCallback((categoryId: number): string => {
    if (!categoriesData) return "";
    const category = categoriesData.find((cat) => cat.id === categoryId);
    return category?.name || "";
  }, [categoriesData]);

  // Transform blogs for recommended section
  const recommendedBlogs = useMemo(() => {
    if (!blogsListing || !Array.isArray(blogsListing)) return [];
    return blogsListing
      .slice(0, RECOMMENDED_BLOGS_LIMIT)
      .map((b: TBlogsListing) => {
        const description = b.excerpt || stripHtml(b.content || "");
        const preview =
          description.length > DESCRIPTION_PREVIEW_LENGTH
            ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trim()}...`
            : description;
        const imageUrl = getImageUrlFromMedia(b.media);
        const categoryIds = Array.isArray(b.categories) ? b.categories : [];
        const firstCategoryId = categoryIds[0];
        const categoryName = firstCategoryId
          ? getCategoryNameById(firstCategoryId)
          : "";

        return {
          id: b.id,
          title: b.title,
          description: preview,
          image: { uri: imageUrl },
          categories: categoryIds,
          categoryName,
          slug: b.slug,
          tag: b.tags && b.tags.length > 0 ? "TRENDING" : "NEW",
        };
      });
  }, [blogsListing, getImageUrlFromMedia, getCategoryNameById]);

  // Transform API categories for display
  const displayCategories = useMemo(() => {
    if (
      !categoriesData ||
      !Array.isArray(categoriesData) ||
      categoriesData.length === 0
    ) {
      return [];
    }

    return categoriesData.slice(0, CATEGORIES_GRID_LIMIT).map((category, index) => ({
      id: category.id,
      name: category.name,
      subtitle:
        category.subtitle ||
        category.description?.toUpperCase() ||
        category.name.toUpperCase(),
      icon: category.icon || getCategoryIcon(category.name),
      image: category.image,
      backgroundColor:
        category.backgroundColor || getCategoryBackgroundColor(index),
    }));
  }, [categoriesData]);

  const handleBlogPress = useCallback(
    (item: any) => {
      const blogId = item?.id;
      const slug = item?.slug;
      const categoryId =
        Array.isArray(item?.categories) && item.categories.length > 0
          ? item.categories[0]
          : undefined;

      if (!blogId || !slug || !categoryId) {
        console.warn("[Home] Missing required blog data:", {
          blogId,
          slug,
          categoryId,
        });
        return;
      }

      router.push(buildRoute.blogDetail(blogId, categoryId, slug) as any);
    },
    [router]
  );

  const handleCategoryPress = useCallback(
    (categoryId: number) => {
      router.push(`${AppRoutes.BLOGS}?categoryId=${categoryId}` as any);
    },
    [router]
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
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back {userName ? `, ${userName}!` : '!'}</Text>
        </View>

        {/* Search Bar */}
        <Pressable onPress={handleSearchPress} style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.TEXT_SECONDARY}
            style={styles.searchIcon}
          />
          <Text style={styles.searchPlaceholder}>
            Search articles, recipes, blogs...
          </Text>
        </Pressable>

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
              <Text style={styles.loadingText}>Loading...</Text>
            ) : recommendedBlogs.length > 0 ? (
              recommendedBlogs.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.recommendedCard}
                  onPress={() => handleBlogPress(item)}
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
                    <Text style={styles.recommendedMetaText} numberOfLines={1}>
                      {item.categoryName}
                    </Text>
                  ) : null}
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
            <Text style={styles.loadingText}>Loading categories...</Text>
          ) : displayCategories.length > 0 ? (
            <View style={styles.categoriesGrid}>
              {displayCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    { backgroundColor: category.backgroundColor },
                  ]}
                  onPress={() => handleCategoryPress(category.id)}
                  activeOpacity={0.7}
                >
                  {category.image ? (
                    <Image
                      source={{ uri: category.image }}
                      style={styles.categoryImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons
                      name={category.icon as any}
                      size={32}
                      color={COLORS.PRIMARY_GREEN}
                      style={styles.categoryIcon}
                    />
                  )}
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "400",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.SEARCH_BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
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
  recommendedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    lineHeight: 20,
  },
  recommendedMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recommendedMetaText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    width: "47%",
    aspectRatio: 1.1,
    borderRadius: 16,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIcon: {
    marginBottom: 12,
  },
  categoryImage: {
    width: 40,
    height: 40,
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
    textAlign: "center",
  },
  categorySubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.TEXT_SECONDARY,
    textTransform: "uppercase",
    textAlign: "center",
    letterSpacing: 0.5,
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
});
