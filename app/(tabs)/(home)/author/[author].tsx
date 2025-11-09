import { TypographyStyles } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { blogs } from '../../../../utils/data';

export default function AuthorProfileScreen() {
  const { author } = useLocalSearchParams<{ author: string }>();
  const router = useRouter();
  const name = decodeURIComponent(String(author || ''));
  const authored = useMemo(() => blogs.filter((b) => b.author === name), [name]);

  const avatarUri = 'https://i.pravatar.cc/150?u=' + encodeURIComponent(name);
  const [tab, setTab] = useState<'stories' | 'about'>('stories');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.headerRow}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tabBtn, tab === 'stories' && styles.tabActive]} onPress={() => setTab('stories')}>
            <Text style={[styles.tabText, tab === 'stories' && styles.tabTextActive]}>Stories</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'about' && styles.tabActive]} onPress={() => setTab('about')}>
            <Text style={[styles.tabText, tab === 'about' && styles.tabTextActive]}>About</Text>
          </TouchableOpacity>
        </View>

        {tab === 'stories' ? (
          <View>
            {authored.map((post) => (
              <View key={post.id} style={styles.card}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={2} onPress={() => router.push(`/(tabs)/(home)/${post.id}`)}>
                      {post.title}
                    </Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>{post.description}</Text>
                    <View style={styles.tagRow}>
                      <Text style={styles.tag}>{post.category}</Text>
                    </View>
                  </View>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/(tabs)/(home)/${post.id}`)}>
                    <Image source={post.image} style={styles.thumb} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.aboutBox}>
            <Text style={styles.aboutText}>
              {name} writes on topics across technology, culture, and productivity. This profile page is a
              static preview — connect this to your backend later to show real bio, location, and links.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  name: { ...TypographyStyles.h3 },
  sub: { ...TypographyStyles.bodySmall, color: '#666', marginTop: 2 },
  tabs: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: '#f2f2f2' },
  tabActive: { backgroundColor: '#000' },
  tabText: { ...TypographyStyles.body, color: '#555', fontWeight: '600' },
  tabTextActive: { ...TypographyStyles.body, color: '#fff' },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { ...TypographyStyles.h4, marginBottom: 4 },
  cardDesc: { ...TypographyStyles.body, color: '#666' },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  tag: { ...TypographyStyles.bodySmall, backgroundColor: '#f1f5f1', color: '#00994C', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: 'hidden' },
  thumb: { width: 90, height: 90, borderRadius: 10 },
  aboutBox: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee', padding: 12 },
  aboutText: { ...TypographyStyles.body, color: '#444' },
});


