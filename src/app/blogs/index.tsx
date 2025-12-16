import { useSavedBlogs } from "@/src/contexts/SavedBlogsContext";
import { useGetBlogs } from "@/src/services/blogApi";
import { useGetCategories } from "@/src/services/categoryApi";
import { TypographyStyles } from "@/src/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// We use real blogs from API; remove dummy import
export default function BlogListScreen() {
  const router = useRouter();

  // Tab state management
  const [activeTab, setActiveTab] = useState<"for-you" | "featured">("for-you");
  const [loading, setLoading] = useState(true);
  const {
    mutate: fetchBlogs,
    isPending: blogsLoading,
    error: blogsError,
  } = useGetBlogs();
  const {
    refetch: fetchCategories,
    data: categoriesApiData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useGetCategories();
  const { savedBlogs, toggleSaveBlog } = useSavedBlogs();
  const isFocused = useIsFocused();

  // State to hold raw API blogs
  const [blogs, setBlogs] = useState<any[]>([]);
  const didFetchRef = useRef(false);
  useEffect(() => {
    // Ensure we fetch categories and blogs only once on mount
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    // If categories are already available (e.g., fetched on Category Selection), skip refetch
    if (!Array.isArray(categoriesApiData) || categoriesApiData.length === 0) {
      fetchCategories().catch((err: any) =>
        console.error("Categories fetch error:", err?.response || err)
      );
    }

    fetchBlogs(undefined, {
      onSuccess: (res: any) => {
        const received = res?.data?.blogs ?? res?.blogs ?? res ?? [];
        setBlogs(Array.isArray(received) ? received : []);
        console.debug(
          "[BlogList] fetched blogs count:",
          Array.isArray(received) ? received.length : 0
        );
      },
      onError: (err: any) =>
        console.error("Blogs fetch error:", err?.response || err),
    });

    const timer = setTimeout(() => setLoading(false), 150);
    return () => clearTimeout(timer);
    // empty deps to ensure single fetch on mount only
  }, []);

  const handleTabPress = useCallback((tab: "for-you" | "featured") => {
    setActiveTab(tab);
  }, []);

  const handleBlogPress = useCallback(
    (item: any) => {
      const slugOrId = item?.slug ?? item?.id ?? '';
      if (!slugOrId) return;
      router.push(`/(tabs)/(home)/${slugOrId}`);
    },
    [router]
  );

  const handleAuthorPress = useCallback(
    (author: string) => {
      router.push(`/(tabs)/(home)/author/${encodeURIComponent(author)}`);
    },
    [router]
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
        <View style={styles.blogHeader}>
          <View style={styles.authorRow}>
            <Image
              source={{ uri: `https://i.pravatar.cc/40?img=${item.id}` }}
              style={styles.authorAvatar}
            />
            <Pressable onPress={() => handleAuthorPress(item.author)}>
              <Text style={styles.authorText}>
                <Text style={styles.grayText}>
                  In {activeTab === "featured" ? "Featured" : "For you"} by
                </Text>

                <Text style={styles.blackText}> {item.author}</Text>
              </Text>
            </Pressable>
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => toggleSaveBlog(item.id)}
          >
            <Ionicons
              name={
                savedBlogs.includes(item.id) ? "bookmark" : "bookmark-outline"
              }
              size={20}
              color={savedBlogs.includes(item.id) ? "#1A8917" : "#666"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.blogContent}>
          <View style={styles.blogTextContent}>
            <Text numberOfLines={3} style={styles.blogTitle}>
              {item.title}
            </Text>
            <Text numberOfLines={2} style={styles.blogDescription}>
              {item.description}
            </Text>
            <Text style={styles.blogMeta}>{item.date}</Text>
          </View>
          <Pressable onPress={() => handleBlogPress(item)}>
            <Image source={item.image} style={styles.blogImage} />
          </Pressable>
        </View>
        <View style={styles.divider} />
      </Pressable>
    ),
    [activeTab, handleBlogPress, handleAuthorPress, savedBlogs, toggleSaveBlog]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        {/* 

       Title */}
        <Text style={styles.mediumTitle}>NutriLife</Text>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <Pressable
            style={styles.tabButton}
            onPress={() => handleTabPress("for-you")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "for-you" && styles.tabTextActive,
              ]}
            >
              For you
            </Text>
            {activeTab === "for-you" && <View style={styles.tabUnderline} />}
          </Pressable>

          <Pressable
            style={styles.tabButton}
            onPress={() => handleTabPress("featured")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "featured" && styles.tabTextActive,
              ]}
            >
              Featured
            </Text>
            {activeTab === "featured" && <View style={styles.tabUnderline} />}
          </Pressable>
        </View>
      </View>
    ),
    [activeTab, handleTabPress]
  );

  if (loading || blogsLoading || categoriesLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  if (blogsError || categoriesError) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={styles.errorMessage}>
            Failed to load content. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => {
              fetchCategories();
              fetchBlogs();
            }}
            style={styles.authTestButton}
          >
            <Text style={styles.authTestButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Map raw API blogs to UI shape
  const apiBlogs = (blogs || []).map((b: any) => b as any);

  // Helper: strip HTML tags and decode common entities
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

  const categoryMap = new Map<number, string>();
  // if (Array.isArray(categoriesApiData)) {
  //   categoriesApiData.forEach((c: any) => categoryMap.set(c.id, c.name));
  // }

  const mappedApiBlogs = apiBlogs.map((b: any) => {
    const plain = stripHtml(b.content || "");
    const preview =
      plain.length > 120 ? `${plain.slice(0, 120).trim()}...` : plain;
    const catId =
      Array.isArray(b.categories) && b.categories.length
        ? b.categories[0]
        : undefined;
    const catName = catId ? categoryMap.get(catId) || "General" : "General";
    return {
      id: b.id,
      title: b.title,
      description: preview,
      date: formatDate(b.publishedAt),
      image: {
        uri: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop",
      },
      category: [catName],
      author: "",
    };
  });

  const finalBlogs = mappedApiBlogs;
  const displayData = activeTab === "featured" ? [] : finalBlogs;
  // Debugging hint: log how many items will be rendered
  console.debug("[BlogList] displayData length:", displayData.length);
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

  // Header styles
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  mediumTitle: {
    ...TypographyStyles.h2,
    fontSize: 28,
    // marginBottom: screenHeight * 0.08,
    color: "#000",
    letterSpacing: -0.5,
    marginBottom: 20,
  },

  // Tab styles
  tabContainer: {
    ...TypographyStyles.body,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
    color: "#000",
    fontWeight: "500",
  },
  tabUnderline: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#000",
  },

  // Blog card styles
  blogCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    padding: 4,
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
    paddingTop: 10,
  },
  blogTextContent: {
    flex: 1,
    paddingRight: 16,
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
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginTop: 16,
  },
});
