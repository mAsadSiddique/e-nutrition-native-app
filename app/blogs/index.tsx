import { TypographyStyles } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { blogs as allBlogs } from '../../utils/data';
export default function BlogListScreen() {
  const { selected } = useLocalSearchParams<{ selected?: string }>();
  const router = useRouter();
  const selectedCategories = useMemo(() => {
    try {
      return selected ? JSON.parse(String(selected)) : [];
    } catch {
      return [];
    }
  }, [selected]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState(allBlogs);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const t = setTimeout(() => {
      try {
        const filtered = allBlogs.filter((b) => selectedCategories.includes(b.category));
        setData(filtered.length ? filtered : allBlogs);
        setLoading(false);
      } catch (e) {
        setError('Failed to load blogs.');
        setLoading(false);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [selectedCategories]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/(tabs)/(home)/${item.id}`)}>
      <View style={styles.rowBetween}>
        <View style={styles.rowCenter}>
          <Image source={{ uri: 'https://i.pravatar.cc/80?img=' + item.id }} style={styles.avatar} />
          <Text
            style={styles.authorText}
            onPress={() => router.push(`/(tabs)/(home)/author/${encodeURIComponent(item.author)}`)}
          >
            In For you by {item.author}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/(tabs)/(home)/${item.id}`)}>
            <Text numberOfLines={3} style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
          <Text numberOfLines={2} style={styles.cardDesc}>{item.description}</Text>
          <Text style={[styles.meta, { marginTop: 8 }]}>{item.date}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/(tabs)/(home)/${item.id}`)}>
          <Image source={item.image} style={styles.thumb} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );


  if (loading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator size="small" color="#00994C" />
        <Text style={{ marginTop: 8, color: '#666' }}>Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#cc0000' }}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <FlatList
        style={{ backgroundColor: '#fff' }}
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        renderItem={renderItem}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.brand}>Medium</Text>
            <Ionicons name="notifications-outline" size={22} color="#000" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  brand: { ...TypographyStyles.h2, fontWeight: '800' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 20, height: 20, borderRadius: 10, marginRight: 6 },
  authorText: { ...TypographyStyles.bodySmall, color: '#777' },
  thumb: { width: 84, height: 84, borderRadius: 10 },
  cardTitle: { ...TypographyStyles.h4, marginBottom: 4 },
  cardDesc: { ...TypographyStyles.body, color: '#666' },
  meta: { ...TypographyStyles.bodySmall, color: '#666' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});