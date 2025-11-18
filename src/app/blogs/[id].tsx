import { TypographyStyles } from '@/src/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { blogs } from '../../../utils/data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_PADDING = 16;
const CARD_GAP = 12;
// Calculate card width to show 2 cards side-by-side with proper spacing
// Account for screen padding on both sides and gap between cards
const AVAILABLE_WIDTH = SCREEN_WIDTH - (CONTAINER_PADDING * 2);
const CARD_WIDTH = Math.floor((AVAILABLE_WIDTH - CARD_GAP) / 2);

export default function BlogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const blog = useMemo(() => blogs.find((b) => String(b.id) === String(id)), [id]);

  if (!blog) {
    return (
      <View style={styles.center}> 
        <Text>Blog not found.</Text>
      </View>
    );
  }

  const recos = blogs.filter((b) => blog.recommended.includes(b.id));

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
      <Image source={blog.image} style={styles.headerImage} />
      {blog.content.map((item, idx) => {
        // Support both old format (string) and new format (object with type and text)
        if (typeof item === 'string') {
          return (
            <Text key={idx} style={styles.paragraph}>{item}</Text>
          );
        }
        
        // New format with type and text
        if (item.type === 'heading') {
          // First content item after image shouldn't have top margin
          const isFirstHeading = idx === 0 && item.type === 'heading';
          return (
            <Text 
              key={idx} 
              style={[
                styles.contentHeading,
                isFirstHeading && styles.contentHeadingFirst
              ]}
            >
              {item.text}
            </Text>
          );
        } else if (item.type === 'paragraph') {
          return (
            <Text key={idx} style={styles.contentParagraph}>{item.text}</Text>
          );
        }
        
        return null;
      })}

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
    ...TypographyStyles.h3,
    fontSize: Math.max(20, Math.min(24, SCREEN_WIDTH * 0.055)),
    fontWeight: '700',
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
    fontSize: Math.max(20, Math.min(24, SCREEN_WIDTH * 0.06)),
    marginBottom: 16,
    fontWeight: '700',
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
    ...TypographyStyles.h4,
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


