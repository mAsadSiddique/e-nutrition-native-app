import { TypographyStyles } from '@/src/constants/theme';
import { useSavedBlogs } from '@/src/contexts/SavedBlogsContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { blogs as allBlogs } from '../../../utils/data';
export default function BlogListScreen() {
  const params = useLocalSearchParams();
  const selected = params.selected ? JSON.parse(String(params.selected)) : [];
  const router = useRouter();

  // Tab state management
  const [activeTab, setActiveTab] = useState<'for-you' | 'featured'>('for-you');
  const [loading, setLoading] = useState(true);
  const { savedBlogs, toggleSaveBlog } = useSavedBlogs();

  // Apply filtering as specified
  const filteredBlogs = allBlogs.filter(blog =>
    selected.some((cat: string) => blog.category.includes(cat))
  );

  // Memoized data based on active tab
  const displayData = useMemo(() => {
    if (activeTab === 'featured') {
      return [];
      // Show featured blogs (sorted by views for example)
      // return [...allBlogs].sort((a, b) => b.views - a.views);
    }
    // Default "For You" tab - render filteredBlogs
    return filteredBlogs;
  }, [filteredBlogs, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 150);
    return () => clearTimeout(timer);
  }, []);

  // Optimized render functions with useCallback
  const handleTabPress = useCallback((tab: 'for-you' | 'featured') => {
    setActiveTab(tab);
  }, []);

  const handleBlogPress = useCallback((blogId: number) => {
    router.push(`/(tabs)/(home)/${blogId}`);
  }, [router]);

  const handleAuthorPress = useCallback((author: string) => {
    router.push(`/(tabs)/(home)/author/${encodeURIComponent(author)}`);
  }, [router]);

  const renderBlogItem = useCallback(({ item }: { item: any }) => (
    <Pressable
      style={({ pressed }) => [
        styles.blogCard,
        pressed && styles.blogCardPressed
      ]}
      onPress={() => handleBlogPress(item.id)}
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
                In {activeTab === 'featured' ? 'Featured' : 'For you'} by
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
            name={savedBlogs.includes(item.id) ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={savedBlogs.includes(item.id) ? '#1A8917' : '#666'}
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
        <Pressable onPress={() => handleBlogPress(item.id)}>
          <Image source={item.image} style={styles.blogImage} />
        </Pressable>
      </View>
      <View style={styles.divider} />
    </Pressable>
  ), [activeTab, handleBlogPress, handleAuthorPress, savedBlogs, toggleSaveBlog]);

  const renderHeader = useCallback(() => (
    <View style={styles.headerContainer}>
      {/* 

       Title */}
      <Text style={styles.mediumTitle}>NutriLife</Text>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <Pressable
          style={styles.tabButton}
          onPress={() => handleTabPress('for-you')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'for-you' && styles.tabTextActive
          ]}>
            For you
          </Text>
          {activeTab === 'for-you' && <View style={styles.tabUnderline} />}
        </Pressable>

        <Pressable
          style={styles.tabButton}
          onPress={() => handleTabPress('featured')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'featured' && styles.tabTextActive
          ]}>
            Featured
          </Text>
          {activeTab === 'featured' && <View style={styles.tabUnderline} />}
        </Pressable>
      </View>
    </View>
  ), [activeTab, handleTabPress]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={displayData}
        keyExtractor={(item) => `${activeTab}-${item.id}`}
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
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
    backgroundColor: '#fff',
  },
  mediumTitle: {
    ...TypographyStyles.h2,
    fontSize: 28,
    // marginBottom: screenHeight * 0.08,
    color: '#000',
    letterSpacing: -0.5,
    marginBottom: 20,
  },

  // Tab styles
  tabContainer: {
    ...TypographyStyles.body,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginRight: 32,
    position: 'relative',
  },
  tabText: {
    ...TypographyStyles.body,
    fontSize: 16,
    fontWeight: '400',
    color: '#8e8e8e',
    lineHeight: 20,
  },
  tabTextActive: {
    color: '#000',
    fontWeight: '500',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#000',
  },

  // Blog card styles
  blogCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  blogCardPressed: {
    backgroundColor: '#fafafa',
  },
  blogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButton: {
    padding: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#6b6b6b',
    fontWeight: '400',
    lineHeight: 16,
  },
  grayText: {
    color: '#6b6b6b',
  },
  blackText: {
    color: '#000',
    fontWeight: '500',
  },
  blogContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 10,
  },
  blogTextContent: {
    flex: 1,
    paddingRight: 16,
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
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginTop: 16,
  },
});