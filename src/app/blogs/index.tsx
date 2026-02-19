import { SkeletonBlogCard } from "@/src/components/ui/SkeletonLoader";
import { COLORS } from "@/src/constant/app-constants";
import { useBlogsListing, useBlogWishlistToggle } from "@/src/services/blogApi";
import { useWishlistHandler } from "@/src/store/wishlist/hook";
import { useWishlistSelector } from "@/src/store/wishlist/selector";
import { TypographyStyles } from "@/src/theme/theme";
import { stripHtml } from "@/src/utils/blogs-helper";
import { AppRoutes, buildRoute } from "@/src/utils/enums";
import { formatDate } from "@/src/utils/format-date";
import { toast } from "@/src/utils/toast";
import type { TBlogsListing } from "@/src/utils/types/blogs";
import React, {
  useCallback,
  useMemo,
} from "react";

import { useCurrentProfile } from "@/src/hooks";
import { useGetCategories } from "@/src/services/categoryApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BlogListScreen() {
  const router = useRouter();
  const { isLoggedIn } = useCurrentProfile();
  const { blogsWishlist } = useWishlistSelector();
  
  // Get categoryId from query params
  const { categoryId: categoryIdParam } = useLocalSearchParams<{
    categoryId?: string;
  }>();
  
  const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;
  const { data: categoriesData } = useGetCategories();
  
  // Get category name for header
  const categoryName = useMemo(() => {
    if (!categoryId || !categoriesData) return null;
    const category = categoriesData.find((cat) => cat.id === categoryId);
    return category?.name || null;
  }, [categoryId, categoriesData]);

  const {
    data: blogsListing,
    isLoading,
    refetch: refetchBlogsListing,
    error: blogsError,
  } = useBlogsListing({
    ...(categoryId && { categoryIds: [categoryId] }),
  });

  const { toggleBlogWishlist: toggleWishlistInStore } = useWishlistHandler();
  const { mutate: toggleBlogWishlist, isPending: wishlistLoading } =
    useBlogWishlistToggle();

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleBlogPress = useCallback(
    (item: any) => {
      const blogId = item?.id;
      const slug = item?.slug;

      if (!blogId || !slug) {
        console.warn("[BlogList] Missing required blogId or slug:", {
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
        console.warn("[BlogList] Missing categoryId for blog:", {
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

  const handleAuthorPress = useCallback(
    (author: string) => {
      router.push(buildRoute.authorProfile(author) as any);
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

      // Call API to toggle wishlist
      toggleBlogWishlist(
        { id: blogId },
        {
          onSuccess: (data) => {
            if (isCurrentlyInWishlist) {
              toast.success("Removed from saved articles", "Removed");
            } else {
              toast.success("Added to saved articles", "Saved");
            }
          },
          onError: (error: any) => {
            // Show error toast
            const errorMessage =
              error?.response?.data?.message ||
              error?.message ||
              "Failed to update wishlist";
            toast.error(errorMessage, "Error");
          },
        },
      );
      toggleWishlistInStore(blogId);
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
    ({ item }: { item: any }) => (
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
              <Image source={item.image} style={styles.blogImage} />
            </Pressable>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.blogMeta}>{item.date}</Text>
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
              color={blogsWishlist.includes(item.id) ? COLORS.PRIMARY_GREEN : COLORS.TEXT_SECONDARY}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
      </Pressable>
    ),
    [
      handleBlogPress,
      blogsWishlist,
      handleToggleWishlist,
      wishlistLoading,
    ],
  );

  const renderHeader = useCallback(() => {
    const title = categoryName || "Blogs";
    return (
        <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.backButton} /> {/* Spacer for centering */}
        </View>
    );
  }, [handleBackPress, categoryName]);

  // Helper function to extract image URL from media object
  const getImageUrlFromMedia = (media: TBlogsListing["media"]): string => {
    if (!media || !media.images || typeof media.images !== "object") {
      return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop";
    }
    const imageKeys = Object.keys(media.images);
    if (imageKeys.length === 0) {
      return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop";
    }
    const firstKey = imageKeys[0];
    const imageUrl = media.images[firstKey];
    return (
      imageUrl ||
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop"
    );
  };

  // Transform blogs listing data for display
  // IMPORTANT: This hook must be called before any conditional returns
  const transformedBlogs = useMemo(() => {
    if (!blogsListing || !Array.isArray(blogsListing)) return [];
    return blogsListing.map((b: TBlogsListing) => {
      // Use excerpt if available, otherwise strip HTML from content as fallback
      const description = b.excerpt ? b.excerpt : stripHtml(b.content || "");
      const preview =
        description.length > 120
          ? `${description.slice(0, 120).trim()}...`
          : description;
      const imageUrl = getImageUrlFromMedia(b.media);
      return {
        id: b.id,
        title: b.title,
        description: preview,
        date: formatDate(b.publishedAt),
        image: { uri: imageUrl },
        categories: b.categories || [],
        slug: b.slug,
      };
    });
  }, [blogsListing]);

  const displayData = transformedBlogs;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {renderHeader()}
        <FlatList
          data={Array.from({ length: 5 })}
          keyExtractor={(_, index) => `skeleton-${index}`}
          renderItem={() => <SkeletonBlogCard />}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={null}
        />
      </SafeAreaView>
    );
  }

  if (blogsError) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={styles.errorMessage}>
            Failed to load content. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => refetchBlogsListing()}
            style={styles.authTestButton}
          >
            <Text style={styles.authTestButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <FlatList
        data={displayData}
        keyExtractor={(item) => `${item.id}`}
        renderItem={renderBlogItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
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
    paddingTop: 40,
  },
  errorMessage: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  authTestButton: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  authTestButtonText: {
    color: COLORS.TAG_TEXT,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 4,
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
  headerTitle: {
    fontSize: 20,
    marginLeft: 18,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.5,
  },

  blogCard: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: COLORS.BACKGROUND_WHITE,
  },
  blogCardPressed: {
    backgroundColor: COLORS.PRESSED_BG,
  },
  blogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  saveButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  authorText: {
    ...TypographyStyles.body,
    fontSize: 12,
    color: "#6b6b6b",
    fontWeight: "400",
    lineHeight: 16,
  },
  grayText: {
    color: "#6b6b6b",
  },
  blackText: {
    color: "#000",
    fontWeight: "500",
  },
  blogContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    // paddingTop: 10,
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
  blogMeta: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "400",
  },
  blogImage: {
    width: 112,
    height: 112,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
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
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER_LIGHT,
    marginTop: 4,
  },
});
