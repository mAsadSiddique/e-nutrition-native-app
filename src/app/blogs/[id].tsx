import HtmlContentRenderer from '@/src/components/blog/HtmlContentRenderer';
import RecommendedRow from '@/src/components/blog/RecommendedRow';
import { SkeletonBlogDetail } from '@/src/components/ui/SkeletonLoader';
import { useGetBlog, useGetForYouBlogs } from '@/src/services/blogApi';
import { TypographyStyles } from '@/src/theme/theme';
import { extractLinks, extractTags } from '@/src/utils/htmlParser';
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { mutate: fetchBlog, isPending: blogLoading } = useGetBlog();
  const [blog, setBlog] = useState<any | null>(null);
  const [recosState, setRecosState] = useState<any[]>([]);

  // For fetching recommended blogs by category
  const { mutate: fetchRecommendedBlogs, isPending: recosLoading } = useGetForYouBlogs();
  
  // Extract tags and links from blog content - MUST be called before any conditional returns
  const tags = useMemo(() => {
    if (!blog?.content) return [];
    return extractTags(blog.content);
  }, [blog?.content]);

  const links = useMemo(() => {
    if (!blog?.content) return [];
    return extractLinks(blog.content);
  }, [blog?.content]);

  // Get header image from media
  const headerImageUrl = useMemo(() => {
    if (!blog?.media?.images || typeof blog.media.images !== 'object') {
      return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop';
    }
    const imageKeys = Object.keys(blog.media.images);
    if (imageKeys.length === 0) {
      return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop';
    }
    const firstKey = imageKeys[0];
    return blog.media.images[firstKey] || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop';
  }, [blog?.media?.images]);
  
  useEffect(() => {
    if (!id) return;
    setBlog(null);
    setRecosState([]);
    const isNumeric = /^[0-9]+$/.test(String(id));

    fetchBlog(
      isNumeric ? { id } : { slug: String(id) },
      {
        onSuccess: (res: any) => {
          setBlog(res);

          // Fetch recommended blogs of the same category (if category is present)
          try {
            const catId = Array.isArray(res?.categories) && res.categories.length
              ? res.categories[0]?.id
              : res?.categoryId ?? undefined;
            if (catId !== undefined && catId !== null) {
              fetchRecommendedBlogs(
                { categoryIds: [catId] },
                {
                  onSuccess: (recRes: any) => {
                    const received = recRes?.data?.blogs ?? recRes?.blogs ?? recRes ?? [];
                    // Exclude the current blog id
                    const filtered = Array.isArray(received)
                      ? received.filter((b: any) => b?.id !== res?.id)
                      : [];

                    // Map to compact display shape (title, description, image)
                    const mapped = filtered.map((b: any) => {
                      const plain = (b.content || '').replace(/<[^>]*>/g, '');
                      const preview = plain.length > 120 ? `${plain.slice(0, 120).trim()}...` : plain;
                      const imageUrl = (b.media && b.media.images && typeof b.media.images === 'object')
                        ? b.media.images[Object.keys(b.media.images)[0]]
                        : 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop';

                      return {
                        id: b.id,
                        title: b.title,
                        description: preview,
                        image: { uri: imageUrl },
                      };
                    });

                    setRecosState(mapped);
                  },
                  onError: () => {
                    setRecosState([]);
                  },
                }
              );
            }
          } catch (err) {
            console.error('[BlogDetail] Failed to fetch recommendations:', err);
          }
        },
        onError: () => {
          setBlog(null);
        },
      }
    );
  }, [id, fetchBlog, fetchRecommendedBlogs]);

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
  
  const recos: any[] = []; // kept for backwards compatibility (derived data is in recosState)

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{blog.title}</Text>
        {/* <Text
          style={styles.meta}
          onPress={() => router.push(`/(tabs)/(home)/author/${encodeURIComponent(blog.author)}`)}
        >
          {blog.author} • {blog.date}
        </Text> */}
        {/* <Image source={{ uri: headerImageUrl }} style={styles.headerImage} /> */}

        {/* Render HTML content with all features */}
        <HtmlContentRenderer html={blog.content || ''} media={blog.media} />

        {/* Recommended row: uses a reusable component for horizontal scrolling */}
        {recosState.length > 0 && (
          <>
            <RecommendedRow
              items={recosState}
              onPress={(it) => router.push(`/(tabs)/(home)/${it.id}`)}
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
    // ...TypographyStyles.h3,
    fontSize: Math.max(20, Math.min(24, SCREEN_WIDTH * 0.055)),
    // fontWeight: '700',
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
    marginBottom: 0, // No bottom margin
  },
  sectionTitle: {
    ...TypographyStyles.h2,
    // ...TypographyStyles.h2,
    fontSize: Math.max(20, Math.min(24, SCREEN_WIDTH * 0.06)),
    marginBottom: 16,
    // fontWeight: '700',
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
    // marginVertical: 12,
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
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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


