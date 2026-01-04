import { SkeletonBlogCard } from "@/src/components/ui/SkeletonLoader";
import { useBlogsListing, useBlogWishlistToggle } from '@/src/services/blogApi';
import { useWishlistHandler } from '@/src/store/wishlist/hook';
import { useWishlistSelector } from '@/src/store/wishlist/selector';
import { TypographyStyles } from '@/src/theme/theme';
import { stripHtml } from '@/src/utils/blogs-helper';
import { formatDate } from '@/src/utils/format-date';
import { toast } from '@/src/utils/toast';
import type { TBlogsListing } from '@/src/utils/types/blogs';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookmarksTab() {
  const router = useRouter();
  const { blogsWishlist } = useWishlistSelector();

  const { data: wishListBlogs, isLoading, refetch: refetchBlogsListing, error: blogsError } = useBlogsListing({
    ids: blogsWishlist?.length ? blogsWishlist : [-1]
  });

  const { toggleBlogWishlist: toggleWishlistInStore } = useWishlistHandler();
  const {
    mutate: toggleBlogWishlist,
    isPending: wishlistLoading,
  } = useBlogWishlistToggle();

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
  const transformedBlogs = useMemo(() => {
    if (!wishListBlogs || !Array.isArray(wishListBlogs)) return [];
    return wishListBlogs.map((b: TBlogsListing) => {
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
  }, [wishListBlogs]);

  const handleBlogPress = useCallback(
    (item: any) => {
      const slugOrId = item?.slug ?? item?.id ?? "";
      if (!slugOrId) return;

      // Get the first categoryId from the blog's categories array
      const categoryId = Array.isArray(item?.categories) && item.categories.length > 0
        ? item.categories[0]
        : undefined;

      // Navigate to blog detail with categoryId as query parameter
      if (categoryId !== undefined) {
        router.push({
          pathname: '/blogs/[id]',
          params: { id: String(slugOrId), categoryId: String(categoryId) },
        });
      } else {
        router.push(`/blogs/${slugOrId}`);
      }
    },
    [router]
  );

  const handleToggleWishlist = useCallback(
    (blogId: number) => {
      // Check if blog is currently in wishlist to determine action
      const isCurrentlyInWishlist = blogsWishlist.includes(blogId);
      
      // Toggle local wishlist state immediately for better UX
      toggleWishlistInStore(blogId);

      // Call API to toggle wishlist
      toggleBlogWishlist(
        { id: blogId },
        {
          onSuccess: (data) => {
            console.log('[BookmarksTab] ✅ Successfully toggled blog wishlist:', data);
            // Show success toast - in bookmarks tab, we're always removing
            toast.success('Removed from saved articles', 'Removed');
          },
          onError: (error: any) => {
            console.error('[BookmarksTab] ❌ Failed to toggle blog wishlist:', error);
            // Revert local state on error
            toggleWishlistInStore(blogId);
            // Show error toast
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to remove from saved articles';
            toast.error(errorMessage, 'Error');
          },
        }
      );
    },
    [toggleWishlistInStore, toggleBlogWishlist, blogsWishlist]
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
    [handleBlogPress, blogsWishlist, handleToggleWishlist, wishlistLoading]
  );

  const renderHeader = useCallback(() => (
    <View style={styles.headerContainer}>
      <Text style={styles.mediumTitle}>Saved Articles</Text>
    </View>
  ), []);

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

  if (transformedBlogs.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        {renderHeader()}
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No saved articles yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the bookmark icon on any article to save it here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={transformedBlogs}
        renderItem={renderBlogItem}
        keyExtractor={(item) => `${item.id}`}
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
    backgroundColor: '#fff',
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
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 25,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  mediumTitle: {
    ...TypographyStyles.h2,
    fontSize: 28,
    color: '#000',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    ...TypographyStyles.h3,
    fontSize: 20,
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TypographyStyles.body,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Blog card styles (same as blogs/index.tsx)
  blogCard: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#fff',
  },
  blogCardPressed: {
    backgroundColor: '#fafafa',
  },
  blogContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  blogTextContent: {
    flex: 1,
    paddingRight: 16,
    justifyContent: 'flex-start',
  },
  blogTitle: {
    ...TypographyStyles.h2,
    fontSize: 22,
    color: '#000',
    lineHeight: 24,
    marginBottom: 8,
    letterSpacing: -0,
  },
  blogDescription: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: '#6b6b6b',
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '400',
  },
  blogMeta: {
    fontSize: 13,
    color: '#6b6b6b',
    fontWeight: '400',
  },
  blogImage: {
    width: 112,
    height: 112,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  rightColumn: {
    width: 112,
    marginLeft: 8,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  metaRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingRight: 0,
  },
  saveButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginTop: 4,
  },
});


