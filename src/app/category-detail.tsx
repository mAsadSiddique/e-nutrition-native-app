import { SkeletonBlogCard } from "@/src/components/ui/SkeletonLoader";
import { COLORS, DESCRIPTION_PREVIEW_LENGTH } from "@/src/constant/app-constants";
import { useWishlistToggle } from "@/src/hooks/useWishlistToggle";
import { useBlogsListing } from "@/src/services/blogApi";
import {
  extractAllCategoryIds,
  useGetCategoriesWithChildren
} from "@/src/services/categoryApi";
import { useWishlistSelector } from "@/src/store/wishlist/selector";
import { TypographyStyles } from "@/src/theme/theme";
import { transformBlogs } from "@/src/utils/blog-helpers";
import { findCategoryById } from "@/src/utils/category-helpers";
import { handleBlogPress } from "@/src/utils/navigation-helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { blogsWishlist } = useWishlistSelector();
  const { handleToggleWishlist, wishlistLoading } = useWishlistToggle();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);

  // Get categoryId from query params
  const { categoryId: categoryIdParam } = useLocalSearchParams<{
    categoryId?: string;
  }>();

  const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;

  // Get categories with children structure
  const { data: categoriesWithChildren } = useGetCategoriesWithChildren();

  // Find the selected category and its subcategories
  const selectedCategory = useMemo(() => {
    if (!categoryId || !categoriesWithChildren) return null;
    return findCategoryById(categoriesWithChildren, categoryId);
  }, [categoryId, categoriesWithChildren]);

  const subcategories = useMemo(() => {
    if (!selectedCategory || !selectedCategory.children) return [];
    return selectedCategory.children;
  }, [selectedCategory]);

  // Determine which category IDs to filter blogs by
  const categoryIdsToFilter = useMemo(() => {
    if (!selectedCategory) return undefined;
    
    if (selectedSubcategoryId) {
      // Filter by selected subcategory only
      return [selectedSubcategoryId];
    }
    
    // If no subcategory selected, include all subcategory IDs + parent category ID
    if (subcategories.length > 0) {
      const allIds = [selectedCategory.id];
      subcategories.forEach((sub) => {
        allIds.push(...extractAllCategoryIds(sub));
      });
      return allIds;
    }
    
    // No subcategories, just use parent category
    return [selectedCategory.id];
  }, [selectedCategory, selectedSubcategoryId, subcategories]);

  // Fetch blogs filtered by category
  const {
    data: blogsListing,
    isLoading,
    refetch: refetchBlogs,
    error: blogsError,
  } = useBlogsListing({
    ...(categoryIdsToFilter && { categoryIds: categoryIdsToFilter }),
    ...(searchQuery.trim().length >= 2 && { search: searchQuery.trim() }),
  });
  
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchBlogs();
    } finally {
      setRefreshing(false);
    }
  }, [refetchBlogs]);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const onBlogPress = useCallback(
    (item: any) => {
      handleBlogPress(router, item);
    },
    [router]
  );

  // Transform blogs for display
  const transformedBlogs = useMemo(() => {
    if (!blogsListing || !Array.isArray(blogsListing)) return [];
    return transformBlogs(blogsListing, {
      includeDate: true,
      previewLength: DESCRIPTION_PREVIEW_LENGTH,
    });
  }, [blogsListing]);

  const handleSubcategoryPress = useCallback((subcategoryId: number | null) => {
    setSelectedSubcategoryId(subcategoryId);
  }, []);

  const renderBlogItem = useCallback(
    ({ item }: { item: any }) => (
      <Pressable
        style={({ pressed }) => [
          styles.blogCard,
          pressed && styles.blogCardPressed,
        ]}
        onPress={() => onBlogPress(item)}
      >
        <View style={styles.blogContent}>
          <View style={styles.blogTextContent}>
            <Text numberOfLines={3} style={styles.blogTitle}>
              {String(item.title || "")}
            </Text>
            <Text numberOfLines={2} style={styles.blogDescription}>
              {String(item.description || "")}
            </Text>
          </View>
          <View style={styles.rightColumn}>
            <Pressable onPress={() => onBlogPress(item)}>
              <Image source={item.image} style={styles.blogImage} />
            </Pressable>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.blogMeta}>{String(item.date || "")}</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => handleToggleWishlist(item.id)}
            accessibilityLabel="Save article"
            disabled={wishlistLoading}
          >
            <Ionicons
              name={
                blogsWishlist.includes(item.id)
                  ? "bookmark"
                  : "bookmark-outline"
              }
              size={18}
              color={
                blogsWishlist.includes(item.id)
                  ? COLORS.PRIMARY_GREEN
                  : COLORS.TEXT_SECONDARY
              }
            />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
      </Pressable>
    ),
    [onBlogPress, blogsWishlist, handleToggleWishlist, wishlistLoading]
  );

  const renderHeader = useCallback(() => {
    const categoryName = selectedCategory?.name || "Category";
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{String(categoryName)}</Text>
      </View>
    );
  }, [handleBackPress, selectedCategory]);

  if (!selectedCategory) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY_GREEN} />
          <Text style={styles.loadingText}>Loading category...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {renderHeader()}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={18}
            color={COLORS.TEXT_SECONDARY}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder={`Search ${selectedCategory.name}...`}
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.TEXT_SECONDARY}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      {subcategories.length > 0 && (
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.tab,
                selectedSubcategoryId === null && styles.tabActive,
              ]}
              onPress={() => handleSubcategoryPress(null)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedSubcategoryId === null && styles.tabTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {subcategories.map((subcategory) => (
              <TouchableOpacity
                key={subcategory.id}
                style={[
                  styles.tab,
                  selectedSubcategoryId === subcategory.id && styles.tabActive,
                ]}
                onPress={() => handleSubcategoryPress(subcategory.id)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedSubcategoryId === subcategory.id &&
                      styles.tabTextActive,
                  ]}
                >
                  {String(subcategory.name || "")}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <FlatList
          data={Array.from({ length: 5 })}
          keyExtractor={(_, index) => `skeleton-${index}`}
          renderItem={() => <SkeletonBlogCard />}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      ) : blogsError ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={COLORS.TEXT_SECONDARY}
          />
          <Text style={styles.errorText}>Failed to load content</Text>
          <Text style={styles.errorSubtext}>Please try again</Text>
        </View>
      ) : transformedBlogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="document-text-outline"
            size={64}
            color={COLORS.TEXT_SECONDARY}
          />
          <Text style={styles.emptyTitle}>No content found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery.trim()
              ? "Try different search terms"
              : "No blogs available in this category"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={transformedBlogs}
          keyExtractor={(item) => `${item.id}`}
          renderItem={renderBlogItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
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
  moreButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.5,
    textAlign: "center",
    marginHorizontal: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.BACKGROUND_WHITE,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.SEARCH_BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
    backgroundColor: COLORS.BACKGROUND_WHITE,
  },
  tabsScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.SEARCH_BG,
  },
  tabActive: {
    backgroundColor: COLORS.PRIMARY_GREEN,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.TEXT_SECONDARY,
  },
  tabTextActive: {
    color: COLORS.TAG_TEXT,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 4,
  },
  blogCard: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: COLORS.BACKGROUND_WHITE,
  },
  blogCardPressed: {
    backgroundColor: COLORS.PRESSED_BG,
  },
  blogContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  blogTextContent: {
    flex: 1,
    paddingRight: 16,
    justifyContent: "flex-start",
  },
  blogTitle: {
    fontFamily: "Inter-Regular",
    fontWeight: "800",
    fontSize: 20,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 24,
    marginBottom: 8,
    letterSpacing: -0,
  },
  blogDescription: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: "400",
  },
  rightColumn: {
    width: 112,
    marginLeft: 8,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  blogImage: {
    width: 112,
    height: 112,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
  },
  metaRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    paddingRight: 0,
  },
  blogMeta: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "400",
  },
  saveButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER_LIGHT,
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "600",
    marginTop: 12,
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "600",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
