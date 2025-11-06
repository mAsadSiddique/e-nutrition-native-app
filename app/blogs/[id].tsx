import { TypographyStyles } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { blogs } from '../../utils/data';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
    <ScrollView style={{ backgroundColor: '#fff' }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{blog.title}</Text>
      <Text
        style={styles.meta}
        onPress={() => router.push(`/(tabs)/(home)/author/${encodeURIComponent(blog.author)}`)}
      >
        {blog.author} • {blog.date}
      </Text>
      <Image source={blog.image} style={styles.headerImage} />
      {blog.content.map((p, idx) => (
        <Text key={idx} style={styles.paragraph}>{p}</Text>
      ))}

      <Text style={[styles.title, { fontSize: 20, marginTop: 12 }]}>Recommended Blogs</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
        {recos.map((it) => (
          <TouchableOpacity key={it.id} style={styles.hCard} onPress={() => router.push(`/blogs/${it.id}`)}>
            <Image source={it.image} style={styles.hImage} />
            <Text style={styles.hTitle} numberOfLines={2}>{it.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { ...TypographyStyles.h1, fontSize: 26, marginBottom: 6 },
  meta: { ...TypographyStyles.bodySmall, color: '#666', marginBottom: 12 },
  headerImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 12 },
  paragraph: { ...TypographyStyles.body, color: '#333', marginBottom: 12 },
  hCard: { width: 220, marginRight: 12 },
  hImage: { width: '100%', height: 120, borderRadius: 10, marginBottom: 6 },
  hTitle: { ...TypographyStyles.h4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});


