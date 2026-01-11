import HtmlContentRenderer from '@/src/components/blog/HtmlContentRenderer';
import RecommendedRow from '@/src/components/blog/RecommendedRow';
import { SkeletonBlogDetail } from '@/src/components/ui/SkeletonLoader';
import { useBlogsListing } from '@/src/services/blogApi';
import { TypographyStyles } from '@/src/theme/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// note: no local dummy blogs used; fetching from API
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_PADDING = 16;
const CARD_GAP = 12;
const AVAILABLE_WIDTH = SCREEN_WIDTH - (CONTAINER_PADDING * 2);
const CARD_WIDTH = Math.floor((AVAILABLE_WIDTH - CARD_GAP) / 2);

export default function BlogDetailScreen() {
  const router = useRouter();
  // Extract params from route: /blogs/[blogId]/[categoryId]/[slug]
  const { blogId, categoryId, slug } = useLocalSearchParams<{
    blogId: string;
    categoryId: string;
    slug: string;
  }>();

  const [recosState, setRecosState] = useState<any[]>([]);

  const categoryIdNum = categoryId ? Number(categoryId) : undefined;
  const blogIdNum = blogId ? Number(blogId) : undefined;

  // Fetch specific blog by id (preferred) or slug (fallback)
  const { data: specificBlogData, isLoading: blogLoading } = useBlogsListing({
    ...(blogIdNum ? { id: String(blogIdNum) } : slug ? { slug } : {}),
  });

  // Fetch recommended blogs by categoryId
  const { data: recommendedBlogsData, isLoading } = useBlogsListing({
    ...(categoryIdNum && { categoryIds: [categoryIdNum] }),
  });

  // Extract the blog from the array (useBlogsListing returns an array)
  const blog = useMemo(() => {
    if (!specificBlogData || !Array.isArray(specificBlogData) || specificBlogData.length === 0) {
      return null;
    }
    return specificBlogData[0];
  }, [specificBlogData]);

  // Update recommended blogs when recommendedBlogsData or blog changes
  useEffect(() => {
    if (recommendedBlogsData && Array.isArray(recommendedBlogsData) && blog) {
      try {
        // Exclude the current blog id
        const currentBlogId = typeof blog?.id === 'number' ? blog.id : Number(blog?.id);
        const filtered = recommendedBlogsData.filter((b: any) => {
          const bId = typeof b?.id === 'number' ? b.id : Number(b?.id);
          return bId !== currentBlogId;
        });

        // Map to compact display shape (title, description, image)
        // Include blogId, categoryId, and slug so we can pass it when navigating
        const mapped = filtered.map((b: any) => {
          const plain = (b.content || '').replace(/<[^>]*>/g, '');
          const preview = plain.length > 120 ? `${plain.slice(0, 120).trim()}...` : plain;
          const imageUrl = (b.media && b.media.images && typeof b.media.images === 'object')
            ? b.media.images[Object.keys(b.media.images)[0]]
            : 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop';

          // Get first categoryId from blog's categories array
          const blogCategoryId = Array.isArray(b?.categories) && b.categories.length > 0
            ? b.categories[0]
            : undefined;

          return {
            id: b.id,
            title: b.title,
            description: preview,
            image: { uri: imageUrl },
            categoryId: blogCategoryId,
            slug: b.slug,
          };
        });

        setRecosState(mapped);
      } catch (err) {
        console.error('[BlogDetail] Failed to process recommended blogs:', err);
        setRecosState([]);
      }
    } else {
      setRecosState([]);
    }
  }, [recommendedBlogsData, blog]);

  // Conditional returns AFTER all hooks
  if (blogLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SkeletonBlogDetail />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!blog) {
    return (
      <View style={styles.center}>
        <Text>Blog not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{blog.title}</Text>

        <HtmlContentRenderer html={blog.content || ''} media={blog.media} />

        {blog.tags && blog.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <View style={styles.tagsList}>
              {blog.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {recosState.length > 0 && (
          <>
            <RecommendedRow
              items={recosState}
              onPress={(it: any) => {
                // Navigate to blog detail with new URL format: /blogs/{blogId}/{categoryId}/{slug}
                if (it.id && it.categoryId && it.slug) {
                  router.push(`/blogs/${it.id}/${it.categoryId}/${it.slug}`);
                }
              }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: CONTAINER_PADDING,
    paddingBottom: 0, // Minimal padding for bottom tabs
  },
  title: {
    ...TypographyStyles.h1,
    fontSize: Math.max(22, Math.min(28, SCREEN_WIDTH * 0.07)),
    marginBottom: 8,
    lineHeight: Math.max(30, Math.min(36, SCREEN_WIDTH * 0.09)),
    color: '#000',
  },
  meta: {
    ...TypographyStyles.bodySmall,
    color: '#666',
    marginBottom: 16,
    fontSize: Math.max(13, Math.min(15, SCREEN_WIDTH * 0.037)),
  },
  headerImage: {
    width: '100%',
    height: Math.max(200, Math.min(250, SCREEN_WIDTH * 0.6)),
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
  },
  paragraph: {
    ...TypographyStyles.body,
    color: '#333',
    marginBottom: 16,
    fontSize: Math.max(15, Math.min(17, SCREEN_WIDTH * 0.042)),
    lineHeight: Math.max(22, Math.min(26, SCREEN_WIDTH * 0.065)),
  },
  contentHeading: {
    ...TypographyStyles.h1,
    fontSize: Math.max(20, Math.min(24, SCREEN_WIDTH * 0.055)),
    color: '#000',
    marginTop: 12,
    marginBottom: 6,
    lineHeight: Math.max(28, Math.min(32, SCREEN_WIDTH * 0.07)),
  },
  contentHeadingFirst: {
    marginTop: 0,
  },
  contentParagraph: {
    ...TypographyStyles.body,
    color: '#333',
    marginBottom: 6,
    fontSize: Math.max(15, Math.min(17, SCREEN_WIDTH * 0.042)),
    lineHeight: Math.max(22, Math.min(26, SCREEN_WIDTH * 0.065)),
  },
  recommendedSection: {
    marginTop: 32,
    marginBottom: 0,
  },
  sectionTitle: {
    ...TypographyStyles.h2,
    fontSize: Math.max(20, Math.min(24, SCREEN_WIDTH * 0.06)),
    marginBottom: 16,
    color: '#000',
  },
  recommendedScrollView: {
    marginLeft: -CONTAINER_PADDING,
    marginRight: -CONTAINER_PADDING,
  },
  recommendedContainer: {
    paddingLeft: CONTAINER_PADDING,
    paddingRight: CONTAINER_PADDING,
    paddingBottom: 0,
  },
  hCard: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hCardContent: {
    width: '100%',
  },
  hImage: {
    width: '100%',
    height: Math.max(130, Math.min(170, CARD_WIDTH * 0.8)),
    backgroundColor: '#f0f0f0',
  },
  hCardTextContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: 10,
    paddingBottom: 12,
    justifyContent: 'flex-start',
  },
  hTitle: {
    ...TypographyStyles.h2,
    fontSize: Math.max(14, Math.min(16, Math.floor(CARD_WIDTH * 0.085))),
    lineHeight: Math.max(20, Math.min(22, Math.floor(CARD_WIDTH * 0.12))),
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  hDescription: {
    ...TypographyStyles.bodySmall,
    fontSize: Math.max(12, Math.min(13, Math.floor(CARD_WIDTH * 0.075))),
    lineHeight: Math.max(16, Math.min(18, Math.floor(CARD_WIDTH * 0.10))),
    color: '#666',
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsLabel: {
    ...TypographyStyles.bodySmall,
    fontSize: Math.max(13, Math.min(15, SCREEN_WIDTH * 0.037)),
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    ...TypographyStyles.bodySmall,
    fontSize: Math.max(12, Math.min(13, SCREEN_WIDTH * 0.035)),
    color: '#333',
    textTransform: 'uppercase',
  },
  linksContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  linksLabel: {
    ...TypographyStyles.bodySmall,
    fontSize: Math.max(13, Math.min(15, SCREEN_WIDTH * 0.037)),
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  linkItem: {
    marginBottom: 6,
  },
  linkText: {
    ...TypographyStyles.bodySmall,
    fontSize: Math.max(13, Math.min(14, SCREEN_WIDTH * 0.037)),
    color: '#0066cc',
    textDecorationLine: 'underline',
  },
  moreLinksText: {
    ...TypographyStyles.bodySmall,
    fontSize: Math.max(12, Math.min(13, SCREEN_WIDTH * 0.035)),
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

