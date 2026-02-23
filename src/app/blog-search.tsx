import { COLORS, DEFAULT_IMAGE_URL, DESCRIPTION_PREVIEW_LENGTH } from "@/src/constant/app-constants";
import { useCurrentProfile } from "@/src/hooks";
import { useBlogsListing, useBlogWishlistToggle } from "@/src/services";
import { useWishlistHandler } from "@/src/store/wishlist/hook";
import { useWishlistSelector } from "@/src/store/wishlist/selector";
import { TypographyStyles } from "@/src/theme/theme";
import { stripHtml } from "@/src/utils/blog-helpers";
import { AppRoutes, buildRoute } from "@/src/utils/enums";
import { toast } from "@/src/utils/toast";
import type { TBlogsListing } from "@/src/utils/types/blogs";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const router = useRouter();
  const { isLoggedIn } = useCurrentProfile();
  const [searchQuery, setSearchQuery] = useState("");

  // Only fetch blogs when user has entered a search query (minimum 2 characters)
  const trimmedQuery = searchQuery.trim();
  const shouldFetchBlogs = trimmedQuery.length >= 2;

  const {
    data: blogsListing,
    isLoading,
    refetch: refetchBlogs,
    error: blogsError,
  } = useBlogsListing({
    ...(shouldFetchBlogs && { search: trimmedQuery }),
    enabled: shouldFetchBlogs,
  });
  
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = useCallback(async () => {
    if (!shouldFetchBlogs) return;
    setRefreshing(true);
    try {
      await refetchBlogs();
    } finally {
      setRefreshing(false);
    }
  }, [refetchBlogs, shouldFetchBlogs]);

  const { blogsWishlist } = useWishlistSelector();
  const { toggleBlogWishlist: toggleWishlistInStore } = useWishlistHandler();
  const { mutate: toggleBlogWishlist, isPending: wishlistLoading } =
    useBlogWishlistToggle();

  // Helper function to format date
  const formatDate = useCallback((iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }, []);

  // Helper function to extract image URL from media object
  const getImageUrlFromMedia = useCallback((media: TBlogsListing["media"]): string => {
    if (!media?.images || typeof media.images !== "object") {
      return DEFAULT_IMAGE_URL;
    }
    const imageKeys = Object.keys(media.images);
    if (imageKeys.length === 0) {
      return DEFAULT_IMAGE_URL;
    }
    const firstKey = imageKeys[0];
    return media.images[firstKey] || DEFAULT_IMAGE_URL;
  }, []);

  // Transform blogs listing data for display
  const transformedBlogs = useMemo(() => {
    if (!blogsListing || !Array.isArray(blogsListing)) return [];
    return blogsListing.map((b: TBlogsListing) => {
      // Use excerpt if available, otherwise strip HTML from content as fallback
      const description = b.excerpt || stripHtml(b.content || "");
      const preview =
        description.length > DESCRIPTION_PREVIEW_LENGTH
          ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trim()}...`
          : description;
      const imageUrl = getImageUrlFromMedia(b.media);
      return {
        id: b.id,
        title: b.title || "",
        description: preview,
        date: formatDate(b.publishedAt),
        image: { uri: imageUrl },
        categories: b.categories || [],
        slug: b.slug || "",
      };
    });
  }, [blogsListing, getImageUrlFromMedia, formatDate]);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleBlogPress = useCallback(
    (item: any) => {
      const blogId = item?.id;
      const slug = item?.slug;

      if (!blogId || !slug) {
        console.warn("[SearchScreen] Missing required blogId or slug:", {
          blogId,
          slug,
        });
        return;
      }

      // Get the first categoryId from the blog's categories array
      const categoryId =
        Array.isArray(item?.categories) && item.categories.length > 0
          ? item.categories[0]
          : undefined;

      if (!categoryId) {
        console.warn("[SearchScreen] Missing categoryId for blog:", {
          blogId,
          slug,
        });
        return;
      }

      // Navigate to blog detail with required format: /blogs/{blogId}/{categoryId}/{slug}
      router.push(buildRoute.blogDetail(blogId, categoryId, slug) as any);
    },
    [router],
  );

  const handleToggleWishlist = useCallback(
    (blogId: number) => {
      // Check if user is authenticated before allowing save
      if (!isLoggedIn) {
        router.replace(AppRoutes.AUTH_SIGN_IN);
        return;
      }

      // Check if blog is currently in wishlist to determine action
      const isCurrentlyInWishlist = blogsWishlist.includes(blogId);

      // Toggle local wishlist state immediately for better UX
      toggleWishlistInStore(blogId);

      // Call API to toggle wishlist
      toggleBlogWishlist(
        { id: blogId },
        {
          onSuccess: (data) => {
            // Show success toast based on action
            if (isCurrentlyInWishlist) {
              toast.success("Removed from saved articles", "Removed");
            } else {
              toast.success("Added to saved articles", "Saved");
            }
          },
          onError: (error: any) => {
            console.error(
              "[SearchScreen] ❌ Failed to toggle blog wishlist:",
              error,
            );
            // Revert local state on error
            toggleWishlistInStore(blogId);
            // Show error toast
            const errorMessage =
              error?.response?.data?.message ||
              error?.message ||
              "Failed to update wishlist";
            toast.error(errorMessage, "Error");
          },
        },
      );
    },
    [
      isLoggedIn,
      router,
      toggleWishlistInStore,
      toggleBlogWishlist,
      blogsWishlist,
    ],
  );

  const renderBlogItem = useCallback(
    ({ item }: { item: any }) => {
      const isInWishlist = blogsWishlist.includes(item.id);
      return (
        <Pressable
          style={({ pressed }) => [
            styles.blogCard,
            pressed && styles.blogCardPressed,
          ]}
          onPress={() => handleBlogPress(item)}
        >
          <View style={styles.blogContent}>
            <View style={styles.blogTextContent}>
              <Text numberOfLines={3} style={styles.blogTitle}>
                {item.title}
              </Text>
              <Text numberOfLines={2} style={styles.blogDescription}>
                {item.description}
              </Text>
            </View>
            <View style={styles.rightColumn}>
              <Pressable onPress={() => handleBlogPress(item)}>
                <Image
                  source={item.image}
                  style={styles.blogImage}
                  resizeMode="cover"
                />
              </Pressable>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.blogMeta}>{item.date}</Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={(e) => {
                e.stopPropagation();
                handleToggleWishlist(item.id);
              }}
              accessibilityLabel={isInWishlist ? "Remove from saved" : "Save article"}
              accessibilityRole="button"
              disabled={wishlistLoading}
            >
              <Ionicons
                name={isInWishlist ? "bookmark" : "bookmark-outline"}
                size={18}
                color={isInWishlist ? COLORS.PRIMARY_GREEN : COLORS.TEXT_SECONDARY}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
        </Pressable>
      );
    },
    [handleBlogPress, handleToggleWishlist, blogsWishlist, wishlistLoading],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header with back button and search input */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={18}
            color={COLORS.TEXT_SECONDARY}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search articles, recipes, blogs..."
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            autoFocus={true}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="never"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {trimmedQuery.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyTitle}>Search for blogs</Text>
          <Text style={styles.emptySubtitle}>
            Enter keywords to find articles, recipes, and more
          </Text>
        </View>
      ) : trimmedQuery.length === 1 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyTitle}>Keep typing...</Text>
          <Text style={styles.emptySubtitle}>
            Enter at least 2 characters to search
          </Text>
        </View>
      ) : isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY_GREEN} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : blogsError ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.errorText}>Failed to load results</Text>
          <Text style={styles.errorSubtext}>Please try again</Text>
        </View>
      ) : transformedBlogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>
            Try different keywords or search terms
          </Text>
        </View>
      ) : (
        <FlatList
          data={transformedBlogs}
          keyExtractor={(item) => `blog-${item.id}`}
          renderItem={renderBlogItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          keyboardShouldPersistTaps="handled"
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
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
    marginRight: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.SEARCH_BG,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...TypographyStyles.body,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 0,
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
    ...TypographyStyles.body,
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 24,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  blogDescription: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: "400",
  },
  blogMeta: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "400",
  },
  blogImage: {
    width: 112,
    height: 112,
    borderRadius: 4,
    backgroundColor: COLORS.BORDER_LIGHT,
  },
  rightColumn: {
    width: 112,
    marginLeft: 8,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  metaRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    paddingRight: 0,
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    ...TypographyStyles.h4,
    color: COLORS.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  emptySubtitle: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingText: {
    ...TypographyStyles.body,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  errorText: {
    ...TypographyStyles.body,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: "600",
    marginBottom: 4,
  },
  errorSubtext: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
});
