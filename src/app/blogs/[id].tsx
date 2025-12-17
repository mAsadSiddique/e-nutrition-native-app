import { useGetBlog } from '@/src/services/blogApi';
import { TypographyStyles } from '@/src/theme/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkeletonBlogDetail } from '@/src/components/ui/SkeletonLoader';
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

  useEffect(() => {
    if (!id) return;
    // determine whether id param is numeric id or slug
    const isNumeric = /^[0-9]+$/.test(String(id));
    if (isNumeric) {
      fetchBlog({ id }, {
        onSuccess: (res: any) => setBlog(res),
        onError: () => setBlog(null),
      });
    } else {
      fetchBlog({ slug: String(id) }, {
        onSuccess: (res: any) => setBlog(res),
        onError: () => setBlog(null),
      });
    }
  }, [id, fetchBlog]);

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
  const recos: any[] = [];

  type InlinePart = { text: string; bold?: boolean };
  type Node = { type: 'heading' | 'paragraph'; parts: InlinePart[] };
  /**
   * Convert HTML string to plain text while preserving newlines and decoding entities.
   * - replaces <br> and <br/> with newlines
   * - replaces block tags (p, div, h1..h6, li) with newlines
   * - strips remaining tags
   * - decodes common HTML entities and numeric entities
   */
  const htmlToPlainText = (html: string) => {
    if (!html) return '';
    let s = String(html);

    // Normalize line breaks for <br> and closing block tags
    s = s.replace(/<br\s*\/?>/gi, '\n');
    s = s.replace(/<\/(p|div|h[1-6]|li)>/gi, '\n');
    s = s.replace(/<(p|div|h[1-6]|li)[^>]*>/gi, '\n');

    // Remove all remaining tags
    s = s.replace(/<[^>]+>/g, '');

    // Decode common HTML entities
    const entities: Record<string, string> = {
      '&nbsp;': ' ',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&ndash;': '–',
      '&mdash;': '—',
    };
    s = s.replace(/&[a-zA-Z0-9#]+;?/g, (entity) => {
      if (entities[entity]) return entities[entity];
      // numeric decimal
      const mDec = entity.match(/&#(\d+);?/);
      if (mDec) return String.fromCharCode(parseInt(mDec[1], 10));
      // numeric hex
      const mHex = entity.match(/&#x([0-9a-fA-F]+);?/);
      if (mHex) return String.fromCharCode(parseInt(mHex[1], 16));
      return entity;
    });

    // Collapse multiple newlines into max two and trim
    s = s.replace(/\r\n|\r/g, '\n');
    s = s.replace(/\n{3,}/g, '\n\n');
    // Trim spaces on each line
    s = s.split('\n').map(line => line.replace(/[ \t]+$/g, '') ).join('\n');
    return s.trim();
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{blog.title}</Text>
        <Text
          style={styles.meta}
          onPress={() => router.push(`/(tabs)/(home)/author/${encodeURIComponent(blog.author)}`)}
        >
          {blog.author} • {blog.date}
        </Text>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop' }} style={styles.headerImage} />
        {/** Render content as plain text (HTML stripped and entities decoded) */}
        <Text style={styles.contentParagraph}>{htmlToPlainText(blog.content || '')}</Text>

        <View style={styles.recommendedSection}>
          <Text style={styles.sectionTitle}>Recommended Blogs</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendedContainer}
            style={styles.recommendedScrollView}
            snapToInterval={CARD_WIDTH + CARD_GAP}
            snapToAlignment="start"
            decelerationRate="fast"
            bounces={true}
            alwaysBounceHorizontal={true}
          >
            {recos.map((it, index) => (
              <TouchableOpacity
                key={it.id}
                style={styles.hCard}
                activeOpacity={0.7}
                onPress={() => router.push(`/(tabs)/(home)/${it.id}`)}
              >
                <View style={styles.hCardContent}>
                  <Image source={it.image} style={styles.hImage} resizeMode="cover" />
                  <View style={styles.hCardTextContainer}>
                    <Text
                      style={styles.hTitle}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {it.title}
                    </Text>
                    <Text
                      style={styles.hDescription}
                      numberOfLines={3}
                      ellipsizeMode="tail"
                    >
                      {it.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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
});


