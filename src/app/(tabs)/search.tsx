import { useBlogsListing, useBlogWishlistToggle } from "@/src/services";
import { useAuth } from "@/src/store/auth/hook";
import { useWishlistHandler } from "@/src/store/wishlist/hook";
import { useWishlistSelector } from "@/src/store/wishlist/selector";
import { TypographyStyles } from "@/src/theme/theme";
import { AppRoutes, buildRoute } from "@/src/utils/enums";
import { toast } from "@/src/utils/toast";
import type { TBlogsListing } from "@/src/utils/types/blogs";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchTab() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const isSlugLike = /^[a-z0-9]+(?:-[a-z0-9]+)+$/i.test(searchQuery);
  const shouldFetchBlogs = searchQuery.trim() !== "";

  const { data: blogsListing, isLoading } = useBlogsListing({
    ...(isSlugLike && { slug: searchQuery }),
    ...(!isSlugLike && searchQuery.trim() && { search: searchQuery }),
    enabled: shouldFetchBlogs,
  });

  const { blogsWishlist } = useWishlistSelector();
  const { toggleBlogWishlist: toggleWishlistInStore } = useWishlistHandler();
  const { mutate: toggleBlogWishlist, isPending: wishlistLoading } =
    useBlogWishlistToggle();

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

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getImageUrlFromMedia = (media: TBlogsListing["media"]): string => {
    if (!media || !media.images || typeof media.images !== "object") {
      return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop";
    }
    const imageKeys = Object.keys(media.images);
    if (imageKeys.length === 0) {
      return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop";
    }
    const firstKey = imageKeys[0];
    return (
      media.images[firstKey] ||
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop"
    );
  };

  const transformedBlogs = useMemo(() => {
    if (!blogsListing || !Array.isArray(blogsListing)) return [];
    return blogsListing.map((b: TBlogsListing) => {
      const description = b.excerpt ? b.excerpt : stripHtml(b.content || "");
      const preview =
        description.length > 120
          ? `${description.slice(0, 120).trim()}...`
          : description;
      return {
        id: b.id,
        title: b.title,
        description: preview,
        date: formatDate(b.publishedAt),
        image: { uri: getImageUrlFromMedia(b.media) },
        categories: b.categories || [],
        slug: b.slug,
      };
    });
  }, [blogsListing]);

  const handleBlogPress = useCallback(
    (item: any) => {
      const blogId = item?.id;
      const slug = item?.slug;
      if (!blogId || !slug) return;

      const categoryId =
        Array.isArray(item?.categories) && item.categories.length > 0
          ? item.categories[0]
          : undefined;
      if (!categoryId) return;

      router.push(buildRoute.blogDetail(blogId, categoryId, slug) as any);
    },
    [router],
  );

  const handleToggleWishlist = useCallback(
    (blogId: number) => {
      if (!isAuthenticated) {
        router.replace(AppRoutes.AUTH_SIGN_IN);
        return;
      }

      const isCurrentlyInWishlist = blogsWishlist.includes(blogId);
      toggleWishlistInStore(blogId);

      toggleBlogWishlist(
        { id: blogId },
        {
          onSuccess: () => {
            if (isCurrentlyInWishlist) {
              toast.success("Removed from saved articles", "Removed");
            } else {
              toast.success("Added to saved articles", "Saved");
            }
          },
          onError: (error: any) => {
            toggleWishlistInStore(blogId);
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
      isAuthenticated,
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
              color={blogsWishlist.includes(item.id) ? "#1A8917" : "#666"}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
      </Pressable>
    ),
    [handleBlogPress, handleToggleWishlist, blogsWishlist, wishlistLoading],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
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
              resizeMode="contain"
              accessibilityLabel="Energy Healing logo"
            />
          </View>
        </View>

        <View style={styles.searchBar}>
          <View style={styles.searchIconButton}>
            <Ionicons name="search" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.searchInputArea}>
            <TextInput
              placeholder="Search Your Food"
              placeholderTextColor="#333333"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.inputExpanded}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              accessibilityLabel="Search your food"
            />
          </View>
        </View>
      </View>

      {searchQuery.trim() === "" ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require("@/src/assets/images/partial-react-logo.jpg")}
            style={styles.emptyImage}
            resizeMode="contain"
          />
        </View>
      ) : isLoading && shouldFetchBlogs ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Loading blogs...</Text>
        </View>
      ) : (
        <FlatList
          data={transformedBlogs}
          keyExtractor={(item: any) => String(item.id ?? item.name)}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            shouldFetchBlogs ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No blogs found</Text>
              </View>
            ) : null
          }
          renderItem={renderBlogItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
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
    width: 52,
    height: 52,
    marginTop: -6,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "stretch",
    height: 48,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
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
  inputExpanded: {
    ...TypographyStyles.bodySans,
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
    fontSize: 16,
    fontWeight: "500",
    color: "#1F1F1F",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: { ...TypographyStyles.h4, color: "#111", marginBottom: 20 },
  emptyImage: { width: 220, height: 180, opacity: 0.95 },
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 0,
  },
  blogCard: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "#fff",
  },
  blogCardPressed: {
    backgroundColor: "#fafafa",
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
  saveButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginTop: 4,
  },
});
