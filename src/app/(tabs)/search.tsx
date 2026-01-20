
import { useBlogsListing, useBlogWishlistToggle } from '@/src/services';
import { useAuth } from '@/src/store/auth/hook';
import { useWishlistHandler } from '@/src/store/wishlist/hook';
import { useWishlistSelector } from '@/src/store/wishlist/selector';
import { TypographyStyles } from '@/src/theme/theme';
import { AppRoutes, buildRoute } from '@/src/utils/enums';
import { toast } from '@/src/utils/toast';
import type { TBlogsListing } from '@/src/utils/types/blogs';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchTab() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [tabsAction, setTabsAction] = useState('');

  // Tabs state (moved up so effect can use it)
  const [selectedTab, setSelectedTab] = useState<'Latest' | 'Tags' | 'Blogs'>('Latest');

  // Store measured tab widths and positions
  const [latestTabWidth, setLatestTabWidth] = useState(0);
  const [tagsTabWidth, setTagsTabWidth] = useState(0);
  const [blogsTabWidth, setBlogsTabWidth] = useState(0);
  const [latestTabX, setLatestTabX] = useState(0);
  const [tagsTabX, setTagsTabX] = useState(0);
  const [blogsTabX, setBlogsTabX] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Animation values for tab transitions
  const underlinePosition = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const latestOpacity = useRef(new Animated.Value(1)).current;
  const tagsOpacity = useRef(new Animated.Value(0)).current;
  const blogsOpacity = useRef(new Animated.Value(0)).current;
  const isInitialized = useRef(false);

  const isSlugLike = /^[a-z0-9]+(?:-[a-z0-9]+)+$/i.test(tabsAction);

  // Only fetch blogs when user has entered a search query
  const shouldFetchBlogs = tabsAction.trim() !== '';
  
  const { data: blogsListing, isLoading } = useBlogsListing({
    ...(isSlugLike && { slug: tabsAction }),
    ...(selectedTab === 'Latest' && tabsAction.trim() && { search: tabsAction }),
    ...(selectedTab === 'Blogs' && tabsAction.trim() && { search: tabsAction }),
    ...(selectedTab === 'Tags' && tabsAction.trim() && { tags: tabsAction }),
    enabled: shouldFetchBlogs,
  })

  const { blogsWishlist } = useWishlistSelector()
  const { toggleBlogWishlist: toggleWishlistInStore } = useWishlistHandler();
  const {
    mutate: toggleBlogWishlist,
    isPending: wishlistLoading,
  } = useBlogWishlistToggle();

  // Helper function to strip HTML tags
  const stripHtml = (html: string) => {
    if (!html) return "";
    const text = html.replace(/<[^>]*>/g, "");
    return text.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (s) => {
      switch (s) {
        case "&nbsp;":
          return " ";
        case "&amp;":
          return "&";
        case "&lt;":
          return "<";
        case "&gt;":
          return ">";
        case "&quot;":
          return '"';
        case "&#39;":
          return "'";
        default:
          return s;
      }
    });
  };

  // Helper function to format date
  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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

  // Recalculate X positions when containerWidth or text widths change
  useEffect(() => {
    if (containerWidth === 0 || latestTabWidth === 0 || tagsTabWidth === 0 || blogsTabWidth === 0) return;

    const buttonWidth = containerWidth / 3;

    // Calculate positions for each tab
    const latestX = (buttonWidth / 2) - (latestTabWidth / 2);
    const tagsX = buttonWidth + (buttonWidth / 2) - (tagsTabWidth / 2);
    const blogsX = (buttonWidth * 2) + (buttonWidth / 2) - (blogsTabWidth / 2);

    setLatestTabX(latestX);
    setTagsTabX(tagsX);
    setBlogsTabX(blogsX);

    // Initialize if not already done
    if (!isInitialized.current && selectedTab === 'Latest') {
      underlinePosition.setValue(latestX);
      underlineWidth.setValue(latestTabWidth);
      isInitialized.current = true;
    }
  }, [containerWidth, latestTabWidth, tagsTabWidth, blogsTabWidth, selectedTab]);

  // Animate tab transitions
  useEffect(() => {
    if (latestTabWidth === 0 || tagsTabWidth === 0 || blogsTabWidth === 0 || containerWidth === 0) return; // Wait for measurements

    let targetX = 0;
    let targetWidth = 0;
    let isLatest = false;
    let isTags = false;
    let isBlogs = false;

    const buttonWidth = containerWidth / 3;

    if (selectedTab === 'Latest') {
      targetX = (buttonWidth / 2) - (latestTabWidth / 2);
      targetWidth = latestTabWidth;
      isLatest = true;
    } else if (selectedTab === 'Tags') {
      targetX = buttonWidth + (buttonWidth / 2) - (tagsTabWidth / 2);
      targetWidth = tagsTabWidth;
      isTags = true;
    } else if (selectedTab === 'Blogs') {
      targetX = (buttonWidth * 2) + (buttonWidth / 2) - (blogsTabWidth / 2);
      targetWidth = blogsTabWidth;
      isBlogs = true;
    }

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
      Animated.timing(latestOpacity, {
        toValue: isLatest ? 1 : 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(tagsOpacity, {
        toValue: isTags ? 1 : 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(blogsOpacity, {
        toValue: isBlogs ? 1 : 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedTab, latestTabWidth, tagsTabWidth, blogsTabWidth, containerWidth]);

  const handleBlogPress = useCallback(
    (item: any) => {
      const blogId = item?.id;
      const slug = item?.slug;

      if (!blogId || !slug) {
        console.warn('[SearchTab] Missing required blogId or slug:', { blogId, slug });
        return;
      }

      // Get the first categoryId from the blog's categories array
      const categoryId = Array.isArray(item?.categories) && item.categories.length > 0
        ? item.categories[0]
        : undefined;

      if (!categoryId) {
        console.warn('[SearchTab] Missing categoryId for blog:', { blogId, slug });
        return;
      }

      // Navigate to blog detail with required format: /blogs/{blogId}/{categoryId}/{slug}
      router.push(buildRoute.blogDetail(blogId, categoryId, slug) as any);
    },
    [router]
  );

  const handleToggleWishlist = useCallback(
    (blogId: number) => {
      // Check if user is authenticated before allowing save
      if (!isAuthenticated) {
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
              toast.success('Removed from saved articles', 'Removed');
            } else {
              toast.success('Added to saved articles', 'Saved');
            }
          },
          onError: (error: any) => {
            console.error('[SearchTab] ❌ Failed to toggle blog wishlist:', error);
            // Revert local state on error
            toggleWishlistInStore(blogId);
            // Show error toast
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update wishlist';
            toast.error(errorMessage, 'Error');
          },
        }
      );
    },
    [isAuthenticated, router, toggleWishlistInStore, toggleBlogWishlist, blogsWishlist]
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
    [handleBlogPress, handleToggleWishlist, blogsWishlist, wishlistLoading]
  );

  // Determine which data to display based on selected tab
  const displayData = useMemo(() => {
    // All tabs (Latest, Tags, Blogs) display blogs when there's data
    if (selectedTab === 'Tags' || selectedTab === 'Latest' || selectedTab === 'Blogs') {
      return transformedBlogs;
    }
    return [];
  }, [selectedTab, transformedBlogs]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={styles.searchBar}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={18} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder="Search nutrition articles, recipes"
            placeholderTextColor="#666"
            value={tabsAction}
            onChangeText={setTabsAction}
            style={styles.inputExpanded}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      </View>
      {/* tabs selection... */}
      <View
        style={styles.tabsContainer}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setContainerWidth(width);
        }}
      >
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab('Latest')}
          activeOpacity={0.8}
        >
          <View
            onLayout={(event) => {
              const { width: textWidth } = event.nativeEvent.layout;
              setLatestTabWidth(textWidth);
            }}
          >
            <Animated.Text
              style={[
                styles.tabText,
                {
                  color: latestOpacity.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: ['#8e8e8e', '#1A8917'],
                  }),
                },
                selectedTab === 'Latest' && { fontWeight: '500' },
              ]}
            >
              Latest
            </Animated.Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab('Tags')}
          activeOpacity={0.8}
        >
          <View
            onLayout={(event) => {
              const { width: textWidth } = event.nativeEvent.layout;
              setTagsTabWidth(textWidth);
            }}
          >
            <Animated.Text
              style={[
                styles.tabText,
                {
                  color: tagsOpacity.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: ['#8e8e8e', '#1A8917'],
                  }),
                },
                selectedTab === 'Tags' && { fontWeight: '500' },
              ]}
            >
              Tags
            </Animated.Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab('Blogs')}
          activeOpacity={0.8}
        >
          <View
            onLayout={(event) => {
              const { width: textWidth } = event.nativeEvent.layout;
              setBlogsTabWidth(textWidth);
            }}
          >
            <Animated.Text
              style={[
                styles.tabText,
                {
                  color: blogsOpacity.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: ['#8e8e8e', '#1A8917'],
                  }),
                },
                selectedTab === 'Blogs' && { fontWeight: '500' },
              ]}
            >
              Blogs
            </Animated.Text>
          </View>
        </TouchableOpacity>

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
      {tabsAction.trim() === '' ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('@/src/assets/images/partial-react-logo.jpg')}
            style={styles.emptyImage}
            resizeMode="contain"
          />
        </View>
      ) : (
        <>
          {isLoading && shouldFetchBlogs ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Loading blogs...</Text>
            </View>
          ) : (
            <FlatList
              data={displayData}
              keyExtractor={(item: any) => String(item.id ?? item.name)}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                (shouldFetchBlogs && displayData.length === 0) ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>No blogs found</Text>
                  </View>
                ) : null
              }
              renderItem={({ item }) => {
                return renderBlogItem({ item });
              }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  input: {
    ...TypographyStyles.body,
    backgroundColor: '#f2f2f2',
    paddingVertical: 12,
    fontSize: 15,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  searchInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6e6e6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 30 },
  searchIcon: { marginRight: 10, fontSize: 18 },
  inputExpanded: { ...TypographyStyles.bodySans, flex: 1, paddingVertical: 6, paddingHorizontal: 0, backgroundColor: 'transparent', fontSize: 15 },

  tabsContainer: { flexDirection: 'row', paddingHorizontal: 0, paddingTop: 8, paddingBottom: 8, position: 'relative', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, position: 'relative' },
  tabInner: { alignItems: 'center', paddingBottom: 8 },
  tabText: { ...TypographyStyles.bodySmallSans, fontSize: 16, fontWeight: '400', color: '#8e8e8e', lineHeight: 20 },
  tabTextActive: { color: '#1A8917', fontWeight: '500' },
  tabUnderline: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    height: 2,
    backgroundColor: '#1A8917',
  },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { ...TypographyStyles.h4, color: '#111', marginBottom: 20 },
  emptyImage: { width: 220, height: 180, opacity: 0.95 },

  tagCardGrid: { flex: 1, marginHorizontal: 6, paddingVertical: 16, paddingHorizontal: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0f0f0', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tagTextGrid: { ...TypographyStyles.bodySmallSans, color: '#111', textAlign: 'center' },

  // Blog card styles (matching main blogs page)
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 0,
  },
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


