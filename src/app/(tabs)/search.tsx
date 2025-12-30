import { TypographyStyles } from '@/src/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { blogs, categories } from '../../utils/data';

export default function SearchTab() {
  const [q, setQ] = useState('');
  const router = useRouter();
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return blogs.filter(
      (b) => b.title.toLowerCase().includes(term) || b.description.toLowerCase().includes(term) || b.author.toLowerCase().includes(term)
    );
  }, [q]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/(tabs)/(home)/${item.id}`)}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
          <Text numberOfLines={2} style={styles.cardDesc}>{item.description}</Text>
        </View>
        <Image source={item.image} style={styles.thumb} />
      </View>
    </TouchableOpacity>
  );

  const [selectedTab, setSelectedTab] = useState<'Latest' | 'Tags' | 'Blogs'>('Latest');

  const tags = useMemo(() => {
    return categories;
  }, []);

  const latestResults = useMemo(() => {
    return [...results].sort((a, b) => b.id - a.id);
  }, [results]);

  const tagResults = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return tags;
    return tags.filter((t: any) => t.name.toLowerCase().includes(term));
  }, [q, tags]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={styles.searchBar}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={18} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder="Search nutrition articles, recipes"
            placeholderTextColor="#666"
            value={q}
            onChangeText={setQ}
            style={styles.inputExpanded}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      </View>
      <View style={styles.tabsContainer}>
        {['Latest', 'Tags', 'Blogs'].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setSelectedTab(t as any)}
            style={styles.tabButton}
            activeOpacity={0.8}
          >
            <View style={styles.tabInner}>
              <Text style={[styles.tabText, selectedTab === t && styles.tabTextActive]}>{t}</Text>
              {selectedTab === t && <View style={styles.tabIndicator} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {q.trim() === '' ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('@/src/assets/images/partial-react-logo.jpg')}
            style={styles.emptyImage}
            resizeMode="contain"
          />
        </View>
      ) : (

        <FlatList
          data={selectedTab === 'Tags' ? tagResults : selectedTab === 'Latest' ? latestResults : results}
          keyExtractor={(item: any) => String(item.id ?? item.name)}
          contentContainerStyle={{ padding: 16 }}
          numColumns={selectedTab === 'Tags' ? 3 : 1}
          columnWrapperStyle={selectedTab === 'Tags' ? { justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 16 } : undefined}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => {
            if (selectedTab === 'Tags') {
              return (
                <TouchableOpacity style={styles.tagCardGrid} onPress={() => router.push(`/blogs?tag=${encodeURIComponent(item.name)}`)}>
                  <Text style={styles.tagTextGrid}>{item.name}</Text>
                </TouchableOpacity>
              );
            }
            return renderItem({ item });
          }}
        />
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
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 12 },
  cardTitle: {
    ...TypographyStyles.h2,
    fontSize: 22,
    color: '#000',
    lineHeight: 24,
    marginBottom: 8,
    letterSpacing: -0,
  },
  cardDesc: { ...TypographyStyles.body, color: '#666' },
  thumb: { width: 80, height: 80, borderRadius: 10 },

  tabsContainer: { flexDirection: 'row', paddingHorizontal: 0, paddingTop: 8, paddingBottom: 8 },
  tabButton: { flex: 1, alignItems: 'center' },
  tabInner: { alignItems: 'center', paddingBottom: 8 },
  tabText: { ...TypographyStyles.bodySmallSans, color: '#666' },
  tabTextActive: { color: '#111', fontWeight: '600' },
  tabIndicator: { marginTop: 8, height: 2, width: 36, backgroundColor: '#111', borderRadius: 2, alignSelf: 'center' },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { ...TypographyStyles.h4, color: '#111', marginBottom: 20 },
  emptyImage: { width: 220, height: 180, opacity: 0.95 },

  tagCardGrid: { flex: 1, marginHorizontal: 6, paddingVertical: 16, paddingHorizontal: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0f0f0', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tagTextGrid: { ...TypographyStyles.bodySmallSans, color: '#111', textAlign: 'center' },
});


