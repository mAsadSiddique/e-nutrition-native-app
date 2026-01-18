import { SkeletonBlogCard } from "@/src/components/ui/SkeletonLoader";
import { useBlogsListing, useBlogWishlistToggle } from "@/src/services/blogApi";
import { useWishlistHandler } from "@/src/store/wishlist/hook";
import { useWishlistSelector } from "@/src/store/wishlist/selector";
import { TypographyStyles } from "@/src/theme/theme";
import { stripHtml } from "@/src/utils/blogs-helper";
import { UserAction } from "@/src/utils/enums";
import { formatDate } from "@/src/utils/format-date";
import { toast } from "@/src/utils/toast";
import type { TBlogsListing } from "@/src/utils/types/blogs";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useCurrentProfile } from "@/src/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Animated,
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
  const { isLoggedIn } = useCurrentProfile()
  const { blogsWishlist, categoriesWishlist } = useWishlistSelector()

  const [activeTab, setActiveTab] = useState<UserAction>(UserAction.For_YOU);

  // Store measured tab widths
  const [forYouTabWidth, setForYouTabWidth] = useState(0);
  const [featuredTabWidth, setFeaturedTabWidth] = useState(0);
  const [forYouTabX, setForYouTabX] = useState(0);
  const [featuredTabX, setFeaturedTabX] = useState(0);

  // Track if underline has been initialized
  const isUnderlineInitialized = useRef(false);

  // Animation values for tab transitions
  const underlinePosition = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const forYouOpacity = useRef(new Animated.Value(1)).current;
  const featuredOpacity = useRef(new Animated.Value(0)).current;

  const { data: blogsListing, isLoading, refetch: refetchBlogsListing, error: blogsError } = useBlogsListing({
    ...(activeTab === UserAction.For_YOU && { categoryIds: categoriesWishlist as number[] })
  })

  const { toggleBlogWishlist: toggleWishlistInStore } = useWishlistHandler();
  const {
    mutate: toggleBlogWishlist,
    isPending: wishlistLoading,
  } = useBlogWishlistToggle();

  // Animate tab transitions
  useEffect(() => {
    if (forYouTabWidth === 0 || featuredTabWidth === 0) return; // Wait for measurements

    const isForYou = activeTab === UserAction.For_YOU;
    const targetX = isForYou ? forYouTabX : featuredTabX;
    const targetWidth = isForYou ? forYouTabWidth : featuredTabWidth;

    Animated.parallel([
      // Animate underline position with spring effect
      Animated.spring(underlinePosition, {
        toValue: targetX,
        tension: 50,
        friction: 7,
        useNativeDriver: false, // We need to animate layout properties
      }),
      // Animate underline width
      Animated.spring(underlineWidth, {
        toValue: targetWidth,
        tension: 50,
        friction: 7,
        useNativeDriver: false,
      }),
      // Animate text opacity for smooth color transition
      Animated.timing(forYouOpacity, {
        toValue: isForYou ? 1 : 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(featuredOpacity, {
        toValue: isForYou ? 0.5 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab, forYouTabWidth, featuredTabWidth, forYouTabX, featuredTabX, underlinePosition, underlineWidth, forYouOpacity, featuredOpacity]);

  const handleTabPress = useCallback((tab: UserAction) => {
    setActiveTab(tab);
  }, []);

  const handleBlogPress = useCallback(
    (item: any) => {
      const blogId = item?.id;
      const slug = item?.slug;

      if (!blogId || !slug) {
        console.warn('[BlogList] Missing required blogId or slug:', { blogId, slug });
        return;
      }

      // Get the first categoryId from the blog's categories array
      const categoryId = Array.isArray(item?.categories) && item.categories.length > 0
        ? item.categories[0]
        : undefined;

      if (!categoryId) {
        console.warn('[BlogList] Missing categoryId for blog:', { blogId, slug });
        return;
      }

      // Navigate to blog detail with required format: /blogs/{blogId}/{categoryId}/{slug}
      router.push(`/blogs/${blogId}/${categoryId}/${slug}`);
    },
    [router]
  );

  const handleAuthorPress = useCallback(
    (author: string) => {
      router.push(`/(tabs)/(home)/author/${encodeURIComponent(author)}`);
    },
    [router]
  );

  const handleToggleWishlist = useCallback(
    (blogId: number) => {
      // Check if user is authenticated before allowing save
      if (!isLoggedIn) {
        router.replace('/auth/sign-in');
        return;
      }

      // Check if blog is currently in wishlist to determine action
      const isCurrentlyInWishlist = blogsWishlist.includes(blogId);

      // Call API to toggle wishlist
      toggleBlogWishlist({ id: blogId }, {
        onSuccess: (data) => {
          if (isCurrentlyInWishlist) {
            toast.success('Removed from saved articles', 'Removed');
          } else {
            toast.success('Added to saved articles', 'Saved');
          }
        },
        onError: (error: any) => {
          // Show error toast
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update wishlist';
          toast.error(errorMessage, 'Error');
        },
      });
      toggleWishlistInStore(blogId);
    },
    [isLoggedIn, router, toggleWishlistInStore, toggleBlogWishlist, blogsWishlist]
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
              color={blogsWishlist.includes(item.id) ? "#1A8917" : "#666"}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
      </Pressable>
    ),
    [activeTab, handleBlogPress, handleAuthorPress, blogsWishlist, handleToggleWishlist, wishlistLoading]
  );

  const renderHeader = useCallback(
    () => {
      const forYouTextColor = forYouOpacity.interpolate({
        inputRange: [0.5, 1],
        outputRange: ['#8e8e8e', '#1A8917'],
      });

      const featuredTextColor = featuredOpacity.interpolate({
        inputRange: [0.5, 1],
        outputRange: ['#8e8e8e', '#1A8917'],
      });

      return (
        <>
          <View style={styles.headerContainer}>
            <View style={styles.logoWrapper}>
              <Text style={styles.logoText}>Energy Healing</Text>
              {/* <Image
                source={require("../../assets/logo.png")}
                style={styles.mediumTitle}
                resizeMode="contain"
              /> */}
            </View>
          </View>
          <View style={styles.tabContainer}>
            <View style={styles.tabContent}>
              <Pressable
                style={styles.tabButton}
                onPress={() => handleTabPress(UserAction.For_YOU)}
                onLayout={(event) => {
                  const { width, x } = event.nativeEvent.layout;
                  setForYouTabWidth(width);
                  setForYouTabX(x);
                  // Initialize underline position and width on first measurement
                  if (activeTab === UserAction.For_YOU && !isUnderlineInitialized.current) {
                    underlinePosition.setValue(x);
                    underlineWidth.setValue(width);
                    isUnderlineInitialized.current = true;
                  }
                }}
              >
                <Animated.Text
                  style={[
                    styles.tabText,
                    {
                      color: forYouTextColor,
                    },
                    activeTab === UserAction.For_YOU && { fontWeight: '500' },
                  ]}
                >
                  For you
                </Animated.Text>
              </Pressable>

              <Pressable
                style={styles.tabButton}
                onPress={() => handleTabPress(UserAction.FEATURED)}
                onLayout={(event) => {
                  const { width, x } = event.nativeEvent.layout;
                  setFeaturedTabWidth(width);
                  setFeaturedTabX(x);
                  // Initialize underline position and width on first measurement
                  if (activeTab === UserAction.FEATURED && !isUnderlineInitialized.current) {
                    underlinePosition.setValue(x);
                    underlineWidth.setValue(width);
                    isUnderlineInitialized.current = true;
                  }
                }}
              >
                <Animated.Text
                  style={[
                    styles.tabText,
                    {
                      color: featuredTextColor,
                    },
                    activeTab === UserAction.FEATURED && { fontWeight: '500' },
                  ]}
                >
                  Featured
                </Animated.Text>
              </Pressable>

              {/* Animated Underline */}
              <Animated.View
                style={[
                  styles.tabUnderline,
                  {
                    left: underlinePosition,
                    width: underlineWidth,
                  },
                ]}
              />
            </View>
          </View>
        </>
      );
    },
    [activeTab, handleTabPress, underlinePosition, underlineWidth, forYouOpacity, featuredOpacity]
  );

  // Helper function to extract image URL from media object
  const getImageUrlFromMedia = (media: TBlogsListing['media']): string => {
    if (!media || !media.images || typeof media.images !== "object") {
      return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop";
    }
    const imageKeys = Object.keys(media.images);
    if (imageKeys.length === 0) {
      return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop";
    }
    const firstKey = imageKeys[0];
    const imageUrl = media.images[firstKey];
    return imageUrl || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop";
  };

  // Transform blogs listing data for display
  // IMPORTANT: This hook must be called before any conditional returns
  const transformedBlogs = useMemo(() => {
    if (!blogsListing || !Array.isArray(blogsListing)) return [];
    return blogsListing.map((b: TBlogsListing) => {
      // Use excerpt if available, otherwise strip HTML from content as fallback
      const description = b.excerpt
        ? b.excerpt
        : stripHtml(b.content || "");
      const preview = description.length > 120 ? `${description.slice(0, 120).trim()}...` : description;
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
      <SafeAreaView style={styles.container} edges={["top"]}>
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
      <SafeAreaView style={styles.container} edges={["top"]}>
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
    <SafeAreaView style={styles.container} edges={["top"]}>
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
  // Container styles
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  errorMessage: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  authTestButton: {
    backgroundColor: "#1A8917",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  authTestButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 4,
  },
  logoWrapper: {
    width: "100%",
    alignItems: "flex-start",
  },
  logoText: {
    ...TypographyStyles.h2,
    fontSize: 26,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#fff",
    alignItems: "flex-start",
  },
  mediumTitle: {
    width: 210, // logo visually bara
    height: 130, // 🔥 real visible height (not screen height)
    marginBottom: -20,
    marginLeft: -70,
  },

  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    width: "100%",
  },
  tabContent: {
    ...TypographyStyles.body,
    flexDirection: "row",
    position: "relative",
    paddingHorizontal: 20,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginRight: 32,
    position: "relative",
  },
  tabText: {
    ...TypographyStyles.body,
    fontSize: 16,
    fontWeight: "400",
    color: "#8e8e8e",
    lineHeight: 20,
  },
  tabTextActive: {
    color: "#1A8917",
    fontWeight: "500",
  },
  tabUnderline: {
    position: "absolute",
    bottom: -1,
    left: 0,
    width: 80, // Approximate width of tab button
    height: 2,
    backgroundColor: "#1A8917",
  },

  // Blog card styles
  blogCard: {
    paddingHorizontal: 20,
    paddingTop: 12,
    // paddingBottom: 16,
    backgroundColor: "#fff",
  },
  blogCardPressed: {
    backgroundColor: "#fafafa",
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
    ...TypographyStyles.h2,
    fontSize: 22,
    color: "#000",
    lineHeight: 24,
    marginBottom: 8,
    letterSpacing: -0,
  },
  blogDescription: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: "#6b6b6b",
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: "400",
  },
  blogMeta: {
    fontSize: 13,
    color: "#6b6b6b",
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
    backgroundColor: "#f0f0f0",
    marginTop: 4,
  },
});
