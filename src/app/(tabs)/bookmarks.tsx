import { TypographyStyles } from '@/src/constants/theme';
import { useSavedBlogs } from '@/src/contexts/SavedBlogsContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { blogs as allBlogs } from '../../../utils/data';

export default function BookmarksTab() {
  const { savedBlogs, toggleSaveBlog } = useSavedBlogs();
  const router = useRouter();

  // Filter blogs to show only saved ones
  const savedBlogsList = useMemo(() => {
    return allBlogs.filter(blog => savedBlogs.includes(blog.id));
  }, [savedBlogs]);

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
                Saved by
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
            name="bookmark"
            size={20}
            color="#1A8917"
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
  ), [handleBlogPress, handleAuthorPress, toggleSaveBlog]);

  const renderHeader = useCallback(() => (
    <View style={styles.headerContainer}>
      <Text style={styles.mediumTitle}>Saved Articles</Text>

    </View>
    
  ), []);

  if (savedBlogsList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
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
    <SafeAreaView style={styles.container}>
      <FlatList
        data={savedBlogsList}
        renderItem={renderBlogItem}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 25,
    // paddingBottom: 8,
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
  // Blog card styles (same as home)
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

    // ...TypographyStyles.body,
    fontSize: 22,
    // fontWeight: '700',
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


